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
  Map,
  Home,
  Utensils,
  Camera,
  ShieldAlert,
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
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

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
      } else {
        setError(response.data.message || 'Analysis failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error analyzing trip request. Check backend server.');
    } finally {
      setAnalyzing(false);
    }
  };

  const weatherForecast = analysisResult?.weatherForecast;
  const transportOptions = analysisResult?.transportOptions;
  const placesFound = analysisResult?.placesFound;
  const budgetBreakdown = analysisResult?.budgetBreakdown;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold mb-2">
            <BrainCircuit className="w-3.5 h-3.5" /> Day 6: Budget Allocation Agent
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Budget Allocation Agent & Destination Research
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            LangGraph Nodes: Requirement Analyzer Agent ➔ Research Agents (Weather, Transport, Places) ➔ Budget Allocation Agent.
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
              disabled={analyzing}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Allocating Category Budget Caps...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  <span>Run Day 6 Budget Agent</span>
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
                <span className="text-cyan-400 font-bold">{analysisResult.agentLogs.length} Nodes Completed</span>
              </p>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900 text-[11px] font-mono space-y-2 max-h-48 overflow-y-auto">
                {analysisResult.agentLogs.map((log, idx) => (
                  <div key={idx} className="border-b border-slate-900/60 pb-1.5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-cyan-400 font-bold">
                      <span>[{log.timestamp}] {log.agent}</span>
                      <span className="text-emerald-400 text-[9px] uppercase font-mono">{log.status}</span>
                    </div>
                    <p className="text-slate-400 text-[10px] mt-0.5">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Day 6 Budget Allocation & Day 5 Research */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!analysisResult && !analyzing && (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <DollarSign className="w-10 h-10 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Day 6 Budget Agent Ready</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Click "Run Day 6 Budget Agent" to view realistic category budget allocations (Stay, Transit, Meals, Activities, Emergency Cushion).
                </p>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
              <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
              <div>
                <h3 className="text-base font-bold text-white">Day 6 LangGraph Node Execution</h3>
                <p className="text-xs text-slate-400 mt-1">
                  1. Requirement Analyzer ➔ 2. Research Agents ➔ 3. Budget Allocation Agent (Gemini 3.6 Flash)
                </p>
              </div>
            </div>
          )}

          {analysisResult && !analyzing && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Day 6 Budget Allocation Breakdown Section */}
              {budgetBreakdown && (
                <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" /> Day 6: Budget Agent Allocation
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {budgetBreakdown.destination_cost_tier || 'Mid-range'} Cost Tier
                    </span>
                  </div>

                  {budgetBreakdown.budget_advice && (
                    <p className="text-xs text-cyan-300 bg-slate-950 p-2.5 rounded-2xl border border-slate-900">
                      💡 Strategy: {budgetBreakdown.budget_advice}
                    </p>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div className="glass-card p-3 rounded-2xl border border-slate-800 text-center space-y-1">
                      <p className="text-[9px] text-slate-400 uppercase font-mono flex items-center justify-center gap-1">
                        <Home className="w-3 h-3 text-cyan-400" /> Stay (35%)
                      </p>
                      <p className="text-sm font-extrabold text-white">₹{budgetBreakdown.accommodation_stay?.toLocaleString()}</p>
                    </div>

                    <div className="glass-card p-3 rounded-2xl border border-slate-800 text-center space-y-1">
                      <p className="text-[9px] text-slate-400 uppercase font-mono flex items-center justify-center gap-1">
                        <Bus className="w-3 h-3 text-cyan-400" /> Transit (25%)
                      </p>
                      <p className="text-sm font-extrabold text-white">₹{budgetBreakdown.transportation?.toLocaleString()}</p>
                    </div>

                    <div className="glass-card p-3 rounded-2xl border border-slate-800 text-center space-y-1">
                      <p className="text-[9px] text-slate-400 uppercase font-mono flex items-center justify-center gap-1">
                        <Utensils className="w-3 h-3 text-cyan-400" /> Meals (20%)
                      </p>
                      <p className="text-sm font-extrabold text-white">₹{budgetBreakdown.food_and_meals?.toLocaleString()}</p>
                    </div>

                    <div className="glass-card p-3 rounded-2xl border border-slate-800 text-center space-y-1">
                      <p className="text-[9px] text-slate-400 uppercase font-mono flex items-center justify-center gap-1">
                        <Camera className="w-3 h-3 text-cyan-400" /> Activities (15%)
                      </p>
                      <p className="text-sm font-extrabold text-white">₹{budgetBreakdown.activities_and_sightseeing?.toLocaleString()}</p>
                    </div>

                    <div className="glass-card p-3 rounded-2xl border border-slate-800 text-center space-y-1">
                      <p className="text-[9px] text-slate-400 uppercase font-mono flex items-center justify-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-rose-400" /> Cushion (5%)
                      </p>
                      <p className="text-sm font-extrabold text-rose-300">₹{budgetBreakdown.emergency_cushion?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="glass-card p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono">Daily Spending Cap:</span>
                      <strong className="text-emerald-400 font-bold">₹{budgetBreakdown.per_day_limit?.toLocaleString()}/day</strong>
                    </div>
                    <div className="glass-card p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono">Per Person Allocation:</span>
                      <strong className="text-cyan-400 font-bold">₹{budgetBreakdown.per_person_limit?.toLocaleString()}/person</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Day 5 Weather Forecast */}
              {weatherForecast && (
                <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-400" /> Weather Research Data
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                      {weatherForecast.climate_type || 'Temperate'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {weatherForecast.forecast_days?.map((day, idx) => (
                      <div key={idx} className="glass-card p-2.5 rounded-2xl border border-slate-800 text-center space-y-1">
                        <span className="text-[10px] text-slate-400 font-mono">Day {day.day}</span>
                        <p className="text-xs font-bold text-white">{day.temp_max_c}°C</p>
                        <p className="text-[9px] text-cyan-300 truncate">{day.condition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Day 5 Transport Options */}
              {transportOptions && transportOptions.length > 0 && (
                <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <Bus className="w-4 h-4 text-cyan-400" /> Transport Options ({startingCity} ➔ {analysisResult.destination})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {transportOptions.map((opt, idx) => (
                      <div key={idx} className="glass-card p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{opt.mode}</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">₹{opt.roundtrip_cost_per_person?.toLocaleString()}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>⏱️ {opt.travel_time_hours} hrs</span>
                          {opt.comfort_rating && <span>⭐ {opt.comfort_rating}</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
