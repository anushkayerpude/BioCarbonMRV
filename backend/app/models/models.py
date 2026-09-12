from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.database import Base

class Farm(Base):
    __tablename__ = "farms"

    farm_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    area = Column(Float, nullable=False) # Total farm hectares
    number_of_ponds = Column(Integer, default=6)
    species = Column(String, default="Chlorella vulgaris")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    ponds = relationship("Pond", back_populates="farm", cascade="all, delete-orphan")

class Pond(Base):
    __tablename__ = "ponds"

    pond_id = Column(String, primary_key=True, index=True)
    farm_id = Column(String, ForeignKey("farms.farm_id"), nullable=False)
    name = Column(String, nullable=False)
    area = Column(Float, nullable=False) # Hectares / acres
    depth = Column(Float, nullable=False) # Meters (e.g. 0.35m)
    species = Column(String, default="Chlorella vulgaris")
    status = Column(String, default="HEALTHY") # HEALTHY, WARNING, CRITICAL, OFFLINE
    baseline_biomass = Column(Float, default=1.0) # g/L
    current_biomass = Column(Float, default=1.8) # g/L
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    farm = relationship("Farm", back_populates="ponds")
    sensor_readings = relationship("SensorReading", back_populates="pond", cascade="all, delete-orphan")
    anomalies = relationship("AnomalyEvent", back_populates="pond", cascade="all, delete-orphan")

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pond_id = Column(String, ForeignKey("ponds.pond_id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    temperature = Column(Float, nullable=False) # °C
    ph = Column(Float, nullable=False) # pH scale
    dissolved_oxygen = Column(Float, nullable=False) # mg/L
    turbidity = Column(Float, nullable=False) # NTU
    co2_concentration = Column(Float, nullable=False) # ppm
    light_intensity = Column(Float, nullable=False) # PAR umol/m²/s
    biomass_density = Column(Float, nullable=False) # g/L
    water_level = Column(Float, nullable=False) # m

    pond = relationship("Pond", back_populates="sensor_readings")

class BiomassPrediction(Base):
    __tablename__ = "biomass_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pond_id = Column(String, ForeignKey("ponds.pond_id"), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    sensor_estimate = Column(Float, nullable=False)
    image_estimate = Column(Float, nullable=False)
    ml_estimate = Column(Float, nullable=False)
    final_biomass = Column(Float, nullable=False)
    prediction_confidence = Column(Float, nullable=False)

class ImageryAnalysis(Base):
    __tablename__ = "imagery_analyses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pond_id = Column(String, ForeignKey("ponds.pond_id"), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    algae_index = Column(Float, nullable=False) # 0.0 - 1.0 (NDVI / Green proxy)
    estimated_biomass = Column(Float, nullable=False) # g/L
    image_confidence = Column(Float, nullable=False) # 0.0 - 1.0
    image_url = Column(String, nullable=True)

class AnomalyEvent(Base):
    __tablename__ = "anomaly_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pond_id = Column(String, ForeignKey("ponds.pond_id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    severity = Column(String, nullable=False) # WARNING, CRITICAL
    title = Column(String, nullable=False)
    explanation = Column(Text, nullable=False)
    estimated_capture_loss_kg = Column(Float, default=0.0)
    resolved = Column(Boolean, default=False)

    pond = relationship("Pond", back_populates="anomalies")

class CarbonReport(Base):
    __tablename__ = "carbon_reports"

    report_id = Column(String, primary_key=True)
    farm_id = Column(String, ForeignKey("farms.farm_id"), nullable=False)
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    total_biomass_produced_tonnes = Column(Float, nullable=False)
    estimated_co2_captured_tonnes = Column(Float, nullable=False)
    average_daily_capture_kg = Column(Float, nullable=False)
    data_completeness_pct = Column(Float, nullable=False)
    verification_confidence_pct = Column(Float, nullable=False)
    anomalies_count = Column(Integer, default=0)
    report_data_json = Column(Text, nullable=False) # Full JSON payload for export
