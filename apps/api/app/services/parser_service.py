"""
Query parsing service using Ollama LLM.
Parses natural language queries into structured search parameters.
"""

import json
from typing import Any

import httpx

from app.core.config import settings
from app.core.config.logging import get_logger

logger = get_logger(__name__)

OLLAMA_MODEL = "gemma3:4b"
OLLAMA_URL = settings.OLLAMA_BASE_URL

PARSER_PROMPT_TEMPLATE = (
    "You are a JSON-only API for a real estate search engine. "
    "A user provides a search query. "
    "Parse the query (which may be in Thai, English, or mixed) "
    "and extract the following entities.\n\n"
    "JSON Schema:\n"
    "{{\n"
    '  "semantic_query": "string (the user\'s core intent, rephrased for search)",\n'
    '  "location_text": "string (any identified location, e.g., \'Silom\' or \'ลาดพร้าว\')",\n'
    '  "filters": {{\n'
    '    "price_min": "integer",\n'
    '    "price_max": "integer",\n'
    '    "bedrooms_min": "integer"\n'
    "  }}\n"
    "}}\n\n"
    "Rules:\n"
    "- If a value is not found, set it to `null`.\n"
    "- The `semantic_query` should be the full query, cleaned for embedding.\n"
    "- Convert text prices (e.g., '5 ล้าน', '5m', '5 million') to integers (e.g., 5000000).\n"
    "- Return ONLY the JSON object and nothing else.\n\n"
    "User Query:\n"
    "{user_query_text}\n"
)


async def parse_query_to_json(query_text: str) -> dict[str, Any]:
    """
    Calls the Ollama server to parse the user's query text into a
    structured JSON object. Includes robust error handling and defaults.
    """
    default_response: dict[str, Any] = {
        "semantic_query": query_text,
        "location_text": None,
        "filters": {},
    }

    full_prompt = PARSER_PROMPT_TEMPLATE.format(user_query_text=query_text)

    request_body = {
        "model": OLLAMA_MODEL,
        "prompt": full_prompt,
        "format": "json",
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                await client.get(OLLAMA_URL)
            except httpx.RequestError:
                logger.warning(f"Ollama is NOT running at {OLLAMA_URL}. Using fallback.")
                return default_response

            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json=request_body,
            )
            response.raise_for_status()

            ollama_response = response.json()
            json_string = ollama_response.get("response", "{}")

            try:
                parsed_data = json.loads(json_string)
            except json.JSONDecodeError as e:
                logger.error(
                    f"Error parsing Ollama JSON response: {e}. "
                    f"Response: {json_string[:200]}"
                )
                return default_response

            final_data = default_response.copy()
            final_data.update({k: v for k, v in parsed_data.items() if v is not None})

            return final_data

    except httpx.RequestError as e:
        logger.error(f"Error calling Ollama parser (RequestError): {e}")
        return default_response
    except Exception as e:
        logger.error(f"Unexpected error in Ollama parser: {type(e).__name__}: {e}")
        return default_response
