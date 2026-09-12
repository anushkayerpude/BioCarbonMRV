import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timezone

from app.data.spatial import haversine_distance, match_nearest_station
from app.data.normalize import create_canonical_observation

logger = logging.getLogger("cpcb_provider")

class CPCBDataProvider:
    """
    Data Provider for Central Pollution Control Board (CPCB) Gujarat Surface Water Quality
    (Manual Chemical & Physical Parameters).
    Provides real empirical surface water quality baselines, spatial station matching against
    the Gujarat cultivation AOI, and canonical normalization.
    """

    def __init__(self, raw_dir: Optional[str] = None):
        base_dir = Path(__file__).resolve().parent.parent.parent.parent
        self.raw_dir = Path(raw_dir) if raw_dir else (base_dir / "data" / "raw")
        self._df_chem: Optional[pd.DataFrame] = None
        self._df_phys: Optional[pd.DataFrame] = None
        self._stations: List[Dict[str, Any]] = []
        self._is_loaded: bool = False

    def load_datasets(self) -> None:
        """
        Loads and harmonizes CPCB Gujarat Chemical and Physical datasets (2021-2025 and 1961-2020).
        """
        chem_files = [
            self.raw_dir / "swq_chemical_parameter_manual_cpcb_gj_2021_2025.csv",
            self.raw_dir / "swq_chemical_parameter_manual_cpcb_gj_1961_2020.csv"
        ]
        phys_files = [
            self.raw_dir / "swq_physical_parameter_manual_cpcb_gj_2021_2025.csv",
            self.raw_dir / "swq_physical_parameter_manual_cpcb_gj_1961_2020.csv"
        ]

        chem_dfs = [pd.read_csv(f) for f in chem_files if f.exists()]
        phys_dfs = [pd.read_csv(f) for f in phys_files if f.exists()]

        if not chem_dfs or not phys_dfs:
            raise FileNotFoundError(f"CPCB datasets not found in {self.raw_dir}")

        df_c = pd.concat(chem_dfs, ignore_index=True)
        df_p = pd.concat(phys_dfs, ignore_index=True)

        # Clean string & numeric columns
        for df in [df_c, df_p]:
            df["Station"] = df["Station"].astype(str).str.strip()
            df["District"] = df["District"].astype(str).str.strip()
            df["River"] = df["River"].astype(str).str.strip()
            df["Latitude"] = pd.to_numeric(df["Latitude"], errors="coerce")
            df["Longitude"] = pd.to_numeric(df["Longitude"], errors="coerce")
            df.dropna(subset=["Latitude", "Longitude"], inplace=True)

        # Normalize column mappings for Chemical
        chem_rename = {
            "Potential of Hydrogen (pH)": "ph",
            "Dissolved oxygen (mg/L)": "dissolved_oxygen_mg_l",
            "Total Dissolved Solids (mg/L)": "tds_mg_l",
            "Amonia N (mgN/L)": "ammonia_n_mg_l",
            "Nitrate N (mgN/L)": "nitrate_n_mg_l",
            "Total Hardness (mgCaCO3/L)": "total_hardness_mg_l",
            "Data Acquisition Time": "acquisition_time"
        }
        for k, v in chem_rename.items():
            if k in df_c.columns:
                df_c[v] = pd.to_numeric(df_c[k], errors="coerce")

        # Normalize column mappings for Physical
        phys_rename = {
            "Turbidity (NTU)": "turbidity_ntu",
            "Temperature (ºC)": "temperature_c",
            "Total Solids (mg/L)": "total_solids_mg_l",
            "Data Acquisition Time": "acquisition_time"
        }
        for k, v in phys_rename.items():
            if k in df_p.columns:
                df_p[v] = pd.to_numeric(df_p[k], errors="coerce")

        # Find conductivity column (accounting for unicode micro-symbol)
        cond_cols = [c for c in df_p.columns if "conductivity" in c.lower()]
        if cond_cols:
            df_p["conductivity_us_cm"] = pd.to_numeric(df_p[cond_cols[0]], errors="coerce")
        else:
            df_p["conductivity_us_cm"] = np.nan

        self._df_chem = df_c
        self._df_phys = df_p

        # Extract unique stations
        stations_map = {}
        for _, row in df_c[["Station", "District", "River", "Latitude", "Longitude"]].drop_duplicates(subset=["Station"]).iterrows():
            st_name = row["Station"]
            stations_map[st_name] = {
                "station_id": f"CPCB-GJ-{abs(hash(st_name)) % 1000:03d}",
                "station_name": st_name,
                "district": row["District"],
                "river": row["River"],
                "latitude": float(row["Latitude"]),
                "longitude": float(row["Longitude"])
            }
        self._stations = list(stations_map.values())
        self._is_loaded = True
        logger.info(f"CPCB Data Provider loaded: {len(self._df_chem)} chemical, {len(self._df_phys)} physical records across {len(self._stations)} stations.")

    def get_stations(self) -> List[Dict[str, Any]]:
        if not self._is_loaded:
            self.load_datasets()
        return self._stations

    def match_nearest_station(self, aoi_lat: float = 23.2100, aoi_lon: float = 72.6300) -> Optional[Dict[str, Any]]:
        if not self._is_loaded:
            self.load_datasets()
        return match_nearest_station(aoi_lat, aoi_lon, self._stations)

    def get_water_quality_baseline(
        self,
        aoi_lat: float = 23.2100,
        aoi_lon: float = 72.6300
    ) -> Dict[str, Any]:
        """
        Calculates empirical surface water quality baselines using CPCB monitoring stations
        proximate to the AOI (e.g. Sabarmati / Ahmedabad basin).
        Returns baseline median, min, max, and tolerance limits.
        """
        if not self._is_loaded:
            self.load_datasets()

        nearest = self.match_nearest_station(aoi_lat, aoi_lon)
        st_name = nearest["station_name"] if nearest else "AHMEDABAD-1 BENRAMPURA"

        # Filter observations for nearest station, with fallback to regional district/basin
        chem_st = self._df_chem[self._df_chem["Station"] == st_name]
        if chem_st["ph"].dropna().empty:
            chem_st = self._df_chem[self._df_chem["District"].str.contains("Ahmadabad|Ahmedabad|Gandhinagar", case=False, na=False)]
        if chem_st["ph"].dropna().empty:
            chem_st = self._df_chem

        phys_st = self._df_phys[self._df_phys["Station"] == st_name]
        if phys_st["turbidity_ntu"].dropna().empty:
            phys_st = self._df_phys[self._df_phys["District"].str.contains("Ahmadabad|Ahmedabad|Gandhinagar", case=False, na=False)]
        if phys_st["turbidity_ntu"].dropna().empty:
            phys_st = self._df_phys

        # Calculate statistics
        def _get_stats(series: pd.Series, default_median: float, default_std: float):
            clean = series.dropna()
            if len(clean) >= 3:
                return {
                    "median": round(float(clean.median()), 2),
                    "mean": round(float(clean.mean()), 2),
                    "std": round(float(clean.std()), 2),
                    "min": round(float(clean.min()), 2),
                    "max": round(float(clean.max()), 2),
                    "sample_count": int(len(clean))
                }
            return {
                "median": default_median,
                "mean": default_median,
                "std": default_std,
                "min": round(default_median - 2 * default_std, 2),
                "max": round(default_median + 2 * default_std, 2),
                "sample_count": int(len(clean))
            }

        ph_stats = _get_stats(chem_st.get("ph", pd.Series()), 8.15, 0.35)
        do_stats = _get_stats(chem_st.get("dissolved_oxygen_mg_l", pd.Series()), 6.8, 1.2)
        tds_stats = _get_stats(chem_st.get("tds_mg_l", pd.Series()), 480.0, 65.0)
        turbidity_stats = _get_stats(phys_st.get("turbidity_ntu", pd.Series()), 42.0, 8.5)
        cond_stats = _get_stats(phys_st.get("conductivity_us_cm", pd.Series()), 780.0, 110.0)

        return {
            "source": "CPCB_GUJARAT",
            "agency": "Central Pollution Control Board",
            "matched_station": nearest,
            "regional_basin": "Sabarmati Basin (Gujarat)",
            "parameters": {
                "ph": ph_stats,
                "dissolved_oxygen_mg_l": do_stats,
                "tds_mg_l": tds_stats,
                "turbidity_ntu": turbidity_stats,
                "conductivity_us_cm": cond_stats
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

cpcb_provider = CPCBDataProvider()
