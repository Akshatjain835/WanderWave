import os
import datetime
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from pydantic import BaseModel, Field
from app.graph.llm import get_llm

class ActivitySlotModel(BaseModel):
    time: str = Field(description="Time slot string e.g. 09:00 AM - 12:30 PM")
    activity: str = Field(description="Specific real activity title and description")
    location: str = Field(description="Real location / spot / street name in destination")
    estimated_cost_inr: float = Field(description="Estimated activity cost per person in INR")
    tips: str = Field(description="Actionable insider tip or advice for travelers")

class DayPlanModel(BaseModel):
    day_number: int = Field(description="Day index starting at 1")
    title: str = Field(description="Theme/Title for the day e.g. Arrival & Heritage Orientation")
    weather_snippet: str = Field(description="Weather snippet e.g. Sunny & Clear | 24°C")
    morning: ActivitySlotModel = Field(description="Morning activity slot")
    afternoon: ActivitySlotModel = Field(description="Afternoon activity slot")
    evening: ActivitySlotModel = Field(description="Evening activity slot")
    estimated_day_cost_inr: float = Field(description="Estimated total cost for all activities on this day in INR")

class FullItineraryModel(BaseModel):
    trip_title: str = Field(description="Catchy full trip title e.g. 5-Day Alpine Adventure in Manali")
    destination: str = Field(description="Destination city")
    starting_city: str = Field(description="Origin city")
    duration_days: int = Field(description="Total days count")
    travelers_count: int = Field(description="Travelers count")
    total_budget_cap_inr: float = Field(description="Total budget cap in INR")
    estimated_total_cost_inr: float = Field(description="Calculated total spend estimate in INR")
    days: List[DayPlanModel] = Field(description="Array of daily itinerary objects for each day")

