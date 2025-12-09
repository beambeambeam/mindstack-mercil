"""
This is a temporary script to "unit test" our AI services
before running the full FastAPI server.

Run this from your terminal:
python test_services.py
"""

import asyncio
import sys
import os

# Add the project root directory to the Python path
# This allows us to import modules from the 'app' directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlmodel import Session
from app.services.database import engine, get_session
from app.api.schemas import SearchRequestSchema, SearchFilterSchema
from app.services import (
    parser_service,
    chat_service,
    recommend_service,
    search_service
)

# --- Database Session Setup ---
# We need to manually create a session for this script
try:
    db = next(get_session())
    print("✅ Database connection successful.")
except Exception as e:
    print(f"❌ DATABASE CONNECTION FAILED: {e}")
    print("Please check your .env file and ensure Supabase/Postgres is running.")
    sys.exit(1)

async def run_tests():
    
    print("\n--- 1. Testing Module 2: AI Parser (Ollama) ---")
    try:
        query_text = "คอนโด 2 ห้องนอน ใกล้ลาดพร้าว"
        print(f"Parsing query: '{query_text}'...")
        parsed_data = await parser_service.parse_query_to_json(query_text)
        print(f"✅ Parser Result: {parsed_data}")
        assert "semantic_query" in parsed_data
        assert "location_text" in parsed_data
        assert parsed_data["filters"]["bedrooms_min"] == 2
    except Exception as e:
        print(f"❌ PARSER TEST FAILED: {e}")
        print("--- Is your Ollama server running? (ollama run gemma3:4b) ---")


    print("\n--- 2. Testing Module 4: RAG Chatbot (LangChain + Ollama) ---")
    try:
        query_text = "What is the price of asset 8Z5956?"
        print(f"Asking chatbot: '{query_text}'...")
        response = await chat_service.get_rag_response(query_text)
        print(f"✅ Chatbot Response: {response}")
        assert "776" in response # 776,000
    except Exception as e:
        print(f"❌ CHATBOT TEST FAILED: {e}")


    print("\n--- 3. Testing Module 3: Recommendation Engine ---")
    try:
        # Test Item-Based
        asset_id = 14 # "Chewathai Ratchaprarop"
        print(f"Getting item recommendations for asset_id {asset_id}...")
        item_recs = recommend_service.get_item_recommendations(asset_id, db)
        print(f"✅ Item Recs: Found {len(item_recs)} similar items.")
        assert len(item_recs) > 0
        
        # Test User-Based (simulating a "save")
        client_id = "test-client-for-script"
        asset_id_to_save = 17 # A townhouse
        print(f"Simulating 'save' for asset {asset_id_to_save} by user {client_id}...")
        recommend_service.update_user_profile(client_id, asset_id_to_save, "save", db)
        
        print(f"Getting user recommendations for {client_id}...")
        user_recs = recommend_service.get_user_recommendations(client_id, db)
        print(f"✅ User Recs: Found {len(user_recs)} items.")
        assert len(user_recs) > 0
        print(f"(First recommendation is: {user_recs[0].name_th})")
        
    except Exception as e:
        print(f"❌ RECOMMENDATION TEST FAILED: {e}")


    print("\n--- 4. Testing Module 2 (Full): Hybrid Search Engine ---")
    try:
        # Create a mock search request
        mock_request = SearchRequestSchema(
            query_text="คอนโด 2 ห้องนอน ใกล้ ราชปรารภ",
            filters=SearchFilterSchema(price_max=6000000),
        )
        print(f"Running hybrid search for: '{mock_request.query_text}'...")
        results, pages = await search_service.hybrid_search(mock_request, db)
        print(f"✅ Hybrid Search: Found {len(results)} results.")
        assert len(results) > 0
        print(f"(Top result: {results[0].name_th})")
        
    except Exception as e:
        print(f"❌ HYBRID SEARCH TEST FAILED: {e}")


    print("\n--- ALL TESTS COMPLETE ---")
    db.close()


if __name__ == "__main__":
    print("--- STARTING AI SERVICE TEST RUNNER ---")
    # Make sure Ollama is running
    # Make sure DB is ingested
    
    # We use asyncio.run() because our parser/chat/search are async
    asyncio.run(run_tests())