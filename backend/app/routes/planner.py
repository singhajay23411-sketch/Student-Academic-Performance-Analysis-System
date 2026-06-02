from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.planner import (
    PlannerSessionCreateSchema, PlannerSessionUpdateSchema, PlannerSessionResponseSchema,
    UpcomingExamCreateSchema, UpcomingExamUpdateSchema, UpcomingExamResponseSchema,
    ProductivityAnalyticsSchema, StudyStreakSchema
)
from app.services.planner_service import PlannerService, ProductivityService

router = APIRouter()

# --- Sessions ---
@router.post("/session", response_model=PlannerSessionResponseSchema, status_code=status.HTTP_201_CREATED)
def create_session(session_in: PlannerSessionCreateSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new study focus session."""
    return PlannerService.create_session(db, current_user.id, session_in)

@router.get("/sessions", response_model=List[PlannerSessionResponseSchema])
def get_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve all study sessions for the planner timeline."""
    return PlannerService.get_sessions(db, current_user.id)

@router.put("/session/{id}", response_model=PlannerSessionResponseSchema)
def update_session(id: UUID, session_in: PlannerSessionUpdateSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update a specific study session."""
    return PlannerService.update_session(db, id, current_user.id, session_in)

@router.delete("/session/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a specific study session."""
    PlannerService.delete_session(db, id, current_user.id)
    return None

# --- Exams ---
@router.post("/exams", response_model=UpcomingExamResponseSchema, status_code=status.HTTP_201_CREATED)
def create_exam(exam_in: UpcomingExamCreateSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Add a new upcoming exam."""
    return PlannerService.create_exam(db, current_user.id, exam_in)

@router.get("/exams", response_model=List[UpcomingExamResponseSchema])
def get_exams(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve all upcoming exams."""
    return PlannerService.get_exams(db, current_user.id)

@router.put("/exams/{id}", response_model=UpcomingExamResponseSchema)
def update_exam(id: UUID, exam_in: UpcomingExamUpdateSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update exam details."""
    return PlannerService.update_exam(db, id, current_user.id, exam_in)

@router.delete("/exams/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exam(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete an exam."""
    PlannerService.delete_exam(db, id, current_user.id)
    return None

# --- Analytics & Productivity ---
@router.get("/productivity", response_model=ProductivityAnalyticsSchema)
def get_productivity(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get productivity analytics based on planner completion data."""
    return ProductivityService.get_analytics(db, current_user.id)

@router.get("/streaks", response_model=StudyStreakSchema)
def get_streaks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get study streak data."""
    return ProductivityService.get_streaks(db, current_user.id)
