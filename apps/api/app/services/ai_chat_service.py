"""
Basic AI chat service using LangChain ChatOllama for general questions.
Maintains conversation history per session.
"""

import asyncio

from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_ollama import ChatOllama

from app.core.config import settings
from app.core.config.constants import LLM_MODEL_NAME
from app.core.config.logging import get_logger

logger = get_logger(__name__)

llm = None
chat_chain = None

conversation_history: dict[str, list] = {}

try:
    logger.info("Starting AI chat service initialization...")

    logger.info("Initializing ChatOllama for AI chat...")
    llm = ChatOllama(model=LLM_MODEL_NAME, base_url=settings.OLLAMA_BASE_URL)
    logger.info("ChatOllama initialized successfully")

    system_prompt = """คุณเป็นผู้ช่วย AI ที่เชี่ยวชาญด้านการประมูลอสังหาริมทรัพย์ในประเทศไทย
คุณช่วยตอบคำถามทั่วไปเกี่ยวกับ:
- ขั้นตอนการประมูลอสังหาริมทรัพย์
- วิธีการเข้าร่วมประมูล
- เอกสารที่จำเป็น
- คำถามทั่วไปเกี่ยวกับอสังหาริมทรัพย์

ตอบคำถามเป็นภาษาไทยอย่างเป็นมิตรและชัดเจน"""

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{question}"),
        ]
    )

    chat_chain = prompt | llm | StrOutputParser()
    logger.info("AI chat chain initialized successfully")

except Exception as e:
    logger.critical(f"CRITICAL ERROR during AI chat service initialization: {e}")
    logger.exception("AI chat service initialization traceback:")
    chat_chain = None


def get_conversation_history(session_id: str) -> list:
    """Get conversation history for a session."""
    return conversation_history.get(session_id, [])


def add_to_history(session_id: str, human_message: str, ai_message: str) -> None:
    """Add messages to conversation history."""
    if session_id not in conversation_history:
        conversation_history[session_id] = []

    conversation_history[session_id].append(HumanMessage(content=human_message))
    conversation_history[session_id].append(AIMessage(content=ai_message))


async def get_ai_response(query: str, session_id: str | None = None) -> str:
    """
    Get AI response for a general question with conversation history.

    Args:
        query: User's question/query string
        session_id: Optional session ID for maintaining conversation history

    Returns:
        Response text from the AI chatbot
    """
    if chat_chain is None:
        logger.warning("Chat chain is None - service not available")
        return "ขออภัย บริการแชท AI ยังไม่พร้อมใช้งานในขณะนี้"

    if llm is None:
        logger.warning("LLM is None - cannot generate response")
        return "ขออภัย บริการแชท AI ยังไม่พร้อมใช้งานในขณะนี้"

    try:
        logger.info(f"Processing AI chat query: {query[:50]}... (session: {session_id})")

        history = []
        if session_id:
            history = get_conversation_history(session_id)

        response = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: chat_chain.invoke({"question": query, "history": history}),
        )

        logger.info("AI chat query processed successfully")

        if session_id:
            add_to_history(session_id, query, response)

        return response

    except Exception as e:
        logger.error(f"Error in AI chat chain: {e}")
        logger.exception("AI chat chain error traceback:")
        return "ขออภัย เกิดข้อผิดพลาดในการประมวลผลคำถาม กรุณาลองใหม่อีกครั้ง"
