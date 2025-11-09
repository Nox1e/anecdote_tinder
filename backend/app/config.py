"""Configuration management for the application."""

from pathlib import Path
from typing import Any, Dict, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )
    
    # Application settings
    app_name: str = Field(default="FastAPI Backend", description="Application name")
    debug: bool = Field(default=False, description="Enable debug mode")
    version: str = Field(default="0.1.0", description="Application version")
    
    # Database settings
    database_url: str = Field(
        default="sqlite:///./data/app.db",
        description="Database connection URL"
    )
    
    # Security settings
    secret_key: str = Field(
        default="your-secret-key-change-in-production",
        description="Secret key for security"
    )
    
    # CORS settings
    cors_origins: list[str] = Field(
        default=["http://localhost:3000", "http://localhost:8080"],
        description="Allowed CORS origins"
    )
    
    # Server settings
    host: str = Field(default="0.0.0.0", description="Server host")
    port: int = Field(default=8000, description="Server port")
        
    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        # Ensure data directory exists for SQLite
        if self.database_url.startswith("sqlite:///"):
            db_path = Path(self.database_url.replace("sqlite:///", ""))
            db_path.parent.mkdir(parents=True, exist_ok=True)


# Global settings instance
settings = Settings()