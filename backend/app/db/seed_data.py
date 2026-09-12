import random
import math
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.models import Farm, Pond, SensorReading, AnomalyEvent, CarbonReport
from app.db.database import SessionLocal, engine, Base
from app.ml.biomass_model import biomass_ml_model

def math_sin_hour(hour: int) -> float:
    return math.sin((hour - 8) * math.pi / 12.0)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if already seeded
    if db.query(Farm).filter_by(farm_id="ALG-001").first():
        print("Database already seeded.")
        db.close()
        return

    print("Seeding Gujarat Algae Farm (ALG-001) with 6 ponds & 30 days historical IoT telemetry...")

    farm = Farm(
        farm_id="ALG-001",
        name="Gujarat Algae Farm",
        location="Gujarat, India",
        latitude=23.21,
        longitude=72.63,
        area=10.5,
        number_of_ponds=6,
        species="Chlorella vulgaris"
    )
    db.add(farm)

    ponds_config = [
        {"id": "P01", "name": "Pond 01", "area": 1.8, "depth": 0.35, "species": "Chlorella vulgaris", "status": "HEALTHY", "baseline": 1.5, "current": 2.45},
        {"id": "P02", "name": "Pond 02", "area": 1.8, "depth": 0.35, "species": "Chlorella vulgaris", "status": "HEALTHY", "baseline": 1.5, "current": 2.30},
        {"id": "P03", "name": "Pond 03", "area": 1.7, "depth": 0.35, "species": "Chlorella vulgaris", "status": "HEALTHY", "baseline": 1.4, "current": 2.25},
        {"id": "P04", "name": "Pond 04", "area": 1.8, "depth": 0.35, "species": "Chlorella vulgaris", "status": "CRITICAL", "baseline": 1.5, "current": 1.42},
        {"id": "P05", "name": "Pond 05", "area": 1.7, "depth": 0.35, "species": "Chlorella vulgaris", "status": "HEALTHY", "baseline": 1.4, "current": 2.15},
        {"id": "P06", "name": "Pond 06", "area": 1.7, "depth": 0.35, "species": "Chlorella vulgaris", "status": "WARNING", "baseline": 1.4, "current": 1.75},
    ]

    for p in ponds_config:
        pond = Pond(
            pond_id=p["id"],
            farm_id="ALG-001",
            name=p["name"],
            area=p["area"],
            depth=p["depth"],
            species=p["species"],
            status=p["status"],
            baseline_biomass=p["baseline"],
            current_biomass=p["current"]
        )
        db.add(pond)

    db.commit()

    now = datetime.now(timezone.utc)
    start_time = now - timedelta(days=30)

    readings_to_insert = []
    ml_training_data = []

    for p in ponds_config:
        p_id = p["id"]
        is_p04 = (p_id == "P04")
        is_p06 = (p_id == "P06")

        current_time = start_time
        current_bio = p["baseline"]

        while current_time <= now:
            hour = current_time.hour
            diurnal_temp = 28.0 + 3.0 * random.uniform(0.8, 1.2) * math_sin_hour(hour)
            
            temp = round(diurnal_temp, 1)
            ph = round(8.2 + random.uniform(-0.2, 0.2), 2)
            do = round(7.5 + random.uniform(-0.5, 0.5), 1)
            turbidity = round(55.0 + random.uniform(-5.0, 5.0), 1)
            co2 = round(450.0 + random.uniform(-20, 20), 1)
            light = round(max(0, 800.0 * math_sin_hour(hour)), 1)
            water_level = round(0.35 + random.uniform(-0.02, 0.02), 2)

            if is_p04 and (now - current_time) <= timedelta(days=3):
                temp = round(31.8 + random.uniform(-0.3, 0.3), 1)
                ph = round(9.3 + random.uniform(-0.1, 0.1), 2)
                do = round(4.8 + random.uniform(-0.3, 0.3), 1)
                days_ago = (now - current_time).total_seconds() / 86400.0
                current_bio = round(1.42 + (days_ago / 3.0) * (2.4 - 1.42), 2)
            elif is_p06 and (now - current_time) <= timedelta(days=2):
                temp = round(30.6 + random.uniform(-0.2, 0.2), 1)
                ph = round(8.85 + random.uniform(-0.1, 0.1), 2)
                current_bio = round(1.75 + random.uniform(-0.05, 0.05), 2)
            else:
                days_progress = (current_time - start_time).total_seconds() / (30 * 86400.0)
                current_bio = round(p["baseline"] + days_progress * (p["current"] - p["baseline"]) + random.uniform(-0.03, 0.03), 2)

            readings_to_insert.append(SensorReading(
                pond_id=p_id,
                timestamp=current_time,
                temperature=temp,
                ph=ph,
                dissolved_oxygen=do,
                turbidity=turbidity,
                co2_concentration=co2,
                light_intensity=light,
                biomass_density=current_bio,
                water_level=water_level
            ))

            ml_training_data.append({
                "temperature": temp,
                "ph": ph,
                "dissolved_oxygen": do,
                "turbidity": turbidity,
                "co2_concentration": co2,
                "light_intensity": light,
                "previous_biomass": current_bio - 0.02,
                "water_level": water_level,
                "target_biomass": current_bio
            })

            current_time += timedelta(hours=6) # 6-hour interval

    db.bulk_save_objects(readings_to_insert)

    # Add Anomaly Events
    db.add(AnomalyEvent(
        pond_id="P04",
        timestamp=now - timedelta(hours=6),
        severity="CRITICAL",
        title="Pond 04: Critical Thermal & pH Stress Anomaly",
        explanation="Productivity decline likely caused by pH + temperature stress. pH elevated to 9.3 (11% shift), water temperature spiked to 31.8°C. Biomass density collapsed 31% (2.4 g/L to 1.42 g/L). Estimated impact: 7.3 kg CO₂/day capture reduction.",
        estimated_capture_loss_kg=7.3,
        resolved=False
    ))

    db.add(AnomalyEvent(
        pond_id="P06",
        timestamp=now - timedelta(hours=12),
        severity="WARNING",
        title="Pond 06: pH Approaching Upper Threshold",
        explanation="pH rising to 8.85 (near max threshold 9.0). Water temperature 30.6°C. Growth rate slowed by 12%. Estimated impact: 2.1 kg CO₂/day capture reduction.",
        estimated_capture_loss_kg=2.1,
        resolved=False
    ))

    db.commit()

    print("Training RandomForest ML Biomass Model on 30-day historical dataset...")
    biomass_ml_model.train(ml_training_data)

    db.close()
    print("Database seeding completed successfully.")
