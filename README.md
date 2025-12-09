# MindStack Mercil

## Development

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.10+ and uv
- Docker and Docker Compose

### Start Development

1. **Start services** (PostgreSQL, Ollama, pgAdmin):

```bash
cd apps/api
docker compose -f docker-compose.dev.yml up -d
```

2. **Install dependencies**:

```bash
# Root
pnpm install

# API
cd apps/api
uv sync

# Web
cd apps/web
pnpm install
```

3. **Setup environment**:

Create `apps/api/.env`:

```env
DATABASE_URL=postgresql://postgres:changeme@localhost:5432/mindstack_mercil_db
OLLAMA_BASE_URL=http://localhost:11434
```

Create `apps/web/.env` (optional, defaults to http://localhost:8000):

```env
VITE_API_URL=http://localhost:8000
```

4. **Run migrations**:

```bash
cd apps/api
uv run alembic upgrade head
```

5. **Start dev servers**:

```bash
# Terminal 1: API
cd apps/api
uv run python run_dev.py

# Terminal 2: Web
cd apps/web
pnpm dev
```

Or use turbo from root:

```bash
pnpm dev
```

- API: http://localhost:8000
- Web: http://localhost:3001
- pgAdmin: http://localhost:5050

## Production

### Build and Run

1. **Create `.env` file**:

```env
POSTGRES_DB=mindstack_mercil_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
OLLAMA_BASE_URL=http://ollama:11434
CORS_ORIGINS=*
LOG_LEVEL=INFO
VITE_API_URL=http://localhost/api
WEB_PORT=80
```

2. **Start production stack**:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

3. **Access**:

- Frontend: http://localhost
- API: http://localhost/api
- API Docs: http://localhost/docs

### Stop Production

```bash
docker compose -f docker-compose.prod.yml down
```

### View Logs

```bash
docker compose -f docker-compose.prod.yml logs -f
```
