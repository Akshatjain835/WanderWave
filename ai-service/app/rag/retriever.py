from typing import List, Dict, Any
from app.rag.ingestion import get_qdrant_client, generate_embedding, COLLECTION_NAME

def retrieve_hyperlocal_knowledge(destination: str, query: str = "") -> List[Dict[str, Any]]:
    """
    RAG Retriever Tool:
    Queries Qdrant Cloud Vector Database for hyper-local guidebooks, hidden spots, and safety tips.
    """
    try:
        client = get_qdrant_client()
        search_str = f"{destination} {query}".strip()
        query_vector = generate_embedding(search_str)

        # Compatible with all qdrant-client versions
        if hasattr(client, 'query_points'):
            search_results = client.query_points(
                collection_name=COLLECTION_NAME,
                query=query_vector,
                limit=3
            ).points
        else:
            search_results = client.search(
                collection_name=COLLECTION_NAME,
                query_vector=query_vector,
                limit=3
            )

        matched_tips = []
        for res in search_results:
            payload = res.payload or {}
            matched_tips.append({
                "destination": payload.get("destination", destination),
                "category": payload.get("category", "Local Guidebook"),
                "title": payload.get("title", f"{destination} Insider Spot"),
                "content": payload.get("content", ""),
                "score": round(res.score, 3) if hasattr(res, 'score') else 0.95,
                "is_fallback": False,
                "source": "Qdrant_Vector_DB"
            })

        if matched_tips:
            return matched_tips

        # If vector DB query returned no points, provide explicit notice
        print(f"[RAG Retriever Notice] No Qdrant matches found for '{destination}'. Using labeled fallback.")
        return [
            {
                "destination": destination,
                "category": "General Guide (Fallback)",
                "title": f"Local Exploration Walk in {destination}",
                "content": f"Explore historic streets, local markets, and popular eateries in {destination}.",
                "score": 0.50,
                "is_fallback": True,
                "source": "RAG_UNAVAILABLE"
            }
        ]
    except Exception as e:
        print(f"[RAG Retriever Warning] Qdrant Cloud search unavailable: {e}. Returning explicit fallback.")
        return [
            {
                "destination": destination,
                "category": "General Guide (Fallback)",
                "title": f"Local Exploration Walk in {destination}",
                "content": f"Explore historic streets, local markets, and popular eateries in {destination}.",
                "score": 0.50,
                "is_fallback": True,
                "source": "RAG_UNAVAILABLE"
            }
        ]

if __name__ == "__main__":
    tips = retrieve_hyperlocal_knowledge("Mysore", "food spots")
    print(f"RAG Retrieved Tips for Mysore: {tips}")