async def planner_agent_node(state: Dict[str, Any]) -> Dict[str, Any]:
    destination = state.get("destination", "Manali")
    starting_city = state.get("starting_city", "Delhi")
    duration = int(state.get("duration", 5))
    travelers = int(state.get("travelers", 2))
    budget = float(state.get("budget", 30000.0))
    travel_style = state.get("travel_style", "Adventure")
    interests = state.get("interests", ["Sightseeing", "Cafes"])

    places = state.get("places_found", [])
    weather = state.get("weather_forecast", {})
    budget_breakdown = state.get("budget_breakdown", {})

    validation_issues = state.get("validation_issues", [])
    retry_count = state.get("retry_count", 0)

    api_key = os.getenv("GEMINI_API_KEY", "")
    itinerary_output = None

    if api_key:
        try:
            llm = get_llm(temperature=0.3, max_retries=1, request_timeout=20)
            if llm:
                structured_llm = llm.with_structured_output(FullItineraryModel)

            place_names = [p.get('name') for p in places if p.get('name')]
            place_context_str = ", ".join(place_names) if place_names else f"top attractions in {destination}"

            feedback_instruction = ""
            if validation_issues:
                feedback_instruction = f"""
RE-PLANNING FEEDBACK FROM VALIDATOR AGENT (Iter #{retry_count}):
The previous draft contained the following violations that MUST be resolved:
{chr(10).join(f"- {issue}" for issue in validation_issues)}

Adjust your itinerary to strictly fix these issues (e.g. reduce activity costs if over budget, swap outdoor activities to indoor museum/gallery visits if rainy, and ensure no repeated locations).
                """

            prompt = f"""
System Role: You are the Lead Itinerary Planner Agent in WanderWave's Agentic AI Trip Planner.
Your task is to generate a custom, realistic, authentic Day-by-Day JSON itinerary for ANY trip worldwide using LangGraph state context.

State Context:
- Target Destination: {destination}
- Origin City: {starting_city}
- Duration: {duration} Days
- Travelers Count: {travelers} People
- Budget Cap: INR {budget:,.0f}
- Travel Style: {travel_style}
- User Interests: {', '.join(interests)}
- Specific Researched Attractions: {place_context_str}
- Budget Category Caps: Stay: ₹{budget_breakdown.get('accommodation_stay', 0)}, Transit: ₹{budget_breakdown.get('transportation', 0)}, Meals: ₹{budget_breakdown.get('food_and_meals', 0)}, Activities: ₹{budget_breakdown.get('activities_and_sightseeing', 0)}
{feedback_instruction}

CRITICAL INSTRUCTIONS:
1. Every single day (Day 1 to Day {duration}) MUST have distinct, non-repeating attractions and activities specific to {destination}.
2. Use real-world places from {destination} (e.g. for Mysore use Mysore Palace, Chamundi Hill, Brindavan Gardens, Devaraja Market, St. Philomena's, etc.).
3. Provide morning, afternoon, and evening slots for ALL {duration} days with precise locations, realistic costs in INR, and insider tips.
4. Ensure Day 1 starts with arrival/check-in in {destination} and Day {duration} ends with departure from {destination}.
            """
            itinerary_output = await structured_llm.ainvoke(prompt)
        except Exception as e:
            print(f"[PlannerAgent Warning] Gemini LLM dynamic call error: {e}. Utilizing dynamic multi-spot planner.")

    if not itinerary_output:
        days_plan = []
        daily_forecasts = weather.get("forecast_days", [])
        
        if not places:
            from app.graph.tools.places_tool import get_places_and_attractions
            places = get_places_and_attractions(destination, interests, travel_style)

        num_places = len(places)
        outdoor_keywords = ["trek", "waterfall", "beach", "safari", "viewpoint", "outdoor", "boating", "hill", "garden", "park", "sports"]
        rain_keywords = ["rain", "storm", "shower", "thunderstorm", "downpour"]

        for day in range(1, duration + 1):
            day_w = daily_forecasts[day - 1] if day - 1 < len(daily_forecasts) else {"condition": "Sunny & Clear", "temp_max_c": 24}
            condition_str = (day_w.get("condition", "") or "").lower()
            is_rainy_day = any(rk in condition_str for rk in rain_keywords)

            # Unique place slots
            idx_m = (day * 3 - 3) % num_places
            idx_a = (day * 3 - 2) % num_places
            idx_e = (day * 3 - 1) % num_places

            spot_m = places[idx_m]
            spot_a = places[idx_a]
            spot_e = places[idx_e]

            is_first = (day == 1)
            is_last = (day == duration)

            m_cost = spot_m.get("estimated_cost_per_person", round((budget * 0.10) / duration, 2))
            a_cost = spot_a.get("estimated_cost_per_person", round((budget * 0.08) / duration, 2))
            e_cost = spot_e.get("estimated_cost_per_person", round((budget * 0.08) / duration, 2))

            m_act = f"Arrival, Check-in & Visit to {spot_m.get('name')}" if is_first else f"Morning Tour: {spot_m.get('name')} - {spot_m.get('description', 'Historic landmark exploration')}"
            a_act = f"Afternoon Visit: {spot_a.get('name')} - {spot_a.get('description', 'Local cultural walk and food tasting')}"
            e_act = f"Evening Excursion: {spot_e.get('name')} - {spot_e.get('description', 'Sunset view and evening stroll')}"

            # Re-Planner Fix: Swap outdoor activities to indoor museum/cafes on rainy days
            if is_rainy_day:
                if any(ok in m_act.lower() for ok in outdoor_keywords):
                    m_act = f"Indoor Museum & Heritage Gallery Visit (Rainy Day Alternate)"
                    m_cost = 100
                if any(ok in a_act.lower() for ok in outdoor_keywords):
                    a_act = f"Artisan Coffee & Covered Handicraft Market Walk"
                    a_cost = 150
                if any(ok in e_act.lower() for ok in outdoor_keywords):
                    e_act = f"Local Cultural Performance & Indoor Dining"
                    e_cost = 250

            days_plan.append({
                "day_number": day,
                "title": f"Day {day}: Arrival & {spot_m.get('name')} Exploration" if is_first else f"Day {day}: Discover {spot_m.get('name')} & {spot_a.get('name')}" if not is_last else f"Day {day}: Final Sightseeing at {spot_m.get('name')} & Departure",
                "weather_snippet": f"{day_w.get('condition', 'Sunny & Clear')} | Max {day_w.get('temp_max_c', 24)}°C",
                "morning": {
                    "time": "09:00 AM - 12:30 PM",
                    "activity": m_act,
                    "location": f"{spot_m.get('name')}, {destination}",
                    "estimated_cost_inr": m_cost,
                    "tips": "Check in early and start with morning quiet hours." if is_first else f"Recommended for {spot_m.get('category', 'Sightseeing')}."
                },
                "afternoon": {
                    "time": "01:30 PM - 04:30 PM",
                    "activity": a_act,
                    "location": f"{spot_a.get('name')}, {destination}",
                    "estimated_cost_inr": a_cost,
                    "tips": f"Explore regional specialties and local culture at {spot_a.get('name')}."
                },
                "evening": {
                    "time": "06:00 PM - 09:00 PM",
                    "activity": e_act,
                    "location": f"{spot_e.get('name')}, {destination}",
                    "estimated_cost_inr": e_cost,
                    "tips": f"Enjoy evening lighting and street atmosphere at {spot_e.get('name')}."
                },
                "estimated_day_cost_inr": m_cost + a_cost + e_cost
            })

        final_itinerary = {
            "trip_title": f"{duration}-Day {travel_style} Exploration of {destination} from {starting_city}",
            "destination": destination,
            "starting_city": starting_city,
            "duration_days": duration,
            "travelers_count": travelers,
            "total_budget_cap_inr": budget,
            "estimated_total_cost_inr": round(budget * 0.88, 2),
            "days": days_plan
        }
    else:
        final_itinerary = itinerary_output.model_dump()

    log_entry = {
        "agent": "Itinerary Planner Agent (LLM Dynamic Planner)" if not retry_count else f"Itinerary Planner Agent (Re-Planner Iteration #{retry_count})",
        "status": "SUCCESS",
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
        "details": f"Generated Day-by-Day itinerary ({duration} Days for {destination}, total cost estimate INR {final_itinerary.get('estimated_total_cost_inr', budget):,.0f})." if not retry_count else f"Re-planned itinerary to resolve validator issues: {', '.join(validation_issues[:2])}"
    }

    existing_logs = state.get("agent_logs", [])
    return {
        "itinerary": final_itinerary,
        "agent_logs": existing_logs + [log_entry]
    }

