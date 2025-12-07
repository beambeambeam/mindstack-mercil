"""Health check router."""

from app.core.config.logging import get_logger
from fastapi import APIRouter

logger = get_logger(__name__)

router = APIRouter(
    prefix="/health",
    tags=["health"],
)


@router.get("")
async def health_check():
    """Health check endpoint."""
    logger.debug("Health check endpoint accessed")
    return {"status": "healthy"}
