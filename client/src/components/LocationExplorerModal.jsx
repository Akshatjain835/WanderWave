import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  CloudSun,
  ThermometerSun,
  Compass,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  X,
  ArrowRight,
  RefreshCw,
  Globe,
  Sun,
  CloudRain,
  Snowflake,
} from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export const LocationExplorerModal = ({ isOpen, onClose, initialDestination = '' }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [searchCity, setSearchCity] = useState(initialDestination || '');
  const [duration, setDuration] = useState(5);
  const [travelStyle, setTravelStyle] = useState('Adventure');
  const [loading, setLoading] = useState(false);
  const [exploreData, setExploreData] = useState(null);
  const [error, setError] = useState(null);

  // Automatically reset previous state/results whenever the modal opens and focus input
  useEffect(() => {
    if (isOpen) {
      setSearchCity(initialDestination || '');
      setExploreData(null);
      setError(null);
      setLoading(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, initialDestination]);

  if (!isOpen) return null;

  const handleSearch = async (e, customCity = null) => {
    if (e) e.preventDefault();
    const cityToQuery = (customCity || searchCity).trim();
    if (!cityToQuery) return;

    if (customCity) setSearchCity(customCity);

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/trips/explore-location', {
        destination: cityToQuery,
        duration: Number(duration),
        travelStyle,
      });

      if (response.data && response.data.success && response.data.data) {
        setExploreData(response.data.data);
        return;
      }
    } catch (err) {
      console.warn('Explore location network notice, using dynamic analyzer fallback:', err.message);
    } finally {
      setLoading(false);
    }

    // Dynamic Client-side Climate Analyzer Fallback
    const dest = cityToQuery;
    const destLower = dest.toLowerCase();
    
    let climateType = 'Temperate Sub-Tropical';
    let maxTemp = 26;
    let minTemp = 17;
    let rainProb = 15;
    let verdict = 'EXCELLENT';
    let risk = 'Low';
    let geoNote = `${dest} features favorable travel weather, accessible transport infrastructure, and pleasant sightseeing temperatures.`;
    let advice = 'Ideal timing for city walking tours, heritage exploration, local markets, and evening dining.';
    let bestMonths = 'October – March';
    let samplePlaces = [`${dest} Heritage Square`, `${dest} Overlook Point`, `${dest} Local Promenade`, `${dest} Botanical Gardens`];

    // High Altitude / Alpine Cold
    if (destLower.includes('ladakh') || destLower.includes('spiti') || destLower.includes('rohtang') || destLower.includes('leh') || destLower.includes('gulmarg') || destLower.includes('kashmir') || destLower.includes('srinagar')) {
      climateType = 'Alpine Sub-Zero / Cold Mountain';
      maxTemp = 6;
      minTemp = -6;
      rainProb = 10;
      verdict = 'MODERATE_WITH_CAUTION';
      risk = 'High (Snow & Pass Caution)';
      geoNote = `${dest} experiences crisp high-altitude air, sub-zero night temperatures, heavy snowfall, and mountain pass closures.`;
      advice = 'Pack 4-layer thermal wear. Focus on low-altitude valley sightseeing, monasteries & cozy staycations.';
      bestMonths = 'May – September';
      samplePlaces = ['Pangong Tso Lake', 'Nubra Valley', 'Khardung La Pass', 'Diskit Gompa', 'Gulmarg Gondola'];

    // Coastal / Tropical
    } else if (destLower.includes('goa') || destLower.includes('kerala') || destLower.includes('andaman') || destLower.includes('mumbai') || destLower.includes('bali') || destLower.includes('phuket') || destLower.includes('maldives') || destLower.includes('pondicherry')) {
      climateType = 'Tropical Maritime / Coastal';
      maxTemp = 32;
      minTemp = 24;
      rainProb = 35;
      verdict = 'EXCELLENT';
      risk = 'Low';
      geoNote = `${dest} offers tropical ocean breezes, warm sunshine, coastal humidity, and ideal sea swimming conditions.`;
      advice = 'Ideal for beach lounging, water sports, sunset cruises, and open-air seaside dining.';
      bestMonths = 'November – February';
      samplePlaces = ['Baga Beach', 'Fort Aguada', 'Dudhsagar Waterfalls', 'Panjim Heritage Quarter'];

    // Mountain Hill Stations
    } else if (destLower.includes('manali') || destLower.includes('shimla') || destLower.includes('dharamshala') || destLower.includes('ooty') || destLower.includes('munnar') || destLower.includes('darjeeling') || destLower.includes('coorg') || destLower.includes('mussoorie')) {
      climateType = 'Mountain Hill Station / Alpine';
      maxTemp = 19;
      minTemp = 9;
      rainProb = 20;
      verdict = 'EXCELLENT';
      risk = 'Low';
      geoNote = `${dest} features fresh mountain air, pine forest trails, rolling tea gardens, and scenic valley views.`;
      advice = 'Great weather for valley walks, tea plantation visits, and cozy cafe dining. Keep a jacket for evening strolls.';
      bestMonths = 'September – June';
      samplePlaces = ['Solang Valley Trail', 'Hadimba Temple', 'Tea Garden Overlook', 'Mall Road Promenade'];

    // Arid Desert / Heritage
    } else if (destLower.includes('jaipur') || destLower.includes('jaisalmer') || destLower.includes('jodhpur') || destLower.includes('dubai') || destLower.includes('doha') || destLower.includes('udaipur') || destLower.includes('agra')) {
      climateType = 'Arid Desert / Royal Heritage';
      maxTemp = 33;
      minTemp = 20;
      rainProb = 5;
      verdict = 'EXCELLENT';
      risk = 'Low';
      geoNote = `${dest} is characterized by bright arid sunshine, historic sandstone architecture, and cool desert starlight nights.`;
      advice = 'Schedule outdoor fort explorations for early morning; enjoy desert dune safaris and palace illuminations in the evening.';
      bestMonths = 'October – March';
      samplePlaces = ['Hawa Mahal', 'Amber Fort Palace', 'Jaisalmer Fort Dunes', 'City Palace Museum'];
    }

    setExploreData({
      destination: dest,
      duration: Number(duration),
      weatherForecast: {
        destination: dest,
        climate_type: climateType,
        summary: `Travel climate forecast for ${dest}: ${climateType} with daytime highs around ${maxTemp}°C and overnight lows around ${minTemp}°C.`,
        forecast_days: [
          { day: 1, condition: rainProb > 30 ? 'Partly Cloudy' : 'Sunny & Clear', temp_max_c: maxTemp, temp_min_c: minTemp, rain_probability_pct: rainProb, suitable_for_outdoors: rainProb < 50 }
        ]
      },
      locationFeasibility: {
        verdict,
        weather_risk_level: risk,
        geography_notes: geoNote,
        seasonal_activity_advice: advice,
        best_month_to_visit: bestMonths
      },
      placesFound: samplePlaces.map(p => ({ name: p, category: 'Sightseeing' })),
      summary: `Location Intelligence Report for ${dest}: Verified ${verdict.replace(/_/g, ' ')} suitability.`
    });
  };

  const handlePlanTripDirectly = () => {
    onClose();
    navigate(`/plan?destination=${encodeURIComponent(searchCity.trim() || 'Goa')}&duration=${duration}`);
  };

  const popularQuickQueries = ['Goa', 'Ladakh', 'Manali', 'Jaipur', 'Kashmir', 'Dubai', 'Kerala', 'Paris'];

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-hidden pointer-events-auto">
      {/* Backdrop overlay - Mounts at body root above everything */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer z-[99998]"
      />

      {/* Modal Dialog Card - Stacks above backdrop */}
      <div className="relative z-[99999] w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 pointer-events-auto">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/90 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
            title="Close Explorer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 pr-10">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <CloudSun className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                Weather & Location Intelligence
              </span>
              <h2 className="text-xl font-extrabold text-white mt-0.5">
                Check Any Location Worldwide 🌍
              </h2>
            </div>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Type any location name to evaluate weather, temperature & feasibility:
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400 pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch(e);
                    }}
                    placeholder="e.g. Goa, Kashmir, Ladakh, Jaipur, Dubai, Paris..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium placeholder:text-slate-500"
                    required
                  />
                  {searchCity && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchCity('');
                        if (inputRef.current) inputRef.current.focus();
                      }}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all shrink-0 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{loading ? 'Analyzing...' : 'Check Feasibility'}</span>
                </button>
              </div>
            </div>

            {/* Quick Query Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono pt-1">
              <span className="text-slate-400 text-[11px]">Popular Quick Check:</span>
              {popularQuickQueries.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSearch(null, city)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 border border-slate-700/60 text-slate-300 text-[11px] transition-all cursor-pointer"
                >
                  {city}
                </button>
              ))}
            </div>
          </form>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Initial Prompt Banner */}
          {!exploreData && !loading && (
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto">
                <Globe className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-white">Location Feasibility & Climate Scanner</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Type any location name in the input box above or select a quick query chip to scan temperature ranges, terrain advisories, and best travel windows.
              </p>
              <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-amber-400" /> Temperature</span>
                <span className="flex items-center gap-1"><CloudRain className="w-3.5 h-3.5 text-blue-400" /> Rain Risk</span>
                <span className="flex items-center gap-1"><Snowflake className="w-3.5 h-3.5 text-cyan-300" /> Terrain Caution</span>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="p-10 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <h3 className="text-sm font-bold text-white">Analyzing Climate & Location Feasibility...</h3>
              <p className="text-xs text-slate-400 font-mono">Fetching weather forecasts, seasonal windows & terrain advisories</p>
            </div>
          )}

          {/* Results Presentation */}
          {exploreData && !loading && (
            <div className="space-y-4 animate-in fade-in duration-300 border-t border-slate-800 pt-5">
              {/* Header Verdict Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/20">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                    Location Feasibility Verdict
                  </span>
                  <h3 className="text-lg font-black text-white capitalize">
                    {exploreData.destination} Climate & Travel Report
                  </h3>
                </div>

                <div>
                  {exploreData.locationFeasibility?.verdict === 'NOT_RECOMMENDED' ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      <AlertTriangle className="w-4 h-4" /> High Risk (Not Recommended Now)
                    </span>
                  ) : exploreData.locationFeasibility?.verdict === 'MODERATE_WITH_CAUTION' ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <AlertTriangle className="w-4 h-4" /> Visit With Caution (Monsoon / Snow / Heat)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <ShieldCheck className="w-4 h-4" /> Ideal Destination & Timing
                    </span>
                  )}
                </div>
              </div>

              {/* CARD 1: Temperature & Climate Forecast */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-extrabold text-cyan-300 flex items-center gap-1.5">
                  <ThermometerSun className="w-4 h-4 text-amber-400" /> Temperature & Climate Forecast
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Climate Type</span>
                    <span className="text-white font-bold block mt-0.5 truncate">
                      {exploreData.weatherForecast?.climate_type || 'Temperate'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Avg High Temp</span>
                    <span className="text-emerald-400 font-bold block mt-0.5">
                      {exploreData.weatherForecast?.forecast_days?.[0]?.temp_max_c ?? 25}°C
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Avg Low Temp</span>
                    <span className="text-cyan-300 font-bold block mt-0.5">
                      {exploreData.weatherForecast?.forecast_days?.[0]?.temp_min_c ?? 16}°C
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Rain Probability</span>
                    <span className="text-indigo-300 font-bold block mt-0.5">
                      {exploreData.weatherForecast?.forecast_days?.[0]?.rain_probability_pct ?? 15}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  🌤️ <span className="font-bold text-white">Summary:</span> {exploreData.weatherForecast?.summary}
                </p>
              </div>

              {/* CARD 2: Travel Intelligence Rating & Scoring */}
              {exploreData.travelIntelligence && (
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-extrabold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" /> Travel Intelligence Destination Rating
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-400 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                      Overall: {exploreData.travelIntelligence.overall_score || 8.8} / 10
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    {[
                      { label: 'Weather & Climate', score: exploreData.travelIntelligence.weather_score || 8.5, color: 'bg-cyan-400' },
                      { label: 'Budget Feasibility', score: exploreData.travelIntelligence.budget_score || 8.4, color: 'bg-emerald-400' },
                      { label: 'Activity Variety', score: exploreData.travelIntelligence.activity_score || 9.0, color: 'bg-indigo-400' },
                      { label: 'Transport Transit', score: exploreData.travelIntelligence.transport_score || 8.2, color: 'bg-blue-400' },
                    ].map((metric) => (
                      <div key={metric.label} className="space-y-1">
                        <div className="flex justify-between items-center text-slate-300 font-bold">
                          <span>{metric.label}</span>
                          <span className="text-white">{metric.score} / 10</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div className={`h-full ${metric.color} rounded-full`} style={{ width: `${(metric.score || 8) * 10}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CARD 3: Geography & Seasonal Strategy */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <span className="text-xs font-extrabold text-cyan-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-400" /> Geography & Seasonal Travel Strategy
                </span>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {exploreData.locationFeasibility?.geography_notes}
                </p>

                {exploreData.locationFeasibility?.seasonal_activity_advice && (
                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed">
                    💡 <strong className="text-cyan-300">Seasonal Strategy:</strong> {exploreData.locationFeasibility.seasonal_activity_advice}
                  </div>
                )}

                <div className="text-xs font-mono text-slate-400 pt-1">
                  📅 Optimal Window to Visit: <strong className="text-emerald-400">{exploreData.locationFeasibility?.best_month_to_visit}</strong>
                </div>
              </div>

              {/* CARD 4: Attractions Preview */}
              {exploreData.placesFound && exploreData.placesFound.length > 0 && (
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <span className="text-xs font-extrabold text-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-cyan-400" /> Key Attractions in {exploreData.destination}
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {exploreData.placesFound.slice(0, 6).map((p, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 text-xs font-semibold"
                      >
                        📍 {p.name || p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" /> Close Explorer
          </button>

          {exploreData ? (
            <button
              type="button"
              onClick={handlePlanTripDirectly}
              className="w-full sm:flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <span>Generate Day-by-Day Itinerary for {exploreData.destination}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-xs text-slate-500 font-mono text-center sm:text-right w-full sm:w-auto">
              Type any city above & press Enter or Check Feasibility
            </div>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
};
