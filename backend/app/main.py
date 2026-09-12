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

from app.api.websocket import ws_manager
from app.data.pipeline import environmental_pipeline
from app.services.anomaly_detector import anomaly_detector
from app.services.co2_engine import co2_engine
from app.services.verification_engine import verification_engine
from app.services.image_processing import image_service
from app.ml.biomass_model import biomass_ml_model
from app.services.data_fusion import fusion_engine
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("algae-mrv")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="AI-powered digital MRV platform for algae cultivation monitoring & carbon sequestration verification."
)

# CORS middleware for React frontend access and WebSocket handshakes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes (support both /api/v1 and /api)
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(api_router, prefix="/api")

@app.on_event("startup")
def startup_event():
    logger.info("Initializing Algae Carbon Intelligence Database & Seeding...")
    seed_database()
    # Start background live sensor simulator tick loop & WebSocket broadcaster
    asyncio.create_task(background_sensor_simulation_loop())

async def background_sensor_simulation_loop():
    """
    Background loop generating live telemetry ticks (3.5s interval) and broadcasting
    real-time payloads over FastAPI WebSockets (ws://localhost:8000/api/v1/ws/telemetry).
    """
    logger.info("Live Telemetry & WebSocket Broadcaster active (3.5s interval).")
    while True:
        try:
            await asyncio.sleep(3.5)
            db = SessionLocal()
            ponds = db.query(Pond).all()
            
            # Fetch latest NWDP environmental context
            env_context = environmental_pipeline.get_environmental_context()
            
            pond_payloads = []
            for pond in ponds:
                reading_dict = sensor_simulator.generate_live_reading(db, pond)
                
                # Compute anomaly diagnosis
                is_critical = (pond.status == "CRITICAL")
                anomaly_diag = anomaly_detector.analyze_pond_reading(pond.pond_id, reading_dict)
                
                # Compute biomass fusion estimate
                sensor_est = reading_dict["biomass_density"]
                img_analysis = image_service.process_pond_imagery(pond.pond_id, sensor_est, is_critical)
                ml_est, ml_conf = biomass_ml_model.predict(reading_dict)
                fused_biomass = fusion_engine.fuse_biomass(sensor_est, img_analysis["estimated_biomass"], ml_est)
                
                # Compute CO2 sequestration estimate
                co2_calc = co2_engine.calculate_pond_co2(pond.area, pond.depth, pond.baseline_biomass, pond.current_biomass)
                
                # Compute verification confidence
                verification_calc = verification_engine.compute_verification(
                    sensor_est=sensor_est,
                    image_est=img_analysis["estimated_biomass"],
                    ml_est=ml_est,
                    final_biomass=fused_biomass["final_biomass"],
                    is_anomaly=is_critical
                )
                
                pond_payloads.append({
                    "pond_id": pond.pond_id,
                    "name": pond.name,
                    "status": pond.status,
                    "sensor_values": reading_dict,
                    "nwdp_environmental_context": env_context,
                    "anomaly_status": anomaly_diag,
                    "biomass_estimate": fused_biomass,
                    "co2_estimate": co2_calc,
                    "verification_confidence": verification_calc
                })
            
            db.close()
            
            # Broadcast real-time telemetry frame to WebSocket clients
            telemetry_event = {
                "event": "TELEMETRY_UPDATE",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "nwdp_environmental_context": env_context,
                "ponds": pond_payloads
            }
            await ws_manager.broadcast(telemetry_event)

        except Exception as e:
            logger.error(f"Error in sensor simulation WebSocket loop: {e}")

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
