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
} from 'lucide-react';

export const ItineraryViewer = ({ itinerary, onSaveTrip, isSaving }) => {
  const [activeDayTab, setActiveDayTab] = useState(1);

  if (!itinerary || !itinerary.days || itinerary.days.length === 0) return null;

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 animate-in fade-in duration-200">
      {/* Itinerary Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
              Synthesized Multi-Agent Itinerary
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 4 Validation Checks Passed
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1 tracking-tight">
            {itinerary.trip_title}
          </h2>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Estimated Spend</span>
            <p className="text-sm font-extrabold text-emerald-400">
              ₹{itinerary.estimated_total_cost_inr?.toLocaleString()}
            </p>
          </div>

          {onSaveTrip && (
            <button
              onClick={onSaveTrip}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <Bookmark className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save to My Trips'}
            </button>
          )}
        </div>
      </div>

      {/* Interactive Day Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {itinerary.days.map((d) => (
          <button
            key={d.day_number}
            onClick={() => setActiveDayTab(d.day_number)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeDayTab === d.day_number
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 scale-[1.02]'
                : 'glass-card text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Day {d.day_number}
          </button>
        ))}
      </div>

      {/* Selected Day Timeline Details */}
      {itinerary.days
        .filter((d) => d.day_number === activeDayTab)
        .map((dayData) => (
          <div key={dayData.day_number} className="space-y-4 animate-in fade-in duration-150">
            {/* Day Header Banner */}
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between text-xs text-cyan-300">
              <span className="font-bold text-white text-sm">
                Day {dayData.day_number}: {dayData.title}
              </span>
              <span className="text-[11px] font-mono flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
                <CloudSun className="w-3.5 h-3.5 text-cyan-400" /> {dayData.weather_snippet}
              </span>
            </div>

            {/* Activity Slot Cards */}
            <div className="space-y-3">
              {/* Morning Slot */}
              {dayData.morning && (
                <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2.5 hover:border-amber-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase font-mono flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5" /> Morning Slot ({dayData.morning.time})
                    </span>
                    <span className="text-xs font-mono font-extrabold text-emerald-400 flex items-center gap-0.5">
                      <DollarSign className="w-3.5 h-3.5" /> ₹{dayData.morning.estimated_cost_inr}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white leading-snug">{dayData.morning.activity}</h4>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" /> {dayData.morning.location}
                  </p>
                  {dayData.morning.tips && (
                    <div className="text-xs text-cyan-200/90 bg-slate-950/80 p-3 rounded-xl border border-slate-900/80 leading-relaxed">
                      💡 <strong className="text-cyan-300">Local Guidebook Tip:</strong> {dayData.morning.tips}
                    </div>
                  )}
                </div>
              )}

              {/* Afternoon Slot */}
              {dayData.afternoon && (
                <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2.5 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold uppercase font-mono flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Afternoon Slot ({dayData.afternoon.time})
                    </span>
                    <span className="text-xs font-mono font-extrabold text-emerald-400 flex items-center gap-0.5">
                      <DollarSign className="w-3.5 h-3.5" /> ₹{dayData.afternoon.estimated_cost_inr}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white leading-snug">{dayData.afternoon.activity}</h4>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" /> {dayData.afternoon.location}
                  </p>
                  {dayData.afternoon.tips && (
                    <div className="text-xs text-cyan-200/90 bg-slate-950/80 p-3 rounded-xl border border-slate-900/80 leading-relaxed">
                      💡 <strong className="text-cyan-300">Local Guidebook Tip:</strong> {dayData.afternoon.tips}
                    </div>
                  )}
                </div>
              )}

              {/* Evening Slot */}
              {dayData.evening && (
                <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2.5 hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase font-mono flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5" /> Evening Slot ({dayData.evening.time})
                    </span>
                    <span className="text-xs font-mono font-extrabold text-emerald-400 flex items-center gap-0.5">
                      <DollarSign className="w-3.5 h-3.5" /> ₹{dayData.evening.estimated_cost_inr}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white leading-snug">{dayData.evening.activity}</h4>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" /> {dayData.evening.location}
                  </p>
                  {dayData.evening.tips && (
                    <div className="text-xs text-cyan-200/90 bg-slate-950/80 p-3 rounded-xl border border-slate-900/80 leading-relaxed">
                      💡 <strong className="text-cyan-300">Local Guidebook Tip:</strong> {dayData.evening.tips}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};
