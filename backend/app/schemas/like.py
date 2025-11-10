"""Like and match schemas for request/response models."""

from datetime import datetime
from typing import Optional, List
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict

from app.schemas.profile import GenderEnum


class FeedProfileResponse(BaseModel):
    """Schema for profile data in feed (limited fields)."""
    id: int
    user_id: int
    display_name: str
    gender: Optional[GenderEnum] = None
    avatar_url: Optional[str] = None
    favorite_joke: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class FeedResponse(BaseModel):
    """Schema for paginated feed response."""
    profiles: List[FeedProfileResponse]
    total: int
    page: int
    size: int
    has_next: bool
    has_prev: bool


class LikeResponse(BaseModel):
    """Schema for like creation response."""
    id: int
    liker_id: int
    target_id: int
    mutual: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class MatchProfileResponse(BaseModel):
    """Schema for profile data in matches (minimal info)."""
    id: int
    user_id: int
    display_name: str
    avatar_url: Optional[str] = None
    favorite_joke: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class MatchResponse(BaseModel):
    """Schema for match response."""
    id: int
    liker_id: int
    target_id: int
    created_at: datetime
    matched_with: MatchProfileResponse
    
    model_config = ConfigDict(from_attributes=True)


class MatchesResponse(BaseModel):
    """Schema for matches list response."""
    matches: List[MatchResponse]
    total: int


class CloseProfileResponse(BaseModel):
    """Schema for close profile response."""
    success: bool
    is_active: bool
    message: str