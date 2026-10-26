"""
Comprehensive Test Suite covering all Five Required Pillars.
"""

import sys
import unittest
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database import init_sqlite_db
from app.services.scoring_service import calculate_composite_score, compare_places, get_leaderboards
from app.services.nlp_service import classify_text, calculate_credibility_score, detect_spam
from app.services.hotspot_service import dbscan_cluster_incidents, generate_risk_heatmap_cells
from app.services.routing_service import plan_safe_route
from app.services.assistant_service import answer_city_query
from app.services.heritage_service import generate_heritage_itinerary

class TestCityLifeAllPillars(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_sqlite_db()

    def test_pillar2_scoring_and_weights(self):
        """Pillar 2: Verify scoring formula transparency and custom weight responsiveness."""
        base_score = calculate_composite_score(
            safety=90.0, cleanliness=80.0, affordability=70.0, rating_5=4.5, accessibility=80.0
        )
        self.assertGreaterEqual(base_score, 75.0)

        # High safety weight preference
        heavy_safety_weights = {"safety": 0.8, "cleanliness": 0.05, "affordability": 0.05, "rating": 0.05, "accessibility": 0.05}
        weighted_score = calculate_composite_score(
            safety=90.0, cleanliness=40.0, affordability=40.0, rating_5=2.0, accessibility=40.0,
            weights=heavy_safety_weights
        )
        self.assertGreater(weighted_score, 70.0)

    def test_pillar2_compare_view(self):
        """Pillar 2: Verify side-by-side comparison identifies metrics and winners."""
        comp = compare_places(1, 2)
        self.assertIn("place_a", comp)
        self.assertIn("place_b", comp)
        self.assertIn("metrics", comp)
        self.assertEqual(len(comp["metrics"]), 6)
        for m in comp["metrics"]:
            self.assertIn(m["winner"], ["a", "b", "tie"])

    def test_pillar2_leaderboards(self):
        """Pillar 2: Verify Best vs Worst rankings per category and neighborhood."""
        ranks = get_leaderboards()
        self.assertGreaterEqual(len(ranks["best_places"]), 1)
        self.assertGreaterEqual(len(ranks["safest_neighborhoods"]), 1)
        self.assertGreaterEqual(len(ranks["least_safe_neighborhoods"]), 1)

    def test_pillar3_safe_routing(self):
        """Pillar 3: Verify fastest vs safest routes, risk scores, and positive risk reduction."""
        plan = plan_safe_route(
            origin_lat=37.7749, origin_lon=-122.4194,
            dest_lat=37.8087, dest_lon=-122.4098,
            time_of_day="night"
        )
        self.assertIn("fastest_route", plan)
        self.assertIn("safest_route", plan)
        self.assertGreater(len(plan["fastest_route"]["waypoints"]), 5)
        self.assertGreater(len(plan["safest_route"]["waypoints"]), 5)
        self.assertLessEqual(plan["safest_route"]["risk_score"], plan["fastest_route"]["risk_score"])
        self.assertGreaterEqual(plan["risk_reduction_pct"], 0.0)
        self.assertIn("explanation", plan)

    def test_pillar4_nlp_and_credibility(self):
        """Pillar 4: Verify NLP text categorization, sentiment, and credibility estimation."""
        nlp_res = classify_text("Severe car accident and pedestrian injury blocking intersection")
        self.assertEqual(nlp_res["category"], "traffic")
        self.assertIn(nlp_res["urgency"], ["high", "critical"])
        self.assertEqual(nlp_res["sentiment"], "negative")

        cred = calculate_credibility_score(
            lat=37.7845, lon=-122.4162, has_photo=True, has_audio=True, text_length=60
        )
        self.assertGreaterEqual(cred["score"], 70.0)
        self.assertTrue(cred["is_verified"])

        self.assertTrue(detect_spam("buy cheap casino promo click here now"))
        self.assertFalse(detect_spam("Broken street lamp on corner of 16th and Valencia"))

    def test_pillar5_hotspots_dbscan(self):
        """Pillar 5: Verify DBSCAN clustering generates hotspot boundaries and heatmap."""
        hotspots = dbscan_cluster_incidents(eps_meters=350.0, min_samples=2)
        self.assertGreaterEqual(len(hotspots), 1)
        for h in hotspots:
            self.assertGreater(h["radius_meters"], 50.0)
            self.assertGreaterEqual(h["incident_count"], 2)

        heatmap = generate_risk_heatmap_cells(grid_steps=10)
        self.assertIsInstance(heatmap, list)

    def test_grounded_assistant(self):
        """Pillar 5: Verify conversational assistant grounds answers on DB with citations."""
        res = answer_city_query("Where can I eat cheap and safe in the city?")
        self.assertTrue(res["grounded"])
        self.assertGreaterEqual(len(res["citations"]), 1)
        for c in res["citations"]:
            self.assertIn("name", c)
            self.assertIn("safety_score", c)

    def test_heritage_itinerary(self):
        """Pillar 1 & 2: Verify heritage itinerary generation."""
        itin = generate_heritage_itinerary(duration_hours=4, budget_level=2)
        self.assertIn("schedule", itin)
        self.assertGreaterEqual(len(itin["schedule"]), 2)
        self.assertIn("traditions_calendar", itin)

if __name__ == "__main__":
    unittest.main()
