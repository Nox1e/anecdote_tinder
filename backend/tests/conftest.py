"""Test configuration and fixtures."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client() -> TestClient:
    """Create a test client."""
    return TestClient(app)


@pytest.fixture
def db_session():
    """Create a test database session."""
    from app.db.session import SessionLocal
    session = SessionLocal()
    try:
        yield session
    finally:
        # Clean up test data
        from app.models.session import Session as SessionModel
        from app.models.user import User
        session.query(SessionModel).delete()
        session.query(User).delete()
        session.commit()
        session.close()