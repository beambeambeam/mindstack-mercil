"""User profile database model."""

from datetime import datetime
from typing import Optional

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, DateTime, String, func
from sqlmodel import Field, SQLModel


class UserProfile(SQLModel, table=True):
    """User profile model with vector embeddings for recommendations."""

    __tablename__ = "userprofile"

    client_id: str = Field(sa_column=Column(String, primary_key=True))
    profile_vector: Optional[list[float]] = Field(
        default=None, sa_column=Column(Vector(768), nullable=True)
    )
    profile_weight: float = Field(default=0.0)
    last_updated: Optional[datetime] = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True), onupdate=func.now(), default=func.now()
        ),
    )
