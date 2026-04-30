from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api.v1.deps.auth import get_current_user
from app.db.init_db import get_db
from app.models.user import User
from app.schemas.job import JobCreate, JobOut
from app.services.job_service import (
    get_job,
    get_jobs,
    create_job,
    delete_job
)
# Import at function call time to avoid circular imports at startup

class SeekSearchRequest(BaseModel):
    keywords: str
    where: str


class SeekSearchResponse(BaseModel):
    saved_count: int
    message: str


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


@router.post("/search/seek", response_model=SeekSearchResponse, status_code=200)
def search_and_save_seek_jobs(
    request: SeekSearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search for jobs on SEEK and save them to the database.
    Requires authentication. Admin-only recommended.
    """
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))
    from search_job.search_seek_job import SeekPayload, save_seek_jobs_to_db as fetch_and_save

    try:
        payload = SeekPayload(keywords=request.keywords, where=request.where)
        saved_count = fetch_and_save(payload)
        return SeekSearchResponse(
            saved_count=saved_count,
            message=f"Successfully saved {saved_count} new jobs from SEEK"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error searching SEEK jobs: {str(e)}"
        )


