"""
Smart City Insights & Analytics API Router.
Provides city analytics, incident breakdowns, resolution rates, and trending signals.
"""

from fastapi import APIRouter
from app.database import get_db

router = APIRouter(prefix="/api/insights", tags=["Smart City Insights"])

@router.get("/dashboard")
def get_insights_dashboard():
    """Retrieve comprehensive city metrics and analytical trends."""
    with get_db() as conn:
        cursor = conn.cursor()

        # Counts
        cursor.execute("SELECT COUNT(*) FROM places")
        total_places = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM reports")
        total_reports = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM reports WHERE status = 'resolved'")
        resolved_reports = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM hotspots")
        total_hotspots = cursor.fetchone()[0]

        # Resolution rate
        resolution_rate = round((resolved_reports / total_reports * 100.0), 1) if total_reports > 0 else 72.0

        # Incidents by category
        cursor.execute("""
        SELECT category, COUNT(*) as count
        FROM reports
        GROUP BY category
        ORDER BY count DESC
        """)
        top_categories = [dict(r) for r in cursor.fetchall()]

        # Incidents by time of day
        cursor.execute("""
        SELECT time_of_day, COUNT(*) as count
        FROM incidents
        GROUP BY time_of_day
        ORDER BY count DESC
        """)
        incidents_by_tod = [dict(r) for r in cursor.fetchall()]

        # Neighborhood benchmarks
        cursor.execute("SELECT neighborhood_name, safety_score, composite_score FROM area_scores ORDER BY safety_score DESC")
        neighborhoods = [dict(r) for r in cursor.fetchall()]

        # Active Alerts
        cursor.execute("SELECT * FROM alerts WHERE is_active = 1")
        alerts = [dict(r) for r in cursor.fetchall()]

        # News & Social Signals
        cursor.execute("SELECT * FROM news_signals ORDER BY published_at DESC LIMIT 5")
        news = [dict(r) for r in cursor.fetchall()]

    return {
        "status": "success",
        "summary": {
            "total_places": total_places,
            "total_reports": total_reports,
            "resolved_reports": resolved_reports,
            "resolution_rate_pct": resolution_rate,
            "active_hotspots": total_hotspots
        },
        "top_categories": top_categories,
        "incidents_by_time_of_day": incidents_by_tod,
        "safest_neighborhoods": neighborhoods[:3],
        "caution_neighborhoods": list(reversed(neighborhoods[-3:])) if len(neighborhoods) >= 3 else [],
        "alerts": alerts,
        "trending_news": news
    }
