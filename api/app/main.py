from fastapi import FastAPI
from app.api.v1.router import api_router

app = FastAPI(title="AI Job Copilot API")

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """

    :return:
    """
    return {"status": "ok"}
