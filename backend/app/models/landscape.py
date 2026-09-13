from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import uuid

class LandscapeProject(Base):
    __tablename__ = "landscape_projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    plot_type = Column(String, nullable=False)
    style = Column(String, nullable=False)
    budget_kes = Column(Integer, nullable=False)
    goals = Column(ARRAY(Text), default=[])
    climate_zone = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="landscape_projects")
    images = relationship("LandscapeImage", backref="project", cascade="all, delete")
    suggestions = relationship("LandscapeSuggestion", backref="project", cascade="all, delete")


class LandscapeImage(Base):
    __tablename__ = "landscape_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("landscape_projects.id"), nullable=False)
    image_url = Column(String, nullable=False)
    image_type = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class LandscapeSuggestion(Base):
    __tablename__ = "landscape_suggestions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("landscape_projects.id"), nullable=False)
    plot_analysis = Column(Text, nullable=True)
    zone_plan = Column(JSONB, default=[])
    plant_recommendations = Column(JSONB, default=[])
    hardscape_suggestions = Column(JSONB, default=[])
    budget_priorities = Column(JSONB, default=[])
    maintenance_tips = Column(JSONB, default=[])
    overall_vision = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)