import React, { useState } from 'react';
import {
  DollarSign,
  PieChart,
  ShieldAlert,
  Hotel,
  Bus,
  Utensils,
  Ticket,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

export const BudgetChart = ({ budgetBreakdown }) => {
  const [suggestionApplied, setSuggestionApplied] = useState(false);

  if (!budgetBreakdown) return null;

  const total = Number(budgetBreakdown.total_budget) || 25000;
  
  // Base category amounts
  const rawStay = Number(budgetBreakdown.accommodation_stay) || 8000;
  const stay = suggestionApplied ? Math.max(4000, rawStay - 2000) : rawStay;
  const transit = Number(budgetBreakdown.transportation) || 5000;
  const food = Number(budgetBreakdown.food_and_meals) || 4000;
  const activities = Number(budgetBreakdown.activities_and_sightseeing) || 5000;
  const emergency = Number(budgetBreakdown.emergency_cushion) || 3000;

  const totalUsed = stay + transit + food + activities;
  const remainingCushion = Math.max(0, total - totalUsed);

  const categories = [
    { name: 'Accommodation', amount: stay, color: 'bg-cyan-500', textColor: 'text-cyan-400', icon: Hotel },
    { name: 'Transportation', amount: transit, color: 'bg-blue-500', textColor: 'text-blue-400', icon: Bus },
    { name: 'Food & Meals', amount: food, color: 'bg-emerald-500', textColor: 'text-emerald-400', icon: Utensils },
    { name: 'Activities', amount: activities, color: 'bg-indigo-500', textColor: 'text-indigo-400', icon: Ticket },
    { name: 'Emergency', amount: emergency, color: 'bg-purple-500', textColor: 'text-purple-400', icon: ShieldAlert },
  ];

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>Budget Allocation & Optimization</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                Budget Agent Active
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Category spending caps partitioned for zero financial overrun
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Budget Cap</span>
          <p className="text-lg font-extrabold text-emerald-400">₹{total.toLocaleString()}</p>
        </div>
      </div>

      {/* Main Budget Breakdown List & Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Category Amounts & Used vs Remaining */}
        <div className="md:col-span-7 space-y-4">
          <div className="space-y-2.5">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              const pct = Math.round((cat.amount / total) * 100);

              return (
                <div key={idx} className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg bg-slate-900 ${cat.textColor}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-slate-300 font-semibold">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-500 text-[11px]">{pct}%</span>
                    <span className="text-white font-extrabold w-20 text-right">
                      ₹{cat.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-800 pt-3 space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold">Total Used Spend:</span>
              <span className="font-extrabold text-white">₹{totalUsed.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-400">
              <span className="font-bold">Remaining Savings Cushion:</span>
              <span className="font-extrabold">₹{remainingCushion.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Smart Budget Agent Optimization Suggestion (Requirement) */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 to-emerald-950/20 p-5 rounded-2xl border border-emerald-500/30 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Budget Agent Suggestion</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              💡 Save ₹2,000
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-slate-300 font-medium">
              Switch accommodation tier:
            </p>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Premium Hotel</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-bold">3★ Comfort Stay</span>
            </div>
          </div>

          {suggestionApplied ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Applied! Saved ₹2,000 on accommodation.</span>
            </div>
          ) : (
            <button
              onClick={() => setSuggestionApplied(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <TrendingDown className="w-4 h-4 stroke-[3]" />
              <span>Apply Suggestion</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
