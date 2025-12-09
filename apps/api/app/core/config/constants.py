"""Centralized application constants."""

# Model configuration
EMBEDDING_MODEL_NAME = "paraphrase-multilingual-mpnet-base-v2"
EMBEDDING_DIMENSION = 768
LLM_MODEL_NAME = "gemma3:4b"
PARSER_MODEL_NAME = "gemma3:4b"

# Search configuration
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
VECTOR_SEARCH_TOP_K = 3
GEOSPATIAL_RADIUS_METERS = 10000
LOCATION_DISTANCE_NORMALIZATION = 50000

# Recommendation configuration
ITEM_RECOMMENDATIONS_LIMIT = 5
USER_RECOMMENDATIONS_LIMIT = 10

# Recommendation algorithm weights
WEIGHT_PROPERTY_TYPE = 3.0
WEIGHT_PRICE = 2.0
WEIGHT_BEDROOMS = 1.5
WEIGHT_VECTOR = 1.0
WEIGHT_LOCATION = 0.5

# User action weights
ACTION_WEIGHT_CLICK = 1.0
ACTION_WEIGHT_SAVE = 3.0
ACTION_WEIGHTS = {"click": ACTION_WEIGHT_CLICK, "save": ACTION_WEIGHT_SAVE}

# Timeout configuration
OLLAMA_TIMEOUT_SECONDS = 10.0
GEOCODER_TIMEOUT_SECONDS = 5.0

# Batch processing
INGESTION_BATCH_SIZE = 100

# API configuration
API_VERSION = "v1"
API_TITLE = "PropTech AI Backend"
API_DESCRIPTION = "AI-powered property search and recommendations"
CORS_ORIGINS = ["*"]
