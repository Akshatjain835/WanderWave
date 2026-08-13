from typing import TypedDict, List, Dict, Any, Optional

class TripState(TypedDict, total=False):
    # User Inputs & Derived Query (Day 4)
    user_id: Optional[str]
    user_request: str
    destination: str
    starting_city: str
    duration: int
    budget: float
    travelers: int
    interests: List[str]
    travel_style: str
    missing_fields: List[str]

    # Injected User Preferences Memory
    user_long_term_preferences: Dict[str, Any]

    # Agent Research Outputs (Day 5)
    places_found: List[Dict[str, Any]]
    weather_forecast: Dict[str, Any]
    transport_options: List[Dict[str, Any]]

    # Budget Allocation (Day 6)
    budget_breakdown: Dict[str, Any]
    total_estimated_cost: float

    # Generated Day-by-Day Itinerary (Day 7)
    itinerary: Dict[str, Any]

    # Human-in-the-Loop Interruption State (Day 8)
    requires_human_input: bool
    human_prompt_options: List[Dict[str, Any]]
    clarification_prompt: str
    user_decision: Optional[str]

    # Cyclic Re-Planning & Validation State (Day 10)
    validation_passed: bool
    validation_issues: List[str]
    validation_feedback: str
    retry_count: int

    # Execution Trace Logs
    agent_logs: List[Dict[str, Any]]
