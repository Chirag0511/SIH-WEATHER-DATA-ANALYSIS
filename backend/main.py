import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.database import engine, Base, SessionLocal
from backend.models import WeatherReport
from backend.pipeline.importer import run_dataset_import_pipeline

from backend.routes.events import router as events_router
from backend.routes.citizen import router as citizen_router
from backend.routes.connectors import router as connectors_router
from backend.routes.pipeline import router as pipeline_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Run migrations & initialize DB tables
    logger.info("Initializing database tables & migrations...")
    from backend.migrations import run_migrations
    run_migrations()
    Base.metadata.create_all(bind=engine)

    # 2. Check if database has reports, if not run import pipeline
    db = SessionLocal()
    try:
        count = db.query(WeatherReport).count()
        if count == 0:
            logger.info("Database is empty. Running initial dataset import pipeline...")
            run_dataset_import_pipeline(db)
        else:
            logger.info(f"Database contains {count} weather reports.")
    except Exception as e:
        logger.error(f"Error during startup data initialization: {e}")
    finally:
        db.close()

    yield
    logger.info("Shutting down backend services.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FastAPI Backend for National Weather Intelligence Platform for India (SIH 2026). Ingests raw historical synoptic datasets, connects to Open-Meteo live API, and processes citizen ground-truth reports.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "connected",
        "environment": "development/hackathon"
    }

# Forward /api/kpi to events get_kpi_summary
from backend.routes.events import get_kpi_summary
from backend.database import get_db
from fastapi import Depends
from sqlalchemy.orm import Session

@app.get("/api/kpi", tags=["KPI"])
def root_kpi(db: Session = Depends(get_db)):
    return get_kpi_summary(db)

from backend.routes.pipeline import router as pipeline_router
from backend.routes.ai import router as ai_router
from backend.routes.auth import router as auth_router
from backend.routes.admin import router as admin_router
from backend.routes.analytics import router as analytics_router

# Register API routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(events_router, prefix=settings.API_V1_PREFIX)
app.include_router(citizen_router, prefix=settings.API_V1_PREFIX)
app.include_router(connectors_router, prefix=settings.API_V1_PREFIX)
app.include_router(pipeline_router, prefix=settings.API_V1_PREFIX)
app.include_router(ai_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics_router, prefix=settings.API_V1_PREFIX)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
