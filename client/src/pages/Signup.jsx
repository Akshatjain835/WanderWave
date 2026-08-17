import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, User, Mail, Lock, Sparkles, ArrowRight, AlertCircle, Utensils, Compass as CompassIcon } from 'lucide-react';

export const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [travelStyle, setTravelStyle] = useState('Adventure');
  const [dietary, setDietary] = useState('Vegetarian');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const userData = {
      name,
      email,
      password,
      preferences: {
        travelStyle,
        dietary,
        pace: 'Moderate',
      },
    };

    const res = await signup(userData);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setFormError(res.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Background glow elements */}
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative">
        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800/80">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-2">
              <Compass className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Create WanderWave Account
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Start building agentic, self-correcting itineraries with LangGraph
            </p>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivers"
                  className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs font-medium focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs font-medium focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs font-medium focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>
            </div>

            {/* Travel Preference Setup for Memory Agent */}
            <div className="pt-2 border-t border-slate-800/80">
              <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Long-Term Memory Preferences
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                    <CompassIcon className="w-3 h-3 text-cyan-400" /> Default Travel Style
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
                    <option value="Balanced">Balanced ⚖️</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-cyan-400" /> Dietary Preference
                  </label>
                  <select
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    className="w-full py-2 px-3 glass-input rounded-xl text-xs font-medium bg-slate-900 text-slate-200"
                  >
                    <option value="Vegetarian">Vegetarian 🥗</option>
                    <option value="Vegan">Vegan 🌱</option>
                    <option value="None">No Restriction 🍖</option>
                    <option value="Halal">Halal 🌙</option>
                    <option value="Jain">Jain 🙏</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
            >
              {isSubmitting ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account & Start</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
