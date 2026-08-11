from langgraph.graph import StateGraph, START, END
from app.graph.state import TripState
from app.graph.nodes.requirement_agent import requirement_agent_node
from app.graph.nodes.research_agents import research_agents_node

def build_trip_graph():
    workflow = StateGraph(TripState)
    
    # Add Day 4 & Day 5 Nodes
    workflow.add_node("requirement_agent", requirement_agent_node)
    workflow.add_node("research_agents", research_agents_node)

    # Wire Day 4 & Day 5 Edges
    workflow.add_edge(START, "requirement_agent")
    workflow.add_edge("requirement_agent", "research_agents")
    workflow.add_edge("research_agents", END)

    return workflow.compile()

trip_graph_app = build_trip_graph()

async def run_requirement_analysis(user_request: str, user_long_term_preferences: dict = None):
    initial_state = {
        "user_request": user_request,
        "user_long_term_preferences": user_long_term_preferences or {}
    }
    final_state = await trip_graph_app.ainvoke(initial_state)
    return final_state
