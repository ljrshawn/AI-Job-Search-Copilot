from sqlalchemy.orm import Session
from app.models.job import Job
from app.schemas.job import JobCreate, JobUpdate


def get_job(db: Session, job_id: int) -> Job | None:
    """Get job by ID"""
    return db.query(Job).filter(Job.id == job_id).first()


def get_job_by_origin_id(db: Session, origin_id: int) -> Job | None:
    """Get job by origin_id (SEEK job ID)"""
    return db.query(Job).filter(Job.origin_id == origin_id).first()


def get_jobs(db: Session, skip: int = 0, limit: int = 100) -> list[Job]:
    """Get all jobs with pagination"""
    return db.query(Job).offset(skip).limit(limit).all()


def create_job(db: Session, job: JobCreate) -> Job:
    """Create a new job"""
    db_job = Job(**job.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


def update_job(db: Session, db_job: Job, job_update: JobUpdate) -> Job:
    """Update an existing job"""
    update_data = job_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_job, field, value)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


def delete_job(db: Session, job_id: int) -> bool:
    """Delete a job by ID"""
    db_job = get_job(db, job_id)
    if not db_job:
        return False
    db.delete(db_job)
    db.commit()
    return True


def upsert_job_by_origin_id(db: Session, job: JobCreate) -> Job:
    """Create or update job by origin_id (idempotent)"""
    existing = get_job_by_origin_id(db, job.origin_id)
    if not existing:
        return create_job(db, job)
    # Update existing job, excluding origin_id from updates
    updates = JobUpdate(**job.model_dump(exclude={"origin_id"}))
    return update_job(db, existing, updates)

