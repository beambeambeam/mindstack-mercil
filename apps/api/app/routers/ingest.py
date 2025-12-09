"""Ingestion router to load mock data into the database."""

from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.core.config.logging import get_logger
from app.db import get_session
from app.services.ingest_service import ingest_from_payload

logger = get_logger(__name__)

router = APIRouter(prefix="/ingest", tags=["ingest"])


@router.post("", status_code=202)
def ingest_data(
    payload: dict[str, Any] | None = None, session: Session = Depends(get_session)
) -> dict[str, int]:
    """
    Trigger ingestion of mock data.

    If payload contains `asset_types` and `assets`, use them; otherwise load
    from `apps/api/data/asset_type_rows.json` and `apps/api/data/assets_rows.json`.
    """
    try:
        asset_types = None
        assets = None
        embed = True
        if payload:
            asset_types = payload.get("asset_types")
            assets = payload.get("assets")
            embed = payload.get("embed", True)

        result = ingest_from_payload(
            session,
            asset_types=asset_types,
            assets=assets,
            embed=bool(embed),
            base_path=Path(__file__).resolve().parents[2] / "data",
        )
        return result
    except FileNotFoundError as exc:
        logger.error("Ingestion failed: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("Unexpected ingestion error: %s", exc)
        raise HTTPException(status_code=500, detail="Ingestion failed.") from exc
