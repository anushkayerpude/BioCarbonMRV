import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from pathlib import Path
import joblib
import logging
from typing import List, Dict, Tuple, Optional

logger = logging.getLogger(__name__)

class BiomassMLModel:
    """
    RandomForestRegressor model for predicting algae biomass growth based on environmental conditions.
    Trained on Zenodo open-access microalgae cultivation benchmark dataset.
    Includes a deterministic biological fallback model.
    """

    def __init__(self):
        self.feature_names = [
            "temperature", "ph", "dissolved_oxygen", "turbidity",
            "co2_concentration", "light_intensity", "previous_biomass", "water_level"
        ]
        self.model = None
        self.is_trained = False
        
        # Try loading serialized trained model artifact
        model_path = Path(__file__).resolve().parent / "biomass_model.joblib"
        if model_path.exists():
            try:
                self.model = joblib.load(model_path)
                self.is_trained = True
                logger.info(f"Loaded trained RandomForestRegressor from {model_path}")
            except Exception as e:
                logger.warning(f"Failed to load serialized biomass model: {e}")
                self.model = RandomForestRegressor(n_estimators=50, random_state=42, max_depth=8)
        else:
            self.model = RandomForestRegressor(n_estimators=50, random_state=42, max_depth=8)

    def _deterministic_fallback(self, features: Dict[str, float]) -> Tuple[float, float]:
        """
        Deterministic growth model based on photo-autotrophic growth equations.
        Used if ML model training is pending or fails.
        """
        prev_bio = features.get("previous_biomass", 1.8)
        temp = features.get("temperature", 28.0)
        ph = features.get("ph", 8.2)
        do = features.get("dissolved_oxygen", 7.0)
        co2 = features.get("co2_concentration", 450.0)
        light = features.get("light_intensity", 750.0)

        # Environmental stress multipliers (1.0 = optimal)
        # Optimal Temp: 28-30°C
        temp_factor = max(0.4, 1.0 - abs(temp - 29.0) * 0.08)
        # Optimal pH: 8.0-8.5
        ph_factor = max(0.3, 1.0 - abs(ph - 8.25) * 0.25)
        # Light factor
        light_factor = min(1.2, light / 700.0)

        # Net daily growth rate (fraction per day)
        growth_rate = 0.15 * temp_factor * ph_factor * light_factor

        # Anomaly penalty if temp > 31.5 or pH > 9.1
        if temp > 31.5 or ph > 9.1:
            growth_rate = -0.25 # Biomass crash

        predicted_biomass = round(max(0.2, prev_bio * (1.0 + growth_rate)), 2)
        confidence = 0.88 if not (temp > 31.5 or ph > 9.1) else 0.92
        return predicted_biomass, confidence

    def train(self, training_data: List[Dict[str, float]]) -> bool:
        """
        Trains the RandomForestRegressor on historical sensor readings.
        """
        if not training_data or len(training_data) < 20:
            logger.warning("Insufficient training data for ML biomass model. Using fallback.")
            return False

        try:
            df = pd.DataFrame(training_data)
            X = df[self.feature_names]
            y = df["target_biomass"]

            self.model.fit(X, y)
            self.is_trained = True
            logger.info("RandomForestRegressor biomass model successfully trained.")
            return True
        except Exception as e:
            logger.error(f"Failed to train ML biomass model: {e}")
            self.is_trained = False
            return False

    def predict(self, features: Dict[str, float]) -> Tuple[float, float]:
        """
        Predicts next biomass density and prediction confidence score.
        """
        if not self.is_trained:
            return self._deterministic_fallback(features)

        try:
            feat_dict = dict(features)
            if "previous_biomass" not in feat_dict or feat_dict["previous_biomass"] is None:
                feat_dict["previous_biomass"] = feat_dict.get("biomass_density", 1.8)

            defaults = {
                "temperature": 28.5,
                "ph": 8.2,
                "dissolved_oxygen": 7.0,
                "turbidity": 45.0,
                "co2_concentration": 450.0,
                "light_intensity": 700.0,
                "previous_biomass": 1.8,
                "water_level": 0.35
            }
            for fn in self.feature_names:
                if fn not in feat_dict or feat_dict[fn] is None:
                    feat_dict[fn] = defaults.get(fn, 0.0)

            input_df = pd.DataFrame([feat_dict])[self.feature_names]
            predicted_val = float(self.model.predict(input_df)[0])
            
            # Compute confidence score from decision tree prediction variance across trees
            tree_predictions = [tree.predict(input_df.values)[0] for tree in self.model.estimators_]
            std_dev = np.std(tree_predictions)
            confidence = round(max(0.70, min(0.98, 1.0 - (std_dev / (predicted_val + 1e-5)))), 2)

            return round(predicted_val, 2), confidence
        except Exception as e:
            logger.error(f"Prediction error in ML model: {e}. Executing fallback.")
            return self._deterministic_fallback(features)

biomass_ml_model = BiomassMLModel()
