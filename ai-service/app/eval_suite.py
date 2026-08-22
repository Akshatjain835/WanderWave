import asyncio
import time
import datetime
from typing import List, Dict, Any
from app.graph.workflow import run_requirement_analysis

TEST_SCENARIOS = [
    {
        "name": "Scenario 1: Standard Manali Adventure Trip",
        "prompt": "Plan a 5 day adventure trip to Manali from Delhi under 30000 INR for 2 people with trekking and cafes",
        "expected_dest": "Manali",
        "expected_duration": 5,
        "max_budget": 30000.0
    },
    {
        "name": "Scenario 2: Goa Beach & Relaxed Trip",
        "prompt": "Plan a 4 day relaxed beach trip to Goa from Mumbai under 25000 for 2 people with water sports and cafes",
        "expected_dest": "Goa",
        "expected_duration": 4,
        "max_budget": 25000.0
    },
    {
        "name": "Scenario 3: Jaipur Cultural Tour",
        "prompt": "Plan a 3 day heritage sightseeing tour to Jaipur from Delhi under 20000 for 2 travelers",
        "expected_dest": "Jaipur",
        "expected_duration": 3,
        "max_budget": 20000.0
    },
    {
        "name": "Scenario 4: Rishikesh Rafting & Yoga Trip",
        "prompt": "Plan a 3 day spiritual adventure trip to Rishikesh from Delhi under 15000 INR for 2 people",
        "expected_dest": "Rishikesh",
        "expected_duration": 3,
        "max_budget": 15000.0
    },
    {
        "name": "Scenario 5: High-Budget Udaipur Luxury Weekend",
        "prompt": "Plan a 3 day luxury palace tour to Udaipur from Mumbai under 60000 for 2 travelers",
        "expected_dest": "Udaipur",
        "expected_duration": 3,
        "max_budget": 60000.0
    }
]

import sys

# Configure UTF-8 encoding for Windows console compatibility
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

TEST_SCENARIOS = [
    {
        "name": "Scenario 1: Standard Manali Adventure Trip",
        "prompt": "Plan a 5 day adventure trip to Manali from Delhi under 30000 INR for 2 people with trekking and cafes",
        "expected_dest": "Manali",
        "expected_duration": 5,
        "max_budget": 30000.0
    },
    {
        "name": "Scenario 2: Goa Beach & Relaxed Trip",
        "prompt": "Plan a 4 day relaxed beach trip to Goa from Mumbai under 25000 for 2 people with water sports and cafes",
        "expected_dest": "Goa",
        "expected_duration": 4,
        "max_budget": 25000.0
    },
    {
        "name": "Scenario 3: Jaipur Cultural Tour",
        "prompt": "Plan a 3 day heritage sightseeing tour to Jaipur from Delhi under 20000 for 2 travelers",
        "expected_dest": "Jaipur",
        "expected_duration": 3,
        "max_budget": 20000.0
    },
    {
        "name": "Scenario 4: Rishikesh Rafting & Yoga Trip",
        "prompt": "Plan a 3 day spiritual adventure trip to Rishikesh from Delhi under 15000 INR for 2 people",
        "expected_dest": "Rishikesh",
        "expected_duration": 3,
        "max_budget": 15000.0
    },
    {
        "name": "Scenario 5: High-Budget Udaipur Luxury Weekend",
        "prompt": "Plan a 3 day luxury palace tour to Udaipur from Mumbai under 60000 for 2 travelers",
        "expected_dest": "Udaipur",
        "expected_duration": 3,
        "max_budget": 60000.0
    }
]

