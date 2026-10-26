"""
Heritage Hub & Cultural Itinerary Generator.
Curates heritage landmarks, local traditions, festivals,
and builds optimized walking itineraries based on time budget and price constraints.
"""

from typing import List, Dict, Any, Optional
from app.database import get_db

TRADITIONS_CALENDAR = [
    {
        "month": "February / March",
        "name": "Chinese New Year Parade & Street Fair",
        "neighborhood": "Chinatown",
        "description": "One of the largest celebrations of Asian culture in North America, featuring the 288-foot golden dragon."
    },
    {
        "month": "May",
        "name": "Carnaval San Francisco",
        "neighborhood": "Mission District",
        "description": "Two-day multicultural festival showcasing Latin American, Caribbean, and African diaspora music, dance, and artisan crafts."
    },
    {
        "month": "June",
        "name": "San Francisco Pride Celebration",
        "neighborhood": "Civic Center & Castro",
        "description": "Historic civil rights and LGBTQ+ community march uniting over a million participants along Market Street."
    },
    {
        "month": "November",
        "name": "Día de los Muertos Procession & Altars",
        "neighborhood": "Mission District (Mission Dolores)",
        "description": "Solemn and luminous candlelight procession honoring departed ancestors with traditional ofrendas and marigolds."
    }
]

def get_all_heritage_sites() -> List[Dict[str, Any]]:
    """Retrieve all heritage places with joined history notes and visiting tips."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT p.*, h.historical_significance, h.architectural_style, h.year_built,
               h.visiting_tips, h.best_time_to_visit, h.local_traditions, h.festivals
        FROM places p
        LEFT JOIN heritage_info h ON p.id = h.place_id
        WHERE p.category_slug = 'heritage' OR h.id IS NOT NULL
        ORDER BY p.composite_score DESC
        """)
        return [dict(r) for r in cursor.fetchall()]

def generate_heritage_itinerary(
    duration_hours: int = 4,
    budget_level: int = 2
) -> Dict[str, Any]:
    """
    Generate an optimized cultural walking tour itinerary
    based on available duration (hours) and budget.
    """
    sites = get_all_heritage_sites()
    
    # Determine stops count based on duration
    stops_count = 2 if duration_hours <= 2 else (3 if duration_hours <= 4 else 5)
    selected_sites = sites[:stops_count]

    # Find nearby food stop fitting budget
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT * FROM places
        WHERE category_slug = 'food' AND price_level <= ?
        ORDER BY composite_score DESC LIMIT 2
        """, (budget_level,))
        food_recommendations = [dict(r) for r in cursor.fetchall()]

    schedule = []
    current_time_min = 10 * 60  # Start at 10:00 AM

    for idx, site in enumerate(selected_sites, 1):
        hours = current_time_min // 60
        mins = current_time_min % 60
        time_str = f"{hours:02d}:{mins:02d}"

        schedule.append({
            "stop_number": idx,
            "time": time_str,
            "place_name": site["name"],
            "neighborhood": site["neighborhood"],
            "visiting_tip": site.get("visiting_tips") or "Great photo opportunity and architectural detail.",
            "estimated_stay_minutes": 45,
            "photo_url": site.get("photo_url")
        })
        current_time_min += 60  # 45 min visit + 15 min walk

    # Add culinary intermission if >= 4 hours
    if duration_hours >= 4 and food_recommendations:
        food = food_recommendations[0]
        hours = current_time_min // 60
        mins = current_time_min % 60
        schedule.insert(2, {
            "stop_number": "Lunch Break",
            "time": f"{hours:02d}:{mins:02d}",
            "place_name": food["name"],
            "neighborhood": food["neighborhood"],
            "visiting_tip": f"Recommended local culinary stop ({'$' * food['price_level']}). Rating: ★ {food['rating']}",
            "estimated_stay_minutes": 50,
            "photo_url": food.get("photo_url")
        })

    return {
        "title": f"{duration_hours}-Hour Historic San Francisco Walking Discovery",
        "duration_hours": duration_hours,
        "budget_level": '$' * budget_level,
        "stop_count": len(schedule),
        "schedule": schedule,
        "traditions_calendar": TRADITIONS_CALENDAR
    }
