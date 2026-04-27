from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.v1.deps.auth import get_current_user
from app.db.init_db import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.services.user_service import create_user, get_user, list_users, update_user

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user_endpoint(payload: UserCreate, db: Session = Depends(get_db)):
    try:
        return create_user(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get("", response_model=list[UserOut])
def list_users_endpoint(
        skip: int = Query(default=0, ge=0),
        limit: int = Query(default=100, ge=1, le=200),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    _ = current_user
    return list_users(db, skip=skip, limit=limit)


@router.get("/{user_id}", response_model=UserOut)
def get_user_endpoint(
        user_id: UUID,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own user data",
        )

    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserOut)
def update_user_endpoint(
        user_id: UUID,
        payload: UserUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own user data",
        )

    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return update_user(db, user, payload)
