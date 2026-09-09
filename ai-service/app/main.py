import os
import sys
import datetime

# Ensure project root is in sys.path when running python app/main.py directly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

load_dotenv()

from app.graph.workflow import run_requirement_analysis
from app.graph.nodes.planner_agent import regenerate_single_day_agent

app = FastAPI(
    title="WanderWave Python LangGraph AI Microservice",
    description="Agentic AI Trip Planner Engine powered by Python LangGraph & Gemini Dynamic Calls 🐍🤖",
    version="1.0.0"
)

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "").split(",")
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5000",
    "https://wanderwave.vercel.app",
    "https://wanderwave-phi.vercel.app",
] + [o.strip() for o in allowed_origins_env if o.strip()]

client_url = os.getenv("CLIENT_URL")
if client_url and client_url not in allowed_origins:
    allowed_origins.append(client_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    prompt: Optional[str] = None
    destination: Optional[str] = None
    startingCity: Optional[str] = None
    duration: Optional[int] = None
    budget: Optional[float] = None
    travelers: Optional[int] = None
    interests: Optional[List[str]] = None
    travelStyle: Optional[str] = None
    mustVisitPlaces: Optional[List[str]] = None
    userLongTermPreferences: Optional[Dict[str, Any]] = None

class ResumeRequest(BaseModel):
    user_decision: str
    destination: Optional[str] = None
    budget: Optional[float] = None
    duration: Optional[int] = None
    travelers: Optional[int] = None
    startingCity: Optional[str] = "Delhi"
    travelStyle: Optional[str] = "Adventure"
    mustVisitPlaces: Optional[List[str]] = None

class RegenerateDayRequest(BaseModel):
    dayNumber: int
    feedback: str
    currentItinerary: Dict[str, Any]
    destination: Optional[str] = "Goa"
    budget: Optional[float] = 25000.0

class ExploreLocationRequest(BaseModel):
    destination: str
    duration: Optional[int] = 5
    month: Optional[str] = None
    travelStyle: Optional[str] = "Adventure"
    interests: Optional[List[str]] = None

@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "service": "WanderWave Python LangGraph AI Microservice 🐍🤖",
        "gemini_api_key_configured": bool(os.getenv("GEMINI_API_KEY"))
    }

