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
} from 'lucide-react';

export const AgentVisualizer = ({ activeStep, agentLogs, isComplete, requiresHumanInput }) => {
  const [showTechnicalTrace, setShowTechnicalTrace] = useState(false);

  const steps = [
    {
      id: 1,
      name: 'Requirement',
      fullName: 'Understanding your preferences',
      icon: BrainCircuit,
      description: 'Parsing destination, duration, budget cap & traveler style',
    },
    {
      id: 2,
      name: 'Research',
      fullName: 'Finding places & local secrets',
      icon: MapPin,
      description: 'Discovering authentic attractions & Qdrant vector guidebooks',
    },
    {
      id: 3,
      name: 'Budget',
      fullName: 'Checking weather & transit',
      icon: CloudSun,
      description: 'Analyzing rain forecasts & travel options',
    },
    {
      id: 4,
      name: 'Planner',
      fullName: 'Optimizing your budget',
      icon: DollarSign,
      description: 'Balancing accommodation, meals & activities cushion',
    },
    {
      id: 5,
      name: 'Validator',
      fullName: 'Building your itinerary',
      icon: Compass,
      description: 'Creating structured morning, afternoon & evening plans',
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
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4 animate-in fade-in duration-200">
      {/* 1. Feature Bar for Normal Users: How WanderWave planned your trip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>How WanderWave Planned Your Trip</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                {isComplete ? 'Itinerary Ready 100%' : requiresHumanInput ? 'Input Needed' : 'AI Crafting...'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Multi-agent pipeline: Requirement ➔ Research ➔ Budget ➔ Planner ➔ Validator ✓
            </p>
          </div>
        </div>

        {/* Mode Toggle Button for Interviewers & Engineers */}
        <button
          onClick={() => setShowTechnicalTrace(!showTechnicalTrace)}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono font-bold flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>{showTechnicalTrace ? 'Hide AI Reasoning' : 'View AI Reasoning Process'}</span>
          {showTechnicalTrace ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800/80">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${calculateProgress()}%` }}
        />
      </div>

      {/* 2. Compact Horizontal Pipeline Badges */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto py-1 scrollbar-none">
        {steps.map((step, idx) => {
          const status = getStepStatus(step.id);
          return (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border whitespace-nowrap ${
                  status === 'done'
                    ? 'bg-slate-900 text-emerald-400 border-emerald-500/30'
                    : status === 'active'
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 ring-1 ring-cyan-500/20'
                    : 'bg-slate-950/60 text-slate-500 border-slate-900'
                }`}
              >
                {status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {status === 'active' && <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
                {status === 'paused' && <AlertCircle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
                <span>{step.name}</span>
              </div>
              {idx < steps.length - 1 && (
                <span className="text-slate-700 font-mono text-xs hidden sm:inline">➔</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 3. Technical Interviewer Trace Drawer (Revealed when clicked) */}
      {showTechnicalTrace && (
        <div className="mt-4 p-5 rounded-2xl bg-slate-950 border border-cyan-500/20 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
              <Terminal className="w-4 h-4" />
              <span>LangGraph Execution Trace & Node Event Logs</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Autonomous State Machine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {steps.map((step) => {
              const status = getStepStatus(step.id);
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-xl border text-xs ${
                    status === 'done'
                      ? 'bg-slate-900/90 border-emerald-500/30 text-emerald-300'
                      : status === 'active'
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                      : 'bg-slate-950/60 border-slate-900 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-mono uppercase">{status}</span>
                  </div>
                  <h4 className="font-bold text-[11px] text-white line-clamp-1">{step.fullName}</h4>
                  <p className="text-[9px] text-slate-400 mt-1 line-clamp-2">{step.description}</p>
                </div>
              );
            })}
          </div>

          {/* Event Stream */}
          {agentLogs && agentLogs.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Agent Telemetry Logs</span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto font-mono text-[11px]">
                {agentLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-slate-900">
                    <span className="text-cyan-400">[{log.timestamp}]</span>
                    <span className="text-slate-300 font-bold truncate mx-2">{log.agent}:</span>
                    <span className="text-slate-400 text-[10px] truncate flex-1">{log.details}</span>
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
