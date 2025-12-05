"""
This file defines all the Pydantic models (schemas) that are used
for API request validation and response serialization.
This is the "API Contract" for the frontend.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal

# --- Search Schemas ---

class SearchFilterSchema(BaseModel):
    asset_type_id: Optional[List[int]] = None
    price_min: Optional[int] = None
    price_max: Optional[int] = None
    bedrooms_min: Optional[int] = None

class PaginationSchema(BaseModel):
    page: int = 1
    page_size: int = 20

class SearchRequestSchema(BaseModel):
    query_text: str = ""
    filters: SearchFilterSchema = Field(default_factory=SearchFilterSchema)
    pagination: PaginationSchema = Field(default_factory=PaginationSchema)

class AssetResultSchema(BaseModel):
    id: int
    asset_code: str
    name_th: Optional[str] = None
    price: Optional[float] = None
    image_url: str  # This will be a mocked URL
    location_latitude: Optional[float] = None
    location_longitude: Optional[float] = None
    
    class Config:
        from_attributes = True # for SQLModel compatibility

class SearchResponseSchema(BaseModel):
    results: List[AssetResultSchema]
    total_pages: int

# --- Recommendation Schemas ---

class TrackActionSchema(BaseModel):
    asset_id: int
    action_type: Literal["click", "save"]

# --- Chatbot Schemas ---

class ChatRequestSchema(BaseModel):
    message: str
    session_id: str # To maintain chat history (if needed later)

class ChatResponseSchema(BaseModel):
    response_text: str