"""
AI/ML NLP Classification, Sentiment Analysis, Urgency Estimation, and Credibility Scoring.
Uses heuristic and lexical semantic analysis designed to run deterministically and fast.
"""

import re
from typing import Dict, Any, List
from app.database import get_db

# Category Keywords
CATEGORY_PATTERNS = {
    "safety": [
        "theft", "stolen", "harass", "assault", "fight", "mugging", "threat",
        "robbery", "dark", "lighting", "unsafe", "danger", "police", "knife", "gun"
    ],
    "cleanliness": [
        "garbage", "trash", "dumping", "litter", "dirty", "smell", "odor",
        "waste", "debris", "overflowing", "biohazard", "urine", "feces"
    ],
    "traffic": [
        "traffic", "jam", "gridlock", "signal", "accident", "crash", "collision",
        "congestion", "blocked", "bus delay", "car", "cyclist", "pedestrian"
    ],
    "infrastructure": [
        "pothole", "sidewalk", "broken", "curb", "water leak", "pipe",
        "flooding", "power outage", "wire", "cracked", "pavement", "sinkhole"
    ]
}

# Urgency Keywords
CRITICAL_WORDS = ["fire", "weapon", "active assault", "collapse", "severe injury", "life-threatening", "emergency", "armed", "assault"]
HIGH_WORDS = ["accident", "injury", "crash", "collision", "flooding", "deep pothole", "harassment", "broken glass", "blocked", "danger", "severe"]
MEDIUM_WORDS = ["dark", "light out", "garbage", "trash", "delay", "pothole", "noise", "vandalism", "potholes"]


# Sentiment Lexicon
POSITIVE_WORDS = ["resolved", "fixed", "safe", "clean", "beautiful", "prompt", "helpful", "good", "great", "thank", "peaceful", "pleasant"]
NEGATIVE_WORDS = ["terrible", "dangerous", "awful", "bad", "scary", "broken", "disgusting", "horrible", "avoid", "risky", "severely", "severe", "worst", "accident", "injury", "crash", "collision", "hazard", "threat", "theft", "danger", "harassment"]


def classify_text(text: str) -> Dict[str, Any]:
    """
    Classify report text into category, sentiment, and urgency score.
    """
    cleaned = text.lower()
    words = set(re.findall(r'\b\w+\b', cleaned))

    # 1. Category Classification
    scores = {cat: 0 for cat in CATEGORY_PATTERNS}
    for cat, keywords in CATEGORY_PATTERNS.items():
        for kw in keywords:
            if kw in cleaned:
                scores[cat] += 1

    top_category = max(scores, key=scores.get)
    if scores[top_category] == 0:
        top_category = "other"

    # 2. Urgency Classification
    if any(cw in cleaned for cw in CRITICAL_WORDS):
        urgency = "critical"
        urgency_score = 100.0
    elif any(hw in cleaned for hw in HIGH_WORDS):
        urgency = "high"
        urgency_score = 75.0
    elif any(mw in cleaned for mw in MEDIUM_WORDS):
        urgency = "medium"
        urgency_score = 50.0
    else:
        urgency = "low"
        urgency_score = 25.0

    # 3. Sentiment Analysis
    pos_matches = sum(1 for pw in POSITIVE_WORDS if pw in cleaned)
    neg_matches = sum(1 for nw in NEGATIVE_WORDS if nw in cleaned)
    
    if neg_matches > pos_matches:
        sentiment = "negative"
        sentiment_score = -0.6
    elif pos_matches > neg_matches:
        sentiment = "positive"
        sentiment_score = 0.6
    else:
        sentiment = "neutral"
        sentiment_score = 0.0

    return {
        "category": top_category,
        "urgency": urgency,
        "urgency_score": urgency_score,
        "sentiment": sentiment,
        "sentiment_score": sentiment_score
    }

def calculate_credibility_score(
    lat: float,
    lon: float,
    has_photo: bool,
    has_audio: bool,
    text_length: int,
    reporter_trust_score: float = 50.0
) -> Dict[str, Any]:
    """
    Credibility engine factor breakdown:
    - Corroborating reports within 300 meters (+25 pts)
    - Photo evidence attached (+25 pts)
    - Audio voice note attached (+15 pts)
    - Descriptive detail / text quality (+15 pts)
    - User trust score history (+20 pts)
    """
    factors = {}
    base_score = 20.0

    # 1. Spatial confirmation: check nearby reports in DB within 300 meters
    nearby_confirmations = 0
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT COUNT(*) as cnt FROM reports
        WHERE haversine_meters(latitude, longitude, ?, ?) <= 300
        """, (lat, lon))
        row = cursor.fetchone()
        if row:
            nearby_confirmations = row["cnt"]

    if nearby_confirmations > 0:
        factors["spatial_corroboration"] = min(25.0, nearby_confirmations * 12.5)
    else:
        factors["spatial_corroboration"] = 5.0

    # 2. Photo Evidence
    factors["photo_evidence"] = 25.0 if has_photo else 0.0

    # 3. Audio Voice Note
    factors["voice_consistency"] = 15.0 if has_audio else 0.0

    # 4. Text Quality (more than 30 characters of descriptive detail)
    factors["description_richness"] = 15.0 if text_length >= 35 else 5.0

    # 5. Reporter History / Trust
    factors["reporter_trust"] = min(20.0, (reporter_trust_score / 100.0) * 20.0)

    total_credibility = base_score + sum(factors.values())
    final_score = round(min(100.0, max(10.0, total_credibility)), 1)

    return {
        "score": final_score,
        "is_verified": final_score >= 70.0,
        "factors": factors
    }

def detect_spam(text: str) -> bool:
    """Basic spam & abuse detector: repeated characters, promotional spam keywords, empty text."""
    if not text or len(text.strip()) < 5:
        return True
    lower = text.lower()
    spam_phrases = ["casino", "buy cheap", "promo click", "free crypto", "viagra", "poker", "click here now", "buy now"]
    if any(p in lower for p in spam_phrases):
        return True
    if re.search(r'(.)\1{6,}', text):  # e.g. "aaaaaaa"
        return True
    return False

