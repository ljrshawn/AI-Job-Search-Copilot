from functools import lru_cache
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from typing import Generator

from app.db.base import Base
from app.core.config import settings

from app.models import user, resume

# Ensure models are imported so SQLAlchemy registers tables on Base.metadata.
_ = (user, resume)


@lru_cache
def get_engine():
    return create_engine(settings.DATABASE_URL, pool_pre_ping=True, future=True)


@lru_cache
def get_session_factory():
    return sessionmaker(bind=get_engine(), autocommit=False, autoflush=False, future=True)


def init_db() -> None:
    """
    Create all tables (only for dev or first boot).
    In production, Alembic should handle migrations.
    """
    Base.metadata.create_all(bind=get_engine())


def get_db() -> Generator[Session, None, None]:
    """
    Dependency injection for FastAPI routes.
    """
    db = get_session_factory()()
    try:
        yield db
    finally:
        db.close()
