import axios from 'axios';

/**
 * Live Destination Weather Service via Open-Meteo & Nominatim Geocoding API.
 * Uses real-time live weather feeds when external services are available,
 * with a destination-aware climate fallback when network or services fail.
 */
export const fetchLiveWeatherForDestination = async (destinationName) => {
  if (!destinationName) {
    return getFallbackWeather(destinationName);
  }

  try {
    // 1. Geocode City Name -> Lat/Lng via OpenStreetMap Nominatim API
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationName)}&limit=1`;
    const geoRes = await axios.get(geoUrl, {
      headers: { 'User-Agent': 'WanderWaveTravelApp/1.0' },
      timeout: 5000,
    });

    if (!geoRes.data || geoRes.data.length === 0) {
      console.warn(`[Geocoding Notice] Could not geocode ${destinationName}, using destination climate estimate.`);
      return getFallbackWeather(destinationName);
    }

    const { lat, lon, display_name } = geoRes.data[0];

    // 2. Fetch Live 7-Day Forecast from Open-Meteo API
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=auto`;
    const weatherRes = await axios.get(weatherUrl, { timeout: 5000 });

    if (weatherRes.data && weatherRes.data.daily) {
      const daily = weatherRes.data.daily;
      const forecastDays = [];

      for (let i = 0; i < Math.min(daily.time.length, 7); i++) {
        const code = daily.weathercode[i];
        const tempMax = daily.temperature_2m_max[i];
        const tempMin = daily.temperature_2m_min[i];
        const rainProb = daily.precipitation_probability_max[i] || 0;

        forecastDays.push({
          day: i + 1,
          date: daily.time[i],
          condition: parseWeatherCode(code),
          temp_max_c: tempMax,
          temp_min_c: tempMin,
          rain_probability_pct: rainProb,
          suitable_for_outdoors: rainProb < 50,
        });
      }

      return {
        success: true,
        is_fallback: false,
        source: 'live_open_meteo',
        destination: destinationName,
        locationName: display_name,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        climate_type: getClimateSummary(forecastDays[0]?.temp_max_c),
        weather_summary: `Live forecast for ${destinationName}: Temps ranging ${forecastDays[0]?.temp_min_c}°C to ${forecastDays[0]?.temp_max_c}°C with ${forecastDays[0]?.condition.toLowerCase()}.`,
        forecast_days: forecastDays,
      };
    }
  } catch (err) {
    console.warn(`[Live Weather Service Error] External API failed for ${destinationName}: ${err.message}. Utilizing climate fallback.`);
  }

  return getFallbackWeather(destinationName);
};

function parseWeatherCode(code) {
  if (code === 0) return 'Clear Sky ☀️';
  if (code >= 1 && code <= 3) return 'Partly Cloudy ⛅';
  if (code >= 45 && code <= 48) return 'Foggy 🌫️';
  if (code >= 51 && code <= 67) return 'Light Rain / Drizzle 🌧️';
  if (code >= 71 && code <= 77) return 'Snow Flurry ❄️';
  if (code >= 80 && code <= 82) return 'Rain Showers 🌦️';
  if (code >= 95) return 'Thunderstorm 🌩️';
  return 'Mild & Pleasant 🌿';
}

function getClimateSummary(maxTemp) {
  if (maxTemp > 32) return 'Tropical / Warm Sunny Climate 🏖️';
  if (maxTemp > 22) return 'Mild & Moderate Pleasant Climate 🌸';
  if (maxTemp > 12) return 'Cool / High Altitude Climate 🌲';
  return 'Cold / Alpine Climate 🏔️';
}

function getFallbackWeather(destinationName = 'Destination') {
  const destLower = (destinationName || '').toLowerCase();
  
  let baseMax = 25;
  let baseMin = 17;
  let climate = 'Mild & Pleasant Climate 🌿';
  let defaultCondition = 'Sunny & Clear ☀️';

  if (destLower.includes('manali') || destLower.includes('ladakh') || destLower.includes('shimla') || destLower.includes('zurich') || destLower.includes('aspen')) {
    baseMax = 15;
    baseMin = 7;
    climate = 'Mountainous / Alpine Climate 🏔️';
    defaultCondition = 'Chilly & Clear 🌲';
  } else if (destLower.includes('goa') || destLower.includes('kerala') || destLower.includes('maldives') || destLower.includes('bali') || destLower.includes('phuket')) {
    baseMax = 31;
    baseMin = 24;
    climate = 'Tropical / Coastal Climate 🏖️';
    defaultCondition = 'Warm & Sunny ☀️';
  } else if (destLower.includes('dubai') || destLower.includes('jaipur') || destLower.includes('cairo')) {
    baseMax = 36;
    baseMin = 26;
    climate = 'Arid / Desert Climate 🏜️';
    defaultCondition = 'Hot & Sunny ☀️';
  }

  const variations = [
    { dayOffset: 0, tempOffset: 0, rain: 10, condition: defaultCondition },
    { dayOffset: 1, tempOffset: 1.5, rain: 15, condition: defaultCondition },
    { dayOffset: 2, tempOffset: -1.0, rain: 25, condition: 'Partly Cloudy ⛅' },
    { dayOffset: 3, tempOffset: 2.0, rain: 10, condition: defaultCondition },
    { dayOffset: 4, tempOffset: 0.5, rain: 20, condition: 'Partly Cloudy ⛅' },
  ];

  const forecastDays = variations.map((varItem, i) => ({
    day: i + 1,
    condition: varItem.condition,
    temp_max_c: Math.round(baseMax + varItem.tempOffset),
    temp_min_c: Math.round(baseMin + varItem.tempOffset * 0.7),
    rain_probability_pct: varItem.rain,
    suitable_for_outdoors: varItem.rain < 50,
  }));

  return {
    success: true,
    is_fallback: true,
    source: 'graceful_fallback',
    destination: destinationName,
    climate_type: climate,
    weather_summary: `Estimated climate profile for ${destinationName}: ${climate} with comfortable sightseeing conditions.`,
    forecast_days: forecastDays,
  };
}