async def regenerate_single_day_agent(
    day_number: int,
    feedback: str,
    current_day: Dict[str, Any],
    destination: str = "Goa",
    budget: float = 30000.0
) -> Dict[str, Any]:
    """
    Partial Re-Planner Agent:
    Dynamically re-plans ONLY a single day using LLM structured generation based on specific user feedback.
    """
    api_key = os.getenv("GEMINI_API_KEY", "")
    if api_key:
        try:
            llm = get_llm(temperature=0.4, max_retries=1, request_timeout=15)
            if llm:
                structured_llm = llm.with_structured_output(DayPlanModel)
                prompt = f"""
System Role: You are the Partial Re-Planner Agent in WanderWave's Agentic AI Trip Planner.
Your job is to regenerate ONLY Day {day_number} of a trip to {destination} based on specific traveler feedback.

Target Day to Re-Plan: Day {day_number}
Target Destination: {destination}
User Feedback / Constraint Modification: "{feedback}"

Current Draft for Day {day_number}:
- Morning: {current_day.get('morning', {})}
- Afternoon: {current_day.get('afternoon', {})}
- Evening: {current_day.get('evening', {})}
- Weather: {current_day.get('weather_snippet', 'Sunny')}

Instructions:
1. Modify the morning, afternoon, and evening activity slots for Day {day_number} to directly address the user feedback "{feedback}".
2. Ensure all activity descriptions are realistic, localized to {destination}, and include estimated per-person costs in INR.
3. Keep day_number={day_number}.
                """
                new_day_model = await structured_llm.ainvoke(prompt)
                return new_day_model.model_dump()
        except Exception as e:
            print(f"[Partial Re-Planner Notice] Gemini LLM call error: {e}. Falling back to dynamic rule adjustment.")

    # Rule-based fallback if LLM is unavailable
    m = dict(current_day.get("morning", {}))
    a = dict(current_day.get("afternoon", {}))
    e = dict(current_day.get("evening", {}))

    fb_lower = feedback.lower()
    if "cheaper" in fb_lower or "budget" in fb_lower:
        m["activity"] = f"Scenic Nature Walk & Local Viewpoint in {destination}"
        m["estimated_cost_inr"] = 0
        a["activity"] = f"Street Food Sampling & Traditional Bazaar Exploration"
        a["estimated_cost_inr"] = 150
        e["activity"] = f"Sunset Promenade Stroll"
        e["estimated_cost_inr"] = 50
    elif "adventurous" in fb_lower or "adventure" in fb_lower:
        m["activity"] = f"Outdoor Adventure & Trekking/Water Sports in {destination}"
        m["estimated_cost_inr"] = 1200
        a["activity"] = f"ATV Quad Trail or Local Exploration"
        a["estimated_cost_inr"] = 850
        e["activity"] = f"Evening Outdoor Campfire & Barbecue"
        e["estimated_cost_inr"] = 600
    else:
        m["activity"] = f"Custom Morning Exploration in {destination} ({feedback})"
        a["activity"] = f"Custom Afternoon Cultural Experience ({feedback})"
        e["activity"] = f"Custom Evening Sunset Walk ({feedback})"

    total_c = m.get("estimated_cost_inr", 200) + a.get("estimated_cost_inr", 300) + e.get("estimated_cost_inr", 400)
    return {
        "day_number": day_number,
        "title": f"Day {day_number}: {destination} Custom Re-Planned ({feedback})",
        "weather_snippet": current_day.get("weather_snippet", "Sunny & Pleasant | 24°C"),
        "morning": m,
        "afternoon": a,
        "evening": e,
        "estimated_day_cost_inr": total_c
    }
