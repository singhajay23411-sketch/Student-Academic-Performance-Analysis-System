# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from typing import List, Optional

class DashboardOverviewSchema(BaseModel):
    total_subjects: int
    overall_gpa: float
    average_attendance: float
    total_completed_goals: int
    weak_subjects_count: int
    overall_progress_percentage: float

class GPASemesterSchema(BaseModel):
    semester: str
    gpa: float
    credits_earned: int

class GPASchema(BaseModel):
    overall_gpa: float
    total_credits: int
    semester_gpas: List[GPASemesterSchema]

class AttendanceAnalyticsSchema(BaseModel):
    overall_attendance: float
    subjects_below_threshold: int
    attendance_trend: str
    detailed_attendance: List[dict]

class SubjectSummarySchema(BaseModel):
    total_subjects: int
    high_performing_count: int
    weak_count: int
    average_marks_percentage: float

class DashboardInsightSchema(BaseModel):
    insight_type: str
    title: str
    description: str
    severity: str
    related_subject_id: Optional[str] = None
