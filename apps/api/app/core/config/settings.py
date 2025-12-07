"""
Configuration settings loaded from environment variables.
Uses pydantic-settings for type-safe configuration management.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration settings."""

    # CORS Configuration
    cors_origins: str = "*"

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000

    # Database Configuration
    DATABASE_URL: str | None = None

    # Ollama Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # Logging Configuration
    log_level: str = "INFO"
    log_format: str = "standard"
    log_file: str | None = None
    log_rotation: str = "size"
    log_max_bytes: int = 10 * 1024 * 1024
    log_backup_count: int = 5
    log_when: str = "midnight"
    log_interval: int = 1

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins string into a list."""
        if self.cors_origins == "*":
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()
