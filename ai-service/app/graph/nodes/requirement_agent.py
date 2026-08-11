import os
import re
import datetime
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from app.graph.state import TripState

class RequirementAnalysisModel(BaseModel):
    destination: str = Field(default="Manali", description="Primary travel destination city, e.g. Manali, Goa, Ladakh")
    starting_city: str = Field(default="Delhi", description="Starting origin city, e.g. Delhi, Mumbai, Bangalore")
    duration: int = Field(default=5, description="Trip duration in days as integer, e.g. 5")
    budget: float = Field(default=30000.0, description="Numeric total budget in INR, e.g. 30000 for 30k")
    travelers: int = Field(default=2, description="Number of travelers")
    interests: List[str] = Field(default_factory=lambda: ["Trekking", "Cafes", "Sightseeing"], description="List of interests")
    travel_style: str = Field(default="Adventure", description="Travel style: Adventure, Relaxed, Cultural, Luxury, Budget, Balanced")
    missing_fields: List[str] = Field(default_factory=list, description="Missing required fields")
    analysis_summary: str = Field(default="Requirement analyzed successfully.", description="1-sentence analysis summary")

async def requirement_agent_node(state: TripState) -> Dict[str, Any]:
    user_request = state.get("user_request", "")
    user_long_term_prefs = state.get("user_long_term_preferences", {})

    api_key = os.getenv("GEMINI_API_KEY", "")
    structured_output = None

    if api_key:
        try:
            llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=api_key,
                temperature=0.2
            )
            structured_llm = llm.with_structured_output(RequirementAnalysisModel)

            prompt = f"""
System Role: You are the Requirement Analyzer Agent in WanderWave's Agentic AI Trip Planner.
Your job is to dynamically parse the user's raw trip request into structured travel parameters.

User Raw Request: "{user_request or 'Plan a 5 day trip to Manali from Delhi under 30000 for 2 people with trekking and cafes'}"

Long-term User Memory Preferences (Use if prompt doesn't specify otherwise):
- Default Travel Style: {user_long_term_prefs.get('travelStyle', 'Balanced')}
- Default Dietary: {user_long_term_prefs.get('dietary', 'None')}
- Default Interests: {user_long_term_prefs.get('interests', ['Sightseeing'])}

Instructions:
1. Extract destination, starting city, duration in days, numeric budget (e.g. 30k -> 30000), travelers count, interests array, and travel style.
2. If any mandatory parameter is missing, add it to missing_fields.
3. Provide a clear 1-sentence analysis summary.
            """
            structured_output = await structured_llm.ainvoke(prompt)
        except Exception as e:
            print(f"[RequirementAgent Warning] Gemini LLM dynamic call error: {e}. Using fallback parser.")

    if not structured_output:
        structured_output = parse_rule_based(user_request, user_long_term_prefs)

    destination = getattr(structured_output, "destination", "Manali")
    starting_city = getattr(structured_output, "starting_city", "Delhi")
    duration = int(getattr(structured_output, "duration", 5))
    budget = float(getattr(structured_output, "budget", 30000.0))
    travelers = int(getattr(structured_output, "travelers", 2))
    interests = getattr(structured_output, "interests", ["Trekking", "Cafes", "Sightseeing"])
    travel_style = getattr(structured_output, "travel_style", user_long_term_prefs.get("travelStyle", "Adventure"))
    missing_fields = getattr(structured_output, "missing_fields", [])

    log_entry = {
        "agent": "Requirement Analyzer Agent (Python LangGraph)",
        "status": "SUCCESS",
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
        "details": f"Parsed dynamic requirement for {destination} ({duration} days, INR {budget:,.0f}, {travelers} travelers)."
    }

    existing_logs = state.get("agent_logs", [])
    return {
        "destination": destination,
        "starting_city": starting_city,
        "duration": duration,
        "budget": budget,
        "travelers": travelers,
        "interests": interests,
        "travel_style": travel_style,
        "missing_fields": missing_fields,
        "agent_logs": existing_logs + [log_entry]
    }

def parse_rule_based(request_text: str, prefs: Dict[str, Any]) -> RequirementAnalysisModel:
    text = (request_text or "").lower()

    destination = "Manali"
    dest_match = re.search(r'(?:to|visit|into|towards)\s+([a-zA-Z\s]+?)(?=\s+(?:from|under|for|with|in|\d)|$)', text, re.IGNORECASE)
    if dest_match:
        extracted = dest_match.group(1).strip()
        extracted = re.sub(r'^(visit|to|trip|go|stay)\s+', '', extracted, flags=re.IGNORECASE).strip()
        if len(extracted) > 1:
            destination = extracted.title()
    elif "hyderabad" in text: destination = "Hyderabad"
    elif "dubai" in text: destination = "Dubai"
    elif "goa" in text: destination = "Goa"
    elif "ladakh" in text or "leh" in text: destination = "Ladakh"
    elif "kerala" in text: destination = "Kerala"
    elif "jaipur" in text or "rajasthan" in text: destination = "Jaipur"
    elif "mumbai" in text: destination = "Mumbai"
    elif "manali" in text: destination = "Manali"

    destination = re.sub(r'^(visit|to|trip|go)\s+', '', destination, flags=re.IGNORECASE).strip().title()

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

    interests = []
    if "trek" in text: interests.append("Trekking")
    if "cafe" in text or "food" in text: interests.append("Cafes")
    if "sightseeing" in text or "temple" in text: interests.append("Sightseeing")
    if "beach" in text: interests.append("Beaches")
    if "adventure" in text: interests.append("Adventure Sports")
    if not interests:
        interests = ["Trekking", "Cafes", "Sightseeing"]

    return RequirementAnalysisModel(
        destination=destination,
        starting_city="Delhi",
        duration=duration,
        budget=budget,
        travelers=travelers,
        interests=interests,
        travel_style=prefs.get("travelStyle", "Adventure"),
        missing_fields=[],
        analysis_summary=f"Rule-based parsed request for {destination}: {duration} days, INR {budget} budget."
    )
