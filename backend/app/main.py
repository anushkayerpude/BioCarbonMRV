import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging

from app.core.config import settings
from app.db.database import Base, engine, SessionLocal
from app.db.seed_data import seed_database
from app.api.endpoints import router as api_router
from app.services.sensor_simulator import sensor_simulator
from app.models.models import Pond

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("algae-mrv")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="AI-powered digital MRV platform for algae cultivation monitoring & carbon sequestration verification."
)

# CORS middleware for React frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    logger.info("Initializing Algae Carbon Intelligence Database & Seeding...")
    seed_database()
    # Start background live sensor simulator tick loop
    asyncio.create_task(background_sensor_simulation_loop())

async def background_sensor_simulation_loop():
    """
    Background loop simulating live IoT sensor stream updates every 4 seconds.
    """
    logger.info("Live IoT Sensor Simulator loop active (4s interval).")
    while True:
        try:
            await asyncio.sleep(4.0)
            db = SessionLocal()
            ponds = db.query(Pond).all()
            for pond in ponds:
                sensor_simulator.generate_live_reading(db, pond)
            db.close()
        except Exception as e:
            logger.error(f"Error in sensor simulation loop: {e}")

@app.get("/")
def root():
    return {
        "status": "active",
        "system": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "mrv_principle": "Multi-source evidence fusion (IoT + Remote Sensing + ML models) for carbon sequestration verification.",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
