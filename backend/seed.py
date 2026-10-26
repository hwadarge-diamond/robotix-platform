"""
Database Seed Script for City Life.
Populates verified POIs, heritage details, neighborhood scores,
and realistic labeled simulated safety data for San Francisco.
"""

import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database import init_sqlite_db, get_db
from app.services.seed_data import (
    SAN_FRANCISCO_PLACES,
    NEIGHBORHOOD_SCORES,
    HERITAGE_DETAILS,
    SIMULATED_INCIDENTS,
    SIMULATED_REPORTS,
    SIMULATED_HOTSPOTS,
    SIMULATED_ALERTS,
    SIMULATED_NEWS
)
from app.services.overpass_service import fetch_overpass_pois

def run_seed(use_live_overpass: bool = False):
    print("=" * 60)
    print("City Life: Seeding Database for San Francisco, CA")
    print("=" * 60)

    # 1. Initialize Tables
    print("[1/7] Initializing SQLite tables...")
    init_sqlite_db()

    with get_db() as conn:
        cursor = conn.cursor()

        # 2. Seed Places
        print("[2/7] Seeding Places (Attractions, Food, Hotels, Heritage, Budget, Emergency)...")
        places_to_seed = SAN_FRANCISCO_PLACES
        if use_live_overpass:
            print("  Fetching live POIs from OpenStreetMap Overpass API...")
            live_places = fetch_overpass_pois()
            if live_places:
                places_to_seed = live_places
                print(f"  Retrieved {len(live_places)} places from Overpass API.")

        for p in places_to_seed:
            cursor.execute("""
            INSERT OR REPLACE INTO places (
                osm_id, name, category_slug, latitude, longitude, address,
                neighborhood, opening_hours, website, phone, price_level,
                rating, safety_score, cleanliness_score, affordability_score,
                accessibility_score, composite_score, wheelchair_accessible,
                description, history_notes, photo_url, is_simulated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p.get("osm_id"), p["name"], p["category_slug"], p["latitude"], p["longitude"],
                p.get("address"), p.get("neighborhood"), p.get("opening_hours"),
                p.get("website"), p.get("phone"), p.get("price_level", 2),
                p.get("rating", 4.0), p.get("safety_score", 80.0), p.get("cleanliness_score", 80.0),
                p.get("affordability_score", 75.0), p.get("accessibility_score", 75.0),
                p.get("composite_score", 80.0), p.get("wheelchair_accessible", 0),
                p.get("description"), p.get("history_notes"), p.get("photo_url"),
                p.get("is_simulated", 0)
            ))
        print(f"  Seeded {len(places_to_seed)} places successfully.")

        # 3. Seed Neighborhood Area Scores
        print("[3/7] Seeding Area Benchmark Scores...")
        for n in NEIGHBORHOOD_SCORES:
            cursor.execute("""
            INSERT OR REPLACE INTO area_scores (
                neighborhood_name, safety_score, cleanliness_score,
                affordability_score, rating_score, accessibility_score,
                composite_score, incident_density
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                n["name"], n["safety"], n["cleanliness"], n["affordability"],
                n["rating"], n["accessibility"], n["composite"], n["density"]
            ))
        print(f"  Seeded {len(NEIGHBORHOOD_SCORES)} neighborhood area scores.")

        # 4. Seed Heritage Details
        print("[4/7] Seeding Heritage and Cultural History Details...")
        for h in HERITAGE_DETAILS:
            # Lookup place_id by osm_id
            cursor.execute("SELECT id FROM places WHERE osm_id = ?", (h["osm_id"],))
            row = cursor.fetchone()
            if row:
                place_id = row["id"]
                cursor.execute("""
                INSERT OR REPLACE INTO heritage_info (
                    place_id, historical_significance, architectural_style,
                    year_built, visiting_tips, best_time_to_visit, local_traditions, festivals
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    place_id, h["historical_significance"], h["architectural_style"],
                    h["year_built"], h["visiting_tips"], h["best_time_to_visit"],
                    h["local_traditions"], h["festivals"]
                ))
        print(f"  Seeded {len(HERITAGE_DETAILS)} heritage profiles.")

        # 5. Seed Incidents (Simulated data)
        print("[5/7] Seeding Incidents (labeled is_simulated = 1)...")
        for inc in SIMULATED_INCIDENTS:
            cursor.execute("""
            INSERT INTO incidents (
                incident_type, severity, description, latitude, longitude,
                neighborhood, time_of_day, source, is_simulated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
            """, (
                inc["type"], inc["severity"], inc["desc"], inc["lat"],
                inc["lon"], inc["nhood"], inc["tod"], "simulated"
            ))
        print(f"  Seeded {len(SIMULATED_INCIDENTS)} incidents.")

        # 6. Seed Citizen Reports & Hotspots
        print("[6/7] Seeding Citizen Reports and Initial Hotspots...")
        for rep in SIMULATED_REPORTS:
            cursor.execute("""
            INSERT INTO reports (
                category, title, description, latitude, longitude, address,
                audio_url, transcript, sentiment, urgency, credibility_score,
                status, upvotes, is_simulated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            """, (
                rep["category"], rep["title"], rep["description"], rep["latitude"],
                rep["longitude"], rep["address"], rep["audio_url"], rep["transcript"],
                rep["sentiment"], rep["urgency"], rep["credibility_score"],
                rep["status"], rep["upvotes"]
            ))

        for hot in SIMULATED_HOTSPOTS:
            cursor.execute("""
            INSERT INTO hotspots (
                cluster_id, center_latitude, center_longitude, radius_meters,
                incident_count, risk_level, primary_category, time_sensitivity
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                hot["cluster_id"], hot["center_lat"], hot["center_lon"],
                hot["radius_meters"], hot["incident_count"], hot["risk_level"],
                hot["primary_category"], hot["time_sensitivity"]
            ))
        print(f"  Seeded {len(SIMULATED_REPORTS)} reports and {len(SIMULATED_HOTSPOTS)} hotspots.")

        # 7. Seed Alerts and News Signals
        print("[7/7] Seeding Weather Alerts & Civic News Signals...")
        for al in SIMULATED_ALERTS:
            cursor.execute("""
            INSERT INTO alerts (
                title, alert_type, severity, description, affected_area, advice, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, 1)
            """, (
                al["title"], al["alert_type"], al["severity"], al["description"],
                al["affected_area"], al["advice"]
            ))

        for ns in SIMULATED_NEWS:
            cursor.execute("""
            INSERT INTO news_signals (
                title, source_name, url, content, sentiment, urgency, category, latitude, longitude
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                ns["title"], ns["source_name"], ns["url"], ns["content"],
                ns["sentiment"], ns["urgency"], ns["category"], ns["lat"], ns["lon"]
            ))
        print(f"  Seeded {len(SIMULATED_ALERTS)} alerts and {len(SIMULATED_NEWS)} news items.")

    print("\nDatabase seeding completed successfully!")
    print(f"Target City: San Francisco, CA")

if __name__ == "__main__":
    live_flag = "--live-overpass" in sys.argv
    run_seed(use_live_overpass=live_flag)
