from pydantic import BaseModel
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

class ThemePreferenceSchema(BaseModel):
    dark_mode: Optional[bool] = None
    compact_mode: Optional[bool] = None
    theme_preference: Optional[str] = None

class UpdatePreferencesSchema(BaseModel):
    ai_recommendations_enabled: Optional[bool] = None
    reminder_preferences: Optional[Dict[str, Any]] = None

class UpdateNotificationsSchema(BaseModel):
    notifications_enabled: Optional[bool] = None

class SettingsResponseSchema(BaseModel):
    user_id: UUID
    dark_mode: bool
    compact_mode: bool
    notifications_enabled: bool
    ai_recommendations_enabled: bool
    reminder_preferences: Optional[Dict[str, Any]]
    theme_preference: str
    updated_at: datetime

    class Config:
        from_attributes = True
