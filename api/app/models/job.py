from sqlalchemy import JSON, Column, DateTime, Float, Integer, String, Boolean, func
from sqlalchemy.dialects.postgresql import ARRAY
from app.db.base import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True)
    origin_id = Column(Integer, nullable=False, unique=True, index=True)
    title = Column(String, nullable=False)
    raw_content = Column(String, nullable=False)
    raw_text = Column(String, nullable=False)
    structured_data = Column(JSON, nullable=True)
    embedding_vector = Column(ARRAY(Float), nullable=True)
    expires_at = Column(DateTime)
    is_expired = Column(Boolean, default=False)
    listed_at = Column(DateTime)
    salary = Column(String)
    share_link = Column(String)
    location = Column(String)
    advertiser = Column(String)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
