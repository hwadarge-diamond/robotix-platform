"""
Places API router for searching, filtering, and retrieving place details.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.services.spatial_utils import query_places, get_place_by_id, query_nearby_places

router = APIRouter(prefix="/api/places", tags=["Places"])

@router.get("")
def list_places(
    q: Optional[str] = Query(None, description="Search query string"),
    category: Optional[str] = Query(None, description="Filter by category slug"),
    max_price: Optional[int] = Query(None, description="Maximum price level (1-4)"),
    min_rating: Optional[float] = Query(None, description="Minimum star rating (0-5)"),
    min_safety: Optional[float] = Query(None, description="Minimum safety score (0-100)"),
    wheelchair_only: bool = Query(False, description="Filter only wheelchair accessible places"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Retrieve places matching search parameters and filters."""
    places = query_places(
        q=q,
        category=category,
        max_price=max_price,
        min_rating=min_rating,
        min_safety=min_safety,
        wheelchair_only=wheelchair_only,
        limit=limit,
        offset=offset
    )
    return {"status": "success", "count": len(places), "places": places}

@router.get("/nearby")
def nearby_places(
    lat: float = Query(..., description="User latitude"),
    lon: float = Query(..., description="User longitude"),
    radius: float = Query(3000.0, description="Radius in meters"),
    limit: int = Query(20, ge=1, le=50)
):
    """Retrieve places near a specific coordinate using Haversine distance."""
    places = query_nearby_places(lat=lat, lon=lon, radius_meters=radius, limit=limit)
    return {"status": "success", "count": len(places), "places": places}

@router.get("/{place_id}")
def get_place(place_id: int):
    """Retrieve place details including scores, heritage context, and recent reports."""
    place = get_place_by_id(place_id)
    if not place:
        raise HTTPException(status_code=404, detail=f"Place with id {place_id} not found")
    return {"status": "success", "place": place}
