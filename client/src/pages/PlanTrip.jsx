import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { AgentVisualizer } from '../components/AgentVisualizer';
import { MultiStepTripForm } from '../components/MultiStepTripForm';
import { BudgetChart } from '../components/BudgetChart';
import { ItineraryViewer } from '../components/ItineraryViewer';
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
  HelpCircle,
  CheckCircle2,
  ListFilter,
  Wand2,
} from 'lucide-react';

export const PlanTrip = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [inputMode, setInputMode] = useState('wizard'); // 'wizard' | 'prompt'
  const [prompt, setPrompt] = useState('');
  const [destination, setDestination] = useState('Manali');
  const [startingCity, setStartingCity] = useState('Delhi');
  const [duration, setDuration] = useState(5);
  const [budget, setBudget] = useState(30000);
  const [travelers, setTravelers] = useState(2);
  const [travelStyle, setTravelStyle] = useState(user?.preferences?.travelStyle || 'Adventure');

  const [analyzing, setAnalyzing] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeAgentStep, setActiveAgentStep] = useState(1);

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

  const executePipelineRequest = async (activePrompt, customData = {}) => {
    setAnalyzing(true);
    setError(null);
    setActiveAgentStep(1);

    const stepInterval = setInterval(() => {
      setActiveAgentStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 600);

    const currentDest = customData.destination || destination.trim() || 'Manali';
    const currentOrigin = customData.startingCity || startingCity.trim() || 'Delhi';

    try {
      const response = await api.post('/trips/analyze', {
        prompt: activePrompt,
        destination: currentDest,
        startingCity: currentOrigin,
        duration: Number(customData.duration || duration),
        budget: Number(customData.budget || budget),
        travelers: Number(customData.travelers || travelers),
        interests: customData.interests || ['Sightseeing', 'Cafes', 'Local Culture'],
        travelStyle: customData.travelStyle || travelStyle,
      });

      if (response.data.success) {
        setAnalysisResult(response.data.data);
        setActiveAgentStep(5);
      } else {
        setError(response.data.message || 'Analysis failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error analyzing trip request. Check backend server.');
    } finally {
      clearInterval(stepInterval);
      setAnalyzing(false);
    }
  };

  const handleAnalyzePrompt = (e) => {
    if (e) e.preventDefault();
    const currentDest = destination.trim() || 'Manali';
    const currentOrigin = startingCity.trim() || 'Delhi';
    const activePrompt = (prompt.trim() && prompt.toLowerCase().includes(currentDest.toLowerCase()))
      ? prompt.trim()
      : `Plan a ${duration} day trip to ${currentDest} from ${currentOrigin} under ${budget} for ${travelers} people with ${travelStyle} travel style`;
    
    executePipelineRequest(activePrompt);
  };

  const handleWizardSubmit = (generatedPrompt, formData) => {
    setDestination(formData.destination);
    setStartingCity(formData.startingCity);
    setDuration(formData.duration);
    setBudget(formData.budget);
    setTravelers(formData.travelers);
    setTravelStyle(formData.travelStyle);
    executePipelineRequest(generatedPrompt, formData);
  };

  const handleSelectOption = async (option) => {
    setResuming(true);
    setError(null);
    setActiveAgentStep(2);

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
        setActiveAgentStep(5);
      } else {
        setError(response.data.message || 'Failed to resume graph execution.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error resuming graph with human decision.');
    } finally {
      setResuming(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!analysisResult?.itinerary) return;
    setIsSaving(true);
    try {
      const saveRes = await api.post('/trips', {
        tripTitle: analysisResult.itinerary.trip_title,
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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold mb-2">
            <BrainCircuit className="w-3.5 h-3.5" /> Day 14: Day-by-Day Dashboard & Budget Chart
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Interactive Agentic Trip Planner Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            LangGraph Pipeline: Requirement Analyzer ➔ RAG Qdrant Vector DB ➔ Budget Allocator ➔ Itinerary Planner ➔ 4 Validation Checks.
          </p>
        </div>

        {/* Input Mode Toggle */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setInputMode('wizard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              inputMode === 'wizard'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" /> Guided Wizard
          </button>
          <button
            onClick={() => setInputMode('prompt')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              inputMode === 'prompt'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" /> Quick Prompt
          </button>
        </div>
      </div>

      {/* Real-Time Agent Execution Visualizer */}
      <AgentVisualizer
        activeStep={activeAgentStep}
        agentLogs={analysisResult?.agentLogs}
        isComplete={Boolean(analysisResult && !analysisResult.requiresHumanInput && !analyzing)}
        requiresHumanInput={Boolean(analysisResult?.requiresHumanInput)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form (Wizard vs Quick Prompt) */}
        <div className="lg:col-span-5 space-y-6">
          {inputMode === 'wizard' ? (
            <MultiStepTripForm onSubmit={handleWizardSubmit} isLoading={analyzing || resuming} />
          ) : (
            <form onSubmit={handleAnalyzePrompt} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
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
                  Or Quick Parameters
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
          )}
        </div>

        {/* Right Column: Output / HITL Interruption Card / Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* HITL Interruption Card */}
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

              {/* Choice Buttons */}
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
                  Complete the guided wizard or enter your trip prompt to execute the LangGraph pipeline.
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
                  Requirement Analyzer ➔ RAG Qdrant Vector DB ➔ Budget Allocator ➔ Itinerary Planner ➔ Validator Node
                </p>
              </div>
            </div>
          )}

          {analysisResult && !analysisResult.requiresHumanInput && !analyzing && !resuming && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Day 14 Budget Allocation Visual Chart */}
              <BudgetChart budgetBreakdown={analysisResult.budgetBreakdown} />

              {/* Day 14 Interactive Itinerary Viewer */}
              <ItineraryViewer
                itinerary={analysisResult.itinerary}
                onSaveTrip={handleSaveTrip}
                isSaving={isSaving}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
