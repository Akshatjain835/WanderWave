import React, { useState } from 'react';
import {
  Calendar,
  Sun,
  Clock,
  Utensils,
  MapPin,
  CheckCircle2,
  Bookmark,
  Share2,
  Sparkles,
  CloudSun,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Compass,
  Navigation,
} from 'lucide-react';

export const ItineraryViewer = ({ itinerary, onSaveTrip, isSaving }) => {
  const [expandedDays, setExpandedDays] = useState({});

  if (!itinerary || !itinerary.days || itinerary.days.length === 0) return null;

  const toggleDayExpand = (dayNumber) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNumber]: !prev[dayNumber],
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Travel Planner Hero Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/30 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> AI Crafted Travel Itinerary
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {itinerary.destination || 'Your Adventure'}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium mt-2">
              <span className="flex items-center gap-1 text-cyan-300 font-bold">
                <Calendar className="w-4 h-4 text-cyan-400" /> {itinerary.duration_days || itinerary.days.length} Days
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-200 font-semibold">
                👥 {itinerary.travelers_count || 2} Travelers
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400 font-extrabold">
                ₹{(itinerary.total_budget_cap_inr || 25000).toLocaleString()} Budget Cap
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2 font-mono">
              From {itinerary.starting_city || 'Delhi'} • Est Total Spend: ₹{(itinerary.estimated_total_cost_inr || 21800).toLocaleString()}
            </p>
          </div>

          {onSaveTrip && (
            <button
              onClick={onSaveTrip}
              disabled={isSaving}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/25 disabled:opacity-50 self-start md:self-auto"
            >
              <Bookmark className="w-4.5 h-4.5" />
              {isSaving ? 'Saving Trip...' : 'Save Itinerary'}
            </button>
          )}
        </div>
      </div>

      {/* Day-by-Day Timeline Planner */}
      <div className="space-y-6">
        {itinerary.days.map((dayData) => {
          const isCollapsed = expandedDays[dayData.day_number];

          return (
            <div
              key={dayData.day_number}
              className="glass-panel rounded-3xl border border-slate-800/90 overflow-hidden transition-all duration-200 hover:border-slate-700"
            >
              {/* Day Header Banner (Matches Design: DAY 1 | ₹5,200) */}
              <div
                onClick={() => toggleDayExpand(dayData.day_number)}
                className="p-5 sm:p-6 bg-slate-900/90 flex items-center justify-between cursor-pointer select-none border-b border-slate-800/80 hover:bg-slate-850 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-cyan-500/20">
                    D{dayData.day_number}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide uppercase font-mono">
                        DAY {dayData.day_number}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                        — {dayData.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                      <CloudSun className="w-3.5 h-3.5 text-cyan-400" /> {dayData.weather_snippet || 'Sunny & Clear | 26°C'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Est. Day Cost</span>
                    <span className="text-sm font-extrabold text-emerald-400">
                      ₹{(dayData.estimated_day_cost_inr || 5200).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Day Content Timeline Slots */}
              {!isCollapsed && (
                <div className="p-6 space-y-6 bg-slate-950/60">
                  <div className="relative border-l-2 border-slate-800 pl-6 sm:pl-8 ml-2 space-y-6">
                    {/* Morning Activity Slot */}
                    {dayData.morning && (
                      <div className="relative group">
                        {/* Timeline Node Dot */}
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-400 ring-4 ring-slate-950 flex items-center justify-center shadow-md shadow-amber-400/30" />

                        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-amber-500/30 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase font-mono flex items-center gap-1">
                                <Sun className="w-3 h-3" /> Morning
                              </span>
                              <span className="text-xs font-mono text-slate-300 font-bold">
                                {dayData.morning.time || '08:00 AM'}
                              </span>
                            </div>

                            <span className="text-xs font-mono font-extrabold text-emerald-400">
                              ₹{dayData.morning.estimated_cost_inr || 150}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white leading-snug">
                            {dayData.morning.activity}
                          </h4>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
                            <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                              <MapPin className="w-3.5 h-3.5" /> {dayData.morning.location}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                              <Navigation className="w-3 h-3 text-slate-500" /> ~15 mins transit
                            </span>
                          </div>

                          {dayData.morning.tips && (
                            <div className="text-xs text-cyan-200/90 bg-slate-900/90 p-3 rounded-xl border border-slate-800 leading-relaxed">
                              💡 <strong className="text-cyan-300">Local Guidebook Tip:</strong> {dayData.morning.tips}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Afternoon Activity Slot */}
                    {dayData.afternoon && (
                      <div className="relative group">
                        {/* Timeline Node Dot */}
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-cyan-400 ring-4 ring-slate-950 flex items-center justify-center shadow-md shadow-cyan-400/30" />

                        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-cyan-500/30 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold uppercase font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Afternoon
                              </span>
                              <span className="text-xs font-mono text-slate-300 font-bold">
                                {dayData.afternoon.time || '01:00 PM'}
                              </span>
                            </div>

                            <span className="text-xs font-mono font-extrabold text-emerald-400">
                              ₹{dayData.afternoon.estimated_cost_inr || 450}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white leading-snug">
                            {dayData.afternoon.activity}
                          </h4>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
                            <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                              <MapPin className="w-3.5 h-3.5" /> {dayData.afternoon.location}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                              <Navigation className="w-3 h-3 text-slate-500" /> ~20 mins transit
                            </span>
                          </div>

                          {dayData.afternoon.tips && (
                            <div className="text-xs text-cyan-200/90 bg-slate-900/90 p-3 rounded-xl border border-slate-800 leading-relaxed">
                              💡 <strong className="text-cyan-300">Local Guidebook Tip:</strong> {dayData.afternoon.tips}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Evening Activity Slot */}
                    {dayData.evening && (
                      <div className="relative group">
                        {/* Timeline Node Dot */}
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-400 ring-4 ring-slate-950 flex items-center justify-center shadow-md shadow-indigo-400/30" />

                        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-indigo-500/30 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase font-mono flex items-center gap-1">
                                <Utensils className="w-3 h-3" /> Evening
                              </span>
                              <span className="text-xs font-mono text-slate-300 font-bold">
                                {dayData.evening.time || '05:30 PM'}
                              </span>
                            </div>

                            <span className="text-xs font-mono font-extrabold text-emerald-400">
                              ₹{dayData.evening.estimated_cost_inr || 200}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white leading-snug">
                            {dayData.evening.activity}
                          </h4>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
                            <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                              <MapPin className="w-3.5 h-3.5" /> {dayData.evening.location}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                              <Navigation className="w-3 h-3 text-slate-500" /> ~10 mins transit
                            </span>
                          </div>

                          {dayData.evening.tips && (
                            <div className="text-xs text-cyan-200/90 bg-slate-900/90 p-3 rounded-xl border border-slate-800 leading-relaxed">
                              💡 <strong className="text-cyan-300">Local Guidebook Tip:</strong> {dayData.evening.tips}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
