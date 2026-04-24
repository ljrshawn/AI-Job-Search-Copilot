from sqlalchemy import JSON, Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    raw_text = Column(String)
    structured_data = Column(JSON)
    embedding = Column(JSON)
    user = relationship("User", back_populates="resumes")
