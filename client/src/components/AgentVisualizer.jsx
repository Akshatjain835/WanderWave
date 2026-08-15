import React from 'react';
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
} from 'lucide-react';

export const AgentVisualizer = ({ activeStep, agentLogs, isComplete, requiresHumanInput }) => {
  const steps = [
    {
      id: 1,
      name: 'Understanding your preferences',
      icon: BrainCircuit,
      description: 'Parsing destination, duration, budget cap & traveler style',
    },
    {
      id: 2,
      name: 'Finding places & local secrets',
      icon: MapPin,
      description: 'Discovering authentic attractions & local guidebook tips',
    },
    {
      id: 3,
      name: 'Checking weather & transit',
      icon: CloudSun,
      description: 'Analyzing rain forecasts & comfortable transit modes',
    },
    {
      id: 4,
      name: 'Optimizing your budget',
      icon: DollarSign,
      description: 'Balancing accommodation, meals, activities & emergency cushion',
    },
    {
      id: 5,
      name: 'Building your itinerary',
      icon: Compass,
      description: 'Creating structured morning, afternoon & evening daily plans',
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
      {/* User-Friendly Progress Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>AI Planning Progress</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                {isComplete ? 'Itinerary Ready 100%' : requiresHumanInput ? 'Input Needed' : 'AI Crafting Trip...'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              WanderWave AI is crafting your tailored trip experience in real time.
            </p>
          </div>
        </div>

        {/* Progress Metric */}
        <div className="text-right flex-shrink-0">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Progress</span>
          <p className="text-sm font-extrabold text-cyan-400">{calculateProgress()}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800/80">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${calculateProgress()}%` }}
        />
      </div>

      {/* User-Centric 5-Step Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-2xl border transition-all relative ${
                status === 'done'
                  ? 'bg-slate-900/90 border-emerald-500/30 text-emerald-300'
                  : status === 'active'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : status === 'paused'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-slate-950/60 border-slate-900 opacity-60 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-slate-800/80">
                  <Icon className="w-4 h-4" />
                </span>
                {status === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {status === 'active' && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />}
                {status === 'paused' && <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />}
              </div>

              <h4 className="text-xs font-bold text-white line-clamp-1 flex items-center gap-1.5">
                {status === 'done' && <span className="text-emerald-400 font-bold">✓</span>}
                {status === 'active' && <span className="text-cyan-400 font-bold">●</span>}
                <span>{step.name}</span>
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
