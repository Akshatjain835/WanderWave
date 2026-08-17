# 🌊 WanderWave — Autonomous Agentic AI Trip Planner

> **Production-grade multi-agent travel orchestration engine built with LangGraph, Qdrant Vector RAG, Python FastAPI, Node.js/Express, and React.**

---

## 🌐 Live Production Deployment

- **Frontend Application (Vercel)**: [https://wanderwave-6f1jlyuj7-akshats-projects-19b508c8.vercel.app](https://wanderwave-6f1jlyuj7-akshats-projects-19b508c8.vercel.app)
- **Backend REST API (Render)**: [https://wanderwave-1-5xti.onrender.com](https://wanderwave-1-5xti.onrender.com)
- **AI Microservice (Render)**: [https://wanderwave-d26y.onrender.com](https://wanderwave-d26y.onrender.com)

---

## 🏛️ System Architecture

WanderWave uses a 3-tier microservice architecture to decouple user state management, REST API routing, and multi-agent LLM graph orchestration:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      React + Vite + Tailwind CSS                        │
│                 (Interactive DAG Visualizer & Timeline UI)             │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP / REST
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Node.js / Express REST Backend                      │
│            (Auth, Currency Microservice, MongoDB Persistence)           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Async HTTP JSON API
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  Python FastAPI + LangGraph Engine                      │
│              (MemorySaver Checkpointer & Thread Sessions)               │
│                                                                         │
│  Requirement Agent ➔ Research Agent ➔ Travel Intelligence Agent        │
│                                                   ↓                     │
│  Validator Agent ◄── Re-plan Loop ◄── Planner Agent ◄── Budget Agent   │
└────────────┬──────────────────────┬──────────────────────┬──────────────┘
             │                      │                      │
             ▼                      ▼                      ▼
    ┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
    │ Qdrant Vector  │    │  Open-Meteo      │    │  Google Gemini  │
    │ DB (RAG)       │    │  Live Weather    │    │  3.6 Flash LLM  │
    └────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🔥 Key Technical Highlights

### 1. 🧠 LangGraph Directed Acyclic Graph (DAG) State Machine
Built on **LangGraph TripState** with **MemorySaver Thread Checkpointing**:
- **Requirement Agent**: Parses unstructured user prompts into type-safe Pydantic parameters.
- **Human-in-the-Loop (HITL)**: Automatically interrupts graph execution if critical preferences (destination/budget) are missing.
- **Research Agent**: Queries **Qdrant Cloud Vector Database** for destination guidebooks alongside live **Open-Meteo weather API** forecasts.
- **Travel Intelligence Agent**: Calculates destination scores (Weather, Budget, Activity, Transport, Crowd comfort) and seasonal travel windows.
- **Budget Agent**: Partitions total budget across accommodation, transit, meals, activities, and emergency cushions.
- **Planner Agent**: Synthesizes structured day-by-day morning, afternoon, and evening timelines.
- **Validator Agent**: Decoupled problem detection node enforcing 4 strict validation rules (Budget overrun, rain outdoor safety, geographic redundancy, activity density).

### 2. ⚡ Decoupled Validator-Planner Cyclic Self-Correction
Unlike simplistic single-prompt LLM wrappers, WanderWave enforces a clean separation of concerns:
- **Validator Agent**: Evaluates draft itineraries strictly for constraint violations and returns structured feedback without mutating the state directly.
- **Planner Agent**: Consumes validator feedback during cyclic re-planning loops until `4/4 Checks Passed` is achieved.

### 3. 💵 Enterprise Currency Engine & Normalization Pipeline
- **Live Market API Integration**: Connects to live exchange rate feeds with an in-memory **1-Hour Cache TTL** and fallback safety rates (`INR`, `USD`, `EUR`, `GBP`, `JPY`, `AUD`, `CAD`, `SGD`, `AED`, `THB`).
- **Base Currency Normalization**: Converts foreign currencies to base INR for budget allocation before projecting back into the user's preferred display currency (`₹25,000 INR ≈ $298.50 USD`).

### 4. 🎛️ Partial Re-Planning & User Feedback Loop
Allows users to refine specific itinerary days on demand (e.g. *Cheaper budget*, *More adventurous*, *More relaxed cafes*, *Less travel*) via target state re-invocation.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend API**: Node.js, Express, Mongoose, MongoDB Atlas, Axios, CORS
- **AI Engine**: Python 3.10+, FastAPI, Uvicorn, LangGraph, LangChain, Pydantic v2
- **Vector Search (RAG)**: Qdrant Cloud Vector DB
- **LLM Provider**: Google Gemini 3.6 Flash
- **Telemetry & Tracing**: LangSmith Tracing V2

---

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
| **Express API** | `/api/trips/regenerate-day` | `POST` | Partial re-planning for a specific day |
| **Express API** | `/api/currency/rates` | `GET` | Fetch live cached exchange rates (1h TTL) |
| **FastAPI AI** | `/api/graph/analyze` | `POST` | LangGraph DAG execution entry point |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
