import requests

def test_regenerate():
    payload = {
        "dayNumber": 2,
        "feedback": "More adventurous",
        "destination": "Goa",
        "budget": 25000,
        "currentItinerary": {
            "destination": "Goa",
            "days": [
                {
                    "day_number": 1,
                    "title": "Day 1: Arrival",
                    "morning": {"activity": "Hotel Check-in", "location": "Goa", "estimated_cost_inr": 100},
                    "afternoon": {"activity": "Lunch", "location": "Goa", "estimated_cost_inr": 200},
                    "evening": {"activity": "Beach Stroll", "location": "Goa", "estimated_cost_inr": 100},
                    "estimated_day_cost_inr": 400
                },
                {
                    "day_number": 2,
                    "title": "Day 2: Exploration",
                    "morning": {"activity": "Sightseeing", "location": "Goa", "estimated_cost_inr": 150},
                    "afternoon": {"activity": "Cafe", "location": "Goa", "estimated_cost_inr": 250},
                    "evening": {"activity": "Sunset", "location": "Goa", "estimated_cost_inr": 150},
                    "estimated_day_cost_inr": 550
                }
            ]
        }
    }

    print("--- Testing Python AI-Service :8000 /api/graph/regenerate-day ---")
    try:
        res_py = requests.post("http://localhost:8000/api/graph/regenerate-day", json=payload, timeout=5)
        print("Python Status:", res_py.status_code)
        print("Python Response:", res_py.json())
    except Exception as e:
        print("Python Error:", e)

    print("\n--- Testing Node Server :5000 /api/trips/regenerate-day ---")
    try:
        res_node = requests.post("http://localhost:5000/api/trips/regenerate-day", json=payload, timeout=5)
        print("Node Status:", res_node.status_code)
        print("Node Response:", res_node.json())
    except Exception as e:
        print("Node Error:", e)

if __name__ == "__main__":
    test_regenerate()
