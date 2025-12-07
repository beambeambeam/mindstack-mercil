"""
This service contains the logic for the data ingestion pipeline.
It's called by the `scripts/ingest.py` file.
"""

import json
import os
from sqlmodel import Session, select
from app.services.database import AssetType, Asset
from sentence_transformers import SentenceTransformer
from sqlalchemy.sql import text
import sys

# Force PyTorch backend for sentence_transformers/transformers
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"

def ingest_all_data(db: Session):
    """
    Main ingestion function.
    Reads, embeds, and stores all data.
    """
    print("--- Starting Data Ingestion ---")

    # --- 1. Load JSON Files ---
    print("Loading data from JSON files...")
    project_root = os.path.join(os.path.dirname(__file__), '..', '..')
    asset_types_path = os.path.join(project_root, 'asset_type_rows.json')
    assets_path = os.path.join(project_root, 'assets_rows.json')
    try:
        with open(asset_types_path, 'r', encoding='utf-8') as f:
            asset_types = json.load(f)
        
        with open(assets_path, 'r', encoding='utf-8') as f:
            assets = json.load(f)
    except FileNotFoundError:
        print(f"ERROR: {asset_types_path} or {assets_path} not found.")
        print("Please place them in the project root directory.")
        sys.exit(1)

    print(f"Loaded {len(asset_types)} asset types and {len(assets)} assets.")

    # --- 2. Ingest Asset Types ---
    print("Ingesting asset types...")
    for at in asset_types:
        # Using merge to avoid duplicates on re-run
        db_asset_type = db.get(AssetType, at.get('id'))
        if not db_asset_type:
            db_asset_type = AssetType(**at)
            db.add(db_asset_type)
    db.commit()

    # --- 3. Load Embedding Model ---
    print("Loading sentence-transformer model (paraphrase-multilingual-mpnet-base-v2)...")
    model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
    print("Model loaded.")
    
    # --- 4. Ingest Assets ---
    print("Ingesting and embedding assets (this may take a while)...")
    
    assets_to_insert = []
    count = 0
    for i, asset in enumerate(assets):
        # Check if asset already exists
        existing_asset = db.get(Asset, asset.get('id'))
        if existing_asset:
            continue
            
        # Create the vector document
        doc = f"TH: {asset.get('name_th', '')} {asset.get('description_th', '')} EN: {asset.get('name_en', '')}"
        
        # Generate vector
        vector = model.encode(doc).tolist()
        
        # Prepare data for SQLModel
        asset_data = {
            "id": asset.get('id'),
            "asset_code": asset.get('asset_code'),
            "name_th": asset.get('name_th'),
            "name_en": asset.get('name_en'),
            "asset_type_id": asset.get('asset_type_id'),
            "price": asset.get('asset_details_selling_price'),
            "bedrooms": asset.get('asset_details_number_of_bedrooms'),
            "bathrooms": asset.get('asset_details_number_of_bathrooms'),
            "description_th": asset.get('asset_details_description_th'),
            "description_en": asset.get('asset_details_description_en'),
            "location_latitude": asset.get('location_latitude'),
            "location_longitude": asset.get('location_longitude'),
            "images_main_id": asset.get('images_main_id'),
            "asset_vector": vector
        }
        
        db_asset = Asset(**asset_data)
        db.add(db_asset)
        count += 1
        
        # Commit in batches of 100
        if (i + 1) % 100 == 0:
            db.commit()
            print(f"Processed and committed {i + 1}/{len(assets)} assets...")
    
    # Commit any remaining assets
    db.commit()
    print(f"Total new assets ingested: {count}")

    # --- 5. Batch Update Geometry ---
    print("Updating PostGIS geometry fields...")
    db.execute(text("""
    UPDATE asset
    SET location_geom = ST_SetSRID(ST_MakePoint(location_longitude, location_latitude), 4326)
    WHERE location_longitude IS NOT NULL AND location_latitude IS NOT NULL
    AND location_geom IS NULL;
    """))
    db.commit()

    print("--- Data Ingestion Complete ---")