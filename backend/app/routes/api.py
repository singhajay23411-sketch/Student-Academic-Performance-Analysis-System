# pyrefly: ignore [missing-import]
from fastapi import APIRouter
from app.routes import auth, profile, settings, subject, dashboard, planner, ai

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(subject.router, prefix="/subjects", tags=["subjects"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(planner.router, prefix="/planner", tags=["planner"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
# Other routers will be added here
