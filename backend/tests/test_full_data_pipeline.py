import unittest
import os
from pathlib import Path

from app.data.providers.nwdp import nwdp_provider
from app.data.providers.cpcb import cpcb_provider
from app.data.providers.copernicus_s2 import copernicus_s2_provider
from app.data.providers.bhuvan import bhuvan_provider
from app.data.pipeline import environmental_pipeline
from app.ml.biomass_model import biomass_ml_model
from app.services.image_processing import image_service
from app.services.data_fusion import fusion_engine
from app.services.verification_engine import verification_engine

class TestFullRealDataPipeline(unittest.TestCase):

    def test_01_nwdp_multi_parameter_telemetry(self):
        """Verify NWDP 4-parameter telemetry ingestion & spatial matching to Gandhinagar."""
        env_ctx = environmental_pipeline.get_environmental_context()
        self.assertEqual(env_ctx["source"], "NWDP")
        params = env_ctx["parameters"]

        for key in ["temperature", "solar_radiation", "rainfall", "relative_humidity"]:
            self.assertIn(key, params)
            self.assertIsInstance(params[key]["value"], (float, int))
            self.assertGreater(len(params[key]["station_id"]), 0)

        # Matched nearest station is Gandhinagar
        self.assertEqual(params["temperature"]["station_id"], "NWDP-GJ-001")
        self.assertLess(params["temperature"]["distance_to_aoi_km"], 5.0)

    def test_02_cpcb_water_quality_chemical_and_physical(self):
        """Verify CPCB Gujarat chemical & physical datasets ingestion and spatial baseline."""
        baseline = cpcb_provider.get_water_quality_baseline(23.2100, 72.6300)
        self.assertEqual(baseline["source"], "CPCB_GUJARAT")
        self.assertIn("matched_station", baseline)
        self.assertIsNotNone(baseline["matched_station"])

        # Check empirical water quality parameters
        params = baseline["parameters"]
        self.assertIn("ph", params)
        self.assertIn("dissolved_oxygen_mg_l", params)
        self.assertIn("turbidity_ntu", params)
        self.assertIn("conductivity_us_cm", params)

        self.assertTrue(7.0 <= params["ph"]["median"] <= 9.5)
        self.assertTrue(3.0 <= params["dissolved_oxygen_mg_l"]["median"] <= 12.0)
        self.assertTrue(params["turbidity_ntu"]["median"] > 0)
        self.assertTrue(params["conductivity_us_cm"]["median"] > 0)

    def test_03_zenodo_ml_biomass_model(self):
        """Verify Zenodo microalgae dataset ML model is trained, serialized, and predicting."""
        model_file = Path(__file__).resolve().parent.parent / "app" / "ml" / "biomass_model.joblib"
        eval_file = Path(__file__).resolve().parent.parent / "app" / "ml" / "model_evaluation.json"

        self.assertTrue(model_file.exists(), "biomass_model.joblib does not exist")
        self.assertTrue(eval_file.exists(), "model_evaluation.json does not exist")
        self.assertTrue(biomass_ml_model.is_trained, "BiomassMLModel is not loaded/trained")

        test_features = {
            "temperature": 28.5,
            "ph": 8.2,
            "dissolved_oxygen": 7.2,
            "turbidity": 48.0,
            "co2_concentration": 450.0,
            "light_intensity": 720.0,
            "previous_biomass": 1.85,
            "water_level": 0.35
        }
        pred, conf = biomass_ml_model.predict(test_features)
        self.assertIsInstance(pred, float)
        self.assertTrue(0.5 <= pred <= 3.5)
        self.assertTrue(0.70 <= conf <= 1.0)

    def test_04_copernicus_sentinel2_level2a(self):
        """Verify Copernicus Sentinel-2 Level-2A BOA reflectance and spectral indices."""
        s2_obs = copernicus_s2_provider.get_latest_observation(is_anomaly=False)
        self.assertEqual(s2_obs["source"], "COPERNICUS_DATA_SPACE")
        self.assertEqual(s2_obs["tile_id"], "T43QDA")
        self.assertIn("S2", s2_obs["product_id"])

        # Check bands
        bands = s2_obs["surface_reflectance_bands"]
        for b in ["B02_blue", "B03_green", "B04_red", "B08_nir"]:
            self.assertIn(b, bands)
            self.assertTrue(0.0 <= bands[b] <= 1.0)

        # Check calculated indices
        indices = s2_obs["spectral_indices"]
        self.assertIn("ndvi", indices)
        self.assertIn("normalized_green_index", indices)
        self.assertTrue(0.4 <= indices["ndvi"] <= 1.0)

        # Verify multispectral image tile rendering
        tile_bytes = image_service.generate_synthetic_pond_image("P01", 1.8, False, layer="rgb")
        self.assertGreater(len(tile_bytes), 1000)
        self.assertEqual(tile_bytes[:2], b"\xff\xd8") # Valid JPEG magic bytes

    def test_05_isro_bhuvan_geospatial_foundation(self):
        """Verify ISRO Bhuvan regional hydrology and water body spatial context."""
        bhuvan_ctx = bhuvan_provider.get_regional_water_context(23.2100, 72.6300)
        self.assertEqual(bhuvan_ctx["source"], "ISRO_NRSC_BHUVAN")
        self.assertIn("wms_service", bhuvan_ctx)
        self.assertTrue(bhuvan_ctx["wms_service"]["base_url"].startswith("https://bhuvan"))

        # Verify regional water body proximity
        nearest = bhuvan_ctx["nearest_water_body"]
        self.assertIn("Sabarmati", nearest["name"])
        self.assertLess(nearest["distance_km"], 5.0)

    def test_06_multi_source_data_fusion_integration(self):
        """Verify multi-source fusion combining Sensor (NWDP+CPCB), Satellite (Sentinel-2), and ML (Zenodo)."""
        # 1. Sensor estimate (e.g. from IoT calibrated with NWDP/CPCB)
        sensor_est = 2.05

        # 2. Image estimate (from Copernicus Sentinel-2)
        img_analysis = image_service.process_pond_imagery("P01", sensor_est, is_anomaly=False)
        img_est = img_analysis["estimated_biomass"]

        # 3. ML estimate (from Zenodo-trained RandomForest)
        features = {
            "temperature": 28.5,
            "ph": 8.2,
            "dissolved_oxygen": 7.0,
            "turbidity": 50.0,
            "co2_concentration": 450.0,
            "light_intensity": 700.0,
            "previous_biomass": sensor_est,
            "water_level": 0.35
        }
        ml_est, ml_conf = biomass_ml_model.predict(features)

        # 4. Fusion
        fused = fusion_engine.fuse_biomass(sensor_est, img_est, ml_est)
        self.assertIn("final_biomass", fused)
        self.assertTrue(1.0 <= fused["final_biomass"] <= 3.5)

        # 5. Verification confidence
        verif = verification_engine.compute_verification(
            sensor_est=sensor_est,
            image_est=img_est,
            ml_est=ml_est,
            final_biomass=fused["final_biomass"],
            is_anomaly=False
        )
        self.assertGreaterEqual(verif["overall_confidence_pct"], 80.0)

if __name__ == "__main__":
    unittest.main()
