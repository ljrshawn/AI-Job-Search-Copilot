import enum
import uuid

from sqlalchemy import Boolean, Column, DateTime, Enum, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base


class ClientRole(str, enum.Enum):
    SEEKER = "seeker"
    POSTER = "poster"


class UserRole(str, enum.Enum):
    SEEKER = "seeker"
    POSTER = "poster"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    alert = Column(Boolean, default=False)
    status = Column(Boolean, default=False)
    role = Column(Enum(UserRole, name="user_role"), nullable=False, default=UserRole.SEEKER)
    subscribed = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    resumes = relationship("Resume", back_populates="user")
