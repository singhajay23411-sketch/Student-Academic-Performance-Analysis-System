from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.profile import ProfileResponseSchema, UpdateProfileSchema, ProfileAvatarUpdateSchema
from app.services.profile_service import ProfileService

router = APIRouter()

@router.get("/me", response_model=ProfileResponseSchema)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Get the profile of the current authenticated user.
    """
    return current_user

@router.put("/update", response_model=ProfileResponseSchema)
def update_my_profile(profile_data: UpdateProfileSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Update the profile information of the current authenticated user.
    """
    return ProfileService.update_profile(db, current_user, profile_data)

@router.put("/avatar", response_model=ProfileResponseSchema)
def update_my_avatar(avatar_data: ProfileAvatarUpdateSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Update the avatar of the current authenticated user.
    """
    return ProfileService.update_avatar(db, current_user, avatar_data.avatar_url)
