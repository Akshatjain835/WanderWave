import React, { useState } from 'react';
import {
  CloudSun,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Calendar,
  CheckCircle2,
  Compass,
  Info,
  ThermometerSun,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

export const LocationFeasibilityCard = ({
  locationFeasibility,
  travelIntelligence,
  mustVisitPlacesStatus,
  destination,
  duration,
}) => {
  const [isClosed, setIsClosed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!locationFeasibility && !travelIntelligence && (!mustVisitPlacesStatus || mustVisitPlacesStatus.length === 0)) {
    return null;
  }

  const verdict = locationFeasibility?.verdict || 'EXCELLENT';
  const riskLevel = locationFeasibility?.weather_risk_level || 'Low';
  const geoNotes = locationFeasibility?.geography_notes || travelIntelligence?.recommendation_rationale || '';
  const activityAdvice = locationFeasibility?.seasonal_activity_advice || '';
  const bestMonths = locationFeasibility?.best_month_to_visit || travelIntelligence?.best_month_to_visit || 'October - March';

  // If user closed the panel, render a sleek re-open badge bar
  if (isClosed) {
    return (
      <div className="flex justify-end">
        <button
          onClick={() => setIsClosed(false)}
          className="px-4 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-bold transition-all shadow-md flex items-center gap-2 backdrop-blur-md"
        >
          <CloudSun className="w-4 h-4 text-cyan-400" />
          <span>Show Climate Feasibility Advisor for {destination || 'Destination'}</span>
        </button>
      </div>
    );
  }

  const getVerdictBadge = () => {
    switch (verdict) {
      case 'NOT_RECOMMENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/10">
            <AlertTriangle className="w-3.5 h-3.5" /> High Climate Risk
          </span>
        );
      case 'MODERATE_WITH_CAUTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10">
            <AlertTriangle className="w-3.5 h-3.5" /> Visit With Caution (Seasonal Weather)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
            <ShieldCheck className="w-3.5 h-3.5" /> Ideal Climate & Geography
          </span>
        );
    }
  };

  return (
    <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-cyan-950/30 shadow-2xl space-y-5 transition-all relative overflow-hidden backdrop-blur-md">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-inner">
            <CloudSun className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Travel Intelligence & Geography Advisory
            </span>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 mt-0.5">
              {destination || 'Destination'} Climate & Timing Feasibility
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getVerdictBadge()}

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all ml-1"
            title={isCollapsed ? 'Expand Details' : 'Collapse Details'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {/* Close Panel Button */}
          <button
            onClick={() => setIsClosed(true)}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 transition-all"
            title="Dismiss Advisory Card"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-5 animate-in fade-in duration-200 relative z-10">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 hover:border-cyan-500/30 transition-all">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mb-1 font-bold">
                <Calendar className="w-3 h-3 text-cyan-400" /> Best Months
              </span>
              <span className="text-xs font-black text-white block">{bestMonths}</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 hover:border-amber-500/30 transition-all">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mb-1 font-bold">
                <ThermometerSun className="w-3 h-3 text-amber-400" /> Weather Risk
              </span>
              <span className="text-xs font-black text-white block">{riskLevel} Risk</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 hover:border-emerald-500/30 transition-all">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mb-1 font-bold">
                <Compass className="w-3 h-3 text-emerald-400" /> Weather Score
              </span>
              <span className="text-xs font-black text-white block">
                {travelIntelligence?.weather_score ? `${travelIntelligence.weather_score}/10` : '8.5/10'}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 hover:border-indigo-500/30 transition-all">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mb-1 font-bold">
                <ShieldCheck className="w-3 h-3 text-indigo-400" /> Overall Comfort
              </span>
              <span className="text-xs font-black text-white block">
                {travelIntelligence?.overall_score ? `${travelIntelligence.overall_score}/10` : '8.8/10'}
              </span>
            </div>
          </div>

          {/* Geography Notes & Activity Advice */}
          {geoNotes && (
            <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 space-y-2">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">{geoNotes}</p>
                  {activityAdvice && (
                    <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-[11px] text-cyan-200 leading-relaxed font-medium">
                      💡 <span className="font-bold text-cyan-300">Activity Strategy:</span> {activityAdvice}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Must-Visit Locations Status List */}
          {mustVisitPlacesStatus && mustVisitPlacesStatus.length > 0 && (
            <div className="border-t border-slate-800/80 pt-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Requested Must-Visit Locations Status
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {mustVisitPlacesStatus.filter((s) => s.scheduled).length} / {mustVisitPlacesStatus.length} Allocated
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {mustVisitPlacesStatus.map((item, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border shadow-sm transition-all ${
                      item.scheduled
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    }`}
                  >
                    {item.scheduled ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{item.place_name}</span>
                    <span className="text-[10px] font-mono opacity-80 border-l border-slate-700/80 pl-2">
                      {item.status_note}
                    </span>
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
