from fastapi import APIRouter, UploadFile

router = APIRouter()


@router.post("/upload")
async def upload_resume(resume: UploadFile):
    """

    :param resume:
    :return:
    """
    result = "success"
    return {"result": result}
