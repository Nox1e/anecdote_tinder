"""Profile schemas for request/response models."""

from datetime import datetime
from typing import Optional
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict


class GenderEnum(str, Enum):
    """Gender enumeration for user profiles."""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class ProfileBase(BaseModel):
    """Base schema for profile data."""
    display_name: str = Field(..., min_length=1, max_length=255, description="Display name")
    gender: Optional[GenderEnum] = Field(None, description="Gender")
    avatar_url: Optional[str] = Field(None, max_length=500, description="Avatar URL")
    bio: Optional[str] = Field(None, max_length=1000, description="User bio")
    hobbies: Optional[str] = Field(None, max_length=1000, description="Hobbies (comma-separated or list)")
    favorite_joke: Optional[str] = Field(None, max_length=500, description="Favorite joke")
    is_active: bool = Field(True, description="Whether profile is active")


class ProfileUpdate(BaseModel):
    """Schema for updating profile (all fields optional)."""
    display_name: Optional[str] = Field(None, min_length=1, max_length=255, description="Display name")
    gender: Optional[GenderEnum] = Field(None, description="Gender")
    avatar_url: Optional[str] = Field(None, max_length=500, description="Avatar URL")
    bio: Optional[str] = Field(None, max_length=1000, description="User bio")
    hobbies: Optional[str] = Field(None, max_length=1000, description="Hobbies (comma-separated or list)")
    favorite_joke: Optional[str] = Field(None, max_length=500, description="Favorite joke")
    is_active: Optional[bool] = Field(None, description="Whether profile is active")


class ProfileResponse(ProfileBase):
    """Schema for profile response (includes timestamps)."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ProfilePublicResponse(BaseModel):
    """Schema for public profile response (limited fields)."""
    id: int
    user_id: int
    display_name: str
    gender: Optional[GenderEnum] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    hobbies: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
