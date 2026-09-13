from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import List, Optional, Any

class LandscapeProjectCreate(BaseModel):
    plot_type: str
    style: str
    budget_kes: int
    goals: List[str] = []
    climate_zone: Optional[str] = None
    notes: Optional[str] = None

class LandscapeProjectOut(BaseModel):
    id: UUID
    plot_type: str
    style: str
    budget_kes: int
    goals: List[str]
    climate_zone: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class LandscapeSuggestionOut(BaseModel):
    id: UUID
    project_id: UUID
    plot_analysis: Optional[str]
    zone_plan: Any
    plant_recommendations: Any
    hardscape_suggestions: Any
    budget_priorities: Any
    maintenance_tips: Any
    overall_vision: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True