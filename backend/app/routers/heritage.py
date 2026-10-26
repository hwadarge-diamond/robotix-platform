"""
Heritage & Cultural Hub API Router.
"""

from fastapi import APIRouter, Query
from app.services.heritage_service import get_all_heritage_sites, generate_heritage_itinerary

router = APIRouter(prefix="/api/heritage", tags=["Heritage & Culture Hub"])

@router.get("/sites")
def list_heritage_sites():
    """Retrieve all historical landmarks, traditions, and visiting tips."""
    sites = get_all_heritage_sites()
    return {"status": "success", "count": len(sites), "sites": sites}

@router.get("/itinerary")
def get_itinerary(
    duration: int = Query(4, ge=1, le=12, description="Available duration in hours"),
    budget: int = Query(2, ge=1, le=4, description="Budget level (1-4)")
):
    """Generate custom cultural walking itinerary with timeline and food stop."""
    itinerary = generate_heritage_itinerary(duration_hours=duration, budget_level=budget)
    return {"status": "success", "itinerary": itinerary}
