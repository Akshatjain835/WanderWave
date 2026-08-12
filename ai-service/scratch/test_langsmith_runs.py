import asyncio
import os
import time
from dotenv import load_dotenv
load_dotenv()

from app.graph.workflow import run_requirement_analysis
from langsmith import Client
from langsmith.run_helpers import traceable

@traceable(name="Intentional_Error_Test_Node", run_type="chain", project_name="WanderWave")
def simulate_failed_chain():
    raise ValueError("Intentional simulated graph node failure for LangSmith error auditing test!")

async def main():
    print("=========================================================")
    print("LANGSMITH MONITORING AUDIT: RUNNING 5 TEST SCENARIOS")
    print("=========================================================\n")

    scenarios = [
        ("Run 1 (Goa)", "Plan a 3 day trip to Goa from Mumbai under 25000 for 2 people with beaches"),
        ("Run 2 (Ladakh)", "Plan a 7 day trip to Leh Ladakh from Delhi under 60000 for 4 people with motorbiking"),
        ("Run 3 (Kerala)", "Plan a 4 day trip to Kerala Backwaters from Bangalore under 35000 for 2 people with houseboat"),
        ("Run 4 (Dubai)", "Plan a 5 day trip to Dubai from Delhi under 80000 for 2 people with luxury shopping"),
    ]

    # 1. Successful Runs
    for label, prompt in scenarios:
        print(f"Executing {label}...")
        try:
            start_t = time.time()
            res = await run_requirement_analysis(prompt)
            duration = round(time.time() - start_t, 2)
            dest = res.get("destination", "Unknown")
            days_count = len(res.get("itinerary", {}).get("days", []))
            print(f"   [SUCCESS] Dest: {dest} | Days: {days_count} | Latency: {duration}s")
        except Exception as e:
            print(f"   [ERROR]: {e}")
        print()

    # 2. Intentional Failure Run 5
    print("Executing Run 5 (Intentional Failure Test)...")
    try:
        simulate_failed_chain()
    except Exception as err:
        print(f"   [INTENTIONAL FAILURE CAPTURED]: {err}")
    print()

    # 3. Query LangSmith Client for Recent Runs
    print("=========================================================")
    print("FETCHING RECENT TRACES FROM LANGSMITH DASHBOARD")
    print("=========================================================\n")

    client = Client()
    try:
        runs = list(client.list_runs(project_name="WanderWave", limit=10))
        print(f"Total Traces Found in LangSmith 'WanderWave': {len(runs)}\n")
        for i, r in enumerate(runs[:8], 1):
            status_symbol = "[SUCCESS]" if r.status == "success" else "[FAILED]" if r.status in ["error", "failed"] else f"[{r.status}]"
            end_t = r.end_time.strftime("%H:%M:%S") if r.end_time else "In-Progress"
            print(f"Trace #{i}: {status_symbol}")
            print(f"   Name: {r.name}")
            print(f"   Run ID: {r.id}")
            print(f"   Status: {r.status}")
            print(f"   Execution Time: {end_t}")
            print("-" * 55)
    except Exception as e:
        print(f"Error querying LangSmith runs: {e}")

if __name__ == "__main__":
    asyncio.run(main())
