# 🌊 WanderWave — Autonomous Agentic AI Trip Planner

> **Production-deployed multi-agent travel orchestration platform built with LangGraph, Qdrant Vector RAG, Python FastAPI, Node.js/Express, and React.**

---

## 🌐 Live Production Deployment

- **Frontend Application (Vercel)**: [https://wanderwave-phi.vercel.app](https://wanderwave-phi.vercel.app)
- **Backend REST API (Render)**: [https://wanderwave-1-5xti.onrender.com](https://wanderwave-1-5xti.onrender.com)
- **AI Microservice (Render)**: [https://wanderwave-d26y.onrender.com](https://wanderwave-d26y.onrender.com)

---

## 🏛️ System Architecture

WanderWave uses a 3-tier microservice architecture to decouple user state management, REST API routing, and stateful multi-agent LLM graph orchestration:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      React + Vite + Tailwind CSS                        │
│             (Interactive AgentVisualizer & Itinerary Viewer)            │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP / REST
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              Node.js / Express API Gateway & Microservices              │
│       (JWT Auth, Currency Rates Microservice, MongoDB Persistence)      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Async HTTP JSON API
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│          Python FastAPI + LangGraph Sole AI Orchestration Engine        │
│       (Stateful Upstash Redis Checkpointer & Cyclic Multi-Agent)        │
│                                                                         │
│  Requirement Agent ➔ Research Agent ➔ Travel Intelligence Agent        │
│                                                   ↓                     │
│  Validator Agent ◄── Re-plan Loop ◄── Planner Agent ◄── Budget Agent   │
│       │                                                                 │
│       └── Native interrupt() HITL Node (Yields control to checkpointer) │
└────────────┬──────────────────────┬──────────────────────┬──────────────┘
             │                      │                      │
             ▼                      ▼                      ▼
    ┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
    │ Qdrant Vector  │    │ Dynamic Geodesic │    │  Google Gemini  │
    │ DB (768-dim)   │    │ Transport Engine │    │  Flash/Pro LLM  │
    └────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🔥 Key Technical Highlights

### 1. 🧠 LangGraph Stateful Multi-Agent Graph & Cyclic Workflow
Built on **LangGraph TripState** with durable thread checkpointing (`SqliteSaver` / `MemorySaver`):
- **Requirement Agent**: Parses raw user requests into type-safe Pydantic parameters using Gemini.
- **Human-in-the-Loop (HITL)**: Pauses graph execution and requests user decision if destination or budget details are missing.
- **Tool-First Research Agent**: Executes `weather_tool`, `transport_tool`, `places_tool`, and **Qdrant Cloud Vector DB RAG** *first* to gather empirical facts before LLM synthesis.
- **Travel Intelligence Agent**: Computes numerical destination scores (Weather, Budget, Activity, Transport, Crowd comfort) and seasonal travel windows.
- **Budget Allocation Agent**: Dynamically partitions budget into category caps (Stay ~35%, Transit ~25%, Meals ~20%, Activities ~15%, Cushion ~5%).
- **Planner Agent**: Generates structured day-by-day morning, afternoon, and evening timelines.
- **Validator Agent**: Decoupled problem detection node enforcing 6 strict deterministic validation rules (Budget overrun, category allocation caps, rain outdoor safety, geographic redundancy, activity density/time sequence, arrival/departure timing).

### 2. ⚡ Decoupled Validator-Planner Cyclic Self-Correction
Unlike basic single-prompt LLM wrappers, WanderWave implements an agentic feedback loop with retry limits:
- **Validator Agent**: Evaluates draft itineraries strictly against deterministic rules and returns structured error feedback without mutating state directly.
- **Planner Agent**: Consumes validator feedback during cyclic re-planning loops until all validation checks pass.

```
Planner Agent
     │
     ▼
Validator Agent ── PASS ──► END
     │
    FAIL (Retries < 3)
     │
     ▼
Planner Agent (Re-plans with Feedback)
```

### 3. 🎯 LLM-Driven Partial Re-Planning Agent
- Allows users to refine specific itinerary days on demand (e.g. *"Make Day 2 more adventurous"*, *"Find budget street food for Day 3"*) via a dedicated LLM partial re-planner node (`/api/graph/regenerate-day`) that regenerates only the requested day without resetting the rest of the trip.

### 4. 🧠 Google text-embedding-004 Semantic Vector RAG
- **Dense Semantic Embeddings**: Utilizes Google's official `text-embedding-004` model to convert hyper-local guidebooks into 768-dimensional dense semantic vectors stored in Qdrant Cloud.
- **Data Lineage Transparency**: Queries Qdrant Cloud Vector Database for hyper-local guidebooks and hidden spots. True vector matches carry `is_fallback: False` and `source: "Qdrant_Vector_DB"`, while unindexed queries explicitly carry `is_fallback: True` and `source: "RAG_UNAVAILABLE"`.

### 5. 🛠️ Fact-Grounded Tool Infrastructure & Worldwide Coverage
- **Transportation Estimation Tool**: Provides structured route fare estimates across flight, train, bus, and taxi options.
- **Places Data Tool**: Queries curated destination spots, complemented by Gemini LLM worldwide destination knowledge for international trips anywhere globally (e.g. Tokyo, Paris, London).
- **Live Market API Integration**: Connects to live exchange rate feeds with an in-memory **1-Hour Cache TTL** and base INR budget normalization.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend API**: Node.js, Express, Mongoose, MongoDB Atlas, Axios, CORS
- **AI Engine**: Python 3.10+, FastAPI, Uvicorn, LangGraph, LangChain, Pydantic v2
- **Vector Search (RAG)**: Qdrant Cloud Vector DB + Google `text-embedding-004` (768-dim)
- **LLM Provider**: Google Gemini Flash & Pro Models (`gemini-1.5-flash`, `gemini-1.5-pro`)
- **Telemetry & Tracing**: LangSmith Tracing V2
- **State Persistence**: Upstash Cloud Redis Checkpointer (`RedisSaver`) / `MemorySaver`

---

## 📊 Measured Empirical Agent Evaluation Benchmarks

WanderWave includes an automated benchmark suite (`app/eval_suite.py`) evaluating **30 representative trip queries** across domestic & international destinations (Goa, Manali, Jaipur, Tokyo, Paris, Dubai, London, Sydney, etc.):

| Benchmark Metric | Measured Result | Target Threshold | Status |
| :--- | :---: | :---: | :---: |
| **Requirement Extraction Accuracy** | **96.7%** | > 90% | PASS |
| **Budget Cap Compliance Rate** | **93.3%** | > 90% | PASS |
| **Deterministic Rule Validation Pass Rate** | **90.0%** | > 85% | PASS |
| **Tool Execution Success Rate** | **96.7%** | > 90% | PASS |
| **RAG Vector Retrieval Quality** | **93.3%** | > 85% | PASS |
| **Average Re-plan Retries** | **1.1 Iterations** | < 2.0 | OPTIMAL |
| **Average End-to-End Latency** | **13.5 Seconds** | < 20.0s | OPTIMAL |

---

## 🔍 LangSmith Tracing V2 & Observability

WanderWave logs all LangGraph multi-agent execution spans, tool calls, model prompts, and latency breakdown to **LangSmith**:

```
[LangGraph Execution Trace: Project 'WanderWave']
├─ requirement_agent (Gemini Flash) ────────── 1.2s  [Extraction: 100%]
├─ research_agents_node
│  ├─ tool: get_weather_forecast (Open-Meteo) ─ 0.4s  [Live Weather API]
│  ├─ tool: get_transport_estimates ─────────── 0.2s  [Route Distance Engine]
│  ├─ tool: get_places_and_attractions ──────── 0.3s  [Regional/LLM Places]
│  └─ RAG: retrieve_hyperlocal_knowledge ────── 0.5s  [Qdrant 768-dim Vectors]
├─ travel_intelligence_node ─────────────────── 1.1s  [Analytics Solver]
├─ budget_allocation_node ──────────────────── 0.8s  [Category Allocator]
├─ planner_agent_node ──────────────────────── 4.5s  [Day-by-Day Synthesis]
└─ validator_agent_node ─────────────────────── 0.1s  [6/6 Checks Passed]
```


## 💻 Local Installation & Setup

### Prerequisites
- Node.js `v18+`
- Python `v3.10+`
- MongoDB Instance (Local or Atlas)
- Gemini API Key

### 1. Clone Repository
```bash
git clone https://github.com/Akshatjain835/WanderWave.git
cd WanderWave
```

### 2. Start Python AI Microservice (`ai-service/`)
```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create .env file with your credentials
cp .env.example .env

# Run FastAPI Server
uvicorn app.main:app --reload --port 8000
```

### 3. Start Express Backend API (`server/`)
```bash
cd ../server
npm install

# Create .env file
cp .env.example .env

# Run Node Server
npm run dev
```

### 4. Start React Client (`client/`)
```bash
cd ../client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📜 API Endpoints Summary

| Service | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Express API** | `/api/auth/register` | `POST` | User registration & JWT generation |
| **Express API** | `/api/trips/analyze` | `POST` | Trigger full LangGraph trip analysis pipeline |
| **Express API** | `/api/trips/regenerate-day` | `POST` | LLM-driven partial re-planning for a specific day |
| **Express API** | `/api/currency/rates` | `GET` | Fetch live cached exchange rates (1h TTL) |
| **FastAPI AI** | `/api/graph/analyze` | `POST` | LangGraph multi-agent execution entry point |
| **FastAPI AI** | `/api/graph/regenerate-day` | `POST` | LLM partial re-planner agent node |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
