import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

from app.models.base import Base

class PlannerSession(Base):
    __tablename__ = "planner_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    
    session_title = Column(String, nullable=False)
    session_description = Column(Text, nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    duration = Column(Integer, nullable=False) # stored in minutes
    priority = Column(String, default="medium") # high, medium, low
    status = Column(String, default="scheduled") # scheduled, in-progress, completed, missed
    completed = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="planner_sessions")
    subject = relationship("Subject", backref="planner_sessions")

class UpcomingExam(Base):
    __tablename__ = "upcoming_exams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    
    exam_title = Column(String, nullable=False)
    exam_date = Column(DateTime, nullable=False)
    exam_type = Column(String, default="midterm") # quiz, midterm, final, assignment
    reminder_enabled = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="upcoming_exams")
    subject = relationship("Subject", backref="upcoming_exams")
