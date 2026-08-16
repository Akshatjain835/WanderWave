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
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingCoverImg, setUpcomingCoverImg] = useState('');
  const [recentCityImages, setRecentCityImages] = useState({});

  // Time of day greeting generator
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

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

  const upcomingTrip = userTrips[0] || {
    _id: 'default-goa',
    destination: 'Goa',
    duration: 4,
    travelers: 2,
    budget: 25000,
    travelStyle: 'Relaxed',
    dateRange: 'Oct 12 – Oct 15',
  };

  useEffect(() => {
    if (upcomingTrip?.destination) {
      fetchDestinationImage(upcomingTrip.destination).then((url) => setUpcomingCoverImg(url));
    }
  }, [upcomingTrip?.destination]);

  useEffect(() => {
    const cities = ['Goa', 'Jaipur', 'Manali'];
    cities.forEach((city) => {
      fetchDestinationImage(city).then((url) => {
        setRecentCityImages((prev) => ({ ...prev, [city]: url }));
      });
    });
  }, []);

  // Travel Stats calculation
  const totalTripsCount = Math.max(12, userTrips.length);
  const totalSpendPlanned = userTrips.length > 0 
    ? userTrips.reduce((acc, curr) => acc + (curr.budget || 0), 0)
    : 120000;
  const uniqueDestinations = Math.max(8, new Set(userTrips.map(t => t.destination)).size);
  const totalDaysTraveled = Math.max(24, userTrips.reduce((acc, curr) => acc + (curr.duration || 0), 0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. Header: Greeting & Primary Action Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {getGreeting()}, <span className="text-cyan-400">{user?.name || 'Akshat'}</span> 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Where are we going next?
          </p>
        </div>

        <Link
          to="/plan"
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {/* 2. Upcoming Trip Feature Card with Dynamic Cover Image */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
          Upcoming Trip
        </h2>

        <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800 bg-slate-900/80 min-h-[220px] flex flex-col md:flex-row items-stretch justify-between group hover:border-slate-700 transition-all">
          <div
            className="md:w-1/2 min-h-[180px] bg-cover bg-center relative"
            style={{
              backgroundImage: upcomingCoverImg ? `url(${upcomingCoverImg})` : undefined,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-950/40 to-slate-950 md:block hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent md:hidden" />
          </div>

          <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold mb-2">
                🏝️ Next Destination
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {upcomingTrip.destination || 'Goa'}
              </h3>
              <p className="text-xs font-mono text-cyan-300 mt-1 font-semibold">
                {upcomingTrip.dateRange || 'Upcoming Season'}
              </p>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                {upcomingTrip.duration || 4} days • {upcomingTrip.travelers || 2} travelers • ₹{(upcomingTrip.budget || 25000).toLocaleString()} Cap
              </p>
            </div>

            <Link
              to={upcomingTrip._id.startsWith('default') ? '/plan?preset=goa' : '/trips'}
              className="inline-flex items-center gap-2 text-xs font-extrabold text-cyan-400 hover:text-cyan-300 group-hover:translate-x-1 transition-transform"
            >
              <span>View itinerary</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Your Travel Stats Row */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
          Your Travel Stats
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
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-emerald-400">
                ₹{(totalSpendPlanned / 100000).toFixed(1)}L
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

      {/* 4. Recent Trips Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
            Recent Trips
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
                className="h-36 bg-cover bg-center relative"
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
