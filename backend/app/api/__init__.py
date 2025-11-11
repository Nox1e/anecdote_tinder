"""API routes package."""

from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.like import router as like_router
from app.api.settings import router as settings_router
from app.api.feed import router as feed_router

__all__ = [
    "auth_router",
    "profile_router",
    "like_router",
    "settings_router",
    "feed_router",
]
