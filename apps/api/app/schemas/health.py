"""Health check response schemas."""

from typing import Literal

from pydantic import BaseModel, Field


class ServiceStatus(BaseModel):
    """Status of an individual service."""

    status: Literal["healthy", "unhealthy"] = Field(
        ..., description="Service health status"
    )
    response_time_ms: float | None = Field(
        None, description="Response time in milliseconds"
    )
    error: str | None = Field(None, description="Error message if unhealthy")


class ApiStatus(BaseModel):
    """API service status."""

    status: Literal["healthy"] = Field(..., description="API health status")
    service: str = Field("api", description="Service name")


class HealthCheckResponse(BaseModel):
    """Basic health check response."""

    status: Literal["healthy"] = Field(..., description="Overall health status")
    service: str = Field(..., description="Service name")
    timestamp: float = Field(..., description="Unix timestamp of the check")


class DetailedHealthCheckResponse(BaseModel):
    """Detailed health check response with all services."""

    status: Literal["healthy", "degraded", "unhealthy"] = Field(
        ..., description="Overall health status"
    )
    timestamp: float = Field(..., description="Unix timestamp of the check")
    services: dict[str, ApiStatus | ServiceStatus] = Field(
        ..., description="Status of each service"
    )
