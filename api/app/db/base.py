from sqlalchemy.orm import DeclarativeBase, declared_attr


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy models.

    - Uses SQLAlchemy 2.0 style DeclarativeBase
    - Automatically generates table names if not defined
    """

    @declared_attr.directive
    def __tablename__(self) -> str:
        return self.__name__.lower()
