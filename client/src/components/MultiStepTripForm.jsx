import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Compass,
  Utensils,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  RefreshCcw,
  ArrowLeftRight,
} from 'lucide-react';
import api from '../services/api';

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  AED: 'AED ',
  THB: '฿',
};

export const MultiStepTripForm = ({ onSubmit, isLoading }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [currency, setCurrency] = useState('INR');
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState({
    USD: 1.0,
    INR: 83.75,
    EUR: 0.92,
    GBP: 0.78,
    JPY: 155.20,
  });

  const [formData, setFormData] = useState({
    destination: 'Goa',
    startingCity: 'Delhi',
    duration: 4,
    startDate: new Date().toISOString().split('T')[0],
    budget: 25000,
    travelers: 2,
    travelStyle: 'Relaxed',
    interests: ['Sightseeing', 'Cafes', 'Beaches'],
    dietary: 'No Preference',
  });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await api.get('/currency/rates');
        if (response.data.success && response.data.rates) {
          setExchangeRates(response.data.rates);
        }
      } catch (err) {
        console.warn('Using fallback rates for currency converter:', err.message);
      }
    };
    fetchRates();
  }, []);

  const popularDestinations = ['Goa', 'Manali', 'Mysore', 'Jaipur', 'Dubai', 'Kerala', 'Ladakh'];
  const travelStyles = [
    { id: 'Adventure', label: 'Adventure 🏔️', desc: 'Trekking, hiking & outdoor thrills' },
    { id: 'Relaxed', label: 'Relaxed 🏖️', desc: 'Scenic views, beaches & chill vibes' },
    { id: 'Cultural', label: 'Cultural 🏛️', desc: 'Palaces, heritage stepwells & local markets' },
    { id: 'Luxury', label: 'Luxury 💎', desc: '5-star resorts, private cabana & gourmet dining' },
  ];
  const interestOptions = ['Sightseeing', 'Cafes', 'Beaches', 'Nightlife', 'Trekking', 'Shopping', 'Heritage', 'Water Sports'];
  const dietaryOptions = ['No Preference', 'Vegetarian 🥗', 'Vegan 🌿', 'Halal 🕌', 'Non-Veg 🍗'];

  // Normalize input budget to base INR for AI Budget Agent
  const calculateNormalizedINR = (amt, curr) => {
    const rateINR = exchangeRates.INR || 83.75;
    const rateCurr = exchangeRates[curr] || 1.0;
    if (curr === 'INR') return amt;
    return Math.round((amt / rateCurr) * rateINR);
  };

  // Convert normalized INR to user's selected display currency
  const calculateDisplayConverted = (inrAmt, targetCurr) => {
    const rateINR = exchangeRates.INR || 83.75;
    const rateTarget = exchangeRates[targetCurr] || 1.0;
    const usdVal = inrAmt / rateINR;
    const targetVal = usdVal * rateTarget;
    if (targetCurr === 'JPY') return Math.round(targetVal);
    return Math.round(targetVal * 100) / 100;
  };

  const normalizedINR = calculateNormalizedINR(formData.budget, currency);
  const convertedDisplay = calculateDisplayConverted(normalizedINR, displayCurrency);

  const handleInterestToggle = (interest) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        return { ...prev, interests: prev.interests.filter((i) => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const promptText = `Plan a ${formData.duration} day ${formData.travelStyle.toLowerCase()} trip to ${formData.destination} starting from ${formData.startingCity} for ${formData.travelers} people under ₹${normalizedINR.toLocaleString()} INR (${CURRENCY_SYMBOLS[currency]}${formData.budget.toLocaleString()} ${currency}). Interests: ${formData.interests.join(', ')}. Dietary: ${formData.dietary}.`;
    
    // Pass normalized budget in INR + currency preferences to parent
    onSubmit(promptText, {
      ...formData,
      budget: normalizedINR,
      originalBudget: formData.budget,
      inputCurrency: currency,
      displayCurrency: displayCurrency,
    });
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
      {/* Step Header Indicator */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Guided Wizard • Step {currentStep} of 4
          </span>
          <h2 className="text-lg font-bold text-white mt-0.5">
            {currentStep === 1 && 'Where & When are you traveling?'}
            {currentStep === 2 && 'Set your trip duration & travel dates'}
            {currentStep === 3 && 'Define your budget cap & group size'}
            {currentStep === 4 && 'Tailor your travel style & interests'}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                currentStep === step
                  ? 'bg-cyan-400 ring-4 ring-cyan-500/20'
                  : currentStep > step
                  ? 'bg-emerald-400'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Destination & Origin */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Destination City</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400" />
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="e.g. Goa, Manali, Jaipur, Dubai, Paris..."
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Popular Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="text-[11px] text-slate-400 font-mono">Popular:</span>
                {popularDestinations.map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => setFormData({ ...formData, destination: dest })}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-medium transition-all border ${
                      formData.destination.toLowerCase() === dest.toLowerCase()
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Starting Origin City</label>
              <div className="relative">
                <Compass className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.startingCity}
                  onChange={(e) => setFormData({ ...formData, startingCity: e.target.value })}
                  placeholder="e.g. Delhi, Mumbai, Bangalore..."
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Duration & Dates */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">Trip Duration (Days)</label>
                <span className="text-sm font-extrabold text-cyan-400">{formData.duration} Days</span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full accent-cyan-500 bg-slate-900 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>1 Day</span>
                <span>7 Days</span>
                <span>14 Days</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Trip Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400" />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Budget, Currency Converter & Group Size */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Budget Amount + Input Currency Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Total Budget Cap ({currency})
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-2.5 text-sm font-black text-emerald-400 font-mono">
                      {CURRENCY_SYMBOLS[currency] || '₹'}
                    </span>
                    <input
                      type="number"
                      step="100"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      required
                    />
                  </div>

                  {/* Input Currency Dropdown */}
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="INR">INR 🇮🇳</option>
                    <option value="USD">USD 🇺🇸</option>
                    <option value="EUR">EUR 🇪🇺</option>
                    <option value="GBP">GBP 🇬🇧</option>
                    <option value="JPY">JPY 🇯🇵</option>
                    <option value="AUD">AUD 🇦🇺</option>
                    <option value="CAD">CAD 🇨🇦</option>
                    <option value="SGD">SGD 🇸🇬</option>
                    <option value="AED">AED 🇦🇪</option>
                    <option value="THB">THB 🇹🇭</option>
                  </select>
                </div>
              </div>

              {/* Display Currency Converter */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Display Conversion Currency
                </label>
                <select
                  value={displayCurrency}
                  onChange={(e) => setDisplayCurrency(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="USD">USD 🇺🇸 (US Dollar)</option>
                  <option value="INR">INR 🇮🇳 (Indian Rupee)</option>
                  <option value="EUR">EUR 🇪🇺 (Euro)</option>
                  <option value="GBP">GBP 🇬🇧 (British Pound)</option>
                  <option value="JPY">JPY 🇯🇵 (Japanese Yen)</option>
                  <option value="AUD">AUD 🇦🇺 (Australian Dollar)</option>
                  <option value="CAD">CAD 🇨🇦 (Canadian Dollar)</option>
                  <option value="SGD">SGD 🇸🇬 (Singapore Dollar)</option>
                  <option value="AED">AED 🇦🇪 (UAE Dirham)</option>
                  <option value="THB">THB 🇹🇭 (Thai Baht)</option>
                </select>
              </div>
            </div>

            {/* Live Exchange Rate & Normalization Preview Card */}
            <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 space-y-2 bg-slate-950/80">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" /> Normalized Base Budget:
                </span>
                <span className="text-emerald-400 font-extrabold text-sm">
                  ₹{normalizedINR.toLocaleString()} INR
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-slate-800/80 text-slate-300">
                <span className="text-slate-400">Target Display Conversion:</span>
                <span className="text-cyan-300 font-bold">
                  ≈ {CURRENCY_SYMBOLS[displayCurrency]}{convertedDisplay.toLocaleString()} {displayCurrency}
                </span>
              </div>
            </div>

            {/* Travelers Count */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Number of Travelers</label>
              <div className="relative">
                <Users className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.travelers}
                  onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Travel Style & Interests */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Travel Style</label>
              <div className="grid grid-cols-2 gap-2.5">
                {travelStyles.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, travelStyle: style.id })}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      formData.travelStyle === style.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="block font-bold text-xs text-white">{style.label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Interests (Select multiple)</label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => {
                  const selected = formData.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        selected
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Dietary Preference</label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((diet) => (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => setFormData({ ...formData, dietary: diet })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      formData.dietary === diet
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl glass-card text-slate-300 font-bold text-xs flex items-center gap-1 hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-lg shadow-cyan-500/20"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-xl shadow-cyan-500/30 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'Building AI Plan...' : 'Generate Trip Plan'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
