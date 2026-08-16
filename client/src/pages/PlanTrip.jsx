import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { AgentVisualizer } from '../components/AgentVisualizer';
import { MultiStepTripForm } from '../components/MultiStepTripForm';
import { BudgetChart } from '../components/BudgetChart';
import { ItineraryViewer } from '../components/ItineraryViewer';
import { HITLModal } from '../components/HITLModal';
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
  X,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const PlanTrip = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [inputMode, setInputMode] = useState('wizard'); // 'wizard' | 'prompt'
  const [prompt, setPrompt] = useState('');
  const [destination, setDestination] = useState('Goa');
  const [startingCity, setStartingCity] = useState('Delhi');
  const [duration, setDuration] = useState(4);
  const [budget, setBudget] = useState(25000);
  const [travelers, setTravelers] = useState(2);
  const [travelStyle, setTravelStyle] = useState(user?.preferences?.travelStyle || 'Relaxed');

  const [analyzing, setAnalyzing] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeAgentStep, setActiveAgentStep] = useState(1);
  const [isHITLModalOpen, setIsHITLModalOpen] = useState(false);

  const popularDestinations = ['Goa', 'Manali', 'Jaipur', 'Ladakh'];

  useEffect(() => {
    const destParam = searchParams.get('destination');
    const budgetParam = searchParams.get('budget');
    const durationParam = searchParams.get('duration');
    const travelersParam = searchParams.get('travelers');

    if (destParam) {
      setDestination(destParam);
      if (budgetParam) setBudget(Number(budgetParam));
      if (durationParam) setDuration(Number(durationParam));
      if (travelersParam) setTravelers(Number(travelersParam));
      setPrompt(`Fork & Re-Plan: Plan a ${durationParam || 4} day trip to ${destParam} under ₹${Number(budgetParam || 25000).toLocaleString()}`);
    } else if (searchParams.get('preset') === 'manali') {
      setPrompt('I want to visit Manali for 5 days under 30000 for 2 people with trekking and cafes from Delhi');
      setDestination('Manali');
      setDuration(5);
      setBudget(30000);
      setTravelers(2);
    }
  }, [searchParams]);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

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

    const currentDest = customData.destination || destination.trim() || 'Goa';
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
        if (response.data.data?.requiresHumanInput) {
          setIsHITLModalOpen(true);
        }
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
    const currentDest = destination.trim() || 'Goa';
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
    setIsHITLModalOpen(false);

    const chosenDest = option.destination || destination || 'Goa';
    const chosenBudget = option.budget || budget || 25000;
    const chosenDuration = option.duration || duration || 4;

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
        if (response.data.data?.requiresHumanInput) {
          setIsHITLModalOpen(true);
        }
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
        showToast('🎉 Trip saved to your WanderWave account! View it under "My Trips".', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving trip to database.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      {/* In-App Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-bold">
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Human-in-the-Loop Interruption Modal */}
      <HITLModal
        isOpen={isHITLModalOpen}
        onClose={() => setIsHITLModalOpen(false)}
        clarificationPrompt={analysisResult?.clarificationPrompt}
        options={analysisResult?.humanPromptOptions}
        onSelectOption={handleSelectOption}
        isResuming={resuming}
      />

      {/* Clean User-First Hero Header */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/20 text-center space-y-4 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
          <Sparkles className="w-4 h-4" /> AI-Powered Travel Planning
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Plan Your Next Adventure
        </h1>

        <p className="text-sm text-slate-300 max-w-xl mx-auto font-medium">
          Personalized day-by-day itineraries, smart budget optimization, and real-time guidebook recommendations.
        </p>

        {/* Feature Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-400 pt-2 font-mono">
          <span className="flex items-center gap-1.5 text-cyan-400"><Zap className="w-3.5 h-3.5" /> AI Planning</span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-emerald-400"><DollarSign className="w-3.5 h-3.5" /> Budget Optimization</span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-indigo-400"><Compass className="w-3.5 h-3.5" /> Smart Itinerary</span>
        </div>
      </div>

      {/* Mode Switcher & Quick Destination Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 px-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 flex-shrink-0">Popular Destinations:</span>
          {popularDestinations.map((dest) => (
            <button
              key={dest}
              onClick={() => {
                setDestination(dest);
                if (inputMode === 'prompt') {
                  setPrompt(`Plan a 4 day trip to ${dest} from ${startingCity} under ₹${budget.toLocaleString()} for ${travelers} people`);
                }
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                destination === dest
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              [ {dest} ]
            </button>
          ))}
        </div>

        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setInputMode('wizard')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              inputMode === 'wizard'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" /> Guided Wizard
          </button>
          <button
            onClick={() => setInputMode('prompt')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              inputMode === 'prompt'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" /> Quick Prompt
          </button>
        </div>
      </div>

      {/* AI Planning Progress Visualizer */}
      <AgentVisualizer
        activeStep={activeAgentStep}
        agentLogs={analysisResult?.agentLogs}
        isComplete={Boolean(analysisResult && !analysisResult.requiresHumanInput && !analyzing)}
        requiresHumanInput={Boolean(analysisResult?.requiresHumanInput)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form (Wizard vs Quick Prompt) */}
        <div className="lg:col-span-5 space-y-6">
          {inputMode === 'wizard' ? (
            <MultiStepTripForm onSubmit={handleWizardSubmit} isLoading={analyzing || resuming} />
          ) : (
            <form onSubmit={handleAnalyzePrompt} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Where do you want to go?</span>
                  <span className="text-[10px] text-cyan-400 font-mono">WanderWave AI</span>
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Plan a 4 day trip to Goa from Delhi under 25000 for 2 people with beaches and cafes..."
                  className="w-full p-3 glass-input rounded-2xl text-xs font-medium focus:ring-2 focus:ring-cyan-500/40 leading-relaxed"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-mono tracking-wider text-slate-500">
                  Or Quick Details
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
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Building Your Itinerary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Trip Itinerary</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Star Generated Itinerary & Budget Chart */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* HITL Choice Prompt */}
          {analysisResult?.requiresHumanInput && (
            <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <HelpCircle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase mb-1">
                    ⏸️ Clarification Needed
                  </div>
                  <h3 className="text-base font-bold text-white">Select Preference to Continue</h3>
                  <p className="text-xs text-amber-200/90 mt-0.5">
                    {analysisResult.clarificationPrompt || 'Please select an option below to build your itinerary:'}
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
                <h3 className="text-base font-bold text-white">Your Itinerary Will Appear Here</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Complete the quick wizard or enter a destination above to generate your timeline itinerary.
                </p>
              </div>
            </div>
          )}

          {(analyzing || resuming) && (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
              <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
              <div>
                <h3 className="text-base font-bold text-white">
                  {resuming ? 'Resuming Execution...' : 'Building Your Personalized Itinerary...'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Understanding Preferences ➔ Finding Places ➔ Checking Weather ➔ Optimizing Budget ➔ Creating Itinerary
                </p>
              </div>
            </div>
          )}

          {analysisResult && !analysisResult.requiresHumanInput && !analyzing && !resuming && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* STAR OF THE APPLICATION: The Timeline Itinerary Viewer */}
              <ItineraryViewer
                itinerary={analysisResult.itinerary}
                onSaveTrip={handleSaveTrip}
                onItineraryUpdate={(newItin, newLog) => {
                  setAnalysisResult((prev) => ({
                    ...prev,
                    itinerary: newItin,
                    agentLogs: newLog ? [...(prev?.agentLogs || []), newLog] : (prev?.agentLogs || []),
                  }));
                }}
                isSaving={isSaving}
              />

              {/* Category Budget Allocation Breakdown */}
              <BudgetChart budgetBreakdown={analysisResult.budgetBreakdown} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
