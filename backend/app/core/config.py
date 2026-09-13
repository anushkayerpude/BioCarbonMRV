import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_PATH = BASE_DIR / "algae_mrv.db"

class Settings:
    PROJECT_NAME: str = "Algae Carbon Intelligence"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")
    
    # MRV Carbon Parameters
    # Default dry biomass carbon fraction (kg Carbon / kg Biomass)
    CARBON_FRACTION: float = 0.50
    # CO2 molecular weight ratio (44 / 12 = ~3.667)
    CO2_TO_CARBON_RATIO: float = 44.0 / 12.0
    
    # Fusion Weights
    DEFAULT_WEIGHT_SENSOR: float = 0.40
    DEFAULT_WEIGHT_IMAGE: float = 0.30
    DEFAULT_WEIGHT_ML: float = 0.30
    
    # Anomaly Thresholds
    PH_MIN: float = 7.5
    PH_MAX: float = 9.0
    TEMP_MIN: float = 24.0
    TEMP_MAX: float = 32.0
    DO_MIN: float = 4.5  # mg/L
    BIOMASS_DROP_WARNING_PCT: float = 15.0  # % drop
    BIOMASS_DROP_CRITICAL_PCT: float = 30.0 # % drop

settings = Settings()

