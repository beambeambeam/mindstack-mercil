"""Asset and AssetType database models."""

from typing import Optional

from geoalchemy2 import Geometry
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, DateTime, Numeric, Text, func
from sqlmodel import Field, SQLModel


class AssetType(SQLModel, table=True):
    """Asset type model (e.g., Condo, House, Land)."""

    __tablename__ = "assettype"

    id: Optional[int] = Field(default=None, primary_key=True)
    name_th: str
    name_en: str


class Asset(SQLModel, table=True):
    """Asset model representing real estate properties."""

    __tablename__ = "asset"

    id: Optional[int] = Field(default=None, primary_key=True)
    asset_code: str = Field(index=True)
    name_th: Optional[str] = Field(default=None, nullable=True)
    name_en: Optional[str] = Field(default=None, nullable=True)
    asset_type_id: Optional[int] = Field(
        default=None, foreign_key="assettype.id", nullable=True
    )

    price: Optional[float] = Field(
        default=None, sa_column=Column(Numeric, nullable=True)
    )
    bedrooms: Optional[int] = Field(default=None, nullable=True)
    bathrooms: Optional[int] = Field(default=None, nullable=True)
    description_th: Optional[str] = Field(
        default=None, sa_column=Column(Text, nullable=True)
    )
    description_en: Optional[str] = Field(
        default=None, sa_column=Column(Text, nullable=True)
    )

    location_latitude: Optional[float] = Field(default=None, nullable=True)
    location_longitude: Optional[float] = Field(default=None, nullable=True)
    images_main_id: Optional[int] = Field(default=None, nullable=True)

    location_geom: Optional[str] = Field(
        default=None,
        sa_column=Column(Geometry("POINT", srid=4326), nullable=True),
    )
    asset_vector: Optional[list[float]] = Field(
        default=None, sa_column=Column(Vector(768), nullable=True)
    )
