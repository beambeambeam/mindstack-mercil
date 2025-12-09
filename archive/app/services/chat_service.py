"""
RAG Chatbot. It uses LangChain to connect pg_vector database to Ollama.
"""

import asyncio
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import ChatOllama
from langchain_postgres import PGVector
from langchain_huggingface import HuggingFaceEmbeddings
from app.core.config import settings

# Helper function to format retrieved documents for the prompt
def format_docs(docs):
    """Format retrieved documents into a readable string."""
    formatted = []
    for doc in docs:
        asset_code = doc.metadata.get('asset_code', '')
        name = doc.metadata.get('name', 'Unknown')
        price = doc.metadata.get('price', 'N/A')
        bedrooms = doc.metadata.get('bedrooms', 'N/A')
        
        if isinstance(price, (int, float)):
            price = f"{price:.2f}"
        
        # Include asset code prominently so LLM can connect queries about asset codes
        header = f"Property: {name} (Asset Code: {asset_code})"
        footer = f"\nPrice: {price} baht | Bedrooms: {bedrooms}"
        
        formatted.append(f"{header}\n{doc.page_content}{footer}")
    
    return "\n\n---\n\n".join(formatted)

# 1. Initialize Components (on startup)
embeddings = None
llm = None
retriever = None
rag_chain = None

try:
    print("[ChatService] Starting initialization...")
    
    # Load the same embedding model used for ingestion
    print("[ChatService] Loading embeddings model...")
    embeddings = HuggingFaceEmbeddings(
        model_name='paraphrase-multilingual-mpnet-base-v2'
    )
    print("[ChatService] Embeddings loaded successfully")

    # Initialize the LLM
    print("[ChatService] Initializing ChatOllama...")
    llm = ChatOllama(model="gemma3:4b", base_url="http://localhost:11434")
    print("[ChatService] ChatOllama initialized successfully")

    # Initialize the PGVector connection
    print("[ChatService] Initializing PGVector connection...")
    vector_store = PGVector(
        embeddings=embeddings,
        connection=settings.DATABASE_URL,
        collection_name="asset",
    )
    print("[ChatService] PGVector connected successfully")
    
    retriever = vector_store.as_retriever(search_kwargs={'k': 3})  # Get top 3 results
    print("[ChatService] Retriever created successfully")

    # 2. Define the RAG Prompt Template
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
    print("[ChatService] Prompt template created")

    # 3. Create the LangChain RAG 
    # This chain is the core logic
    print("[ChatService] Building RAG chain...")
    
    # Define a chain that extracts just the question for retrieval
    from langchain_core.runnables import RunnableParallel, RunnableLambda
    
    # Extract the question string for the retriever
    def extract_question(input_dict):
        if isinstance(input_dict, dict):
            return input_dict.get("question", "")
        return input_dict
    
    rag_chain = RunnableParallel(
        {
            "context": RunnableLambda(extract_question) | retriever | format_docs,
            "question": RunnableLambda(extract_question)
        }
    ) | prompt | llm | StrOutputParser()
    
    print("[ChatService] ✓ RAG chain initialized successfully.")

except Exception as e:
    print(f"[ChatService] ✗ CRITICAL ERROR during initialization: {e}")
    import traceback
    traceback.print_exc()
    rag_chain = None

# 4. Define the service function
async def get_rag_response(query: str) -> str:
    """
    Invokes the RAG chain to get a safe, context-aware answer
    from the chatbot.
    """
    if rag_chain is None:
        print("[ChatService] RAG chain is None - service not available")
        return "I'm sorry, the chat service is not available."
    
    if retriever is None:
        print("[ChatService] Retriever is None - cannot search documents")
        return "I'm sorry, the chat service is not available."
        
    try:
        print(f"[ChatService] Processing query: {query[:50]}...")
        
        # Use .invoke via executor to avoid async issues
        response = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: rag_chain.invoke({"question": query})
        )
        print(f"[ChatService] Query processed successfully")
        return response
        
    except Exception as e:
        print(f"[ChatService] Error in RAG chain: {e}")
        import traceback
        traceback.print_exc()
        return "I'm sorry, I'm having trouble connecting to my brain right now."