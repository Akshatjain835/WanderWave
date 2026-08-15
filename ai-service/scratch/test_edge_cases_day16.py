import asyncio
from dotenv import load_dotenv
from app.graph.workflow import run_requirement_analysis
from app.graph.nodes.validator_agent import validator_agent_node
from app.graph.nodes.hitl_agent import human_clarification_node

load_dotenv()

async def test_edge_cases():
    print("=== Testing Day 16 Edge Cases & Error Resilience ===")

    # Edge Case 1: Rainy Forecast Outdoor Replacement
    print("\n--- Edge Case 1: High Rain Forecast Outdoor Violation Check ---")
    rain_state = {
        "destination": "Goa",
        "budget": 25000,
        "weather_forecast": {
            "forecast_days": [
                {"day": 1, "condition": "Heavy Monsoonal Rain", "rain_probability_pct": 90, "suitable_for_outdoors": False},
                {"day": 2, "condition": "Sunny & Clear", "rain_probability_pct": 10, "suitable_for_outdoors": True}
            ]
        },
        "itinerary": {
            "estimated_total_cost_inr": 22000,
            "days": [
                {
                    "day_number": 1,
                    "title": "Day 1 Rain Test",
                    "morning": {"activity": "Beach Trekking & Outdoor Swimming", "location": "Palolem Beach"},
                    "afternoon": {"activity": "Fontainhas Latin Quarter Walking Tour", "location": "Fontainhas"},
                    "evening": {"activity": "Sunset Beach Shack Seafood", "location": "Baga Beach"}
                }
            ]
        },
        "retry_count": 0
    }
    validated_rain = await validator_agent_node(rain_state)
    issues_clean = [str(i).replace('\u20b9', 'Rs.') for i in validated_rain.get('validation_issues', [])]
    print(f"Validation Passed: {validated_rain.get('validation_passed')}")
    print(f"Validation Issues Detected: {issues_clean}")

    # Edge Case 2: Micro Budget Exceeded Interruption
    print("\n--- Edge Case 2: Micro Budget Overrun HITL Interruption ---")
    micro_state = {
        "destination": "Manali",
        "budget": 5000,
        "validation_issues": ["Budget Violation: Estimated total cost (Rs.8,500) exceeds budget cap (Rs.5,000)"]
    }
    hitl_micro = await human_clarification_node(micro_state)
    prompt_str = hitl_micro.get('clarification_prompt', '').replace('\u20b9', 'Rs.')
    options_str = [o['label'].replace('\u20b9', 'Rs.') for o in hitl_micro.get('human_prompt_options', [])]
    print(f"Clarification Prompt: {prompt_str}")
    print(f"Options Offered: {options_str}")

    # Edge Case 3: Missing Destination
    print("\n--- Edge Case 3: Missing Destination Interruption ---")
    missing_dest_state = await run_requirement_analysis("I want to plan a trip for 4 days")
    print(f"Requires Human Input: {missing_dest_state.get('requires_human_input')}")
    print(f"Clarification Prompt: {missing_dest_state.get('clarification_prompt')}")
    print(f"Destination Choices: {[o['destination'] for o in missing_dest_state.get('human_prompt_options', []) if 'destination' in o]}")

if __name__ == "__main__":
    asyncio.run(test_edge_cases())
