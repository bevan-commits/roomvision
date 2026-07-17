from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.project import RoomImage, Project
from dotenv import load_dotenv
import os, uuid, shutil
from uuid import UUID as PUUID

load_dotenv()

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/{project_id}")
async def upload_images(
    project_id: PUUID,
    image_type: str = "room",
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
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
        image = RoomImage(
            project_id=project_id,
            image_url=url,
            image_type=image_type
        )
        db.add(image)
        uploaded_urls.append(url)

    db.commit()
    return {"uploaded": uploaded_urls}