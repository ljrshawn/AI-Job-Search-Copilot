from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.init_db import get_db
from app.schemas.job import JobCreate, JobOut
from app.services.job_service import (
    get_job,
    get_jobs,
    create_job,
    delete_job
)

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/", response_model=list[JobOut])
def list_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all jobs with pagination"""
    jobs = get_jobs(db, skip=skip, limit=limit)
    return jobs


@router.get("/{job_id}", response_model=JobOut)
def get_job_endpoint(job_id: int, db: Session = Depends(get_db)):
    """Get a specific job by ID"""
    job = get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/", response_model=JobOut, status_code=201)
def create_job_endpoint(job: JobCreate, db: Session = Depends(get_db)):
    """Create a new job (admin only)"""
    return create_job(db, job)


@router.delete("/{job_id}", status_code=204)
def delete_job_endpoint(job_id: int, db: Session = Depends(get_db)):
    """Delete a job by ID (admin only)"""
    if not delete_job(db, job_id):
        raise HTTPException(status_code=404, detail="Job not found")

