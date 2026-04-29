from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class JobBase(BaseModel):
    origin_id: int
    title: str
    raw_content: str
    raw_text: str
    structured_data: Optional[dict] = None
    embedding_vector: Optional[list[float]] = None
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
    raw_text: Optional[str] = None
    salary: Optional[str] = None
    share_link: Optional[str] = None
    location: Optional[str] = None
    advertiser: Optional[str] = None
    expires_at: Optional[datetime] = None
    is_expired: Optional[bool] = None
    listed_at: Optional[datetime] = None
    structured_data: Optional[dict] = None
    embedding_vector: Optional[list[float]] = None


class JobStructured(BaseModel):
    skills: List[str] = Field(default_factory=list)
    requirements: List[str] = Field(default_factory=list)
    experience_years: Optional[int] = None
    seniority: Optional[str] = None
    domain: Optional[str] = None
    summary: Optional[str] = None


class JobOut(JobBase):
    id: int
    raw_text: str
    structured_data: Optional[dict] = None
    embedding_vector: Optional[list[float]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
