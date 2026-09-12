import unittest
import pandas as pd
from datetime import datetime, timezone
from pathlib import Path

from app.data.spatial import (
    haversine_distance,
    match_nearest_station
)
from app.data.normalize import (
    normalize_nwdp_record,
    create_canonical_observation
)
from app.data.providers.nwdp import NWDPDataProvider
from app.data.pipeline import environmental_pipeline
from app.services.sensor_simulator import sensor_simulator
from app.db.database import SessionLocal, engine, Base
from app.models.models import Farm, Pond

class TestNWDPIngestion(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.provider = NWDPDataProvider()
        cls.provider.load_all()

    def test_csv_parsing(self):
        stations = self.provider.get_stations_for_parameter("temperature")
        self.assertGreaterEqual(len(stations), 5)
        station_codes = [s["station_id"] for s in stations]
        self.assertIn("NWDP-GJ-001", station_codes)
        self.assertIn("NWDP-GJ-002", station_codes)

    def test_timestamp_parsing(self):
        records = self.provider.get_normalized_records_for_parameter("temperature")
        self.assertGreater(len(records), 0)
        sample = records[0]
        self.assertIn("timestamp", sample)
        self.assertIn("T", sample["timestamp"])

    def test_multi_parameter_conversion(self):
        records = self.provider.get_normalized_records_for_parameter("temperature")
        for rec in records[:100]:
            temp_val = rec["value"]
            self.assertIsInstance(temp_val, float)
            self.assertTrue(10.0 <= temp_val <= 50.0)

    def test_missing_values_and_duplicates_handling(self):
        df = self.provider._dataframes["temperature"]
        self.assertEqual(df["air_temperature_c"].isnull().sum(), 0)
        self.assertEqual(df.duplicated(subset=["station_code", "observation_timestamp"]).sum(), 0)

    def test_haversine_distance_calculation(self):
        dist = haversine_distance(23.2100, 72.6300, 23.2200, 72.6500)
        self.assertTrue(2.0 <= dist <= 3.0)

    def test_spatial_station_matching(self):
        stations = self.provider.get_stations_for_parameter("temperature")
        matched = match_nearest_station(23.2100, 72.6300, stations)
        self.assertIsNotNone(matched)
        self.assertEqual(matched["station_id"], "NWDP-GJ-001")
        self.assertEqual(matched["station_name"], "Gandhinagar Hydro-Met Station")
        self.assertEqual(round(matched["distance_km"], 1), 2.3)

    def test_pipeline_environmental_context(self):
        ctx = environmental_pipeline.get_environmental_context()
        self.assertEqual(ctx["source"], "NWDP")
        self.assertIn("parameters", ctx)
        params = ctx["parameters"]
        self.assertIn("temperature", params)
        self.assertIn("solar_radiation", params)
        self.assertIn("rainfall", params)
        self.assertIn("relative_humidity", params)
        self.assertEqual(params["temperature"]["station_id"], "NWDP-GJ-001")

    def test_sensor_simulator_integration(self):
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        pond = db.query(Pond).first()
        if not pond:
            farm = Farm(
                farm_id="TEST-FARM",
                name="Test Farm",
                location="Gujarat, India",
                latitude=23.21,
                longitude=72.63,
                area=10.0,
                number_of_ponds=1
            )
            db.add(farm)
            pond = Pond(
                pond_id="TEST-P01",
                farm_id="TEST-FARM",
                name="Test Pond 1",
                area=1.8,
                depth=0.35,
                species="Chlorella vulgaris",
                status="HEALTHY",
                baseline_biomass=1.5,
                current_biomass=2.0
            )
            db.add(pond)
            db.commit()

        reading = sensor_simulator.generate_live_reading(db, pond)
        self.assertEqual(reading["temperature_source"], "REAL_NWDP")
        self.assertEqual(reading["matched_station_id"], "NWDP-GJ-001")
        self.assertEqual(reading["matched_station_name"], "Gandhinagar Hydro-Met Station")
        self.assertIn("environmental_context", reading)
        db.close()

if __name__ == "__main__":
    unittest.main()
