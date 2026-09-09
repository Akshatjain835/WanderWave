from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from app.graph.state import TripState
from app.graph.nodes.requirement_agent import requirement_agent_node
from app.graph.nodes.research_agents import research_agents_node
from app.graph.nodes.travel_intelligence_agent import travel_intelligence_agent_node
from app.graph.nodes.budget_agent import budget_agent_node
from app.graph.nodes.planner_agent import planner_agent_node
from app.graph.nodes.hitl_agent import human_clarification_node
from app.graph.nodes.validator_agent import validator_agent_node

import os

# LangGraph Checkpointer Strategy: Supports RedisSaver in production and MemorySaver in dev
def get_checkpointer():
    """
    Initializes state checkpointer for LangGraph state graph.
    If REDIS_URL is configured, connects to Redis for durable persistent thread checkpointing.
    Otherwise, gracefully falls back to MemorySaver for fast, zero-dependency in-memory state tracking.
    """
    redis_url = os.getenv("REDIS_URL", "").strip()
    if redis_url:
        if "upstash.io" in redis_url and redis_url.startswith("redis://"):
            redis_url = redis_url.replace("redis://", "rediss://", 1)

        try:
            try:
                from langgraph.checkpoint.redis.aio import AsyncRedisSaver
                checkpointer = AsyncRedisSaver.from_conn_info(url=redis_url)
                print(f"[Workflow Notice] Successfully connected to Async Upstash Cloud Redis Checkpointer for WanderWave.")
                return checkpointer
            except Exception:
                from redis import Redis
                from langgraph.checkpoint.redis import RedisSaver
                conn = Redis.from_url(redis_url)
                checkpointer = RedisSaver(conn)
                print(f"[Workflow Notice] Successfully connected to Upstash Cloud Redis Checkpointer for WanderWave.")
                return checkpointer
        except Exception as e:
            print(f"[Workflow Warning] Using MemorySaver checkpointer (Async Redis upgrade available): {e}")
            return MemorySaver()

    return MemorySaver()

memory_checkpointer = get_checkpointer()

def route_after_requirement(state: TripState) -> str:
    """
    Conditional Router:
    If destination is missing/unknown, budget is missing/invalid (<=0), or requires_human_input flag is True,
    pause and route to Human-in-the-Loop clarification node.
    """
    destination = state.get("destination", "")
    budget = float(state.get("budget", 0))
    if (
        state.get("requires_human_input")
        or not destination
        or destination.lower() in ["unknown", "visit", "trip", "place", ""]
        or budget <= 0
    ):
        return "human_clarification_node"
    return "research_agents"

def route_after_validation(state: TripState) -> str:
    """
    Conditional Router (Cyclic Re-Planning Loop):
    - If Valid -> END
    - If Invalid & retries < 3 -> Route back to planner_agent (Re-Planner Loop)
    - If Invalid & retries >= 3 -> Route to human_clarification_node (HITL)
    """
    passed = state.get("validation_passed", True)
    retries = state.get("retry_count", 0)

    if passed:
        return "END"
    elif retries < 3:
        return "planner_agent"
    else:
        return "human_clarification_node"

def build_trip_graph():
    workflow = StateGraph(TripState)
    
    # Add Nodes
    workflow.add_node("requirement_agent", requirement_agent_node)
    workflow.add_node("human_clarification_node", human_clarification_node)
    workflow.add_node("research_agents", research_agents_node)
    workflow.add_node("travel_intelligence_agent", travel_intelligence_agent_node)
    workflow.add_node("budget_agent", budget_agent_node)
    workflow.add_node("planner_agent", planner_agent_node)
    workflow.add_node("validator_agent", validator_agent_node)

    # Wire Edges
    workflow.add_edge(START, "requirement_agent")
    
    # Conditional edge after Requirement Analysis
    workflow.add_conditional_edges(
        "requirement_agent",
        route_after_requirement,
        {
            "human_clarification_node": "human_clarification_node",
            "research_agents": "research_agents"
        }
    )

    # When human clarification resumes, it routes to research_agents to continue full graph execution
    workflow.add_edge("human_clarification_node", "research_agents")
    workflow.add_edge("research_agents", "travel_intelligence_agent")
    workflow.add_edge("travel_intelligence_agent", "budget_agent")
    workflow.add_edge("budget_agent", "planner_agent")
    workflow.add_edge("planner_agent", "validator_agent")

    # Conditional edge after Validator (Cyclic Re-Planning Loop)
    workflow.add_conditional_edges(
        "validator_agent",
        route_after_validation,
        {
            "END": END,
            "planner_agent": "planner_agent",
            "human_clarification_node": "human_clarification_node"
        }
    )

    # Compile with MemorySaver Checkpointer
    return workflow.compile(checkpointer=memory_checkpointer)

