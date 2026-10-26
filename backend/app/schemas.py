"""
Pydantic Schemas for API request and response data validation.
"""

from typing import List, Optional, Dict, Any

# Simple dict-based serialization fallback if pydantic is not installed in runtime,
# but structured classes when pydantic is available.
try:
    from pydantic import BaseModel, Field

    class CategorySchema(BaseModel):
        id: int
        name: str
        slug: str
        icon: str
        color: str

    class PlaceSummarySchema(BaseModel):
        id: int
        osm_id: Optional[int]
        name: str
        category_slug: str
        latitude: float
        longitude: float
        address: Optional[str]
        neighborhood: Optional[str]
        price_level: int
        rating: float
        safety_score: float
        cleanliness_score: float
        affordability_score: float
        accessibility_score: float
        composite_score: float
        wheelchair_accessible: bool
        photo_url: Optional[str]
        is_simulated: bool

    class PlaceDetailSchema(PlaceSummarySchema):
        opening_hours: Optional[str]
        website: Optional[str]
        phone: Optional[str]
        description: Optional[str]
        history_notes: Optional[str]
        heritage_info: Optional[Dict[str, Any]]
        recent_reports: Optional[List[Dict[str, Any]]]

    class AreaScoreSchema(BaseModel):
        id: int
        neighborhood_name: str
        safety_score: float
        cleanliness_score: float
        affordability_score: float
        rating_score: float
        accessibility_score: float
        composite_score: float
        incident_density: float

    class IncidentLayerSchema(BaseModel):
        id: int
        incident_type: str
        severity: str
        description: str
        latitude: float
        longitude: float
        neighborhood: Optional[str]
        time_of_day: str
        is_simulated: bool

    class HotspotLayerSchema(BaseModel):
        id: int
        cluster_id: int
        center_latitude: float
        center_longitude: float
        radius_meters: float
        incident_count: int
        risk_level: str
        primary_category: Optional[str]
        time_sensitivity: str

    class ReportLayerSchema(BaseModel):
        id: int
        category: str
        title: Optional[str]
        description: str
        latitude: float
        longitude: float
        status: str
        sentiment: str
        urgency: str
        credibility_score: float
        upvotes: int
        is_simulated: bool

except ImportError:
    # Fallback dummy class if pydantic is absent
    class BaseModel:
        pass
