from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserLogin, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=dict, summary="Register a new user")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    email_normalized = user_in.email.lower()
    existing = db.query(User).filter(func.lower(User.email) == email_normalized).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "email_taken", "message": "Email already registered"},
        )
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=email_normalized,
        full_name=user_in.full_name,
        role=user_in.role,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    token = create_access_token(str(db_user.id))
    return {"access_token": token, "token_type": "bearer", "user": UserRead.from_orm(db_user)}


@router.post("/login", response_model=dict, summary="Login and get access token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email_normalized = form_data.username.lower()
    user = db.query(User).filter(func.lower(User.email) == email_normalized).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect email or password")
    token = create_access_token(str(user.id), expires_delta=timedelta(minutes=60))
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login-json", response_model=dict, summary="JSON login for frontend clients")
def login_json(payload: UserLogin, db: Session = Depends(get_db)):
    email_normalized = payload.email.lower()
    user = db.query(User).filter(func.lower(User.email) == email_normalized).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect email or password")
    token = create_access_token(str(user.id), expires_delta=timedelta(minutes=60))
    return {"access_token": token, "token_type": "bearer"}
