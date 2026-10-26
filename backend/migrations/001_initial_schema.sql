-- City Life Database Schema (PostgreSQL + PostGIS)
-- Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) NOT NULL DEFAULT 'map-pin',
    color VARCHAR(20) NOT NULL DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Places Table
CREATE TABLE IF NOT EXISTS places (
    id SERIAL PRIMARY KEY,
    osm_id BIGINT UNIQUE,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    category_slug VARCHAR(100) NOT NULL DEFAULT 'attractions',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    address TEXT,
    neighborhood VARCHAR(150),
    opening_hours VARCHAR(255),
    website TEXT,
    phone VARCHAR(50),
    price_level INTEGER DEFAULT 2 CHECK (price_level BETWEEN 1 AND 4), -- 1: $, 2: $$, 3: $$$, 4: $$$$
    rating DOUBLE PRECISION DEFAULT 4.0 CHECK (rating BETWEEN 0 AND 5),
    safety_score DOUBLE PRECISION DEFAULT 80.0 CHECK (safety_score BETWEEN 0 AND 100),
    cleanliness_score DOUBLE PRECISION DEFAULT 80.0 CHECK (cleanliness_score BETWEEN 0 AND 100),
    affordability_score DOUBLE PRECISION DEFAULT 75.0 CHECK (affordability_score BETWEEN 0 AND 100),
    accessibility_score DOUBLE PRECISION DEFAULT 75.0 CHECK (accessibility_score BETWEEN 0 AND 100),
    composite_score DOUBLE PRECISION DEFAULT 80.0 CHECK (composite_score BETWEEN 0 AND 100),
    wheelchair_accessible BOOLEAN DEFAULT FALSE,
    description TEXT,
    history_notes TEXT,
    photo_url TEXT,
    tags JSONB DEFAULT '{}'::jsonb,
    is_simulated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_places_geom ON places USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_places_category ON places (category_slug);
CREATE INDEX IF NOT EXISTS idx_places_neighborhood ON places (neighborhood);

-- 3. Area Scores (Neighborhood Composite Benchmarks)
CREATE TABLE IF NOT EXISTS area_scores (
    id SERIAL PRIMARY KEY,
    neighborhood_name VARCHAR(150) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL DEFAULT 'San Francisco',
    boundary_geom GEOMETRY(Polygon, 4326),
    boundary_geojson JSONB,
    safety_score DOUBLE PRECISION DEFAULT 75.0,
    cleanliness_score DOUBLE PRECISION DEFAULT 75.0,
    affordability_score DOUBLE PRECISION DEFAULT 70.0,
    rating_score DOUBLE PRECISION DEFAULT 80.0,
    accessibility_score DOUBLE PRECISION DEFAULT 75.0,
    composite_score DOUBLE PRECISION DEFAULT 75.0,
    incident_density DOUBLE PRECISION DEFAULT 0.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_area_scores_geom ON area_scores USING GIST (boundary_geom);

-- 4. Users Table (Lightweight)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255),
    is_anonymous BOOLEAN DEFAULT TRUE,
    role VARCHAR(50) DEFAULT 'citizen', -- citizen, tourist, moderator, admin
    trust_score DOUBLE PRECISION DEFAULT 50.0 CHECK (trust_score BETWEEN 0 AND 100),
    report_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Citizen Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL, -- pothole, lighting, accident, harassment, flooding, garbage, traffic, other
    title VARCHAR(255),
    description TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    address TEXT,
    audio_url TEXT,
    transcript TEXT,
    sentiment VARCHAR(50) DEFAULT 'neutral', -- positive, neutral, negative
    urgency VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
    credibility_score DOUBLE PRECISION DEFAULT 50.0 CHECK (credibility_score BETWEEN 0 AND 100),
    status VARCHAR(50) DEFAULT 'unverified', -- unverified, verified, resolved
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_simulated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_geom ON reports USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports (category);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);

-- 6. Report Media Table
CREATE TABLE IF NOT EXISTS report_media (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    media_type VARCHAR(50) NOT NULL, -- image, audio
    media_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Report Votes Table
CREATE TABLE IF NOT EXISTS report_votes (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ip_hash VARCHAR(64),
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('upvote', 'confirm', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_vote UNIQUE (report_id, ip_hash)
);

-- 8. Incidents Table (Historical & Simulated Feed)
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    incident_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
    description TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    neighborhood VARCHAR(150),
    time_of_day VARCHAR(50) DEFAULT 'night', -- morning, afternoon, evening, night
    source VARCHAR(100) DEFAULT 'simulated', -- police, traffic, citizen, simulated
    is_simulated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_incidents_geom ON incidents USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_incidents_time ON incidents (time_of_day);

-- 9. Hotspots Table (DBSCAN Clusters)
CREATE TABLE IF NOT EXISTS hotspots (
    id SERIAL PRIMARY KEY,
    cluster_id INTEGER NOT NULL,
    center_latitude DOUBLE PRECISION NOT NULL,
    center_longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    radius_meters DOUBLE PRECISION NOT NULL DEFAULT 150.0,
    incident_count INTEGER NOT NULL DEFAULT 1,
    risk_level VARCHAR(50) DEFAULT 'high', -- low, medium, high, severe
    primary_category VARCHAR(100),
    time_sensitivity VARCHAR(50) DEFAULT 'all_day', -- morning, evening, night, all_day
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hotspots_geom ON hotspots USING GIST (geom);

-- 10. Route Requests Table
CREATE TABLE IF NOT EXISTS route_requests (
    id SERIAL PRIMARY KEY,
    origin_latitude DOUBLE PRECISION NOT NULL,
    origin_longitude DOUBLE PRECISION NOT NULL,
    dest_latitude DOUBLE PRECISION NOT NULL,
    dest_longitude DOUBLE PRECISION NOT NULL,
    time_of_day VARCHAR(50) DEFAULT 'evening',
    fastest_route_json JSONB,
    safest_route_json JSONB,
    fastest_risk_score DOUBLE PRECISION,
    safest_risk_score DOUBLE PRECISION,
    risk_reduction_pct DOUBLE PRECISION,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Alerts Table (City & Weather Broadcasts)
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    alert_type VARCHAR(100) NOT NULL, -- weather, safety, traffic, civic
    severity VARCHAR(50) NOT NULL DEFAULT 'advisory', -- advisory, watch, warning, emergency
    description TEXT NOT NULL,
    affected_area VARCHAR(255),
    geom GEOMETRY(Polygon, 4326),
    advice TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 12. Heritage Info Table
CREATE TABLE IF NOT EXISTS heritage_info (
    id SERIAL PRIMARY KEY,
    place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    historical_significance TEXT NOT NULL,
    architectural_style VARCHAR(150),
    year_built VARCHAR(50),
    visiting_tips TEXT,
    best_time_to_visit VARCHAR(150),
    local_traditions TEXT,
    festivals TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. News & Social Media Signals Table
CREATE TABLE IF NOT EXISTS news_signals (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    source_name VARCHAR(100) NOT NULL,
    url TEXT,
    content TEXT NOT NULL,
    sentiment VARCHAR(50) DEFAULT 'neutral',
    urgency VARCHAR(50) DEFAULT 'low',
    relevance_score DOUBLE PRECISION DEFAULT 80.0,
    category VARCHAR(100) DEFAULT 'traffic', -- traffic, weather, safety, event
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
