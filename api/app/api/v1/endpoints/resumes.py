from fastapi import APIRouter, UploadFile
from app.services.resume_service import process_resume

router = APIRouter()


@router.post("/upload")
async def upload_resume(file: UploadFile):
    """

    :param file:
    :return:
    """
    result = process_resume(file.file)
    return {"result": "success"}
