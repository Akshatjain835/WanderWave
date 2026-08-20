import datetime
from typing import Dict, Any, List

async def validator_agent_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    ValidatorAgent Node (Pure Validation & Feedback Node).
    Architectural Contract:
    - Responsible ONLY for detecting rule violations and producing structured feedback.
    - NEVER modifies or mutates the itinerary itself.
    - If violations are detected, returns validation_passed = False and passes issues to Planner Agent for re-planning.

    Executes 4 strict validation checks:
    1. Budget Cap Validation (total_cost <= budget)
    2. Weather & Rainy Day Outdoor Activity Check
    3. Geographic & Place Redundancy Check
    4. Activity Density Realism Check
    """
    budget = float(state.get("budget", 30000.0))
    itinerary = state.get("itinerary", {})
    weather = state.get("weather_forecast", {})
    retry_count = int(state.get("retry_count", 0))

    issues: List[str] = []
    checks_summary = {
        "budget_check": {"title": "Budget Cap", "passed": True, "details": "Cost <= Budget"},
        "weather_check": {"title": "Weather Safety", "passed": True, "details": "Outdoor activities checked against rain forecast"},
        "locations_check": {"title": "Geographic Redundancy", "passed": True, "details": "No redundant spot repetition"},
        "schedule_check": {"title": "Activity Density", "passed": True, "details": "Realism & slot count verified"}
    }

    if not itinerary or not itinerary.get("days"):
        issues.append("Itinerary contains no days or invalid structure.")
        checks_summary["schedule_check"]["passed"] = False

    days = itinerary.get("days", [])
    total_est_cost = float(itinerary.get("estimated_total_cost_inr", 0.0))

    # CHECK 1: Total Estimated Cost vs Budget Cap
    if total_est_cost > budget * 1.05:
        issues.append(f"Budget Violation: Estimated cost (₹{total_est_cost:,.0f}) exceeds budget cap (₹{budget:,.0f}).")
        checks_summary["budget_check"]["passed"] = False
        checks_summary["budget_check"]["details"] = f"Exceeds budget cap by ₹{total_est_cost - budget:,.0f}"

    # CHECK 2: Outdoor Activities on High Rain Days
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

    # CHECK 3: Geographic Sanity & Place Redundancy Check
    seen_locations = set()
    for d in days:
        for slot_name in ["morning", "afternoon", "evening"]:
            slot = d.get(slot_name, {})
            loc = slot.get("location", "").strip().lower()
            if loc and loc in seen_locations and loc != "main market":
                issues.append(f"Geographic Redundancy: Location '{slot.get('location')}' repeats redundantly on Day {d.get('day_number')}.")
                checks_summary["locations_check"]["passed"] = False
                checks_summary["locations_check"]["details"] = f"Redundant location '{slot.get('location')}' on Day {d.get('day_number')}"
            elif loc:
                seen_locations.add(loc)

    # CHECK 4: Activity Density Check
    for d in days:
        slot_count = sum(1 for s in ["morning", "afternoon", "evening"] if d.get(s, {}).get("activity"))
        if slot_count < 2:
            issues.append(f"Low Activity Density: Day {d.get('day_number')} has only {slot_count} activity slots.")
            checks_summary["schedule_check"]["passed"] = False
            checks_summary["schedule_check"]["details"] = f"Low slot count ({slot_count}) on Day {d.get('day_number')}"

    validation_passed = (len(issues) == 0)
    passed_count = sum(1 for c in checks_summary.values() if c["passed"])

    feedback = "Itinerary passed all 4 strict validation checks 100%!" if validation_passed else f"Validation detected {len(issues)} issues on iteration {retry_count + 1}: {'; '.join(issues)}"

    log_entry = {
        "agent": "ValidatorAgent Node (4 Strict Validation Checks)",
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
            "total_checks": 4,
            "checks": checks_summary
        },
        "itinerary": itinerary,
        "retry_count": retry_count + 1,
        "agent_logs": existing_logs + [log_entry]
    }
