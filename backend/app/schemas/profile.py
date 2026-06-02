from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class UpdateProfileSchema(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None

class ProfileAvatarUpdateSchema(BaseModel):
    avatar_url: str

class ProfileResponseSchema(BaseModel):
    id: UUID
    first_name: Optional[str]
    last_name: Optional[str]
    full_name: str
    email: EmailStr
    avatar: Optional[str]
    role: str
    bio: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
