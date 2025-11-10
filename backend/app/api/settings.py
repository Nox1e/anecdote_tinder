"""Settings router for handling user settings like profile closure."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.profile import Profile
from app.schemas.like import CloseProfileResponse

router = APIRouter(prefix="/settings", tags=["settings"])


@router.post("/close-profile", response_model=CloseProfileResponse)
async def close_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CloseProfileResponse:
    """Close the current user's profile (sets is_active to False)."""
    # Get user's profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Close the profile
    profile.is_active = False
    
    try:
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to close profile"
        )
    
    return CloseProfileResponse(
        success=True,
        is_active=profile.is_active,
        message="Profile closed successfully"
    )