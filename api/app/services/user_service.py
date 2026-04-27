from uuid import UUID
from typing import cast
from datetime import datetime, timedelta, timezone

from jose import jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.utils.auth import hash_password, verify_password


def create_user(db: Session, payload: UserCreate) -> User:
    data = payload.model_dump()
    data["password"] = hash_password(data["password"])
    user = User(**data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def list_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    return cast(list[User], cast(object, db.query(User).offset(skip).limit(limit).all()))


def get_user(db: Session, user_id: UUID) -> User | None:
    return cast(User | None, db.query(User).filter(User.id == user_id).first())


def update_user(db: Session, user: User, payload: UserUpdate) -> User:
    updates = payload.model_dump(exclude_unset=True)
    if "password" in updates and updates["password"]:
        updates["password"] = hash_password(updates["password"])
    for key, value in updates.items():
        setattr(user, key, value)

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, email: str, password: str) -> tuple[User, str] | None:
    """Authenticate user and return user object with JWT token."""
    user = cast(User | None, db.query(User).filter(User.email == email).first())
    if not user or not verify_password(password, user.password):
        return None

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": str(user.id), "exp": expire}
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return user, token
