"""Recommendation service: item-based, user-based, and profile updates."""

from typing import Literal

import numpy as np
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.sql import text
from sqlmodel import Session

from app.core.config.logging import get_logger
from app.models.asset import Asset
from app.models.user_profile import UserProfile
from app.schemas.search import AssetResultSchema
from app.services.search_service import mock_image_url

logger = get_logger(__name__)

ACTION_WEIGHTS: dict[Literal["click", "save"], float] = {"click": 1.0, "save": 3.0}


def get_item_recommendations(asset_id: int, db: Session) -> list[AssetResultSchema]:
    """Return similar assets using hybrid scoring (vector, type, price, bedrooms, location)."""
    query = text(
        """
        WITH target AS (
            SELECT
                asset_vector,
                price,
                bedrooms,
                asset_type_id,
                location_latitude,
                location_longitude
            FROM asset WHERE id = :asset_id
        )
        SELECT
            asset.id,
            asset.asset_code,
            asset.name_th,
            asset.price,
            asset.images_main_id,
            asset.location_latitude,
            asset.location_longitude,
            (
                1.0 * (1 - (asset.asset_vector <=> target.asset_vector)) +
                2.0 * CASE WHEN asset.asset_type_id = target.asset_type_id THEN 1 ELSE 0 END +
                1.5 * CASE
                    WHEN target.price > 0 THEN
                        1 - LEAST(ABS(asset.price - target.price) / target.price, 1.0)
                    ELSE 0
                END +
                1.5 * CASE
                    WHEN target.bedrooms > 0 THEN
                        1 - LEAST(ABS(asset.bedrooms - target.bedrooms) / target.bedrooms, 1.0)
                    ELSE 0
                END +
                0.5 * CASE
                    WHEN asset.location_latitude IS NOT NULL
                         AND asset.location_longitude IS NOT NULL
                         AND target.location_latitude IS NOT NULL
                         AND target.location_longitude IS NOT NULL THEN
                        GREATEST(
                            0,
                            1 - (
                                ST_Distance(
                                    ST_SetSRID(
                                        ST_MakePoint(
                                            asset.location_longitude,
                                            asset.location_latitude
                                        ),
                                        4326
                                    )::geography,
                                    ST_SetSRID(
                                        ST_MakePoint(
                                            target.location_longitude,
                                            target.location_latitude
                                        ),
                                        4326
                                    )::geography
                                ) / 50000
                            )
                        )
                    ELSE 0
                END
            ) AS similarity_score
        FROM asset, target
        WHERE asset.id != :asset_id
          AND asset.asset_vector IS NOT NULL
          AND asset.price > 0
        ORDER BY similarity_score DESC
        LIMIT 5
        """
    )

    rows = db.execute(query, {"asset_id": asset_id}).fetchall()

    return [
        AssetResultSchema(
            id=row[0],
            asset_code=row[1],
            name_th=row[2],
            price=row[3],
            image_url=mock_image_url(row[0], row[4]),
            location_latitude=row[5],
            location_longitude=row[6],
        )
        for row in rows
    ]


def get_user_recommendations(client_id: str, db: Session) -> list[AssetResultSchema]:
    """Return assets most similar to a user's profile vector."""
    query = text(
        """
        WITH user_vector AS (
            SELECT profile_vector FROM userprofile WHERE client_id = :client_id
        )
        SELECT
            assets.id,
            assets.asset_code,
            assets.name_th,
            assets.price,
            assets.images_main_id,
            assets.location_latitude,
            assets.location_longitude
        FROM asset AS assets, user_vector
        WHERE assets.asset_vector IS NOT NULL
          AND user_vector.profile_vector IS NOT NULL
        ORDER BY assets.asset_vector <=> user_vector.profile_vector
        LIMIT 10
        """
    )

    rows = db.execute(query, {"client_id": client_id}).fetchall()

    return [
        AssetResultSchema(
            id=row[0],
            asset_code=row[1],
            name_th=row[2],
            price=row[3],
            image_url=mock_image_url(row[0], row[4]),
            location_latitude=row[5],
            location_longitude=row[6],
        )
        for row in rows
    ]


def update_user_profile(client_id: str, asset_id: int, action_type: str, db: Session) -> None:
    """Update a user's profile vector via weighted average with the interacted asset."""
    action_weight = ACTION_WEIGHTS.get(action_type, 0.0)
    if action_weight == 0.0:
        logger.warning("Unknown action_type %s for client %s", action_type, client_id)
        return

    asset = db.get(Asset, asset_id)
    if not asset or asset.asset_vector is None or len(asset.asset_vector) == 0:
        return

    new_vector = np.array(asset.asset_vector)

    profile = db.get(UserProfile, client_id)
    if profile and profile.profile_vector:
        old_vector = np.array(profile.profile_vector)
        old_weight = profile.profile_weight
        new_weight = old_weight + action_weight
        updated_vector = ((old_vector * old_weight) + (new_vector * action_weight)) / new_weight

        profile.profile_vector = updated_vector.tolist()
        profile.profile_weight = new_weight
        db.add(profile)
    else:
        upsert_stmt = pg_insert(UserProfile).values(
            client_id=client_id,
            profile_vector=new_vector.tolist(),
            profile_weight=action_weight,
        )
        do_update_stmt = upsert_stmt.on_conflict_do_update(
            index_elements=[UserProfile.client_id],
            set_=dict(
                profile_vector=new_vector.tolist(),
                profile_weight=action_weight,
            ),
        )
        db.execute(do_update_stmt)

    try:
        db.commit()
    except Exception as exc:  # noqa: BLE001
        db.rollback()
        logger.error("Failed to update user profile for %s: %s", client_id, exc)
