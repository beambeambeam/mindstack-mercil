"""Health check router."""

import time
from typing import Literal

import httpx
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.config.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(
    prefix="/health",
    tags=["health"],
)


async def check_database() -> dict[str, str | float]:
    """Check PostgreSQL database connection."""
    if not settings.DATABASE_URL:
        return {
            "status": "unhealthy",
            "error": "DATABASE_URL not configured",
            "response_time_ms": 0.0,
        }

    start_time = time.time()
    try:
        engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        response_time = (time.time() - start_time) * 1000
        return {
            "status": "healthy",
            "response_time_ms": round(response_time, 2),
        }
    except SQLAlchemyError as e:
        response_time = (time.time() - start_time) * 1000
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "response_time_ms": round(response_time, 2),
        }
    except Exception as e:
        response_time = (time.time() - start_time) * 1000
        logger.error(f"Database health check unexpected error: {e}")
        return {
            "status": "unhealthy",
            "error": f"Unexpected error: {str(e)}",
            "response_time_ms": round(response_time, 2),
        }


async def check_ollama() -> dict[str, str | float]:
    """Check Ollama service connection."""
    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            response_time = (time.time() - start_time) * 1000

            if response.status_code == 200:
                return {
                    "status": "healthy",
                    "response_time_ms": round(response_time, 2),
                }
            return {
                "status": "unhealthy",
                "error": f"HTTP {response.status_code}",
                "response_time_ms": round(response_time, 2),
            }
    except httpx.TimeoutException:
        response_time = (time.time() - start_time) * 1000
        logger.error("Ollama health check timeout")
        return {
            "status": "unhealthy",
            "error": "Connection timeout",
            "response_time_ms": round(response_time, 2),
        }
    except httpx.ConnectError as e:
        response_time = (time.time() - start_time) * 1000
        logger.error(f"Ollama health check connection error: {e}")
        return {
            "status": "unhealthy",
            "error": f"Connection failed: {str(e)}",
            "response_time_ms": round(response_time, 2),
        }
    except Exception as e:
        response_time = (time.time() - start_time) * 1000
        logger.error(f"Ollama health check unexpected error: {e}")
        return {
            "status": "unhealthy",
            "error": f"Unexpected error: {str(e)}",
            "response_time_ms": round(response_time, 2),
        }


@router.get("")
async def health_check():
    """Basic health check endpoint - checks if API is running."""
    logger.debug("Health check endpoint accessed")
    return {
        "status": "healthy",
        "service": "api",
        "timestamp": time.time(),
    }


@router.get("/detailed")
async def detailed_health_check():
    """Detailed health check endpoint - checks API, database, and Ollama."""
    logger.debug("Detailed health check endpoint accessed")

    api_status = {
        "status": "healthy",
        "service": "api",
    }

    db_status = await check_database()
    ollama_status = await check_ollama()

    overall_status: Literal["healthy", "degraded", "unhealthy"] = "healthy"
    unhealthy_count = sum(
        1
        for status in [db_status["status"], ollama_status["status"]]
        if status == "unhealthy"
    )
    if unhealthy_count == 2:
        overall_status = "unhealthy"
    elif unhealthy_count == 1:
        overall_status = "degraded"

    health_response = {
        "status": overall_status,
        "timestamp": time.time(),
        "services": {
            "api": api_status,
            "database": db_status,
            "ollama": ollama_status,
        },
    }

    if overall_status == "unhealthy":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=health_response,
        )

    return health_response
