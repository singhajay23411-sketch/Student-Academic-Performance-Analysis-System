from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from fastapi import HTTPException
from datetime import timedelta

from app.models.user import User
from app.schemas.user import RegisterSchema, LoginSchema
from app.auth.security import get_password_hash, verify_password
from app.auth.jwt import create_access_token
from app.config.settings import settings

class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: RegisterSchema) -> User:
        user = db.query(User).filter(User.email == user_in.email).first()
        if user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        name_parts = user_in.full_name.strip().split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        new_user = User(
            full_name=user_in.full_name,
            first_name=first_name,
            last_name=last_name,
            email=user_in.email,
            password_hash=get_password_hash(user_in.password),
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def authenticate_user(db: Session, login_data: LoginSchema) -> User:
        user = db.query(User).filter(User.email == login_data.email).first()
        if not user or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
        return user

    @staticmethod
    def create_token_for_user(user: User) -> str:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            subject=str(user.id), expires_delta=access_token_expires
        )
        return access_token
