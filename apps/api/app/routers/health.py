"""Health check router."""

import time
from typing import Literal

import httpx
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.config.logging import get_logger
from app.schemas.health import (
    ApiStatus,
    DetailedHealthCheckResponse,
    HealthCheckResponse,
    ServiceStatus,
)
from app.services import chat_service

logger = get_logger(__name__)

router = APIRouter(
    prefix="/health",
    tags=["health"],
)


async def check_database() -> ServiceStatus:
    """Check PostgreSQL database connection."""
    if not settings.DATABASE_URL:
        return ServiceStatus(
            status="unhealthy",
            error="DATABASE_URL not configured",
            response_time_ms=0.0,
        )

    start_time = time.time()
    try:
        engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        response_time = (time.time() - start_time) * 1000
        return ServiceStatus(
            status="healthy",
            response_time_ms=round(response_time, 2),
        )
    except SQLAlchemyError as e:
        response_time = (time.time() - start_time) * 1000
        logger.error(f"Database health check failed: {e}")
        return ServiceStatus(
            status="unhealthy",
            error=str(e),
            response_time_ms=round(response_time, 2),
        )
    except Exception as e:
        response_time = (time.time() - start_time) * 1000
        logger.error(f"Database health check unexpected error: {e}")
        return ServiceStatus(
            status="unhealthy",
            error=f"Unexpected error: {str(e)}",
            response_time_ms=round(response_time, 2),
        )


async def check_ollama() -> ServiceStatus:
    """Check Ollama service connection."""
    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            response_time = (time.time() - start_time) * 1000

            if response.status_code == 200:
                return ServiceStatus(
                    status="healthy",
                    response_time_ms=round(response_time, 2),
                )
            return ServiceStatus(
                status="unhealthy",
                error=f"HTTP {response.status_code}",
                response_time_ms=round(response_time, 2),
            )
    except httpx.TimeoutException:
        response_time = (time.time() - start_time) * 1000
        logger.error("Ollama health check timeout")
        return ServiceStatus(
            status="unhealthy",
            error="Connection timeout",
            response_time_ms=round(response_time, 2),
        )
    except httpx.ConnectError as e:
        response_time = (time.time() - start_time) * 1000
        logger.error(f"Ollama health check connection error: {e}")
        return ServiceStatus(
            status="unhealthy",
            error=f"Connection failed: {str(e)}",
            response_time_ms=round(response_time, 2),
        )
    except Exception as e:
        response_time = (time.time() - start_time) * 1000
        logger.error(f"Ollama health check unexpected error: {e}")
        return ServiceStatus(
            status="unhealthy",
            error=f"Unexpected error: {str(e)}",
            response_time_ms=round(response_time, 2),
        )


async def check_chat_service() -> ServiceStatus:
    """Check chat/RAG readiness (retriever and chain)."""
    start_time = time.time()
    try:
        if chat_service.rag_chain is None:
            return ServiceStatus(
                status="unhealthy",
                error="RAG chain not initialized",
                response_time_ms=round((time.time() - start_time) * 1000, 2),
            )
        if chat_service.retriever is None:
            return ServiceStatus(
                status="unhealthy",
                error="Retriever not initialized",
                response_time_ms=round((time.time() - start_time) * 1000, 2),
            )
        return ServiceStatus(
            status="healthy",
            response_time_ms=round((time.time() - start_time) * 1000, 2),
        )
    except Exception as e:  # pragma: no cover - defensive
        logger.error(f"Chat service health check unexpected error: {e}")
        return ServiceStatus(
            status="unhealthy",
            error=f"Unexpected error: {str(e)}",
            response_time_ms=round((time.time() - start_time) * 1000, 2),
        )


@router.get("", response_model=HealthCheckResponse)
async def health_check() -> HealthCheckResponse:
    """Basic health check endpoint - checks if API is running."""
    logger.debug("Health check endpoint accessed")
    return HealthCheckResponse(
        status="healthy",
        service="api",
        timestamp=time.time(),
    )


@router.get(
    "/detailed",
    response_model=DetailedHealthCheckResponse,
    status_code=status.HTTP_200_OK,
    responses={
        503: {
            "description": "Service Unavailable - One or more services are unhealthy",
            "content": {
                "application/json": {
                    "example": {
                        "status": "unhealthy",
                        "timestamp": 1234567890.0,
                        "services": {
                            "api": {"status": "healthy", "service": "api"},
                            "database": {
                                "status": "unhealthy",
                                "error": "Connection failed",
                                "response_time_ms": 50.0,
                            },
                            "ollama": {
                                "status": "unhealthy",
                                "error": "Connection timeout",
                                "response_time_ms": 5000.0,
                            },
                        },
                    }
                }
            },
        }
    },
)
async def detailed_health_check() -> DetailedHealthCheckResponse:
    """Detailed health check endpoint - checks API, database, and Ollama."""
    logger.debug("Detailed health check endpoint accessed")

    api_status = ApiStatus(status="healthy", service="api")
    db_status = await check_database()
    ollama_status = await check_ollama()
    chat_status = await check_chat_service()

    overall_status: Literal["healthy", "degraded", "unhealthy"] = "healthy"
    unhealthy_count = sum(
        1
        for service_status in [db_status, ollama_status, chat_status]
        if service_status.status == "unhealthy"
    )
    if unhealthy_count == 3:
        overall_status = "unhealthy"
    elif unhealthy_count >= 1:
        overall_status = "degraded"

    health_response = DetailedHealthCheckResponse(
        status=overall_status,
        timestamp=time.time(),
        services={
            "api": api_status,
            "database": db_status,
            "ollama": ollama_status,
            "chat": chat_status,
        },
    )

    if overall_status == "unhealthy":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=health_response.model_dump(),
        )

    return health_response


# test
