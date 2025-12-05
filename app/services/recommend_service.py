

from sqlmodel import Session
from sqlalchemy.sql import text
from app.services.database import Asset, UserProfile
from app.api.schemas import AssetResultSchema
from app.services.search_service import mock_image_url 
import numpy as np
from typing import List
from sqlalchemy.dialects.postgresql import insert as pg_insert

# --- 1. Item-Based Recommendations ---

def get_item_recommendations(
    asset_id: int, db: Session
) -> List[AssetResultSchema]:
    """
    Finds the 5 most similar items to the given asset_id.
    Uses a hybrid approach: vector similarity + feature similarity.
    
    Current algorithm prioritizes:
    - Same property type (weight: 2.0) 
    - Price similarity (weight: 1.5)  
    - Bedroom similarity (weight: 1.5) 
    - Vector/semantic similarity (weight: 1.0) 
    - Location proximity (weight: 0.5) 
    
    """
    
    query = text("""
        WITH target AS (
            SELECT 
                asset_vector, 
                price, 
                bedrooms, 
                asset_type_id,
                location_latitude,
                location_longitude
            FROM asset WHERE id = :asset_id
        )
        SELECT 
            asset.id, 
            asset.asset_code, 
            asset.name_th, 
            asset.price, 
            asset.images_main_id,
            asset.location_latitude, 
            asset.location_longitude,
            -- Calculate hybrid similarity score with weighted factors
            (
                -- Vector similarity (semantic match, weight: 1.0)
                1.0 * (1 - (asset.asset_vector <=> target.asset_vector)) +
                
                -- Property type match (critical, weight: 2.0 - must be same type)
                2.0 * CASE WHEN asset.asset_type_id = target.asset_type_id THEN 1 ELSE 0 END +
                
                -- Price similarity (important, weight: 1.5)
                1.5 * CASE 
                    WHEN target.price > 0 THEN 
                        1 - LEAST(ABS(asset.price - target.price) / target.price, 1.0)
                    ELSE 0 
                END +
                
                -- Bedroom similarity (somewhat important, weight: 1.5)
                1.5 * CASE 
                    WHEN target.bedrooms > 0 THEN 
                        1 - LEAST(ABS(asset.bedrooms - target.bedrooms) / target.bedrooms, 1.0)
                    ELSE 0 
                END +
                
                -- Location proximity (nice to have, weight: 0.5 - don't over-weight geography)
                0.5 * CASE 
                    WHEN asset.location_latitude IS NOT NULL AND asset.location_longitude IS NOT NULL 
                         AND target.location_latitude IS NOT NULL AND target.location_longitude IS NOT NULL THEN
                        GREATEST(0, 1 - (ST_Distance(
                            ST_SetSRID(ST_MakePoint(asset.location_longitude, asset.location_latitude), 4326)::geography,
                            ST_SetSRID(ST_MakePoint(target.location_longitude, target.location_latitude), 4326)::geography
                        ) / 50000))
                    ELSE 0 
                END
            ) as similarity_score
        FROM asset, target
        WHERE asset.id != :asset_id 
          AND asset.asset_vector IS NOT NULL
          AND asset.price > 0
        ORDER BY similarity_score DESC
        LIMIT 5
    """)
    
    results = db.execute(query, {"asset_id": asset_id}).fetchall()
    
    return [
        AssetResultSchema(
            id=row[0],
            asset_code=row[1],
            name_th=row[2],
            price=row[3],
            image_url=mock_image_url(row[0], row[4]),
            location_latitude=row[5],
            location_longitude=row[6]
        )
        for row in results
    ]

# --- 2. User-Based Recommendations ---

def get_user_recommendations(
    client_id: str, db: Session
) -> List[AssetResultSchema]:
    """
    Finds the 10 most similar items to the user's pre-calculated
    profile vector.
    """
    
    query = text("""
        WITH user_vector AS (
            SELECT profile_vector FROM userprofile WHERE client_id = :client_id
        )
        SELECT 
            assets.id, 
            assets.asset_code, 
            assets.name_th, 
            assets.price, 
            assets.images_main_id,
            assets.location_latitude, 
            assets.location_longitude
        FROM asset AS assets, user_vector
        WHERE assets.asset_vector IS NOT NULL
        AND user_vector.profile_vector IS NOT NULL
        ORDER BY
            assets.asset_vector <=> user_vector.profile_vector
        LIMIT 10
    """)
    
    results = db.execute(query, {"client_id": client_id}).fetchall()
    
    return [
        AssetResultSchema(
            id=row[0],
            asset_code=row[1],
            name_th=row[2],
            price=row[3],
            image_url=mock_image_url(row[0], row[4]),
            location_latitude=row[5],
            location_longitude=row[6]
        )
        for row in results
    ]

# --- 3. User Profile Tracking (Weighted) ---

ACTION_WEIGHTS = {
    "click": 1.0,
    "save": 3.0
}

def update_user_profile(
    client_id: str, asset_id: int, action_type: str, db: Session
):
    """
    Updates a user's profile vector using a weighted average.
    This runs in the background.
    """
    try:
        # 1. Get the action weight
        action_weight = ACTION_WEIGHTS.get(action_type, 0.0)
        
        # 2. Get the vector for the new asset
        asset = db.get(Asset, asset_id)
        if not asset or asset.asset_vector is None or len(asset.asset_vector) == 0:
            return # No vector, do nothing
            
        new_asset_vector = np.array(asset.asset_vector)
        
        # 3. Get the user's current profile
        user_profile = db.get(UserProfile, client_id)
        
        if user_profile is not None and user_profile.profile_vector is not None and len(user_profile.profile_vector) > 0:
            # 4a. User exists: Update profile with weighted average
            old_vector = np.array(user_profile.profile_vector)
            old_weight = user_profile.profile_weight
            
            new_weight = old_weight + action_weight
            
            # Calculate new weighted average vector
            new_vector = ((old_vector * old_weight) + (new_asset_vector * action_weight)) / new_weight
            
            # Update the profile
            user_profile.profile_vector = new_vector.tolist()
            user_profile.profile_weight = new_weight
            db.add(user_profile)
            
        else:
            # 4b. New user: Create a new profile
            new_profile = UserProfile(
                client_id=client_id,
                profile_vector=new_asset_vector.tolist(),
                profile_weight=action_weight
            )
            # Use merge to handle potential race conditions
            db.merge(new_profile)
            
        # 5. Commit changes
        db.commit()
        
    except Exception as e:
        db.rollback()
        print(f"Error updating user profile {client_id}: {e}")
        import traceback
        traceback.print_exc()
