# Deployment Guide for Full-Stack Integration

## 📦 Package Contents

This package contains the **Mercil PropTech AI Backend** - a production-ready FastAPI service for real estate search and recommendations.

### What's Included

```
mercil-backend/
├── app/                      # Application source code
│   ├── api/                  # REST API endpoints & schemas
│   ├── core/                 # Configuration & constants
│   ├── services/             # Business logic (search, chat, recommendations)
│   └── main.py               # FastAPI application entry point
├── scripts/                  # Utility scripts (data ingestion)
├── .env.example              # Environment configuration template
├── requirements.txt          # Python dependencies
├── README.md                 # Full documentation
└── test_service.py           # Integration tests
```

## 🚀 Quick Start for Frontend Developers

### 1. Prerequisites

**Required:**
- Python 3.10+ ([Download](https://www.python.org/downloads/))
- PostgreSQL 14+ with PostGIS and pgvector extensions
- Ollama ([Installation](https://ollama.ai/download))

**Ollama Models:**
```bash
ollama pull gemma3:4b      # For both chatbot and query parsing (3.3GB - ONLY model needed!)
```

### 2. Installation

**Option A: Docker (Recommended)**
```bash
# Extract/Clone the repository
cd mercil-backend

# Configure environment
cp .env.example .env

# Start everything
docker-compose up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f api
```

**Option B: Manual Installation**
```bash
# Clone/Extract the repository
cd mercil-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Database Setup

**Option A: Supabase (Recommended)**
1. Create project at [supabase.com](https://supabase.com)
2. Enable extensions in SQL editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Copy connection string to `.env`

**Option B: Local PostgreSQL**
```bash
# Install pgvector extension
git clone https://github.com/pgvector/pgvector.git
cd pgvector && make && sudo make install

# In psql:
CREATE EXTENSION postgis;
CREATE EXTENSION vector;
```

### 4. Data Ingestion

```bash
# Ensure JSON files are in project root:
# - asset_type_rows.json
# - assets_rows.json

python scripts/ingest.py
```

### 5. Run the Server

```bash
# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

**Access:**
- API: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`

## 🔌 API Integration Guide

### Base URL
```
http://localhost:8000/api
```

### Authentication
Currently no authentication. For production, implement:
- API keys in headers
- JWT tokens
- OAuth2

### Key Endpoints

#### 1. Search Properties
```javascript
// POST /api/search
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
    pagination: {
      page: 1,
      page_size: 20
    }
  })
});

const data = await response.json();
// Returns: { results: [...], total_pages: 5 }
```

#### 2. Get Similar Properties
```javascript
// GET /api/recommend/item/{asset_id}
const response = await fetch('http://localhost:8000/api/recommend/item/123');
const similar = await response.json();
// Returns: [{ id, asset_code, name_th, price, image_url, ... }]
```

#### 3. Get Personalized Recommendations
```javascript
// GET /api/recommend/user
const response = await fetch('http://localhost:8000/api/recommend/user', {
  headers: { 'X-Client-ID': 'user-session-id' }
});
const recommendations = await response.json();
```

#### 4. Track User Actions
```javascript
// POST /api/track/action
await fetch('http://localhost:8000/api/track/action', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Client-ID': 'user-session-id'
  },
  body: JSON.stringify({
    asset_id: 123,
    action_type: "save"  // or "click"
  })
});
// Returns 202 Accepted immediately
```

#### 5. Chat with AI Assistant
```javascript
// POST /api/chat
const response = await fetch('http://localhost:8000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What properties are available under 5M baht?",
    session_id: "chat-session-1"
  })
});

const data = await response.json();
// Returns: { response_text: "..." }
```

### Response Formats

**Search Response:**
```json
{
  "results": [
    {
      "id": 14,
      "asset_code": "8Z5956",
      "name_th": "ชีวาทัย ราชปรารภ",
      "price": 3200000.00,
      "image_url": "https://placehold.co/...",
      "location_latitude": 13.7563,
      "location_longitude": 100.5018
    }
  ],
  "total_pages": 5
}
```

**Error Response:**
```json
{
  "detail": "Error message description"
}
```

## 🔧 Configuration

### Environment Variables

Required in `.env`:
```bash
# Database (Required)
DATABASE_URL=postgresql://user:pass@host:5432/database

# Ollama (Required)
OLLAMA_BASE_URL=http://localhost:11434
```

### CORS Configuration

Update `app/main.py` for production:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Change from ["*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🐳 Docker Deployment

### Quick Start

The project includes complete Docker configuration for one-command deployment:

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### What's Included

The `docker-compose.yml` includes:

1. **API Service** (`mercil-api`)
   - FastAPI backend on port 8000
   - Automatic hot reload in development
   - Health checks configured

2. **PostgreSQL** (`mercil-postgres`)
   - PostGIS + pgvector enabled
   - Persistent data storage
   - Port 5432 exposed

3. **Ollama** (`mercil-ollama`)
   - Auto-downloads gemma3:4b on first start
   - Port 11434 exposed
   - Model data persisted

4. **PgAdmin** (optional, dev profile)
   - Database management UI
   - Access at http://localhost:5050

### Configuration Files

**Dockerfile** - Multi-stage build optimized for production:
```dockerfile
FROM python:3.10-slim
WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client libpq-dev gcc g++ \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code
COPY app/ ./app/
COPY scripts/ ./scripts/
COPY *.json .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**.dockerignore** - Excludes unnecessary files from image:
```
__pycache__/
*.pyc
venv/
.env*
.git/
*.md
*.log
.pytest_cache/
```

### Production Deployment

For production, customize `docker-compose.yml`:

```yaml
services:
  api:
    build: .
    restart: always
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - OLLAMA_BASE_URL=http://ollama:11434
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

### Docker Commands Cheatsheet

```bash
# Build without cache
docker-compose build --no-cache

# Scale API instances
docker-compose up -d --scale api=3

# Execute command in container
docker-compose exec api python scripts/ingest.py

# View container resource usage
docker stats

# Clean up everything
docker-compose down -v --rmi all

# Export/Import volumes
docker run --rm -v mercil_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz /data
```
