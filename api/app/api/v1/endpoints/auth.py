from fastapi import HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
from starlette import status

from app.db.init_db import get_db
from app.schemas.user import UserLoginResponse, UserLogin
from app.services.user_service import login_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=UserLoginResponse)
def login_endpoint(payload: UserLogin, db: Session = Depends(get_db)):
    result = login_user(db, payload.email, payload.password)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    user, token = result
    return {"user": user, "token": token}
