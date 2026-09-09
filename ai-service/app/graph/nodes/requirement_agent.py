import os
import datetime
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from app.graph.state import TripState
from app.graph.llm import get_llm

class RequirementAnalysisModel(BaseModel):
    destination: str = Field(description="Primary travel destination city or region worldwide, e.g. Paris, Tokyo, Manali, Goa, Dubai")
    starting_city: str = Field(description="Starting origin city, e.g. Delhi, Mumbai, New York, London")
    duration: int = Field(description="Trip duration in days as an integer, e.g. 5")
    budget: float = Field(description="Numeric total budget in INR (or user currency), e.g. 50000 for 50k")
    travelers: int = Field(description="Number of travelers as an integer")
    interests: List[str] = Field(description="List of travel interest keywords, e.g. Trekking, Museums, Cafes, Beaches")
    travel_style: str = Field(description="Travel style: Adventure, Relaxed, Cultural, Luxury, Budget, Balanced")
    must_visit_places: List[str] = Field(default_factory=list, description="List of specific landmarks or spots the user explicitly wants to visit, e.g. ['Fort Aguada', 'Baga Beach']")
    missing_fields: List[str] = Field(default_factory=list, description="Any critical missing fields from request e.g. destination")
    analysis_summary: str = Field(description="1-sentence clear analysis summary of requirements")

async def requirement_agent_node(state: TripState) -> Dict[str, Any]:
    user_request = state.get("user_request", "")
    user_long_term_prefs = state.get("user_long_term_preferences", {})

    api_key = os.getenv("GEMINI_API_KEY", "")
    structured_output = None

    user_must_visits = state.get("must_visit_places", [])

    if api_key:
        try:
            llm = get_llm(temperature=0.2, max_retries=1, request_timeout=10)
            if llm:
                structured_llm = llm.with_structured_output(RequirementAnalysisModel)

            prompt = f"""
System Role: You are the Requirement Analyzer Agent in WanderWave's Agentic AI Trip Planner.
Your sole job is to strictly extract travel parameters ONLY if explicitly mentioned in the user's raw prompt.

User Raw Request: "{user_request}"
Pre-specified Must Visit Places (if any): {user_must_visits}

CRITICAL HITL RULES:
1. DESTINATION: Check if the user explicitly named a valid destination city or region (e.g. "Goa", "Paris", "Tokyo"). If NO destination is explicitly named, or if the user prompt is generic like "plan a trip", "vacation", "take me somewhere", set destination="Unknown" and add "destination" to missing_fields. DO NOT guess or default a destination.
2. BUDGET: Check if the user explicitly named a numeric budget (e.g. "under 30000", "50k", "$2000"). If NO budget amount is explicitly stated, set budget=0.0 and add "budget" to missing_fields. DO NOT invent or default a budget.
3. Extract starting_city (default 'Delhi' if omitted), duration (default 5 if omitted), travelers (default 2), interests array, travel_style, and must_visit_places (array of specific requested spots/landmarks e.g. Fort Aguada, Baga Beach). Combine with Pre-specified Must Visit Places if provided.
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

        budget = 0.0
        k_match = re.search(r'(\d+)\s*k', text)
        num_match = re.search(r'(\d{4,6})', text)
        if k_match:
            budget = float(k_match.group(1)) * 1000.0
        elif num_match:
            budget = float(num_match.group(1))
        else:
            missing_fields.append("budget")

        travelers = 2
        people_match = re.search(r'(\d+)\s*(people|person|traveler|travelers|friends)', text)
        if people_match:
            travelers = int(people_match.group(1))

        interests = ["Sightseeing", "Cafes", "Local Culture"]

        parsed_must_visits = list(user_must_visits)
        mv_match = re.findall(r'(?:must visit|must see|include|visit)\s+([a-zA-Z0-9\s]+?)(?:,|and|\.|$)', text, re.IGNORECASE)
        if mv_match:
            for item in mv_match:
                cleaned = item.strip().title()
                if cleaned and len(cleaned) > 2 and cleaned not in parsed_must_visits:
                    parsed_must_visits.append(cleaned)

        structured_output = RequirementAnalysisModel(
            destination=destination,
            starting_city=starting_city,
            duration=duration,
            budget=budget,
            travelers=travelers,
            interests=interests,
            travel_style=user_long_term_prefs.get("travelStyle", "Adventure"),
            must_visit_places=parsed_must_visits,
            missing_fields=missing_fields,
            analysis_summary=f"Parsed request for {destination}: {duration} days, INR {budget} budget."
        )

    requires_hitl = state.get("requires_human_input", False)
    if (
        structured_output.destination == "Unknown"
        or "destination" in structured_output.missing_fields
        or structured_output.destination.lower() in ["unknown", "trip", "vacation", "place", "somewhere", "anywhere"]
        or structured_output.budget <= 0
        or "budget" in structured_output.missing_fields
    ):
        requires_hitl = True

    log_entry = {
        "agent": "Requirement Analyzer Agent",
        "status": "PAUSED_FOR_HUMAN_INPUT" if requires_hitl else "SUCCESS",
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
        "details": f"Parsed parameters: Destination={structured_output.destination}, Must Visit Places={structured_output.must_visit_places}. HITL Interruption: {requires_hitl}"
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
        "must_visit_places": structured_output.must_visit_places,
        "missing_fields": structured_output.missing_fields,
        "requires_human_input": requires_hitl,
        "agent_logs": existing_logs + [log_entry]
    }
