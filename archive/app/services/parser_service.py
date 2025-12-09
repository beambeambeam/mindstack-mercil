"""
This service contains the logic for parsing natural language queries.
It uses an external Ollama server to run an LLM for entity extraction.
"""

import httpx
from app.core.config import settings
import json
from typing import Dict, Any

# Define the Ollama model and settings
OLLAMA_MODEL = "gemma3:4b" 
OLLAMA_URL = settings.OLLAMA_BASE_URL

# This is the master prompt for the parser
PARSER_PROMPT_TEMPLATE = """
You are a JSON-only API for a real estate search engine. A user provides a search query. Parse the query (which may be in Thai, English, or mixed) and extract the following entities.

JSON Schema:
{{
  "semantic_query": "string (the user's core intent, rephrased for search)",
  "location_text": "string (any identified location, e.g., 'Silom' or 'ลาดพร้าว')",
  "filters": {{
    "price_min": "integer",
    "price_max": "integer",
    "bedrooms_min": "integer"
  }}
}}

Rules:
- If a value is not found, set it to `null`.
- The `semantic_query` should be the full query, cleaned for embedding.
- Convert text prices (e.g., '5 ล้าน', '5m', '5 million') to integers (e.g., 5000000).
- Return ONLY the JSON object and nothing else.

User Query:
{user_query_text}
"""

async def parse_query_to_json(query_text: str) -> Dict[str, Any]:
    """
    Calls the Ollama server to parse the user's query text into a
    structured JSON object. Includes robust error handling and defaults.
    """
    
    # 1. Define Defaults 
    default_response = {
        "semantic_query": query_text, # Fallback: use original text if AI fails
        "location_text": None,
        "filters": {}
    }

    # Format the prompt
    full_prompt = PARSER_PROMPT_TEMPLATE.format(user_query_text=query_text)
    
    request_body = {
        "model": OLLAMA_MODEL,
        "prompt": full_prompt,
        "format": "json",
        "stream": False
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Check if Ollama is actually running first
            try:
                await client.get(OLLAMA_URL)
            except httpx.RequestError:
                print(f"WARNING: Ollama is NOT running at {OLLAMA_URL}. Using fallback.")
                return default_response

            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json=request_body
            )
            response.raise_for_status()
            
            ollama_response = response.json()
            json_string = ollama_response.get("response", "{}")
            
            # Parse the inner JSON string
            parsed_data = json.loads(json_string)
            
            # 2. Merge Defaults with AI Result
            final_data = default_response.copy()
            final_data.update({k: v for k, v in parsed_data.items() if v is not None})
            
            return final_data

    except (httpx.RequestError, json.JSONDecodeError) as e:
        print(f"Error calling Ollama parser: {e}")
        return default_response