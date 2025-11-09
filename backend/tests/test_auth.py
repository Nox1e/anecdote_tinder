"""Tests for authentication endpoints."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.user import User
from app.models.session import Session as SessionModel


client = TestClient(app)


def test_register_success(db_session: Session):
    """Test successful user registration."""
    user_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpassword123"
    }
    
    response = client.post("/auth/register", json=user_data)
    
    assert response.status_code == 201
    data = response.json()
    assert "user" in data
    assert "token" in data
    assert data["user"]["email"] == user_data["email"]
    assert data["user"]["username"] == user_data["username"]
    assert "hashed_password" not in data["user"]
    
    # Verify user was created in database
    user = db_session.query(User).filter(User.email == user_data["email"]).first()
    assert user is not None
    assert user.username == user_data["username"]


def test_register_duplicate_email(db_session: Session):
    """Test registration with duplicate email."""
    # Create first user
    user_data = {
        "email": "duplicate@example.com",
        "username": "user1",
        "password": "password123"
    }
    client.post("/auth/register", json=user_data)
    
    # Try to create second user with same email
    duplicate_data = {
        "email": "duplicate@example.com",
        "username": "user2",
        "password": "password456"
    }
    
    response = client.post("/auth/register", json=duplicate_data)
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


def test_register_duplicate_username(db_session: Session):
    """Test registration with duplicate username."""
    # Create first user
    user_data = {
        "email": "user1@example.com",
        "username": "duplicateuser",
        "password": "password123"
    }
    client.post("/auth/register", json=user_data)
    
    # Try to create second user with same username
    duplicate_data = {
        "email": "user2@example.com",
        "username": "duplicateuser",
        "password": "password456"
    }
    
    response = client.post("/auth/register", json=duplicate_data)
    assert response.status_code == 400
    assert "Username already taken" in response.json()["detail"]


def test_register_invalid_email():
    """Test registration with invalid email."""
    user_data = {
        "email": "invalid-email",
        "username": "testuser",
        "password": "password123"
    }
    
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 422  # Validation error


def test_register_short_password():
    """Test registration with password that's too short."""
    user_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "123"  # Too short (min 6)
    }
    
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 422  # Validation error


def test_login_success(db_session: Session):
    """Test successful user login."""
    # Create user first
    user_data = {
        "email": "login@example.com",
        "username": "loginuser",
        "password": "password123"
    }
    register_response = client.post("/auth/register", json=user_data)
    
    # Login with the same credentials
    login_data = {
        "email": user_data["email"],
        "password": user_data["password"]
    }
    
    response = client.post("/auth/login", json=login_data)
    
    assert response.status_code == 200
    data = response.json()
    assert "user" in data
    assert "token" in data
    assert data["user"]["email"] == user_data["email"]
    assert data["user"]["username"] == user_data["username"]


def test_login_invalid_email():
    """Test login with non-existent email."""
    login_data = {
        "email": "nonexistent@example.com",
        "password": "password123"
    }
    
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_login_invalid_password(db_session: Session):
    """Test login with wrong password."""
    # Create user first
    user_data = {
        "email": "wrongpass@example.com",
        "username": "wronguser",
        "password": "correctpassword"
    }
    client.post("/auth/register", json=user_data)
    
    # Try to login with wrong password
    login_data = {
        "email": user_data["email"],
        "password": "wrongpassword"
    }
    
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_get_me_unauthorized():
    """Test accessing /auth/me without authentication."""
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_get_me_with_token(db_session: Session):
    """Test accessing /auth/me with valid token."""
    # Create and login user
    user_data = {
        "email": "profile@example.com",
        "username": "profileuser",
        "password": "password123"
    }
    register_response = client.post("/auth/register", json=user_data)
    token = register_response.json()["token"]
    
    # Access profile with Bearer token
    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["username"] == user_data["username"]
    assert "hashed_password" not in data


def test_get_me_with_cookie(db_session: Session):
    """Test accessing /auth/me with session cookie."""
    # Create and login user
    user_data = {
        "email": "cookie@example.com",
        "username": "cookieuser",
        "password": "password123"
    }
    register_response = client.post("/auth/register", json=user_data)
    token = register_response.json()["token"]
    
    # Access profile with cookie
    client.cookies.set("token", token)
    response = client.get("/auth/me")
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["username"] == user_data["username"]


def test_logout_with_token(db_session: Session):
    """Test logout with Bearer token."""
    # Create and login user
    user_data = {
        "email": "logout@example.com",
        "username": "logoutuser",
        "password": "password123"
    }
    register_response = client.post("/auth/register", json=user_data)
    token = register_response.json()["token"]
    
    # Logout with token
    response = client.post(
        "/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    assert "Successfully logged out" in response.json()["message"]
    
    # Verify token is no longer valid
    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401


def test_logout_with_cookie(db_session: Session):
    """Test logout with session cookie."""
    # Create and login user
    user_data = {
        "email": "logoutcookie@example.com",
        "username": "logoutcookieuser",
        "password": "password123"
    }
    register_response = client.post("/auth/register", json=user_data)
    token = register_response.json()["token"]
    
    # Logout with cookie
    client.cookies.set("token", token)
    response = client.post("/auth/logout")
    
    assert response.status_code == 200
    assert "Successfully logged out" in response.json()["message"]
    
    # Verify token is no longer valid
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_logout_without_token():
    """Test logout without providing token."""
    response = client.post("/auth/logout")
    assert response.status_code == 400
    assert "No session token provided" in response.json()["detail"]


def test_session_persistence(db_session: Session):
    """Test that sessions persist across multiple requests."""
    # Create and login user
    user_data = {
        "email": "persist@example.com",
        "username": "persistuser",
        "password": "password123"
    }
    register_response = client.post("/auth/register", json=user_data)
    token = register_response.json()["token"]
    
    # Make multiple authenticated requests
    for i in range(3):
        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["email"] == user_data["email"]
    
    # Verify only one session was created
    sessions = db_session.query(SessionModel).filter(
        SessionModel.token == token
    ).all()
    assert len(sessions) == 1


@pytest.fixture
def db_session():
    """Create a test database session."""
    from app.db.session import SessionLocal
    session = SessionLocal()
    try:
        yield session
    finally:
        # Clean up test data
        session.query(SessionModel).delete()
        session.query(User).delete()
        session.commit()
        session.close()