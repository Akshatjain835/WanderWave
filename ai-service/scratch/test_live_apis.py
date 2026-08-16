import requests

def test_open_meteo_live(destination="Goa"):
    print(f"--- Testing Open-Meteo Live Weather API for: {destination} ---")
    try:
        # 1. Geocoding API
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={destination}&count=1"
        geo_res = requests.get(geo_url, timeout=5).json()
        
        if geo_res.get("results"):
            lat = geo_res["results"][0]["latitude"]
            lon = geo_res["results"][0]["longitude"]
            country = geo_res["results"][0].get("country", "")
            print(f"[Geocoding Success] {destination} -> Lat: {lat}, Lon: {lon}, Country: {country}")
            
            # 2. Weather Forecast API
            weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto"
            w_res = requests.get(weather_url, timeout=5).json()
            daily = w_res.get("daily", {})
            print(f"[Weather API Success] Max Temps: {daily.get('temperature_2m_max')}, Rain Prob: {daily.get('precipitation_probability_max')}")
            return True
        else:
            print(f"[Geocoding Warning] No coordinates found for {destination}")
            return False
    except Exception as e:
        print(f"[Open-Meteo Error] {e}")
        return False

if __name__ == "__main__":
    test_open_meteo_live("Manali")
    test_open_meteo_live("Goa")
