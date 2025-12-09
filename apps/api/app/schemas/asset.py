"""Schemas for Asset CRUD operations."""


from pydantic import BaseModel, Field


class AssetBase(BaseModel):
    asset_code: str = Field(min_length=1)
    name_th: str | None = None
    name_en: str | None = None
    asset_type_id: int | None = None
    price: float | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    description_th: str | None = None
    description_en: str | None = None
    location_latitude: float | None = None
    location_longitude: float | None = None
    images_main_id: int | None = None


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    asset_code: str | None = None
    name_th: str | None = None
    name_en: str | None = None
    asset_type_id: int | None = None
    price: float | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    description_th: str | None = None
    description_en: str | None = None
    location_latitude: float | None = None
    location_longitude: float | None = None
    images_main_id: int | None = None
    skip_embedding: bool = False


class AssetResponse(AssetBase):
    id: int

    model_config = {"from_attributes": True}


class AssetListResponse(BaseModel):
    items: list[AssetResponse]
    total: int


class AssetTypeResponse(BaseModel):
    id: int
    name_th: str
    name_en: str

    model_config = {"from_attributes": True}


class AssetTypeListResponse(BaseModel):
    items: list[AssetTypeResponse]
