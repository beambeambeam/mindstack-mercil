"""Recommendation router."""

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, status
from sqlmodel import Session

from app.core.config.logging import get_logger
from app.db import get_session
from app.schemas.search import AssetResultSchema, TrackActionSchema
from app.services import recommend_service

logger = get_logger(__name__)

router = APIRouter(prefix="/recommend", tags=["recommend"])


@router.get("/item/{asset_id}", response_model=list[AssetResultSchema])
async def recommend_item(
    asset_id: int, db: Session = Depends(get_session)
) -> list[AssetResultSchema]:
    """Get item-based recommendations."""
    try:
        results = recommend_service.get_item_recommendations(asset_id, db)
    except Exception as exc:  # noqa: BLE001
        logger.error("Error in /recommend/item/%s: %s", asset_id, exc)
        raise HTTPException(status_code=500, detail="Error generating item recommendations.")

    if not results:
        raise HTTPException(status_code=404, detail="No recommendations found.")
    return results


@router.get("/user", response_model=list[AssetResultSchema])
async def recommend_user(
    x_client_id: str = Header(..., alias="X-Client-ID"),
    db: Session = Depends(get_session),
) -> list[AssetResultSchema]:
    """Get user-based recommendations by profile vector."""
    try:
        return recommend_service.get_user_recommendations(x_client_id, db)
    except Exception as exc:  # noqa: BLE001
        logger.error("Error in /recommend/user for %s: %s", x_client_id, exc)
        return []


@router.post("/track", status_code=status.HTTP_202_ACCEPTED)
async def track_action(
    payload: TrackActionSchema,
    background_tasks: BackgroundTasks,
    x_client_id: str = Header(..., alias="X-Client-ID"),
    db: Session = Depends(get_session),
) -> dict[str, str]:
    """Track user action to update recommendation profile."""
    background_tasks.add_task(
        recommend_service.update_user_profile,
        client_id=x_client_id,
        asset_id=payload.asset_id,
        action_type=payload.action_type,
        db=db,
    )
    return {"status": "received"}
