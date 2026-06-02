from sqlalchemy.orm import Session
from uuid import UUID
from app.models.settings import UserSettings
from app.schemas.settings import ThemePreferenceSchema, UpdatePreferencesSchema, UpdateNotificationsSchema

class SettingsService:
    @staticmethod
    def get_or_create_settings(db: Session, user_id: UUID) -> UserSettings:
        settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
        if not settings:
            settings = UserSettings(user_id=user_id)
            db.add(settings)
            db.commit()
            db.refresh(settings)
        return settings

    @staticmethod
    def update_theme(db: Session, settings: UserSettings, theme_update: ThemePreferenceSchema) -> UserSettings:
        if theme_update.dark_mode is not None:
            settings.dark_mode = theme_update.dark_mode
        if theme_update.compact_mode is not None:
            settings.compact_mode = theme_update.compact_mode
        if theme_update.theme_preference is not None:
            settings.theme_preference = theme_update.theme_preference
        db.commit()
        db.refresh(settings)
        return settings
    
    @staticmethod
    def update_preferences(db: Session, settings: UserSettings, prefs_update: UpdatePreferencesSchema) -> UserSettings:
        if prefs_update.ai_recommendations_enabled is not None:
            settings.ai_recommendations_enabled = prefs_update.ai_recommendations_enabled
        if prefs_update.reminder_preferences is not None:
            settings.reminder_preferences = prefs_update.reminder_preferences
        db.commit()
        db.refresh(settings)
        return settings

    @staticmethod
    def update_notifications(db: Session, settings: UserSettings, notif_update: UpdateNotificationsSchema) -> UserSettings:
        if notif_update.notifications_enabled is not None:
            settings.notifications_enabled = notif_update.notifications_enabled
        db.commit()
        db.refresh(settings)
        return settings
