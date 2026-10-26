"""
Map Layers API router providing toggleable layers and city configuration.
"""

import json
import urllib.request
from fastapi import APIRouter
from app.config import (
    CITY_NAME, CITY_COUNTRY, CITY_CENTER_LAT,
    CITY_CENTER_LON, CITY_DEFAULT_ZOOM, CITY_BBOX, OPEN_METEO_URL
)
from app.services.spatial_utils import get_layer_data
from app.database import get_db

router = APIRouter(prefix="/api/layers", tags=["Map Layers"])

@router.get("/config")
def get_city_config():
    """Return target city metadata, map center, bounding box, and default zoom."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM categories")
        categories = [dict(r) for r in cursor.fetchall()]

    return {
        "city_name": CITY_NAME,
        "country": CITY_COUNTRY,
        "center": {"lat": CITY_CENTER_LAT, "lon": CITY_CENTER_LON},
        "default_zoom": CITY_DEFAULT_ZOOM,
        "bbox": CITY_BBOX,
        "categories": categories
    }

@router.get("/all")
def get_all_layers():
    """Return all toggleable map layers in a single lightweight payload."""
    data = get_layer_data()
    return {"status": "success", "layers": data}

@router.get("/weather")
def get_weather():
    """Fetch live weather from Open-Meteo API for the target city center."""
    url = f"{OPEN_METEO_URL}?latitude={CITY_CENTER_LAT}&longitude={CITY_CENTER_LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability&forecast_days=1"
    
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "CityLifeApp/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                raw_data = json.loads(response.read().decode("utf-8"))
                current = raw_data.get("current", {})
                return {
                    "status": "success",
                    "source": "Open-Meteo (Live)",
                    "temperature": current.get("temperature_2m"),
                    "feels_like": current.get("apparent_temperature"),
                    "humidity": current.get("relative_humidity_2m"),
                    "precipitation": current.get("precipitation"),
                    "wind_speed": current.get("wind_speed_10m"),
                    "weather_code": current.get("weather_code", 0)
                }
    except Exception as e:
        # Fallback to standard coastal weather condition for SF demo
        return {
            "status": "fallback",
            "source": "Open-Meteo (Simulated/Cached)",
            "temperature": 16.5,
            "feels_like": 15.2,
            "humidity": 78,
            "precipitation": 0.0,
            "wind_speed": 14.2,
            "weather_code": 3,
            "note": "Coastal marine layer overcast"
        }

@router.get("/traffic")
def get_traffic_status():
    """Return live / simulated traffic congestion layer clearly labeled."""
    return {
        "status": "success",
        "is_simulated": True,
        "source": "Simulated Traffic Sensor Grid",
        "corridors": [
            {
                "name": "Market Street Corridor",
                "congestion_level": "moderate",
                "speed_mph": 14,
                "delay_minutes": 6,
                "coordinates": [[37.7940, -122.3950], [37.7780, -122.4160]]
            },
            {
                "name": "Embarcadero Southbound",
                "congestion_level": "heavy",
                "speed_mph": 9,
                "delay_minutes": 12,
                "coordinates": [[37.8080, -122.4100], [37.7930, -122.3920]]
            },
            {
                "name": "Van Ness Avenue / US-101",
                "congestion_level": "light",
                "speed_mph": 24,
                "delay_minutes": 2,
                "coordinates": [[37.8010, -122.4240], [37.7740, -122.4200]]
            }
        ]
    }
