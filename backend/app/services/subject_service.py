from sqlalchemy.orm import Session
from fastapi import HTTPException
from uuid import UUID

from app.models.subject import Subject
from app.schemas.subject import SubjectCreateSchema, SubjectUpdateSchema

class SubjectService:
    @staticmethod
    def create_subject(db: Session, user_id: UUID, subject_in: SubjectCreateSchema) -> Subject:
        existing = db.query(Subject).filter(
            Subject.user_id == user_id, 
            Subject.subject_code == subject_in.subject_code,
            Subject.semester == subject_in.semester
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Subject with this code already exists for this semester")
            
        subject = Subject(user_id=user_id, **subject_in.model_dump())
        db.add(subject)
        db.commit()
        db.refresh(subject)
        return subject

    @staticmethod
    def get_subjects(db: Session, user_id: UUID):
        return db.query(Subject).filter(Subject.user_id == user_id).all()

    @staticmethod
    def get_subject(db: Session, subject_id: UUID, user_id: UUID) -> Subject:
        subject = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == user_id).first()
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        return subject

    @staticmethod
    def update_subject(db: Session, subject_id: UUID, user_id: UUID, updates: SubjectUpdateSchema) -> Subject:
        subject = SubjectService.get_subject(db, subject_id, user_id)
        
        update_data = updates.model_dump(exclude_unset=True)
        
        if "subject_code" in update_data or "semester" in update_data:
            new_code = update_data.get("subject_code", subject.subject_code)
            new_semester = update_data.get("semester", subject.semester)
            existing = db.query(Subject).filter(
                Subject.user_id == user_id,
                Subject.subject_code == new_code,
                Subject.semester == new_semester,
                Subject.id != subject_id
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="Subject with this code already exists for this semester")

        total = update_data.get("total_marks", subject.total_marks)
        current = update_data.get("current_marks", subject.current_marks)
        if current is not None and total is not None and current > total:
            raise HTTPException(status_code=400, detail="Current marks cannot exceed total marks")

        for field, value in update_data.items():
            setattr(subject, field, value)
            
        db.commit()
        db.refresh(subject)
        return subject

    @staticmethod
    def delete_subject(db: Session, subject_id: UUID, user_id: UUID):
        subject = SubjectService.get_subject(db, subject_id, user_id)
        db.delete(subject)
        db.commit()
