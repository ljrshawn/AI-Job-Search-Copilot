from fastapi import APIRouter, Depends, HTTPException, UploadFile
from starlette import status

from app.api.v1.deps.auth import get_current_user
from app.models.user import User
from app.services.resume_service import process_resume

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_resume(
        file: UploadFile,
        current_user: User = Depends(get_current_user),
):
    """

    :param file:
    :return:
    """
    _ = current_user
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name is required")
    result = process_resume(file.file, file.filename)
    return result
