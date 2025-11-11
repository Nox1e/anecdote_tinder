"""Profile view model for tracking user interactions with profiles."""

from datetime import datetime
from enum import Enum

from sqlalchemy import String, DateTime, ForeignKey, Integer, UniqueConstraint, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class InteractionType(str, Enum):
    """Type of interaction with a profile."""
    LIKE = "like"
    SKIP = "skip"


class ProfileView(Base):
    """ProfileView model for tracking when users view/interact with profiles."""
    
    __tablename__ = "profile_views"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    viewer_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    viewed_profile_id: Mapped[int] = mapped_column(Integer, ForeignKey("profiles.user_id"), nullable=False, index=True)
    interaction_type: Mapped[InteractionType] = mapped_column(SQLEnum(InteractionType), nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    viewer = relationship("User", foreign_keys=[viewer_id])
    
    # Prevent duplicate views
    __table_args__ = (
        UniqueConstraint('viewer_id', 'viewed_profile_id', name='unique_profile_view'),
    )
    
    def __repr__(self) -> str:
        return f"<ProfileView(id={self.id}, viewer_id={self.viewer_id}, viewed_profile_id={self.viewed_profile_id}, type={self.interaction_type})>"
