"""
This file defines all database models 
and the logic for creating the database engine and sessions.
"""

from sqlmodel import SQLModel, Field, create_engine, Session
from app.core.config import settings
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, DateTime, Float, func, Text, Numeric, String
from geoalchemy2 import Geometry
from typing import Optional, List

# 1. Define SQLModel Table Models

class AssetType(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name_th: str
    name_en: str

class Asset(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    asset_code: str = Field(index=True)
    name_th: Optional[str] = Field(nullable=True)
    name_en: Optional[str] = Field(nullable=True)
    asset_type_id: Optional[int] = Field(default=None, foreign_key="assettype.id")
    
    price: Optional[float] = Field(sa_column=Column(Numeric, nullable=True))
    bedrooms: Optional[int] = Field(nullable=True)
    bathrooms: Optional[int] = Field(nullable=True)
    description_th: Optional[str] = Field(sa_column=Column(Text, nullable=True))
    description_en: Optional[str] = Field(sa_column=Column(Text, nullable=True))
    
    location_latitude: Optional[float] = Field(nullable=True)
    location_longitude: Optional[float] = Field(nullable=True)
    images_main_id: Optional[int] = Field(nullable=True)

    # Special Columns
    location_geom: Optional[str] = Field(
        sa_column=Column(Geometry('POINT', srid=4326), nullable=True)
    )
    asset_vector: Optional[List[float]] = Field(
        sa_column=Column(Vector(768), nullable=True)
    )

class UserProfile(SQLModel, table=True):
    client_id: str = Field(sa_column=Column(String, primary_key=True))
    profile_vector: Optional[List[float]] = Field(
        sa_column=Column(Vector(768), nullable=True)
    )
    profile_weight: float = Field(default=0.0)
    last_updated: Optional[str] = Field(
        sa_column=Column(DateTime(timezone=True), onupdate=func.now(), default=func.now())
    )

# 2. Create Database Engine
# The engine connects to the DB_URL from our settings
engine = create_engine(settings.DATABASE_URL)

# 3. Create All Tables Function
def create_db_and_tables():
    """
    One-time function to create all tables in the database.
    """
    SQLModel.metadata.create_all(engine)

# 4. Dependency for getting a DB session
def get_session():
    """
    FastAPI dependency to get a database session for each request.
    """
    with Session(engine) as session:
        yield session