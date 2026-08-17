import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  BrainCircuit,
  MapPin,
  CloudSun,
  DollarSign,
  Compass,
  ChevronDown,
  ChevronUp,
  Terminal,
  Cpu,
  ArrowDown,
  ArrowRight,
  Database,
  ShieldCheck,
  Zap,
  Check,
} from 'lucide-react';

export const AgentVisualizer = ({ activeStep, agentLogs, isComplete, requiresHumanInput }) => {
  const [showTechnicalTrace, setShowTechnicalTrace] = useState(false);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState('Research Agent');

  const nodes = [
    {
      id: 'requirement',
      stepId: 1,
      title: 'Requirement Agent',
      icon: BrainCircuit,
      status: activeStep > 1 || isComplete ? 'SUCCESS' : activeStep === 1 ? (requiresHumanInput ? 'HITL_PAUSED' : 'RUNNING') : 'PENDING',
      tools: ['Pydantic Struct Parser', 'Gemini 3.6 Flash'],
      retrieved: 'User Intent & Travel Style',
      execution: '0.42 sec',
      summary: 'Parsed destination, budget cap, travelers count & travel style',
    },
    {
      id: 'research',
      stepId: 2,
      title: 'Research Agent',
      icon: MapPin,
      status: activeStep > 2 || isComplete ? 'SUCCESS' : activeStep === 2 ? 'RUNNING' : 'PENDING',
      tools: ['Weather Tool (Open-Meteo)', 'Places Tool', 'Transport Tool', 'Qdrant RAG'],
      retrieved: '3 Vector Documents (Guidebooks)',
      execution: '1.82 sec',
      summary: 'Queried Qdrant Vector DB for local secrets & fetched live weather forecast',
    },
    {
      id: 'travel_intelligence',
      stepId: 3,
      title: 'Travel Intelligence Agent',
      icon: Zap,
      status: activeStep > 3 || isComplete ? 'SUCCESS' : activeStep === 3 ? 'RUNNING' : 'PENDING',
      tools: ['Destination Analytics Engine', 'Seasonal Scorer'],
      retrieved: 'Overall Score: 7.9/10 | Best Window: Oct - Mar',
      execution: '0.54 sec',
      summary: 'Calculated weather, budget, activity, transport & crowd comfort scores',
    },
    {
      id: 'budget',
      stepId: 3,
      title: 'Budget Agent',
      icon: DollarSign,
      status: activeStep > 3 || isComplete ? 'SUCCESS' : activeStep === 3 ? 'RUNNING' : 'PENDING',
      tools: ['Currency Microservice', 'Budget Allocator'],
      retrieved: 'Live Exchange Rates (USD/INR)',
      execution: '0.65 sec',
      summary: 'Allocated category caps for stay, transit, meals, activities & emergency cushion',
    },
    {
      id: 'planner',
      stepId: 4,
      title: 'Planner Agent',
      icon: Compass,
      status: activeStep > 4 || isComplete ? 'SUCCESS' : activeStep === 4 ? 'RUNNING' : 'PENDING',
      tools: ['Structured LLM Itinerary Synthesizer'],
      retrieved: 'Attraction Slots & Timelines',
      execution: '2.15 sec',
      summary: 'Generated day-by-day morning, afternoon & evening timeline slots',
    },
    {
      id: 'validator',
      stepId: 5,
      title: 'Validator Agent',
      icon: ShieldCheck,
      status: isComplete ? 'SUCCESS' : activeStep === 5 ? 'RUNNING' : 'PENDING',
      tools: ['4 Strict Rule Checks'],
      retrieved: '4/4 Validation Checks Passed',
      execution: '0.38 sec',
      summary: 'Evaluated budget cap, rain outdoor safety, geographic redundancy & density',
    },
  ];

  const currentNode = nodes.find((n) => n.id === selectedNodeDetails) || nodes[1];

  const calculateProgress = () => {
    if (isComplete) return 100;
    if (requiresHumanInput) return 20;
    return Math.min(95, Math.max(10, activeStep * 20));
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4 animate-in fade-in duration-200">
      {/* 1. User Feature Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>How WanderWave Planned Your Trip</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                {isComplete ? 'Itinerary Ready 100%' : requiresHumanInput ? 'HITL Input Needed' : 'LangGraph Execution...'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              LangGraph State Machine: Requirement ➔ Research ➔ Budget ➔ Planner ➔ Validator ✓
            </p>
          </div>
        </div>

        {/* Toggle Button for Interviewers & Engineers */}
        <button
          onClick={() => setShowTechnicalTrace(!showTechnicalTrace)}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-900/80 to-slate-900 hover:from-indigo-800 hover:to-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md"
        >
          <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>{showTechnicalTrace ? 'Hide Graph Architecture' : 'Inspect LangGraph DAG & Telemetry'}</span>
          {showTechnicalTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800/80">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${calculateProgress()}%` }}
        />
      </div>

      {/* 2. Interactive LangGraph Flowchart Diagram */}
      {showTechnicalTrace && (
        <div className="mt-4 p-6 rounded-3xl bg-slate-950 border border-cyan-500/30 space-y-6 animate-in fade-in duration-300 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
              <Terminal className="w-4 h-4" />
              <span>LangGraph Directed Acyclic Graph (DAG) State Machine</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Thread-Based MemorySaver Checkpointer
            </span>
          </div>

          {/* Visual Graph Architecture Tree */}
          <div className="py-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 font-mono text-xs overflow-x-auto space-y-4">
            {/* Top Root: Requirement Node */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setSelectedNodeDetails('Requirement Agent')}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-2 font-bold shadow-lg ${
                  activeStep === 1 && !isComplete
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/40 animate-pulse'
                    : 'bg-slate-900 border-slate-700 text-white hover:border-cyan-500/50'
                }`}
              >
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                <span>Requirement Agent</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Node 1</span>
              </button>

              {/* Conditional Edge Split: Missing Info? */}
              <div className="text-[10px] text-slate-400 my-1 flex flex-col items-center">
                <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
                <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-semibold text-[9px] text-slate-400">
                  Missing Info?
                </span>
              </div>

              {/* Split Branches: YES (HITL) vs NO (Research) */}
              <div className="grid grid-cols-2 gap-8 sm:gap-16 items-start my-1 relative">
                {/* Branch 1: HITL Clarification */}
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-[9px] text-amber-400 font-bold font-mono">YES ➔ Interrupt</span>
                  <div className={`p-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 ${
                    requiresHumanInput ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse' : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>HITL Clarification</span>
                  </div>
                </div>

                {/* Branch 2: Research Agent */}
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-[9px] text-emerald-400 font-bold font-mono">NO ➔ Continue</span>
                  <button
                    onClick={() => setSelectedNodeDetails('Research Agent')}
                    className={`p-3 rounded-2xl border transition-all flex items-center gap-2 font-bold shadow-lg ${
                      activeStep === 2 && !isComplete
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/40 animate-pulse'
                        : 'bg-slate-900 border-slate-700 text-white hover:border-cyan-500/50'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>Research Agent</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Node 2</span>
                  </button>
                </div>
              </div>

              <ArrowDown className="w-4 h-4 text-cyan-400/60 my-2" />

              {/* Main Downward Chain: Travel Intelligence ➔ Budget ➔ Planner ➔ Validator */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full flex-wrap">
                <button
                  onClick={() => setSelectedNodeDetails('Travel Intelligence Agent')}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-2 font-bold shadow-lg ${
                    activeStep === 3 && !isComplete
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/40 animate-pulse'
                      : 'bg-slate-900 border-slate-700 text-white hover:border-cyan-500/50'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Travel Intelligence Agent</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Node 3</span>
                </button>

                <span className="text-slate-600 font-bold hidden sm:inline">➔</span>

                <button
                  onClick={() => setSelectedNodeDetails('Budget Agent')}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-2 font-bold shadow-lg ${
                    activeStep === 4 && !isComplete
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/40 animate-pulse'
                      : 'bg-slate-900 border-slate-700 text-white hover:border-cyan-500/50'
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Budget Agent</span>
                </button>

                <span className="text-slate-600 font-bold">➔</span>

                <button
                  onClick={() => setSelectedNodeDetails('Planner Agent')}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-2 font-bold shadow-lg ${
                    activeStep === 4 && !isComplete
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/40 animate-pulse'
                      : 'bg-slate-900 border-slate-700 text-white hover:border-cyan-500/50'
                  }`}
                >
                  <Compass className="w-4 h-4 text-indigo-400" />
                  <span>Planner Agent</span>
                </button>

                <span className="text-slate-600 font-bold">➔</span>

                <button
                  onClick={() => setSelectedNodeDetails('Validator Agent')}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-2 font-bold shadow-lg ${
                    isComplete
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : activeStep === 5
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/40 animate-pulse'
                      : 'bg-slate-900 border-slate-700 text-white hover:border-cyan-500/50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Validator Agent</span>
                </button>
              </div>

              {/* Conditional Routing Branch: Valid vs Invalid */}
              <div className="text-[10px] text-slate-400 my-2 flex flex-col items-center">
                <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
                <div className="flex items-center gap-6 mt-1">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    VALID ➔ END ✓
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    INVALID ➔ Re-plan Loop 🔄
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Deep Node Inspection Panel for Selected Agent */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 bg-slate-900/90">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <currentNode.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">{currentNode.title} Telemetry</h4>
                  <p className="text-[10px] font-mono text-slate-400">{currentNode.summary}</p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold uppercase border ${
                currentNode.status === 'SUCCESS'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : currentNode.status === 'RUNNING'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}>
                {currentNode.status}
              </span>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Tools Executed</span>
                <div className="mt-1 space-y-1">
                  {currentNode.tools.map((t) => (
                    <p key={t} className="text-cyan-300 font-semibold flex items-center gap-1 text-[11px]">
                      <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" /> {t}
                    </p>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Retrieved Data</span>
                <p className="text-emerald-400 font-extrabold text-xs mt-1">{currentNode.retrieved}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Execution Time</span>
                <p className="text-cyan-300 font-extrabold text-xs mt-1">{currentNode.execution}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">LLM Model & Tokens</span>
                <p className="text-indigo-300 font-extrabold text-xs mt-1">Gemini 3.6 Flash (~420 tokens)</p>
              </div>
            </div>
          </div>

          {/* 4. Real-Time Telemetry Logs */}
          {agentLogs && agentLogs.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                Real-Time Node Telemetry Logs ({agentLogs.length} events recorded)
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[11px]">
                {agentLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-cyan-400 font-bold">[{log.timestamp}]</span>
                    <span className="text-white font-bold truncate mx-2">{log.agent}:</span>
                    <span className="text-slate-300 text-[10px] truncate flex-1">{log.details}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
