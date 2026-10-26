"""
Safe Route Planning API Router.
"""

from typing import Dict, Any
from fastapi import APIRouter, Body
from app.services.routing_service import plan_safe_route

router = APIRouter(prefix="/api/routes", tags=["Safe Routing"])

@router.post("/plan")
def calculate_route(payload: Dict[str, Any] = Body(...)):
    """
    Plan a safe route between origin and destination.
    Contrasts Fastest vs Safest trajectory with spatial buffer hazard evaluation and time-of-day weighting.
    """
    origin_lat = float(payload.get("origin_lat", 37.7749))
    origin_lon = float(payload.get("origin_lon", -122.4194))
    dest_lat = float(payload.get("dest_lat", 37.8087))
    dest_lon = float(payload.get("dest_lon", -122.4098))
    time_of_day = payload.get("time_of_day", "evening")

    route_plan = plan_safe_route(
        origin_lat=origin_lat,
        origin_lon=origin_lon,
        dest_lat=dest_lat,
        dest_lon=dest_lon,
        time_of_day=time_of_day
    )

    return {"status": "success", "plan": route_plan}
