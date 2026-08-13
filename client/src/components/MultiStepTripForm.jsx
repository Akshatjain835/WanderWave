import React, { useState } from 'react';
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
} from 'lucide-react';

export const MultiStepTripForm = ({ onSubmit, isLoading }) => {
  const [currentStep, setCurrentStep] = useState(1);
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

  const popularDestinations = ['Goa', 'Manali', 'Mysore', 'Jaipur', 'Dubai', 'Kerala', 'Ladakh'];
  const travelStyles = [
    { id: 'Adventure', label: 'Adventure 🏔️', desc: 'Trekking, hiking & outdoor thrills' },
    { id: 'Relaxed', label: 'Relaxed 🏖️', desc: 'Scenic views, beaches & chill vibes' },
    { id: 'Cultural', label: 'Cultural 🏛️', desc: 'Palaces, heritage stepwells & local markets' },
    { id: 'Luxury', label: 'Luxury 💎', desc: '5-star resorts, private cabana & gourmet dining' },
  ];
  const interestOptions = ['Sightseeing', 'Cafes', 'Beaches', 'Nightlife', 'Trekking', 'Shopping', 'Heritage', 'Water Sports'];
  const dietaryOptions = ['No Preference', 'Vegetarian 🥗', 'Vegan 🌿', 'Halal 🕌', 'Non-Veg 🍗'];

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
    const promptText = `Plan a ${formData.duration} day ${formData.travelStyle.toLowerCase()} trip to ${formData.destination} starting from ${formData.startingCity} for ${formData.travelers} people under ₹${formData.budget.toLocaleString()}. Interests: ${formData.interests.join(', ')}. Dietary: ${formData.dietary}.`;
    onSubmit(promptText, formData);
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
                  ? 'bg-cyan-400 ring-4 ring-cyan-500/20 scale-110'
                  : currentStep > step
                  ? 'bg-emerald-400'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Destination & Origin */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Destination City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400" />
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. Goa, Manali, Jaipur"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Starting / Departure City
                </label>
                <div className="relative">
                  <Compass className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.startingCity}
                    onChange={(e) => setFormData({ ...formData, startingCity: e.target.value })}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. Delhi, Mumbai, Bangalore"
                  />
                </div>
              </div>
            </div>

            {/* Popular Presets */}
            <div>
              <span className="block text-xs text-slate-400 mb-2">Popular Trending Destinations</span>
              <div className="flex flex-wrap gap-2">
                {popularDestinations.map((dest) => (
                  <button
                    type="button"
                    key={dest}
                    onClick={() => setFormData({ ...formData, destination: dest })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      formData.destination === dest
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {dest}
                  </button>
                ))}
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

        {/* Step 3: Budget & Travelers */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Total Budget Cap (₹ INR)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-emerald-400" />
                  <input
                    type="number"
                    step="1000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

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

            {/* Quick Budget Tiers */}
            <div>
              <span className="block text-xs text-slate-400 mb-2">Quick Budget Presets</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Backpacker 🎒', amount: 15000 },
                  { label: 'Balanced 🏨', amount: 35000 },
                  { label: 'Luxury 💎', amount: 75000 },
                ].map((tier) => (
                  <button
                    type="button"
                    key={tier.amount}
                    onClick={() => setFormData({ ...formData, budget: tier.amount })}
                    className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                      formData.budget === tier.amount
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {tier.label}
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                      ₹{tier.amount.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Travel Style & Interests */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Travel Styles */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Travel Style</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {travelStyles.map((style) => (
                  <button
                    type="button"
                    key={style.id}
                    onClick={() => setFormData({ ...formData, travelStyle: style.id })}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      formData.travelStyle === style.id
                        ? 'bg-cyan-500/10 border-cyan-500 text-white ring-1 ring-cyan-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="block text-xs font-bold text-cyan-400">{style.label}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Activities & Interests</label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => {
                  const selected = formData.interests.includes(interest);
                  return (
                    <button
                      type="button"
                      key={interest}
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        selected
                          ? 'bg-cyan-500 border-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {interest} {selected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dietary Preference */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Dietary Preference</label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((diet) => (
                  <button
                    type="button"
                    key={diet}
                    onClick={() => setFormData({ ...formData, dietary: diet })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      formData.dietary === diet
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Form Controls */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold hover:bg-slate-800 border border-slate-800 transition-all"
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
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-extrabold hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'Agents Executing...' : 'Generate AI Itinerary'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
