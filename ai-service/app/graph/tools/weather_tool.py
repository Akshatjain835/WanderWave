import random
from typing import Dict, Any, List

def get_weather_forecast(destination: str, duration: int) -> Dict[str, Any]:
    """
    Simulates / fetches destination weather forecast for specified trip duration.
    Returns daily breakdown of condition, max/min temp, and rain probability.
    """
    dest_lower = (destination or "Manali").lower()
    
    # Destination climate defaults
    if "manali" in dest_lower or "ladakh" in dest_lower or "shimla" in dest_lower:
        base_temp = 14
        climate_type = "Mountainous / Cold"
    elif "goa" in dest_lower or "kerala" in dest_lower or "mumbai" in dest_lower:
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
        rain_prob = 15 if day != 3 else 25 # Predictable outdoor-friendly forecast
        
        condition = "Sunny & Clear"
        if rain_prob > 50:
            condition = "Light Rain / Overcast"
            has_heavy_rain = True
        elif temp_max < 15:
            condition = "Pleasant & Chilly"
        elif temp_max > 30:
            condition = "Warm & Sunny"

        daily_forecasts.append({
            "day": day,
            "condition": condition,
            "temp_max_c": temp_max,
            "temp_min_c": temp_min,
            "rain_probability_pct": rain_prob,
            "suitable_for_outdoors": rain_prob < 50
        })

    return {
        "destination": destination,
        "climate_type": climate_type,
        "forecast_days": daily_forecasts,
        "has_heavy_rain_warning": has_heavy_rain,
        "summary": f"Weather in {destination} will be mostly {climate_type} with average highs around {base_temp + 2}°C."
    }
