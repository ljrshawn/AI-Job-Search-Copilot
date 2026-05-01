import re
from typing import Optional
from datetime import datetime

from pydantic import BaseModel, Field, field_validator
from uuid import UUID

from app.models.user import UserRole


def _validate_password_complexity(value: str) -> str:
    if not re.search(r"[a-z]", value):
        raise ValueError("Password must include at least one lowercase letter")
    if not re.search(r"[A-Z]", value):
        raise ValueError("Password must include at least one uppercase letter")
    if not re.search(r"\d", value):
        raise ValueError("Password must include at least one number")
    if not re.search(r"[^A-Za-z0-9]", value):
        raise ValueError("Password must include at least one special character")
    return value


class UserBase(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: str = Field(min_length=5, max_length=255)
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    role: Optional[UserRole] = None
    subscribed: Optional[bool] = None


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=255)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return _validate_password_complexity(value)


class UserUpdate(BaseModel):
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    email: Optional[str] = Field(default=None, min_length=5, max_length=255)
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    password: Optional[str] = Field(default=None, min_length=8, max_length=255)
    alert: Optional[bool] = None
    status: Optional[bool] = None
    role: Optional[UserRole] = None
    subscribed: Optional[bool] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        return _validate_password_complexity(value)


class UserOut(UserBase):
    id: UUID
    alert: bool = False
    status: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Request schema for user login."""
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=255)


class UserLoginResponse(BaseModel):
    """Response schema for successful login."""
    user: UserOut
    token: str


class GoogleLogin(BaseModel):
    """Request schema for Google OAuth login."""
    access_token: str = Field(min_length=1)
    id_token: Optional[str] = None
    email: str = Field(min_length=5, max_length=255)
    name: Optional[str] = Field(default=None, max_length=255)
    image: Optional[str] = None


class GoogleSignup(BaseModel):
    """Request schema for completing signup after Google OAuth."""
    access_token: str = Field(min_length=1)
    email: str = Field(min_length=5, max_length=255)
    username: str = Field(min_length=3, max_length=50)
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    password: str = Field(min_length=8, max_length=255)
    role: UserRole

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return _validate_password_complexity(value)
