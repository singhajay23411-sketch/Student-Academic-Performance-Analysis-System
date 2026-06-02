# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.dashboard import (
    DashboardOverviewSchema,
    GPASchema,
    AttendanceAnalyticsSchema,
    SubjectSummarySchema,
    DashboardInsightSchema
)
from app.analytics.dashboard_analytics import DashboardAnalyticsService

router = APIRouter()

@router.get("/overview", response_model=DashboardOverviewSchema)
def get_overview(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Retrieve top-level academic overview metrics for dashboard summary cards.
    """
    return DashboardAnalyticsService.get_overview(db, current_user.id)

@router.get("/gpa", response_model=GPASchema)
def get_gpa(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Compute academic GPA trends, both overall and split by semester.
    """
    return DashboardAnalyticsService.get_gpa_analytics(db, current_user.id)

@router.get("/attendance", response_model=AttendanceAnalyticsSchema)
def get_attendance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Retrieve comprehensive attendance statistics and subject-level attendance records.
    """
    return DashboardAnalyticsService.get_attendance_analytics(db, current_user.id)

@router.get("/subjects-summary", response_model=SubjectSummarySchema)
def get_subjects_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Calculate macro subject performance stats, highlighting weak vs high-performing areas.
    """
    return DashboardAnalyticsService.get_subjects_summary(db, current_user.id)

@router.get("/insights", response_model=List[DashboardInsightSchema])
def get_insights(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Generate dynamic AI-ready insights, alerts, and suggestions based on current academic trajectory.
    """
    return DashboardAnalyticsService.get_insights(db, current_user.id)
