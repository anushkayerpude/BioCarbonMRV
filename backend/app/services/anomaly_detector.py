import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Tuple, List
from app.core.config import settings

class AnomalyDetectionEngine:
    """
    Two-Layer Anomaly Detection System:
    Layer 1: Rule-based parametric thresholds (pH, Temp, DO, Biomass drop)
    Layer 2: ML-based multivariate IsolationForest outlier detection
    """

    def __init__(self):
        self.iso_forest = IsolationForest(n_estimators=40, contamination=0.1, random_state=42)
        # Pre-fit dummy normal distribution array for IsolationForest initialization
        normal_samples = np.random.normal(
            loc=[29.0, 8.2, 7.5, 55.0, 450.0, 2.2],
            scale=[1.0, 0.2, 0.5, 5.0, 30.0, 0.2],
            size=(100, 6)
        )
        self.iso_forest.fit(normal_samples)

    def analyze_pond_reading(
        self,
        pond_id: str,
        current_reading: Dict[str, float],
        previous_reading: Dict[str, float] = None
    ) -> Dict:
        temp = current_reading.get("temperature", 28.0)
        ph = current_reading.get("ph", 8.2)
        do = current_reading.get("dissolved_oxygen", 7.0)
        turbidity = current_reading.get("turbidity", 55.0)
        co2 = current_reading.get("co2_concentration", 450.0)
        biomass = current_reading.get("biomass_density", 2.0)

        # Layer 1: Rule-based checks
        rule_anomalies = []
        severity = "NORMAL"
        
        # pH Check
        if ph > settings.PH_MAX:
            rule_anomalies.append(f"pH elevated to {ph} (above optimal max {settings.PH_MAX})")
            severity = "WARNING"
        elif ph < settings.PH_MIN:
            rule_anomalies.append(f"pH dropped to {ph} (below optimal min {settings.PH_MIN})")
            severity = "WARNING"

        # Temp Check
        if temp > settings.TEMP_MAX:
            rule_anomalies.append(f"Water temperature spiked to {temp}°C (thermal stress limit {settings.TEMP_MAX}°C)")
            if severity == "WARNING":
                severity = "CRITICAL"
            else:
                severity = "WARNING"

        # DO Check
        if do < settings.DO_MIN:
            rule_anomalies.append(f"Dissolved oxygen depleted to {do} mg/L (hypoxia risk < {settings.DO_MIN})")
            severity = "WARNING"

        # Biomass rapid drop check
        biomass_drop_pct = 0.0
        if previous_reading and previous_reading.get("biomass_density"):
            prev_bio = previous_reading["biomass_density"]
            if prev_bio > 0:
                biomass_drop_pct = round(((prev_bio - biomass) / prev_bio) * 100.0, 1)
                if biomass_drop_pct >= settings.BIOMASS_DROP_CRITICAL_PCT:
                    rule_anomalies.append(f"Severe biomass collapse detected: dropped {biomass_drop_pct}% (from {prev_bio} to {biomass} g/L)")
                    severity = "CRITICAL"
                elif biomass_drop_pct >= settings.BIOMASS_DROP_WARNING_PCT:
                    rule_anomalies.append(f"Biomass decline detected: dropped {biomass_drop_pct}%")

        # Layer 2: ML IsolationForest
        features = np.array([[temp, ph, do, turbidity, co2, biomass]])
        ml_prediction = self.iso_forest.predict(features)[0] # -1 = Outlier, 1 = Normal
        
        if ml_prediction == -1 and severity == "NORMAL":
            severity = "WARNING"
            rule_anomalies.append("Multivariate anomaly pattern flagged by IsolationForest ML model")

        # Generate Human-Readable AI Diagnosis
        if severity != "NORMAL":
            diagnosis_lines = [f"{pond_id} productivity anomaly detected."]
            diagnosis_lines.append("Likely contributing factors:")
            if ph > 8.8:
                diagnosis_lines.append(f" • pH increased to {ph} (+{(ph-8.2)/8.2*100:.1f}% shift)")
            if temp > 30.5:
                diagnosis_lines.append(f" • Temperature increased to {temp}°C (thermal stress)")
            if biomass_drop_pct > 0:
                diagnosis_lines.append(f" • Biomass density declined by {biomass_drop_pct}%")
            
            estimated_loss_kg = round(max(2.5, biomass_drop_pct * 0.25), 1)
            diagnosis_lines.append(f"\nEstimated impact: {estimated_loss_kg} kg CO₂/day capture reduction.")
            
            explanation = "\n".join(diagnosis_lines)
            title = f"{pond_id}: {severity} Productivity Stress"
        else:
            explanation = "All environmental parameters and biomass growth rates are within normal operational limits."
            title = f"{pond_id}: Normal Operation"
            estimated_loss_kg = 0.0

        return {
            "pond_id": pond_id,
            "severity": severity,
            "title": title,
            "explanation": explanation,
            "rule_flags": rule_anomalies,
            "ml_outlier": bool(ml_prediction == -1),
            "estimated_capture_loss_kg": estimated_loss_kg
        }

anomaly_detector = AnomalyDetectionEngine()
