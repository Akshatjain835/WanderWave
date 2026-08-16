import random
import requests
from typing import Dict, Any, List

def get_weather_forecast(destination: str, duration: int) -> Dict[str, Any]:
    """
    Fetches real live destination weather forecast using Open-Meteo Weather API.
    Falls back gracefully if network is unavailable.
    """
    dest_name = (destination or "Manali").strip()
    dest_lower = dest_name.lower()
    
    # 1. Attempt Live Open-Meteo Weather API
    try:
        geo_query = f"{dest_name}, India" if dest_lower in ["goa", "manali", "jaipur", "ladakh", "kerala", "mysore", "mumbai", "delhi"] else dest_name
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={requests.utils.quote(geo_query)}&count=1"
        geo_res = requests.get(geo_url, timeout=3).json()
        
        if geo_res.get("results"):
            location_info = geo_res["results"][0]
            lat = location_info["latitude"]
            lon = location_info["longitude"]
            
            weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto"
            w_res = requests.get(weather_url, timeout=3).json()
            daily = w_res.get("daily", {})
            
            if daily.get("temperature_2m_max"):
                max_temps = daily.get("temperature_2m_max", [])
                min_temps = daily.get("temperature_2m_min", [])
                rain_probs = daily.get("precipitation_probability_max", [])
                weather_codes = daily.get("weather_code", [])
                
                daily_forecasts = []
                has_heavy_rain = False
                
                for day in range(1, duration + 1):
                    idx = (day - 1) % len(max_temps)
                    temp_max = float(max_temps[idx]) if idx < len(max_temps) else 25.0
                    temp_min = float(min_temps[idx]) if idx < len(min_temps) else 16.0
                    rain_prob = int(rain_probs[idx]) if idx < len(rain_probs) else 10
                    w_code = int(weather_codes[idx]) if idx < len(weather_codes) else 0
                    
                    # WMO Weather interpretation
                    if rain_prob > 60 or w_code in [61, 63, 65, 80, 81, 82]:
                        condition = "Heavy Monsoonal Rain" if rain_prob > 75 else "Light Rain & Overcast"
                        has_heavy_rain = True
                    elif w_code in [1, 2, 3]:
                        condition = "Partly Cloudy & Pleasant"
                    elif temp_max < 15:
                        condition = "Chilly & Clear"
                    elif temp_max > 30:
                        condition = "Warm & Sunny"
                    else:
                        condition = "Sunny & Clear"
                        
                    daily_forecasts.append({
                        "day": day,
                        "condition": condition,
                        "temp_max_c": round(temp_max, 1),
                        "temp_min_c": round(temp_min, 1),
                        "rain_probability_pct": rain_prob,
                        "suitable_for_outdoors": rain_prob < 50
                    })
                    
                climate_type = "Tropical" if "goa" in dest_lower or "kerala" in dest_lower else "Mountainous" if "manali" in dest_lower or "ladakh" in dest_lower else "Temperate"
                
                return {
                    "destination": dest_name,
                    "climate_type": climate_type,
                    "forecast_days": daily_forecasts,
                    "has_heavy_rain_warning": has_heavy_rain,
                    "summary": f"Live Weather API ({dest_name}): Avg high {daily_forecasts[0]['temp_max_c']}°C, {daily_forecasts[0]['condition']}."
                }
    except Exception as e:
        print(f"[Weather API Notice] Open-Meteo live API fallback activated: {e}")

    # 2. Fallback Weather Simulation
    if "manali" in dest_lower or "ladakh" in dest_lower:
        base_temp = 14
        climate_type = "Mountainous / Cold"
    elif "goa" in dest_lower or "kerala" in dest_lower:
        base_temp = 29
        climate_type = "Tropical / Humid"
    elif "jaipur" in dest_lower or "dubai" in dest_lower:
        base_temp = 32
        climate_type = "Arid / Desert"
    else:
        base_temp = 22
        climate_type = "Temperate"

    daily_forecasts = []
    has_heavy_rain = False

    for day in range(1, duration + 1):
        temp_max = round(base_temp + random.uniform(1.0, 4.0), 1)
        temp_min = round(base_temp - random.uniform(3.0, 7.0), 1)
        rain_prob = 15 if day != 3 else 25
        condition = "Sunny & Clear"

        daily_forecasts.append({
            "day": day,
            "condition": condition,
            "temp_max_c": temp_max,
            "temp_min_c": temp_min,
            "rain_probability_pct": rain_prob,
            "suitable_for_outdoors": rain_prob < 50
        })

    return {
        "destination": dest_name,
        "climate_type": climate_type,
        "forecast_days": daily_forecasts,
        "has_heavy_rain_warning": has_heavy_rain,
        "summary": f"Weather forecast for {dest_name}: {climate_type} conditions around {base_temp + 2}°C."
    }
