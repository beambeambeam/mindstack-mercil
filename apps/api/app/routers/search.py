"""Search router for hybrid search endpoint."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.core.config.constants import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from app.core.config.logging import get_logger
from app.db import get_session
from app.schemas.search import (
    PaginationSchema,
    SearchFilterSchema,
    SearchRequestSchema,
    SearchResponseSchema,
)
from app.services.search_service import hybrid_search

logger = get_logger(__name__)

router = APIRouter(
    prefix="/search",
    tags=["search"],
)


@router.get("", response_model=SearchResponseSchema)
async def search_assets_get(
    query_text: str = "",
    price_min: int | None = None,
    price_max: int | None = None,
    bedrooms_min: int | None = None,
    asset_type_id: list[int] | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE),
    db: Session = Depends(get_session),
) -> SearchResponseSchema:
    """Hybrid search endpoint using query parameters."""
    try:
        request = SearchRequestSchema(
            query_text=query_text,
            filters=SearchFilterSchema(
                asset_type_id=asset_type_id,
                price_min=price_min,
                price_max=price_max,
                bedrooms_min=bedrooms_min,
            ),
            pagination=PaginationSchema(page=page, page_size=page_size),
        )
        results, total_pages = await hybrid_search(request, db)
        return SearchResponseSchema(results=results, total_pages=total_pages)
    except RuntimeError as e:
        logger.error(f"Search service error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Error in /search: {e}")
        raise HTTPException(status_code=500, detail="Internal server error in search.")


@router.post("", response_model=SearchResponseSchema)
async def search_assets_post(
    request: SearchRequestSchema,
    db: Session = Depends(get_session),
) -> SearchResponseSchema:
    """Hybrid search via JSON body."""
    try:
        results, total_pages = await hybrid_search(request, db)
        return SearchResponseSchema(results=results, total_pages=total_pages)
    except RuntimeError as e:
        logger.error(f"Search service error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Error in /search: {e}")
        raise HTTPException(status_code=500, detail="Internal server error in search.")
