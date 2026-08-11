import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Sparkles,
  MapPin,
  Calendar,
  CloudSun,
  DollarSign,
  ShieldCheck,
  Cpu,
  BrainCircuit,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-10 border border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/40">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Agentic AI Powered by LangGraph JS
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{user?.name || 'Explorer'}</span> 👋
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Ready to craft your next journey? WanderWave uses specialized AI agents to independently analyze requirements, fetch weather forecasts, estimate transport, allocate budgets, and iteratively self-validate your itinerary.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              to="/plan"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-500/25 flex items-center gap-2 hover:scale-[1.02] transition-all"
            >
              <Compass className="w-4 h-4" />
              Plan New Trip with LangGraph
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-card text-xs text-slate-300">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>
                Memory Preference: <strong className="text-white">{user?.preferences?.travelStyle || 'Adventure'}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Agent System Feature Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-cyan-400" />
              Orchestrated AI Sub-Agents
            </h2>
            <p className="text-xs text-slate-400">
              How our stateful graph guarantees realistic, conflict-free travel plans
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Agent 1 */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">1. Requirement Agent</h3>
            <p className="text-xs text-slate-400 mt-1">
              Parses raw requests into structured state (destination, duration, budget, style) and detects missing details.
            </p>
          </div>

          {/* Agent 2 */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CloudSun className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">2. Weather & Transport</h3>
            <p className="text-xs text-slate-400 mt-1">
              Fetches rain probability & daily forecasts. Reschedules outdoor treks if rain is expected.
            </p>
          </div>

          {/* Agent 3 */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">3. Budget Allocator</h3>
            <p className="text-xs text-slate-400 mt-1">
              Categorizes funds across hotels, meals, transport, and activities to enforce spending limits.
            </p>
          </div>

          {/* Agent 4 */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">4. Validator ⭐ Loop</h3>
            <p className="text-xs text-slate-400 mt-1">
              Evaluates total cost, weather sanity, and geography. Triggers re-planning loops automatically if rules fail.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start Prompt Container */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900/40">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            Try Example Scenario: Delhi to Manali 5 Days
          </h3>
          <p className="text-xs text-slate-400">
            Destination: Manali | Budget: ₹30,000 | Travelers: 2 | Interests: Trekking, Cafes, Sightseeing
          </p>
        </div>
        <Link
          to="/plan?preset=manali"
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-all whitespace-nowrap"
        >
          Load Preset Request
        </Link>
      </div>
    </div>
  );
};
