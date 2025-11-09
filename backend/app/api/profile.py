"""Profile router for handling user profile management."""

from typing import Annotated, Union

from fastapi import APIRouter, Depends, HTTPException, status, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.auth import verify_token
from app.db.session import get_db
from app.models.user import User
from app.models.profile import Profile
from app.api.auth import get_current_user
from app.schemas.profile import (
    ProfileResponse,
    ProfileUpdate,
    ProfilePublicResponse,
)

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=ProfileResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileResponse:
    """Get current authenticated user's profile."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return ProfileResponse.model_validate(profile)


@router.put("/me", response_model=ProfileResponse)
async def update_current_user_profile(
    profile_update: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileResponse:
    """Update current authenticated user's profile (partial updates supported)."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Update only provided fields
    update_data = profile_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    db.add(profile)
    db.commit()
    db.refresh(profile)
    
    return ProfileResponse.model_validate(profile)


@router.get("/profiles/{user_id}", response_model=ProfilePublicResponse)
async def get_public_profile(
    user_id: int,
    db: Session = Depends(get_db),
) -> ProfilePublicResponse:
    """Get public profile of a user (limited fields, excludes inactive profiles)."""
    profile = db.query(Profile).filter(
        Profile.user_id == user_id,
        Profile.is_active == True
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return ProfilePublicResponse.model_validate(profile)
