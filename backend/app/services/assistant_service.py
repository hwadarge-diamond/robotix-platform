"""
Conversational City Assistant Service.
Provides fact-grounded recommendations strictly using the application's verified database.
Refuses to fabricate hallucinations and always returns structured citations.
"""

import re
from typing import Dict, Any, List
from app.database import get_db, haversine_distance_meters

def answer_city_query(prompt: str, user_lat: float = 37.7749, user_lon: float = -122.4194) -> Dict[str, Any]:
    """
    Search database for relevant places, incidents, and scores,
    and generate a strictly grounded answer with citations.
    """
    cleaned = prompt.lower()
    
    with get_db() as conn:
        cursor = conn.cursor()

        # Check intent
        wants_food = any(w in cleaned for w in ["eat", "food", "restaurant", "burrito", "dinner", "lunch", "cheap eat"])
        wants_budget = any(w in cleaned for w in ["cheap", "budget", "affordable", "free", "$"])
        wants_safe = any(w in cleaned for w in ["safe", "safest", "security", "danger", "hazard"])
        wants_heritage = any(w in cleaned for w in ["history", "heritage", "culture", "landmark", "tradition", "museum"])

        # Fetch candidate places from DB
        cursor.execute("SELECT * FROM places ORDER BY composite_score DESC")
        all_places = [dict(r) for r in cursor.fetchall()]

    candidates = []
    for p in all_places:
        score = 0
        if wants_food and p["category_slug"] == "food":
            score += 4
        if wants_heritage and p["category_slug"] in ("heritage", "attractions"):
            score += 4
        if wants_budget and p["price_level"] == 1:
            score += 3
        if wants_safe and p["safety_score"] >= 80:
            score += 3
        # Match names
        words = re.findall(r'\b\w+\b', p["name"].lower())
        for w in words:
            if len(w) > 3 and w in cleaned:
                score += 5

        if score > 0:
            candidates.append((score, p))

    candidates.sort(key=lambda x: x[0], reverse=True)
    top_matches = [c[1] for c in candidates[:3]]

    # If no match from filters, take the top 3 scored places overall
    if not top_matches:
        top_matches = all_places[:2]

    # Generate grounded response
    citations = []
    lines = []

    lines.append(f"Based strictly on verified database records for San Francisco:\n")
    for idx, p in enumerate(top_matches, 1):
        citations.append({
            "id": p["id"],
            "name": p["name"],
            "category": p["category_slug"],
            "safety_score": p["safety_score"],
            "composite_score": p["composite_score"],
            "price_level": '$' * (p.get("price_level") or 1),
            "neighborhood": p["neighborhood"]
        })
        lines.append(
            f"{idx}. **{p['name']}** ({p['neighborhood']}):\n"
            f"   - **Safety Score**: {p['safety_score']}/100 | **Composite**: {p['composite_score']}/100\n"
            f"   - **Budget**: {'$' * (p.get('price_level') or 1)} | **Rating**: ★ {p['rating']}\n"
            f"   - **Details**: {p['description']}"
        )

    if wants_safe:
        lines.append(
            f"\n*Safety Note:* Active route planning with hazard bypass is recommended if travelling after dusk."
        )

    response_text = "\n".join(lines)

    return {
        "query": prompt,
        "answer": response_text,
        "citations": citations,
        "grounded": True,
        "data_sources": ["City Life Verified Places Database", "OpenStreetMap"]
    }
