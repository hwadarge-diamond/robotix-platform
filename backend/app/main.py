"""
City Life: Exploring, Experiencing & Navigating the Chaos We Call Home.
FastAPI Main Application.
"""

from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import CITY_NAME, HOST, PORT
from app.database import init_sqlite_db
from app.routers import places, layers, scoring, reports, routes, insights, assistant, heritage

app = FastAPI(
    title=f"City Life API - {CITY_NAME}",
    description="A city companion that tells you where to go, and how to get there safely, right now.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local development and deployed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All API Routers (The 5 Pillars)
app.include_router(places.router)
app.include_router(layers.router)
app.include_router(scoring.router)
app.include_router(reports.router)
app.include_router(routes.router)
app.include_router(insights.router)
app.include_router(assistant.router)
app.include_router(heritage.router)

# Locate frontend paths
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIR = ROOT_DIR / "frontend"
STATIC_DIR = FRONTEND_DIR / "static"

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.on_event("startup")
def on_startup():
    init_sqlite_db()

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "city": CITY_NAME,
        "app": "City Life API",
        "pillars": [
            "Exploration & Hospitality",
            "History & Culture",
            "Safety & Security",
            "Best vs Worst Places",
            "Smart City Insights"
        ],
        "version": "1.0.0"
    }

@app.get("/")
def serve_index():
    index_file = FRONTEND_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {
        "message": f"Welcome to City Life API ({CITY_NAME})",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
