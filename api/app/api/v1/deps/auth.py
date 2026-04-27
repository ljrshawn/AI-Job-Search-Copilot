from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.init_db import get_db
from app.models.user import User
from app.services.user_service import get_user

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> User:
    """Validate Bearer token and return the authenticated user."""
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing authentication token",
    )

    if not credentials or credentials.scheme.lower() != "bearer":
        raise unauthorized

    try:
        token = credentials.credentials
        if not isinstance(token, str):
            raise unauthorized
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except JWTError as exc:
        raise unauthorized from exc

    user_id_raw = payload.get("sub")
    if not user_id_raw:
        raise unauthorized

    try:
        user_id = UUID(user_id_raw)
    except ValueError as exc:
        raise unauthorized from exc

    user = get_user(db, user_id)
    if not user:
        raise unauthorized

    return user



