# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class PlannerSessionBase(BaseModel):
    subject_id: Optional[UUID] = None
    session_title: str
    session_description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    priority: Optional[str] = "medium"
    status: Optional[str] = "scheduled"
    completed: Optional[bool] = False

class PlannerSessionCreateSchema(PlannerSessionBase):
    pass

class PlannerSessionUpdateSchema(BaseModel):
    subject_id: Optional[UUID] = None
    session_title: Optional[str] = None
    session_description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    completed: Optional[bool] = None

class PlannerSessionResponseSchema(PlannerSessionBase):
    id: UUID
    user_id: UUID
    duration: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UpcomingExamBase(BaseModel):
    subject_id: UUID
    exam_title: str
    exam_date: datetime
    exam_type: Optional[str] = "midterm"
    reminder_enabled: Optional[bool] = True

class UpcomingExamCreateSchema(UpcomingExamBase):
    pass

class UpcomingExamUpdateSchema(BaseModel):
    subject_id: Optional[UUID] = None
    exam_title: Optional[str] = None
    exam_date: Optional[datetime] = None
    exam_type: Optional[str] = None
    reminder_enabled: Optional[bool] = None

class UpcomingExamResponseSchema(UpcomingExamBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class ProductivityAnalyticsSchema(BaseModel):
    total_study_hours: float
    completed_sessions: int
    total_sessions: int
    completion_rate: float
    focus_consistency: float

class StudyStreakSchema(BaseModel):
    current_streak_days: int
    longest_streak_days: int
    last_studied_date: Optional[datetime]
