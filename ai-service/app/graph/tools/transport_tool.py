import math
import requests
from typing import Dict, Any, List

# Coordinates table for major Indian and International cities (Lat, Lon)
CITY_COORDINATES: Dict[str, tuple] = {
    "delhi": (28.6139, 77.2090),
    "mumbai": (19.0760, 72.8777),
    "goa": (15.2993, 74.1240),
    "manali": (32.2432, 77.1892),
    "jaipur": (26.9124, 75.7873),
    "rishikesh": (30.0869, 78.2676),
    "udaipur": (24.5854, 73.7125),
    "kerala": (10.8505, 76.2711),
    "shimla": (31.1048, 77.1734),
    "varanasi": (25.3176, 82.9739),
    "ooty": (11.4102, 76.6950),
    "agra": (27.1767, 78.0081),
    "bengaluru": (12.9716, 77.5946),
    "chennai": (13.0827, 80.2707),
    "chandigarh": (30.7333, 76.7794),
    "tokyo": (35.6762, 139.6503),
    "paris": (48.8566, 2.3522),
    "dubai": (25.2048, 55.2708),
    "london": (51.5074, -0.1278),
    "sydney": (-33.8688, 151.2093),
    "singapore": (1.3521, 103.8198),
    "bangkok": (13.7563, 100.5018),
    "rome": (41.9028, 12.4964),
    "barcelona": (41.3851, 2.1734),
    "new york": (40.7128, -74.0060),
    "bali": (-8.4095, 115.1889),
    "kathmandu": (27.7172, 85.3240),
    "munich": (48.1351, 11.5820),
    "cairo": (30.0444, 31.2357),
    "zurich": (47.3769, 8.5417),
    "reykjavik": (64.1466, -21.9426),
    "seoul": (37.5665, 126.9780),
    "cape town": (-33.9249, 18.4241),
    "amsterdam": (52.3676, 4.9041),
    "toronto": (43.6532, -79.3832)
}

