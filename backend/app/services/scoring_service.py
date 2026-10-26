"""
Scoring Engine and Leaderboard Service.
Provides transparent weighted composite scoring, dynamic weight recalculation,
place-to-place and neighborhood comparisons, and best/worst leaderboards.
"""

from typing import Dict, Any, List, Optional
from app.database import get_db

DEFAULT_WEIGHTS = {
    "safety": 0.25,
    "cleanliness": 0.20,
    "affordability": 0.20,
    "rating": 0.20,
    "accessibility": 0.15
}

TIME_OF_DAY_SAFETY_FACTORS = {
    "morning": 1.05,
    "afternoon": 1.0,
    "evening": 0.90,
    "night": 0.75
}

def calculate_composite_score(
    safety: float,
    cleanliness: float,
    affordability: float,
    rating_5: float,
    accessibility: float,
    weights: Optional[Dict[str, float]] = None,
    time_of_day: str = "afternoon"
) -> float:
    """
    Transparent weighted composite score calculation (0 - 100).
    Converts 5-star rating to 100-point scale.
    Applies time-of-day multiplier to safety score.
    """
    w = weights or DEFAULT_WEIGHTS
    total_w = sum(w.values()) or 1.0
    norm_w = {k: v / total_w for k, v in w.items()}

    # Adjust safety based on time of day
    tod_factor = TIME_OF_DAY_SAFETY_FACTORS.get(time_of_day.lower(), 1.0)
    adjusted_safety = max(0.0, min(100.0, safety * tod_factor))
    rating_100 = max(0.0, min(100.0, (rating_5 / 5.0) * 100.0))

    composite = (
        (adjusted_safety * norm_w.get("safety", 0.25)) +
        (cleanliness * norm_w.get("cleanliness", 0.20)) +
        (affordability * norm_w.get("affordability", 0.20)) +
        (rating_100 * norm_w.get("rating", 0.20)) +
        (accessibility * norm_w.get("accessibility", 0.15))
    )

    return round(max(0.0, min(100.0, composite)), 1)

def compare_places(place_a_id: int, place_b_id: int, weights: Optional[Dict[str, float]] = None, time_of_day: str = "afternoon") -> Dict[str, Any]:
    """Compare two places across all 5 metrics, computing radar coordinates and metric winners."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM places WHERE id = ?", (place_a_id,))
        a_row = cursor.fetchone()
        cursor.execute("SELECT * FROM places WHERE id = ?", (place_b_id,))
        b_row = cursor.fetchone()

    if not a_row or not b_row:
        return {"error": "One or both places not found"}

    a = dict(a_row)
    b = dict(b_row)

    # Compute dynamic composite scores
    score_a = calculate_composite_score(
        a["safety_score"], a["cleanliness_score"], a["affordability_score"],
        a["rating"], a["accessibility_score"], weights, time_of_day
    )
    score_b = calculate_composite_score(
        b["safety_score"], b["cleanliness_score"], b["affordability_score"],
        b["rating"], b["accessibility_score"], weights, time_of_day
    )

    metrics = [
        {
            "metric": "Safety",
            "val_a": a["safety_score"],
            "val_b": b["safety_score"],
            "winner": "a" if a["safety_score"] > b["safety_score"] else ("b" if b["safety_score"] > a["safety_score"] else "tie")
        },
        {
            "metric": "Cleanliness",
            "val_a": a["cleanliness_score"],
            "val_b": b["cleanliness_score"],
            "winner": "a" if a["cleanliness_score"] > b["cleanliness_score"] else ("b" if b["cleanliness_score"] > a["cleanliness_score"] else "tie")
        },
        {
            "metric": "Affordability",
            "val_a": a["affordability_score"],
            "val_b": b["affordability_score"],
            "winner": "a" if a["affordability_score"] > b["affordability_score"] else ("b" if b["affordability_score"] > a["affordability_score"] else "tie")
        },
        {
            "metric": "Rating",
            "val_a": round(a["rating"] * 20.0, 1),
            "val_b": round(b["rating"] * 20.0, 1),
            "winner": "a" if a["rating"] > b["rating"] else ("b" if b["rating"] > a["rating"] else "tie")
        },
        {
            "metric": "Accessibility",
            "val_a": a["accessibility_score"],
            "val_b": b["accessibility_score"],
            "winner": "a" if a["accessibility_score"] > b["accessibility_score"] else ("b" if b["accessibility_score"] > a["accessibility_score"] else "tie")
        },
        {
            "metric": "Overall Composite",
            "val_a": score_a,
            "val_b": score_b,
            "winner": "a" if score_a > score_b else ("b" if score_b > score_a else "tie")
        }
    ]

    return {
        "place_a": {
            "id": a["id"],
            "name": a["name"],
            "category": a["category_slug"],
            "composite_score": score_a,
            "photo_url": a["photo_url"],
            "neighborhood": a["neighborhood"]
        },
        "place_b": {
            "id": b["id"],
            "name": b["name"],
            "category": b["category_slug"],
            "composite_score": score_b,
            "photo_url": b["photo_url"],
            "neighborhood": b["neighborhood"]
        },
        "metrics": metrics,
        "overall_winner": "a" if score_a > score_b else ("b" if score_b > score_a else "tie")
    }

def get_leaderboards(category: Optional[str] = None) -> Dict[str, Any]:
    """Generate Best of / Worst of rankings per category and per neighborhood."""
    with get_db() as conn:
        cursor = conn.cursor()

        # Place rankings
        if category and category.lower() != "all":
            cursor.execute("SELECT * FROM places WHERE category_slug = ? ORDER BY composite_score DESC", (category.lower(),))
        else:
            cursor.execute("SELECT * FROM places ORDER BY composite_score DESC")
        all_places = [dict(r) for r in cursor.fetchall()]

        best_places = all_places[:5]
        worst_places = list(reversed(all_places[-5:])) if len(all_places) >= 5 else []

        # Neighborhood rankings
        cursor.execute("SELECT * FROM area_scores ORDER BY composite_score DESC")
        areas = [dict(r) for r in cursor.fetchall()]

        best_areas = areas[:4]
        worst_areas = list(reversed(areas[-4:])) if len(areas) >= 4 else []

        return {
            "best_places": best_places,
            "worst_places": worst_places,
            "safest_neighborhoods": best_areas,
            "least_safe_neighborhoods": worst_areas
        }
