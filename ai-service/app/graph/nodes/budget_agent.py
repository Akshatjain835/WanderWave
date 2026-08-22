import os
import datetime
from typing import Dict, Any
from pydantic import BaseModel, Field
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

async def budget_agent_node(state: Dict[str, Any]) -> Dict[str, Any]:
    destination = state.get("destination", "Manali")
    total_budget = float(state.get("budget", 30000.0))
    duration = int(state.get("duration", 5))
    travelers = int(state.get("travelers", 2))
    travel_style = state.get("travel_style", "Adventure")

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

Instructions:
1. Determine if {destination} is High/Premium, Mid-range, or Budget cost tier.
2. Allocate the total budget across 5 categories summing up to total_budget:
   - accommodation_stay (~35%)
   - transportation (~25%)
   - food_and_meals (~20%)
   - activities_and_sightseeing (~15%)
   - emergency_cushion (~5%)
3. Provide per_day_limit and per_person_limit.
4. Give 1-sentence strategic budget advice.
            """
            budget_output = await structured_llm.ainvoke(prompt)
        except Exception as e:
            print(f"[BudgetAgent Warning] Gemini LLM call error: {e}. Utilizing fallback allocator.")

    if not budget_output:
        stay_cap = round(total_budget * 0.35, 2)
        transport_cap = round(total_budget * 0.25, 2)
        meals_cap = round(total_budget * 0.20, 2)
        activities_cap = round(total_budget * 0.15, 2)
        emergency_cap = round(total_budget * 0.05, 2)

        breakdown = {
            "destination_cost_tier": "Mid-range",
            "accommodation_stay": stay_cap,
            "transportation": transport_cap,
            "food_and_meals": meals_cap,
            "activities_and_sightseeing": activities_cap,
            "emergency_cushion": emergency_cap,
            "per_day_limit": round(total_budget / max(1, duration), 2),
            "per_person_limit": round(total_budget / max(1, travelers), 2),
            "total_budget": total_budget,
            "budget_advice": f"Balanced budget allocation for {destination} over {duration} days."
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
