"""Search router for hybrid search endpoint."""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.core.config.logging import get_logger
from app.db import get_session
from app.schemas.search import SearchRequestSchema, SearchResponseSchema
from app.services.search_service import hybrid_search

logger = get_logger(__name__)

router = APIRouter(
    prefix="/search",
    tags=["search"],
)


@router.post("", response_model=SearchResponseSchema)
async def search_assets(
    request: SearchRequestSchema,
    db: Session = Depends(get_session),
) -> SearchResponseSchema:
    """
    Hybrid search endpoint combining:
    - Vector similarity search
    - Text matching
    - Attribute filters
    - Geospatial filters
    """
    try:
        results, total_pages = await hybrid_search(request, db)
        return SearchResponseSchema(results=results, total_pages=total_pages)
    except RuntimeError as e:
        logger.error(f"Search service error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Error in /search: {e}")
        raise HTTPException(status_code=500, detail="Internal server error in search.")
