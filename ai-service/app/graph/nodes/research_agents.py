import os
import datetime
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI

class DailyWeatherModel(BaseModel):
    day: int = Field(description="Day index starting at 1")
    condition: str = Field(description="Weather condition e.g. Sunny & Clear, Overcast, Mild Rain")
    temp_max_c: float = Field(description="Maximum expected temp in Celsius")
    temp_min_c: float = Field(description="Minimum expected temp in Celsius")
    rain_probability_pct: int = Field(description="Rain probability percentage 0-100")
    suitable_for_outdoors: bool = Field(description="Whether suitable for outdoor activities")

class TransportOptionModel(BaseModel):
    mode: str = Field(description="Transit mode e.g. High Speed Rail, Volvo Bus, Flight, SUV Taxi")
    roundtrip_cost_per_person: float = Field(description="Roundtrip transit cost per person in INR")
    travel_time_hours: float = Field(description="Transit duration in hours")
    comfort_rating: str = Field(description="Comfort rating out of 5 e.g. 4.5/5")
    recommended_for: List[str] = Field(description="Target traveler profiles e.g. Budget, Luxury, Families")

class PlaceModel(BaseModel):
    name: str = Field(description="Real name of place / attraction / spot in destination")
    category: str = Field(description="Category e.g. Adventure, Heritage, Cafe, Nature, Shopping")
    best_time: str = Field(description="Recommended time of day: Morning, Afternoon, Evening")
    estimated_cost_per_person: float = Field(description="Estimated entry/activity cost per person in INR")
    description: str = Field(description="Rich 1-2 sentence description of what to do there")

class DestinationResearchModel(BaseModel):
    climate_type: str = Field(description="Climate description e.g. Alpine / Cold, Tropical, Mediterranean, Desert")
    weather_summary: str = Field(description="Summary of destination weather during trip dates")
    forecast_days: List[DailyWeatherModel] = Field(description="Daily weather forecast objects")
    transport_options: List[TransportOptionModel] = Field(description="Realistic transport options from origin to destination")
    places_found: List[PlaceModel] = Field(description="Top 6-8 real places and attractions matching user interests")

async def research_agents_node(state: Dict[str, Any]) -> Dict[str, Any]:
    destination = state.get("destination", "Manali")
    starting_city = state.get("starting_city", "Delhi")
    duration = int(state.get("duration", 5))
    travelers = int(state.get("travelers", 2))
    interests = state.get("interests", ["Sightseeing", "Cafes"])
    travel_style = state.get("travel_style", "Adventure")

    api_key = os.getenv("GEMINI_API_KEY", "")
    research_output = None

    if api_key:
        try:
            llm = ChatGoogleGenerativeAI(
                model="gemini-3.6-flash",
                google_api_key=api_key,
                temperature=0.3
            )
            structured_llm = llm.with_structured_output(DestinationResearchModel)

            prompt = f"""
System Role: You are the Research Agent Node in WanderWave's Agentic AI Trip Planner.
Your job is to dynamically research weather, transit options, and top attractions for ANY destination worldwide.

Trip Parameters:
- Destination: {destination}
- Origin: {starting_city}
- Duration: {duration} Days
- Travelers: {travelers} People
- User Interests: {', '.join(interests)}
- Travel Style: {travel_style}

Instructions:
1. Provide a realistic weather forecast for {duration} days in {destination}.
2. Provide 2-3 realistic transit modes (flight, bus, train, cab) from {starting_city} to {destination} with estimated per-person roundtrip cost in INR.
3. Recommend 6-8 authentic, real places/attractions in {destination} tailored to interests ({', '.join(interests)}) categorized by Morning, Afternoon, or Evening.
            """
            research_output = await structured_llm.ainvoke(prompt)
        except Exception as e:
            print(f"[ResearchAgents Warning] Gemini LLM call error: {e}. Utilizing fallback tool research.")

    if not research_output:
        # Fallback tool calls
        from app.graph.tools.weather_tool import get_weather_forecast
        from app.graph.tools.transport_tool import get_transport_estimates
        from app.graph.tools.places_tool import get_places_and_attractions

        w_data = get_weather_forecast(destination, duration)
        t_data = get_transport_estimates(starting_city, destination, duration, travelers)
        p_data = get_places_and_attractions(destination, interests, travel_style)

        weather_dict = {
            "destination": destination,
            "climate_type": w_data.get("climate_type", "Temperate"),
            "forecast_days": w_data.get("forecast_days", []),
            "summary": w_data.get("summary", "")
        }
        transport_dict = t_data
        places_dict = p_data
    else:
        weather_dict = {
            "destination": destination,
            "climate_type": research_output.climate_type,
            "forecast_days": [f.model_dump() for f in research_output.forecast_days],
            "summary": research_output.weather_summary
        }
        transport_dict = [t.model_dump() for t in research_output.transport_options]
        places_dict = [p.model_dump() for p in research_output.places_found]

    log_entry = {
        "agent": "Research Agents Node (LLM Dynamic Research)",
        "status": "SUCCESS",
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
        "details": f"Dynamically researched {destination}: {len(places_dict)} attractions, weather ({weather_dict.get('climate_type')}), and {len(transport_dict)} transit options."
    }

    existing_logs = state.get("agent_logs", [])
    return {
        "weather_forecast": weather_dict,
        "transport_options": transport_dict,
        "places_found": places_dict,
        "agent_logs": existing_logs + [log_entry]
    }
