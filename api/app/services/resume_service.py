from sqlalchemy import select, UUID
from sqlalchemy.orm import Session

from app.models.resume import Resume
from app.schemas.resume import ResumeOut
from app.utils.process_resume import process_resume


def create_resume(db, payload) -> ResumeOut:
    processed_resume = process_resume(payload.file.file, payload.file.filename)

    resume = Resume(
        user_id=payload.user_id,
        file_name=processed_resume["file_name"],
        raw_text=processed_resume["raw_text"],
        structured_data=processed_resume["structured_data"],
        embedding_vector=processed_resume.get("embedding_vector"),
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return ResumeOut.model_validate(resume)


def get_resume_by_id(db: Session, resume_id: int) -> Resume | None:
    return db.execute(select(Resume).where(Resume.id == resume_id)).scalar_one_or_none()


def get_resume_by_user_id(db: Session, user_id: UUID) -> Resume | None:
    stmt = (
        select(Resume)
        .where(Resume.user_id == user_id, Resume.activated.is_(True))
        .order_by(Resume.created_at.desc())
        .limit(1)
    )
    return db.execute(stmt).scalars().first()
