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
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Tag,
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
    setPrompt(''); // Clear stale textarea prompt so form input overrides
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    setAnalyzing(true);
    setError(null);

    // If prompt is empty or destination field was edited, construct dynamic prompt with exact form values
    const currentDest = destination.trim() || 'Dubai';
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold mb-2">
            <BrainCircuit className="w-3.5 h-3.5" /> Agentic Requirement Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Agentic Trip Requirement Analyzer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Test LangGraph Agent 1 structured output extraction and long-term user preference memory integration.
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
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleAnalyze} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Natural Language Trip Prompt</span>
                <span className="text-[10px] text-cyan-400 font-mono">Gemini Structured Parser</span>
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
                  <span>Agent 1 Parsing Request...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  <span>Analyze Requirement with Agent 1</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Structured Output Display */}
        <div className="lg:col-span-6 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!analysisResult && !analyzing && (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center min-h-[380px] space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <BrainCircuit className="w-10 h-10 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Requirement Agent Idle</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Click "Analyze Requirement with Agent 1" or load the placement preset to see structured LangGraph output.
                </p>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center min-h-[380px] space-y-4">
              <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
              <div>
                <h3 className="text-base font-bold text-white">LangGraph Node Execution</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Invoking Gemini Structured Output Parser + Injecting User Long-Term Memory...
                </p>
              </div>
            </div>
          )}

          {analysisResult && !analyzing && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Agent 1 Structured State Output</h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  State Updated
                </span>
              </div>

              {/* Extracted Fields Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="glass-card p-3 rounded-2xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Destination</p>
                  <p className="text-sm font-bold text-white mt-0.5">{analysisResult.destination}</p>
                </div>

                <div className="glass-card p-3 rounded-2xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Origin</p>
                  <p className="text-sm font-bold text-white mt-0.5">{analysisResult.startingCity}</p>
                </div>

                <div className="glass-card p-3 rounded-2xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Duration</p>
                  <p className="text-sm font-bold text-cyan-400 mt-0.5">{analysisResult.duration} Days</p>
                </div>

                <div className="glass-card p-3 rounded-2xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Budget Cap</p>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">₹{analysisResult.budget?.toLocaleString()}</p>
                </div>

                <div className="glass-card p-3 rounded-2xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Travelers</p>
                  <p className="text-sm font-bold text-white mt-0.5">{analysisResult.travelers} Persons</p>
                </div>

                <div className="glass-card p-3 rounded-2xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Travel Style</p>
                  <p className="text-sm font-bold text-cyan-300 mt-0.5">{analysisResult.travelStyle}</p>
                </div>
              </div>

              {/* Interests Tags */}
              <div>
                <p className="text-[11px] font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" /> Extracted Interests
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.interests?.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-900 text-slate-200 border border-slate-800"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Injected Memory Badge */}
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 flex items-center justify-between">
                <span>Memory Preference Synced:</span>
                <strong className="text-white font-semibold">
                  {analysisResult.userLongTermPreferences?.travelStyle || analysisResult.travelStyle} Style
                </strong>
              </div>

              {/* Agent Log Trace */}
              <div>
                <p className="text-[11px] font-mono uppercase text-slate-400 mb-2">Agent Execution Trace Log</p>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900 text-[11px] font-mono space-y-1">
                  {analysisResult.agentLogs?.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-300">
                      <span className="text-cyan-400">[{log.timestamp}] {log.agent}:</span>
                      <span className="text-slate-400">{log.details}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
