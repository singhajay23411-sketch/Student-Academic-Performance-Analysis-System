from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from fastapi import HTTPException
from uuid import UUID
from datetime import datetime

from app.models.planner import PlannerSession, UpcomingExam
from app.schemas.planner import (
    PlannerSessionCreateSchema, PlannerSessionUpdateSchema,
    UpcomingExamCreateSchema, UpcomingExamUpdateSchema
)

class PlannerService:
    @staticmethod
    def calculate_duration(start: datetime, end: datetime) -> int:
        delta = end - start
        return int(delta.total_seconds() / 60)

    @staticmethod
    def create_session(db: Session, user_id: UUID, session_in: PlannerSessionCreateSchema) -> PlannerSession:
        if session_in.start_time >= session_in.end_time:
            raise HTTPException(status_code=400, detail="End time must be after start time")
        
        duration = PlannerService.calculate_duration(session_in.start_time, session_in.end_time)
        session = PlannerSession(
            user_id=user_id,
            duration=duration,
            **session_in.model_dump()
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def get_sessions(db: Session, user_id: UUID):
        return db.query(PlannerSession).filter(PlannerSession.user_id == user_id).order_by(PlannerSession.start_time).all()

    @staticmethod
    def update_session(db: Session, session_id: UUID, user_id: UUID, updates: PlannerSessionUpdateSchema) -> PlannerSession:
        session = db.query(PlannerSession).filter(PlannerSession.id == session_id, PlannerSession.user_id == user_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
            
        update_data = updates.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(session, field, value)
            
        if "start_time" in update_data or "end_time" in update_data:
            if session.start_time >= session.end_time:
                raise HTTPException(status_code=400, detail="End time must be after start time")
            session.duration = PlannerService.calculate_duration(session.start_time, session.end_time)
            
        if update_data.get("completed") is True:
            session.status = "completed"
            
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def delete_session(db: Session, session_id: UUID, user_id: UUID):
        session = db.query(PlannerSession).filter(PlannerSession.id == session_id, PlannerSession.user_id == user_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        db.delete(session)
        db.commit()

    @staticmethod
    def create_exam(db: Session, user_id: UUID, exam_in: UpcomingExamCreateSchema) -> UpcomingExam:
        exam = UpcomingExam(user_id=user_id, **exam_in.model_dump())
        db.add(exam)
        db.commit()
        db.refresh(exam)
        return exam

    @staticmethod
    def get_exams(db: Session, user_id: UUID):
        return db.query(UpcomingExam).filter(UpcomingExam.user_id == user_id).order_by(UpcomingExam.exam_date).all()

    @staticmethod
    def update_exam(db: Session, exam_id: UUID, user_id: UUID, updates: UpcomingExamUpdateSchema) -> UpcomingExam:
        exam = db.query(UpcomingExam).filter(UpcomingExam.id == exam_id, UpcomingExam.user_id == user_id).first()
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        
        for field, value in updates.model_dump(exclude_unset=True).items():
            setattr(exam, field, value)
            
        db.commit()
        db.refresh(exam)
        return exam

    @staticmethod
    def delete_exam(db: Session, exam_id: UUID, user_id: UUID):
        exam = db.query(UpcomingExam).filter(UpcomingExam.id == exam_id, UpcomingExam.user_id == user_id).first()
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")
        db.delete(exam)
        db.commit()

class ProductivityService:
    @staticmethod
    def get_analytics(db: Session, user_id: UUID):
        sessions = db.query(PlannerSession).filter(PlannerSession.user_id == user_id).all()
        total_sessions = len(sessions)
        completed_sessions = [s for s in sessions if s.completed or s.status == "completed"]
        
        total_duration_minutes = sum(s.duration for s in completed_sessions)
        total_study_hours = round(total_duration_minutes / 60.0, 2)
        
        completion_rate = (len(completed_sessions) / total_sessions * 100) if total_sessions > 0 else 0.0
        focus_consistency = min(completion_rate, 100.0) 
        
        return {
            "total_study_hours": total_study_hours,
            "completed_sessions": len(completed_sessions),
            "total_sessions": total_sessions,
            "completion_rate": round(completion_rate, 1),
            "focus_consistency": round(focus_consistency, 1)
        }

    @staticmethod
    def get_streaks(db: Session, user_id: UUID):
        sessions = db.query(PlannerSession).filter(
            PlannerSession.user_id == user_id, 
            PlannerSession.completed == True
        ).order_by(PlannerSession.end_time.desc()).all()
        
        if not sessions:
            return {"current_streak_days": 0, "longest_streak_days": 0, "last_studied_date": None}
            
        last_date = sessions[0].end_time
        return {
            "current_streak_days": 1,
            "longest_streak_days": 1,
            "last_studied_date": last_date
        }
