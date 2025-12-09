"""Data ingestion service for assets and asset types."""

from __future__ import annotations

import json
from collections.abc import Iterable
from pathlib import Path

from sentence_transformers import SentenceTransformer
from sqlalchemy.sql import text
from sqlmodel import Session

from app.core.config.logging import get_logger
from app.models.asset import Asset, AssetType

logger = get_logger(__name__)

MODEL_NAME = "paraphrase-multilingual-mpnet-base-v2"

try:
    embedding_model = SentenceTransformer(MODEL_NAME)
except Exception as exc:  # pragma: no cover - startup failure path
    logger.critical("Failed to load embedding model %s: %s", MODEL_NAME, exc)
    embedding_model = None


def load_json_file(path: Path) -> list[dict[str, object]]:
    """Load JSON file containing a list of dicts."""
    if not path.exists():
        raise FileNotFoundError(f"Missing file: {path}")
    with path.open("r", encoding="utf-8") as file:
        data = json.load(file)
    if not isinstance(data, list):
        raise ValueError(f"Expected list in {path}, got {type(data).__name__}")
    return data


def embed_record(doc: str) -> list[float] | None:
    """Encode text into a vector if the model is available."""
    if embedding_model is None:
        logger.error("Embedding model is not loaded; skipping vector generation.")
        return None
    return embedding_model.encode(doc).tolist()


def build_doc(record: dict[str, object]) -> str:
    """Create embedding text from asset fields."""
    name_th = str(record.get("name_th") or "")
    desc_th = str(record.get("asset_details_description_th") or record.get("description_th") or "")
    name_en = str(record.get("name_en") or "")
    desc_en = str(record.get("asset_details_description_en") or record.get("description_en") or "")
    return f"TH: {name_th} {desc_th} EN: {name_en} {desc_en}"


def to_int(value: object) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def to_float(value: object) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def upsert_asset_types(rows: Iterable[dict[str, object]], session: Session) -> int:
    """Insert or ignore asset types by id."""
    inserted = 0
    for row in rows:
        type_id = row.get("id")
        if type_id is None:
            continue
        existing = session.get(AssetType, type_id)
        if existing:
            continue
        session.add(
            AssetType(
                id=type_id,
                name_th=str(row.get("name_th") or ""),
                name_en=str(row.get("name_en") or ""),
            )
        )
        inserted += 1
    session.commit()
    return inserted


def upsert_assets(
    rows: Iterable[dict[str, object]], session: Session, *, embed: bool = True
) -> int:
    """Insert or update assets; compute vectors and update geom later."""
    processed = 0
    for idx, row in enumerate(rows, start=1):
        asset_id = row.get("id")
        existing = session.get(Asset, asset_id) if asset_id is not None else None

        price = to_float(row.get("asset_details_selling_price") or row.get("price"))
        bedrooms = to_int(row.get("asset_details_number_of_bedrooms") or row.get("bedrooms"))
        bathrooms = to_int(row.get("asset_details_number_of_bathrooms") or row.get("bathrooms"))

        doc = build_doc(row)
        vector = embed_record(doc) if embed else existing.asset_vector if existing else None

        payload = {
            "asset_code": str(row.get("asset_code") or ""),
            "name_th": str(row.get("name_th") or None) or None,
            "name_en": str(row.get("name_en") or None) or None,
            "asset_type_id": to_int(row.get("asset_type_id")),
            "price": price,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "description_th": row.get("asset_details_description_th") or row.get("description_th"),
            "description_en": row.get("asset_details_description_en") or row.get("description_en"),
            "location_latitude": to_float(row.get("location_latitude")),
            "location_longitude": to_float(row.get("location_longitude")),
            "images_main_id": to_int(row.get("images_main_id")),
            "asset_vector": vector,
        }

        if existing:
            for key, value in payload.items():
                setattr(existing, key, value)
        else:
            session.add(Asset(id=asset_id, **payload))

        processed += 1

        if idx % 100 == 0:
            session.commit()
            logger.info("Committed %s assets...", idx)

    session.commit()
    return processed


def update_geometry(session: Session) -> None:
    """Populate PostGIS geometry column from lat/lon."""
    session.execute(
        text(
            """
            UPDATE asset
            SET location_geom = ST_SetSRID(
                ST_MakePoint(location_longitude, location_latitude), 4326
            )
            WHERE location_longitude IS NOT NULL
              AND location_latitude IS NOT NULL
              AND location_geom IS NULL;
            """
        )
    )
    session.commit()


def ingest_from_payload(
    session: Session,
    *,
    asset_types: list[dict[str, object]] | None,
    assets: list[dict[str, object]] | None,
    embed: bool = True,
    base_path: Path | None = None,
) -> dict[str, int]:
    """Ingest from provided payload or fallback to files in base_path."""
    base_dir = base_path or Path(__file__).resolve().parents[2] / "data"
    types_data = asset_types or load_json_file(base_dir / "asset_type_rows.json")
    assets_data = assets or load_json_file(base_dir / "assets_rows.json")

    inserted_types = upsert_asset_types(types_data, session)
    processed_assets = upsert_assets(assets_data, session, embed=embed)
    update_geometry(session)

    return {
        "asset_types_inserted": inserted_types,
        "assets_processed": processed_assets,
    }
