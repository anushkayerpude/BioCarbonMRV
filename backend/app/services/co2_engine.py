from app.core.config import settings
import math

class CO2SequestrationEngine:
    """
    Enhanced CO2 Sequestration & Carbon MRV Calculation Engine.
    Features:
    1. Dynamic Carbon Prediction based on biochemical stress models (pH & thermal stress curves).
    2. Net Carbon Calculation (Gross CO2 Capture - Operational Electricity Emissions).
    """

    def predict_dynamic_carbon_fraction(
        self,
        ph: float = 8.2,
        temperature: float = 28.4,
        dissolved_oxygen: float = 7.4
    ) -> dict:
        """
        Dynamically predicts the biochemical composition and carbon fraction of dry algae biomass.
        Algae under pH stress (>8.8) or nitrogen limitation accumulates lipids/carbohydrates,
        increasing carbon fraction up to ~0.56. Healthy baseline is ~0.50, low pH drops to ~0.42.
        """
        # Base healthy carbon fraction for Chlorella vulgaris
        base_c = settings.CARBON_FRACTION # Default 0.50

        # pH Stress Modifier: High pH (>8.5) induces carbon accumulation / lipid storage
        if ph > 8.8:
            ph_modifier = 0.04 + min(0.04, (ph - 8.8) * 0.08)
        elif ph < 7.0:
            ph_modifier = -0.06
        else:
            ph_modifier = (ph - 8.0) * 0.02

        # Temperature Stress Modifier: Temp > 30°C causes thermal shift
        if temperature > 30.0:
            temp_modifier = -0.02
        else:
            temp_modifier = 0.01

        dynamic_c_fraction = round(max(0.38, min(0.58, base_c + ph_modifier + temp_modifier)), 3)

        # Estimate Biochemical Breakdown (Lipid %, Protein %, Carbohydrate %)
        # Lipid: ~53% C, Protein: ~50% C, Carbohydrate: ~44% C
        if ph > 8.8:
            lipid_pct = 38.0
            protein_pct = 32.0
            carb_pct = 30.0
        else:
            lipid_pct = 24.0
            protein_pct = 52.0
            carb_pct = 24.0

        return {
            "dynamic_carbon_fraction": dynamic_c_fraction,
            "carbon_pct": round(dynamic_c_fraction * 100.0, 1),
            "biochemical_breakdown": {
                "lipid_pct": lipid_pct,
                "protein_pct": protein_pct,
                "carbohydrate_pct": carb_pct
            },
            "stress_factors": {
                "ph_stress": ph > 8.8 or ph < 7.0,
                "thermal_stress": temperature > 30.0
            }
        }

    def calculate_pond_co2(
        self,
        area_ha: float,
        depth_m: float,
        baseline_biomass_g_per_l: float,
        current_biomass_g_per_l: float,
        days: float = 1.0,
        ph: float = 8.2,
        temperature: float = 28.4,
        dissolved_oxygen: float = 7.4
    ) -> dict:
        # Volume calculations
        volume_m3 = area_ha * 10000.0 * depth_m
        volume_liters = volume_m3 * 1000.0

        baseline_biomass_kg = (baseline_biomass_g_per_l * volume_liters) / 1000.0
        current_biomass_kg = (current_biomass_g_per_l * volume_liters) / 1000.0

        biomass_gain_kg = max(0.0, current_biomass_kg - baseline_biomass_kg)

        # Dynamic Carbon Prediction
        c_pred = self.predict_dynamic_carbon_fraction(ph, temperature, dissolved_oxygen)
        dynamic_c_fraction = c_pred["dynamic_carbon_fraction"]

        carbon_fixed_kg = biomass_gain_kg * dynamic_c_fraction
        gross_co2_captured_kg = carbon_fixed_kg * settings.CO2_TO_CARBON_RATIO

        # Net Carbon Calculation: Operational Emissions Subtraction
        # Paddlewheels, aeration blowers, dosing pumps consume ~0.15 kWh per m³ per day
        operational_kwh = volume_m3 * 0.15 * max(1.0, days)
        # Grid Emission Factor: 0.42 kg CO2 / kWh
        operational_co2_emitted_kg = operational_kwh * 0.42

        net_co2_removed_kg = max(0.0, gross_co2_captured_kg - operational_co2_emitted_kg)
        efficiency_pct = round((net_co2_removed_kg / max(1e-6, gross_co2_captured_kg)) * 100.0, 1)

        daily_net_co2_rate_kg = net_co2_removed_kg / max(1.0, days)
        monthly_net_projection_tonnes = (daily_net_co2_rate_kg * 30.0) / 1000.0

        return {
            "volume_m3": round(volume_m3, 2),
            "baseline_biomass_kg": round(baseline_biomass_kg, 2),
            "current_biomass_kg": round(current_biomass_kg, 2),
            "biomass_gain_kg": round(biomass_gain_kg, 2),
            "dynamic_carbon_fraction": dynamic_c_fraction,
            "carbon_pct": c_pred["carbon_pct"],
            "biochemical_breakdown": c_pred["biochemical_breakdown"],
            "carbon_fixed_kg": round(carbon_fixed_kg, 2),
            "co2_captured_kg": round(net_co2_removed_kg, 2),
            "gross_co2_captured_kg": round(gross_co2_captured_kg, 2),
            "operational_kwh": round(operational_kwh, 2),
            "operational_co2_emitted_kg": round(operational_co2_emitted_kg, 2),
            "net_co2_removed_kg": round(net_co2_removed_kg, 2),
            "operational_efficiency_pct": efficiency_pct,
            "daily_co2_rate_kg": round(daily_net_co2_rate_kg, 2),
            "monthly_co2_projection_tonnes": round(monthly_net_projection_tonnes, 3)
        }

    def calculate_farm_total_co2(self, pond_calculations: list) -> dict:
        total_biomass_gain = sum(p["biomass_gain_kg"] for p in pond_calculations)
        total_carbon_fixed = sum(p["carbon_fixed_kg"] for p in pond_calculations)
        total_gross_co2 = sum(p["gross_co2_captured_kg"] for p in pond_calculations)
        total_op_emitted = sum(p["operational_co2_emitted_kg"] for p in pond_calculations)
        total_net_co2 = sum(p["net_co2_removed_kg"] for p in pond_calculations)
        
        avg_c_fraction = round(sum(p["dynamic_carbon_fraction"] for p in pond_calculations) / max(1, len(pond_calculations)), 3)
        total_daily_net_rate = sum(p["daily_co2_rate_kg"] for p in pond_calculations)
        monthly_net_tonnes = (total_daily_net_rate * 30.0) / 1000.0

        return {
            "biomass_gain_kg": round(total_biomass_gain, 2),
            "dynamic_carbon_fraction": avg_c_fraction,
            "avg_dynamic_carbon_fraction": avg_c_fraction,
            "carbon_fixed_kg": round(total_carbon_fixed, 2),
            "co2_captured_kg": round(total_net_co2, 2),
            "gross_co2_captured_kg": round(total_gross_co2, 2),
            "operational_co2_emitted_kg": round(total_op_emitted, 2),
            "net_co2_removed_kg": round(total_net_co2, 2),
            "daily_co2_rate_kg": round(total_daily_net_rate, 2),
            "monthly_co2_projection_tonnes": round(monthly_net_tonnes, 3)
        }

co2_engine = CO2SequestrationEngine()
