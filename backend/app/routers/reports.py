"""
Citizen Reports API Router.
Handles report submissions, audio transcription, automated NLP classification,
credibility estimation, and community confirmation voting.
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Body
from app.database import get_db
from app.services.nlp_service import classify_text, calculate_credibility_score, detect_spam
from app.services.hotspot_service import dbscan_cluster_incidents

router = APIRouter(prefix="/api/reports", tags=["Citizen Reports"])

@router.get("")
def list_reports(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100)
):
    """Retrieve citizen reports."""
    query = "SELECT * FROM reports WHERE 1=1"
    params = []
    if category:
        query += " AND category = ?"
        params.append(category.lower())
    if status:
        query += " AND status = ?"
        params.append(status.lower())

    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        reports = [dict(r) for r in cursor.fetchall()]

    return {"status": "success", "count": len(reports), "reports": reports}

@router.post("")
def submit_report(payload: Dict[str, Any] = Body(...)):
    """
    Submit a citizen report with photo, audio transcript, and location.
    Runs automated NLP classification, sentiment, urgency, and credibility scoring.
    """
    description = payload.get("description", "").strip()
    if not description:
        raise HTTPException(status_code=400, detail="Report description cannot be empty")

    # Spam detection
    if detect_spam(description):
        raise HTTPException(status_code=422, detail="Submission flagged by automated spam filter")

    lat = float(payload.get("latitude", 37.7749))
    lon = float(payload.get("longitude", -122.4194))
    title = payload.get("title") or description[:40] + "..."
    address = payload.get("address", "San Francisco, CA")
    photo_url = payload.get("photo_url", "")
    audio_url = payload.get("audio_url", "")
    transcript = payload.get("transcript", "")

    # Combine text for NLP analysis
    full_text = f"{description} {transcript}".strip()

    # AI NLP Classification
    nlp_results = classify_text(full_text)
    user_category = payload.get("category")
    final_category = user_category if user_category and user_category != "other" else nlp_results["category"]

    # Credibility Scoring
    credibility = calculate_credibility_score(
        lat=lat,
        lon=lon,
        has_photo=bool(photo_url),
        has_audio=bool(audio_url or transcript),
        text_length=len(full_text),
        reporter_trust_score=50.0
    )

    report_status = "verified" if credibility["is_verified"] else "unverified"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO reports (
            category, title, description, latitude, longitude, address,
            audio_url, transcript, sentiment, urgency, credibility_score,
            status, upvotes, is_simulated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
        """, (
            final_category, title, description, lat, lon, address,
            audio_url, transcript, nlp_results["sentiment"], nlp_results["urgency"],
            credibility["score"], report_status
        ))
        new_report_id = cursor.lastrowid

        # Insert media record if photo provided
        if photo_url:
            cursor.execute("""
            INSERT INTO report_media (report_id, media_type, media_url)
            VALUES (?, 'image', ?)
            """, (new_report_id, photo_url))

        # Also add to incidents if high urgency
        if nlp_results["urgency"] in ("high", "critical"):
            cursor.execute("""
            INSERT INTO incidents (
                incident_type, severity, description, latitude, longitude,
                neighborhood, time_of_day, source, is_simulated
            ) VALUES (?, ?, ?, ?, ?, ?, 'night', 'citizen', 0)
            """, (final_category, nlp_results["urgency"], description, lat, lon, address))

    # Recalculate DBSCAN hotspots
    try:
        dbscan_cluster_incidents()
    except Exception as e:
        print("[ReportsRouter] DBSCAN re-clustering note:", e)

    return {
        "status": "success",
        "report_id": new_report_id,
        "classification": nlp_results,
        "credibility": credibility,
        "verification_status": report_status,
        "message": "Report successfully recorded and mapped live"
    }

@router.post("/{report_id}/vote")
def vote_report(report_id: int, vote_type: str = Body(..., embed=True)):
    """Upvote or corroborate a citizen report, increasing credibility score."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
        rep = cursor.fetchone()
        if not rep:
            raise HTTPException(status_code=404, detail="Report not found")

        current_upvotes = rep["upvotes"] + 1
        new_credibility = min(100.0, rep["credibility_score"] + 4.0)
        new_status = "verified" if new_credibility >= 70.0 else rep["status"]

        cursor.execute("""
        UPDATE reports
        SET upvotes = ?, credibility_score = ?, status = ?
        WHERE id = ?
        """, (current_upvotes, new_credibility, new_status, report_id))

    return {
        "status": "success",
        "report_id": report_id,
        "upvotes": current_upvotes,
        "credibility_score": new_credibility,
        "status_now": new_status
    }
