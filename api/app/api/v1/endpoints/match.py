from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status

from app.api.v1.deps.auth import get_current_user
from app.db.init_db import get_db
from app.models.user import User
from app.schemas.job import JobMatchOut
from app.services.matching_service import match_jobs
from app.services.resume_service import get_resume_by_id, get_resume_by_user_id

router = APIRouter(prefix="/match", tags=["match"])


@router.post("/{resume_id}", response_model=List[JobMatchOut], status_code=status.HTTP_200_OK)
def match_resume_by_id(
        resume_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    """
    Match a resume to jobs based on cosine similarity of embeddings.
    """
    # Get the resume from the database
    resume = get_resume_by_id(db, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Ensure the resume belongs to the current user
    if resume.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this resume")

    # Get the embedding vector from the resume
    if resume.embedding_vector is None or len(resume.embedding_vector) == 0:
        raise HTTPException(status_code=400, detail="Resume does not have an embedding vector")

    # Match jobs using the embedding vector
    matched_jobs = match_jobs(db, resume)

    return matched_jobs


@router.get("/", response_model=List[JobMatchOut], status_code=status.HTTP_200_OK)
def match_resume(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    """
    Match a resume to jobs based on cosine similarity of embeddings.
    """
    # Get the resume from the database
    resume = get_resume_by_user_id(db, current_user.id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Ensure the resume belongs to the current user
    if resume.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this resume")

    # Get the embedding vector from the resume
    if resume.embedding_vector is None or len(resume.embedding_vector) == 0:
        raise HTTPException(status_code=400, detail="Resume does not have an embedding vector")

    # Match jobs using the embedding vector
    matched_jobs = match_jobs(db, resume)

    return matched_jobs
