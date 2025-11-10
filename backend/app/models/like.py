"""Like model for handling user likes and matches."""

from datetime import datetime
from typing import Optional

from sqlalchemy import String, DateTime, Boolean, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Like(Base):
    """Like model for storing user likes and mutual matches."""
    
    __tablename__ = "likes"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    liker_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    target_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    mutual: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    
    # Relationships
    liker = relationship("User", foreign_keys=[liker_id])
    target = relationship("User", foreign_keys=[target_id])
    
    # Prevent duplicate likes and self-likes
    __table_args__ = (
        UniqueConstraint('liker_id', 'target_id', name='unique_like_pair'),
    )
    
    def __repr__(self) -> str:
        return f"<Like(id={self.id}, liker_id={self.liker_id}, target_id={self.target_id}, mutual={self.mutual})>"