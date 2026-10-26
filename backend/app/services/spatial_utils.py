"""
Spatial search, filtering, and layer aggregation utilities.
"""

from typing import List, Dict, Any, Optional
from app.database import get_db, haversine_distance_meters

def dict_from_row(row) -> Dict[str, Any]:
    if row is None:
        return {}
    return dict(row)

def query_places(
    q: Optional[str] = None,
    category: Optional[str] = None,
    max_price: Optional[int] = None,
    min_rating: Optional[float] = None,
    min_safety: Optional[float] = None,
    wheelchair_only: bool = False,
    limit: int = 50,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """Query places with dynamic filters."""
    query = "SELECT * FROM places WHERE 1=1"
    params = []

    if q:
        query += " AND (name LIKE ? OR description LIKE ? OR neighborhood LIKE ? OR address LIKE ?)"
        term = f"%{q.strip()}%"
        params.extend([term, term, term, term])

    if category and category.lower() != "all":
        query += " AND category_slug = ?"
        params.append(category.lower())

    if max_price is not None:
        query += " AND price_level <= ?"
        params.append(max_price)

    if min_rating is not None:
        query += " AND rating >= ?"
        params.append(min_rating)

    if min_safety is not None:
        query += " AND safety_score >= ?"
        params.append(min_safety)

    if wheelchair_only:
        query += " AND wheelchair_accessible = 1"

    query += " ORDER BY composite_score DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict_from_row(r) for r in rows]

def get_place_by_id(place_id: int) -> Optional[Dict[str, Any]]:
    """Retrieve detailed place information including heritage notes and nearby reports."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM places WHERE id = ?", (place_id,))
        place_row = cursor.fetchone()
        if not place_row:
            return None
        
        place_data = dict_from_row(place_row)

        # Fetch heritage info
        cursor.execute("SELECT * FROM heritage_info WHERE place_id = ?", (place_id,))
        heritage_row = cursor.fetchone()
        place_data["heritage_info"] = dict_from_row(heritage_row) if heritage_row else None

        # Fetch nearby reports (within 1000m)
        lat, lon = place_data["latitude"], place_data["longitude"]
        cursor.execute("""
        SELECT * FROM reports
        WHERE haversine_meters(latitude, longitude, ?, ?) <= 1000
        ORDER BY created_at DESC LIMIT 5
        """, (lat, lon))
        reports_rows = cursor.fetchall()
        place_data["recent_reports"] = [dict_from_row(r) for r in reports_rows]

        return place_data

def query_nearby_places(lat: float, lon: float, radius_meters: float = 3000.0, limit: int = 20) -> List[Dict[str, Any]]:
    """Find places within radius meters from given coordinates."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT *, haversine_meters(latitude, longitude, ?, ?) AS distance_meters
        FROM places
        WHERE haversine_meters(latitude, longitude, ?, ?) <= ?
        ORDER BY distance_meters ASC
        LIMIT ?
        """, (lat, lon, lat, lon, radius_meters, limit))
        rows = cursor.fetchall()
        return [dict_from_row(r) for r in rows]

def get_layer_data() -> Dict[str, Any]:
    """Return all toggleable map layers aggregated for high-speed client rendering."""
    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Category Places
        cursor.execute("SELECT * FROM places")
        all_places = [dict_from_row(r) for r in cursor.fetchall()]

        attractions = [p for p in all_places if p["category_slug"] == "attractions"]
        food = [p for p in all_places if p["category_slug"] == "food"]
        hotels = [p for p in all_places if p["category_slug"] == "hotels"]
        heritage = [p for p in all_places if p["category_slug"] == "heritage"]
        budget = [p for p in all_places if p["category_slug"] == "budget" or p["price_level"] == 1]
        emergency = [p for p in all_places if p["category_slug"] == "emergency"]

        # 2. Unsafe zones (Incidents with simulated tag)
        cursor.execute("SELECT * FROM incidents ORDER BY created_at DESC")
        incidents = [dict_from_row(r) for r in cursor.fetchall()]

        # 3. Hotspots
        cursor.execute("SELECT * FROM hotspots ORDER BY incident_count DESC")
        hotspots = [dict_from_row(r) for r in cursor.fetchall()]

        # 4. Reports
        cursor.execute("SELECT * FROM reports ORDER BY created_at DESC")
        reports = [dict_from_row(r) for r in cursor.fetchall()]

        # 5. Area Neighborhood Scores
        cursor.execute("SELECT * FROM area_scores ORDER BY composite_score DESC")
        area_scores = [dict_from_row(r) for r in cursor.fetchall()]

        # 6. Alerts
        cursor.execute("SELECT * FROM alerts WHERE is_active = 1")
        alerts = [dict_from_row(r) for r in cursor.fetchall()]

        # 7. News signals
        cursor.execute("SELECT * FROM news_signals ORDER BY published_at DESC LIMIT 10")
        news = [dict_from_row(r) for r in cursor.fetchall()]

        return {
            "attractions": attractions,
            "food": food,
            "hotels": hotels,
            "heritage": heritage,
            "budget": budget,
            "emergency": emergency,
            "unsafe_zones": incidents,
            "hotspots": hotspots,
            "citizen_reports": reports,
            "area_scores": area_scores,
            "alerts": alerts,
            "news_signals": news
        }
