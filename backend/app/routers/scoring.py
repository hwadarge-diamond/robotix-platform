"""
Scoring and Leaderboard API Router.
"""

from typing import Optional, Dict
from fastapi import APIRouter, Query, Body
from app.services.scoring_service import compare_places, get_leaderboards, calculate_composite_score

router = APIRouter(prefix="/api/scoring", tags=["Scoring & Benchmarks"])

@router.get("/compare")
def compare_two_places(
    place_a: int = Query(..., description="ID of place A"),
    place_b: int = Query(..., description="ID of place B"),
    time_of_day: str = Query("afternoon", description="Time of day weighting (morning/afternoon/evening/night)")
):
    """Compare two places across all 5 dimensions and composite scores."""
    result = compare_places(place_a, place_b, time_of_day=time_of_day)
    return {"status": "success", "comparison": result}

@router.get("/leaderboards")
def view_leaderboards(category: Optional[str] = Query(None, description="Category slug")):
    """Get Top 5 and Bottom 5 (Best of / Worst of) places and neighborhood rankings."""
    ranks = get_leaderboards(category)
    return {"status": "success", "leaderboards": ranks}

@router.post("/recalculate")
def recalculate_score(
    safety: float = Body(...),
    cleanliness: float = Body(...),
    affordability: float = Body(...),
    rating: float = Body(...),
    accessibility: float = Body(...),
    weights: Optional[Dict[str, float]] = Body(None),
    time_of_day: str = Body("afternoon")
):
    """Dynamically compute composite score with custom user weights."""
    score = calculate_composite_score(
        safety, cleanliness, affordability, rating, accessibility, weights, time_of_day
    )
    return {"status": "success", "composite_score": score}
