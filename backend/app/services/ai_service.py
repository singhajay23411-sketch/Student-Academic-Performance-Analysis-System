from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from app.models.ai import AIInsight
from app.models.subject import Subject
from app.models.planner import PlannerSession
from app.ai_engine.rules import RuleBasedEngine

class AIService:
    @staticmethod
    def generate_insights(db: Session, user_id: UUID):
        subjects = db.query(Subject).filter(Subject.user_id == user_id).all()
        sessions = db.query(PlannerSession).filter(PlannerSession.user_id == user_id).all()
        
        # Execute the AI Engine rules against the live database state
        new_insights_data = RuleBasedEngine.run_all_rules(subjects, sessions)
        
        # Wipe old unresolved insights to prevent Dashboard clutter and ensure 
        # the user only sees data relevant to their *current* academic state.
        db.query(AIInsight).filter(AIInsight.user_id == user_id, AIInsight.resolved == False).delete()
        
        count = 0
        for data in new_insights_data:
            insight = AIInsight(
                user_id=user_id,
                insight_type=data["insight_type"],
                title=data["title"],
                description=data["description"],
                priority=data["priority"]
            )
            db.add(insight)
            count += 1
            
        db.commit()
        return {"message": "AI insights generated successfully.", "new_insights_count": count}

    @staticmethod
    def get_all_insights(db: Session, user_id: UUID):
        return db.query(AIInsight).filter(AIInsight.user_id == user_id).order_by(AIInsight.generated_at.desc()).all()

    @staticmethod
    def get_recommendations(db: Session, user_id: UUID):
        return db.query(AIInsight).filter(
            AIInsight.user_id == user_id, 
            AIInsight.insight_type.in_(["recommendation", "suggestion"])
        ).order_by(AIInsight.generated_at.desc()).all()

    @staticmethod
    def get_warnings(db: Session, user_id: UUID):
        return db.query(AIInsight).filter(
            AIInsight.user_id == user_id, 
            AIInsight.insight_type.in_(["warning", "alert"])
        ).order_by(AIInsight.generated_at.desc()).all()
