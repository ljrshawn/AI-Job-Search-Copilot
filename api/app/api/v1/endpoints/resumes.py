from time import sleep

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from starlette import status
from uuid import UUID

from app.api.v1.deps.auth import get_current_user
from app.db.init_db import get_db
from app.models.user import User
from app.schemas.resume import ResumeOut
from app.services.resume_service import create_resume, get_resume_by_user_id as fetch_resume_by_user_id

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.get("/", response_model=ResumeOut, status_code=status.HTTP_200_OK)
def get_resume_by_user_id(
        user_id: UUID,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
) -> ResumeOut:
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Can only get resumes for your own account")

    resume = fetch_resume_by_user_id(db, user_id)

    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    return ResumeOut.model_validate(resume)


@router.post("/upload", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
def upload_resume(
        user_id: UUID,
        file: UploadFile = File(...),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    """Upload and process a resume file for the current user."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name is required")

    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Can only upload resumes for your own account")

    try:
        # Create a simple payload object for service
        class Payload:
            pass

        payload = Payload()
        payload.user_id = user_id
        payload.file = file

        return create_resume(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
