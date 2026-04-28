from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, Integer, String, Boolean, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import relationship
from app.db.base import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    file_name = Column(String, nullable=False)
    raw_text = Column(String)
    structured_data = Column(JSON)
    embedding_vector = Column(ARRAY(Float), nullable=True)
    user = relationship("User", back_populates="resumes")
    activated = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
