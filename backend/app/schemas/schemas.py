from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class FarmSchema(BaseModel):
    farm_id: str
    name: str
    location: str
    latitude: float
    longitude: float
    area: float
    number_of_ponds: int
    species: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PondSchema(BaseModel):
    pond_id: str
    farm_id: str
    name: str
    area: float
    depth: float
    species: str
    status: str # HEALTHY, WARNING, CRITICAL, OFFLINE
    baseline_biomass: float
    current_biomass: float
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SensorReadingSchema(BaseModel):
    timestamp: datetime
    pond_id: str
    temperature: float
    ph: float
    dissolved_oxygen: float
    turbidity: float
    co2_concentration: float
    light_intensity: float
    biomass_density: float
    water_level: float

    class Config:
        from_attributes = True

class ImageryAnalysisSchema(BaseModel):
    pond_id: str
    algae_index: float
    estimated_biomass: float
    image_confidence: float
    timestamp: Optional[datetime] = None
    image_url: Optional[str] = None

class BiomassPredictionSchema(BaseModel):
    pond_id: str
    final_biomass: float
    sensor_estimate: float
    image_estimate: float
    ml_estimate: float
    prediction_confidence: float
    timestamp: Optional[datetime] = None

class FusionWeightsSchema(BaseModel):
    sensor_weight: float = Field(0.40, ge=0.0, le=1.0)
    image_weight: float = Field(0.30, ge=0.0, le=1.0)
    ml_weight: float = Field(0.30, ge=0.0, le=1.0)

class CO2SequestrationSchema(BaseModel):
    pond_id: Optional[str] = None
    farm_id: Optional[str] = None
    baseline_biomass_kg: Optional[float] = 0.0
    current_biomass_kg: Optional[float] = 0.0
    biomass_gain_kg: float
    carbon_fixed_kg: float
    co2_captured_kg: Optional[float] = None
    gross_co2_captured_kg: Optional[float] = None
    operational_co2_emitted_kg: Optional[float] = None
    net_co2_removed_kg: Optional[float] = None
    dynamic_carbon_fraction: Optional[float] = None
    daily_co2_rate_kg: float
    monthly_co2_projection_tonnes: float

class AnomalyEventSchema(BaseModel):
    id: int
    pond_id: str
    timestamp: datetime
    severity: str
    title: str
    explanation: str
    estimated_capture_loss_kg: float
    resolved: bool

    class Config:
        from_attributes = True

class VerificationScoreSchema(BaseModel):
    pond_id: Optional[str] = None
    farm_id: Optional[str] = None
    sensor_estimate: float
    image_estimate: float
    ml_estimate: float
    final_biomass: float
    sensor_agreement_pct: float
    image_agreement_pct: float
    ml_confidence_pct: float
    data_completeness_pct: float
    historical_consistency_pct: float
    overall_confidence_pct: float
    evidence_checklist: List[str]

class CarbonPassportSchema(BaseModel):
    passport_id: str
    farm_name: str
    location: str
    monitoring_period: str
    total_biomass_tonnes: float
    estimated_co2_captured_tonnes: float
    average_daily_capture_kg: float
    number_of_ponds: int
    data_completeness_pct: float
    verification_confidence_pct: float
    anomalies_count: int
    evidence_sources: List[str]
    generated_at: datetime
