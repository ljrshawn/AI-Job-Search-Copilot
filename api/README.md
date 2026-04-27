# AI Job Copilot API

Backend API built with FastAPI, SQLAlchemy, Alembic, and PostgreSQL.

## Prerequisites

- Python 3.13+
- Poetry
- Docker (for PostgreSQL)

## 1) Environment Setup

From the `api` folder, create your local env file:

```zsh
cd /Users/shawnlyu/VSCodeProjects/AI-Job-Search-Copilot/api
cp .env.example .env
```

For local run with Docker DB, make sure `POSTGRES_HOST=localhost` in `.env`.
Also set `JWT_SECRET_KEY` to a strong random value before using login endpoints.

## 2) Install Dependencies

```zsh
cd /Users/shawnlyu/VSCodeProjects/AI-Job-Search-Copilot/api
poetry install
```

## 3) Start Database (Docker)

```zsh
cd /Users/shawnlyu/VSCodeProjects/AI-Job-Search-Copilot/api
docker compose up db
```

## 4) Initiate DB and Run Migrations

Initial migration generation (run once for a new project state):

```zsh
cd /Users/shawnlyu/VSCodeProjects/AI-Job-Search-Copilot/api
poetry run alembic revision --autogenerate -m "init"
```

Apply migrations (run every time you need to sync DB schema):

```zsh
cd /Users/shawnlyu/VSCodeProjects/AI-Job-Search-Copilot/api
poetry run alembic upgrade head
```

Optional dev-only fallback (creates tables directly from models, without Alembic history):

```zsh
cd /Users/shawnlyu/VSCodeProjects/AI-Job-Search-Copilot/api
poetry run python -c "from app.db.init_db import init_db; init_db()"
```

## 5) Start API

```zsh
cd /Users/shawnlyu/VSCodeProjects/AI-Job-Search-Copilot/api
poetry run uvicorn app.main:app --reload
```

## 6) Verify

- Health check: `http://127.0.0.1:8000/health`
- Swagger docs: `http://127.0.0.1:8000/docs`

## Common Migration Commands

Create a new migration after model changes:

```zsh
cd /Users/shawnlyu/VSCodeProjects/AI-Job-Search-Copilot/api
poetry run alembic revision --autogenerate -m "describe_change"
```

Apply latest migration:

```zsh
cd /Users/shawnlyu/VSCodeProjects/AI-Job-Search-Copilot/api
poetry run alembic upgrade head
```

Rollback one migration:

```zsh
cd /Users/shawnlyu/VSCodeProjects/AI-Job-Search-Copilot/api
poetry run alembic downgrade -1
```

