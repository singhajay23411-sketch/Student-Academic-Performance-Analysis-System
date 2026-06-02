import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

from app.models.base import Base

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    subject_name = Column(String, nullable=False)
    subject_code = Column(String, nullable=False)
    credits = Column(Integer, nullable=False)
    attendance_percentage = Column(Float, nullable=True)
    current_marks = Column(Float, nullable=True)
    total_marks = Column(Float, nullable=True)
    grade = Column(String, nullable=True)
    semester = Column(String, nullable=True)
    status = Column(String, default="active") # active, completed, etc.
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="subjects")
