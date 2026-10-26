"""
City Assistant API Router.
"""

from typing import Dict, Any
from fastapi import APIRouter, Body
from app.services.assistant_service import answer_city_query

router = APIRouter(prefix="/api/assistant", tags=["Conversational Assistant"])

@router.post("/chat")
def chat_with_city_companion(payload: Dict[str, Any] = Body(...)):
    """
    Fact-grounded conversational assistant endpoint.
    Answers strictly from verified scored data and returns place citations.
    """
    prompt = payload.get("prompt", "").strip()
    if not prompt:
        return {"status": "error", "message": "Prompt cannot be empty"}

    user_lat = float(payload.get("user_lat", 37.7749))
    user_lon = float(payload.get("user_lon", -122.4194))

    result = answer_city_query(prompt, user_lat=user_lat, user_lon=user_lon)
    return {"status": "success", "response": result}
