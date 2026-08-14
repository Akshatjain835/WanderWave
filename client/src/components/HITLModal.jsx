import React, { useState } from 'react';
import { HelpCircle, RefreshCw, CheckCircle2, X, AlertTriangle, ArrowRight } from 'lucide-react';

export const HITLModal = ({ isOpen, onClose, clarificationPrompt, options, onSelectOption, isResuming }) => {
  const [customAnswer, setCustomAnswer] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customAnswer.trim()) return;
    onSelectOption({ label: customAnswer.trim() });
    setCustomAnswer('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-slate-900/95 shadow-2xl shadow-amber-500/10 space-y-6 relative">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <HelpCircle className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase mb-1">
              ⏸️ LangGraph Paused • Human-in-the-Loop Interruption
            </div>
            <h3 className="text-lg font-extrabold text-white">Graph Clarification Needed</h3>
            <p className="text-xs text-amber-200/90 mt-0.5">
              {clarificationPrompt || 'Please select a decision option to resume graph execution:'}
            </p>
          </div>
        </div>

        {/* Options List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options && options.length > 0 ? (
            options.map((opt) => (
              <button
                key={opt.id || opt.label}
                onClick={() => onSelectOption(opt)}
                disabled={isResuming}
                className="p-4 rounded-2xl glass-card hover:border-amber-400/50 hover:bg-amber-500/10 text-left transition-all group flex items-center justify-between border border-amber-500/20"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300 leading-snug">
                    {opt.label}
                  </h4>
                  {opt.destination && (
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      {opt.destination} • {opt.duration} Days • ₹{opt.budget?.toLocaleString()}
                    </p>
                  )}
                </div>
                {isResuming ? (
                  <RefreshCw className="w-4 h-4 text-amber-400 animate-spin flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-amber-400/60 group-hover:text-amber-400 flex-shrink-0" />
                )}
              </button>
            ))
          ) : (
            <p className="text-xs text-slate-400 col-span-2">No option presets provided. Enter your custom response below.</p>
          )}
        </div>

        {/* Custom Input Response Form */}
        <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-slate-800 space-y-3">
          <label className="block text-xs font-semibold text-slate-300">Or Type Custom Instruction</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customAnswer}
              onChange={(e) => setCustomAnswer(e.target.value)}
              placeholder="e.g., Increase budget to 30000 and stay in 3-star hotel"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={isResuming || !customAnswer.trim()}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              Resume <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
