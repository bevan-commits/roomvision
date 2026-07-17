from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.project import Project, RoomImage, Suggestion
from app.schemas.project import SuggestionOut
from app.services.ai_service import analyze_room
from uuid import UUID

router = APIRouter(prefix="/analyze", tags=["analyze"])

@router.post("/{project_id}", response_model=SuggestionOut)
async def analyze_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    images = db.query(RoomImage).filter(RoomImage.project_id == project_id).all()
    room_images = [img.image_url for img in images if img.image_type == "room"]
    ref_images = [img.image_url for img in images if img.image_type == "reference"]

    result = await analyze_room(project, room_images, ref_images)

    existing = db.query(Suggestion).filter(Suggestion.project_id == project_id).first()
    if existing:
        db.delete(existing)
        db.commit()

    suggestion = Suggestion(
        project_id=project_id,
        room_analysis=result.get("room_analysis"),
        layout_recs=result.get("layout_recommendations", []),
        furniture_changes=result.get("furniture_changes", []),
        color_palette=result.get("color_palette", []),
        budget_priorities=result.get("budget_priorities", []),
        overall_vibe=result.get("overall_vibe")
    )
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)
    return suggestion