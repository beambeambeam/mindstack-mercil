"""
Main FastAPI application file.
This file initializes the FastAPI app, sets up CORS,
includes the API routers, and defines startup events.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router
from app.services.database import create_db_and_tables

# --- App Initialization ---
app = FastAPI(
    title="Mercil AI Backend",
    description="API for AI-powered property search and recommendations.",
    version="1.0.0"
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for development
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods
    allow_headers=["*"], # Allow all headers
)

# --- Startup Event ---
@app.on_event("startup")
def on_startup():
    """
    This function runs once when the server starts.
    It creates the database tables if they don't exist.
    """
    print("Server is starting up...")
    try:
        create_db_and_tables()
        print("Database tables checked/created.")
    except Exception as e:
        print(f"FATAL ERROR: Could not connect to database on startup.")
        print(f"Error: {e}")
        # In a real app, you might want to exit if DB connection fails
        # For now, we'll just print the error.

# --- Include API Router ---
app.include_router(api_router, prefix="/api")

# --- Root Endpoint ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the PropTech AI Backend. See /docs for API."}