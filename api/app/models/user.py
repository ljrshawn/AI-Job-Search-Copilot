import uuid

from sqlalchemy import Boolean, Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String)
    email = Column(String)
    password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    alert = Column(Boolean, default=False)
    status = Column(Boolean, default=False)
    resumes = relationship("Resume", back_populates="user")
