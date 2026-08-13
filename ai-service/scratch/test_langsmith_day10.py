import os
import asyncio
from dotenv import load_dotenv
from langsmith import Client

load_dotenv()

async def check_langsmith():
    print("=== Checking LangSmith Tracing for WanderWave ===")
    
    api_key = os.getenv("LANGCHAIN_API_KEY")
    project = os.getenv("LANGCHAIN_PROJECT", "WanderWave")
    tracing = os.getenv("LANGCHAIN_TRACING_V2")

    print(f"LANGCHAIN_TRACING_V2: {tracing}")
    print(f"LANGCHAIN_PROJECT: {project}")
    print(f"LANGCHAIN_API_KEY present: {bool(api_key)}")

    if not api_key:
        print("[ERROR] LANGCHAIN_API_KEY is not set.")
        return

    try:
        client = Client()
        runs = list(client.list_runs(project_name=project, limit=5))
        print(f"\n[SUCCESS] Connected to LangSmith project '{project}'!")
        print(f"Total Traced Runs Retrieved: {len(runs)}")

        for i, run in enumerate(runs, 1):
            print(f"\n--- Run #{i} ---")
            print(f"ID: {run.id}")
            print(f"Name: {run.name}")
            print(f"Run Type: {run.run_type}")
            print(f"Status: {run.status}")
            print(f"Start Time: {run.start_time}")
            print(f"Total Tokens / Metadata: {run.extra or {}}")
    except Exception as e:
        print(f"[ERROR] LangSmith Client error: {e}")

if __name__ == "__main__":
    asyncio.run(check_langsmith())
