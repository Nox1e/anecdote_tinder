"""Authentication router for handling user registration, login, logout, and profile."""

from typing import Annotated, Union

from fastapi import APIRouter, Depends, HTTPException, status, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    revoke_token,
    verify_token,
)
from app.db.session import get_db
from app.models.user import User
from app.models.profile import Profile
from app.schemas.auth import (
    AuthResponse,
    AuthUser,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
)

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()


def get_current_user_from_token(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Session = Depends(get_db),
) -> User:
    """Get current user from Bearer token."""
    user = verify_token(credentials.credentials, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_current_user_from_cookie(
    token: Annotated[Union[str, None], Cookie()] = None,
    db: Session = Depends(get_db),
) -> User:
    """Get current user from session cookie."""
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    user = verify_token(token, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    return user


def get_current_user(
    token: Annotated[Union[str, None], Cookie()] = None,
    credentials: Annotated[Union[HTTPAuthorizationCredentials, None], Depends(security)] = None,
    db: Session = Depends(get_db),
) -> User:
    """Get current user from either cookie or Bearer token."""
    auth_token = None
    
    # Try cookie first
    if token:
        auth_token = token
    # Then try Bearer token
    elif credentials:
        auth_token = credentials.credentials
    
    if auth_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    user = verify_token(auth_token, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    return user


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db),
) -> AuthResponse:
    """Register a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        if existing_user.email == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create profile with sensible defaults
    profile = Profile(
        user_id=user.id,
        display_name=user_data.username,
        is_active=True,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    
    # Create access token
    token = create_access_token(user.id, db)
    
    return AuthResponse(
        user=AuthUser.model_validate(user),
        token=token,
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    user_data: LoginRequest,
    db: Session = Depends(get_db),
) -> AuthResponse:
    """Authenticate user and return access token."""
    user = authenticate_user(db, user_data.email, user_data.password)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    token = create_access_token(user.id, db)
    
    return AuthResponse(
        user=AuthUser.model_validate(user),
        token=token,
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(
    token: Annotated[Union[str, None], Cookie()] = None,
    credentials: Annotated[Union[HTTPAuthorizationCredentials, None], Depends(security)] = None,
    db: Session = Depends(get_db),
) -> MessageResponse:
    """Logout user and revoke session token."""
    auth_token = None
    
    # Try cookie first
    if token:
        auth_token = token
    # Then try Bearer token
    elif credentials:
        auth_token = credentials.credentials
    
    if auth_token is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No session token provided"
        )
    
    # Revoke token
    revoke_token(auth_token, db)
    
    return MessageResponse(message="Successfully logged out")


@router.get("/me", response_model=AuthUser)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
) -> AuthUser:
    """Get current user information."""
    return AuthUser.model_validate(current_user)