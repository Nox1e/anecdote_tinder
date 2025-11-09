"""Authentication utilities for password hashing and token management."""

from datetime import datetime, timedelta
from typing import Optional

from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User
from app.models.session import Session as SessionModel


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate password hash."""
    return pwd_context.hash(password)


def create_access_token(user_id: int, db: Session) -> str:
    """Create a new session token for a user."""
    # Generate JWT token
    expire = datetime.utcnow() + timedelta(days=7)  # Token expires in 7 days
    to_encode = {"sub": str(user_id), "exp": expire}
    token = jwt.encode(to_encode, settings.secret_key, algorithm="HS256")
    
    # Store session in database
    session = SessionModel(
        token=token,
        user_id=user_id,
        expires_at=expire
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return token


def verify_token(token: str, db: Session) -> Optional[User]:
    """Verify a token and return the associated user if valid."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None
    
    # Check if session exists and is not expired
    session = db.query(SessionModel).filter(
        SessionModel.token == token,
        SessionModel.expires_at > datetime.utcnow()
    ).first()
    
    if not session:
        return None
    
    # Get user
    user = db.query(User).filter(User.id == int(user_id)).first()
    return user


def revoke_token(token: str, db: Session) -> bool:
    """Revoke a session token."""
    session = db.query(SessionModel).filter(SessionModel.token == token).first()
    if session:
        db.delete(session)
        db.commit()
        return True
    return False


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate a user with email and password."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user