import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
from starlette import status

from app.db.init_db import get_db
from app.schemas.user import GoogleLogin, GoogleSignup, UserLoginResponse, UserLogin
from app.services.user_service import login_google_user, login_user, signup_google_user

router = APIRouter(prefix="/auth", tags=["auth"])


def _get_verified_google_email(access_token: str) -> str:
    request = Request(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    try:
        with urlopen(request, timeout=10) as response:
            profile = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google access token",
        ) from exc

    email = profile.get("email")
    if not email or profile.get("email_verified") is False:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google email is not verified",
        )

    return str(email).lower()


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


@router.post("/google", response_model=UserLoginResponse)
def google_login_endpoint(payload: GoogleLogin, db: Session = Depends(get_db)):
    google_email = _get_verified_google_email(payload.access_token)
    if google_email != payload.email.lower():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google token does not match this email",
        )

    result = login_google_user(db, google_email)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user, token = result
    return {"user": user, "token": token}


@router.post("/google/signup", response_model=UserLoginResponse)
def google_signup_endpoint(payload: GoogleSignup, db: Session = Depends(get_db)):
    google_email = _get_verified_google_email(payload.access_token)
    if google_email != payload.email.lower():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google token does not match this email",
        )

    try:
        user, token = signup_google_user(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    return {"user": user, "token": token}
