import asyncio
from app.graph.nodes.planner_agent import planner_agent_node
from app.graph.tools.places_tool import get_places_and_attractions

async def test_unique_itinerary():
    print("--- Testing Places Tool for Goa ---")
    places = get_places_and_attractions("Goa", ["Beaches", "Sightseeing"], "Relaxed")
    print(f"Found {len(places)} places for Goa:")
    for i, p in enumerate(places, 1):
        print(f"  {i}. {p['name']}")

    print("\n--- Testing Planner Agent Node for 4-Day Goa Trip ---")
    mock_state = {
        "destination": "Goa",
        "starting_city": "Delhi",
        "duration": 4,
        "travelers": 2,
        "budget": 25000,
        "travel_style": "Relaxed",
        "interests": ["Beaches", "Cafes"],
        "places_found": places,
        "weather_forecast": {"forecast_days": [{"condition": "Sunny & Clear", "temp_max_c": 28} for _ in range(4)]},
        "budget_breakdown": {"accommodation_stay": 8000, "transportation": 5000, "food_and_meals": 4000, "activities_and_sightseeing": 5000}
    }

    result = await planner_agent_node(mock_state)
    itinerary = result["itinerary"]
    print(f"\nTrip Title: {itinerary['trip_title']}")
    
    seen_locations = set()
    has_duplicates = False
    
    for day in itinerary["days"]:
        print(f"\n--- {day['title']} ({day['weather_snippet']}) ---")
        for slot_name in ["morning", "afternoon", "evening"]:
            slot = day[slot_name]
            loc = slot["location"]
            if loc in seen_locations:
                print(f"  ⚠️ DUPLICATE DETECTED: {loc}")
                has_duplicates = True
            else:
                seen_locations.add(loc)
            print(f"  [{slot['time']}] {slot['activity']} @ {loc} (₹{slot['estimated_cost_inr']})")

    if not has_duplicates:
        print("\n✅ PERFECT SUCCESS! Every day has 100% distinct, unique attractions with zero repeating places!")
    else:
        print("\n❌ FAILED: Duplicate places found.")

if __name__ == "__main__":
    asyncio.run(test_unique_itinerary())
