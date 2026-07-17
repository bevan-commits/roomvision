from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import uuid

class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    room_type = Column(String, nullable=False)
    style = Column(String, nullable=False)
    budget_kes = Column(Integer, nullable=False)
    goals = Column(ARRAY(Text), default=[])
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="projects")
    images = relationship("RoomImage", backref="project", cascade="all, delete")
    suggestions = relationship("Suggestion", backref="project", cascade="all, delete")


class RoomImage(Base):
    __tablename__ = "room_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    image_url = Column(String, nullable=False)
    image_type = Column(String, nullable=False)  # "room" or "reference"
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class Suggestion(Base):
    __tablename__ = "suggestions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    room_analysis = Column(Text, nullable=True)
    layout_recs = Column(JSONB, default=[])
    furniture_changes = Column(JSONB, default=[])
    color_palette = Column(ARRAY(Text), default=[])
    budget_priorities = Column(JSONB, default=[])
    overall_vibe = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)