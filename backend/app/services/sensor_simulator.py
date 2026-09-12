import random
from datetime import datetime, timezone
import math
from sqlalchemy.orm import Session
from app.models.models import Pond, SensorReading
from app.db.database import SessionLocal
from app.services.anomaly_detector import anomaly_detector
from app.data.pipeline import environmental_pipeline

class SensorSimulatorService:
    """
    Simulates real-time IoT sensor telemetry across cultivation ponds.
    Uses REAL NWDP Environmental Context (Temperature, Solar Radiation, Rainfall, Humidity) from nearest stations.
    Simulates IoT pond parameters (pH, DO, Turbidity, CO2, Biomass) for pond-level micro-environment.
    """

    def generate_live_reading(self, db: Session, pond: Pond) -> dict:
        now = datetime.now(timezone.utc)
        hour = now.hour
        is_p04 = (pond.pond_id == "P04")
        is_p06 = (pond.pond_id == "P06")

        # Fetch REAL NWDP Environmental Context (Temperature, Solar Radiation, Rainfall, Relative Humidity)
        env_context = environmental_pipeline.get_environmental_context(now)
        env_params = env_context["parameters"]
        real_nwdp_temp = env_params["temperature"]["value"]
        real_nwdp_solar = env_params["solar_radiation"]["value"]

        # Fetch REAL CPCB Surface Water Quality Baseline (Gandhinagar Sabarmati station)
        cpcb_base = env_context.get("water_quality_baseline", {}).get("parameters", {})
        cpcb_ph = cpcb_base.get("ph", {}).get("median", 8.3)
        cpcb_do = cpcb_base.get("dissolved_oxygen_mg_l", {}).get("median", 7.0)
        cpcb_turb = cpcb_base.get("turbidity_ntu", {}).get("median", 15.0)

        # Base parameters
        if is_p04 and pond.status == "CRITICAL":
            temp = round(31.8 + random.uniform(-0.4, 0.4), 1)
            ph = round(max(9.2, cpcb_ph + 0.95 + random.uniform(-0.1, 0.1)), 2)
            do = round(max(4.0, cpcb_do - 2.2 + random.uniform(-0.3, 0.3)), 1)
            turbidity = round(72.0 + random.uniform(-4.0, 4.0), 1)
            co2 = round(390.0 + random.uniform(-15.0, 15.0), 1)
            light = round(max(50.0, 780.0 + random.uniform(-50, 50)), 1)
            biomass = round(max(1.35, pond.current_biomass + random.uniform(-0.02, 0.01)), 2)
            water_level = round(0.31 + random.uniform(-0.01, 0.01), 2)
        elif is_p06 and pond.status == "WARNING":
            temp = round(30.6 + random.uniform(-0.3, 0.3), 1)
            ph = round(cpcb_ph + 0.55 + random.uniform(-0.1, 0.1), 2)
            do = round(cpcb_do - 0.8 + random.uniform(-0.3, 0.3), 1)
            turbidity = round(61.0 + random.uniform(-3.0, 3.0), 1)
            co2 = round(420.0 + random.uniform(-10.0, 10.0), 1)
            light = round(max(50.0, 740.0 + random.uniform(-40, 40)), 1)
            biomass = round(pond.current_biomass + random.uniform(-0.01, 0.02), 2)
            water_level = round(0.33 + random.uniform(-0.01, 0.01), 2)
        else:
            temp = real_nwdp_temp
            # Pond autotrophic culture anchors on CPCB source water with photosynthetic buffering
            ph = round(cpcb_ph + random.uniform(-0.15, 0.15), 2)
            do = round(cpcb_do + 0.4 + random.uniform(-0.25, 0.25), 1)
            turbidity = round(cpcb_turb + (pond.current_biomass * 22.0) + random.uniform(-2.0, 2.0), 1)
            co2 = round(450.0 + random.uniform(-10.0, 10.0), 1)
            light = real_nwdp_solar if real_nwdp_solar > 0 else round(max(0.0, 820.0 * max(0, math.sin((hour - 6) * math.pi / 12.0)) + random.uniform(-20, 20)), 1)
            biomass = round(min(3.0, pond.current_biomass + random.uniform(0.005, 0.025)), 2)
            water_level = round(0.35 + random.uniform(-0.005, 0.005), 2)

        # Update pond current biomass density
        pond.current_biomass = biomass
        pond.updated_at = now

        reading = SensorReading(
            pond_id=pond.pond_id,
            timestamp=now,
            temperature=temp,
            ph=ph,
            dissolved_oxygen=do,
            turbidity=turbidity,
            co2_concentration=co2,
            light_intensity=light,
            biomass_density=biomass,
            water_level=water_level
        )
        db.add(reading)
        db.commit()

        return {
            "timestamp": now.isoformat(),
            "pond_id": pond.pond_id,
            "temperature": temp,
            "ph": ph,
            "dissolved_oxygen": do,
            "turbidity": turbidity,
            "co2_concentration": co2,
            "light_intensity": light,
            "biomass_density": biomass,
            "previous_biomass": biomass,
            "water_level": water_level,
            "temperature_source": "REAL_NWDP",
            "water_quality_source": "REAL_CPCB_GUJARAT",
            "matched_station_id": env_params["temperature"]["station_id"],
            "matched_station_name": env_params["temperature"]["station_name"],
            "matched_station_distance_km": env_params["temperature"]["distance_to_aoi_km"],
            "matched_cpcb_station": env_context.get("water_quality_baseline", {}).get("matched_station"),
            "environmental_context": env_context
        }

sensor_simulator = SensorSimulatorService()
