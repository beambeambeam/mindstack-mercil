# API Service

FastAPI service with PostgreSQL, pgvector, PostGIS, and Ollama integration for AI-powered property search and recommendations.

## Prerequisites

- Python 3.10+
- uv (Python package manager)
- Docker and Docker Compose (for development services)

## Setup

### 1. Install Dependencies

```bash
uv sync
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:changeme@localhost:5432/mindstack_mercil_db
POSTGRES_PASSWORD=changeme

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434

# Server Configuration
HOST=localhost
PORT=3000

# CORS Configuration
CORS_ORIGINS=*

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=standard
LOG_FILE=
LOG_ROTATION=size
LOG_MAX_BYTES=10485760
LOG_BACKUP_COUNT=5
LOG_WHEN=midnight
LOG_INTERVAL=1
```

### 3. Start Development Services

Start PostgreSQL, Ollama, and pgAdmin:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This starts:

- **PostgreSQL** on port 5432 with pgvector and PostGIS extensions
- **Ollama** on port 11434 (automatically pulls `gemma3:4b` model)
- **pgAdmin** on port 5050

### 4. Database Migrations

#### Apply Migrations

Apply all pending migrations to the database:

```bash
uv run alembic upgrade head
```

#### Create a New Migration

After modifying models in `app/models/`, create a new migration:

```bash
uv run alembic revision --autogenerate -m "description of changes"
```

**Important**: Always review the generated migration file before applying it.

#### Rollback Migration

Rollback the last migration:

```bash
uv run alembic downgrade -1
```

Rollback to a specific revision:

```bash
uv run alembic downgrade <revision_id>
```

#### Check Migration Status

Show current database revision:

```bash
uv run alembic current
```

Show migration history:

```bash
uv run alembic history
```

Show detailed migration history:

```bash
uv run alembic history --verbose
```

### 5. Run the Application

Development mode (with hot-reload):

```bash
uv run python run_dev.py
```

Production mode:

```bash
uv run python run.py
```

Or using uvicorn directly:

```bash
uv run uvicorn app.main:app --host localhost --port 3000 --reload
```

## API Endpoints

### Health Checks

- `GET /health` - Basic health check (API status)
- `GET /health/detailed` - Detailed health check (API, database, Ollama, chat service)

### Assets

- `GET /assets` - List assets with pagination
  - Query params: `page` (default: 1), `page_size` (default: 20, max: 200)
- `GET /assets/{asset_id}` - Get asset by ID
- `POST /assets` - Create new asset (auto-generates embeddings)
- `PUT /assets/{asset_id}` - Replace asset (full update with embeddings)
- `PATCH /assets/{asset_id}` - Update asset (partial update, optional embeddings)
  - Body: `skip_embedding: bool` to skip vector regeneration
- `GET /assets/asset-types` - List all asset types

### Search

- `GET /search` - Hybrid search (semantic + keyword + filters)
  - Query params:
    - `query_text` (string) - Search query
    - `price_min`, `price_max` (int) - Price range
    - `bedrooms_min` (int) - Minimum bedrooms
    - `asset_type_id` (int[]) - Filter by asset types
    - `page` (int, default: 1)
    - `page_size` (int, default: 20, max: 100)
- `POST /search` - Hybrid search via JSON body
  - Body: `SearchRequestSchema` with `query_text`, `filters`, `pagination`

### Recommendations

- `GET /recommend/item/{asset_id}` - Item-based recommendations (similar assets)
- `GET /recommend/user` - User-based recommendations (requires `X-Client-ID` header)
- `POST /recommend/track` - Track user action to update profile (requires `X-Client-ID` header)
  - Body: `TrackActionSchema` with `asset_id` and `action_type` ("click" or "save")
- `POST /recommend/track/action` - Legacy endpoint (same as `/recommend/track`)

### Chat

- `POST /chat` - RAG chatbot endpoint (retrieves context from assets)
  - Body: `ChatRequestSchema` with `message` and optional `session_id`
- `POST /chat/ai` - Basic AI chat with conversation history
  - Body: `ChatRequestSchema` with `message` and optional `session_id`

