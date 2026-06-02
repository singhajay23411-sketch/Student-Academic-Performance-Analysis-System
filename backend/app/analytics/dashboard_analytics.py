from sqlalchemy.orm import Session
from uuid import UUID
from collections import defaultdict

from app.models.subject import Subject
from app.utils.gpa_calculator import calculate_weighted_gpa

class DashboardAnalyticsService:
    @staticmethod
    def _get_weak_subjects(subjects):
        weak = []
        for sub in subjects:
            is_weak = False
            if sub.attendance_percentage is not None and sub.attendance_percentage < 75.0:
                is_weak = True
            if sub.current_marks is not None and sub.total_marks and sub.total_marks > 0:
                if (sub.current_marks / sub.total_marks) * 100 < 40.0:
                    is_weak = True
            if is_weak:
                weak.append(sub)
        return weak

    @staticmethod
    def get_overview(db: Session, user_id: UUID):
        subjects = db.query(Subject).filter(Subject.user_id == user_id).all()
        total_subjects = len(subjects)
        overall_gpa, _ = calculate_weighted_gpa(subjects)
        
        total_attendance = 0
        valid_attendance_subjects = 0
        
        for sub in subjects:
            if sub.attendance_percentage is not None:
                total_attendance += sub.attendance_percentage
                valid_attendance_subjects += 1
                
        avg_attendance = (total_attendance / valid_attendance_subjects) if valid_attendance_subjects > 0 else 0.0
        weak_subjects = DashboardAnalyticsService._get_weak_subjects(subjects)
        
        # Default placeholder for future planner integration
        total_completed_goals = 0 
        
        return {
            "total_subjects": total_subjects,
            "overall_gpa": overall_gpa,
            "average_attendance": round(avg_attendance, 2),
            "total_completed_goals": total_completed_goals,
            "weak_subjects_count": len(weak_subjects),
            "overall_progress_percentage": min(avg_attendance, 100.0)
        }

    @staticmethod
    def get_gpa_analytics(db: Session, user_id: UUID):
        subjects = db.query(Subject).filter(Subject.user_id == user_id).all()
        overall_gpa, total_credits = calculate_weighted_gpa(subjects)
        
        semesters = defaultdict(list)
        for sub in subjects:
            sem = sub.semester or "Unassigned"
            semesters[sem].append(sub)
            
        semester_gpas = []
        for sem, subs in semesters.items():
            sem_gpa, sem_credits = calculate_weighted_gpa(subs)
            semester_gpas.append({
                "semester": sem,
                "gpa": sem_gpa,
                "credits_earned": sem_credits
            })
            
        return {
            "overall_gpa": overall_gpa,
            "total_credits": total_credits,
            "semester_gpas": semester_gpas
        }

    @staticmethod
    def get_attendance_analytics(db: Session, user_id: UUID):
        subjects = db.query(Subject).filter(Subject.user_id == user_id).all()
        total_attendance = 0
        valid = 0
        below_threshold = 0
        detailed = []
        
        for sub in subjects:
            if sub.attendance_percentage is not None:
                total_attendance += sub.attendance_percentage
                valid += 1
                if sub.attendance_percentage < 75.0:
                    below_threshold += 1
                detailed.append({
                    "subject_name": sub.subject_name,
                    "attendance": sub.attendance_percentage
                })
                
        avg = (total_attendance / valid) if valid > 0 else 0.0
        
        return {
            "overall_attendance": round(avg, 2),
            "subjects_below_threshold": below_threshold,
            "attendance_trend": "stable",
            "detailed_attendance": detailed
        }

    @staticmethod
    def get_subjects_summary(db: Session, user_id: UUID):
        subjects = db.query(Subject).filter(Subject.user_id == user_id).all()
        weak = len(DashboardAnalyticsService._get_weak_subjects(subjects))
        
        high_performing = 0
        total_perc = 0.0
        valid_marks = 0
        
        for sub in subjects:
            if sub.current_marks is not None and sub.total_marks and sub.total_marks > 0:
                perc = (sub.current_marks / sub.total_marks) * 100
                total_perc += perc
                valid_marks += 1
                if perc >= 80.0:
                    high_performing += 1
                    
        avg_marks = (total_perc / valid_marks) if valid_marks > 0 else 0.0
        
        return {
            "total_subjects": len(subjects),
            "high_performing_count": high_performing,
            "weak_count": weak,
            "average_marks_percentage": round(avg_marks, 2)
        }

    @staticmethod
    def get_insights(db: Session, user_id: UUID):
        subjects = db.query(Subject).filter(Subject.user_id == user_id).all()
        insights = []
        
        for sub in subjects:
            if sub.attendance_percentage is not None and sub.attendance_percentage < 75.0:
                insights.append({
                    "insight_type": "alert",
                    "title": "Low Attendance Warning",
                    "description": f"Your attendance in {sub.subject_name} is {sub.attendance_percentage}%, dropping below the safe 75% threshold.",
                    "severity": "high",
                    "related_subject_id": str(sub.id)
                })
            
            if sub.current_marks is not None and sub.total_marks and sub.total_marks > 0:
                perc = (sub.current_marks / sub.total_marks) * 100
                if perc < 40.0:
                    insights.append({
                        "insight_type": "warning",
                        "title": "Performance Alert",
                        "description": f"You are currently scoring {round(perc, 1)}% in {sub.subject_name}. Focus required to improve standing.",
                        "severity": "high",
                        "related_subject_id": str(sub.id)
                    })
                elif perc >= 90.0:
                    insights.append({
                        "insight_type": "success",
                        "title": "Excellent Performance",
                        "description": f"Outstanding! You are maintaining a strong {round(perc, 1)}% in {sub.subject_name}.",
                        "severity": "low",
                        "related_subject_id": str(sub.id)
                    })
                    
        if not insights:
            insights.append({
                "insight_type": "suggestion",
                "title": "Stable Progress",
                "description": "Your academic data is currently stable. Maintain your current study habits.",
                "severity": "low",
                "related_subject_id": None
            })
            
        return insights
