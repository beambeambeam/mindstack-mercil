"""
Hybrid Search Service.
Combines vector search, attribute filtering, and geospatial filtering
into a single SQL query.
"""

from typing import Any

from geopy.exc import GeocoderUnavailable
from geopy.geocoders import Nominatim
from sentence_transformers import SentenceTransformer
from sqlalchemy.sql import text
from sqlmodel import Session

from app.core.config.logging import get_logger
from app.schemas.search import AssetResultSchema, SearchRequestSchema
from app.services.parser_service import parse_query_to_json

logger = get_logger(__name__)

# Load embedding model once on startup
try:
    model = SentenceTransformer("paraphrase-multilingual-mpnet-base-v2")
except Exception as e:
    logger.critical(f"Could not load sentence-transformer model: {e}")
    model = None

geolocator = Nominatim(user_agent="proptech-ai-backend")


def get_coords(location_text: str) -> tuple[float, float] | None:
    """Uses Nominatim to get (lat, lon) for a location name."""
    try:
        location = geolocator.geocode(f"{location_text}, Thailand")
        if location:
            return (location.latitude, location.longitude)
    except GeocoderUnavailable:
        logger.warning("Geocoder service is unavailable.")
    return None


def mock_image_url(asset_id: int, images_main_id: int | None) -> str:
    """Mocks an image URL for the frontend."""
    return f"https://placehold.co/600x400/EEE/333?text=Property+Image+{asset_id}"


async def hybrid_search(
    request: SearchRequestSchema, db: Session
) -> tuple[list[AssetResultSchema], int]:
    """
    Performs hybrid search combining:
    - Vector similarity (pgvector)
    - Text matching (ILIKE)
    - Attribute filters (price, bedrooms, asset_type)
    - Geospatial filters (PostGIS ST_DWithin)
    """
    if model is None:
        raise RuntimeError("Embedding model is not loaded.")

    # Parse query using Ollama
    if request.query_text:
        parsed_query = await parse_query_to_json(request.query_text)
    else:
        parsed_query = {
            "semantic_query": "",
            "location_text": None,
            "filters": {},
        }

    if not isinstance(parsed_query, dict):
        logger.warning(f"Parser returned non-dict: {repr(parsed_query)}. Using fallback.")
        parsed_query = {
            "semantic_query": request.query_text or "",
            "location_text": None,
            "filters": {},
        }

    # Generate query vector
    semantic_text = str(parsed_query.get("semantic_query") or request.query_text or "")
    query_vector = model.encode(semantic_text).tolist()

    # Geocode location
    location_coords = None
    location_text = parsed_query.get("location_text")
    if location_text and isinstance(location_text, str):
        location_coords = get_coords(location_text)

    # Combine filters from request and parser
    filters = request.filters
    raw_parsed_filters = parsed_query.get("filters")
    parsed_filters: dict[str, Any] = (
        raw_parsed_filters if isinstance(raw_parsed_filters, dict) else {}
    )

    # Build dynamic SQL query with hybrid scoring
    base_query = """
        SELECT
            assets.id,
            assets.asset_code,
            assets.name_th,
            assets.price,
            assets.images_main_id,
            assets.location_latitude,
            assets.location_longitude,
            (assets.asset_vector <=> :query_vector) AS vector_distance,
            CASE
                WHEN assets.name_th ILIKE '%' || :search_text || '%' THEN 1
                WHEN assets.description_th ILIKE '%' || :search_text || '%' THEN 2
                WHEN assets.description_en ILIKE '%' || :search_text || '%' THEN 2
                ELSE 3
            END AS text_match_rank
        FROM asset AS assets
        LEFT JOIN assettype ON assets.asset_type_id = assettype.id
    """

    count_query = (
        "SELECT COUNT(assets.id) FROM asset AS assets "
        "LEFT JOIN assettype ON assets.asset_type_id = assettype.id"
    )

    where_clauses = ["assets.asset_vector IS NOT NULL"]
    params: dict[str, Any] = {
        "query_vector": str(query_vector),
        "search_text": semantic_text,
        "limit": request.pagination.page_size,
        "offset": (request.pagination.page - 1) * request.pagination.page_size,
    }

    # Price filters
    if filters.price_min:
        where_clauses.append("assets.price >= :price_min")
        params["price_min"] = filters.price_min
    if filters.price_max:
        where_clauses.append("assets.price <= :price_max")
        params["price_max"] = filters.price_max

    # Bedrooms filter (from request or parsed)
    bedrooms = filters.bedrooms_min or parsed_filters.get("bedrooms_min")
    if bedrooms:
        where_clauses.append("assets.bedrooms >= :bedrooms_min")
        params["bedrooms_min"] = bedrooms

    # Asset type filter
    if filters.asset_type_id:
        where_clauses.append("assets.asset_type_id = ANY(:asset_type_id)")
        params["asset_type_id"] = filters.asset_type_id

    # Location filter (PostGIS) - 10km radius
    if location_coords:
        where_clauses.append(
            "ST_DWithin("
            "assets.location_geom::geography, "
            "ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, "
            "10000)"
        )
        params["lon"] = location_coords[1]
        params["lat"] = location_coords[0]

    # Combine WHERE clauses
    if where_clauses:
        where_string = " WHERE " + " AND ".join(where_clauses)
        base_query += where_string
        count_query += where_string

    # Add ORDER BY (hybrid scoring) and pagination
    final_query = text(
        base_query
        + " ORDER BY text_match_rank ASC, vector_distance ASC"
        + " LIMIT :limit OFFSET :offset"
    )

    # Execute count query (using execute for raw SQL text queries)
    count_params = params.copy()
    count_params.pop("limit", None)
    count_params.pop("offset", None)

    total_count_result = db.execute(text(count_query), count_params).scalar_one()
    total_pages = (total_count_result // request.pagination.page_size) + 1

    # Execute main search query
    results = db.execute(final_query, params).fetchall()

    # Format results
    formatted_results = [
        AssetResultSchema(
            id=row[0],
            asset_code=row[1],
            name_th=row[2],
            price=row[3],
            image_url=mock_image_url(row[0], row[4]),
            location_latitude=row[5],
            location_longitude=row[6],
        )
        for row in results
    ]

    return formatted_results, total_pages
