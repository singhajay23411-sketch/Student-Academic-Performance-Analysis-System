from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.ai import AIInsightSchema, AIRecommendationSchema, AIWarningSchema, AIGenerationResponseSchema
from app.services.ai_service import AIService

router = APIRouter()

@router.post("/generate-insights", response_model=AIGenerationResponseSchema, status_code=status.HTTP_201_CREATED)
def generate_insights(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Triggers the AI engine to evaluate academic data and generate fresh insights.
    """
    return AIService.generate_insights(db, current_user.id)

@router.get("/insights", response_model=List[AIInsightSchema])
def get_insights(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Retrieve all AI-generated insights for the Dashboard.
    """
    return AIService.get_all_insights(db, current_user.id)

@router.get("/recommendations", response_model=List[AIRecommendationSchema])
def get_recommendations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Retrieve only positive or constructive AI recommendations.
    """
    return AIService.get_recommendations(db, current_user.id)

@router.get("/warnings", response_model=List[AIWarningSchema])
def get_warnings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Retrieve only critical AI warnings and alerts.
    """
    return AIService.get_warnings(db, current_user.id)
