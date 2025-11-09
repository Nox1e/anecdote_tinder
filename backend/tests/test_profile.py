"""Tests for profile endpoints."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.user import User
from app.models.profile import Profile
from app.models.session import Session as SessionModel


client = TestClient(app)


def test_profile_created_on_registration(db_session: Session):
    """Test that profile is created automatically on user registration."""
    user_data = {
        "email": "newuser@example.com",
        "username": "newuser",
        "password": "password123"
    }
    
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 201
    user_id = response.json()["user"]["id"]
    
    # Verify profile was created
    profile = db_session.query(Profile).filter(Profile.user_id == user_id).first()
    assert profile is not None
    assert profile.display_name == user_data["username"]
    assert profile.is_active is True


def test_get_profile_me_unauthorized():
    """Test accessing /profile/me without authentication."""
    response = client.get("/profile/me")
    assert response.status_code == 403


def test_get_profile_me_authenticated(db_session: Session):
    """Test accessing /profile/me with authentication."""
    # Create and login user
    user_data = {
        "email": "profile@example.com",
        "username": "profileuser",
        "password": "password123"
    }
    register_response = client.post("/auth/register", json=user_data)
    token = register_response.json()["token"]
    user_id = register_response.json()["user"]["id"]
    
    # Get profile
    response = client.get(
        "/profile/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == user_id
    assert data["display_name"] == user_data["username"]
    assert data["is_active"] is True
    assert "created_at" in data
    assert "updated_at" in data


def test_get_profile_me_with_bearer_token_from_cookie_flow(db_session: Session):
    """Test accessing /profile/me with token from login flow."""
    # Create and login user
    user_data = {
        "email": "cookieprofile@example.com",
        "username": "cookieuser",
        "password": "password123"
    }
    register_response = client.post("/auth/register", json=user_data)
    token = register_response.json()["token"]
    
    # Access profile with Bearer token
    response = client.get(
        "/profile/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["display_name"] == user_data["username"]


def test_update_profile_me_all_fields(db_session: Session):
    """Test updating all profile fields."""
    # Create user
    user_data = {
        "email": "updateall@example.com",
        "username": "updateuser",
        "password": "password123"
    }
    register_response = client.post("/auth/register", json=user_data)
    token = register_response.json()["token"]
    
    # Update profile with all fields
    update_data = {
        "display_name": "Updated Name",
        "gender": "male",
        "avatar_url": "https://example.com/avatar.jpg",
        "bio": "This is my bio",
        "hobbies": "reading,gaming,coding",
        "favorite_joke": "Why did the programmer go broke? Because he used up all his cache!",
        "is_active": True
    }
    
    response = client.put(
        "/profile/me",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["display_name"] == "Updated Name"
    assert data["gender"] == "male"
    assert data["avatar_url"] == "https://example.com/avatar.jpg"
    assert data["bio"] == "This is my bio"
    assert data["hobbies"] == "reading,gaming,coding"
    assert data["favorite_joke"] == "Why did the programmer go broke? Because he used up all his cache!"
    assert data["is_active"] is True


def test_update_profile_me_partial_fields(db_session: Session):
    """Test updating profile with partial fields (only some fields)."""
    # Create user
    user_data = {
        "email": "updatepartial@example.com",
        "username": "partialuser",
        "password": "password123"
    }
    register_response = client.post("/auth/register", json=user_data)
    token = register_response.json()["token"]
    
    # Update only some fields
    update_data = {
        "display_name": "New Display Name",
        "bio": "Updated bio only"
    }
    
    response = client.put(
        "/profile/me",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["display_name"] == "New Display Name"
    assert data["bio"] == "Updated bio only"
    # Other fields should remain unchanged
    assert data["gender"] is None
    assert data["avatar_url"] is None
    assert data["is_active"] is True


def test_update_profile_me_no_fields(db_session: Session):
    """Test updating profile with empty update data."""
    # Create user
    user_data = {
        "email": "nofields@example.com",
        "username": "nouser",
        "password": "password123"
    }
    register_response = client.post("/auth/register", json=user_data)
    token = register_response.json()["token"]
    user_id = register_response.json()["user"]["id"]
    original_name = "nouser"
    
    # Update with no fields
    response = client.put(
        "/profile/me",
        json={},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    # Display name should remain unchanged
    assert data["display_name"] == original_name
    assert data["user_id"] == user_id


def test_update_profile_me_unauthorized():
    """Test updating profile without authentication."""
    update_data = {
        "display_name": "Hacker",
    }
    
    response = client.put(
        "/profile/me",
        json=update_data,
    )
    
    assert response.status_code == 403


def test_update_profile_is_active_flag(db_session: Session):
    """Test updating profile is_active flag."""
    # Create user
    user_data = {
        "email": "activetest@example.com",
        "username": "activeuser",
        "password": "password123"
    }
    register_response = client.post("/auth/register", json=user_data)
    token = register_response.json()["token"]
    
    # Deactivate profile
    response = client.put(
        "/profile/me",
        json={"is_active": False},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    assert response.json()["is_active"] is False
    
    # Verify it's actually deactivated in DB
    profile = db_session.query(Profile).filter(
        Profile.user_id == register_response.json()["user"]["id"]
    ).first()
    assert profile.is_active is False


def test_get_public_profile_not_found():
    """Test getting public profile of non-existent user."""
    response = client.get("/profile/profiles/99999")
    assert response.status_code == 404
    assert "Profile not found" in response.json()["detail"]


def test_get_public_profile_inactive(db_session: Session):
    """Test getting public profile of inactive user."""
    # Create user
    user_data = {
        "email": "inactive@example.com",
        "username": "inactiveuser",
        "password": "password123"
    }
    register_response = client.post("/auth/register", json=user_data)
    token = register_response.json()["token"]
    user_id = register_response.json()["user"]["id"]
    
    # Deactivate profile
    update_response = client.put(
        "/profile/me",
        json={"is_active": False},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert update_response.status_code == 200
    
    # Try to get public profile - should not be found
    response = client.get(f"/profile/profiles/{user_id}")
    assert response.status_code == 404
    assert "Profile not found" in response.json()["detail"]


def test_get_public_profile_active(db_session: Session):
    """Test getting public profile of active user."""
    # Create user
    user_data = {
        "email": "publicprofile@example.com",
        "username": "publicuser",
        "password": "password123"
    }
    register_response = client.post("/auth/register", json=user_data)
    user_id = register_response.json()["user"]["id"]
    token = register_response.json()["token"]
    
    # Update profile with public info
    update_data = {
        "display_name": "Public Name",
        "gender": "female",
        "avatar_url": "https://example.com/public.jpg",
        "bio": "Public bio",
        "hobbies": "public,hobbies",
    }
    client.put(
        "/profile/me",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Get public profile
    response = client.get(f"/profile/profiles/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == user_id
    assert data["display_name"] == "Public Name"
    assert data["gender"] == "female"
    assert data["avatar_url"] == "https://example.com/public.jpg"
    assert data["bio"] == "Public bio"
    assert data["hobbies"] == "public,hobbies"
    assert "created_at" in data
    # Sensitive fields should not be in public response
    assert "is_active" not in data
    assert "favorite_joke" not in data
    assert "updated_at" not in data


def test_get_public_profile_limited_fields(db_session: Session):
    """Test that public profile returns only allowed fields."""
    # Create user
    user_data = {
        "email": "limitedfields@example.com",
        "username": "limiteduser",
        "password": "password123"
    }
    register_response = client.post("/auth/register", json=user_data)
    user_id = register_response.json()["user"]["id"]
    token = register_response.json()["token"]
    
    # Update profile with all fields
    update_data = {
        "display_name": "Full Profile",
        "gender": "other",
        "avatar_url": "https://example.com/full.jpg",
        "bio": "Full bio",
        "hobbies": "all,hobbies",
        "favorite_joke": "Secret joke",
        "is_active": True
    }
    client.put(
        "/profile/me",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Get public profile
    response = client.get(f"/profile/profiles/{user_id}")
    assert response.status_code == 200
    data = response.json()
    
    # Check allowed fields are present
    assert "id" in data
    assert "user_id" in data
    assert "display_name" in data
    assert "gender" in data
    assert "avatar_url" in data
    assert "bio" in data
    assert "hobbies" in data
    assert "created_at" in data
    
    # Check sensitive fields are NOT present
    assert "is_active" not in data
    assert "favorite_joke" not in data
    assert "updated_at" not in data


def test_profile_gender_validation(db_session: Session):
    """Test profile gender enum validation."""
    # Create user
    user_data = {
        "email": "gendertest@example.com",
        "username": "genderuser",
        "password": "password123"
    }
    register_response = client.post("/auth/register", json=user_data)
    token = register_response.json()["token"]
    user_id = register_response.json()["user"]["id"]
    
    # Test valid genders
    valid_genders = ["male", "female", "other", "prefer_not_to_say"]
    for gender in valid_genders:
        response = client.put(
            "/profile/me",
            json={"gender": gender},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["gender"] == gender
        assert response.json()["user_id"] == user_id
    
    # Test invalid gender
    response = client.put(
        "/profile/me",
        json={"gender": "invalid"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422


def test_profile_field_length_validation(db_session: Session):
    """Test profile field length validation."""
    # Create user
    user_data = {
        "email": "lengthtest@example.com",
        "username": "lengthuser",
        "password": "password123"
    }
    register_response = client.post("/auth/register", json=user_data)
    token = register_response.json()["token"]
    user_id = register_response.json()["user"]["id"]
    
    # Test display_name too long
    response = client.put(
        "/profile/me",
        json={"display_name": "x" * 300},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422
    
    # Test valid display_name
    response = client.put(
        "/profile/me",
        json={"display_name": "x" * 255},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["user_id"] == user_id
