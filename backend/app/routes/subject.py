# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.database.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.subject import SubjectCreateSchema, SubjectUpdateSchema, SubjectResponseSchema, SubjectListSchema
from app.services.subject_service import SubjectService

router = APIRouter()

@router.post("/", response_model=SubjectResponseSchema, status_code=status.HTTP_201_CREATED)
def create_subject(subject_in: SubjectCreateSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Create a new subject for the authenticated user.
    """
    return SubjectService.create_subject(db, current_user.id, subject_in)

@router.get("/", response_model=SubjectListSchema)
def get_subjects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Retrieve all subjects belonging to the authenticated user.
    """
    items = SubjectService.get_subjects(db, current_user.id)
    return {"items": items, "total": len(items)}

@router.get("/{id}", response_model=SubjectResponseSchema)
def get_subject(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Retrieve a specific subject by ID. Validates ownership.
    """
    return SubjectService.get_subject(db, id, current_user.id)

@router.put("/{id}", response_model=SubjectResponseSchema)
def update_subject(id: UUID, subject_in: SubjectUpdateSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Update a specific subject. Supports partial updates and marks validation.
    """
    return SubjectService.update_subject(db, id, current_user.id, subject_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Delete a specific subject safely.
    """
    SubjectService.delete_subject(db, id, current_user.id)
    return None
