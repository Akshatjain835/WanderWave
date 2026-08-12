import os
import datetime
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from app.graph.state import TripState

class RequirementAnalysisModel(BaseModel):
    destination: str = Field(description="Primary travel destination city or region worldwide, e.g. Paris, Tokyo, Manali, Goa, Dubai")
    starting_city: str = Field(description="Starting origin city, e.g. Delhi, Mumbai, New York, London")
    duration: int = Field(description="Trip duration in days as an integer, e.g. 5")
    budget: float = Field(description="Numeric total budget in INR (or user currency), e.g. 50000 for 50k")
    travelers: int = Field(description="Number of travelers as an integer")
    interests: List[str] = Field(description="List of travel interest keywords, e.g. Trekking, Museums, Cafes, Beaches")
    travel_style: str = Field(description="Travel style: Adventure, Relaxed, Cultural, Luxury, Budget, Balanced")
    missing_fields: List[str] = Field(default_factory=list, description="Any critical missing fields from request e.g. destination")
    analysis_summary: str = Field(description="1-sentence clear analysis summary of requirements")

async def requirement_agent_node(state: TripState) -> Dict[str, Any]:
    user_request = state.get("user_request", "")
    user_long_term_prefs = state.get("user_long_term_preferences", {})

    api_key = os.getenv("GEMINI_API_KEY", "")
    structured_output = None

    if api_key:
        try:
            llm = ChatGoogleGenerativeAI(
                model="gemini-3.6-flash",
                google_api_key=api_key,
                temperature=0.1,
                max_retries=1,
                request_timeout=12
            )
            structured_llm = llm.with_structured_output(RequirementAnalysisModel)

            prompt = f"""
System Role: You are the Requirement Analyzer Agent in WanderWave's Agentic AI Trip Planner.
Your job is to dynamically parse ANY raw user travel prompt into structured parameters.

User Raw Request: "{user_request}"

Instructions:
1. Extract destination, starting_city (default to 'Delhi' if unspecified), duration in days (default 5), numeric budget, travelers count, interests array, and travel_style.
2. If the user prompt DOES NOT explicitly specify a valid destination city/region, set destination="Unknown" and add "destination" to missing_fields.
            """
            structured_output = await structured_llm.ainvoke(prompt)
        except Exception as e:
            print(f"[RequirementAgent Warning] Gemini LLM call error: {e}. Utilizing dynamic rule-based parser.")

    if not structured_output:
        import re
        text = (user_request or "").lower()
        
        destination = ""
        missing_fields = []
        dest_match = re.search(r'(?:to|visit|into|towards)\s+([a-zA-Z\s]+?)(?=\s+(?:from|under|for|with|in|\d)|$)', text, re.IGNORECASE)
        if dest_match and len(dest_match.group(1).strip()) > 1:
            raw_dest = dest_match.group(1).strip().title()
            invalid_keywords = ["take", "trip", "vacation", "tour", "visit", "unknown", "place", "where", "somewhere", "anywhere"]
            if any(k in raw_dest.lower() for k in invalid_keywords):
                destination = "Unknown"
                missing_fields.append("destination")
            else:
                destination = raw_dest
        else:
            destination = "Unknown"
            missing_fields.append("destination")
        
        starting_city = "Delhi"
        from_match = re.search(r'from\s+([a-zA-Z]+)', text, re.IGNORECASE)
        if from_match:
            starting_city = from_match.group(1).capitalize()

        duration = 5
        day_match = re.search(r'(\d+)\s*(day|days)', text)
        if day_match:
            duration = int(day_match.group(1))

        budget = 30000.0
        k_match = re.search(r'(\d+)\s*k', text)
        num_match = re.search(r'(\d{4,6})', text)
        if k_match:
            budget = float(k_match.group(1)) * 1000.0
        elif num_match:
            budget = float(num_match.group(1))

        travelers = 2
        people_match = re.search(r'(\d+)\s*(people|person|traveler|travelers|friends)', text)
        if people_match:
            travelers = int(people_match.group(1))

        interests = ["Sightseeing", "Cafes", "Local Culture"]

        structured_output = RequirementAnalysisModel(
            destination=destination,
            starting_city=starting_city,
            duration=duration,
            budget=budget,
            travelers=travelers,
            interests=interests,
            travel_style=user_long_term_prefs.get("travelStyle", "Adventure"),
            missing_fields=missing_fields,
            analysis_summary=f"Parsed request for {destination}: {duration} days, INR {budget} budget."
        )

    requires_hitl = state.get("requires_human_input", False)
    if structured_output.destination == "Unknown" or "destination" in structured_output.missing_fields or structured_output.destination.lower() in ["unknown", "trip", "vacation"]:
        requires_hitl = True

    log_entry = {
        "agent": "Requirement Analyzer Agent (LLM Dynamic Node)",
        "status": "PAUSED_FOR_HUMAN_INPUT" if requires_hitl else "SUCCESS",
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
        "details": f"Parsed parameters: Destination={structured_output.destination}. HITL Interruption: {requires_hitl}"
    }

    existing_logs = state.get("agent_logs", [])
    return {
        "destination": structured_output.destination,
        "starting_city": structured_output.starting_city,
        "duration": structured_output.duration,
        "budget": structured_output.budget,
        "travelers": structured_output.travelers,
        "interests": structured_output.interests,
        "travel_style": structured_output.travel_style,
        "missing_fields": structured_output.missing_fields,
        "requires_human_input": requires_hitl,
        "agent_logs": existing_logs + [log_entry]
    }