trip_graph_app = build_trip_graph()

async def run_requirement_analysis(
    user_request: str,
    user_long_term_preferences: dict = None,
    initial_destination: str = None,
    initial_budget: float = None,
    initial_duration: int = None,
    initial_travelers: int = None,
    initial_starting_city: str = None,
    initial_travel_style: str = None,
    must_visit_places: list = None,
    requires_hitl: bool = False,
    thread_id: str = "default_session"
):
    initial_state = {
        "user_request": user_request,
        "user_long_term_preferences": user_long_term_preferences or {},
        "destination": initial_destination,
        "budget": initial_budget,
        "duration": initial_duration,
        "travelers": initial_travelers,
        "starting_city": initial_starting_city,
        "travel_style": initial_travel_style,
        "must_visit_places": must_visit_places or [],
        "requires_human_input": requires_hitl,
        "retry_count": 0
    }
    config = {"configurable": {"thread_id": thread_id}}
    try:
        final_state = await trip_graph_app.ainvoke(initial_state, config=config)

        snapshot = trip_graph_app.get_state(config)
        int_val = {}

        if snapshot and hasattr(snapshot, "tasks") and snapshot.tasks:
            for task in snapshot.tasks:
                if hasattr(task, "interrupts") and task.interrupts:
                    for intr in task.interrupts:
                        val = getattr(intr, "value", None)
                        if isinstance(val, dict):
                            int_val.update(val)

        if isinstance(final_state, dict) and "__interrupt__" in final_state and final_state["__interrupt__"]:
            for intr_item in final_state["__interrupt__"]:
                val = getattr(intr_item, "value", None)
                if isinstance(val, dict):
                    int_val.update(val)

        is_paused = bool(int_val) or (snapshot and snapshot.next and "human_clarification_node" in snapshot.next)
        if is_paused:
            return {
                **final_state,
                **int_val,
                "requires_human_input": True,
                "itinerary": None
            }

        return final_state
    except Exception as e:
        if e.__class__.__name__ == "GraphInterrupt" or "GraphInterrupt" in str(type(e)):
            try:
                int_val = {}
                snapshot = trip_graph_app.get_state(config)
                values = dict(snapshot.values) if snapshot and snapshot.values else {}
                if snapshot and hasattr(snapshot, "tasks") and snapshot.tasks:
                    for task in snapshot.tasks:
                        if hasattr(task, "interrupts") and task.interrupts:
                            for intr in task.interrupts:
                                val = getattr(intr, "value", None)
                                if isinstance(val, dict):
                                    int_val.update(val)
                return {**values, **int_val, "requires_human_input": True, "itinerary": None}
            except Exception as err:
                print("[Workflow GraphInterrupt Handler Notice]", err)
                pass
        raise e


async def resume_requirement_analysis(resume_data: dict, thread_id: str = "default_session"):
    """
    Resumes a paused thread checkpoint using native LangGraph Command(resume=...).
    """
    from langgraph.types import Command
    config = {"configurable": {"thread_id": thread_id}}
    if isinstance(resume_data, str):
        resume_payload = {"destination": resume_data}
    else:
        resume_payload = dict(resume_data or {})

    dest = resume_payload.get("destination") or "Goa"
    budget = float(resume_payload.get("budget") or 30000.0)

    try:
        final_state = await trip_graph_app.ainvoke(Command(resume=resume_payload), config=config)
        return final_state
    except Exception as e:
        if e.__class__.__name__ == "GraphInterrupt" or "GraphInterrupt" in str(type(e)):
            snapshot = trip_graph_app.get_state(config)
            values = dict(snapshot.values) if snapshot and snapshot.values else {}
            return {**values, "requires_human_input": True, "itinerary": None}
        resumed_prompt = f"Plan a trip to {dest} under {budget}"
        return await run_requirement_analysis(resumed_prompt, thread_id=thread_id)


