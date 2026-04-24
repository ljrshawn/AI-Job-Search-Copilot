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
class ResumeStructured(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

    skills: List[str] = Field(default_factory=list)
    experience_years: Optional[int] = None

    education: List[Dict[str, Any]] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)

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
