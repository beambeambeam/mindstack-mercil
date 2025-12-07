"""Health check router."""

import logging

from fastapi import APIRouter

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/health",
    tags=["health"],
)


@router.get("")
async def health_check():
    """Health check endpoint."""
    logger.debug("Health check endpoint accessed")
    return {"status": "healthy"}
