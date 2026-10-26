import sqlite3
import math
from contextlib import contextmanager
from app.config import SQLITE_DB_PATH

def haversine_distance_meters(lat1, lon1, lat2, lon2):
    """Calculate distance in meters between two lat/lon pairs using Haversine formula."""
    r = 6371000  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c

def get_db_connection():
    """Create and return a configured SQLite connection with dict rows."""
    conn = sqlite3.connect(str(SQLITE_DB_PATH))
    conn.row_factory = sqlite3.Row
    # Register spatial function in sqlite
    conn.create_function("haversine_meters", 4, haversine_distance_meters)
    return conn

@contextmanager
def get_db():
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_sqlite_db():
    """Initialize local SQLite tables mirroring the PostGIS schema."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Categories
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            slug TEXT NOT NULL UNIQUE,
            icon TEXT NOT NULL DEFAULT 'map-pin',
            color TEXT NOT NULL DEFAULT '#3B82F6',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 2. Places
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS places (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            osm_id INTEGER UNIQUE,
            name TEXT NOT NULL,
            category_id INTEGER REFERENCES categories(id),
            category_slug TEXT NOT NULL DEFAULT 'attractions',
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            address TEXT,
            neighborhood TEXT,
            opening_hours TEXT,
            website TEXT,
            phone TEXT,
            price_level INTEGER DEFAULT 2,
            rating REAL DEFAULT 4.0,
            safety_score REAL DEFAULT 80.0,
            cleanliness_score REAL DEFAULT 80.0,
            affordability_score REAL DEFAULT 75.0,
            accessibility_score REAL DEFAULT 75.0,
            composite_score REAL DEFAULT 80.0,
            wheelchair_accessible INTEGER DEFAULT 0,
            description TEXT,
            history_notes TEXT,
            photo_url TEXT,
            tags TEXT DEFAULT '{}',
            is_simulated INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 3. Area Scores
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS area_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            neighborhood_name TEXT NOT NULL UNIQUE,
            city TEXT NOT NULL DEFAULT 'San Francisco',
            boundary_geojson TEXT,
            safety_score REAL DEFAULT 75.0,
            cleanliness_score REAL DEFAULT 75.0,
            affordability_score REAL DEFAULT 70.0,
            rating_score REAL DEFAULT 80.0,
            accessibility_score REAL DEFAULT 75.0,
            composite_score REAL DEFAULT 75.0,
            incident_density REAL DEFAULT 0.0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 4. Users
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT,
            is_anonymous INTEGER DEFAULT 1,
            role TEXT DEFAULT 'citizen',
            trust_score REAL DEFAULT 50.0,
            report_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 5. Reports
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reporter_id INTEGER REFERENCES users(id),
            category TEXT NOT NULL,
            title TEXT,
            description TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            address TEXT,
            audio_url TEXT,
            transcript TEXT,
            sentiment TEXT DEFAULT 'neutral',
            urgency TEXT DEFAULT 'medium',
            credibility_score REAL DEFAULT 50.0,
            status TEXT DEFAULT 'unverified',
            upvotes INTEGER DEFAULT 0,
            downvotes INTEGER DEFAULT 0,
            is_simulated INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 6. Report Media
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS report_media (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
            media_type TEXT NOT NULL,
            media_url TEXT NOT NULL,
            caption TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 7. Report Votes
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS report_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id),
            ip_hash TEXT,
            vote_type TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(report_id, ip_hash)
        );
        """)

        # 8. Incidents
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            incident_type TEXT NOT NULL,
            severity TEXT DEFAULT 'medium',
            description TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            neighborhood TEXT,
            time_of_day TEXT DEFAULT 'night',
            source TEXT DEFAULT 'simulated',
            is_simulated INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 9. Hotspots
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS hotspots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cluster_id INTEGER NOT NULL,
            center_latitude REAL NOT NULL,
            center_longitude REAL NOT NULL,
            radius_meters REAL NOT NULL DEFAULT 150.0,
            incident_count INTEGER NOT NULL DEFAULT 1,
            risk_level TEXT DEFAULT 'high',
            primary_category TEXT,
            time_sensitivity TEXT DEFAULT 'all_day',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 10. Route Requests
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS route_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            origin_latitude REAL NOT NULL,
            origin_longitude REAL NOT NULL,
            dest_latitude REAL NOT NULL,
            dest_longitude REAL NOT NULL,
            time_of_day TEXT DEFAULT 'evening',
            fastest_route_json TEXT,
            safest_route_json TEXT,
            fastest_risk_score REAL,
            safest_risk_score REAL,
            risk_reduction_pct REAL,
            explanation TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 11. Alerts
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            alert_type TEXT NOT NULL,
            severity TEXT NOT NULL DEFAULT 'advisory',
            description TEXT NOT NULL,
            affected_area TEXT,
            advice TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP
        );
        """)

        # 12. Heritage Info
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS heritage_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
            historical_significance TEXT NOT NULL,
            architectural_style TEXT,
            year_built TEXT,
            visiting_tips TEXT,
            best_time_to_visit TEXT,
            local_traditions TEXT,
            festivals TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 13. News Signals
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS news_signals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            source_name TEXT NOT NULL,
            url TEXT,
            content TEXT NOT NULL,
            sentiment TEXT DEFAULT 'neutral',
            urgency TEXT DEFAULT 'low',
            relevance_score REAL DEFAULT 80.0,
            category TEXT DEFAULT 'traffic',
            latitude REAL,
            longitude REAL,
            published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Create indices
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_places_cat ON places (category_slug);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_places_nhood ON places (neighborhood);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_reports_cat ON reports (category);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_incidents_time ON incidents (time_of_day);")
        
        # Insert base categories if not present
        default_categories = [
            ("Attractions", "attractions", "compass", "#3B82F6"),
            ("Food & Dining", "food", "utensils", "#EF4444"),
            ("Hotels & Stays", "hotels", "hotel", "#8B5CF6"),
            ("Heritage & Culture", "heritage", "landmark", "#D97706"),
            ("Budget Spots", "budget", "tag", "#10B981"),
            ("Emergency & Safety", "emergency", "shield-alert", "#06B6D4")
        ]
        cursor.executemany("""
        INSERT OR IGNORE INTO categories (name, slug, icon, color)
        VALUES (?, ?, ?, ?)
        """, default_categories)
