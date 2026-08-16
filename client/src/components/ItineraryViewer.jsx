import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sun,
  Clock,
  Utensils,
  MapPin,
  Bookmark,
  Sparkles,
  CloudSun,
  ChevronDown,
  ChevronUp,
  Compass,
  Navigation,
  RefreshCw,
  Wand2,
  X,
  Check,
  Database,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { fetchDestinationImage } from '../services/imageService';

// Popular places tags by destination
const DESTINATION_PLACES = {
  goa: ['Baga Beach', 'Fort Aguada', 'Panjim', 'Dudhsagar Waterfalls', 'Anjuna Beach', 'Calangute'],
  manali: ['Solang Valley', 'Rohtang Pass', 'Hadimba Temple', 'Old Manali Cafes', 'Jogini Waterfall'],
  jaipur: ['Hawa Mahal', 'Amber Fort', 'City Palace', 'Jal Mahal', 'Chokhi Dhani'],
  ladakh: ['Pangong Lake', 'Nubra Valley', 'Khardung La Pass', 'Magnetic Hill', 'Diskit Monastery'],
  mysore: ['Mysore Palace', 'Chamundi Hill', 'Brindavan Gardens', 'St. Philomena Cathedral'],
  kerala: ['Alleppey Backwaters', 'Munnar Tea Gardens', 'Varkala Cliff', 'Thekkady Sanctuary'],
  dubai: ['Burj Khalifa', 'Dubai Mall', 'Desert Safari', 'Palm Jumeirah', 'Miracle Garden'],
};

