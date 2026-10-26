# City Life: 3-Minute Demo Script & Hackathon Pitch Outline

---

## 🎬 3-Minute Live Demo Script

**Persona:** Presenter / Developer at Hackathon Final Presentation  
**Time Limit:** 180 Seconds (3:00)

### 0:00 - 0:25 | Act 1: The Hook & City Exploration
- **Action:** Open `http://localhost:8000`. The map displays San Francisco in clean CartoDB Voyager tiles, populated with clustered POIs.
- **Presenter:** *"City life gives us incredible culinary spots and cultural heritage, but navigating the chaos—sudden fog, traffic, and sketchy corridors—can be daunting. Meet **City Life**: a companion that tells you where to go and how to get there safely, right now."*
- **Action:** Toggle between **Tourist Mode** (highlighting Golden Gate, Cable Car Museum, Mission burritos) and **Local Mode** (activating real-time traffic and civic hazard reporting).

### 0:25 - 0:55 | Act 2: Place Scorecards & Best-vs-Worst Compare View
- **Action:** Click on *Golden Gate Bridge Vista Point*. Show the place scorecard displaying the 5 transparent component scores: Safety (92), Cleanliness (90), Affordability (95), Rating (98), Accessibility (88), and Composite (92.5).
- **Action:** Click **"Compare With Another Place"** to open the side-by-side modal with *Alcatraz Island*.
- **Presenter:** *"Every location receives a composite score across 5 key dimensions. Our weighted formula is 100% transparent: users can slide the weight preferences in real time to suit their priorities, and our dynamic radar chart recalculates winners instantly per metric."*
- **Action:** Adjust the "Safety Weight" slider; watch the radar chart and table update dynamically.

### 0:55 - 1:30 | Act 3: Citizen Reporting with Voice Note & AI NLP
- **Action:** Click **"📢 Drop Report"**. Click **"📍 Drop Pin on Map"** near 6th & Market.
- **Action:** Tap **"🎤 Record Voice Note"**, say *"Deep hazardous pothole and flickering street lamp right in the bike lane"*, stop recording.
- **Presenter:** *"Citizens don't have time to fill out clunky forms while walking. With City Life, they simply speak. Our built-in Speech-to-Text and NLP pipeline automatically classifies the category, extracts negative sentiment, flags high urgency, and computes an automated credibility score based on spatial corroboration and evidence."*
- **Action:** Submit report. Point out the live pin appear on the map and the DBSCAN hotspot cluster re-clustering immediately.

### 1:30 - 2:15 | Act 4: Safe Route Engine (Fastest vs. Safest Hazard Bypass)
- **Action:** Click **"🛡 Safe Route"**. Origin: *Mission District*; Destination: *Fisherman's Wharf*. Select **"Dusk"** or **"Night"**.
- **Action:** Click **"Calculate Route"**.
- **Presenter:** *"Most navigation apps only show you the fastest route, which often marches you straight through poorly lit alleys or incident clusters. City Life's spatial buffer engine calculates a real-time risk score with time-of-day hazard weighting."*
- **Action:** Show the dual routes drawn on the map:
  - *Amber dashed line (Fastest Route):* 14 min, but 72/100 risk passing through Tenderloin hazard buffers.
  - *Emerald Green solid line (Safest Route):* 17 min, risk score drops to 24/100—a **66.7% risk reduction** by bypassing known clusters.

### 2:15 - 2:45 | Act 5: Grounded Conversational AI Assistant
- **Action:** Open **"🤖 AI Assistant"** sidebar.
- **Action:** Click the prompt chip: *"Where can I eat cheap and safe in the city tonight?"*
- **Presenter:** *"General LLMs hallucinate phantom locations. Our City AI Companion answers strictly from verified, scored database records, citing exact safety metrics and budget levels with zero hallucinations."*
- **Action:** Show the answer with clickable citations leading directly to *La Taqueria* and *Ferry Building*.

### 2:45 - 3:00 | Act 6: Closing & Vision
- **Action:** Open **"📊 City Insights"** to show the live Open-Meteo weather advisory and resolution rates.
- **Presenter:** *"City Life turns scattered urban chaos into verified, actionable navigation. Thank you!"*

---

## 💡 Pitch Outline

### 1. Problem
City navigation is broken into silos: Google Maps gives directions without street-level safety context; Yelp rates food without neighborhood crime awareness; and 311 systems bury citizen complaints in bureaucratic black holes. Urban explorers and residents are left guessing which corridors are safe after dark.

### 2. Solution: City Life
An all-in-one smart city companion unifying:
- **Exploration & Hospitality:** Verified OpenStreetMap POIs with transparent multi-attribute scorecards.
- **History & Culture:** Curated heritage trails and customs calendars.
- **Safety & Security:** Risk-buffered safe route suggestions contrasting fastest vs. safest paths.
- **Citizen Engagement:** Instant voice-noted hazard reporting with automated NLP classification.
- **AI-Powered Grounding:** Conversational assistant citing real urban telemetry without hallucinations.

### 3. Tech Stack
- **Frontend:** Responsive React/HTML5 single-page application, Tailwind CSS, Leaflet + MarkerCluster, SVG/Canvas Radar Charts, Web Speech API & MediaRecorder.
- **Backend:** FastAPI REST API (with zero-dependency fallback runner), PostGIS & SQLite dual-layer spatial engine (Haversine queries).
- **AI/ML & NLP:** Semantic text classification, sentiment analysis, urgency detection, spatial DBSCAN clustering, and factor-based credibility scoring.
- **External Data APIs:** OpenStreetMap Overpass API, Open-Meteo Forecast API.

### 4. Impact & Value Proposition
- **For Tourists:** Confidence in exploring unfamiliar neighborhoods with scam/hazard warnings and cultural itineraries.
- **For Citizens:** Safer night commutes, voice-driven civic reporting, and visible municipal issue tracking.
- **For City Municipalities:** Actionable DBSCAN hotspot telemetry to prioritize streetlamp repairs, road fixes, and safety patrols.

### 5. Future Scope
- Municipal 311 bidirectional API integrations.
- Crowd-sourced lighting density measurements using smartphone ambient light sensors.
- Real-time GTFS transit disruption feeds and multimodal routing (walking + subway + bike).
