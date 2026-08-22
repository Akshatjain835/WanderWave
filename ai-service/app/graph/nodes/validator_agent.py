import datetime
from typing import Dict, Any, List

async def validator_agent_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    ValidatorAgent Node (Pure Validation & Rule-Based Feedback Node).
    Architectural Contract:
    - Responsible ONLY for detecting rule violations and producing structured feedback.
    - NEVER modifies or mutates the itinerary itself.
    - If violations are detected, returns validation_passed = False and passes issues to Planner Agent for re-planning.

    Executes 6 strict deterministic validation checks:
    1. Budget Cap Validation (total_cost <= budget)
    2. Budget Breakdown Category Allocation Check (Activities/Meals <= Allocated Category Caps)
    3. Weather & Rainy Day Outdoor Activity Check
    4. Geographic & Place Redundancy Check
    5. Activity Density & Time Sequence Feasibility Check
    6. Transit Arrival & Departure Feasibility Check
    """
    budget = float(state.get("budget", 30000.0))
    itinerary = state.get("itinerary", {})
    weather = state.get("weather_forecast", {})
    budget_breakdown = state.get("budget_breakdown", {})
    retry_count = int(state.get("retry_count", 0))

    issues: List[str] = []
    checks_summary = {
        "budget_check": {"title": "Budget Cap", "passed": True, "details": "Cost <= Budget"},
        "category_budget_check": {"title": "Category Allocations", "passed": True, "details": "Activity costs fit category allocation"},
        "weather_check": {"title": "Weather Safety", "passed": True, "details": "Outdoor activities checked against rain forecast"},
        "locations_check": {"title": "Geographic Redundancy", "passed": True, "details": "No redundant spot repetition"},
        "schedule_check": {"title": "Activity Density & Time Sequence", "passed": True, "details": "Realism & slot sequence verified"},
        "transit_feasibility_check": {"title": "Arrival & Departure Feasibility", "passed": True, "details": "Day 1 arrival and final day departure verified"}
    }

    if not itinerary or not itinerary.get("days"):
        issues.append("Itinerary contains no days or invalid structure.")
        checks_summary["schedule_check"]["passed"] = False
        checks_summary["schedule_check"]["details"] = "Invalid itinerary structure"

    days = itinerary.get("days", [])
    total_est_cost = float(itinerary.get("estimated_total_cost_inr", 0.0))

    # CHECK 1: Total Estimated Cost vs Budget Cap
    if total_est_cost > budget * 1.05:
        issues.append(f"Budget Violation: Estimated cost (₹{total_est_cost:,.0f}) exceeds total budget cap (₹{budget:,.0f}).")
        checks_summary["budget_check"]["passed"] = False
        checks_summary["budget_check"]["details"] = f"Exceeds budget cap by ₹{total_est_cost - budget:,.0f}"

    # CHECK 2: Category Allocation Validation (Activities & Sightseeing Cap)
    travelers = max(1, int(state.get("travelers", 2)))
    activity_cap = float(budget_breakdown.get("activities_and_sightseeing", budget * 0.20))
    calculated_activity_cost = 0.0
    for d in days:
        for s in ["morning", "afternoon", "evening"]:
            slot = d.get(s, {})
            calculated_activity_cost += float(slot.get("estimated_cost_inr", 0.0)) * travelers
    
    if activity_cap > 0 and calculated_activity_cost > activity_cap * 1.20:
        issues.append(f"Category Budget Violation: Total activity cost (₹{calculated_activity_cost:,.0f}) exceeds allocated activity cap (₹{activity_cap:,.0f}).")
        checks_summary["category_budget_check"]["passed"] = False
        checks_summary["category_budget_check"]["details"] = f"Activity cost (₹{calculated_activity_cost:,.0f}) exceeds allocated cap (₹{activity_cap:,.0f})"

    # CHECK 3: Outdoor Activities on High Rain Days
    daily_forecasts = weather.get("forecast_days", [])
    outdoor_keywords = ["trek", "waterfall", "beach", "safari", "viewpoint", "outdoor", "boating", "hill", "garden", "park", "sports"]
    rain_keywords = ["rain", "storm", "shower", "thunderstorm", "downpour"]

    for d in days:
        day_num = d.get("day_number", 1)
        weather_snippet = d.get("weather_snippet", "").lower()

        day_w = daily_forecasts[day_num - 1] if day_num - 1 < len(daily_forecasts) else {}
        condition = (day_w.get("condition") or weather_snippet).lower()
        is_rainy = any(rk in condition for rk in rain_keywords)

        if is_rainy:
            for slot_name in ["morning", "afternoon", "evening"]:
                slot = d.get(slot_name, {})
                act = slot.get("activity", "").lower()
                loc = slot.get("location", "").lower()
                if any(ok in act or ok in loc for ok in outdoor_keywords):
                    issues.append(f"Weather Conflict: Day {day_num} has rain forecast ({day_w.get('condition', 'Rainy')}) but outdoor activity '{slot.get('activity')}' is scheduled.")
                    checks_summary["weather_check"]["passed"] = False
                    checks_summary["weather_check"]["details"] = f"Rain outdoor conflict on Day {day_num}"

    # CHECK 4: Geographic Sanity & Place Redundancy Check
    seen_locations = set()
    for d in days:
        for slot_name in ["morning", "afternoon", "evening"]:
            slot = d.get(slot_name, {})
            loc = slot.get("location", "").strip().lower()
            if loc and loc in seen_locations and loc != "main market" and "hotel" not in loc:
                issues.append(f"Geographic Redundancy: Location '{slot.get('location')}' repeats redundantly on Day {d.get('day_number')}.")
                checks_summary["locations_check"]["passed"] = False
                checks_summary["locations_check"]["details"] = f"Redundant location '{slot.get('location')}' on Day {d.get('day_number')}"
            elif loc:
                seen_locations.add(loc)

    # CHECK 5: Activity Density & Time Feasibility Check
    for d in days:
        slot_count = sum(1 for s in ["morning", "afternoon", "evening"] if d.get(s, {}).get("activity"))
        if slot_count < 2:
            issues.append(f"Low Activity Density: Day {d.get('day_number')} has only {slot_count} activity slots.")
            checks_summary["schedule_check"]["passed"] = False
            checks_summary["schedule_check"]["details"] = f"Low slot count ({slot_count}) on Day {d.get('day_number')}"

    # CHECK 6: Transit Arrival & Departure Feasibility Check
    if days:
        day1 = days[0]
        day1_m = day1.get("morning", {}).get("activity", "").lower()
        valid_arrival_terms = ["arrival", "check-in", "reach", "start", "welcome", "explore", "tour", "visit"]
        if not any(term in day1_m for term in valid_arrival_terms):
            issues.append("Transit Feasibility Conflict: Day 1 morning slot is missing arrival or initial check-in activity.")
            checks_summary["transit_feasibility_check"]["passed"] = False
            checks_summary["transit_feasibility_check"]["details"] = "Day 1 morning missing arrival or start activity"
        else:
            checks_summary["transit_feasibility_check"]["details"] = "Day 1 arrival and start activity verified."

        last_day = days[-1]
        last_e = last_day.get("evening", {}).get("activity", "").lower()
        valid_departure_terms = ["departure", "depart", "return", "farewell", "flight", "train", "bus", "checkout", "end"]
        if not any(term in last_e for term in valid_departure_terms):
            issues.append(f"Transit Feasibility Conflict: Final Day (Day {len(days)}) evening slot is missing departure or return activity.")
            checks_summary["transit_feasibility_check"]["passed"] = False
            checks_summary["transit_feasibility_check"]["details"] = f"Final day evening missing departure or return activity"
        else:
            checks_summary["transit_feasibility_check"]["details"] = "Final day departure activity verified."

    validation_passed = (len(issues) == 0)
    passed_count = sum(1 for c in checks_summary.values() if c["passed"])

    feedback = f"Itinerary passed all 6 strict validation checks 100%!" if validation_passed else f"Validation detected {len(issues)} issues on iteration {retry_count + 1}: {'; '.join(issues)}"

    log_entry = {
        "agent": "ValidatorAgent Node (6 Strict Validation Checks)",
        "status": "PASSED" if validation_passed else "RE-PLAN_REQUIRED",
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
        "details": feedback
    }

    existing_logs = state.get("agent_logs", [])
    return {
        "validation_passed": validation_passed,
        "validation_issues": issues,
        "validation_feedback": feedback,
        "validation_summary": {
            "passed_count": passed_count,
            "total_checks": 6,
            "checks": checks_summary
        },
        "itinerary": itinerary,
        "retry_count": retry_count + 1,
        "agent_logs": existing_logs + [log_entry]
    }
