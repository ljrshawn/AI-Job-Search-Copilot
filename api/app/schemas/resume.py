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


# -----------------------------
# AI-parsed structured resume
# -----------------------------
class Work(BaseModel):
    position: str
    description: str


class Education(BaseModel):
    school: Optional[str]
    degree: Optional[str]
    year: Optional[str]


class Project(BaseModel):
    name: Optional[str]
    description: Optional[str]


class ResumeStructured(BaseModel):
    skills: List[str] = Field(default_factory=list)
    experience_years: Optional[int] = None
    works: List[Work] = Field(default_factory=list)

    education: List[Education] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)

    summary: Optional[str] = None


class ResumeEmbedded(BaseModel):
    skills: List[float] = Field(default_factory=list)
    works: List[Work] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    summary: Optional[str] = None


class ResumeOut(ResumeBase):
    class Config:
        from_attributes = True