### Ingestion

- `POST /ingest` - Ingest mock data into database
  - Body (optional): `{"asset_types": [...], "assets": [...], "embed": true}`
  - If no payload, loads from `data/asset_type_rows.json` and `data/assets_rows.json`

## Project Structure

```
apps/api/
├── app/
│   ├── main.py              # FastAPI app initialization
│   ├── models/              # Database models (SQLModel)
│   │   ├── asset.py         # Asset and AssetType models
│   │   └── user_profile.py  # UserProfile model with vector embeddings
│   ├── schemas/             # Pydantic request/response models
│   │   ├── asset.py         # Asset CRUD schemas
│   │   ├── chat.py          # Chat request/response schemas
│   │   ├── health.py        # Health check schemas
│   │   └── search.py        # Search and recommendation schemas
│   ├── routers/             # API route handlers
│   │   ├── assets.py        # Asset CRUD endpoints
│   │   ├── chat.py          # Chat endpoints
│   │   ├── health.py        # Health check endpoints
│   │   ├── ingest.py        # Data ingestion endpoint
│   │   ├── recommend.py     # Recommendation endpoints
│   │   └── search.py        # Search endpoints
│   ├── services/            # Business logic
│   │   ├── ai_chat_service.py      # Basic AI chat service
│   │   ├── chat_service.py         # RAG chat service
│   │   ├── ingest_service.py       # Data ingestion service
│   │   ├── parser_service.py       # Text parsing service
│   │   ├── recommend_service.py   # Recommendation algorithms
│   │   └── search_service.py      # Hybrid search service
│   ├── db/                  # Database connection and session
│   │   └── database.py      # SQLModel engine and session factory
│   └── core/                # Configuration and utilities
│       └── config/
│           ├── settings.py  # Application settings (pydantic-settings)
│           ├── constants.py  # Application constants
│           └── logging.py   # Logging configuration
├── alembic/                 # Database migrations
│   ├── versions/           # Migration files
│   └── env.py              # Alembic environment configuration
├── data/                    # Mock data files
│   ├── asset_type_rows.json
│   └── assets_rows.json
├── scripts/                 # Utility scripts
│   └── init.sql            # PostgreSQL initialization script
├── docker/                  # Docker files
│   └── postgres.Dockerfile # Custom PostgreSQL image with extensions
├── docker-compose.dev.yml   # Development services
├── Dockerfile              # Production Docker image
├── run.py                  # Production runner
├── run_dev.py              # Development runner (with reload)
├── pyproject.toml          # Project dependencies and config
└── alembic.ini             # Alembic configuration
```

## Database Models

### Asset

Real estate property model with:

- Basic info: `asset_code`, `name_th`, `name_en`, `asset_type_id`
- Property details: `price`, `bedrooms`, `bathrooms`, `description_th`, `description_en`
- Location: `location_latitude`, `location_longitude`, `location_geom` (PostGIS Point)
- Vector embedding: `asset_vector` (pgvector, 768 dimensions)
- Images: `images_main_id`

### AssetType

Property type model:

- `id`, `name_th`, `name_en`

### UserProfile

User profile for recommendations:

- `client_id` (primary key)
- `profile_vector` (pgvector, 768 dimensions)
- `profile_weight` (float)
- `last_updated` (timestamp)

## Services

### Search Service

Hybrid search combining:

- Semantic search (vector similarity using embeddings)
- Keyword search (text matching)
- Filtering (price, bedrooms, asset types)
- Geospatial search (PostGIS)

### Recommendation Service

Two recommendation algorithms:

- **Item-based**: Finds similar assets based on property features and vector similarity
- **User-based**: Uses user profile vector to find matching assets

User profile updates via action tracking:

- `click` action: weight 1.0
- `save` action: weight 3.0

### Chat Service

RAG (Retrieval-Augmented Generation) chatbot:

- Retrieves relevant asset context using vector search
- Uses LangChain with Ollama LLM (`gemma3:4b`)
- Generates responses based on retrieved context

### AI Chat Service

Basic AI chat with conversation history:

