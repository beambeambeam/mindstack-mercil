"""
Application-wide constants and configuration values.
Centralizes all magic numbers and configuration for maintainability.
"""

# ============================================
# Model Configuration
# ============================================

EMBEDDING_MODEL_NAME = 'paraphrase-multilingual-mpnet-base-v2'
"""Sentence transformer model for generating property embeddings"""

EMBEDDING_DIMENSION = 768
"""Dimension of the embedding vectors"""

LLM_MODEL_NAME = 'gemma3:4b'
"""Large language model for RAG chatbot"""

PARSER_MODEL_NAME = 'gemma3:4b'
"""LLM model for natural language query parsing (same as chat for consistency)"""


# ============================================
# Search Configuration
# ============================================

DEFAULT_PAGE_SIZE = 20
"""Default number of results per page"""

MAX_PAGE_SIZE = 100
"""Maximum allowed results per page"""

VECTOR_SEARCH_TOP_K = 3
"""Number of similar documents to retrieve for RAG context"""

GEOSPATIAL_RADIUS_METERS = 10000
"""Default search radius in meters (10km)"""

LOCATION_DISTANCE_NORMALIZATION = 50000
"""Distance in meters used to normalize location similarity (50km)"""


# ============================================
# Recommendation Configuration
# ============================================

ITEM_RECOMMENDATIONS_LIMIT = 5
"""Number of similar items to recommend"""

USER_RECOMMENDATIONS_LIMIT = 10
"""Number of personalized recommendations for users"""


# ============================================
# Recommendation Algorithm Weights
# ============================================
# These weights determine the importance of each factor in recommendations
# Higher weights = more important in ranking

WEIGHT_PROPERTY_TYPE = 3.0
"""Weight for property type matching (CRITICAL - must be same type)"""

WEIGHT_PRICE = 2.0
"""Weight for price similarity (IMPORTANT)"""

WEIGHT_BEDROOMS = 1.5
"""Weight for bedroom count similarity (SOMEWHAT IMPORTANT)"""

WEIGHT_VECTOR = 1.0
"""Weight for semantic/vector similarity (TIEBREAKER)"""

WEIGHT_LOCATION = 0.5
"""Weight for geographic proximity (NICE TO HAVE)"""


# ============================================
# User Action Weights
# ============================================
# Weights for different user actions in profile building

ACTION_WEIGHT_CLICK = 1.0
"""Weight when user clicks on a property"""

ACTION_WEIGHT_SAVE = 3.0
"""Weight when user saves/favorites a property"""

ACTION_WEIGHTS = {
    "click": ACTION_WEIGHT_CLICK,
    "save": ACTION_WEIGHT_SAVE
}


# ============================================
# Timeout Configuration
# ============================================

OLLAMA_TIMEOUT_SECONDS = 10.0
"""Timeout for Ollama API calls"""

GEOCODER_TIMEOUT_SECONDS = 5.0
"""Timeout for geocoding service calls"""


# ============================================
# Batch Processing
# ============================================

INGESTION_BATCH_SIZE = 100
"""Number of assets to process before committing to database"""


# ============================================
# API Configuration
# ============================================

API_VERSION = "v1"
"""Current API version"""

API_TITLE = "PropTech AI Backend"
"""API title for documentation"""

API_DESCRIPTION = "AI-powered property search and recommendations"
"""API description for documentation"""

CORS_ORIGINS = ["*"]
"""Allowed CORS origins (use specific domains in production)"""
