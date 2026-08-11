from typing import Dict, Any, List

def get_places_and_attractions(destination: str, interests: List[str], travel_style: str) -> List[Dict[str, Any]]:
    """
    Returns curated attractions and spots categorized by time of day.
    """
    dest_lower = (destination or "Manali").lower()

    if "manali" in dest_lower:
        return [
            {
                "name": "Solang Valley Adventure Zone",
                "category": "Adventure / Sightseeing",
                "best_time": "Morning",
                "estimated_cost_per_person": 1200.0,
                "description": "Zorbing, Paragliding, and scenic ropeway cable car rides with panoramic mountain views."
            },
            {
                "name": "Hadimba Temple & Dhungri Van Vihar",
                "category": "Cultural / Heritage",
                "best_time": "Morning",
                "estimated_cost_per_person": 100.0,
                "description": "Historical 1553 wooden pagoda temple nestled among towering Deodar pine forests."
            },
            {
                "name": "Jogini Waterfalls Hike",
                "category": "Trekking / Nature",
                "best_time": "Afternoon",
                "estimated_cost_per_person": 0.0,
                "description": "Scenic 3km nature trek from Vashisht village through apple orchards to cascading waterfalls."
            },
            {
                "name": "Old Manali Cafes (Cafe 1947 & Sunshine)",
                "category": "Cafes / Food",
                "best_time": "Afternoon",
                "estimated_cost_per_person": 600.0,
                "description": "Riverside cozy cafes serving wood-fired pizzas, trout fish, and artisanal Himalayan coffee."
            },
            {
                "name": "Mall Road & Himachal Handicraft Shopping",
                "category": "Shopping / Leisure",
                "best_time": "Evening",
                "estimated_cost_per_person": 500.0,
                "description": "Vibrant local market for Kullu shawls, wooden handicrafts, hot momos, and evening strolls."
            },
            {
                "name": "Atal Tunnel & Sissu Valley Day Excursion",
                "category": "Adventure / Day Trip",
                "best_time": "Morning-Afternoon",
                "estimated_cost_per_person": 1500.0,
                "description": "Drive through the world's longest highway tunnel above 10,000 ft into Lahaul Valley's Sissu waterfall."
            },
            {
                "name": "Vashisht Hot Water Springs & Baths",
                "category": "Relaxation / Wellness",
                "best_time": "Evening",
                "estimated_cost_per_person": 50.0,
                "description": "Natural sulfur hot springs renowned for therapeutic relaxation after trekking."
            }
        ]
    
    # Generic Fallback for other destinations
    return [
        {
            "name": f"Central Heritage & Historic Quarter in {destination}",
            "category": "Sightseeing",
            "best_time": "Morning",
            "estimated_cost_per_person": 300.0,
            "description": f"Explore famous landmark monuments and walking streets of {destination}."
        },
        {
            "name": f"Local Specialty Food & Cafe Street in {destination}",
            "category": "Cafes",
            "best_time": "Afternoon",
            "estimated_cost_per_person": 500.0,
            "description": f"Sample iconic culinary dishes and artisanal drinks in {destination}."
        },
        {
            "name": f"Sunset Viewpoint & Promenade in {destination}",
            "category": "Leisure",
            "best_time": "Evening",
            "estimated_cost_per_person": 200.0,
            "description": f"Catch breathtaking sunset views and evening street performances in {destination}."
        }
    ]
