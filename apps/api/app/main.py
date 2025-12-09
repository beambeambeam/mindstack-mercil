"""
Main FastAPI application file.
This file initializes the FastAPI app, sets up logging,
CORS middleware, and includes API routers.
"""

import time
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.config.logging import get_logger, setup_logging
from .routers import assets, chat, health, ingest, recommend, search

# Setup logging configuration
setup_logging()

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager for startup and shutdown events."""
    logger.info("Starting up application...")
    yield
    logger.info("Shutting down application...")


# Initialize FastAPI app
app = FastAPI(
    title="API Service",
    description="FastAPI service with logging and Swagger documentation",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware to log all HTTP requests with detailed information."""
    start_time = time.time()
    client_ip = request.client.host if request.client else "unknown"

    logger.info(
        "Request started",
        extra={
            "method": request.method,
            "path": request.url.path,
            "query_params": dict(request.query_params),
            "client_ip": client_ip,
            "user_agent": request.headers.get("user-agent"),
        },
    )

    try:
        response = await call_next(request)
        process_time = time.time() - start_time

        logger.info(
            "Request completed",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "process_time": round(process_time, 4),
                "client_ip": client_ip,
            },
        )

        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(
            "Request failed",
            extra={
                "method": request.method,
                "path": request.url.path,
                "error": str(e),
                "error_type": type(e).__name__,
                "process_time": round(process_time, 4),
                "client_ip": client_ip,
            },
            exc_info=True,
        )
        raise


# Include routers
app.include_router(health.router)
app.include_router(assets.router)
app.include_router(ingest.router)
app.include_router(recommend.router)
app.include_router(search.router)
app.include_router(chat.router)


@app.get("/")
async def read_root():
    """Root endpoint."""
    logger.info("Root endpoint accessed")
    return {"message": "Hello, World!", "status": "ok"}


if __name__ == "__main__":
    import uvicorn

    logger.info("Starting uvicorn server...")
    uvicorn.run(
        app,
        host=settings.host,
        port=settings.port,
        reload=False,
        log_level="info",
    )
