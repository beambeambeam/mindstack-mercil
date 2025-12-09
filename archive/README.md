# Mercil PropTech AI Backend

> AI-powered real estate search and recommendation system with RAG chatbot capabilities

[![FastAPI](https://img.shields.io/badge/FastAPI-0.121.1-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

## 🚀 Quick Start

```bash
# One-command deployment with Docker
docker compose up -d
docker compose exec api python scripts/ingest.py
# Access API: http://localhost:8000/docs
```

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
  - [Docker Setup (Recommended)](#docker-setup-recommended)
  - [Manual Setup](#manual-setup)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

## 🎯 Overview

**Mercil PropTech AI Backend** is a production-ready real estate search and recommendation API that leverages modern AI/ML technologies to deliver intelligent property discovery and personalized user experiences.

The system combines vector similarity search, natural language processing, geospatial queries, and retrieval-augmented generation (RAG) to create a comprehensive PropTech solution suitable for real estate platforms, property management systems, and chatbot applications.

## ✨ Key Features

### 🔍 **Hybrid Search Engine**
Combines three powerful search methods:
- **Vector Similarity**: Semantic search using multilingual sentence transformers (768-dim embeddings)
- **Text Matching**: Full-text search with exact match prioritization for Thai/English
- **Geospatial Filtering**: PostGIS-powered location queries with configurable radius (default 10km)
- **Attribute Filters**: Price range, bedrooms, property types
- **Natural Language Queries**: LLM-powered query parsing for conversational search

### 🎯 **Smart Recommendations**
Intelligent property suggestions powered by:
- **Item-Based Collaborative Filtering**: Find similar properties using hybrid scoring (property_type × 3.0, price × 2.0, bedrooms × 1.5, location × 0.5)
- **User Profile Personalization**: Recommendations based on interaction history
- **Weighted Actions**: Click (1.0×) and Save (3.0×) tracking
- **Real-Time Learning**: Async profile updates for performance

### 💬 **RAG Chatbot**
Conversational AI with property knowledge:
- **Context-Aware Responses**: PGVector retrieval with top-k=3 relevant properties
- **Multi-lingual Support**: Thai and English language processing
- **Session Management**: Stateful conversations
- **Structured Data**: Prominently displays asset codes and details

### 📊 **Production Features**
- RESTful API with automatic OpenAPI documentation
- Docker containerization with one-command deployment
- Health check endpoints
- Async request handling
- Comprehensive error handling
- CORS configuration

## 🏗 Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React/Vue)   │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────────────────────────────┐
│          FastAPI Backend                │
│  ┌──────────┬──────────┬──────────┐    │
│  │  Search  │  Recom   │   Chat   │    │
│  │  Engine  │  Engine  │  (RAG)   │    │
│  └────┬─────┴────┬─────┴────┬─────┘    │
│       │          │          │           │
│       ▼          ▼          ▼           │
│  ┌─────────────────────────────────┐   │
│  │     Service Layer               │   │
│  │  - Parser (Ollama LLM)          │   │
│  │  - Embeddings (SentenceTransf)  │   │
│  │  - Vector Search (PGVector)     │   │
│  │  - Geocoding (Nominatim)        │   │
│  └────────────┬────────────────────┘   │
└───────────────┼────────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│     PostgreSQL + Extensions           │
│  - PostGIS (geospatial)               │
│  - pgvector (vector similarity)       │
│  - SQLModel ORM                       │
└───────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│          Ollama (Local LLM)           │
│  - Gemma 3 4B (Chat + Parser)         │
└───────────────────────────────────────┘
```

## 🔧 Prerequisites

### Required Software

- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **PostgreSQL 14+** with extensions:
  - PostGIS
  - pgvector
- **Ollama** ([Installation](https://ollama.ai/download))

### Required Ollama Models

```bash
# Download required models
ollama pull gemma3:4b      # For both chatbot and query parsing (3.3 GB)
```

## 🛠 Tech Stack

**Backend Framework:**
- FastAPI 0.121.1 (async Python web framework)
- Uvicorn 0.38.0 (ASGI server)

**Database:**
- PostgreSQL 14+ with PostGIS (geospatial) & pgvector (vector similarity)
- SQLModel 0.0.27 (type-safe ORM)

**AI/ML:**
- Ollama (gemma3:4b) - Local LLM for chat and query parsing
- LangChain 1.0.8 - RAG orchestration
- sentence-transformers 5.1.2 - Multilingual embeddings (paraphrase-multilingual-mpnet-base-v2)

**Geospatial:**
- GeoAlchemy2 0.18.0 - PostGIS integration
- geopy 2.4.1 - Nominatim geocoding

**Deployment:**
- Docker & docker-compose
- Gunicorn 23.0.0 (production WSGI server)

### System Requirements

- **Minimum**: 8GB RAM, 10GB disk space, x64 processor
- **Recommended**: 16GB RAM, 20GB disk space, GPU (optional for faster inference)

## 📦 Installation

### Docker Setup (Recommended)

The easiest way to run the entire stack with one command:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/mercil-backend.git
cd mercil-backend

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings (or use defaults for local Docker setup)

# 3. Start all services
docker-compose up -d

# 4. Check service status
docker-compose ps

# 5. View logs
docker-compose logs -f api

# 6. Access the application
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
# PgAdmin: http://localhost:5050 (with --profile dev)
```

**What's included:**
- ✅ FastAPI backend (port 8000)
- ✅ PostgreSQL with PostGIS + pgvector (port 5432)
- ✅ Ollama with gemma3:4b auto-downloaded (port 11434)
- ✅ PgAdmin for database management (port 5050, dev profile only)

**Useful Docker commands:**
```bash
# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Run with PgAdmin
docker-compose --profile dev up -d

# View API logs
docker-compose logs -f api

# Execute commands inside container
docker-compose exec api python scripts/ingest.py

# Reset everything (delete volumes)
docker-compose down -v
```

### Manual Setup

For development or environments without Docker:

#### 1. Clone the Repository

```bash
git clone https://github.com/your-org/mercil-backend.git
cd mercil-backend
```

#### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

#### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 4. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
# - Set your PostgreSQL connection string
# - Configure Ollama URL if not default
```

### 5. Setup Database

**Option A: Using Supabase (Recommended)**

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Enable PostGIS extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Copy connection string to `.env`

**Option B: Local PostgreSQL**

```bash
# Install PostgreSQL with PostGIS
# Then install pgvector:
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install

# In psql:
CREATE EXTENSION postgis;
CREATE EXTENSION vector;
```

### 6. Ingest Data

```bash
# Ensure JSON data files are in project root:
# - asset_type_rows.json
# - assets_rows.json

python scripts/ingest.py
```

This will:
- Create database tables
- Generate embeddings for all properties
- Populate vector store
- Update geospatial indexes

**Estimated time**: 5-10 minutes for ~20 properties

## ⚙️ Configuration

### Environment Variables

Edit `.env` file:

```bash
# Database (Required)
DATABASE_URL=postgresql://user:pass@host:5432/database

# Ollama (Required)
OLLAMA_BASE_URL=http://localhost:11434

# Optional: Override default models
EMBEDDING_MODEL=paraphrase-multilingual-mpnet-base-v2
LLM_MODEL=gemma3:4b
PARSER_MODEL=gemma3:4b

# Optional: Logging
LOG_LEVEL=INFO
```

### Application Constants

Edit `app/core/constants.py` to customize:

- Recommendation weights
- Search parameters
- Timeout values
- Batch sizes

## 🚀 Running the Application

### Start Ollama Server

```bash
# In a separate terminal
ollama serve
```

### Start FastAPI Server

```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Access API

- **API Base**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Interactive Documentation

Access comprehensive API docs with try-it-out functionality:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

### Quick Integration Example

```javascript
// Example: Search for properties
const response = await fetch('http://localhost:8000/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query_text: "condo 2 bedrooms near BTS",
    filters: {
      price_min: 1000000,
      price_max: 5000000,
      bedrooms_min: 2
    },
    pagination: { page: 1, page_size: 20 }
  })
});
const data = await response.json();
```

### API Endpoints

#### 1. Search Properties

```http
POST /api/search
Content-Type: application/json

{
  "query_text": "condo 2 bedrooms near BTS",
  "filters": {
    "price_min": 1000000,
    "price_max": 5000000,
    "bedrooms_min": 2
  },
  "pagination": {
    "page": 1,
    "page_size": 20
  }
}
```

#### 2. Get Similar Properties

```http
GET /api/recommend/item/{asset_id}
```

#### 3. Get Personalized Recommendations

```http
GET /api/recommend/user
Headers: X-Client-ID: user-session-id
```

#### 4. Track User Actions

```http
POST /api/track/action
Content-Type: application/json
Headers: X-Client-ID: user-session-id

{
  "asset_id": 123,
  "action_type": "save"  # or "click"
}
```

#### 5. Chat with AI Assistant

```http
POST /api/chat
Content-Type: application/json

{
  "message": "What properties are available under 5M baht?",
  "session_id": "chat-session-1"
}
```

### Response Examples

**Search Response:**
```json
{
  "results": [
    {
      "id": 14,
      "asset_code": "8Z5956",
      "name_th": "ชิววทัย ราชปรารภ",
      "price": 3200000.00,
      "image_url": "https://placehold.co/600x400/...",
      "location_latitude": 13.7563,
      "location_longitude": 100.5018
    }
  ],
  "total_pages": 5
}
```

**Chat Response:**
```json
{
  "response_text": "The price of asset 8Z5956 is 776000.00 baht."
}
```

## 📁 Project Structure

```
mercil-backend/
├── app/
│   ├── api/
│   │   ├── endpoints.py       # API routes
│   │   └── schemas.py         # Pydantic models
│   ├── core/
│   │   ├── config.py          # Settings
│   │   └── constants.py       # Application constants
│   ├── services/
│   │   ├── chat_service.py    # RAG chatbot
│   │   ├── database.py        # SQLModel models
│   │   ├── ingest_service.py  # Data ingestion
│   │   ├── parser_service.py  # Query parsing
│   │   ├── recommend_service.py # Recommendations
│   │   └── search_service.py  # Hybrid search
│   └── main.py                # FastAPI app
├── scripts/
│   ├── ingest.py              # Data ingestion script
│   └── init.sql               # PostgreSQL initialization
├── assets_rows.json           # Sample property data
├── asset_type_rows.json       # Property type definitions
├── test_service.py            # Integration tests
├── .dockerignore              # Docker build exclusions
├── .env.example               # Environment template
├── .gitignore                 # Git exclusions
├── docker-compose.yml         # Stack orchestration
├── Dockerfile                 # Container image
├── DEPLOYMENT.md              # Deployment guide
├── README.md                  # This file
└── requirements.txt           # Python dependencies
```

## 🧪 Testing

Run integration tests:
```bash
# With Docker
docker compose exec api python test_service.py

# Manual setup
python test_service.py
```

Test individual endpoints:
```bash
# Health check
curl http://localhost:8000/health

# Search test
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query_text": "condo", "filters": {}, "pagination": {"page": 1, "page_size": 5}}'
```
