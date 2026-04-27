from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID


# -----------------------------
# Request (upload / create)
# -----------------------------
class ResumeCreate(BaseModel):
    user_id: UUID
    file_name: str


# -----------------------------
# AI-parsed structured resume
# -----------------------------
class Education(BaseModel):
    school: Optional[str]
    degree: Optional[str]
    year: Optional[str]


class Project(BaseModel):
    name: Optional[str]
    description: Optional[str]


class ResumeStructured(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

    skills: List[str] = Field(default_factory=list)
    experience_years: Optional[int] = None

    education: List[Education] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)

    summary: Optional[str] = None


# -----------------------------
# DB response model
# -----------------------------
class ResumeOut(BaseModel):
    id: int
    user_id: UUID
    file_name: str

    raw_text: Optional[str] = None
    structured_data: Optional[ResumeStructured] = None

    class Config:
        from_attributes = True
