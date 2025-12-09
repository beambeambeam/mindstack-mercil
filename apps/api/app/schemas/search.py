"""Search request and response schemas for hybrid search API."""

from typing import Literal

from pydantic import BaseModel, Field


class SearchFilterSchema(BaseModel):
    """Filters for search queries."""

    asset_type_id: list[int] | None = None
    price_min: int | None = None
    price_max: int | None = None
    bedrooms_min: int | None = None


class PaginationSchema(BaseModel):
    """Pagination parameters."""

    page: int = 1
    page_size: int = 20


class SearchRequestSchema(BaseModel):
    """Request body for search endpoint."""

    query_text: str = ""
    filters: SearchFilterSchema = Field(default_factory=SearchFilterSchema)
    pagination: PaginationSchema = Field(default_factory=PaginationSchema)


class AssetResultSchema(BaseModel):
    """Single asset result in search response."""

    id: int
    asset_code: str
    name_th: str | None = None
    price: float | None = None
    image_url: str
    location_latitude: float | None = None
    location_longitude: float | None = None

    model_config = {"from_attributes": True}


class SearchResponseSchema(BaseModel):
    """Response body for search endpoint."""

    results: list[AssetResultSchema]
    total_pages: int


class TrackActionSchema(BaseModel):
    """Payload for tracking user actions that update recommendation profile."""

    asset_id: int
    action_type: Literal["click", "save"]
