# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.deps import get_db, get_current_user
from app.schemas.user import RegisterSchema, LoginSchema, TokenSchema, UserResponseSchema
from app.services.auth_service import AuthService
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=TokenSchema, status_code=status.HTTP_201_CREATED)
def register(user_in: RegisterSchema, db: Session = Depends(get_db)):
    """
    Register a new user, generating a JWT token and returning an authenticated session.
    """
    user = AuthService.register_user(db, user_in)
    access_token = AuthService.create_token_for_user(user)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=TokenSchema)
def login(login_data: LoginSchema, db: Session = Depends(get_db)):
    """
    Login user using email and password, returning JWT token and authenticated user session.
    """
    user = AuthService.authenticate_user(db, login_data)
    access_token = AuthService.create_token_for_user(user)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponseSchema)
def read_current_user(current_user: User = Depends(get_current_user)):
    """
    Return the authenticated user profile for frontend sync and navbar rendering.
    """
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """
    Logout route. Frontend is responsible for deleting the JWT token from localStorage.
    """
    return {"message": "Successfully logged out"}
