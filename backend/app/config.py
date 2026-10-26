import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# City Defaults: San Francisco, CA
CITY_NAME = os.getenv("CITY_NAME", "San Francisco")
CITY_COUNTRY = os.getenv("CITY_COUNTRY", "USA")
CITY_CENTER_LAT = float(os.getenv("CITY_CENTER_LAT", "37.7749"))
CITY_CENTER_LON = float(os.getenv("CITY_CENTER_LON", "-122.4194"))
CITY_DEFAULT_ZOOM = int(os.getenv("CITY_DEFAULT_ZOOM", "13"))

# City Bounding Box (South, West, North, East)
CITY_BBOX = [
    float(os.getenv("CITY_BBOX_SOUTH", "37.7080")),
    float(os.getenv("CITY_BBOX_WEST", "-122.5200")),
    float(os.getenv("CITY_BBOX_NORTH", "37.8200")),
    float(os.getenv("CITY_BBOX_EAST", "-122.3600")),
]

# Database Config
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'citylife.db'}")
SQLITE_DB_PATH = BASE_DIR / "citylife.db"

# Overpass API
OVERPASS_API_URL = os.getenv("OVERPASS_API_URL", "https://overpass-api.de/api/interpreter")

# Open-Meteo API
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

# App Settings
APP_ENV = os.getenv("APP_ENV", "development")
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")
