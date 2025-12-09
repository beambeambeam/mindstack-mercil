"""
This service contains the core logic for the Hybrid Search.
It combines vector search, attribute filtering, and geospatial filtering
into a single, powerful SQL query.
"""

from sqlmodel import Session
from sqlalchemy.sql import text
from app.api.schemas import SearchRequestSchema, AssetResultSchema
from app.services.parser_service import parse_query_to_json
from sentence_transformers import SentenceTransformer
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderUnavailable
from typing import List, Optional, Tuple, Dict, Any

# 1. Initialize models and services
# Load the embedding model once on startup
try:
    model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
except Exception as e:
    print(f"CRITICAL ERROR: Could not load sentence-transformer model. {e}")
    model = None

# Initialize geocoder
geolocator = Nominatim(user_agent="proptech-ai-backend")

def get_coords(location_text: str) -> Optional[Tuple[float, float]]:
    """
    Uses Nominatim to get (lat, lon) for a location name.
    """
    try:
        location = geolocator.geocode(f"{location_text}, Thailand")
        if location:
            return (location.latitude, location.longitude)
    except GeocoderUnavailable:
        print("Warning: Geocoder service is unavailable.")
        pass
    return None

def mock_image_url(asset_id: int, images_main_id: Optional[int]) -> str:
    """
    Mocks an image URL for the frontend.
    """
    return f"https://placehold.co/600x400/EEE/333?text=Property+Image+{asset_id}"

async def hybrid_search(
    request: SearchRequestSchema, db: Session
) -> Tuple[List[AssetResultSchema], int]:
    """
    Performs the main Hybrid Search.
    """
    if model is None:
        raise Exception("Embedding model is not loaded.")
        
    # 1. Parse the query_text using our Ollama parser
    if request.query_text:
        parsed_query = await parse_query_to_json(request.query_text)
    else:
        parsed_query = {
            "semantic_query": "",
            "location_text": None,
            "filters": {}
        }

    # Ensure parsed_query is a dict
    if not isinstance(parsed_query, dict):
        print(f"[search_service] Warning: parser returned non-dict: {repr(parsed_query)}. Using fallback.")
        parsed_query = {
            "semantic_query": request.query_text or "",
            "location_text": None,
            "filters": {}
        }

    # 2. Generate the query vector (use parser semantic_query if present,
    # otherwise fall back to the raw request text)
    semantic_text = parsed_query.get("semantic_query") or request.query_text or ""
    query_vector = model.encode(semantic_text).tolist()
    
    # 3. Geocode the location
    location_coords = None
    if parsed_query.get("location_text"):
        location_coords = get_coords(parsed_query["location_text"])

    # 4. Combine all filters (from request and from parser)
    filters = request.filters
    parsed_filters = parsed_query.get("filters", {})
    
    # 5. Build the dynamic SQL query with hybrid scoring
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
    
    count_query = "SELECT COUNT(assets.id) FROM asset AS assets LEFT JOIN assettype ON assets.asset_type_id = assettype.id"
    
    where_clauses = ["assets.asset_vector IS NOT NULL"] # Always require a vector
    params: Dict[str, Any] = {
        "query_vector": str(query_vector),
        "search_text": semantic_text, 
        "limit": request.pagination.page_size,
        "offset": (request.pagination.page - 1) * request.pagination.page_size
    }

    
    # Price filters
    if filters.price_min:
        where_clauses.append("assets.price >= :price_min")
        params["price_min"] = filters.price_min
    if filters.price_max:
        where_clauses.append("assets.price <= :price_max")
        params["price_max"] = filters.price_max
        
    # Bedrooms filter
    bedrooms = filters.bedrooms_min or parsed_filters.get("bedrooms_min")
    if bedrooms:
        where_clauses.append("assets.bedrooms >= :bedrooms_min")
        params["bedrooms_min"] = bedrooms

    # Asset Type filter
    if filters.asset_type_id:
        where_clauses.append("assets.asset_type_id = ANY(:asset_type_id)")
        params["asset_type_id"] = filters.asset_type_id
        
    # Location filter (PostGIS)
    if location_coords:
        where_clauses.append(
            "ST_DWithin(assets.location_geom::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, 10000)"
        ) # 10km radius = 10000 meters
        params["lon"] = location_coords[1]
        params["lat"] = location_coords[0]
        
    # -- Combine WHERE clauses --
    if where_clauses:
        where_string = " WHERE " + " AND ".join(where_clauses)
        base_query += where_string
        count_query += where_string
        
    # -- Add ORDER BY (hybrid scoring: text match + vector similarity) and Pagination --
    final_query = text(
        base_query + 
        " ORDER BY text_match_rank ASC, vector_distance ASC" +
        " LIMIT :limit OFFSET :offset"
    )

    # -- Execute the count query --
    # Remove pagination params for count
    count_params = params.copy()
    count_params.pop("limit", None)
    count_params.pop("offset", None)
    
    total_count_result = db.execute(text(count_query), count_params).scalar_one()
    total_pages = (total_count_result // request.pagination.page_size) + 1

    # -- Execute the main search query --
    results = db.execute(final_query, params).fetchall()

    # -- Format the results --
    formatted_results = [
        AssetResultSchema(
            id=row[0],
            asset_code=row[1],
            name_th=row[2],
            price=row[3],
            image_url=mock_image_url(row[0], row[4]),
            location_latitude=row[5],
            location_longitude=row[6]
        )
        for row in results
    ]

    return formatted_results, total_pages