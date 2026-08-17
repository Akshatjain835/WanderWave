import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { fetchDestinationImage } from '../services/imageService';
import {
  Compass,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  Plus,
  Globe,
  Clock,
  Briefcase,
  Users,
  CheckCircle2,
  Brain,
  CloudSun,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroCoverImg, setHeroCoverImg] = useState('');
  const [recentCityImages, setRecentCityImages] = useState({});

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await api.get('/trips');
        if (response.data.success) {
          setUserTrips(response.data.data);
        }
      } catch (err) {
        console.error('Error loading dashboard trips:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  useEffect(() => {
    fetchDestinationImage('Goa').then((url) => setHeroCoverImg(url));
    const cities = ['Goa', 'Jaipur', 'Manali'];
    cities.forEach((city) => {
      fetchDestinationImage(city).then((url) => {
        setRecentCityImages((prev) => ({ ...prev, [city]: url }));
      });
    });
  }, []);

  const totalTripsCount = userTrips.length;
  const totalSpendPlanned = userTrips.reduce((acc, curr) => acc + (curr.budget || 0), 0);
  const uniqueDestinations = new Set(userTrips.map(t => t.destination)).size;
  const totalDaysTraveled = userTrips.reduce((acc, curr) => acc + (curr.duration || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Change 1 — Premium Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800 bg-slate-950 p-8 sm:p-12 min-h-[380px] flex flex-col justify-between shadow-2xl">
        {heroCoverImg && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 transform hover:scale-105 transition-transform duration-1000 pointer-events-none"
            style={{ backgroundImage: `url(${heroCoverImg})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-mono font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-cyan-400" /> WANDERWAVE AI ENGINE
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
              Plan smarter.<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Travel better.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-medium pt-2">
              AI-powered personalized trips built around your budget, interests, and travel style.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to="/plan"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/30 flex items-center gap-3 transition-all hover:scale-[1.03]"
            >
              <span>Plan My Trip</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </Link>

            <Link
              to="/trips"
              className="px-6 py-4 rounded-2xl glass-card hover:bg-slate-800/80 text-white font-extrabold text-sm flex items-center gap-2 transition-all border border-slate-700"
            >
              <Briefcase className="w-4.5 h-4.5 text-cyan-400" />
              <span>Saved Trips ({userTrips.length})</span>
            </Link>
          </div>
        </div>

        {/* Change 1 — AI Planning Capability Badges */}
        <div className="relative z-10 pt-8 border-t border-slate-800/80 mt-6">
          <span className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider block mb-3">
            AI Planning Capabilities:
          </span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-2 text-cyan-300">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Personalized itinerary</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Budget optimization</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-300">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Weather-aware planning</span>
            </div>
            <div className="flex items-center gap-2 text-amber-300">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Real destination research</span>
            </div>
            <div className="flex items-center gap-2 text-purple-300">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <span>AI validation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Travel Stats Row */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
          Your Travel Insights
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-white">{totalTripsCount}</p>
              <span className="text-[11px] text-slate-400 font-medium">Trips Planned</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black font-mono text-lg flex items-center justify-center">
              ₹
            </div>
            <div>
              <p className="text-xl font-extrabold text-emerald-400">
                ₹{totalSpendPlanned > 0 ? (totalSpendPlanned >= 100000 ? `${(totalSpendPlanned / 100000).toFixed(1)}L` : totalSpendPlanned.toLocaleString()) : '0'}
              </p>
              <span className="text-[11px] text-slate-400 font-medium">Planned Budget</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-white">{uniqueDestinations}</p>
              <span className="text-[11px] text-slate-400 font-medium">Destinations</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-white">{totalDaysTraveled}</p>
              <span className="text-[11px] text-slate-400 font-medium">Days Traveled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Destination Presets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
            Explore Top AI Destinations
          </h2>
          <Link to="/trips" className="text-xs font-semibold text-cyan-400 hover:underline">
            View All Saved Trips →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {['Goa', 'Jaipur', 'Manali'].map((city, idx) => (
            <Link
              key={city}
              to={`/plan?preset=${city.toLowerCase()}`}
              className="glass-panel rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-500/40 transition-all group hover:scale-[1.02]"
            >
              <div
                className="h-40 bg-cover bg-center relative"
                style={{
                  backgroundImage: recentCityImages[city] ? `url(${recentCityImages[city]})` : undefined,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 text-cyan-300 text-[10px] font-mono font-bold border border-slate-800 backdrop-blur-sm">
                  {idx === 0 ? '4 Days' : idx === 1 ? '3 Days' : '5 Days'}
                </span>
              </div>
              <div className="p-4 bg-slate-900/90 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {city}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ₹{idx === 0 ? '25,000' : idx === 1 ? '18,000' : '30,000'} • 2 Travelers
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
