FROM python:3.13-slim

ENV POETRY_VERSION=2.3.2 \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_NO_INTERACTION=1

WORKDIR /app

# system deps (important for postgres + pdf parsing)
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# install poetry
RUN pip install "poetry==$POETRY_VERSION"

# cache layer
COPY pyproject.toml poetry.lock* ./

RUN poetry install --no-root

# copy app
COPY . .

CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--bind", "0.0.0.0:8000"]