@app.post("/api/graph/explore-location")
async def explore_location(request: ExploreLocationRequest):
    """
    Standalone Location Feasibility, Climate & Temperature Explorer Endpoint:
    Provides fast, standalone destination lookup with real weather, temperatures, climate risk ratings, and suitability advice.
    """
    try:
        dest = request.destination.strip()
        dur = request.duration or 5
        style = request.travelStyle or "Adventure"
        user_interests = request.interests or ["Sightseeing", "Cafes", "Local Culture"]

        from app.graph.tools.weather_tool import get_weather_forecast
        from app.graph.tools.places_tool import get_places_and_attractions
        from app.graph.nodes.travel_intelligence_agent import travel_intelligence_agent_node

        weather = get_weather_forecast(dest, dur)
        places = get_places_and_attractions(dest, user_interests, style)

        intel_state = {
            "destination": dest,
            "duration": dur,
            "budget": 30000.0,
            "travel_style": style,
            "interests": user_interests,
            "places_found": places,
            "weather_forecast": weather,
            "agent_logs": []
        }

        intel_res = await travel_intelligence_agent_node(intel_state)
        travel_intel = intel_res.get("travel_intelligence", {})
        location_feasibility = intel_res.get("location_feasibility", {})

        return {
            "success": True,
            "message": f"Retrieved instant location & climate feasibility analytics for '{dest}' 🌤️",
            "data": {
                "destination": dest,
                "duration": dur,
                "weatherForecast": weather,
                "locationFeasibility": location_feasibility,
                "travelIntelligence": travel_intel,
                "placesFound": places,
                "summary": f"{dest} is evaluated as '{location_feasibility.get('verdict')}' with a weather score of {travel_intel.get('weather_score', 8.5)}/10. Best window to visit: {location_feasibility.get('best_month_to_visit', 'October - March')}."
            }
        }
    except Exception as e:
        print("[Python AI-Service Explore Location Error]", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/graph/analyze")
async def analyze_trip(request: AnalyzeRequest):
    try:
        user_prompt = request.prompt
        if not user_prompt:
            if request.destination:
                user_prompt = f"Plan a {request.duration or 5} day trip to {request.destination} from {request.startingCity or 'Delhi'} under {request.budget or 30000} for {request.travelers or 2} people with interests in {', '.join(request.interests or [])}"
            else:
                user_prompt = "Plan a trip for me"

        prefs = request.userLongTermPreferences or {
            "travelStyle": request.travelStyle,
            "dietary": "Vegetarian"
        }

        result_state = await run_requirement_analysis(
            user_request=user_prompt,
            user_long_term_preferences=prefs,
            initial_destination=request.destination,
            initial_budget=request.budget,
            initial_duration=request.duration,
            initial_travelers=request.travelers,
            initial_starting_city=request.startingCity,
            initial_travel_style=request.travelStyle,
            must_visit_places=request.mustVisitPlaces
        )


        return {
            "success": True,
            "message": "Trip requirement analyzed, planned & validated by Python LangGraph Agents 🧠",
            "data": {
                "destination": result_state.get("destination"),
                "startingCity": result_state.get("starting_city"),
                "duration": result_state.get("duration"),
                "budget": result_state.get("budget"),
                "travelers": result_state.get("travelers"),
                "interests": result_state.get("interests"),
                "travelStyle": result_state.get("travel_style"),
                "mustVisitPlaces": result_state.get("must_visit_places", []),
                "mustVisitPlacesStatus": result_state.get("must_visit_places_status", []),
                "travelIntelligence": result_state.get("travel_intelligence", {}),
                "locationFeasibility": result_state.get("location_feasibility", {}),
                "missingFields": result_state.get("missing_fields", []),
                "requiresHumanInput": result_state.get("requires_human_input", False),
                "humanPromptOptions": result_state.get("human_prompt_options", []),
                "clarificationPrompt": result_state.get("clarification_prompt", ""),
                "validationPassed": result_state.get("validation_passed", True),
                "validationIssues": result_state.get("validation_issues", []),
                "validationFeedback": result_state.get("validation_feedback", ""),
                "retryCount": result_state.get("retry_count", 1),
                "userLongTermPreferences": result_state.get("user_long_term_preferences", {}),
                "weatherForecast": result_state.get("weather_forecast", {}),
                "transportOptions": result_state.get("transport_options", []),
                "placesFound": result_state.get("places_found", []),
                "budgetBreakdown": result_state.get("budget_breakdown", {}),
                "itinerary": result_state.get("itinerary", {}),
                "agentLogs": result_state.get("agent_logs", [])
            }
        }
    except Exception as e:
        print("[Python AI-Service Error]", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/graph/resume")
async def resume_trip(request: ResumeRequest):
    try:
        resume_payload = {
            "user_decision": request.user_decision,
            "destination": request.destination or request.user_decision,
            "budget": request.budget,
            "duration": request.duration,
            "travelers": request.travelers,
            "starting_city": request.startingCity,
            "travel_style": request.travelStyle,
            "must_visit_places": request.mustVisitPlaces
        }
        result_state = await resume_requirement_analysis(resume_payload, thread_id="default_session")

        return {
            "success": True,
            "message": f"Graph execution resumed with human decision: '{request.user_decision}' 🚀",
            "data": {
                "destination": result_state.get("destination"),
                "startingCity": result_state.get("starting_city"),
                "duration": result_state.get("duration"),
                "budget": result_state.get("budget"),
                "travelers": result_state.get("travelers"),
                "interests": result_state.get("interests"),
                "travelStyle": result_state.get("travel_style"),
                "mustVisitPlaces": result_state.get("must_visit_places", []),
                "mustVisitPlacesStatus": result_state.get("must_visit_places_status", []),
                "travelIntelligence": result_state.get("travel_intelligence", {}),
                "locationFeasibility": result_state.get("location_feasibility", {}),
                "requiresHumanInput": False,
                "validationPassed": result_state.get("validation_passed", True),
                "validationIssues": result_state.get("validation_issues", []),
                "validationFeedback": result_state.get("validation_feedback", ""),
                "retryCount": result_state.get("retry_count", 1),
                "weatherForecast": result_state.get("weather_forecast", {}),
                "transportOptions": result_state.get("transport_options", []),
                "placesFound": result_state.get("places_found", []),
                "budgetBreakdown": result_state.get("budget_breakdown", {}),
                "itinerary": result_state.get("itinerary", {}),
                "agentLogs": result_state.get("agent_logs", [])
            }
        }
    except Exception as e:
        print("[Python AI-Service Resume Error]", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/graph/regenerate-day")
async def regenerate_day(request: RegenerateDayRequest):
    """
    LLM-Driven Partial Re-Planning Agent Endpoint:
    Dynamically transforms ONLY the requested day's itinerary via Gemini structured generation
    based on targeted user feedback, without altering surrounding days.
    """
    try:
        day_num = request.dayNumber
        fb = request.feedback
        itin = dict(request.currentItinerary)
        dest = request.destination or itin.get("destination", "Goa")
        budget_val = request.budget or itin.get("total_budget_cap_inr", 30000.0)

        days_list = list(itin.get("days", []))
        updated_days = []

        for d in days_list:
            if d.get("day_number") == day_num:
                # LLM-driven partial re-planning agent invocation
                new_day = await regenerate_single_day_agent(
                    day_number=day_num,
                    feedback=fb,
                    current_day=d,
                    destination=dest,
                    budget=budget_val
                )
                updated_days.append(new_day)
            else:
                updated_days.append(d)

        itin["days"] = updated_days

        log_entry = {
            "agent": f"Partial Re-Planner Agent (Day {day_num})",
            "status": "REGENERATED",
            "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
            "details": f"Targeted partial re-planning applied to Day {day_num} based on user feedback: '{request.feedback}'."
        }

        return {
            "success": True,
            "message": f"Successfully regenerated Day {day_num} with partial feedback! 🔄",
            "data": {
                "itinerary": itin,
                "logEntry": log_entry
            }
        }
    except Exception as e:
        print("[Partial Re-Planner Error]", e)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
