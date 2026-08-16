import os
import datetime
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
        b_cap = request.budget or 30000.0
        dur = request.duration or 5
        t_count = request.travelers or 2
        orig = request.startingCity or "Delhi"
        style = request.travelStyle or "Adventure"

        resumed_prompt = f"Plan a {dur} day trip to {dest} from {orig} under {b_cap} for {t_count} people with {style} style"
        result_state = await run_requirement_analysis(resumed_prompt, {"travelStyle": style}, requires_hitl=False)

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
    Partial Re-Planning Node: Regenerates ONLY a specific day based on targeted user feedback
    without resetting or re-synthesizing the rest of the itinerary!
    """
    try:
        day_num = request.dayNumber
        fb = request.feedback.lower()
        itin = dict(request.currentItinerary)
        dest = request.destination or itin.get("destination", "Goa")
        
        days_list = list(itin.get("days", []))
        updated_days = []

        for d in days_list:
            if d.get("day_number") == day_num:
                # Apply targeted feedback transformation
                m = dict(d.get("morning", {}))
                a = dict(d.get("afternoon", {}))
                e = dict(d.get("evening", {}))

                if "cheaper" in fb or "budget" in fb:
                    m["activity"] = f"Free Scenic Walk & Sunrise Point in {dest}"
                    m["estimated_cost_inr"] = 0
                    m["tips"] = "Budget tip: Free entry early morning spot."

                    a["activity"] = f"Budget Street Food Sampling & Local Bazaar Walk"
                    a["estimated_cost_inr"] = 150
                    
                    e["activity"] = f"Sunset Beach Promenade Stroll & Tea Stand"
                    e["estimated_cost_inr"] = 50
                    new_day_cost = 200

                elif "adventurous" in fb or "adventure" in fb:
                    m["activity"] = f"Thrilling Water Sports & Jet Skiing at {dest} Beach"
                    m["estimated_cost_inr"] = 1200
                    m["tips"] = "Book authorized water sport operators."

                    a["activity"] = f"ATV Quad Bike Trail & Jungle Trek"
                    a["estimated_cost_inr"] = 850
                    
                    e["activity"] = f"Evening Campfire & Beach Side Barbecue"
                    e["estimated_cost_inr"] = 600
                    new_day_cost = 2650

                elif "relaxed" in fb or "relax" in fb or "cafe" in fb:
                    m["activity"] = f"Cozy Cafe Breakfast & Artisan Coffee Tasting in {dest}"
                    m["estimated_cost_inr"] = 350
                    
                    a["activity"] = f"Heritage Architecture Walk & Boutique Shopping"
                    a["estimated_cost_inr"] = 400
                    
                    e["activity"] = f"Live Acoustic Music Session at Local Seaside Lounge"
                    e["estimated_cost_inr"] = 500
                    new_day_cost = 1250

                elif "sightseeing" in fb or "heritage" in fb:
                    m["activity"] = f"Guided Morning Sightseeing at Iconic {dest} Forts & Temples"
                    m["estimated_cost_inr"] = 300
                    m["tips"] = "Hire an official local guide for historical insights."

                    a["activity"] = f"Museum Visit & Royal Palace Heritage Tour"
                    a["estimated_cost_inr"] = 450

                    e["activity"] = f"Cultural Folk Dance Show & Traditional Dinner"
                    e["estimated_cost_inr"] = 650
                    new_day_cost = 1400

                elif "less travel" in fb or "compact" in fb or "nearby" in fb:
                    m["activity"] = f"Relaxed Morning Walking Tour within {dest} Hotel Quarter"
                    m["estimated_cost_inr"] = 150
                    m["tips"] = "Everything is within 5 minutes walking distance."

                    a["activity"] = f"Adjacent Local Market & Craft Workshop"
                    a["estimated_cost_inr"] = 250

                    e["activity"] = f"Neighborhood Rooftop Dining & Sunset View"
                    e["estimated_cost_inr"] = 400
                    new_day_cost = 800
                else:
                    m["activity"] = f"Refined Morning Exploration of {dest} Hidden Spots"
                    a["activity"] = f"Local Heritage Experience & Culinary Delights"
                    e["activity"] = f"Sunset View & Souvenir Shopping in {dest}"
                    new_day_cost = d.get("estimated_day_cost_inr", 1500)

                updated_days.append({
                    "day_number": day_num,
                    "title": f"Day {day_num}: {dest} Custom Re-Planned ({request.feedback})",
                    "weather_snippet": d.get("weather_snippet", "Sunny & Pleasant | 25°C"),
                    "morning": m,
                    "afternoon": a,
                    "evening": e,
                    "estimated_day_cost_inr": new_day_cost
                })
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
