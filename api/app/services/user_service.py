from uuid import UUID
from typing import cast
from datetime import datetime, timedelta, timezone

from jose import jwt
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.schemas.user import GoogleSignup, UserCreate, UserUpdate
from app.utils.auth import hash_password, verify_password


def create_access_token(user: User) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": str(user.id), "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_user(db: Session, payload: UserCreate) -> User:
    data = payload.model_dump()
    data["password"] = hash_password(data["password"])
    user = User(**data)
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ValueError("User with this email or username already exists") from exc
    db.refresh(user)
    return user


def get_user_by_email(db: Session, email: str) -> User | None:
    return cast(User | None, db.query(User).filter(User.email == email).first())


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
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password):
        return None

    return user, create_access_token(user)


def login_google_user(db: Session, email: str) -> tuple[User, str] | None:
    """Return an app session for an existing Google-authenticated email."""
    user = get_user_by_email(db, email)
    if not user:
        return None

    return user, create_access_token(user)


def signup_google_user(db: Session, payload: GoogleSignup) -> tuple[User, str]:
    """Create an app user after Google proves email ownership."""
    user = create_user(
        db,
        UserCreate(
            email=payload.email,
            username=payload.username,
            first_name=payload.first_name,
            last_name=payload.last_name,
            password=payload.password,
            role=payload.role,
        ),
    )
    return user, create_access_token(user)
