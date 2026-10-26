# Multi-stage Dockerfile for City Life Web Application
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend and frontend code
COPY backend ./backend
COPY frontend ./frontend
COPY run_server.py ./

# Environment defaults
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV HOST=0.0.0.0

# Pre-seed SQLite database on build
RUN python backend/seed.py

EXPOSE 8000

CMD ["python", "run_server.py"]
