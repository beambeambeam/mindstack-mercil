"""Chat request and response schemas for RAG chatbot API."""

from pydantic import BaseModel


class ChatRequestSchema(BaseModel):
    """Request body for chat endpoint."""

    message: str
    session_id: str | None = None


class ChatResponseSchema(BaseModel):
    """Response body for chat endpoint."""

    response_text: str
