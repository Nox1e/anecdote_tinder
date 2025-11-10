"""Like router for handling likes, matches, and feed."""

from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.like import Like
from app.schemas.like import (
    FeedResponse,
    FeedProfileResponse,
    LikeResponse,
    MatchesResponse,
    MatchResponse,
    MatchProfileResponse,
    CloseProfileResponse,
)

router = APIRouter(prefix="/likes", tags=["likes"])


@router.get("/feed", response_model=FeedResponse)
async def get_feed(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
) -> FeedResponse:
    """Get paginated feed of active profiles (excluding current user)."""
    # Calculate offset
    offset = (page - 1) * size
    
    # Query active profiles excluding current user, sorted deterministically by id
    query = db.query(Profile).filter(
        and_(
            Profile.user_id != current_user.id,
            Profile.is_active == True
        )
    ).order_by(Profile.id.asc())
    
    # Get total count
    total = query.count()
    
    # Get paginated results
    profiles = query.offset(offset).limit(size).all()
    
    # Convert to response format
    feed_profiles = [FeedProfileResponse.model_validate(profile) for profile in profiles]
    
    return FeedResponse(
        profiles=feed_profiles,
        total=total,
        page=page,
        size=size,
        has_next=offset + size < total,
        has_prev=page > 1
    )


@router.post("/{target_id}", response_model=LikeResponse)
async def create_like(
    target_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LikeResponse:
    """Create a like for a target profile. Handles mutual matches automatically."""
    # Validate target user exists and has active profile
    target_profile = db.query(Profile).filter(
        and_(
            Profile.user_id == target_id,
            Profile.is_active == True
        )
    ).first()
    
    if not target_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target profile not found or inactive"
        )
    
    # Prevent self-likes
    if target_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot like yourself"
        )
    
    # Check if like already exists (idempotent)
    existing_like = db.query(Like).filter(
        and_(
            Like.liker_id == current_user.id,
            Like.target_id == target_id
        )
    ).first()
    
    if existing_like:
        return LikeResponse.model_validate(existing_like)
    
    # Check if target has already liked current user (for mutual match)
    reverse_like = db.query(Like).filter(
        and_(
            Like.liker_id == target_id,
            Like.target_id == current_user.id
        )
    ).first()
    
    # Create new like
    new_like = Like(
        liker_id=current_user.id,
        target_id=target_id,
        mutual=bool(reverse_like)  # Mark as mutual if reverse like exists
    )
    
    try:
        db.add(new_like)
        
        # If reverse like exists, update both to mutual
        if reverse_like and not reverse_like.mutual:
            reverse_like.mutual = True
            db.add(reverse_like)
        
        db.commit()
        db.refresh(new_like)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create like"
        )
    
    return LikeResponse.model_validate(new_like)


@router.get("/matches", response_model=MatchesResponse)
async def get_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MatchesResponse:
    """Get list of mutual matches with minimal profile info."""
    # Get mutual likes where current user is either liker or target
    # Use DISTINCT to avoid duplicates when both likes are mutual
    mutual_likes = db.query(Like).filter(
        and_(
            Like.mutual == True,
            or_(
                Like.liker_id == current_user.id,
                Like.target_id == current_user.id
            )
        )
    ).distinct().all()
    
    matches = []
    seen_user_ids = set()  # Track users we've already added to avoid duplicates
    
    for like in mutual_likes:
        # Determine the other user in the match
        matched_user_id = like.target_id if like.liker_id == current_user.id else like.liker_id
        
        # Skip if we've already added this user
        if matched_user_id in seen_user_ids:
            continue
            
        seen_user_ids.add(matched_user_id)
        
        # Get the matched user's profile
        matched_profile = db.query(Profile).filter(
            Profile.user_id == matched_user_id
        ).first()
        
        if matched_profile:
            match_response = MatchResponse(
                id=like.id,
                liker_id=like.liker_id,
                target_id=like.target_id,
                created_at=like.created_at,
                matched_with=MatchProfileResponse.model_validate(matched_profile)
            )
            matches.append(match_response)
    
    return MatchesResponse(
        matches=matches,
        total=len(matches)
    )