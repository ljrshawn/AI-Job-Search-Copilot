from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.core.config import settings

from app.models import user, resume

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, pool_pre_ping=True, future=True)


def init_db() -> None:
    """
    Create all tables (only for dev or first boot).
    In production, Alembic should handle migrations.
    """
    Base.metadata.create_all(bind=engine)


def get_db() -> Session:
    """
    Dependency injection for FastAPI routes.
    """
    db = Session(bind=engine)
    try:
        yield db
    finally:
        db.close()
