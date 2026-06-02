import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

from app.models.base import Base

class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    insight_type = Column(String, nullable=False) # warning, recommendation, suggestion, alert
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, default="LOW") # HIGH, MEDIUM, LOW
    resolved = Column(Boolean, default=False)
    
    generated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="ai_insights")
