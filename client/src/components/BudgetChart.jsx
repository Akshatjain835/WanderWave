import React from 'react';
import { DollarSign, PieChart, ShieldAlert, Hotel, Bus, Utensils, Ticket } from 'lucide-react';

export const BudgetChart = ({ budgetBreakdown }) => {
  if (!budgetBreakdown) return null;

  const total = Number(budgetBreakdown.total_budget) || 1;
  const stay = Number(budgetBreakdown.accommodation_stay) || 0;
  const transit = Number(budgetBreakdown.transportation) || 0;
  const food = Number(budgetBreakdown.food_and_meals) || 0;
  const activities = Number(budgetBreakdown.activities_and_sightseeing) || 0;
  const cushion = Number(budgetBreakdown.emergency_cushion) || 0;

  const categories = [
    {
      name: 'Stay & Hotels',
      amount: stay,
      pct: Math.round((stay / total) * 100),
      color: 'bg-cyan-500',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      bgColor: 'bg-cyan-500/10',
      icon: Hotel,
    },
    {
      name: 'Transportation',
      amount: transit,
      pct: Math.round((transit / total) * 100),
      color: 'bg-blue-500',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/30',
      bgColor: 'bg-blue-500/10',
      icon: Bus,
    },
    {
      name: 'Food & Meals',
      amount: food,
      pct: Math.round((food / total) * 100),
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-500/10',
      icon: Utensils,
    },
    {
      name: 'Activities & Sightseeing',
      amount: activities,
      pct: Math.round((activities / total) * 100),
      color: 'bg-indigo-500',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30',
      bgColor: 'bg-indigo-500/10',
      icon: Ticket,
    },
    {
      name: 'Emergency Cushion',
      amount: cushion,
      pct: Math.round((cushion / total) * 100),
      color: 'bg-purple-500',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/30',
      bgColor: 'bg-purple-500/10',
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Category Budget Allocation</h3>
            <p className="text-[10px] text-slate-400">Partitioned cap optimized for maximum comfort & zero overrun</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] font-mono text-slate-400 uppercase">Total Budget Cap</span>
          <p className="text-sm font-extrabold text-emerald-400">₹{total.toLocaleString()}</p>
        </div>
      </div>

      {/* Multi-Segment Color Distribution Bar */}
      <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden flex border border-slate-800/80">
        {categories.map((cat, i) => (
          <div
            key={i}
            className={`h-full ${cat.color} transition-all duration-500`}
            style={{ width: `${cat.pct}%` }}
            title={`${cat.name}: ₹${cat.amount.toLocaleString()} (${cat.pct}%)`}
          />
        ))}
      </div>

      {/* Grid of Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <div
              key={i}
              className={`p-3 rounded-2xl border ${cat.bgColor} ${cat.borderColor} space-y-1 text-center transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-center gap-1">
                <Icon className={`w-3.5 h-3.5 ${cat.textColor}`} />
                <span className="text-[10px] font-mono font-bold text-slate-300">{cat.pct}%</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{cat.name}</p>
              <p className={`text-xs font-extrabold ${cat.textColor}`}>
                ₹{cat.amount.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
