# API Service

FastAPI service with PostgreSQL, pgvector, PostGIS, and Ollama integration.

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
DATABASE_URL=postgresql://postgres:changeme@localhost:5432/mercil_db
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
```

### 3. Start Development Services

Start PostgreSQL, Ollama, and pgAdmin:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

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

Or using uvicorn directly:

```bash
uv run uvicorn app.main:app --host localhost --port 3000 --reload
```

## Database Migrations Workflow

1. **Modify models** in `app/models/` (e.g., add a new field to `Asset`)
2. **Create migration**: `uv run alembic revision --autogenerate -m "Add field to Asset"`
3. **Review migration file** in `alembic/versions/` to ensure it's correct
4. **Test migration** on development database
5. **Apply migration**: `uv run alembic upgrade head`

## Project Structure

```
apps/api/
├── app/
│   ├── models/          # Database models (SQLModel)
│   ├── schemas/         # Pydantic request/response models
│   ├── routers/         # API route handlers
│   ├── db/              # Database connection and session
│   └── core/            # Configuration and utilities
├── alembic/             # Database migrations
│   ├── versions/       # Migration files
│   └── env.py          # Alembic environment configuration
├── scripts/             # Utility scripts
└── docker-compose.dev.yml  # Development services
```

## Services

- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/docs
- **pgAdmin**: http://localhost:5050
- **Ollama**: http://localhost:11434

## Development

### Health Checks

- Basic: `GET /health`
- Detailed: `GET /health/detailed` (checks API, database, and Ollama)

### Database Models

Models are defined in `app/models/` using SQLModel:

- `Asset` - Real estate properties
- `AssetType` - Property types
- `UserProfile` - User profiles with vector embeddings

### Adding New Models

1. Create model file in `app/models/` (e.g., `app/models/new_model.py`)
2. Import model in `app/models/__init__.py`
3. Import model in `alembic/env.py` (required for autogenerate)
4. Create migration: `uv run alembic revision --autogenerate -m "Add NewModel"`
5. Apply migration: `uv run alembic upgrade head`

## Troubleshooting

### Migration Issues

If migrations fail, check:

- Database is running: `docker-compose -f docker-compose.dev.yml ps`
- `DATABASE_URL` is correct in `.env`
- All models are imported in `alembic/env.py`

### Reset Database

To reset the database (⚠️ **WARNING**: This deletes all data):

```bash
# Rollback all migrations
uv run alembic downgrade base

# Reapply all migrations
uv run alembic upgrade head
```

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [GeoAlchemy2 Documentation](https://geoalchemy-2.readthedocs.io/)
