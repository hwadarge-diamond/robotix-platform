"""
Step 1 Automated Verification Test Suite.
Verifies database structure, seed data, and REST API queries.
"""

import sys
import unittest
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database import init_sqlite_db, get_db, haversine_distance_meters
from app.services.spatial_utils import (
    query_places, get_place_by_id, query_nearby_places, get_layer_data
)
from app.config import CITY_CENTER_LAT, CITY_CENTER_LON

class TestStep1Verification(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_sqlite_db()

    def test_database_tables_exist(self):
        """Verify all 13 required tables are created in the database."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row["name"] for row in cursor.fetchall()]

        required = [
            "categories", "places", "area_scores", "users", "reports",
            "report_media", "report_votes", "incidents", "hotspots",
            "route_requests", "alerts", "heritage_info", "news_signals"
        ]
        for tbl in required:
            self.assertIn(tbl, tables, f"Missing required table: {tbl}")

    def test_places_and_categories_seeded(self):
        """Verify places and categories are seeded with valid coordinates and scores."""
        places = query_places(limit=50)
        self.assertGreaterEqual(len(places), 10, "Should have at least 10 seeded places")

        for p in places:
            self.assertIsNotNone(p["name"])
            self.assertIn(p["category_slug"], ["attractions", "food", "hotels", "heritage", "budget", "emergency"])
            self.assertTrue(37.0 <= p["latitude"] <= 38.0, f"Latitude out of SF range: {p['latitude']}")
            self.assertTrue(-123.0 <= p["longitude"] <= -122.0, f"Longitude out of SF range: {p['longitude']}")
            self.assertTrue(0 <= p["safety_score"] <= 100)
            self.assertTrue(0 <= p["composite_score"] <= 100)

    def test_place_filters(self):
        """Verify search, category, and budget filtering logic."""
        # Category filter
        food_places = query_places(category="food")
        self.assertTrue(all(p["category_slug"] == "food" for p in food_places))

        # Text search
        bridge_places = query_places(q="Bridge")
        self.assertTrue(any("Bridge" in p["name"] for p in bridge_places))

        # Budget filter
        budget_places = query_places(max_price=1)
        self.assertTrue(all(p["price_level"] <= 1 for p in budget_places))

    def test_place_detail_with_heritage_and_reports(self):
        """Verify place detail endpoint retrieves joined heritage notes and nearby reports."""
        places = query_places(limit=1)
        self.assertTrue(len(places) > 0)
        place_id = places[0]["id"]

        detail = get_place_by_id(place_id)
        self.assertIsNotNone(detail)
        self.assertEqual(detail["id"], place_id)
        self.assertIn("heritage_info", detail)
        self.assertIn("recent_reports", detail)

    def test_haversine_nearby_query(self):
        """Verify spatial Haversine distance calculations and nearby queries."""
        dist = haversine_distance_meters(37.7749, -122.4194, 37.7749, -122.4194)
        self.assertAlmostEqual(dist, 0.0, places=1)

        nearby = query_nearby_places(CITY_CENTER_LAT, CITY_CENTER_LON, radius_meters=5000.0, limit=10)
        self.assertGreater(len(nearby), 0)
        for p in nearby:
            self.assertLessEqual(p["distance_meters"], 5000.0)

    def test_layer_aggregation(self):
        """Verify all toggleable layers are populated for map rendering."""
        layers = get_layer_data()
        self.assertIn("attractions", layers)
        self.assertIn("food", layers)
        self.assertIn("hotels", layers)
        self.assertIn("heritage", layers)
        self.assertIn("budget", layers)
        self.assertIn("unsafe_zones", layers)
        self.assertIn("hotspots", layers)
        self.assertIn("citizen_reports", layers)

        # Confirm simulated label presence on incidents
        for inc in layers["unsafe_zones"]:
            self.assertEqual(inc["is_simulated"], 1, "Simulated data flag must be 1")

if __name__ == "__main__":
    unittest.main()
