import os
import datetime
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    prompt: Optional[str] = None
    destination: Optional[str] = "Manali"
    startingCity: Optional[str] = "Delhi"
    duration: Optional[int] = 5
    budget: Optional[float] = 30000.0
    travelers: Optional[int] = 2
    interests: Optional[List[str]] = ["Trekking", "Cafes"]
    travelStyle: Optional[str] = "Adventure"
    userLongTermPreferences: Optional[Dict[str, Any]] = None

class ResumeRequest(BaseModel):
    user_decision: str
    destination: Optional[str] = None
    budget: Optional[float] = None
    duration: Optional[int] = 5
    travelers: Optional[int] = 2
    startingCity: Optional[str] = "Delhi"
    travelStyle: Optional[str] = "Adventure"

class RegenerateDayRequest(BaseModel):
    dayNumber: int
    feedback: str
    currentItinerary: Dict[str, Any]
    destination: Optional[str] = "Goa"
    budget: Optional[float] = 25000.0

@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "service": "WanderWave Python LangGraph AI Microservice 🐍🤖",
        "gemini_api_key_configured": bool(os.getenv("GEMINI_API_KEY"))
    }

@app.post("/api/graph/analyze")
async def analyze_trip(request: AnalyzeRequest):
    try:
        user_prompt = request.prompt
        if not user_prompt:
            user_prompt = f"Plan a {request.duration} day trip to {request.destination} from {request.startingCity} under {request.budget} for {request.travelers} people with interests in {', '.join(request.interests or [])}"

        prefs = request.userLongTermPreferences or {
            "travelStyle": request.travelStyle,
            "dietary": "Vegetarian"
        }

        result_state = await run_requirement_analysis(user_prompt, prefs)

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
        dest = request.destination or request.user_decision or "Goa"
        result_state = await resume_requirement_analysis(dest, thread_id="default_session")

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
