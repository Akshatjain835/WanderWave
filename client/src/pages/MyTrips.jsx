import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Trash2,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  AlertTriangle,
  Plus,
  ArrowRight,
  Sun,
  Utensils,
  Camera,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyTrips = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/trips');
      if (response.data.success) {
        setTrips(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching user trips from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip from your account?')) return;
    setUpdatingId(tripId);
    try {
      const response = await api.delete(`/trips/${tripId}`);
      if (response.data.success) {
        setTrips((prev) => prev.filter((t) => t._id !== tripId));
        if (selectedTrip?._id === tripId) setSelectedTrip(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting trip.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateStatus = async (tripId, newStatus) => {
    setUpdatingId(tripId);
    try {
      const response = await api.patch(`/trips/${tripId}/status`, { status: newStatus });
      if (response.data.success) {
        setTrips((prev) =>
          prev.map((t) => (t._id === tripId ? { ...t, status: newStatus } : t))
        );
        if (selectedTrip?._id === tripId) {
          setSelectedTrip((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating trip status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ongoing':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase font-mono">🟢 Ongoing</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold uppercase font-mono">🟣 Completed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold uppercase font-mono">🔵 Planned</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" /> Day 9: MongoDB Trip Persistence & User Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Saved AI Trips ({trips.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your saved itineraries, budget breakdowns, and trip execution statuses.
          </p>
        </div>

        <Link
          to="/plan-trip"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Plan New AI Trip
        </Link>
      </div>

      {loading && (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading saved trips from MongoDB...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && trips.length === 0 && !error && (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-400 border border-slate-800">
            <Compass className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Saved Trips Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              You haven't saved any trips to your MongoDB account. Create a new trip with our Agentic AI planner!
            </p>
          </div>
          <Link
            to="/plan-trip"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <span>Plan Your First Trip</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Saved Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <div
            key={trip._id}
            className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {getStatusBadge(trip.status)}
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(trip.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white line-clamp-1">{trip.tripTitle}</h3>
                <p className="text-xs text-cyan-400 font-semibold flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {trip.destination} • From {trip.startingCity}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-center">
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-mono">Duration</p>
                  <p className="text-xs font-bold text-white">{trip.duration} Days</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-mono">Budget</p>
                  <p className="text-xs font-bold text-emerald-400">₹{trip.budget?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-mono">Travelers</p>
                  <p className="text-xs font-bold text-white">{trip.travelers} People</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex items-center justify-between pt-3 gap-2">
              <button
                onClick={() => setSelectedTrip(trip)}
                className="flex-1 py-2 px-3 rounded-xl glass-card hover:border-cyan-500/40 text-cyan-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Eye className="w-3.5 h-3.5" /> View Itinerary
              </button>

              <select
                value={trip.status}
                onChange={(e) => handleUpdateStatus(trip._id, e.target.value)}
                disabled={updatingId === trip._id}
                className="py-2 px-2 rounded-xl glass-input text-[11px] font-mono text-slate-300 bg-slate-900 border border-slate-800"
              >
                <option value="planned">Planned</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>

              <button
                onClick={() => handleDeleteTrip(trip._id)}
                disabled={updatingId === trip._id}
                className="p-2 rounded-xl glass-card hover:border-rose-500/40 text-rose-400 transition-all"
                title="Delete Trip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Itinerary Modal View */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-800 p-6 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge(selectedTrip.status)}
                  <span className="text-xs font-mono text-slate-400">
                    Saved on {new Date(selectedTrip.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{selectedTrip.tripTitle}</h2>
              </div>
              <button
                onClick={() => setSelectedTrip(null)}
                className="px-3 py-1.5 rounded-xl glass-card hover:bg-slate-800 text-xs font-bold text-slate-400"
              >
                Close
              </button>
            </div>

            {/* Budget Breakdown */}
            {selectedTrip.budgetBreakdown && (
              <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-white">Budget Allocation Breakdown</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[9px] text-slate-400 font-mono">STAY</p>
                    <p className="font-bold text-white">₹{selectedTrip.budgetBreakdown.accommodation_stay?.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[9px] text-slate-400 font-mono">TRANSIT</p>
                    <p className="font-bold text-white">₹{selectedTrip.budgetBreakdown.transportation?.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[9px] text-slate-400 font-mono">MEALS</p>
                    <p className="font-bold text-white">₹{selectedTrip.budgetBreakdown.food_and_meals?.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[9px] text-slate-400 font-mono">ACTIVITIES</p>
                    <p className="font-bold text-white">₹{selectedTrip.budgetBreakdown.activities_and_sightseeing?.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[9px] text-slate-400 font-mono">CUSHION</p>
                    <p className="font-bold text-rose-300">₹{selectedTrip.budgetBreakdown.emergency_cushion?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Days Timeline */}
            {selectedTrip.itinerary?.days?.map((d) => (
              <div key={d.day_number} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-cyan-400">
                  Day {d.day_number}: {d.title} • <span className="text-slate-400">{d.weather_snippet}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {d.morning && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 space-y-1">
                      <p className="text-[10px] text-amber-400 font-mono font-bold">🌅 Morning ({d.morning.time})</p>
                      <p className="font-bold text-white">{d.morning.activity}</p>
                      <p className="text-[11px] text-slate-400">{d.morning.location}</p>
                    </div>
                  )}

                  {d.afternoon && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 space-y-1">
                      <p className="text-[10px] text-cyan-400 font-mono font-bold">☀️ Afternoon ({d.afternoon.time})</p>
                      <p className="font-bold text-white">{d.afternoon.activity}</p>
                      <p className="text-[11px] text-slate-400">{d.afternoon.location}</p>
                    </div>
                  )}

                  {d.evening && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 space-y-1">
                      <p className="text-[10px] text-indigo-400 font-mono font-bold">🌆 Evening ({d.evening.time})</p>
                      <p className="font-bold text-white">{d.evening.activity}</p>
                      <p className="text-[11px] text-slate-400">{d.evening.location}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