def get_city_coords(city_name: str) -> tuple:
    """
    Returns (latitude, longitude) for city_name using local lookup or Open-Meteo Geocoding API.
    """
    clean_name = (city_name or "Delhi").strip().lower()
    if clean_name in CITY_COORDINATES:
        return CITY_COORDINATES[clean_name]

    try:
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={requests.utils.quote(city_name)}&count=1"
        res = requests.get(url, timeout=3).json()
        if res.get("results"):
            info = res["results"][0]
            return (info["latitude"], info["longitude"])
    except Exception:
        pass

    # Default fallback coordinates
    return (28.6139, 77.2090)

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates great-circle geodesic distance between two points in kilometers.
    """
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def get_transport_estimates(origin: str, destination: str, duration: int, travelers: int) -> List[Dict[str, Any]]:
    """
    Dynamic Transportation & Fare Estimation Engine.
    Calculates exact geodesic route distance, travel duration, and realistic fare pricing
    across flight, train, bus, and cab options for domestic and international trips.
    """
    orig_name = (origin or "Delhi").strip()
    dest_name = (destination or "Manali").strip()

    lat1, lon1 = get_city_coords(orig_name)
    lat2, lon2 = get_city_coords(dest_name)
    distance_km = round(haversine_distance_km(lat1, lon1, lat2, lon2), 1)

    # Determine if international route (e.g. India to Japan/France)
    indian_cities = {"delhi", "mumbai", "goa", "manali", "jaipur", "rishikesh", "udaipur", "kerala", "shimla", "varanasi", "ooty", "agra", "bengaluru", "chennai", "chandigarh"}
    is_international = (orig_name.lower() in indian_cities and dest_name.lower() not in indian_cities) or (orig_name.lower() not in indian_cities and dest_name.lower() in indian_cities)

    options = []

    if is_international or distance_km > 1200:
        # Long-distance / International Route (Flight Primary)
        flight_base = 12000 if is_international else 4500
        flight_cost_person = round(flight_base + (distance_km * 7.5 if is_international else distance_km * 4.2), -2)
        flight_hours = round((distance_km / 750.0) + 3.0, 1)

        options.append({
            "mode": "Direct Economy Flight",
            "distance_km": distance_km,
            "roundtrip_cost_per_person": flight_cost_person,
            "total_roundtrip_cost": flight_cost_person * travelers,
            "travel_time_hours": flight_hours,
            "comfort_rating": "4.7/5",
            "recommended_for": ["Fast Transit", "International", "Comfort"]
        })

        if is_international:
            prem_cost = round(flight_cost_person * 1.8, -2)
            options.append({
                "mode": "Premium Economy Flight",
                "distance_km": distance_km,
                "roundtrip_cost_per_person": prem_cost,
                "total_roundtrip_cost": prem_cost * travelers,
                "travel_time_hours": flight_hours,
                "comfort_rating": "4.9/5",
                "recommended_for": ["Luxury", "Business", "Families"]
            })
        else:
            bus_cost = round(1200 + (distance_km * 1.8), -2)
            bus_hours = round(distance_km / 50.0, 1)
            options.append({
                "mode": "Volvo AC Sleeper Bus",
                "distance_km": distance_km,
                "roundtrip_cost_per_person": bus_cost,
                "total_roundtrip_cost": bus_cost * travelers,
                "travel_time_hours": bus_hours,
                "comfort_rating": "4.2/5",
                "recommended_for": ["Budget", "Overnight"]
            })

    elif distance_km > 400:
        # Medium Distance Domestic Route (400km - 1200km)
        flight_cost = round(3500 + (distance_km * 4.5), -2)
        flight_hours = round((distance_km / 650.0) + 2.5, 1)
        options.append({
            "mode": "Domestic Express Flight",
            "distance_km": distance_km,
            "roundtrip_cost_per_person": flight_cost,
            "total_roundtrip_cost": flight_cost * travelers,
            "travel_time_hours": flight_hours,
            "comfort_rating": "4.8/5",
            "recommended_for": ["Fast Transit", "Comfort"]
        })

        train_cost = round(800 + (distance_km * 1.4), -2)
        train_hours = round(distance_km / 75.0, 1)
        options.append({
            "mode": "Express Superfast Train (3AC/2AC)",
            "distance_km": distance_km,
            "roundtrip_cost_per_person": train_cost,
            "total_roundtrip_cost": train_cost * travelers,
            "travel_time_hours": train_hours,
            "comfort_rating": "4.5/5",
            "recommended_for": ["Budget", "Scenic", "Families"]
        })

        cab_cost = round((distance_km * 14.0 * 2) / max(1, travelers), -2)
        cab_hours = round(distance_km / 60.0, 1)
        options.append({
            "mode": "Private SUV / Sedan Cab",
            "distance_km": distance_km,
            "roundtrip_cost_per_person": cab_cost,
            "total_roundtrip_cost": cab_cost * travelers,
            "travel_time_hours": cab_hours,
            "comfort_rating": "4.6/5",
            "recommended_for": ["Door-to-Door", "Groups"]
        })

    else:
        # Short Distance Route (< 400km)
        cab_cost = round((distance_km * 13.0 * 2) / max(1, travelers), -2)
        cab_hours = round(distance_km / 55.0, 1)
        options.append({
            "mode": "Private SUV / Sedan Cab",
            "distance_km": distance_km,
            "roundtrip_cost_per_person": cab_cost,
            "total_roundtrip_cost": cab_cost * travelers,
            "travel_time_hours": cab_hours,
            "comfort_rating": "4.8/5",
            "recommended_for": ["Door-to-Door", "Families", "Comfort"]
        })

        bus_cost = round(500 + (distance_km * 2.0), -2)
        bus_hours = round(distance_km / 45.0, 1)
        options.append({
            "mode": "Volvo AC Deluxe Bus",
            "distance_km": distance_km,
            "roundtrip_cost_per_person": bus_cost,
            "total_roundtrip_cost": bus_cost * travelers,
            "travel_time_hours": bus_hours,
            "comfort_rating": "4.3/5",
            "recommended_for": ["Budget", "Solo"]
        })

        train_cost = round(350 + (distance_km * 1.2), -2)
        train_hours = round(distance_km / 70.0, 1)
        options.append({
            "mode": "Intercity Express Train",
            "distance_km": distance_km,
            "roundtrip_cost_per_person": train_cost,
            "total_roundtrip_cost": train_cost * travelers,
            "travel_time_hours": train_hours,
            "comfort_rating": "4.4/5",
            "recommended_for": ["Eco-Friendly", "Budget"]
        })

    return options