- Uses Ollama LLM directly
- Maintains conversation context via session ID

### Ingest Service

Data ingestion with:

- Batch processing (configurable batch size)
- Automatic embedding generation
- Support for asset types and assets

### Parser Service

Text parsing and document building for embeddings.

## Configuration

### Settings (`app/core/config/settings.py`)

Loaded from environment variables via `pydantic-settings`:

- `DATABASE_URL` - PostgreSQL connection string
- `OLLAMA_BASE_URL` - Ollama service URL
- `HOST`, `PORT` - Server configuration
- `CORS_ORIGINS` - CORS allowed origins (comma-separated or "\*")
- Logging configuration (level, format, file, rotation)

### Constants (`app/core/config/constants.py`)

- Embedding model: `paraphrase-multilingual-mpnet-base-v2` (768 dimensions)
- LLM model: `gemma3:4b`
- Search defaults: page size 20, max 100
- Recommendation limits: item 5, user 10
- Algorithm weights for recommendations
- Timeouts and batch sizes

## Development

### Adding New Models

1. Create model file in `app/models/` (e.g., `app/models/new_model.py`)
2. Import model in `app/models/__init__.py`
3. Import model in `alembic/env.py` (required for autogenerate)
4. Create migration: `uv run alembic revision --autogenerate -m "Add NewModel"`
5. Review migration file in `alembic/versions/`
6. Apply migration: `uv run alembic upgrade head`

### Adding New Endpoints

1. Create schema in `app/schemas/` (request/response models)
2. Create router in `app/routers/` or add to existing router
3. Implement service logic in `app/services/` if needed
4. Include router in `app/main.py`

### Logging

Structured logging with:

- Request/response logging middleware
- Configurable log levels and formats
- File rotation support
- Detailed error logging with stack traces

## Services URLs

- **API**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3000/docs
- **API Docs (ReDoc)**: http://localhost:3000/redoc
- **OpenAPI JSON**: http://localhost:3000/openapi.json
- **pgAdmin**: http://localhost:5050
- **Ollama**: http://localhost:11434

## Database Migrations Workflow

1. **Modify models** in `app/models/` (e.g., add a new field to `Asset`)
2. **Create migration**: `uv run alembic revision --autogenerate -m "Add field to Asset"`
3. **Review migration file** in `alembic/versions/` to ensure it's correct
4. **Test migration** on development database
5. **Apply migration**: `uv run alembic upgrade head`

## Troubleshooting

### Migration Issues

If migrations fail, check:

- Database is running: `docker-compose -f docker-compose.dev.yml ps`
- `DATABASE_URL` is correct in `.env`
- All models are imported in `alembic/env.py`
- PostgreSQL extensions are installed (pgvector, PostGIS)

### Reset Database

To reset the database (⚠️ **WARNING**: This deletes all data):

```bash
# Rollback all migrations
uv run alembic downgrade base

# Reapply all migrations
uv run alembic upgrade head
```

### Ollama Connection Issues

- Ensure Ollama container is running: `docker-compose -f docker-compose.dev.yml ps`
- Check Ollama logs: `docker-compose -f docker-compose.dev.yml logs ollama`
- Verify model is pulled: `docker exec mercil-ollama-dev ollama list`
- Check `OLLAMA_BASE_URL` in `.env`

### Health Check Failures

Use `/health/detailed` to diagnose:

- Database connection issues
- Ollama service availability
- Chat service initialization

## Docker

### Development

Development services are defined in `docker-compose.dev.yml`:

- PostgreSQL with pgvector and PostGIS
- Ollama with automatic model pull
- pgAdmin for database management

### Production

Production Dockerfile:

- Uses Python 3.10-slim base image
- Installs uv for dependency management
- Exposes port 8000
- Runs uvicorn with auto-reload (development mode)

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [GeoAlchemy2 Documentation](https://geoalchemy-2.readthedocs.io/)
- [LangChain Documentation](https://python.langchain.com/)
- [Ollama Documentation](https://ollama.ai/docs)
- [uv Documentation](https://docs.astral.sh/uv/)
