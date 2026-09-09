import datetime
from typing import Dict, Any

try:
    from langgraph.types import interrupt
    from langgraph.errors import GraphInterrupt
except ImportError:
    interrupt = None
    GraphInterrupt = None

async def human_clarification_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Human-in-the-Loop (HITL) Interruption Node & State Persistence.
    Handles graph pauses using native LangGraph interrupt() for:
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

    if not destination or destination.lower() in ["unknown", "visit", "trip", "place", ""]:
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
        "agent": "Human-in-the-Loop Clarification Node",
        "status": "PAUSED_FOR_HUMAN_INPUT",
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
        "details": f"Paused graph execution via native interrupt(). State checkpointed with {len(options)} human choice options."
    }

    existing_logs = state.get("agent_logs", [])
    output_state = {
        **state,
        "requires_human_input": True,
        "human_prompt_options": options,
        "clarification_prompt": clarification_prompt,
        "agent_logs": existing_logs + [log_entry]
    }

    # Trigger native LangGraph interrupt if available
    if interrupt and callable(interrupt):
        resumed_val = interrupt(output_state)
        # When graph resumes, interrupt() returns the value passed in Command(resume=...)
        resumed_updates = {}
        if isinstance(resumed_val, dict):
            resumed_updates = resumed_val
        elif isinstance(resumed_val, str) and resumed_val:
            resumed_updates = {"destination": resumed_val}

        res_dest = resumed_updates.get("destination") or state.get("destination") or "Goa"
        res_budget = float(resumed_updates.get("budget") or state.get("budget") or 30000.0)

        resume_log = {
            "agent": "Human-in-the-Loop Node (Resumed)",
            "status": "RESUMED",
            "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
            "details": f"Resumed graph execution with human decision: Destination={res_dest}, Budget=INR {res_budget:,.0f}."
        }

        return {
            **state,
            **resumed_updates,
            "destination": res_dest,
            "budget": res_budget,
            "requires_human_input": False,
            "missing_fields": [],
            "agent_logs": state.get("agent_logs", []) + [resume_log]
        }

    return output_state




