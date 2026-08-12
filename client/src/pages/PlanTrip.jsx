import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Compass,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  BrainCircuit,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Sun,
  Bus,
  Home,
  Utensils,
  Camera,
  ShieldAlert,
  Clock,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

export const PlanTrip = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [prompt, setPrompt] = useState('');
  const [destination, setDestination] = useState('Manali');
  const [startingCity, setStartingCity] = useState('Delhi');
  const [duration, setDuration] = useState(5);
  const [budget, setBudget] = useState(30000);
  const [travelers, setTravelers] = useState(2);
  const [travelStyle, setTravelStyle] = useState(user?.preferences?.travelStyle || 'Adventure');

  const [analyzing, setAnalyzing] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeDayTab, setActiveDayTab] = useState(1);

  useEffect(() => {
    if (searchParams.get('preset') === 'manali') {
      setPrompt('I want to visit Manali for 5 days under 30000 for 2 people with trekking and cafes from Delhi');
      setDestination('Manali');
      setDuration(5);
      setBudget(30000);
      setTravelers(2);
    }
  }, [searchParams]);

  const handleDestinationChange = (val) => {
    setDestination(val);
    setPrompt('');
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    setAnalyzing(true);
    setError(null);

    const currentDest = destination.trim() || 'Manali';
    const currentOrigin = startingCity.trim() || 'Delhi';

    const activePrompt = (prompt.trim() && prompt.toLowerCase().includes(currentDest.toLowerCase()))
      ? prompt.trim()
      : `Plan a ${duration} day trip to ${currentDest} from ${currentOrigin} under ${budget} for ${travelers} people with ${travelStyle} travel style`;

    try {
      const response = await api.post('/trips/analyze', {
        prompt: activePrompt,
        destination: currentDest,
        startingCity: currentOrigin,
        duration: Number(duration),
        budget: Number(budget),
        travelers: Number(travelers),
        interests: ['Sightseeing', 'Cafes', 'Local Culture'],
        travelStyle,
      });

      if (response.data.success) {
        setAnalysisResult(response.data.data);
        setActiveDayTab(1);
      } else {
        setError(response.data.message || 'Analysis failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error analyzing trip request. Check backend server.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Day 8 HITL Resume Handler
  const handleSelectOption = async (option) => {
    setResuming(true);
    setError(null);

    const chosenDest = option.destination || destination || 'Goa';
    const chosenBudget = option.budget || budget || 30000;
    const chosenDuration = option.duration || duration || 5;

    if (option.destination) setDestination(option.destination);
    if (option.budget) setBudget(option.budget);
    if (option.duration) setDuration(option.duration);

    try {
      const response = await api.post('/trips/resume', {
        user_decision: option.label,
        destination: chosenDest,
        budget: Number(chosenBudget),
        duration: Number(chosenDuration),
        travelers: Number(travelers),
        startingCity,
        travelStyle: option.travelStyle || travelStyle,
      });

      if (response.data.success) {
        setAnalysisResult(response.data.data);
        setActiveDayTab(1);
      } else {
        setError(response.data.message || 'Failed to resume graph execution.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error resuming graph with human decision.');
    } finally {
      setResuming(false);
    }
  };

  const itinerary = analysisResult?.itinerary;
  const budgetBreakdown = analysisResult?.budgetBreakdown;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold mb-2">
            <BrainCircuit className="w-3.5 h-3.5" /> Day 8: Human-in-the-Loop (HITL) Interruption
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Interactive Agentic Trip Planner Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            LangGraph Pipeline: Requirement Analyzer ➔ HITL Router ➔ Research Agents ➔ Budget Allocator ➔ Itinerary Planner.
          </p>
        </div>

        <button
          onClick={() => {
            setPrompt('I want to visit Manali for 5 days under 30000 for 2 people with trekking and cafes from Delhi');
            setDestination('Manali');
            setDuration(5);
            setBudget(30000);
            setTravelers(2);
          }}
          className="px-4 py-2.5 rounded-xl glass-card hover:border-cyan-500/40 text-xs font-semibold text-cyan-400 flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" /> Load Placement Scenario (Delhi → Manali ₹30k)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Trip Request Form */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleAnalyze} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Natural Language Trip Prompt</span>
                <span className="text-[10px] text-cyan-400 font-mono">Gemini Dynamic Parser</span>
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., I want to visit Manali for 5 days under 30000 for 2 people with trekking and cafes starting from Delhi..."
                className="w-full p-3 glass-input rounded-2xl text-xs font-medium focus:ring-2 focus:ring-cyan-500/40 leading-relaxed"
              />
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-mono tracking-wider text-slate-500">
                Or Customize Parameters
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Destination
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  className="w-full py-2 px-3 glass-input rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" /> Origin City
                </label>
                <input
                  type="text"
                  value={startingCity}
                  onChange={(e) => setStartingCity(e.target.value)}
                  className="w-full py-2 px-3 glass-input rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Duration (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full py-2 px-3 glass-input rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-cyan-400" /> Budget (₹ INR)
                </label>
                <input
                  type="number"
                  step={1000}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full py-2 px-3 glass-input rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-cyan-400" /> Travelers
                </label>
                <input
                  type="number"
                  min={1}
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="w-full py-2 px-3 glass-input rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Travel Style
                </label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full py-2 px-3 glass-input rounded-xl text-xs font-medium bg-slate-900 text-slate-200"
                >
                  <option value="Adventure">Adventure 🏔️</option>
                  <option value="Relaxed">Relaxed 🏖️</option>
                  <option value="Cultural">Cultural 🏛️</option>
                  <option value="Luxury">Luxury 💎</option>
                  <option value="Budget">Budget 🎒</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={analyzing || resuming}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Analyzing & Planning...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  <span>Generate Day-by-Day Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Agent Execution Trace Log */}
          {analysisResult?.agentLogs && (
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
              <p className="text-[11px] font-mono uppercase text-slate-400 flex items-center justify-between">
                <span>LangGraph Execution Trace</span>
                <span className="text-cyan-400 font-bold">{analysisResult.agentLogs.length} Nodes Executed</span>
              </p>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900 text-[11px] font-mono space-y-2 max-h-48 overflow-y-auto">
                {analysisResult.agentLogs.map((log, idx) => (
                  <div key={idx} className="border-b border-slate-900/60 pb-1.5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-cyan-400 font-bold">
                      <span>[{log.timestamp}] {log.agent}</span>
                      <span className={`text-[9px] uppercase font-mono ${log.status === 'PAUSED_FOR_HUMAN_INPUT' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[10px] mt-0.5">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Day 8 HITL Interruption Card or Day 7 Itinerary */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Day 8 Human-in-the-Loop Decision Card */}
          {analysisResult?.requiresHumanInput && (
            <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <HelpCircle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase mb-1">
                    ⏸️ LangGraph Paused • Human-in-the-Loop Interruption
                  </div>
                  <h3 className="text-base font-bold text-white">Clarification Needed to Continue</h3>
                  <p className="text-xs text-amber-200/90 mt-0.5">
                    {analysisResult.clarificationPrompt || 'Please select an option below to resume graph execution:'}
                  </p>
                </div>
              </div>

              {/* Interactive Choice Option Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysisResult.humanPromptOptions?.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    disabled={resuming}
                    className="p-4 rounded-2xl glass-card hover:border-amber-400/50 hover:bg-amber-500/10 text-left transition-all group flex items-center justify-between border border-amber-500/20"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300">{opt.label}</h4>
                      {opt.destination && (
                        <p className="text-[10px] text-slate-400 font-mono mt-1">
                          {opt.destination} • {opt.duration} Days • ₹{opt.budget?.toLocaleString()}
                        </p>
                      )}
                    </div>
                    {resuming ? (
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-amber-400/60 group-hover:text-amber-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!analysisResult && !analyzing && (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Compass className="w-10 h-10 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Agentic AI Trip Planner Ready</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Enter your trip prompt or click "Generate Day-by-Day Plan" to run the LangGraph Multi-Agent pipeline.
                </p>
              </div>
            </div>
          )}

          {(analyzing || resuming) && (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
              <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
              <div>
                <h3 className="text-base font-bold text-white">
                  {resuming ? 'Resuming LangGraph Execution...' : 'Executing Multi-Agent Pipeline...'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Analyzer ➔ HITL Router ➔ Research Agents ➔ Budget Allocator ➔ Itinerary Planner
                </p>
              </div>
            </div>
          )}

          {analysisResult && !analysisResult.requiresHumanInput && !analyzing && !resuming && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Budget Allocation Breakdown */}
              {budgetBreakdown && (
                <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" /> Budget Allocation Breakdown
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      Total Cap: ₹{budgetBreakdown.total_budget?.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div className="glass-card p-2.5 rounded-2xl border border-slate-800 text-center">
                      <p className="text-[9px] text-slate-400 uppercase font-mono">Stay (35%)</p>
                      <p className="text-xs font-extrabold text-white">₹{budgetBreakdown.accommodation_stay?.toLocaleString()}</p>
                    </div>

                    <div className="glass-card p-2.5 rounded-2xl border border-slate-800 text-center">
                      <p className="text-[9px] text-slate-400 uppercase font-mono">Transit (25%)</p>
                      <p className="text-xs font-extrabold text-white">₹{budgetBreakdown.transportation?.toLocaleString()}</p>
                    </div>

                    <div className="glass-card p-2.5 rounded-2xl border border-slate-800 text-center">
                      <p className="text-[9px] text-slate-400 uppercase font-mono">Meals (20%)</p>
                      <p className="text-xs font-extrabold text-white">₹{budgetBreakdown.food_and_meals?.toLocaleString()}</p>
                    </div>

                    <div className="glass-card p-2.5 rounded-2xl border border-slate-800 text-center">
                      <p className="text-[9px] text-slate-400 uppercase font-mono">Activities (15%)</p>
                      <p className="text-xs font-extrabold text-white">₹{budgetBreakdown.activities_and_sightseeing?.toLocaleString()}</p>
                    </div>

                    <div className="glass-card p-2.5 rounded-2xl border border-slate-800 text-center">
                      <p className="text-[9px] text-slate-400 uppercase font-mono">Cushion (5%)</p>
                      <p className="text-xs font-extrabold text-rose-300">₹{budgetBreakdown.emergency_cushion?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Day 7 Day-by-Day Itinerary */}
              {itinerary && itinerary.days && (
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Synthesized Itinerary</span>
                      <h2 className="text-lg font-bold text-white mt-0.5">{itinerary.trip_title}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-mono">Est. Total Spend</span>
                        <p className="text-sm font-extrabold text-emerald-400">₹{itinerary.estimated_total_cost_inr?.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const saveRes = await api.post('/trips', {
                              tripTitle: itinerary.trip_title,
                              destination: analysisResult.destination || destination,
                              startingCity: analysisResult.startingCity || startingCity,
                              duration: Number(analysisResult.duration || duration),
                              budget: Number(analysisResult.budget || budget),
                              travelers: Number(analysisResult.travelers || travelers),
                              travelStyle: analysisResult.travelStyle || travelStyle,
                              interests: analysisResult.interests || ['Sightseeing'],
                              budgetBreakdown: analysisResult.budgetBreakdown || {},
                              itinerary: analysisResult.itinerary || {},
                              weatherForecast: analysisResult.weatherForecast || {},
                            });
                            if (saveRes.data.success) {
                              alert('🎉 Trip saved to your MongoDB account successfully! You can view it under "My Trips".');
                            }
                          } catch (err) {
                            alert(err.response?.data?.message || 'Error saving trip to database.');
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                      >
                        💾 Save Trip
                      </button>
                    </div>
                  </div>

                  {/* Day Tabs Bar */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {itinerary.days.map((d) => (
                      <button
                        key={d.day_number}
                        onClick={() => setActiveDayTab(d.day_number)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                          activeDayTab === d.day_number
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                            : 'glass-card text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" /> Day {d.day_number}
                      </button>
                    ))}
                  </div>

                  {/* Selected Day Activity Slots */}
                  {itinerary.days
                    .filter((d) => d.day_number === activeDayTab)
                    .map((dayData) => (
                      <div key={dayData.day_number} className="space-y-4 animate-in fade-in duration-150">
                        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between text-xs text-cyan-300">
                          <span className="font-bold text-white">Day {dayData.day_number}: {dayData.title}</span>
                          <span className="text-[11px] font-mono">{dayData.weather_snippet}</span>
                        </div>

                        <div className="space-y-3">
                          {/* Morning Slot */}
                          {dayData.morning && (
                            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase font-mono flex items-center gap-1">
                                  <Sun className="w-3 h-3" /> Morning ({dayData.morning.time})
                                </span>
                                <span className="text-xs font-mono font-bold text-emerald-400">₹{dayData.morning.estimated_cost_inr}</span>
                              </div>
                              <h4 className="text-sm font-bold text-white">{dayData.morning.activity}</h4>
                              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {dayData.morning.location}
                              </p>
                              {dayData.morning.tips && (
                                <p className="text-[11px] text-cyan-300/80 bg-slate-950 p-2 rounded-xl border border-slate-900">
                                  💡 Tip: {dayData.morning.tips}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Afternoon Slot */}
                          {dayData.afternoon && (
                            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold uppercase font-mono flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Afternoon ({dayData.afternoon.time})
                                </span>
                                <span className="text-xs font-mono font-bold text-emerald-400">₹{dayData.afternoon.estimated_cost_inr}</span>
                              </div>
                              <h4 className="text-sm font-bold text-white">{dayData.afternoon.activity}</h4>
                              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {dayData.afternoon.location}
                              </p>
                              {dayData.afternoon.tips && (
                                <p className="text-[11px] text-cyan-300/80 bg-slate-950 p-2 rounded-xl border border-slate-900">
                                  💡 Tip: {dayData.afternoon.tips}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Evening Slot */}
                          {dayData.evening && (
                            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase font-mono flex items-center gap-1">
                                  <Utensils className="w-3 h-3" /> Evening ({dayData.evening.time})
                                </span>
                                <span className="text-xs font-mono font-bold text-emerald-400">₹{dayData.evening.estimated_cost_inr}</span>
                              </div>
                              <h4 className="text-sm font-bold text-white">{dayData.evening.activity}</h4>
                              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {dayData.evening.location}
                              </p>
                              {dayData.evening.tips && (
                                <p className="text-[11px] text-cyan-300/80 bg-slate-950 p-2 rounded-xl border border-slate-900">
                                  💡 Tip: {dayData.evening.tips}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
