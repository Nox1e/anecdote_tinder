"""Test configuration and fixtures."""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import create_tables


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Set up test database and create tables."""
    create_tables()
    yield


@pytest.fixture
def client() -> TestClient:
    """Create a test client."""
    return TestClient(app)


@pytest.fixture
def db_session():
    """Create a test database session."""
    from app.db.session import SessionLocal
    from app.models.session import Session as SessionModel
    from app.models.user import User
    from app.models.profile import Profile
    from app.models.like import Like
    from app.models.profile_view import ProfileView
    
    session = SessionLocal()
    try:
        yield session
    finally:
        # Clean up test data
        session.query(ProfileView).delete()
        session.query(Like).delete()
        session.query(SessionModel).delete()
        session.query(Profile).delete()
        session.query(User).delete()
        session.commit()
        session.close()