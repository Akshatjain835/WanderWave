from langgraph.graph import StateGraph, START, END
from app.graph.state import TripState
from app.graph.nodes.requirement_agent import requirement_agent_node
from app.graph.nodes.research_agents import research_agents_node
from app.graph.nodes.budget_agent import budget_agent_node
from app.graph.nodes.planner_agent import planner_agent_node
from app.graph.nodes.hitl_agent import human_clarification_node
from app.graph.nodes.validator_agent import validator_agent_node

def route_after_requirement(state: TripState) -> str:
    """
    Day 8 Conditional Router:
    If destination is missing or requires_human_input flag is True, pause and route to Human-in-the-Loop clarification node.
    """
    destination = state.get("destination", "")
    if state.get("requires_human_input") or not destination or destination.lower() in ["unknown", "visit", "trip", ""]:
        return "human_clarification_node"
    return "research_agents"

def route_after_validation(state: TripState) -> str:
    """
    Day 10 Conditional Router (Cyclic Re-Planning Loop):
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
    workflow.add_node("budget_agent", budget_agent_node)
    workflow.add_node("planner_agent", planner_agent_node)
    workflow.add_node("validator_agent", validator_agent_node)

    # Wire Edges
    workflow.add_edge(START, "requirement_agent")
    
    # Conditional edge after Requirement Analysis (Day 8 HITL router)
    workflow.add_conditional_edges(
        "requirement_agent",
        route_after_requirement,
        {
            "human_clarification_node": "human_clarification_node",
            "research_agents": "research_agents"
        }
    )

    workflow.add_edge("human_clarification_node", END)
    workflow.add_edge("research_agents", "budget_agent")
    workflow.add_edge("budget_agent", "planner_agent")
    workflow.add_edge("planner_agent", "validator_agent")

    # Day 10 Conditional edge after Validator (Cyclic Re-Planning Loop)
    workflow.add_conditional_edges(
        "validator_agent",
        route_after_validation,
        {
            "END": END,
            "planner_agent": "planner_agent",
            "human_clarification_node": "human_clarification_node"
        }
    )

    return workflow.compile()

trip_graph_app = build_trip_graph()

async def run_requirement_analysis(user_request: str, user_long_term_preferences: dict = None, requires_hitl: bool = False):
    initial_state = {
        "user_request": user_request,
        "user_long_term_preferences": user_long_term_preferences or {},
        "requires_human_input": requires_hitl,
        "retry_count": 0
    }
    final_state = await trip_graph_app.ainvoke(initial_state)
    return final_state
