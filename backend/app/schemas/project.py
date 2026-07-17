from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import List, Optional, Any

class ProjectCreate(BaseModel):
    room_type: str
    style: str
    budget_kes: int
    goals: List[str] = []
    notes: Optional[str] = None

class ProjectOut(BaseModel):
    id: UUID
    room_type: str
    style: str
    budget_kes: int
    goals: List[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class SuggestionOut(BaseModel):
    id: UUID
    project_id: UUID
    room_analysis: Optional[str]
    layout_recs: Any
    furniture_changes: Any
    color_palette: List[str]
    budget_priorities: Any
    overall_vibe: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class AnalyzeRequest(BaseModel):
    project_id: UUID
    room_image_urls: List[str] = []
    reference_image_urls: List[str] = []