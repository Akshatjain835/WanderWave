import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

load_dotenv()

from app.graph.workflow import run_requirement_analysis

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
            "message": "Trip requirement analyzed and researched by Python LangGraph Agents 🧠",
            "data": {
                "destination": result_state.get("destination"),
                "startingCity": result_state.get("starting_city"),
                "duration": result_state.get("duration"),
                "budget": result_state.get("budget"),
                "travelers": result_state.get("travelers"),
                "interests": result_state.get("interests"),
                "travelStyle": result_state.get("travel_style"),
                "missingFields": result_state.get("missing_fields", []),
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
