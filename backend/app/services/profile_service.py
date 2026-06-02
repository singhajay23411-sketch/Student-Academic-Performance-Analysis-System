from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.profile import UpdateProfileSchema

class ProfileService:
    @staticmethod
    def update_profile(db: Session, user: User, updates: UpdateProfileSchema) -> User:
        if updates.first_name is not None:
            user.first_name = updates.first_name
        if updates.last_name is not None:
            user.last_name = updates.last_name
        if updates.full_name is not None:
            user.full_name = updates.full_name
        if updates.bio is not None:
            user.bio = updates.bio
        
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def update_avatar(db: Session, user: User, avatar_url: str) -> User:
        user.avatar = avatar_url
        db.commit()
        db.refresh(user)
        return user
