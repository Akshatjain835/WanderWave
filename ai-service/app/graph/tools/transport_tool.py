from typing import Dict, Any, List

def get_transport_estimates(origin: str, destination: str, duration: int, travelers: int) -> List[Dict[str, Any]]:
    """
    Estimates realistic travel transit modes, durations, and roundtrip costs per traveler.
    """
    orig_clean = (origin or "Delhi").title()
    dest_clean = (destination or "Manali").title()

    options = []

    # Option 1: Bus / Volvo AC Sleeper
    options.append({
        "mode": "Volvo AC Sleeper Bus",
        "roundtrip_cost_per_person": 2400.0,
        "total_roundtrip_cost": 2400.0 * travelers,
        "travel_time_hours": 12.0,
        "comfort_rating": "4.2/5",
        "recommended_for": ["Budget", "Adventure", "Overnight"]
    })

    # Option 2: Private Taxi / Cab Rental
    options.append({
        "mode": "Private SUV / Sedan Cab",
        "roundtrip_cost_per_person": 4500.0,
        "total_roundtrip_cost": 4500.0 * travelers,
        "travel_time_hours": 10.0,
        "comfort_rating": "4.7/5",
        "recommended_for": ["Relaxed", "Luxury", "Families"]
    })

    # Option 3: Flight + Local Shuttle
    options.append({
        "mode": "Flight + Airport Shuttle Taxi",
        "roundtrip_cost_per_person": 7500.0,
        "total_roundtrip_cost": 7500.0 * travelers,
        "travel_time_hours": 4.5,
        "comfort_rating": "4.8/5",
        "recommended_for": ["Fast Transit", "Luxury"]
    })

    return options
