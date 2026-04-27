from fastapi import APIRouter, UploadFile
from starlette import status

from app.services.resume_service import process_resume

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_resume(file: UploadFile):
    """

    :param file:
    :return:
    """
    result = process_resume(file.file)
    return {"result": "success"}
