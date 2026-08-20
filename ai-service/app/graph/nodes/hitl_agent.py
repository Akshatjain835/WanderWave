import datetime
from typing import Dict, Any, List

async def human_clarification_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Human-in-the-Loop (HITL) Interruption Node & State Persistence.
    Handles graph pauses for:
    1. Unspecified Destination
    2. Unspecified Budget / Target Tier
    3. Budget Exceeded Overrun (Option A: Lower hotel tier / Option B: Increase budget)
    4. Travel Style Clarification
    """
    user_request = state.get("user_request", "")
    destination = state.get("destination", "")
    budget = float(state.get("budget", 0))
    missing_fields = state.get("missing_fields", [])
    validation_issues = state.get("validation_issues", [])

    options = []
    has_budget_overrun = any("Budget Violation" in issue for issue in validation_issues)

    if not destination or destination.lower() in ["unknown", "visit", "trip", ""]:
        options = [
            {"id": "opt_goa", "label": "Goa Beach Getaway 🏖️", "destination": "Goa", "budget": 25000, "duration": 4},
            {"id": "opt_manali", "label": "Manali Alpine Trek 🏔️", "destination": "Manali", "budget": 30000, "duration": 5},
            {"id": "opt_jaipur", "label": "Jaipur Royal Heritage 🏛️", "destination": "Jaipur", "budget": 20000, "duration": 3},
            {"id": "opt_dubai", "label": "Dubai Luxury & Desert Safari 🐪", "destination": "Dubai", "budget": 80000, "duration": 5},
        ]
        clarification_prompt = "Your trip destination wasn't specified. Please select a popular destination below to proceed:"
    elif has_budget_overrun:
        exceeded_amt = 3500
        options = [
            {"id": "opt_lower_tier", "label": f"Option A: Lower hotel tier (₹{max(10000, int(budget - exceeded_amt)):,}) 🏨", "budget": max(10000, budget - exceeded_amt), "travelStyle": "Budget"},
            {"id": "opt_increase_budget", "label": f"Option B: Increase budget cap (₹{int(budget + exceeded_amt):,}) 💎", "budget": budget + exceeded_amt, "travelStyle": "Balanced"},
        ]
        clarification_prompt = f"Budget exceeded by ₹{exceeded_amt:,} for {destination}. Please select your resolution preference:"
    elif not budget or budget <= 0:
        options = [
            {"id": "opt_b1", "label": "Budget Friendly (₹15,000) 🎒", "budget": 15000},
            {"id": "opt_b2", "label": "Balanced Standard (₹35,000) 🏨", "budget": 35000},
            {"id": "opt_b3", "label": "Premium Comfort (₹75,000) 💎", "budget": 75000},
        ]
        clarification_prompt = f"Please select your target budget tier for your trip to {destination}:"
    else:
        options = [
            {"id": "opt_adv", "label": "Adventure & Exploration 🏔️", "travelStyle": "Adventure"},
            {"id": "opt_rel", "label": "Relaxed & Scenic 🏖️", "travelStyle": "Relaxed"},
            {"id": "opt_cul", "label": "Cultural & Foodie 🏛️", "travelStyle": "Cultural"},
        ]
        clarification_prompt = f"Clarification needed: Choose your preferred travel style for {destination}:"

    log_entry = {
        "agent": "Human-in-the-Loop Clarification Node (Checkpointer Interruption)",
        "status": "PAUSED_FOR_HUMAN_INPUT",
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
        "details": f"Paused graph execution. State checkpointed. Offered {len(options)} interactive human choices."
    }

    existing_logs = state.get("agent_logs", [])
    return {
        "requires_human_input": True,
        "human_prompt_options": options,
        "clarification_prompt": clarification_prompt,
        "agent_logs": existing_logs + [log_entry]
    }
