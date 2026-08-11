import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Sparkles, Compass, Utensils, Gauge, Check, Save, AlertCircle } from 'lucide-react';

export const ProfilePreferences = () => {
  const { user, updateUserPrefs } = useAuth();

  const [travelStyle, setTravelStyle] = useState(user?.preferences?.travelStyle || 'Balanced');
  const [dietary, setDietary] = useState(user?.preferences?.dietary || 'None');
  const [pace, setPace] = useState(user?.preferences?.pace || 'Moderate');
  const [selectedInterests, setSelectedInterests] = useState(user?.preferences?.interests || ['Trekking', 'Cafes']);
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const interestOptions = [
    'Trekking', 'Cafes', 'Sightseeing', 'Museums', 'Nightlife',
    'Beaches', 'Adventure Sports', 'Shopping', 'Photography', 'Historic Sites'
  ];

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setIsError(false);

    const newPrefs = {
      travelStyle,
      dietary,
      pace,
      interests: selectedInterests,
    };

    const res = await updateUserPrefs(newPrefs);
    setSaving(false);

    if (res.success) {
      setMessage('Long-Term Memory Preferences updated successfully! 🧠');
    } else {
      setIsError(true);
      setMessage(res.message || 'Failed to update preferences');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800/80">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-cyan-500/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{user?.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                User Profile
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Section Title */}
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Long-Term Travel Memory & AI Preferences
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            These preferences are stored in MongoDB and automatically injected into LangGraph agent prompts for future trips.
          </p>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
              isError
                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
            }`}
          >
            {isError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Travel Style */}
            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" /> Travel Style
              </label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full p-2.5 glass-input rounded-xl text-xs font-medium bg-slate-900 text-slate-200"
              >
                <option value="Adventure">Adventure 🏔️</option>
                <option value="Relaxed">Relaxed 🏖️</option>
                <option value="Cultural">Cultural 🏛️</option>
                <option value="Luxury">Luxury 💎</option>
                <option value="Budget">Budget 🎒</option>
                <option value="Balanced">Balanced ⚖️</option>
              </select>
            </div>

            {/* Dietary Preference */}
            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-cyan-400" /> Dietary Restrictions
              </label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                className="w-full p-2.5 glass-input rounded-xl text-xs font-medium bg-slate-900 text-slate-200"
              >
                <option value="Vegetarian">Vegetarian 🥗</option>
                <option value="Vegan">Vegan 🌱</option>
                <option value="None">No Restrictions 🍖</option>
                <option value="Halal">Halal 🌙</option>
                <option value="Jain">Jain 🙏</option>
              </select>
            </div>

            {/* Pace */}
            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-400" /> Sightseeing Pace
              </label>
              <select
                value={pace}
                onChange={(e) => setPace(e.target.value)}
                className="w-full p-2.5 glass-input rounded-xl text-xs font-medium bg-slate-900 text-slate-200"
              >
                <option value="Fast">Fast Pace (Packed Day) ⚡</option>
                <option value="Moderate">Moderate Pace (Balanced) ⚖️</option>
                <option value="Slow">Slow Pace (Leisurely) 🌿</option>
              </select>
            </div>
          </div>

          {/* Interests Tags */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-3">
              Favorite Activity Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                    <span>{interest}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Memory...' : 'Save Preferences to Memory'}
          </button>
        </form>
      </div>
    </div>
  );
};
