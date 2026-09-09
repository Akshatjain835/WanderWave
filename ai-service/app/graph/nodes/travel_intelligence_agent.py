import os
import datetime
from typing import Dict, Any
from pydantic import BaseModel, Field
from pydantic import BaseModel, Field
from app.graph.llm import get_llm

class TravelIntelligenceModel(BaseModel):
    overall_score: float = Field(description="Overall destination score from 0.0 to 10.0")
    weather_score: float = Field(description="Weather score from 0.0 to 10.0")
    budget_score: float = Field(description="Budget feasibility score from 0.0 to 10.0")
    activity_score: float = Field(description="Activity variety & density score from 0.0 to 10.0")
    transport_score: float = Field(description="Transit & accessibility score from 0.0 to 10.0")
    crowd_score: float = Field(description="Crowd level comfort score from 0.0 to 10.0")
    best_month_to_visit: str = Field(description="Optimal month or seasonal window to visit e.g. October - March")
    recommendation_rationale: str = Field(description="2-sentence rationale for the scores and timing recommendation")
    feasibility_verdict: str = Field(default="EXCELLENT", description="EXCELLENT, MODERATE_WITH_CAUTION, or NOT_RECOMMENDED")
    weather_risk_level: str = Field(default="Low", description="Low, Moderate, or High weather risk")
    geography_notes: str = Field(default="", description="Key geographical and seasonal insights for this destination during the travel window")
    seasonal_activity_advice: str = Field(default="", description="Specific activity advice regarding weather and geographical conditions")

