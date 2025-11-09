"""Tests for health check endpoint."""

def test_health_check(client) -> None:
    """Test that the health endpoint returns 200 and correct data."""
    response = client.get("/health")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "app" in data
    assert "version" in data


def test_root_endpoint(client) -> None:
    """Test that the root endpoint returns 200 and basic info."""
    response = client.get("/")
    
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
    assert data["docs"] == "/docs"