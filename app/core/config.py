"""
This file loads all environment variables from the .env file
into a Pydantic BaseSettings class for easy, type-safe access.
"""

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Main configuration settings for the application.
    Loads from .env file automatically.
    """
    DATABASE_URL: str
    OLLAMA_BASE_URL: str

    class Config:
        env_file = ".env"

# Create a single, globally accessible settings instance
settings = Settings()