import os
import datetime
from typing import Dict, Any
from pydantic import BaseModel, Field
from app.graph.llm import get_llm

class BudgetAllocationModel(BaseModel):
    destination_cost_tier: str = Field(description="Cost tier of destination e.g. High / Premium, Mid-range, Budget-friendly")
    accommodation_stay: float = Field(description="Allocated cap for hotel/stay in INR")
    transportation: float = Field(description="Allocated cap for intercity & local transit in INR")
    food_and_meals: float = Field(description="Allocated cap for dining and cafes in INR")
    activities_and_sightseeing: float = Field(description="Allocated cap for entry tickets & activities in INR")
    emergency_cushion: float = Field(description="Emergency reserve cushion in INR")
    per_day_limit: float = Field(description="Daily target spend limit in INR")
    per_person_limit: float = Field(description="Total per person spend limit in INR")
    budget_advice: str = Field(description="1-sentence strategic budget advice for this destination")

# Destination Cost Structure Matrix (Destination-Aware Tiering)
HIGH_COST_DESTINATIONS = {
    "dubai", "paris", "london", "new york", "tokyo", "singapore", "zurich", 
    "maldives", "switzerland", "amsterdam", "iceland", "san francisco", "sydney", "rome"
}

MID_COST_DESTINATIONS = {
    "goa", "kerala", "mumbai", "delhi", "bengaluru", "bali", "bangkok", 
    "phuket", "sri lanka", "vietnam", "pondicherry", "hyderabad"
}

def get_destination_cost_tier_info(destination: str, total_budget: float, duration: int, travelers: int) -> Dict[str, Any]:
    dest_lower = destination.lower().strip()
    
    if any(h in dest_lower for h in HIGH_COST_DESTINATIONS):
        tier = "High / Premium"
        alloc = {"stay": 0.45, "transport": 0.25, "food": 0.15, "activities": 0.10, "emergency": 0.05}
        min_daily_per_person = 6000.0
    elif any(m in dest_lower for m in MID_COST_DESTINATIONS):
        tier = "Mid-range"
        alloc = {"stay": 0.38, "transport": 0.22, "food": 0.22, "activities": 0.13, "emergency": 0.05}
        min_daily_per_person = 2500.0
    else:
        tier = "Budget-friendly"
        alloc = {"stay": 0.32, "transport": 0.20, "food": 0.25, "activities": 0.18, "emergency": 0.05}
        min_daily_per_person = 1500.0

    daily_per_person = total_budget / max(1, duration * travelers)
    is_tight = daily_per_person < min_daily_per_person
    
    if is_tight:
        advice = f"Notice: ₹{total_budget:,.0f} for {duration} days in {destination} (~₹{daily_per_person:,.0f}/day/person) is tight for a {tier} destination. High accommodation and transit costs require budget options or hostel stays."
    else:
        advice = f"Destination-tailored allocation for {destination} ({tier} cost tier) covering stay, local transit, dining, and curated experiences."
        
    return {
        "tier": tier,
        "alloc": alloc,
        "daily_per_person": daily_per_person,
        "is_tight": is_tight,
        "advice": advice
    }

async def budget_agent_node(state: Dict[str, Any]) -> Dict[str, Any]:
    destination = state.get("destination", "Manali")
    total_budget = float(state.get("budget", 30000.0))
    duration = int(state.get("duration", 5))
    travelers = int(state.get("travelers", 2))
    travel_style = state.get("travel_style", "Adventure")

    tier_info = get_destination_cost_tier_info(destination, total_budget, duration, travelers)
    api_key = os.getenv("GEMINI_API_KEY", "")
    budget_output = None

    if api_key:
        try:
            llm = get_llm(temperature=0.2, max_retries=1, request_timeout=12)
            if llm:
                structured_llm = llm.with_structured_output(BudgetAllocationModel)

            prompt = f"""
System Role: You are the Budget Allocation Agent in WanderWave's Agentic AI Trip Planner.
Your job is to dynamically analyze total budget and cost tiers to allocate realistic expense caps for ANY trip worldwide.

Trip Parameters:
- Destination: {destination}
- Total Budget: INR {total_budget:,.0f}
- Duration: {duration} Days
- Travelers: {travelers} People
- Travel Style: {travel_style}
- Destination Cost Context: Benchmark cost tier is '{tier_info['tier']}'. Est. daily spend per person: INR {tier_info['daily_per_person']:,.0f}.

Instructions:
1. Determine if {destination} is High/Premium, Mid-range, or Budget cost tier.
2. If total budget is tight relative to real-world costs of {destination} (e.g., ₹20,000 for Dubai), highlight this clearly in budget_advice.
3. Allocate total budget across 5 categories summing up to total_budget:
   - accommodation_stay (~32-45% depending on city cost index)
   - transportation (~20-25%)
   - food_and_meals (~15-25%)
   - activities_and_sightseeing (~10-18%)
   - emergency_cushion (~5%)
4. Provide per_day_limit and per_person_limit.
5. Give 1-sentence strategic destination-aware budget advice.
            """
            budget_output = await structured_llm.ainvoke(prompt)
        except Exception as e:
            print(f"[BudgetAgent Warning] Gemini LLM call error: {e}. Utilizing destination-aware fallback allocator.")

    if not budget_output:
        alloc = tier_info["alloc"]
        stay_cap = round(total_budget * alloc["stay"], 2)
        transport_cap = round(total_budget * alloc["transport"], 2)
        meals_cap = round(total_budget * alloc["food"], 2)
        activities_cap = round(total_budget * alloc["activities"], 2)
        emergency_cap = round(total_budget * alloc["emergency"], 2)

        breakdown = {
            "destination_cost_tier": tier_info["tier"],
            "accommodation_stay": stay_cap,
            "transportation": transport_cap,
            "food_and_meals": meals_cap,
            "activities_and_sightseeing": activities_cap,
            "emergency_cushion": emergency_cap,
            "per_day_limit": round(total_budget / max(1, duration), 2),
            "per_person_limit": round(total_budget / max(1, travelers), 2),
            "total_budget": total_budget,
            "budget_advice": tier_info["advice"]
        }
    else:
        breakdown = budget_output.model_dump()
        breakdown["total_budget"] = total_budget

    log_entry = {
        "agent": "Budget Allocation Agent (LLM Dynamic Allocator)",
        "status": "SUCCESS",
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
        "details": f"Allocated INR {total_budget:,.0f} for {destination} ({breakdown.get('destination_cost_tier', 'Mid-range')}) -> Stay: ₹{breakdown.get('accommodation_stay', 0):,.0f}, Transport: ₹{breakdown.get('transportation', 0):,.0f}, Meals: ₹{breakdown.get('food_and_meals', 0):,.0f}, Activities: ₹{breakdown.get('activities_and_sightseeing', 0):,.0f}."
    }

    existing_logs = state.get("agent_logs", [])
    return {
        "budget_breakdown": breakdown,
        "total_estimated_cost": total_budget * 0.92,
        "agent_logs": existing_logs + [log_entry]
    }
