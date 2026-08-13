import React from 'react';
import {
  BrainCircuit,
  Compass,
  DollarSign,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Database,
} from 'lucide-react';

export const AgentVisualizer = ({ activeStep, agentLogs, isComplete, requiresHumanInput }) => {
  const steps = [
    {
      id: 1,
      name: 'Requirement Analyzer',
      icon: BrainCircuit,
      description: 'Parsing trip prompt, budget cap & traveler count',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
    {
      id: 2,
      name: 'Research & RAG Vector DB',
      icon: Database,
      description: 'Querying weather API, transit options & Qdrant Cloud guidebooks',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      id: 3,
      name: 'Budget Allocation Agent',
      icon: DollarSign,
      description: 'Partitioning stay (35%), transit (25%), meals (20%), activities (15%)',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      id: 4,
      name: 'Itinerary Planner Agent',
      icon: Compass,
      description: 'Synthesizing non-repeating morning, afternoon & evening activity slots',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
    {
      id: 5,
      name: 'ValidatorAgent (4 Checks)',
      icon: ShieldCheck,
      description: 'Enforcing budget cap, rain weather rules, geographic sanity & density',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
  ];

  const getStepStatus = (stepId) => {
    if (requiresHumanInput && stepId === 1) return 'paused';
    if (isComplete) return 'done';
    if (activeStep > stepId) return 'done';
    if (activeStep === stepId) return 'active';
    return 'pending';
  };

  const calculateProgress = () => {
    if (isComplete) return 100;
    if (requiresHumanInput) return 20;
    return Math.min(95, Math.max(10, activeStep * 20));
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 animate-in fade-in duration-200">
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>LangGraph Multi-Agent Execution Visualizer</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                {isComplete ? 'Execution Complete 100%' : requiresHumanInput ? 'Paused (HITL)' : 'Agents Active'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live status feed tracking autonomous agent nodes across state execution.
            </p>
          </div>
        </div>

        {/* Progress Metric */}
        <div className="text-right flex-shrink-0">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Pipeline Progress</span>
          <p className="text-sm font-extrabold text-cyan-400">{calculateProgress()}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800/80">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${calculateProgress()}%` }}
        ></div>
      </div>

      {/* 5-Step Node Visualizer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-2xl border transition-all relative ${
                status === 'done'
                  ? 'bg-slate-900/90 border-emerald-500/30'
                  : status === 'active'
                  ? `${step.bg} ${step.border} shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30`
                  : status === 'paused'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-slate-950/60 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`p-2 rounded-xl ${step.bg} ${step.color}`}>
                  <Icon className="w-4 h-4" />
                </span>
                {status === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {status === 'active' && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />}
                {status === 'paused' && <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />}
              </div>

              <h4 className="text-xs font-bold text-white line-clamp-1">{step.name}</h4>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Live Agent Logs Stream */}
      {agentLogs && agentLogs.length > 0 && (
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-900 pb-2">
            <span>Live Node Event Stream</span>
            <span className="text-cyan-400 font-bold">{agentLogs.length} Events Received</span>
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto scrollbar-thin text-xs">
            {agentLogs.map((log, idx) => (
              <div key={idx} className="flex items-start justify-between text-[11px] font-mono gap-2">
                <span className="text-cyan-400 flex-shrink-0">[{log.timestamp}]</span>
                <span className="text-slate-300 font-semibold flex-1">{log.agent}:</span>
                <span className="text-slate-400 truncate">{log.details}</span>
                <span
                  className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    log.status === 'PAUSED_FOR_HUMAN_INPUT'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
