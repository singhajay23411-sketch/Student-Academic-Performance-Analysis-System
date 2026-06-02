from typing import Optional
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

class RegisterSchema(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class UserResponseSchema(BaseModel):
    id: UUID
    first_name: Optional[str]
    last_name: Optional[str]
    full_name: str
    email: EmailStr
    avatar: Optional[str]
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TokenSchema(BaseModel):
    access_token: str
    token_type: str
    user: UserResponseSchema
