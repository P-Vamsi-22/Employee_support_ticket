from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import (
    get_google_auth_url,
    exchange_code_for_token,
    get_google_user_info,
    determine_role,
    create_access_token,
    FRONTEND_URL,
)
from schemas import UserOut
from dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/login")
def login():
    """Redirect browser to Google OAuth consent screen."""
    return RedirectResponse(url=get_google_auth_url())


@router.get("/callback")
async def callback(code: str, db: Session = Depends(get_db)):
    """Exchange Google auth code for a JWT and redirect to the frontend."""
    try:
        token_data = await exchange_code_for_token(code)
        user_info = await get_google_user_info(token_data["access_token"])
    except Exception:
        raise HTTPException(status_code=400, detail="Google OAuth exchange failed")

    google_id: str = user_info["id"]
    email: str = user_info["email"]
    name: str = user_info.get("name", email)

    # Find existing user by google_id or email, or create a new one.
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            # Link google_id to existing sample-data user with matching email.
            user.google_id = google_id
            user.name = name
        else:
            role = determine_role(email)
            user = User(google_id=google_id, name=name, email=email, role=role)
            db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return RedirectResponse(
        url=f"{FRONTEND_URL}/auth/callback?token={token}",
        status_code=302,
    )


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    return current_user
