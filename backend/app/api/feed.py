"""Feed router exposing simplified endpoints for feed interactions."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.like import FeedResponse, LikeResponse, MatchesResponse
from app.services.feed import get_feed, like_profile, get_matches, skip_profile

router = APIRouter(prefix="/feed", tags=["feed"])


@router.get("", response_model=FeedResponse)
async def fetch_feed(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
) -> FeedResponse:
    """Return paginated feed results for the current user."""
    return get_feed(current_user=current_user, db=db, page=page, size=size)


@router.post("/{target_id}/like", response_model=LikeResponse)
async def like_from_feed(
    target_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LikeResponse:
    """Create a like for a profile from the feed view."""
    return like_profile(target_id=target_id, current_user=current_user, db=db)


@router.post("/{target_id}/skip")
async def skip_from_feed(
    target_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Mark a profile as skipped without liking."""
    return skip_profile(target_id=target_id, current_user=current_user, db=db)


@router.get("/matches", response_model=MatchesResponse)
async def list_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MatchesResponse:
    """Return mutual matches for the current user."""
    return get_matches(current_user=current_user, db=db)
