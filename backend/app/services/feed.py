"""Business logic for feed and matches operations."""

from __future__ import annotations

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session, aliased
from fastapi import HTTPException, status

from app.models.profile import Profile
from app.models.like import Like
from app.models.user import User
from app.models.profile_view import ProfileView, InteractionType
from app.schemas.like import (
    FeedResponse,
    FeedProfileResponse,
    LikeResponse,
    MatchesResponse,
    MatchResponse,
    MatchProfileResponse,
)
from app.schemas.auth import MessageResponse


def get_feed(
    *, current_user: User, db: Session, page: int, size: int
) -> FeedResponse:
    """Return a paginated feed of active profiles for the current user."""
    offset = (page - 1) * size

    viewed_alias = aliased(ProfileView)
    liked_alias = aliased(Like)

    query = (
        db.query(Profile)
        .outerjoin(
            viewed_alias,
            and_(
                viewed_alias.viewer_id == current_user.id,
                viewed_alias.viewed_profile_id == Profile.user_id,
            ),
        )
        .outerjoin(
            liked_alias,
            and_(
                liked_alias.liker_id == current_user.id,
                liked_alias.target_id == Profile.user_id,
            ),
        )
        .filter(
            Profile.user_id != current_user.id,
            Profile.is_active == True,  # noqa: E712 - SQLAlchemy comparison
            viewed_alias.id.is_(None),
            liked_alias.id.is_(None),
        )
        .order_by(Profile.id.asc())
    )

    total = query.count()
    profiles = query.offset(offset).limit(size).all()
    feed_profiles = [FeedProfileResponse.model_validate(profile) for profile in profiles]

    return FeedResponse(
        profiles=feed_profiles,
        total=total,
        page=page,
        size=size,
        has_next=offset + size < total,
        has_prev=page > 1,
    )


def like_profile(*, target_id: int, current_user: User, db: Session) -> LikeResponse:
    """Create (or return existing) like between current user and target."""
    target_profile = (
        db.query(Profile)
        .filter(
            and_(
                Profile.user_id == target_id,
                Profile.is_active == True,  # noqa: E712 - SQLAlchemy comparison
            )
        )
        .first()
    )

    if not target_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target profile not found or inactive",
        )

    if target_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot like yourself",
        )

    # Record profile view as like
    existing_view = (
        db.query(ProfileView)
        .filter(
            and_(
                ProfileView.viewer_id == current_user.id,
                ProfileView.viewed_profile_id == target_id,
            )
        )
        .first()
    )

    if existing_view:
        existing_view.interaction_type = InteractionType.LIKE
    else:
        profile_view = ProfileView(
            viewer_id=current_user.id,
            viewed_profile_id=target_id,
            interaction_type=InteractionType.LIKE,
        )
        db.add(profile_view)

    existing_like = (
        db.query(Like)
        .filter(
            and_(
                Like.liker_id == current_user.id,
                Like.target_id == target_id,
            )
        )
        .first()
    )

    if existing_like:
        db.commit()
        return LikeResponse.model_validate(existing_like)

    reverse_like = (
        db.query(Like)
        .filter(
            and_(
                Like.liker_id == target_id,
                Like.target_id == current_user.id,
            )
        )
        .first()
    )

    new_like = Like(
        liker_id=current_user.id,
        target_id=target_id,
        mutual=bool(reverse_like),
    )

    try:
        db.add(new_like)

        if reverse_like and not reverse_like.mutual:
            reverse_like.mutual = True
            db.add(reverse_like)

        # Check if target is a celebrity and auto-like back
        target_user = db.query(User).filter(User.id == target_id).first()
        if target_user and target_user.is_celebrity and not reverse_like:
            # Celebrity auto-likes back
            celebrity_like = Like(
                liker_id=target_id,
                target_id=current_user.id,
                mutual=True,
            )
            db.add(celebrity_like)
            # Update the current like to be mutual
            new_like.mutual = True

        db.commit()
        db.refresh(new_like)
    except Exception as exc:  # pragma: no cover - defensive rollback
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create like",
        ) from exc

    return LikeResponse.model_validate(new_like)


def get_matches(*, current_user: User, db: Session) -> MatchesResponse:
    """Return list of mutual matches for the current user."""
    mutual_likes = (
        db.query(Like)
        .filter(
            and_(
                Like.mutual == True,  # noqa: E712 - SQLAlchemy comparison
                or_(
                    Like.liker_id == current_user.id,
                    Like.target_id == current_user.id,
                ),
            )
        )
        .distinct()
        .all()
    )

    matches: list[MatchResponse] = []
    seen_user_ids: set[int] = set()

    for like in mutual_likes:
        matched_user_id = (
            like.target_id if like.liker_id == current_user.id else like.liker_id
        )

        if matched_user_id in seen_user_ids:
            continue

        seen_user_ids.add(matched_user_id)

        matched_profile = db.query(Profile).filter(Profile.user_id == matched_user_id).first()
        if matched_profile:
            matches.append(
                MatchResponse(
                    id=like.id,
                    liker_id=like.liker_id,
                    target_id=like.target_id,
                    created_at=like.created_at,
                    matched_with=MatchProfileResponse.model_validate(matched_profile),
                )
            )

    return MatchesResponse(matches=matches, total=len(matches))


def skip_profile(*, target_id: int, current_user: User, db: Session) -> MessageResponse:
    """Mark a profile as skipped/viewed without liking."""
    target_profile = (
        db.query(Profile)
        .filter(
            and_(
                Profile.user_id == target_id,
                Profile.is_active == True,  # noqa: E712 - SQLAlchemy comparison
            )
        )
        .first()
    )

    if not target_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target profile not found or inactive",
        )

    if target_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot skip yourself",
        )

    # Record profile view as skip
    existing_view = (
        db.query(ProfileView)
        .filter(
            and_(
                ProfileView.viewer_id == current_user.id,
                ProfileView.viewed_profile_id == target_id,
            )
        )
        .first()
    )

    if existing_view:
        return MessageResponse(message="Profile already viewed")

    profile_view = ProfileView(
        viewer_id=current_user.id,
        viewed_profile_id=target_id,
        interaction_type=InteractionType.SKIP,
    )

    try:
        db.add(profile_view)
        db.commit()
    except Exception as exc:  # pragma: no cover - defensive rollback
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record skip",
        ) from exc

    return MessageResponse(message="Profile skipped")
