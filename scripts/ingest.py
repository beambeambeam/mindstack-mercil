"""
This is the main runnable script for data ingestion.

It's designed to be run from the command line:
`python scripts/ingest.py`

This script imports the database session and the ingestion service
and runs the complete data loading and embedding process.
"""

import sys
import os
from sqlmodel import Session

# Add the project root directory to the Python path
# This allows us to import modules from the 'app' directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.database import engine, create_db_and_tables
from app.services.ingest_service import ingest_all_data

def main():
    print("--- Starting Data Ingestion Process ---")
    
    # 1. Ensure database and tables are created
    print("Checking database and tables...")
    try:
        create_db_and_tables()
        print("Database tables verified.")
    except Exception as e:
        print(f"FATAL ERROR: Could not connect to database or create tables.")
        print(f"Error: {e}")
        print("Please check your DATABASE_URL in the .env file and ensure PostgreSQL is running.")
        sys.exit(1)
    
    # 2. Run the ingestion logic
    # This will be a long-running process
    try:
        # We manually create a session for the script
        with Session(engine) as session:
            ingest_all_data(session)
        
        print("\n--- Data Ingestion Complete ---")
        print("You may now run 'uvicorn app.main:app --reload'")
        
    except Exception as e:
        print(f"\n--- FATAL ERROR DURING INGESTION ---")
        print(f"Error: {e}")
        sys.exit(1)

# Make the script runnable
if __name__ == "__main__":
    main()