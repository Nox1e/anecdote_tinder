"""API routes package."""

from app.api.auth import router as auth_router
from app.api.profile import router as profile_router

__all__ = ["auth_router", "profile_router"]