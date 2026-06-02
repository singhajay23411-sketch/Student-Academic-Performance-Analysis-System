from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class AIInsightBase(BaseModel):
    insight_type: str
    title: str
    description: str
    priority: str
    resolved: Optional[bool] = False

class AIInsightSchema(AIInsightBase):
    id: UUID
    user_id: UUID
    generated_at: datetime

    class Config:
        from_attributes = True

class AIRecommendationSchema(AIInsightSchema):
    pass

class AIWarningSchema(AIInsightSchema):
    pass

class AIGenerationResponseSchema(BaseModel):
    message: str
    new_insights_count: int