async def run_evaluation_suite():
    print("=" * 80)
    print("[EVAL] WANDERWAVE LANGGRAPH MULTI-AGENT EVALUATION SUITE")
    print(f"Timestamp: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

    results: List[Dict[str, Any]] = []

    for idx, test in enumerate(TEST_SCENARIOS, 1):
        print(f"\n[Evaluating {idx}/{len(TEST_SCENARIOS)}] {test['name']}")
        start_time = time.time()
        
        try:
            state = await run_requirement_analysis(
                user_request=test["prompt"],
                user_long_term_preferences={"travelStyle": "Adventure"},
                thread_id=f"eval_thread_{idx}_{int(time.time())}"
            )
            elapsed_sec = round(time.time() - start_time, 2)

            parsed_dest = state.get("destination", "")
            dest_correct = (parsed_dest.lower() == test["expected_dest"].lower())
            
            itinerary = state.get("itinerary", {})
            total_cost = float(itinerary.get("estimated_total_cost_inr", 0.0))
            budget_compliant = (total_cost <= test["max_budget"] * 1.05)

            validation_passed = state.get("validation_passed", False)
            retry_count = state.get("retry_count", 0)
            validation_summary = state.get("validation_summary", {})
            passed_checks = validation_summary.get("passed_count", 0)
            total_checks = validation_summary.get("total_checks", 6)

            metrics = {
                "scenario": test["name"],
                "destination_extracted": parsed_dest,
                "dest_accuracy": dest_correct,
                "duration_days": state.get("duration"),
                "budget_cap": test["max_budget"],
                "estimated_cost": total_cost,
                "budget_compliant": budget_compliant,
                "validation_passed": validation_passed,
                "passed_checks_ratio": f"{passed_checks}/{total_checks}",
                "retry_count": retry_count,
                "latency_sec": elapsed_sec
            }
            results.append(metrics)

            status_symbol = "[PASS]" if validation_passed and budget_compliant else "[WARN]"
            print(f"  {status_symbol} | Latency: {elapsed_sec}s | Retries: {retry_count} | Validation: {passed_checks}/{total_checks} Checks | Cost: INR {total_cost:,.0f} / Cap: INR {test['max_budget']:,.0f}")
        
        except Exception as e:
            print(f"  [FAIL] Execution error in scenario {idx}: {e}")
            results.append({
                "scenario": test["name"],
                "error": str(e),
                "validation_passed": False,
                "latency_sec": round(time.time() - start_time, 2)
            })

    # Summary Benchmark Calculations
    total_runs = len(results)
    successful_runs = sum(1 for r in results if r.get("validation_passed", False))
    dest_accuracy_count = sum(1 for r in results if r.get("dest_accuracy", False))
    budget_compliant_count = sum(1 for r in results if r.get("budget_compliant", False))
    avg_latency = round(sum(r.get("latency_sec", 0) for r in results) / max(1, total_runs), 2)
    avg_retries = round(sum(r.get("retry_count", 0) for r in results) / max(1, total_runs), 2)

    print("\n" + "=" * 80)
    print("[REPORT] WANDERWAVE AGENT EVALUATION BENCHMARK REPORT")
    print("=" * 80)
    print(f"Total Test Scenarios Evaluated   : {total_runs}")
    print(f"Requirement Extraction Accuracy : {dest_accuracy_count}/{total_runs} ({dest_accuracy_count/total_runs*100:.1f}%)")
    print(f"Budget Cap Compliance Rate      : {budget_compliant_count}/{total_runs} ({budget_compliant_count/total_runs*100:.1f}%)")
    print(f"Validation Overall Success Rate  : {successful_runs}/{total_runs} ({successful_runs/total_runs*100:.1f}%)")
    print(f"Average Cyclic Re-plan Retries   : {avg_retries} iterations")
    print(f"Average End-to-End Latency      : {avg_latency} seconds")
    print("=" * 80)

    return {
        "total_scenarios": total_runs,
        "success_rate": round(successful_runs / max(1, total_runs), 2),
        "budget_compliance_rate": round(budget_compliant_count / max(1, total_runs), 2),
        "average_latency_sec": avg_latency,
        "average_retries": avg_retries,
        "detailed_results": results
    }

if __name__ == "__main__":
    asyncio.run(run_evaluation_suite())
