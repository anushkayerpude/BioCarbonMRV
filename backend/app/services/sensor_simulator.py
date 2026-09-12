import random
from datetime import datetime, timezone
import math
from sqlalchemy.orm import Session
from app.models.models import Pond, SensorReading
from app.db.database import SessionLocal
from app.services.anomaly_detector import anomaly_detector

class SensorSimulatorService:
    """
    Simulates real-time IoT sensor telemetry across 6 cultivation ponds.
    Introduces natural diurnal noise and periodic stress anomalies for Pond 04.
    """

    def generate_live_reading(self, db: Session, pond: Pond) -> dict:
        now = datetime.now(timezone.utc)
        hour = now.hour
        is_p04 = (pond.pond_id == "P04")
        is_p06 = (pond.pond_id == "P06")

        # Base parameters
        if is_p04 and pond.status == "CRITICAL":
            temp = round(31.8 + random.uniform(-0.4, 0.4), 1)
            ph = round(9.3 + random.uniform(-0.1, 0.1), 2)
            do = round(4.8 + random.uniform(-0.3, 0.3), 1)
            turbidity = round(72.0 + random.uniform(-4.0, 4.0), 1)
            co2 = round(390.0 + random.uniform(-15.0, 15.0), 1)
            light = round(max(50.0, 780.0 + random.uniform(-50, 50)), 1)
            biomass = round(max(1.35, pond.current_biomass + random.uniform(-0.02, 0.01)), 2)
            water_level = round(0.31 + random.uniform(-0.01, 0.01), 2)
        elif is_p06 and pond.status == "WARNING":
            temp = round(30.6 + random.uniform(-0.3, 0.3), 1)
            ph = round(8.85 + random.uniform(-0.1, 0.1), 2)
            do = round(6.2 + random.uniform(-0.3, 0.3), 1)
            turbidity = round(61.0 + random.uniform(-3.0, 3.0), 1)
            co2 = round(420.0 + random.uniform(-10.0, 10.0), 1)
            light = round(max(50.0, 740.0 + random.uniform(-40, 40)), 1)
            biomass = round(pond.current_biomass + random.uniform(-0.01, 0.02), 2)
            water_level = round(0.33 + random.uniform(-0.01, 0.01), 2)
        else:
            temp = round(28.4 + 2.0 * math.sin((hour - 8) * math.pi / 12.0) + random.uniform(-0.2, 0.2), 1)
            ph = round(8.2 + random.uniform(-0.15, 0.15), 2)
            do = round(7.4 + random.uniform(-0.3, 0.3), 1)
            turbidity = round(54.0 + random.uniform(-2.5, 2.5), 1)
            co2 = round(450.0 + random.uniform(-10.0, 10.0), 1)
            light = round(max(0.0, 820.0 * max(0, math.sin((hour - 6) * math.pi / 12.0)) + random.uniform(-20, 20)), 1)
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
            "water_level": water_level
        }

sensor_simulator = SensorSimulatorService()
