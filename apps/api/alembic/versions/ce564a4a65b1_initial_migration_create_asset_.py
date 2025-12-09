"""Initial migration: create asset, assettype, and userprofile tables

Revision ID: ce564a4a65b1
Revises:
Create Date: 2025-12-07 16:33:24.033804
"""
from typing import Sequence, Union

import geoalchemy2
import pgvector.sqlalchemy
import sqlalchemy as sa
import sqlmodel
from alembic import op

revision: str = "ce564a4a65b1"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "assettype",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name_th", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("name_en", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "userprofile",
        sa.Column("client_id", sa.String(), nullable=False),
        sa.Column("profile_vector", pgvector.sqlalchemy.vector.VECTOR(dim=768), nullable=True),
        sa.Column("profile_weight", sa.Float(), nullable=False),
        sa.Column("last_updated", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("client_id"),
    )

    op.create_table(
        "asset",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("asset_code", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("name_th", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("name_en", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("asset_type_id", sa.Integer(), nullable=True),
        sa.Column("price", sa.Numeric(), nullable=True),
        sa.Column("bedrooms", sa.Integer(), nullable=True),
        sa.Column("bathrooms", sa.Integer(), nullable=True),
        sa.Column("description_th", sa.Text(), nullable=True),
        sa.Column("description_en", sa.Text(), nullable=True),
        sa.Column("location_latitude", sa.Float(), nullable=True),
        sa.Column("location_longitude", sa.Float(), nullable=True),
        sa.Column("images_main_id", sa.Integer(), nullable=True),
        sa.Column(
            "location_geom",
            geoalchemy2.types.Geometry(
                geometry_type="POINT",
                srid=4326,
                dimension=2,
                from_text="ST_GeomFromEWKT",
                name="geometry",
                spatial_index=False,
            ),
            nullable=True,
        ),
        sa.Column("asset_vector", pgvector.sqlalchemy.vector.VECTOR(dim=768), nullable=True),
        sa.ForeignKeyConstraint(["asset_type_id"], ["assettype.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index("idx_asset_location_geom", "asset", ["location_geom"], unique=False, postgresql_using="gist")
    op.create_index(op.f("ix_asset_asset_code"), "asset", ["asset_code"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_asset_asset_code"), table_name="asset")
    op.drop_index("idx_asset_location_geom", table_name="asset", postgresql_using="gist")
    op.drop_table("asset")
    op.drop_table("userprofile")
    op.drop_table("assettype")
