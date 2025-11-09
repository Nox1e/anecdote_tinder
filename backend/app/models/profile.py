"""Profile model for user profile management."""

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import String, DateTime, Boolean, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class GenderEnum(str, Enum):
    """Gender enumeration for user profiles."""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class Profile(Base):
    """Profile model for storing user profile information."""
    
    __tablename__ = "profiles"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Profile fields
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    gender: Mapped[Optional[GenderEnum]] = mapped_column(
        SQLEnum(GenderEnum, native_enum=False),
        nullable=True,
        default=None
    )
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    hobbies: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    favorite_joke: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    
    # Relationships
    user = relationship("User", uselist=False, foreign_keys=[user_id])
    
    def __repr__(self) -> str:
        return f"<Profile(id={self.id}, user_id={self.user_id}, display_name={self.display_name})>"
