"""Authentication schemas for request/response models."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Schema for user registration request."""
    email: EmailStr = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=100, description="Username")
    password: str = Field(..., min_length=6, max_length=100, description="Password")


class LoginRequest(BaseModel):
    """Schema for user login request."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="Password")


class AuthUser(BaseModel):
    """Schema for authenticated user information."""
    id: int
    email: str
    username: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Schema for authentication response."""
    user: AuthUser
    token: str


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    detail: str


class MessageResponse(BaseModel):
    """Schema for simple message responses."""
    message: str