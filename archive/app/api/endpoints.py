"""
This file defines all the FastAPI routers (API endpoints).
It connects the HTTP requests to the corresponding service functions.
All the "heavy lifting" (business logic) is in the /services directory.
"""

from fastapi import APIRouter, Depends, Header, HTTPException, BackgroundTasks, status
from sqlmodel import Session
from typing import List
from app.services import database
from app.services import search_service, recommend_service, chat_service
from app.api import schemas

# Create the main API router
router = APIRouter()

# --- Search Endpoint ---

@router.post("/search", response_model=schemas.SearchResponseSchema)
async def search_assets(
    request: schemas.SearchRequestSchema,
    db: Session = Depends(database.get_session)
):
    """
    Main Hybrid Search endpoint.
    Combines text, filters, and map search.
    """
    try:
        results, total_pages = await search_service.hybrid_search(request, db)
        return schemas.SearchResponseSchema(
            results=results, total_pages=total_pages
        )
    except Exception as e:
        print(f"Error in /search: {e}")
        raise HTTPException(status_code=500, detail="Internal server error in search.")

# --- Recommendation Endpoints ---

@router.get(
    "/recommend/item/{asset_id}", 
    response_model=List[schemas.AssetResultSchema]
)
async def recommend_similar_items(
    asset_id: int,
    db: Session = Depends(database.get_session)
):
    """
    Get item-based recommendations (e.g., "similar properties").
    """
    try:
        return recommend_service.get_item_recommendations(asset_id, db)
    except Exception as e:
        print(f"Error in /recommend/item: {e}")
        raise HTTPException(status_code=404, detail="Asset not found or error in recommendation.")

@router.get(
    "/recommend/user", 
    response_model=List[schemas.AssetResultSchema]
)
async def recommend_for_you(
    x_client_id: str = Header(..., alias="X-Client-ID"),
    db: Session = Depends(database.get_session)
):
    """
    Get user-based "For You" recommendations.
    Requires the X-Client-ID header.
    """
    if not x_client_id:
        raise HTTPException(status_code=400, detail="X-Client-ID header is required.")
        
    try:
        return recommend_service.get_user_recommendations(x_client_id, db)
    except Exception as e:
        print(f"Error in /recommend/user: {e}")
        # Return empty list on failure, e.g., new user
        return []

# --- Tracking Endpoint ---

@router.post("/track/action", status_code=status.HTTP_202_ACCEPTED)
async def track_user_action(
    request: schemas.TrackActionSchema,
    background_tasks: BackgroundTasks,
    x_client_id: str = Header(..., alias="X-Client-ID"),
    db: Session = Depends(database.get_session)
):
    """
    Tracks a user action (click or save) in the background.
    Responds immediately with 202 Accepted.
    """
    if not x_client_id:
        raise HTTPException(status_code=400, detail="X-Client-ID header is required.")
        
    background_tasks.add_task(
        recommend_service.update_user_profile,
        client_id=x_client_id,
        asset_id=request.asset_id,
        action_type=request.action_type,
        db=db
    )
    return {"status": "received"}

# --- Chatbot Endpoint ---

@router.post("/chat", response_model=schemas.ChatResponseSchema)
async def chat_with_bot(request: schemas.ChatRequestSchema):
    """
    Main endpoint for the RAG chatbot.
    """
    try:
        response_text = await chat_service.get_rag_response(request.message)
        return schemas.ChatResponseSchema(response_text=response_text)
    except Exception as e:
        print(f"Error in /chat: {e}")
        raise HTTPException(status_code=500, detail="Error communicating with chatbot.")