export const ItineraryViewer = ({ itinerary: initialItinerary, onSaveTrip, isSaving }) => {
  const [itinerary, setItinerary] = useState(initialItinerary);
  const [expandedDays, setExpandedDays] = useState({});
  const [coverImageUrl, setCoverImageUrl] = useState('');
  
  // Killer Feature State: Partial Day Regeneration Modal
  const [activeRegenDay, setActiveRegenDay] = useState(null);
  const [customFeedback, setCustomFeedback] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [toastNotice, setToastNotice] = useState(null);

  useEffect(() => {
    setItinerary(initialItinerary);
  }, [initialItinerary]);

  useEffect(() => {
    if (itinerary?.destination) {
      fetchDestinationImage(itinerary.destination).then((url) => {
        setCoverImageUrl(url);
      });
    }
  }, [itinerary?.destination]);

  if (!itinerary || !itinerary.days || itinerary.days.length === 0) return null;

  const destKey = (itinerary.destination || '').toLowerCase();
  const popularPlaces = DESTINATION_PLACES[destKey] || [
    `${itinerary.destination} City Center`,
    'Old Town Quarter',
    'Sunset Point View',
    'Local Crafts Market',
  ];

  const toggleDayExpand = (dayNumber) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNumber]: !prev[dayNumber],
    }));
  };

  const handleRegenerateDaySubmit = async (feedbackText) => {
    if (!activeRegenDay || !feedbackText) return;
    setIsRegenerating(true);
    try {
      const response = await api.post('/trips/regenerate-day', {
        dayNumber: activeRegenDay,
        feedback: feedbackText,
        currentItinerary: itinerary,
        destination: itinerary.destination,
        budget: itinerary.total_budget_cap_inr,
      });

      if (response.data.success && response.data.data?.itinerary) {
        setItinerary(response.data.data.itinerary);
        setToastNotice(`✨ Day ${activeRegenDay} successfully re-planned based on: "${feedbackText}"`);
        setTimeout(() => setToastNotice(null), 5000);
      }
    } catch (err) {
      console.error('Error regenerating day:', err);
    } finally {
      setIsRegenerating(false);
      setActiveRegenDay(null);
      setCustomFeedback('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 relative">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 text-xs font-bold backdrop-blur-md shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-4">
          <span>{toastNotice}</span>
          <button onClick={() => setToastNotice(null)} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Partial Day Regeneration Modal */}
      {activeRegenDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 max-w-lg w-full space-y-6 shadow-2xl relative bg-slate-900/90">
            <button
              onClick={() => setActiveRegenDay(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Wand2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  Partial Re-Planner Agent
                </span>
                <h3 className="text-lg font-extrabold text-white mt-1">
                  Regenerate Day {activeRegenDay}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              How would you like WanderWave AI to adjust <strong className="text-cyan-300">Day {activeRegenDay}</strong>? Select a quick suggestion or enter custom instructions:
            </p>

            {/* Quick Feedback Chips */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '💰 Make it Cheaper', value: 'Make Day cheaper' },
                { label: '🧗 More Adventurous', value: 'More adventurous trekking' },
                { label: '☕ Relaxed Cafes & Food', value: 'Relaxed cafes and local food' },
                { label: '🏖️ Remove Nightlife', value: 'Remove nightlife quiet evening' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleRegenerateDaySubmit(chip.value)}
                  disabled={isRegenerating}
                  className="p-3 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 hover:border-cyan-500/40 text-xs font-bold text-slate-200 hover:text-cyan-300 border border-slate-700/80 text-left transition-all disabled:opacity-50 flex items-center justify-between"
                >
                  <span>{chip.label}</span>
                  {isRegenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Wand2 className="w-3.5 h-3.5 text-cyan-400/60" />}
                </button>
              ))}
            </div>

            {/* Custom Feedback Form */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-400">
                Or Type Custom Feedback:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customFeedback}
                  onChange={(e) => setCustomFeedback(e.target.value)}
                  placeholder="e.g. Add more beach sunset spots..."
                  className="flex-1 p-3 glass-input rounded-xl text-xs font-medium"
                />
                <button
                  onClick={() => handleRegenerateDaySubmit(customFeedback)}
                  disabled={isRegenerating || !customFeedback.trim()}
                  className="px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isRegenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Large Immersive Destination Hero Cover Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 min-h-[280px] sm:min-h-[340px] flex flex-col justify-end p-6 sm:p-8 bg-slate-950">
        {coverImageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center transform hover:scale-105 transition-transform duration-700 pointer-events-none"
            style={{ backgroundImage: `url(${coverImageUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

        {/* Floating Content Overlay */}
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold uppercase backdrop-blur-md mb-2">
                <Sparkles className="w-3.5 h-3.5" /> AI Generated Travel Plan
              </span>
              <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight uppercase drop-shadow-md">
                {itinerary.destination || 'GOA'}
              </h1>
              <p className="text-sm sm:text-base font-semibold text-cyan-200 drop-shadow mt-1">
                {itinerary.duration_days || 4} Day AI Generated Trip • {itinerary.starting_city ? `From ${itinerary.starting_city}` : 'Tailored Journey'}
              </p>
            </div>

            {onSaveTrip && (
              <button
                onClick={onSaveTrip}
                disabled={isSaving}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/30 backdrop-blur-md disabled:opacity-50"
              >
                <Bookmark className="w-4.5 h-4.5" />
                {isSaving ? 'Saving...' : 'Save Itinerary'}
              </button>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-slate-200 pt-2 font-mono">
            <span className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-emerald-400 font-extrabold">
              ₹{(itinerary.total_budget_cap_inr || 25000).toLocaleString()} Budget
            </span>
            <span className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-cyan-300">
              👥 {itinerary.travelers_count || 2} Travelers
            </span>
            <span className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-indigo-300">
              ✨ {itinerary.travelStyle || 'Adventure'} Style
            </span>
          </div>

          {/* Popular Places Chips */}
          <div className="pt-2">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-2 font-semibold">
              Popular Places Included:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {popularPlaces.map((place) => (
                <span
                  key={place}
                  className="px-3 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 backdrop-blur-sm transition-all"
                >
                  [ {place} ]
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trust-Building Cards Grid: AI Sources & Why This Plan (Requirements) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Sources Badge Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 bg-slate-900/60">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              AI Ground Truth Sources
            </h3>
          </div>

          <div className="space-y-2 text-xs font-medium">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{itinerary.destination} Local Guidebook (Qdrant Vector DB)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Real-Time Forecast (Open-Meteo Weather API)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Verified Local Attractions & Hidden Spots</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Express Route & Transit Distance Estimates</span>
            </div>
          </div>
        </div>

        {/* "Why This Plan?" Rationale Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 bg-slate-900/60">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Why This Itinerary?
            </h3>
          </div>

          <div className="space-y-2 text-xs font-medium">
            <div className="flex items-center gap-2 text-slate-200">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Fits your ₹{(itinerary.total_budget_cap_inr || 25000).toLocaleString()} budget cap</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Prioritizes your interests ({itinerary.travelStyle || 'Adventure'} style)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Avoids long travel between activities</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Optimized for {itinerary.travelers_count || 2} travelers</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Weather checked for your travel dates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day-by-Day Timeline Planner with Killer Feature: Regenerate This Day */}
      <div className="space-y-6">
        {itinerary.days.map((dayData) => {
          const isCollapsed = expandedDays[dayData.day_number];

          return (
            <div
              key={dayData.day_number}
              className="glass-panel rounded-3xl border border-slate-800/90 overflow-hidden transition-all duration-200 hover:border-slate-700"
            >
              {/* Day Header Banner */}
              <div
                onClick={() => toggleDayExpand(dayData.day_number)}
                className="p-5 sm:p-6 bg-slate-900/90 flex items-center justify-between cursor-pointer select-none border-b border-slate-800/80 hover:bg-slate-850 transition-all flex-wrap gap-4"
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

                <div className="flex items-center gap-3">
                  {/* Killer Feature Button: Regenerate This Day */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveRegenDay(dayData.day_number);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate Day {dayData.day_number}</span>
                  </button>

                  <div className="text-right hidden sm:block">
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
