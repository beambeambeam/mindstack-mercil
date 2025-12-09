"""
RAG Chatbot service using LangChain to connect pgvector database to Ollama.
"""

import asyncio

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableLambda, RunnableParallel
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import ChatOllama
from langchain_postgres import PGVector

from app.core.config import settings
from app.core.config.constants import EMBEDDING_MODEL_NAME, LLM_MODEL_NAME
from app.core.config.logging import get_logger

logger = get_logger(__name__)


def format_docs(docs):
    """Format retrieved documents into a readable string."""
    formatted = []
    for doc in docs:
        asset_code = doc.metadata.get("asset_code", "")
        name = doc.metadata.get("name", "Unknown")
        price = doc.metadata.get("price", "N/A")
        bedrooms = doc.metadata.get("bedrooms", "N/A")

        if isinstance(price, (int, float)):
            price = f"{price:.2f}"

        header = f"Property: {name} (Asset Code: {asset_code})"
        footer = f"\nPrice: {price} baht | Bedrooms: {bedrooms}"

        formatted.append(f"{header}\n{doc.page_content}{footer}")

    return "\n\n---\n\n".join(formatted)


embeddings = None
llm = None
retriever = None
rag_chain = None

try:
    logger.info("Starting chat service initialization...")

    logger.info("Loading embeddings model...")
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
    logger.info("Embeddings loaded successfully")

    logger.info("Initializing ChatOllama...")
    llm = ChatOllama(model=LLM_MODEL_NAME, base_url=settings.OLLAMA_BASE_URL)
    logger.info("ChatOllama initialized successfully")

    logger.info("Initializing PGVector connection...")
    vector_store = PGVector(
        embeddings=embeddings,
        connection=settings.DATABASE_URL,
        collection_name="asset",
    )
    logger.info("PGVector connected successfully")

    retriever = vector_store.as_retriever(search_kwargs={"k": 3})
    logger.info("Retriever created successfully")

    template = """
    You are a helpful Thai real estate assistant.
    Answer the user's question based ONLY on the following context.
    If the information is not in the context, say "I'm sorry, I don't have that information."

    Context:
    {context}

    Question:
    {question}

    Answer:
    """
    prompt = PromptTemplate.from_template(template)
    logger.info("Prompt template created")

    logger.info("Building RAG chain...")

    def extract_question(input_dict):
        if isinstance(input_dict, dict):
            return input_dict.get("question", "")
        return input_dict

    rag_chain = (
        RunnableParallel(
            {
                "context": RunnableLambda(extract_question) | retriever | format_docs,
                "question": RunnableLambda(extract_question),
            }
        )
        | prompt
        | llm
        | StrOutputParser()
    )

    logger.info("RAG chain initialized successfully")

except Exception as e:
    logger.critical(f"CRITICAL ERROR during chat service initialization: {e}")
    logger.exception("Chat service initialization traceback:")
    rag_chain = None


async def get_rag_response(query: str) -> str:
    """
    Invokes the RAG chain to get a context-aware answer from the chatbot.

    Args:
        query: User's question/query string

    Returns:
        Response text from the chatbot
    """
    if rag_chain is None:
        logger.warning("RAG chain is None - service not available")
        return "I'm sorry, the chat service is not available."

    if retriever is None:
        logger.warning("Retriever is None - cannot search documents")
        return "I'm sorry, the chat service is not available."

    try:
        logger.info(f"Processing query: {query[:50]}...")

        response = await asyncio.get_event_loop().run_in_executor(
            None, lambda: rag_chain.invoke({"question": query})
        )
        logger.info("Query processed successfully")
        return response

    except Exception as e:
        logger.error(f"Error in RAG chain: {e}")
        logger.exception("RAG chain error traceback:")
        return "I'm sorry, I'm having trouble connecting to my brain right now."