async def travel_intelligence_agent_node(state: Dict[str, Any]) -> Dict[str, Any]:
    destination = state.get("destination", "Manali")
    duration = int(state.get("duration", 5))
    budget = float(state.get("budget", 30000.0))
    travel_style = state.get("travel_style", "Adventure")
    interests = state.get("interests", ["Sightseeing", "Cafes"])
    must_visit_places = state.get("must_visit_places", [])

    places = state.get("places_found", [])
    weather = state.get("weather_forecast", {})

    api_key = os.getenv("GEMINI_API_KEY", "")
    intel_output = None

    if api_key:
        try:
            llm = get_llm(temperature=0.3, max_retries=1, request_timeout=12)
            if llm:
                structured_llm = llm.with_structured_output(TravelIntelligenceModel)

            prompt = f"""
System Role: You are the Travel Intelligence Agent in WanderWave's Agentic AI Trip Planner.
Your job is to perform deep destination analytics, seasonal weather & geography risk assessment, and compute numerical scores (0.0 - 10.0).

Trip Parameters:
- Destination: {destination}
- Duration: {duration} Days
- Budget: INR {budget:,.0f}
- Travel Style: {travel_style}
- User Interests: {', '.join(interests)}
- Must Visit Places: {', '.join(must_visit_places) if must_visit_places else 'None specified'}
- Researched Places Count: {len(places)}
- Weather Summary: {weather.get('summary', 'Pleasant & Clear')}
- Has Heavy Rain Warning: {weather.get('has_heavy_rain_warning', False)}

Instructions:
1. Compute scores between 5.0 and 9.8 for:
   - overall_score, weather_score, budget_score, activity_score, transport_score, crowd_score
2. Determine best_month_to_visit (e.g. October - March).
3. Evaluate feasibility_verdict (EXCELLENT, MODERATE_WITH_CAUTION, or NOT_RECOMMENDED).
4. Assign weather_risk_level (Low, Moderate, High).
5. Provide geography_notes (1-2 sentences on geographical & climate dynamics e.g., monsoon waves in coastal areas, heavy snow in mountain passes, high heat index in deserts).
6. Provide seasonal_activity_advice (guidance on suitable outdoor vs indoor activities given current climate/terrain).
            """
            intel_output = await structured_llm.ainvoke(prompt)
        except Exception as e:
            print(f"[TravelIntelligenceAgent Warning] Gemini LLM call error: {e}. Utilizing dynamic analytics solver.")

    if not intel_output:
        # Dynamic analytical scoring solver
        place_count = len(places)
        has_heavy_rain = weather.get("has_heavy_rain_warning", False)
        dest_lower = destination.lower()

        is_coastal = "goa" in dest_lower or "kerala" in dest_lower or "mumbai" in dest_lower
        is_mountain = "manali" in dest_lower or "ladakh" in dest_lower or "shimla" in dest_lower
        is_desert = "jaipur" in dest_lower or "dubai" in dest_lower or "jaisalmer" in dest_lower

        if has_heavy_rain and is_coastal:
            verdict = "MODERATE_WITH_CAUTION"
            risk = "High"
            geo_note = f"{destination} experiences heavy monsoonal rain and rough seas during this period. Beach shacks & water sports may be closed."
            advice = "Focus on inland waterfalls, heritage churches, spice plantations, and cozy rain-view cafes."
            weather_score = 6.2
        elif is_mountain and has_heavy_rain:
            verdict = "MODERATE_WITH_CAUTION"
            risk = "Moderate"
            geo_note = f"Mountainous terrain in {destination} requires caution due to slippery trails and potential cloudbursts."
            advice = "Prioritize valley sightseeing, indoor monasteries/temples, and scenic mountain cafes over high pass trekking."
            weather_score = 6.8
        else:
            verdict = "EXCELLENT"
            risk = "Low"
            geo_note = f"{destination} has favorable climate and geography for comfortable travel and outdoor exploration."
            advice = "Ideal for full-day outdoor sightseeing, beach visits, and local cultural walks."
            weather_score = 8.8

        budget_score = min(9.5, max(6.5, round(budget / (duration * 2500), 1)))
        activity_score = min(9.6, max(7.0, round(7.5 + (place_count * 0.15), 1)))
        transport_score = 8.2
        crowd_score = 7.1
        overall = round((weather_score + budget_score + activity_score + transport_score + crowd_score) / 5, 1)

        best_months = "October - March" if (is_coastal or is_mountain) else "October - April"

        intel_dict = {
            "overall_score": overall,
            "weather_score": weather_score,
            "budget_score": budget_score,
            "activity_score": activity_score,
            "transport_score": transport_score,
            "crowd_score": crowd_score,
            "best_month_to_visit": best_months,
            "recommendation_rationale": f"{destination} offers a great {travel_style.lower()} experience with {place_count} curated spots. Climate condition: {verdict.replace('_', ' ')}."
        }
        location_feasibility = {
            "verdict": verdict,
            "weather_risk_level": risk,
            "geography_notes": geo_note,
            "seasonal_activity_advice": advice,
            "best_month_to_visit": best_months
        }
    else:
        out_data = intel_output.model_dump()
        intel_dict = {
            "overall_score": out_data.get("overall_score", 8.5),
            "weather_score": out_data.get("weather_score", 8.0),
            "budget_score": out_data.get("budget_score", 8.2),
            "activity_score": out_data.get("activity_score", 8.5),
            "transport_score": out_data.get("transport_score", 8.0),
            "crowd_score": out_data.get("crowd_score", 7.5),
            "best_month_to_visit": out_data.get("best_month_to_visit", "October - March"),
            "recommendation_rationale": out_data.get("recommendation_rationale", "")
        }
        location_feasibility = {
            "verdict": out_data.get("feasibility_verdict", "EXCELLENT"),
            "weather_risk_level": out_data.get("weather_risk_level", "Low"),
            "geography_notes": out_data.get("geography_notes", ""),
            "seasonal_activity_advice": out_data.get("seasonal_activity_advice", ""),
            "best_month_to_visit": out_data.get("best_month_to_visit", "October - March")
        }

    log_entry = {
        "agent": "Travel Intelligence Agent (Destination Analytics Engine)",
        "status": "SUCCESS",
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
        "details": f"Evaluated {destination} Intelligence Score: {intel_dict.get('overall_score')}/10. Feasibility: {location_feasibility.get('verdict')} ({location_feasibility.get('weather_risk_level')} Risk). Best Window: {intel_dict.get('best_month_to_visit')}."
    }

    existing_logs = state.get("agent_logs", [])
    return {
        "travel_intelligence": intel_dict,
        "location_feasibility": location_feasibility,
        "agent_logs": existing_logs + [log_entry]
    }
