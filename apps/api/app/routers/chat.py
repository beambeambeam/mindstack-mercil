"""Chat router for RAG chatbot endpoint."""

from fastapi import APIRouter, HTTPException

from app.core.config.logging import get_logger
from app.schemas.chat import ChatRequestSchema, ChatResponseSchema
from app.services import chat_service

logger = get_logger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponseSchema)
async def chat_with_bot(request: ChatRequestSchema) -> ChatResponseSchema:
    """Main endpoint for the RAG chatbot."""
    try:
        response_text = await chat_service.get_rag_response(request.message)
        return ChatResponseSchema(response_text=response_text)
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Error in /chat: {exc}")
        raise HTTPException(status_code=500, detail="Error communicating with chatbot.")
