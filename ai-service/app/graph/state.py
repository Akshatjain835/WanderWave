from typing import TypedDict, List, Dict, Any, Optional

class TripState(TypedDict, total=False):
    # User Inputs & Derived Query
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

    # Human-in-the-Loop State
    requires_human_input: bool
    human_prompt_options: List[Dict[str, Any]]
    user_decision: Optional[str]

    # Execution Trace Logs
    agent_logs: List[Dict[str, Any]]
