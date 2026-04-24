from sqlalchemy import Column, Integer, JSON, String, ForeignKey
from app.db.base import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    raw_text = Column(String)
    structured_data = Column(JSON)
    embedding = Column(JSON)
