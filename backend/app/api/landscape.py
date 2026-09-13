from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.landscape import LandscapeProject, LandscapeImage, LandscapeSuggestion
from app.schemas.landscape import LandscapeProjectCreate, LandscapeProjectOut, LandscapeSuggestionOut
from app.services.landscape_ai_service import analyze_landscape
from typing import List
from uuid import UUID
import os, uuid, shutil

router = APIRouter(prefix="/landscape", tags=["landscape"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/projects", response_model=LandscapeProjectOut)
def create_landscape_project(
    data: LandscapeProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = LandscapeProject(
        user_id=current_user.id,
        plot_type=data.plot_type,
        style=data.style,
        budget_kes=data.budget_kes,
        goals=data.goals,
        climate_zone=data.climate_zone,
        notes=data.notes
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/projects", response_model=List[LandscapeProjectOut])
def get_landscape_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(LandscapeProject).filter(
        LandscapeProject.user_id == current_user.id
    ).order_by(LandscapeProject.created_at.desc()).all()


@router.get("/projects/{project_id}", response_model=LandscapeProjectOut)
def get_landscape_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(LandscapeProject).filter(
        LandscapeProject.id == project_id,
        LandscapeProject.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/projects/{project_id}")
def delete_landscape_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(LandscapeProject).filter(
        LandscapeProject.id == project_id,
        LandscapeProject.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}


@router.post("/upload/{project_id}")
async def upload_landscape_images(
    project_id: UUID,
    image_type: str = "plot",
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(LandscapeProject).filter(
        LandscapeProject.id == project_id,
        LandscapeProject.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    uploaded_urls = []
    for file in files:
        ext = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        url = f"/uploads/{filename}"
        image = LandscapeImage(
            project_id=project_id,
            image_url=url,
            image_type=image_type
        )
        db.add(image)
        uploaded_urls.append(url)

    db.commit()
    return {"uploaded": uploaded_urls}


@router.post("/analyze/{project_id}", response_model=LandscapeSuggestionOut)
async def analyze_landscape_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(LandscapeProject).filter(
        LandscapeProject.id == project_id,
        LandscapeProject.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    images = db.query(LandscapeImage).filter(
        LandscapeImage.project_id == project_id
    ).all()
    plot_images = [img.image_url for img in images if img.image_type == "plot"]
    ref_images = [img.image_url for img in images if img.image_type == "reference"]

    result = await analyze_landscape(project, plot_images, ref_images)

    existing = db.query(LandscapeSuggestion).filter(
        LandscapeSuggestion.project_id == project_id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()

    suggestion = LandscapeSuggestion(
        project_id=project_id,
        plot_analysis=result.get("plot_analysis"),
        zone_plan=result.get("zone_plan", []),
        plant_recommendations=result.get("plant_recommendations", []),
        hardscape_suggestions=result.get("hardscape_suggestions", []),
        budget_priorities=result.get("budget_priorities", []),
        maintenance_tips=result.get("maintenance_tips", []),
        overall_vision=result.get("overall_vision")
    )
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)
    return suggestion


@router.get("/projects/{project_id}/suggestion", response_model=LandscapeSuggestionOut)
def get_landscape_suggestion(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    suggestion = db.query(LandscapeSuggestion).join(LandscapeProject).filter(
        LandscapeSuggestion.project_id == project_id,
        LandscapeProject.user_id == current_user.id
    ).first()
    if not suggestion:
        raise HTTPException(status_code=404, detail="No suggestion found")
    return suggestion