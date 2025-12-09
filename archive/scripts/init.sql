-- Database initialization script for PostgreSQL
-- Enables required extensions for pgvector and PostGIS

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify extensions are installed
SELECT 
    extname AS "Extension",
    extversion AS "Version"
FROM pg_extension 
WHERE extname IN ('vector', 'postgis');
