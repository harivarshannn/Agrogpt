import requests

# Coordinates for all 38 districts in Tamil Nadu
TN_DISTRICTS = {
    "Ariyalur": {"lat": 11.1400, "lon": 79.0786},
    "Chengalpattu": {"lat": 12.6953, "lon": 79.9758},
    "Chennai": {"lat": 13.0827, "lon": 80.2707},
    "Coimbatore": {"lat": 11.0168, "lon": 76.9558},
    "Cuddalore": {"lat": 11.7480, "lon": 79.7714},
    "Dharmapuri": {"lat": 12.1211, "lon": 78.1582},
    "Dindigul": {"lat": 10.3673, "lon": 77.9803},
    "Erode": {"lat": 11.3410, "lon": 77.7172},
    "Kallakurichi": {"lat": 11.7383, "lon": 78.9624},
    "Kanchipuram": {"lat": 12.8342, "lon": 79.7036},
    "Kanyakumari": {"lat": 8.0883, "lon": 77.5385},
    "Karur": {"lat": 10.9504, "lon": 78.0833},
    "Krishnagiri": {"lat": 12.5186, "lon": 78.2137},
    "Madurai": {"lat": 9.9252, "lon": 78.1198},
    "Mayiladuthurai": {"lat": 11.1018, "lon": 79.6525},
    "Nagapattinam": {"lat": 10.7656, "lon": 79.8424},
    "Namakkal": {"lat": 11.2189, "lon": 78.1674},
    "Nilgiris": {"lat": 11.4064, "lon": 76.6932},
    "Perambalur": {"lat": 11.2342, "lon": 78.8821},
    "Pudukkottai": {"lat": 10.3797, "lon": 78.8205},
    "Ramanathapuram": {"lat": 9.3582, "lon": 78.8315},
    "Ranipet": {"lat": 12.9271, "lon": 79.3323},
    "Salem": {"lat": 11.6643, "lon": 78.1460},
    "Sivaganga": {"lat": 9.8433, "lon": 78.4809},
    "Tenkasi": {"lat": 8.9594, "lon": 77.3160},
    "Thanjavur": {"lat": 10.7870, "lon": 79.1378},
    "Theni": {"lat": 10.0096, "lon": 77.4774},
    "Thoothukudi": {"lat": 8.7642, "lon": 78.1348},
    "Tiruchirappalli": {"lat": 10.7905, "lon": 78.7047},
    "Tirunelveli": {"lat": 8.7139, "lon": 77.7567},
    "Tirupathur": {"lat": 12.4939, "lon": 78.5677},
    "Tiruppur": {"lat": 11.1085, "lon": 77.3411},
    "Tiruvallur": {"lat": 13.1436, "lon": 79.9113},
    "Tiruvannamalai": {"lat": 12.2253, "lon": 79.0747},
    "Tiruvarur": {"lat": 10.7661, "lon": 79.6344},
    "Vellore": {"lat": 12.9165, "lon": 79.1325},
    "Viluppuram": {"lat": 11.9401, "lon": 79.4861},
    "Virudhunagar": {"lat": 9.5872, "lon": 77.9573}
}

# WMO Weather interpretation codes (WW)
def get_weather_description(code):
    if code == 0: return ("Clear sky", "☀️")
    if code in (1, 2, 3): return ("Partly cloudy", "🌤️")
    if code in (45, 48): return ("Fog", "🌫️")
    if code in (51, 53, 55): return ("Drizzle", "🌧️")
    if code in (56, 57): return ("Freezing Drizzle", "🌧️❄️")
    if code in (61, 63, 65): return ("Rain", "🌧️")
    if code in (66, 67): return ("Freezing Rain", "🌨️")
    if code in (71, 73, 75): return ("Snow fall", "❄️")
    if code == 77: return ("Snow grains", "❄️")
    if code in (80, 81, 82): return ("Rain showers", "🌦️")
    if code in (85, 86): return ("Snow showers", "🌨️")
    if code == 95: return ("Thunderstorm", "⛈️")
    if code in (96, 99): return ("Thunderstorm with hail", "⛈️❄️")
    return ("Unknown", "❓")

def get_current_weather(district_name):
    """
    Fetches the current weather for a given Tamil Nadu district from Open-Meteo.
    """
    if district_name not in TN_DISTRICTS:
        return {"error": "District not found. Please provide a valid Tamil Nadu district name."}
    
    coords = TN_DISTRICTS[district_name]
    lat = coords["lat"]
    lon = coords["lon"]
    
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"
    
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        current = data.get("current", {})
        temp = current.get("temperature_2m", "N/A")
        humidity = current.get("relative_humidity_2m", "N/A")
        wind_speed = current.get("wind_speed_10m", "N/A")
        weather_code = current.get("weather_code", -1)
        
        desc, emoji = get_weather_description(weather_code)
        
        return {
            "success": True,
            "district": district_name,
            "temperature": temp,
            "humidity": humidity,
            "wind_speed": wind_speed,
            "condition": desc,
            "emoji": emoji
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to fetch weather: {str(e)}"
        }
