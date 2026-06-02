from pydantic import BaseModel, Field, model_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class SubjectBase(BaseModel):
    subject_name: str = Field(..., min_length=1)
    subject_code: str = Field(..., min_length=1)
    credits: int = Field(..., ge=1, le=10)
    semester: Optional[str] = None
    status: Optional[str] = "active"

class SubjectCreateSchema(SubjectBase):
    attendance_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    current_marks: Optional[float] = Field(None, ge=0.0)
    total_marks: Optional[float] = Field(None, ge=0.0)
    grade: Optional[str] = None

    @model_validator(mode="after")
    def check_marks(self):
        if self.current_marks is not None and self.total_marks is not None:
            if self.current_marks > self.total_marks:
                raise ValueError("Current marks cannot exceed total marks")
        return self

class SubjectUpdateSchema(BaseModel):
    subject_name: Optional[str] = Field(None, min_length=1)
    subject_code: Optional[str] = Field(None, min_length=1)
    credits: Optional[int] = Field(None, ge=1, le=10)
    semester: Optional[str] = None
    status: Optional[str] = None
    attendance_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    current_marks: Optional[float] = Field(None, ge=0.0)
    total_marks: Optional[float] = Field(None, ge=0.0)
    grade: Optional[str] = None

class SubjectResponseSchema(SubjectBase):
    id: UUID
    user_id: UUID
    attendance_percentage: Optional[float]
    current_marks: Optional[float]
    total_marks: Optional[float]
    grade: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SubjectListSchema(BaseModel):
    items: List[SubjectResponseSchema]
    total: int
