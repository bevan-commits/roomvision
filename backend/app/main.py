from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.api import auth, projects, analyze, upload
from app.api import landscape
from app.models import user, project
from app.models import landscape as landscape_model
import os

Base.metadata.create_all(bind=engine)

os.makedirs("./uploads", exist_ok=True)

app = FastAPI(
    title="RoomVision API",
    description="AI-powered interior design and landscape assistant",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="./uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(analyze.router)
app.include_router(upload.router)
app.include_router(landscape.router)

@app.get("/")
def root():
    return {"message": "RoomVision API is running"}