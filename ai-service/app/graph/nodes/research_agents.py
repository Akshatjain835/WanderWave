import os
import datetime
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from app.graph.llm import get_llm
from app.rag.retriever import retrieve_hyperlocal_knowledge
from app.graph.tools.weather_tool import get_weather_forecast
from app.graph.tools.transport_tool import get_transport_estimates
from app.graph.tools.places_tool import get_places_and_attractions

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

    # STEP 1: Execute Deterministic Data Tools First (Empirical Tool Calls)
    raw_weather = get_weather_forecast(destination, duration)
    raw_transport = get_transport_estimates(starting_city, destination, duration, travelers)
    raw_places = get_places_and_attractions(destination, interests, travel_style)
    
    # STEP 2: Query Qdrant Cloud Vector DB for Hyper-local RAG Guidebooks
    rag_tips = retrieve_hyperlocal_knowledge(destination, ", ".join(interests))

    api_key = os.getenv("GEMINI_API_KEY", "")
    research_output = None

    # STEP 3: Pass Empirical Tool Facts into LLM for Synthesis & Formatting
    if api_key:
        try:
            llm = get_llm(temperature=0.3, max_retries=1, request_timeout=12)
            if llm:
                structured_llm = llm.with_structured_output(DestinationResearchModel)

                prompt = f"""
System Role: You are the Tool-Integrated Research Agent in WanderWave's Agentic AI Trip Planner.
Your job is to synthesize real empirical tool data and Qdrant RAG vector guidebooks into structured research models.
DO NOT hallucinate weather or transportation prices — rely strictly on the provided tool facts below.

Empirical Tool Facts:
- Target Destination: {destination}
- Origin City: {starting_city}
- Duration: {duration} Days for {travelers} travelers
- Raw Weather Tool Data: {raw_weather}
- Raw Transport Tool Data: {raw_transport}
- Raw Researched Places Tool Data: {raw_places}
- Qdrant Vector DB RAG Guidebooks ({len(rag_tips)} matches): {rag_tips}

Instructions:
1. Synthesize the provided weather tool forecast into climate_type, weather_summary, and forecast_days.
2. Format the transport options into transport_options preserving real cost estimates in INR.
3. Combine top places found from the places tool and Qdrant RAG guidebooks into places_found (6-8 items).
                """
                research_output = await structured_llm.ainvoke(prompt)
        except Exception as e:
            print(f"[ResearchAgents Warning] Gemini LLM synthesis notice: {e}. Utilizing tool data directly.")

    if not research_output:
        weather_dict = {
            "destination": destination,
            "climate_type": raw_weather.get("climate_type", "Temperate"),
            "forecast_days": raw_weather.get("forecast_days", []),
            "summary": raw_weather.get("summary", "")
        }
        transport_dict = raw_transport
        places_dict = raw_places

        # Inject RAG vector DB entries into places_dict
        for tip in rag_tips:
            places_dict.insert(0, {
                "name": tip.get("title", f"{destination} Hidden Gem"),
                "category": tip.get("category", "RAG Vector Guidebook"),
                "best_time": "Afternoon",
                "estimated_cost_per_person": 150.0,
                "description": tip.get("content", f"Hyper-local recommendation for {destination}.")
            })
    else:
        weather_dict = {
            "destination": destination,
            "climate_type": research_output.climate_type,
            "forecast_days": [f.model_dump() for f in research_output.forecast_days],
            "summary": research_output.weather_summary
        }
        transport_dict = [t.model_dump() for t in research_output.transport_options]
        places_dict = [p.model_dump() for p in research_output.places_found]

    rag_status = "Available" if not any(t.get("is_fallback") for t in rag_tips) else "Unavailable (Fallback Used)"

    log_entry = {
        "agent": "Research Agents Node (Tool Execution + Qdrant RAG)",
        "status": "SUCCESS",
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
        "details": f"Researched {destination} via Weather, Transport & Places Tools + Qdrant RAG ({len(rag_tips)} guidebooks retrieved, RAG Status: {rag_status})."
    }

    existing_logs = state.get("agent_logs", [])
    return {
        "weather_forecast": weather_dict,
        "transport_options": transport_dict,
        "places_found": places_dict,
        "agent_logs": existing_logs + [log_entry]
    }
