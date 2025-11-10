"""Tests for likes, matches, feed, and profile closure functionality."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.user import User
from app.models.profile import Profile, GenderEnum
from app.models.like import Like
from app.models.session import Session as SessionModel
from app.auth import create_access_token, get_password_hash

client = TestClient(app)


@pytest.fixture
def test_users(db_session: Session):
    """Create test users with profiles."""
    users = []
    profiles = []
    
    user_data = [
        {"email": "user1@test.com", "username": "user1", "password": "pass1"},
        {"email": "user2@test.com", "username": "user2", "password": "pass2"},
        {"email": "user3@test.com", "username": "user3", "password": "pass3"},
        {"email": "user4@test.com", "username": "user4", "password": "pass4"},
    ]
    
    profile_data = [
        {"display_name": "User One", "gender": GenderEnum.MALE, "favorite_joke": "Why did the chicken cross the road?"},
        {"display_name": "User Two", "gender": GenderEnum.FEMALE, "favorite_joke": "What do you call a fake noodle?"},
        {"display_name": "User Three", "gender": GenderEnum.OTHER, "favorite_joke": "Why don't scientists trust atoms?"},
        {"display_name": "User Four", "gender": GenderEnum.PREFER_NOT_TO_SAY, "favorite_joke": "I told my wife she was drawing her eyebrows too high."},
    ]
    
    for i, (user_dict, profile_dict) in enumerate(zip(user_data, profile_data)):
        # Create user
        user = User(
            email=user_dict["email"],
            username=user_dict["username"],
            hashed_password=get_password_hash(user_dict["password"])
        )
        db_session.add(user)
        db_session.flush()
        
        # Create profile
        profile = Profile(
            user_id=user.id,
            **profile_dict
        )
        db_session.add(profile)
        
        users.append(user)
        profiles.append(profile)
    
    db_session.commit()
    return users, profiles


@pytest.fixture
def auth_headers(test_users, db_session: Session):
    """Create authentication headers for test users."""
    users, _ = test_users
    headers = {}
    
    for i, user in enumerate(users):
        token = create_access_token(user_id=user.id, db=db_session)
        headers[f"user{i+1}"] = {"Authorization": f"Bearer {token}"}
    
    return headers


class TestFeed:
    """Test feed endpoint functionality."""
    
    def test_feed_returns_active_profiles(self, test_users, auth_headers):
        """Test that feed returns only active profiles excluding current user."""
        users, profiles = test_users
        headers = auth_headers["user1"]
        
        response = client.get("/likes/feed", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "profiles" in data
        assert "total" in data
        assert "page" in data
        assert "size" in data
        assert "has_next" in data
        assert "has_prev" in data
        
        # Should return 3 profiles (excluding current user)
        assert len(data["profiles"]) == 3
        assert data["total"] == 3
        
        # Check that current user is not in feed
        user_ids_in_feed = [profile["user_id"] for profile in data["profiles"]]
        assert users[0].id not in user_ids_in_feed
        
        # Check returned fields
        profile = data["profiles"][0]
        expected_fields = {"id", "user_id", "display_name", "gender", "avatar_url", "favorite_joke"}
        assert set(profile.keys()) == expected_fields
    
    def test_feed_pagination(self, test_users, auth_headers):
        """Test feed pagination functionality."""
        headers = auth_headers["user1"]
        
        # Test first page
        response = client.get("/likes/feed?page=1&size=2", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["profiles"]) == 2
        assert data["page"] == 1
        assert data["size"] == 2
        assert data["has_next"] is True
        assert data["has_prev"] is False
        
        # Test second page
        response = client.get("/likes/feed?page=2&size=2", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["profiles"]) == 1
        assert data["page"] == 2
        assert data["size"] == 2
        assert data["has_next"] is False
        assert data["has_prev"] is True
    
    def test_feed_excludes_inactive_profiles(self, test_users, auth_headers, db_session):
        """Test that feed excludes inactive profiles."""
        users, profiles = test_users
        headers = auth_headers["user1"]
        
        # Deactivate one profile
        profiles[1].is_active = False
        db_session.commit()
        
        response = client.get("/likes/feed", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        # Should return only 2 profiles now (excluding current user and inactive user)
        assert len(data["profiles"]) == 2
        assert data["total"] == 2
        
        # Check inactive user is not in feed
        user_ids_in_feed = [profile["user_id"] for profile in data["profiles"]]
        assert profiles[1].user_id not in user_ids_in_feed


class TestLikes:
    """Test like creation functionality."""
    
    def test_create_like_success(self, test_users, auth_headers):
        """Test successful like creation."""
        users, profiles = test_users
        headers = auth_headers["user1"]
        target_id = users[1].id
        
        response = client.post(f"/likes/{target_id}", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["liker_id"] == users[0].id
        assert data["target_id"] == target_id
        assert data["mutual"] is False
        assert "created_at" in data
    
    def test_create_like_idempotent(self, test_users, auth_headers, db_session):
        """Test that liking the same user twice is idempotent."""
        users, profiles = test_users
        headers = auth_headers["user1"]
        target_id = users[1].id
        
        # Create first like
        response1 = client.post(f"/likes/{target_id}", headers=headers)
        assert response1.status_code == 200
        like1_id = response1.json()["id"]
        
        # Create second like (should return same like)
        response2 = client.post(f"/likes/{target_id}", headers=headers)
        assert response2.status_code == 200
        like2_id = response2.json()["id"]
        
        # Should be the same like
        assert like1_id == like2_id
        
        # Check only one like exists in database
        likes = db_session.query(Like).filter(
            Like.liker_id == users[0].id,
            Like.target_id == target_id
        ).all()
        assert len(likes) == 1
    
    def test_create_mutual_like(self, test_users, auth_headers, db_session):
        """Test that mutual likes are marked as matches."""
        users, profiles = test_users
        headers1 = auth_headers["user1"]
        headers2 = auth_headers["user2"]
        
        # User1 likes User2
        response1 = client.post(f"/likes/{users[1].id}", headers=headers1)
        assert response1.status_code == 200
        assert response1.json()["mutual"] is False
        
        # User2 likes User1 (should create mutual match)
        response2 = client.post(f"/likes/{users[0].id}", headers=headers2)
        assert response2.status_code == 200
        assert response2.json()["mutual"] is True
        
        # Check first like is now mutual
        response1_check = client.post(f"/likes/{users[1].id}", headers=headers1)
        assert response1_check.json()["mutual"] is True
    
    def test_like_inactive_profile(self, test_users, auth_headers, db_session):
        """Test that liking inactive profile fails."""
        users, profiles = test_users
        headers = auth_headers["user1"]
        
        # Deactivate target profile
        profiles[1].is_active = False
        db_session.commit()
        
        response = client.post(f"/likes/{users[1].id}", headers=headers)
        assert response.status_code == 404
        assert "not found or inactive" in response.json()["detail"].lower()
    
    def test_like_self(self, test_users, auth_headers):
        """Test that liking yourself fails."""
        users, profiles = test_users
        headers = auth_headers["user1"]
        
        response = client.post(f"/likes/{users[0].id}", headers=headers)
        assert response.status_code == 400
        assert "cannot like yourself" in response.json()["detail"].lower()
    
    def test_like_nonexistent_user(self, test_users, auth_headers):
        """Test that liking non-existent user fails."""
        headers = auth_headers["user1"]
        
        response = client.post("/likes/99999", headers=headers)
        assert response.status_code == 404
        assert "not found or inactive" in response.json()["detail"].lower()


class TestMatches:
    """Test matches retrieval functionality."""
    
    def test_get_mutual_matches(self, test_users, auth_headers, db_session):
        """Test retrieving mutual matches."""
        users, profiles = test_users
        headers1 = auth_headers["user1"]
        headers2 = auth_headers["user2"]
        
        # Create mutual match between user1 and user2
        client.post(f"/likes/{users[1].id}", headers=headers1)
        client.post(f"/likes/{users[0].id}", headers=headers2)
        
        # Get matches for user1
        response = client.get("/likes/matches", headers=headers1)
        assert response.status_code == 200
        
        data = response.json()
        assert "matches" in data
        assert "total" in data
        assert data["total"] == 1
        assert len(data["matches"]) == 1
        
        match = data["matches"][0]
        assert "matched_with" in match
        assert match["matched_with"]["user_id"] == users[1].id
        assert match["matched_with"]["display_name"] == profiles[1].display_name
        
        # Check minimal profile fields
        expected_fields = {"id", "user_id", "display_name", "avatar_url", "favorite_joke"}
        assert set(match["matched_with"].keys()) == expected_fields
    
    def test_get_no_matches(self, test_users, auth_headers):
        """Test retrieving matches when none exist."""
        headers = auth_headers["user1"]
        
        response = client.get("/likes/matches", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["matches"] == []
        assert data["total"] == 0
    
    def test_one_way_like_not_match(self, test_users, auth_headers):
        """Test that one-way likes are not returned as matches."""
        users, profiles = test_users
        headers1 = auth_headers["user1"]
        
        # User1 likes User2, but User2 doesn't like back
        client.post(f"/likes/{users[1].id}", headers=headers1)
        
        # Get matches for user1
        response = client.get("/likes/matches", headers=headers1)
        assert response.status_code == 200
        
        data = response.json()
        assert data["matches"] == []
        assert data["total"] == 0


class TestProfileClosure:
    """Test profile closure functionality."""
    
    def test_close_profile(self, test_users, auth_headers, db_session):
        """Test closing a profile."""
        users, profiles = test_users
        headers = auth_headers["user1"]
        
        response = client.post("/settings/close-profile", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["is_active"] is False
        assert "closed successfully" in data["message"].lower()
        
        # Check profile is actually closed in database
        db_session.refresh(profiles[0])
        assert profiles[0].is_active is False
    
    def test_closed_profile_excluded_from_feed(self, test_users, auth_headers, db_session):
        """Test that closed profiles are excluded from feed."""
        users, profiles = test_users
        headers1 = auth_headers["user1"]
        headers2 = auth_headers["user2"]
        
        # Close user1's profile
        client.post("/settings/close-profile", headers=headers1)
        
        # Check feed from user2's perspective
        response = client.get("/likes/feed", headers=headers2)
        assert response.status_code == 200
        
        data = response.json()
        user_ids_in_feed = [profile["user_id"] for profile in data["profiles"]]
        assert users[0].id not in user_ids_in_feed
    
    def test_cannot_like_closed_profile(self, test_users, auth_headers, db_session):
        """Test that closed profiles cannot be liked."""
        users, profiles = test_users
        headers1 = auth_headers["user1"]
        headers2 = auth_headers["user2"]
        
        # Close user1's profile
        client.post("/settings/close-profile", headers=headers1)
        
        # Try to like closed profile
        response = client.post(f"/likes/{users[0].id}", headers=headers2)
        assert response.status_code == 404
        assert "not found or inactive" in response.json()["detail"].lower()


class TestIntegration:
    """Integration tests for the complete workflow."""
    
    def test_complete_like_match_workflow(self, test_users, auth_headers, db_session):
        """Test complete workflow: feed -> like -> mutual like -> matches."""
        users, profiles = test_users
        headers1 = auth_headers["user1"]
        headers2 = auth_headers["user2"]
        
        # Step 1: Check feed contains user2 for user1
        response = client.get("/likes/feed", headers=headers1)
        assert response.status_code == 200
        user_ids = [p["user_id"] for p in response.json()["profiles"]]
        assert users[1].id in user_ids
        
        # Step 2: User1 likes User2
        response = client.post(f"/likes/{users[1].id}", headers=headers1)
        assert response.status_code == 200
        assert response.json()["mutual"] is False
        
        # Step 3: Check no matches yet
        response = client.get("/likes/matches", headers=headers1)
        assert response.status_code == 200
        assert response.json()["total"] == 0
        
        # Step 4: User2 likes User1 (creates mutual match)
        response = client.post(f"/likes/{users[0].id}", headers=headers2)
        assert response.status_code == 200
        assert response.json()["mutual"] is True
        
        # Step 5: Check both users have matches
        for headers in [headers1, headers2]:
            response = client.get("/likes/matches", headers=headers)
            assert response.status_code == 200
            assert response.json()["total"] == 1
            assert len(response.json()["matches"]) == 1
        
        # Step 6: Close user1's profile
        response = client.post("/settings/close-profile", headers=headers1)
        assert response.status_code == 200
        
        # Step 7: User1 should no longer be in feed
        response = client.get("/likes/feed", headers=headers2)
        assert response.status_code == 200
        user_ids = [p["user_id"] for p in response.json()["profiles"]]
        assert users[0].id not in user_ids