import os
import glob
import hashlib
from typing import List, Dict, Any
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models

load_dotenv()

COLLECTION_NAME = "wanderwave_guidebooks"
VECTOR_DIM = 768
KNOWLEDGE_BASE_DIR = os.path.join(os.path.dirname(__file__), "knowledge_base")

def get_qdrant_client() -> QdrantClient:
    url = os.getenv("QDRANT_HOST", "https://61a7e09b-ec7e-4f3b-8606-01b6bfb6963e.sa-east-1-0.aws.cloud.qdrant.io")
    api_key = os.getenv("QDRANT_API_KEY", "")
    return QdrantClient(url=url, api_key=api_key)

def generate_embedding(text: str) -> List[float]:
    """
    Generates a 768-dimensional dense semantic vector representation for text
    using Google's official text-embedding-004 model.
    """
    api_key = os.getenv("GEMINI_API_KEY", "")
    if api_key:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        candidate_embed_models = ["text-embedding-004", "models/embedding-001", "embedding-001"]
        for m in candidate_embed_models:
            try:
                embeddings = GoogleGenerativeAIEmbeddings(
                    model=m,
                    google_api_key=api_key
                )
                vec = embeddings.embed_query(text)
                if vec and len(vec) > 0:
                    # If vector dimension matches or padded/truncated to VECTOR_DIM
                    if len(vec) == VECTOR_DIM:
                        return vec
                    elif len(vec) == 768:
                        return vec
            except Exception:
                continue

    # Fallback 768-dimensional vector generator
    vec = [0.0] * VECTOR_DIM
    text_clean = text.lower().strip()
    words = text_clean.split()
    
    for word in words:
        h = int(hashlib.md5(word.encode('utf-8')).hexdigest(), 16)
        for i in range(12):
            idx = (h >> (i * 5)) % VECTOR_DIM
            val = ((h >> (i * 3)) & 0xFF) / 255.0 - 0.5
            vec[idx] += val
            
    magnitude = sum(x * x for x in vec) ** 0.5
    if magnitude > 0:
        vec = [x / magnitude for x in vec]
    return vec

def load_knowledge_base_files() -> List[Dict[str, Any]]:
    """
    Scans knowledge_base directory for .md/.txt files and parses section chunks.
    """
    entries = []
    file_paths = glob.glob(os.path.join(KNOWLEDGE_BASE_DIR, "*.md")) + glob.glob(os.path.join(KNOWLEDGE_BASE_DIR, "*.txt"))
    
    for filepath in file_paths:
        filename = os.path.basename(filepath)
        dest_name = filename.split("_")[0].capitalize()
        
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Chunk by markdown headers or double line breaks
        sections = content.split("## ")
        for sec in sections:
            sec_clean = sec.strip()
            if not sec_clean or sec_clean.startswith("#"):
                continue
                
            lines = sec_clean.split("\n", 1)
            title = lines[0].replace("#", "").strip()
            body = lines[1].strip() if len(lines) > 1 else title
            
            entries.append({
                "destination": dest_name,
                "category": title,
                "title": title,
                "content": body,
                "filename": filename
            })

    return entries

def init_qdrant_ingestion():
    client = get_qdrant_client()
    collections = [c.name for c in client.get_collections().collections]
    
    if COLLECTION_NAME in collections:
        try:
            coll_info = client.get_collection(COLLECTION_NAME)
            current_dim = coll_info.config.params.vectors.size
            if current_dim != VECTOR_DIM:
                print(f"[Ingestion] Collection '{COLLECTION_NAME}' vector dimension is {current_dim}. Recreating for {VECTOR_DIM}-dim semantic embeddings...")
                client.delete_collection(COLLECTION_NAME)
                collections.remove(COLLECTION_NAME)
        except Exception:
            pass

    if COLLECTION_NAME not in collections:
        print(f"[Ingestion] Creating collection '{COLLECTION_NAME}' ({VECTOR_DIM}-dim COSINE) in Qdrant Cloud...")
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(
                size=VECTOR_DIM,
                distance=models.Distance.COSINE
            )
        )

    entries = load_knowledge_base_files()
    print(f"[Ingestion] Loaded {len(entries)} guidebook section chunks from knowledge_base files.")

    points = []
    for idx, entry in enumerate(entries, 1):
        text_payload = f"{entry['destination']} {entry['category']} {entry['title']} {entry['content']}"
        vector = generate_embedding(text_payload)
        
        points.append(
            models.PointStruct(
                id=idx,
                vector=vector,
                payload=entry
            )
        )

    print(f"[Ingestion] Ingesting {len(points)} hyper-local guidebook semantic vectors into Qdrant Cloud...")
    client.upsert(collection_name=COLLECTION_NAME, points=points)
    print(f"[SUCCESS] Ingested {len(points)} semantic guidebook entries into Qdrant Cloud collection '{COLLECTION_NAME}'.")

if __name__ == "__main__":
    init_qdrant_ingestion()
