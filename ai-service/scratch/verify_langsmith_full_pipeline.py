import os
import asyncio
from dotenv import load_dotenv
from langsmith import Client

load_dotenv()

async def run_and_verify_langsmith():
    print("=== Running Full Pipeline & Verifying LangSmith Tracing ===")
    
    project = os.getenv("LANGCHAIN_PROJECT", "WanderWave")
    api_key = os.getenv("LANGCHAIN_API_KEY")

    print(f"LANGCHAIN_PROJECT: {project}")
    print(f"LANGCHAIN_TRACING_V2: {os.getenv('LANGCHAIN_TRACING_V2')}")
    
    if not api_key:
        print("[ERROR] LANGCHAIN_API_KEY is missing.")
        return

    # Step 1: Run the full LangGraph Trip Graph
    from app.graph.workflow import run_requirement_analysis
    print("\n[1/2] Invoking LangGraph Multi-Agent Trip Planner for Mysore...")
    final_state = await run_requirement_analysis(
        user_request="Plan a 4 day trip to Mysore from Bangalore under 20000 with heritage and food",
        thread_id="langsmith_audit_session"
    )

    print(f"[SUCCESS] Trip Synthesized: '{final_state.get('itinerary', {}).get('trip_title')}'")
    print(f"Validation Passed: {final_state.get('validation_passed')}")
    print(f"Executed Agent Nodes Logged: {len(final_state.get('agent_logs', []))}")

    # Step 2: Query LangSmith API for latest traced runs
    print("\n[2/2] Querying LangSmith API for recent traced runs...")
    client = Client()
    runs = list(client.list_runs(project_name=project, limit=6))

    print(f"[SUCCESS] Connected to LangSmith Project '{project}'!")
    print(f"Total Traced Runs Retrieved: {len(runs)}")

    for i, r in enumerate(runs, 1):
        print(f"\n--- LangSmith Trace #{i} ---")
        print(f"Run ID    : {r.id}")
        print(f"Run Name  : {r.name}")
        print(f"Run Type  : {r.run_type}")
        print(f"Status    : {r.status}")
        print(f"Start Time: {r.start_time}")
        if r.extra and "metadata" in r.extra:
            node = r.extra["metadata"].get("langgraph_node", "N/A")
            step = r.extra["metadata"].get("langgraph_step", "N/A")
            print(f"Node Info : node={node}, step={step}")

if __name__ == "__main__":
    asyncio.run(run_and_verify_langsmith())
