"""Database engine and session management."""

from sqlmodel import Session, create_engine

from app.core.config import settings

if not settings.DATABASE_URL:
    raise ValueError("DATABASE_URL must be set in environment variables")

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=False,
)


def get_session():
    """FastAPI dependency to get a database session for each request."""
    with Session(engine) as session:
        yield session
