import os
import pandas as pd
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple

from app.data.normalize import normalize_nwdp_record
from app.data.spatial import match_nearest_station, haversine_distance

class NWDPDataProvider:
    """
    Dedicated data provider for loading, parsing, cleaning, and normalizing all 4 NWDP telemetry datasets:
    1. Temperature
    2. Solar Radiation
    3. Rainfall
    4. Relative Humidity
    """

    def __init__(self, raw_dir: Optional[str] = None):
        base_dir = Path(__file__).resolve().parent.parent.parent.parent
        if raw_dir:
            self.raw_dir = Path(raw_dir)
        else:
            self.raw_dir = base_dir / "data" / "raw"

        self._dataframes: Dict[str, pd.DataFrame] = {}
        self._stations: Dict[str, List[Dict[str, Any]]] = {}
        self._is_loaded: bool = False

    def _resolve_file_path(self, primary_name: str, fallback_name: str) -> Path:
        p1 = self.raw_dir / primary_name
        if p1.exists():
            return p1
        p2 = self.raw_dir / fallback_name
        if p2.exists():
            return p2
        raise FileNotFoundError(f"Neither {primary_name} nor {fallback_name} was found in {self.raw_dir}")

    def _clean_and_parse_csv(
        self,
        file_path: Path,
        param_col: str,
        parameter_name: str
    ) -> pd.DataFrame:
        df = pd.read_csv(file_path)

        # Clean string columns
        for col in ["station_code", "station_name", "quality_code"]:
            if col in df.columns:
                df[col] = df[col].astype(str).str.strip()

        # Parse timestamps to ISO string & datetime object
        df["dt"] = pd.to_datetime(df["observation_timestamp"], errors="coerce")
        df = df.dropna(subset=["dt"]).copy()
        df["timestamp_iso"] = df["dt"].dt.strftime("%Y-%m-%dT%H:%M:%SZ")

        # Convert numeric values & interpolate missing values per station
        df[param_col] = pd.to_numeric(df[param_col], errors="coerce")
        df[param_col] = df.groupby("station_code")[param_col].transform(
            lambda g: g.ffill().bfill()
        )

        # Drop duplicate records
        df = df.drop_duplicates(subset=["station_code", "observation_timestamp"]).copy()
        df["parameter"] = parameter_name
        df["value"] = df[param_col]

        return df

    def load_temperature(self) -> pd.DataFrame:
        file_path = self._resolve_file_path("temperature_gujarat_2026_2030.csv", "temprature_tel_hr_gujarat_sw_gw_gj_2026_2030.csv")
        df = self._clean_and_parse_csv(file_path, "air_temperature_c", "temperature")
        self._dataframes["temperature"] = df
        self._extract_station_metadata("temperature", df)
        return df

    def load_solar_radiation(self) -> pd.DataFrame:
        file_path = self._resolve_file_path("solar_radiation_gujarat_2026_2030.csv", "solar_rediation_tel_hr_gujarat_sw_gw_gj_2026_2030.csv")
        df = self._clean_and_parse_csv(file_path, "solar_radiation_w_m2", "solar_radiation")
        self._dataframes["solar_radiation"] = df
        self._extract_station_metadata("solar_radiation", df)
        return df

    def load_rainfall(self) -> pd.DataFrame:
        file_path = self._resolve_file_path("rainfall_gujarat_2026_2030.csv", "rainfall_tel_hr_gujarat_sw_gw_gj_2026_2030.csv")
        df = self._clean_and_parse_csv(file_path, "rainfall_mm", "rainfall")
        self._dataframes["rainfall"] = df
        self._extract_station_metadata("rainfall", df)
        return df

    def load_humidity(self) -> pd.DataFrame:
        file_path = self._resolve_file_path("humidity_gujarat_2026_2030.csv", "humid_tel_hr_gujarat_sw_gw_gj_2026_2030.csv")
        df = self._clean_and_parse_csv(file_path, "relative_humidity_pct", "relative_humidity")
        self._dataframes["relative_humidity"] = df
        self._extract_station_metadata("relative_humidity", df)
        return df

    def _extract_station_metadata(self, parameter_name: str, df: pd.DataFrame):
        st_df = df[["station_code", "station_name", "latitude", "longitude"]].drop_duplicates()
        self._stations[parameter_name] = [
            {
                "station_id": row["station_code"],
                "station_name": row["station_name"],
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"])
            }
            for _, row in st_df.iterrows()
        ]

    def load_all(self) -> Dict[str, pd.DataFrame]:
        self.load_temperature()
        self.load_solar_radiation()
        self.load_rainfall()
        self.load_humidity()
        self._is_loaded = True
        return self._dataframes

    def get_stations_for_parameter(self, parameter: str) -> List[Dict[str, Any]]:
        if not self._is_loaded or parameter not in self._stations:
            self.load_all()
        return self._stations.get(parameter, [])

    def get_normalized_records_for_parameter(self, parameter: str) -> List[Dict[str, Any]]:
        if not self._is_loaded or parameter not in self._dataframes:
            self.load_all()

        df = self._dataframes[parameter]
        records = []
        for _, row in df.iterrows():
            records.append(
                normalize_nwdp_record(
                    station_code=row["station_code"],
                    station_name=row["station_name"],
                    latitude=row["latitude"],
                    longitude=row["longitude"],
                    timestamp_iso=row["timestamp_iso"],
                    parameter=parameter,
                    value=row["value"],
                    quality_code=row.get("quality_code", "PASSED_QC")
                )
            )
        return records

    def find_nearest_station_to_aoi(self, aoi_lat: float = 23.2100, aoi_lon: float = 72.6300) -> Optional[Dict[str, Any]]:
        stations = self.get_stations_for_parameter("temperature")
        return match_nearest_station(aoi_lat, aoi_lon, stations)

    def get_stations(self, aoi_lat: float = 23.2100, aoi_lon: float = 72.6300) -> List[Dict[str, Any]]:
        stations = self.get_stations_for_parameter("temperature")
        res = []
        for s in stations:
            st = dict(s)
            st["distance_km"] = round(haversine_distance(aoi_lat, aoi_lon, s["latitude"], s["longitude"]), 2)
            res.append(st)
        return res

    def get_temperature_at_timestamp(self, station_id: str, target_dt: Optional[datetime] = None) -> Dict[str, Any]:
        if not self._is_loaded or "temperature" not in self._dataframes:
            self.load_all()
        df = self._dataframes["temperature"]
        df_st = df[df["station_code"] == station_id]
        if df_st.empty:
            df_st = df
        if target_dt is None or target_dt.tzinfo is None:
            row = df_st.iloc[-1]
        else:
            target_naive = target_dt.astimezone(timezone.utc).replace(tzinfo=None)
            row = df_st.loc[(df_st["dt"] - target_naive).abs().idxmin()]
        return {
            "station_id": str(row["station_code"]),
            "station_name": str(row["station_name"]),
            "timestamp": str(row["timestamp_iso"]),
            "parameter": "temperature",
            "value": round(float(row["air_temperature_c"]), 2),
            "unit": "°C",
            "quality_code": str(row.get("quality_code", "PASSED_QC"))
        }

nwdp_provider = NWDPDataProvider()
