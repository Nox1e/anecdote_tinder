"""Like router for handling likes, matches, and feed."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.like import FeedResponse, LikeResponse, MatchesResponse
from app.services.feed import (
    get_feed as fetch_feed,
    like_profile as perform_like,
    get_matches as fetch_matches,
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
    return fetch_feed(current_user=current_user, db=db, page=page, size=size)


@router.post("/{target_id}", response_model=LikeResponse)
async def create_like(
    target_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LikeResponse:
    """Create a like for a target profile. Handles mutual matches automatically."""
    return perform_like(target_id=target_id, current_user=current_user, db=db)


@router.get("/matches", response_model=MatchesResponse)
async def get_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MatchesResponse:
    """Get list of mutual matches with minimal profile info."""
    return fetch_matches(current_user=current_user, db=db)
