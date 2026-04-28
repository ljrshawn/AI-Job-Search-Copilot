from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class JobBase(BaseModel):
    origin_id: int
    title: str
    raw_content: str
    salary: Optional[str] = None
    share_link: Optional[str] = None
    location: Optional[str] = None
    advertiser: Optional[str] = None
    expires_at: Optional[datetime] = None
    is_expired: bool = False
    listed_at: Optional[datetime] = None


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = None
    raw_content: Optional[str] = None
    salary: Optional[str] = None
    share_link: Optional[str] = None
    location: Optional[str] = None
    advertiser: Optional[str] = None
    expires_at: Optional[datetime] = None
    is_expired: Optional[bool] = None
    listed_at: Optional[datetime] = None
    structured_data: Optional[dict] = None
    embedding_vector: Optional[list[float]] = None


class JobOut(JobBase):
    id: int
    structured_data: Optional[dict] = None
    embedding_vector: Optional[list[float]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
