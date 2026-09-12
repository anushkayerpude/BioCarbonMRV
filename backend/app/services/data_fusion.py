from app.core.config import settings

class DataFusionEngine:
    """
    Combines independent evidence streams:
    1. IoT Sensor Biomass density (g/L)
    2. Satellite/Drone Spectral Image biomass estimate (g/L)
    3. AI/ML RandomForest growth model estimate (g/L)
    Calculates weighted fused biomass estimate.
    """

    def fuse_biomass(
        self,
        sensor_estimate: float,
        image_estimate: float,
        ml_estimate: float,
        w_sensor: float = None,
        w_image: float = None,
        w_ml: float = None
    ) -> dict:
        w_s = w_sensor if w_sensor is not None else settings.DEFAULT_WEIGHT_SENSOR
        w_i = w_image if w_image is not None else settings.DEFAULT_WEIGHT_IMAGE
        w_m = w_ml if w_ml is not None else settings.DEFAULT_WEIGHT_ML

        # Normalize weights so sum == 1.0
        total_weight = w_s + w_i + w_m
        if total_weight > 0:
            w_s /= total_weight
            w_i /= total_weight
            w_m /= total_weight
        else:
            w_s, w_i, w_m = 0.40, 0.30, 0.30

        final_biomass = (w_s * sensor_estimate) + (w_i * image_estimate) + (w_m * ml_estimate)

        return {
            "final_biomass": round(final_biomass, 2),
            "sensor_estimate": round(sensor_estimate, 2),
            "image_estimate": round(image_estimate, 2),
            "ml_estimate": round(ml_estimate, 2),
            "weights": {
                "sensor_weight": round(w_s, 2),
                "image_weight": round(w_i, 2),
                "ml_weight": round(w_m, 2)
            }
        }

fusion_engine = DataFusionEngine()
