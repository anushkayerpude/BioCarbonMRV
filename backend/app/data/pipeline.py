import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from app.data.providers.nwdp import nwdp_provider, NWDPDataProvider
from app.data.spatial import match_nearest_station, haversine_distance

logger = logging.getLogger("environmental_pipeline")

class EnvironmentalPipeline:
    """
    Unified Environmental Telemetry Pipeline & Feature Store.
    Processes four raw NWDP datasets (Temperature, Solar Radiation, Rainfall, Humidity),
    normalizes observations into canonical schema, performs spatial matching against AOI,
    and exposes spatial-temporal environmental context queries for MRV models.
    """

    def __init__(self, provider: Optional[NWDPDataProvider] = None):
        self.provider = provider or nwdp_provider
        self.aoi_lat = 23.2100
        self.aoi_lon = 72.6300
        self._is_initialized = False
        self._nearest_stations: Dict[str, Dict[str, Any]] = {}

    def initialize_and_run(self) -> Dict[str, Any]:
        """
        Runs parsing, validation, normalization, timestamp alignment, station metadata extraction,
        and spatial matching across all 4 NWDP parameters.
        """
        logger.info("Initializing Environmental Ingestion Pipeline across 4 NWDP parameters...")
        dfs = self.provider.load_all()

        parameters = ["temperature", "solar_radiation", "rainfall", "relative_humidity"]
        summary = {}

        for param in parameters:
            df = dfs[param]
            stations = self.provider.get_stations_for_parameter(param)
            nearest = match_nearest_station(self.aoi_lat, self.aoi_lon, stations)
            self._nearest_stations[param] = nearest

            summary[param] = {
                "row_count": len(df),
                "station_count": len(stations),
                "date_range_start": str(df["timestamp_iso"].min()),
                "date_range_end": str(df["timestamp_iso"].max()),
                "nearest_station": nearest
            }

        self._is_initialized = True
        return summary

    def get_nearest_station(self, parameter: str) -> Optional[Dict[str, Any]]:
        if not self._is_initialized:
            self.initialize_and_run()
        return self._nearest_stations.get(parameter)

    def get_environmental_context(
        self,
        target_dt: Optional[datetime] = None,
        aoi_lat: float = 23.2100,
        aoi_lon: float = 72.6300
    ) -> Dict[str, Any]:
        """
        Retrieves normalized NWDP environmental context for temperature, solar radiation, rainfall,
        and relative humidity at the nearest station for the specified timestamp.
        Includes full provenance metadata. Falls back gracefully to mock baseline if unavailable.
        """
        try:
            if not self._is_initialized:
                self.initialize_and_run()

            # Retrieve observations for each matched station
            nearest_temp_st = self._nearest_stations["temperature"]["station_id"]
            df_temp = self.provider._dataframes["temperature"]
            df_temp_st = df_temp[df_temp["station_code"] == nearest_temp_st]
            
            nearest_solar_st = self._nearest_stations["solar_radiation"]["station_id"]
            df_solar = self.provider._dataframes["solar_radiation"]
            df_solar_st = df_solar[df_solar["station_code"] == nearest_solar_st]

            nearest_rain_st = self._nearest_stations["rainfall"]["station_id"]
            df_rain = self.provider._dataframes["rainfall"]
            df_rain_st = df_rain[df_rain["station_code"] == nearest_rain_st]

            nearest_humid_st = self._nearest_stations["relative_humidity"]["station_id"]
            df_humid = self.provider._dataframes["relative_humidity"]
            df_humid_st = df_humid[df_humid["station_code"] == nearest_humid_st]

            # Match target timestamp or pick latest
            if target_dt is None or target_dt.tzinfo is None:
                row_temp = df_temp_st.iloc[-1]
                row_solar = df_solar_st.iloc[-1]
                row_rain = df_rain_st.iloc[-1]
                row_humid = df_humid_st.iloc[-1]
            else:
                target_naive = target_dt.astimezone(timezone.utc).replace(tzinfo=None)
                
                row_temp = df_temp_st.loc[(df_temp_st["dt"] - target_naive).abs().idxmin()]
                row_solar = df_solar_st.loc[(df_solar_st["dt"] - target_naive).abs().idxmin()]
                row_rain = df_rain_st.loc[(df_rain_st["dt"] - target_naive).abs().idxmin()]
                row_humid = df_humid_st.loc[(df_humid_st["dt"] - target_naive).abs().idxmin()]

            return {
                "source": "NWDP",
                "label": "NWDP Environmental Context",
                "timestamp": str(row_temp["timestamp_iso"]),
                "parameters": {
                    "temperature": {
                        "value": round(float(row_temp["air_temperature_c"]), 2),
                        "unit": "°C",
                        "station_id": str(row_temp["station_code"]),
                        "station_name": str(row_temp["station_name"]),
                        "distance_to_aoi_km": self._nearest_stations["temperature"]["distance_km"]
                    },
                    "solar_radiation": {
                        "value": round(float(row_solar["solar_radiation_w_m2"]), 2),
                        "unit": "W/m²",
                        "station_id": str(row_solar["station_code"]),
                        "station_name": str(row_solar["station_name"]),
                        "distance_to_aoi_km": self._nearest_stations["solar_radiation"]["distance_km"]
                    },
                    "rainfall": {
                        "value": round(float(row_rain["rainfall_mm"]), 2),
                        "unit": "mm",
                        "station_id": str(row_rain["station_code"]),
                        "station_name": str(row_rain["station_name"]),
                        "distance_to_aoi_km": self._nearest_stations["rainfall"]["distance_km"]
                    },
                    "relative_humidity": {
                        "value": round(float(row_humid["relative_humidity_pct"]), 2),
                        "unit": "%",
                        "station_id": str(row_humid["station_code"]),
                        "station_name": str(row_humid["station_name"]),
                        "distance_to_aoi_km": self._nearest_stations["relative_humidity"]["distance_km"]
                    }
                },
                "fallback_active": False
            }

        except Exception as e:
            logger.warning(f"Error accessing NWDP feature store: {e}. Executing mock environmental fallback.")
            return {
                "source": "MOCK_FALLBACK",
                "label": "Simulated Environmental Context (Fallback)",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "parameters": {
                    "temperature": {"value": 28.4, "unit": "°C", "station_id": "MOCK-01", "station_name": "Synthetic Fallback", "distance_to_aoi_km": 0.0},
                    "solar_radiation": {"value": 650.0, "unit": "W/m²", "station_id": "MOCK-01", "station_name": "Synthetic Fallback", "distance_to_aoi_km": 0.0},
                    "rainfall": {"value": 0.0, "unit": "mm", "station_id": "MOCK-01", "station_name": "Synthetic Fallback", "distance_to_aoi_km": 0.0},
                    "relative_humidity": {"value": 65.0, "unit": "%", "station_id": "MOCK-01", "station_name": "Synthetic Fallback", "distance_to_aoi_km": 0.0}
                },
                "fallback_active": True
            }

environmental_pipeline = EnvironmentalPipeline()
