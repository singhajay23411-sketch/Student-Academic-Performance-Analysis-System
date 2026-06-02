from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.settings import SettingsResponseSchema, ThemePreferenceSchema, UpdatePreferencesSchema, UpdateNotificationsSchema
from app.services.settings_service import SettingsService

router = APIRouter()

@router.get("/", response_model=SettingsResponseSchema)
def get_my_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Get the settings of the current authenticated user.
    """
    return SettingsService.get_or_create_settings(db, current_user.id)

@router.put("/theme", response_model=SettingsResponseSchema)
def update_my_theme(theme_data: ThemePreferenceSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Update the theme preferences (dark mode, compact mode) for the current user.
    """
    settings = SettingsService.get_or_create_settings(db, current_user.id)
    return SettingsService.update_theme(db, settings, theme_data)

@router.put("/preferences", response_model=SettingsResponseSchema)
def update_my_preferences(prefs_data: UpdatePreferencesSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Update AI and reminder preferences for the current user.
    """
    settings = SettingsService.get_or_create_settings(db, current_user.id)
    return SettingsService.update_preferences(db, settings, prefs_data)

@router.put("/notifications", response_model=SettingsResponseSchema)
def update_my_notifications(notif_data: UpdateNotificationsSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Update notification settings for the current user.
    """
    settings = SettingsService.get_or_create_settings(db, current_user.id)
    return SettingsService.update_notifications(db, settings, notif_data)
