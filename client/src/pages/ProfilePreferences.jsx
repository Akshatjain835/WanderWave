import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Sparkles, Compass, Utensils, Gauge, Check, Save, AlertCircle, Mail, Edit3, ShieldCheck } from 'lucide-react';

export const ProfilePreferences = () => {
  const { user, updateProfileInfo } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [travelStyle, setTravelStyle] = useState(user?.preferences?.travelStyle || 'Balanced');
  const [dietary, setDietary] = useState(user?.preferences?.dietary || 'None');
  const [pace, setPace] = useState(user?.preferences?.pace || 'Moderate');
  const [selectedInterests, setSelectedInterests] = useState(user?.preferences?.interests || ['Trekking', 'Cafes']);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      if (user.preferences) {
        setTravelStyle(user.preferences.travelStyle || 'Balanced');
        setDietary(user.preferences.dietary || 'None');
        setPace(user.preferences.pace || 'Moderate');
        setSelectedInterests(user.preferences.interests || ['Trekking', 'Cafes']);
      }
    }
  }, [user]);

  const interestOptions = [
    'Trekking', 'Cafes', 'Sightseeing', 'Museums', 'Nightlife',
    'Beaches', 'Adventure Sports', 'Shopping', 'Photography', 'Historic Sites',
    'Food Tours', 'Camping', 'Scuba Diving', 'Wellness & Spa'
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

    const profilePayload = {
      name,
      email,
      preferences: {
        travelStyle,
        dietary,
        pace,
        interests: selectedInterests,
      },
    };

    const res = await updateProfileInfo(profilePayload);
    setSaving(false);

    if (res.success) {
      setMessage(res.message || 'Profile & Travel Preferences updated successfully! 🌊');
    } else {
      setIsError(true);
      setMessage(res.message || 'Failed to update profile');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl space-y-8 bg-slate-950/80">
        
        {/* Profile Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-cyan-500/20 border border-cyan-400/30">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{name || 'Explorer'}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  Verified Traveler
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{email || 'user@domain.com'}</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] font-mono text-slate-500 block uppercase font-bold">Active Engine</span>
            <span className="text-xs font-mono text-emerald-400 font-extrabold flex items-center gap-1.5 justify-start sm:justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              LangGraph Memory Active
            </span>
          </div>
        </div>

        {/* Section Heading */}
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-cyan-400" />
            Account & Long-Term Memory Profile
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Update your account details and travel preferences. Your preferences are saved in MongoDB and automatically injected into LangGraph AI prompts.
          </p>
        </div>

        {/* Status Alert Message */}
        {message && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 ${
              isError
                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
            }`}
          >
            {isError ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />}
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. Account Details Section */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <User className="w-4 h-4" /> Personal Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs font-medium focus:ring-2 focus:ring-cyan-500/40 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs font-medium focus:ring-2 focus:ring-cyan-500/40 text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Travel Preferences Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Travel Memory Preferences
            </h3>

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

              {/* Dietary Restrictions */}
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

              {/* Sightseeing Pace */}
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

            {/* Favorite Activity Interests */}
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
          </div>

          {/* Submit Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Profile Changes...' : 'Save Profile & AI Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
