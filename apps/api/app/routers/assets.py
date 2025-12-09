"""Asset CRUD router."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlmodel import Session, select

from app.core.config.logging import get_logger
from app.db import get_session
from app.models.asset import Asset
from app.schemas.asset import (
    AssetCreate,
    AssetListResponse,
    AssetResponse,
    AssetUpdate,
)
from app.services.ingest_service import build_doc, embed_record

logger = get_logger(__name__)

router = APIRouter(prefix="/assets", tags=["assets"])


def get_asset_or_404(asset_id: int, session: Session) -> Asset:
    asset = session.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


@router.get("", response_model=AssetListResponse)
def list_assets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    session: Session = Depends(get_session),
) -> AssetListResponse:
    offset = (page - 1) * page_size
    stmt = select(Asset).offset(offset).limit(page_size)
    items = session.exec(stmt).all()
    total = session.exec(select(func.count()).select_from(Asset)).one()
    return AssetListResponse(items=items, total=total)


@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: int, session: Session = Depends(get_session)) -> AssetResponse:
    return get_asset_or_404(asset_id, session)


@router.post("", response_model=AssetResponse, status_code=201)
def create_asset(payload: AssetCreate, session: Session = Depends(get_session)) -> AssetResponse:
    vector = embed_record(build_doc(payload.model_dump()))  # type: ignore[arg-type]
    asset = Asset(**payload.model_dump(), asset_vector=vector)
    session.add(asset)
    session.commit()
    session.refresh(asset)
    return asset


@router.put("/{asset_id}", response_model=AssetResponse)
def replace_asset(
    asset_id: int, payload: AssetCreate, session: Session = Depends(get_session)
) -> AssetResponse:
    asset = get_asset_or_404(asset_id, session)
    vector = embed_record(build_doc(payload.model_dump()))  # type: ignore[arg-type]
    for key, value in payload.model_dump().items():
        setattr(asset, key, value)
    asset.asset_vector = vector
    session.add(asset)
    session.commit()
    session.refresh(asset)
    return asset


@router.patch("/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: int, payload: AssetUpdate, session: Session = Depends(get_session)
) -> AssetResponse:
    asset = get_asset_or_404(asset_id, session)

    data = payload.model_dump(exclude_unset=True)
    skip_embedding = bool(data.pop("skip_embedding", False))

    for key, value in data.items():
        setattr(asset, key, value)

    if not skip_embedding:
        vector = embed_record(build_doc(asset.__dict__))
        asset.asset_vector = vector

    session.add(asset)
    session.commit()
    session.refresh(asset)
    return asset
