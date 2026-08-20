import axios from 'axios';

/**
 * Real-Time Dynamic Global Places & Attractions Fetcher API via OpenStreetMap Overpass REST API
 * Fetches real tourist spots, heritage sites, viewpoints, and cafes for ANY location on Earth.
 */
export const fetchLivePlacesForDestination = async (destinationName, interests = []) => {
  if (!destinationName) return [];

  try {
    // 1. Geocode city name to Bounding Box / Coordinates
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationName)}&limit=1`;
    const geoRes = await axios.get(geoUrl, {
      headers: { 'User-Agent': 'WanderWaveTravelApp/1.0' },
      timeout: 5000,
    });

    if (!geoRes.data || !geoRes.data.length) {
      return [];
    }

    const { lat, lon } = geoRes.data[0];

    // 2. Query Overpass API for Tourism & Amenity nodes within 10km radius
    const overpassQuery = `
      [out:json][timeout:8];
      (
        node["tourism"~"attraction|museum|viewpoint|theme_park"](around:12000,${lat},${lon});
        node["amenity"~"cafe|restaurant"](around:12000,${lat},${lon});
      );
      out body 15;
    `;

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
    const overpassRes = await axios.get(overpassUrl, { timeout: 8000 });

    if (overpassRes.data && overpassRes.data.elements) {
      const places = overpassRes.data.elements
        .filter((el) => el.tags && el.tags.name)
        .map((el, idx) => ({
          name: el.tags.name,
          category: el.tags.tourism ? capitalize(el.tags.tourism) : (el.tags.amenity ? capitalize(el.tags.amenity) : 'Attraction'),
          best_time: idx % 3 === 0 ? 'Morning' : (idx % 3 === 1 ? 'Afternoon' : 'Evening'),
          estimated_cost_per_person: el.tags.tourism === 'museum' ? 300 : (el.tags.amenity === 'cafe' ? 400 : 0),
          description: el.tags.description || `Famous ${el.tags.tourism || 'local spot'} located in ${destinationName}. Highly recommended for visitors.`,
        }));

      // Deduplicate places by name
      const uniquePlaces = Array.from(new Map(places.map((p) => [p.name.toLowerCase(), p])).values());

      if (uniquePlaces.length >= 3) {
        return uniquePlaces.slice(0, 8);
      }
    }
  } catch (err) {
    console.warn(`[Live Places Service Error] Could not query Overpass API for ${destinationName}:`, err.message);
  }

  return [];
};

function capitalize(str) {
  if (!str) return 'Sightseeing';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
