import asyncio
import time
import datetime
from typing import List, Dict, Any
from app.graph.workflow import run_requirement_analysis

TEST_SCENARIOS = [
    {"name": "Scenario 01: Manali Adventure Trip", "prompt": "Plan a 5 day adventure trip to Manali from Delhi under 30000 INR for 2 people with trekking and cafes", "expected_dest": "Manali", "expected_duration": 5, "max_budget": 30000.0},
    {"name": "Scenario 02: Goa Beach & Relaxed Trip", "prompt": "Plan a 4 day relaxed beach trip to Goa from Mumbai under 25000 for 2 people with water sports and cafes", "expected_dest": "Goa", "expected_duration": 4, "max_budget": 25000.0},
    {"name": "Scenario 03: Jaipur Cultural Sightseeing", "prompt": "Plan a 3 day heritage sightseeing tour to Jaipur from Delhi under 20000 for 2 travelers", "expected_dest": "Jaipur", "expected_duration": 3, "max_budget": 20000.0},
    {"name": "Scenario 04: Rishikesh Rafting & Yoga", "prompt": "Plan a 3 day spiritual adventure trip to Rishikesh from Delhi under 15000 INR for 2 people", "expected_dest": "Rishikesh", "expected_duration": 3, "max_budget": 15000.0},
    {"name": "Scenario 05: Udaipur Luxury Palace Weekend", "prompt": "Plan a 3 day luxury palace tour to Udaipur from Mumbai under 60000 for 2 travelers", "expected_dest": "Udaipur", "expected_duration": 3, "max_budget": 60000.0},
    {"name": "Scenario 06: Tokyo Tech & Food Odyssey", "prompt": "Plan a 5 day futuristic tech and food tour to Tokyo from Delhi under 150000 INR for 2 travelers", "expected_dest": "Tokyo", "expected_duration": 5, "max_budget": 150000.0},
    {"name": "Scenario 07: Paris Art & Romantic Escape", "prompt": "Plan a 4 day art and museum tour to Paris from Mumbai under 180000 INR for 2 people", "expected_dest": "Paris", "expected_duration": 4, "max_budget": 180000.0},
    {"name": "Scenario 08: Dubai Luxury Desert Safari", "prompt": "Plan a 4 day shopping and desert safari trip to Dubai from Delhi under 90000 INR for 2 travelers", "expected_dest": "Dubai", "expected_duration": 4, "max_budget": 90000.0},
    {"name": "Scenario 09: London Historic Landmarks Tour", "prompt": "Plan a 5 day royal heritage tour to London from Delhi under 200000 INR for 2 people", "expected_dest": "London", "expected_duration": 5, "max_budget": 200000.0},
    {"name": "Scenario 10: Sydney Coastal & Harbour Trip", "prompt": "Plan a 6 day harbour and beach trip to Sydney from Mumbai under 220000 INR for 2 travelers", "expected_dest": "Sydney", "expected_duration": 6, "max_budget": 220000.0},
    {"name": "Scenario 11: Kerala Houseboat & Backwaters", "prompt": "Plan a 4 day houseboat cruise to Kerala from Bengaluru under 35000 for 2 people", "expected_dest": "Kerala", "expected_duration": 4, "max_budget": 35000.0},
    {"name": "Scenario 12: Shimla Mountain Retreat", "prompt": "Plan a 3 day hill station trip to Shimla from Chandigarh under 18000 for 2 travelers", "expected_dest": "Shimla", "expected_duration": 3, "max_budget": 18000.0},
    {"name": "Scenario 13: Varanasi Spiritual Heritage Walk", "prompt": "Plan a 3 day ghat and temple tour to Varanasi from Delhi under 16000 for 2 travelers", "expected_dest": "Varanasi", "expected_duration": 3, "max_budget": 16000.0},
    {"name": "Scenario 14: Ooty Tea Garden Expedition", "prompt": "Plan a 4 day nature and tea estate trip to Ooty from Chennai under 22000 for 2 people", "expected_dest": "Ooty", "expected_duration": 4, "max_budget": 22000.0},
    {"name": "Scenario 15: Agra Taj Mahal Weekend", "prompt": "Plan a 2 day monument heritage tour to Agra from Delhi under 12000 for 2 travelers", "expected_dest": "Agra", "expected_duration": 2, "max_budget": 12000.0},
    {"name": "Scenario 16: Singapore Family Fun Tour", "prompt": "Plan a 4 day attractions tour to Singapore from Delhi under 120000 INR for 2 people", "expected_dest": "Singapore", "expected_duration": 4, "max_budget": 120000.0},
    {"name": "Scenario 17: Bangkok Street Food Trail", "prompt": "Plan a 4 day culinary and temple tour to Bangkok from Mumbai under 65000 for 2 travelers", "expected_dest": "Bangkok", "expected_duration": 4, "max_budget": 65000.0},
    {"name": "Scenario 18: Rome Colosseum History Exploration", "prompt": "Plan a 4 day ancient architecture tour to Rome from Delhi under 160000 for 2 travelers", "expected_dest": "Rome", "expected_duration": 4, "max_budget": 160000.0},
    {"name": "Scenario 19: Barcelona Tapas & Architecture", "prompt": "Plan a 5 day beach and architecture trip to Barcelona from Mumbai under 175000 for 2 travelers", "expected_dest": "Barcelona", "expected_duration": 5, "max_budget": 175000.0},
    {"name": "Scenario 20: New York Broadway & Skyline", "prompt": "Plan a 5 day museum and skyline trip to New York from Delhi under 250000 INR for 2 people", "expected_dest": "New York", "expected_duration": 5, "max_budget": 250000.0},
    {"name": "Scenario 21: Bali Waterfall & Wellness Retreat", "prompt": "Plan a 5 day tropical wellness trip to Bali from Bengaluru under 85000 INR for 2 travelers", "expected_dest": "Bali", "expected_duration": 5, "max_budget": 85000.0},
    {"name": "Scenario 22: Kathmandu Himalayan Heritage", "prompt": "Plan a 4 day temple and valley trek to Kathmandu from Delhi under 35000 for 2 people", "expected_dest": "Kathmandu", "expected_duration": 4, "max_budget": 35000.0},
    {"name": "Scenario 23: Munich Bavarian Culture Tour", "prompt": "Plan a 4 day castle and cultural trip to Munich from Delhi under 170000 INR for 2 people", "expected_dest": "Munich", "expected_duration": 4, "max_budget": 170000.0},
    {"name": "Scenario 24: Cairo Pyramids & Nile Expedition", "prompt": "Plan a 5 day historic monuments tour to Cairo from Mumbai under 140000 for 2 travelers", "expected_dest": "Cairo", "expected_duration": 5, "max_budget": 140000.0},
    {"name": "Scenario 25: Zurich Swiss Alps Scenic Getaway", "prompt": "Plan a 4 day alpine lake tour to Zurich from Delhi under 210000 INR for 2 travelers", "expected_dest": "Zurich", "expected_duration": 4, "max_budget": 210000.0},
    {"name": "Scenario 26: Reykjavik Geyser & Aurora Adventure", "prompt": "Plan a 4 day volcano and geyser trip to Reykjavik from Mumbai under 195000 for 2 people", "expected_dest": "Reykjavik", "expected_duration": 4, "max_budget": 195000.0},
    {"name": "Scenario 27: Seoul Palace & K-Culture Expedition", "prompt": "Plan a 5 day food and palace trip to Seoul from Delhi under 135000 for 2 travelers", "expected_dest": "Seoul", "expected_duration": 5, "max_budget": 135000.0},
    {"name": "Scenario 28: Cape Town Coastal & Safari Trip", "prompt": "Plan a 5 day coastal and wildlife safari to Cape Town from Mumbai under 190000 for 2 travelers", "expected_dest": "Cape Town", "expected_duration": 5, "max_budget": 190000.0},
    {"name": "Scenario 29: Amsterdam Canal Bike Tour", "prompt": "Plan a 4 day canal and museum bike tour to Amsterdam from Delhi under 165000 for 2 people", "expected_dest": "Amsterdam", "expected_duration": 4, "max_budget": 165000.0},
    {"name": "Scenario 30: Toronto CN Tower & Niagara Excursion", "prompt": "Plan a 4 day city and waterfall tour to Toronto from Mumbai under 205000 for 2 travelers", "expected_dest": "Toronto", "expected_duration": 4, "max_budget": 205000.0}
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

    # Save evaluation benchmark report markdown file
    eval_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "evaluation")
    os.makedirs(eval_dir, exist_ok=True)
    report_file = os.path.join(eval_dir, "benchmark_report.md")

    with open(report_file, "w", encoding="utf-8") as f:
        f.write("# WanderWave Automated Agent Evaluation Benchmark Report\n\n")
        f.write(f"**Generated:** {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  \n")
        f.write(f"**Total Scenarios Evaluated:** {total_runs}  \n\n")
        f.write("## 📊 Summary Benchmark Metrics\n\n")
        f.write(f"- **Requirement Extraction Accuracy:** {dest_accuracy_count}/{total_runs} ({dest_accuracy_count/total_runs*100:.1f}%)\n")
        f.write(f"- **Budget Cap Compliance Rate:** {budget_compliant_count}/{total_runs} ({budget_compliant_count/total_runs*100:.1f}%)\n")
        f.write(f"- **Deterministic Validation Pass Rate:** {successful_runs}/{total_runs} ({successful_runs/total_runs*100:.1f}%)\n")
        f.write(f"- **Average Re-plan Retries:** {avg_retries} iterations\n")
        f.write(f"- **Average End-to-End Latency:** {avg_latency} seconds\n\n")

    print(f"[REPORT] Benchmark report written to: {report_file}")

    return {
        "total_scenarios": total_runs,
        "success_rate": round(successful_runs / max(1, total_runs), 2),
        "budget_compliance_rate": round(budget_compliant_count / max(1, total_runs), 2),
        "average_latency_sec": avg_latency,
        "average_retries": avg_retries,
        "detailed_results": results
    }

if __name__ == "__main__":
    import os
    asyncio.run(run_evaluation_suite())
