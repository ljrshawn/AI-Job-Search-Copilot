from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime


class ResumeBase(BaseModel):
    id: int
    user_id: UUID
    file_name: str
    raw_text: str
    structured_data: Optional[Dict[str, Any]] = None
    embedding_vector: Optional[List[float]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    activated: bool


class ResumeStructured(BaseModel):
    skills: List[str] = Field(default_factory=list)
    requirements: List[str] = Field(default_factory=list)
    experience_years: Optional[int] = None
    seniority: Optional[str] = None
    domain: Optional[str] = None
    summary: Optional[str] = None


class ResumeOut(ResumeBase):
    class Config:
        from_attributes = True
