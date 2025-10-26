"""
FastAPI Main Application
Entry point for the CivicAgent backend API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.api.endpoints import complaints, admin, users
from app.services.scheduler import start_scheduler, stop_scheduler
from app.services.decision_model import decision_model

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    
    Handles:
    - Training/loading decision model
    - Starting APScheduler
    - Graceful shutdown
    """
    # Startup
    logger.info("Starting CivicAgent API...")
    
    try:
        # Load or train decision model
        logger.info("Initializing decision model...")
        decision_model.load()
        logger.info("Decision model ready")
        
        # Start scheduler
        logger.info("Starting task scheduler...")
        start_scheduler()
        logger.info("Task scheduler started")
        
        logger.info("CivicAgent API startup complete")
        
    except Exception as e:
        logger.error(f"Startup error: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down CivicAgent API...")
    
    try:
        stop_scheduler()
        logger.info("Task scheduler stopped")
        
    except Exception as e:
        logger.error(f"Shutdown error: {e}")
    
    logger.info("CivicAgent API shutdown complete")


# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Civic Engagement Platform - Backend API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(users.router)
app.include_router(complaints.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "message": "CivicAgent API is running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": "2025-01-26T00:00:00Z"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
