from sqlalchemy import Column, Boolean, DateTime, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

from app.models.base import Base

class UserSettings(Base):
    __tablename__ = "user_settings"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    dark_mode = Column(Boolean, default=False)
    compact_mode = Column(Boolean, default=False)
    notifications_enabled = Column(Boolean, default=True)
    ai_recommendations_enabled = Column(Boolean, default=True)
    reminder_preferences = Column(JSON, nullable=True, default={})
    theme_preference = Column(String, default="light")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="settings")
