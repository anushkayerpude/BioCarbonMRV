from app.core.config import settings

class CO2SequestrationEngine:
    """
    Calculates carbon fixation and CO2 sequestration based on net dry biomass gain.
    Uses configurable carbon fraction (default 50% carbon content in dry algae biomass)
    and stoichometric CO2/C molecular ratio (44/12 = 3.667).
    """

    def calculate_pond_co2(
        self,
        area_ha: float,
        depth_m: float,
        baseline_biomass_g_per_l: float,
        current_biomass_g_per_l: float,
        days: float = 1.0
    ) -> dict:
        # 1 Hectare = 10,000 m²
        volume_m3 = area_ha * 10000.0 * depth_m
        volume_liters = volume_m3 * 1000.0 # 1 m³ = 1000 Liters

        baseline_biomass_kg = (baseline_biomass_g_per_l * volume_liters) / 1000.0
        current_biomass_kg = (current_biomass_g_per_l * volume_liters) / 1000.0

        biomass_gain_kg = max(0.0, current_biomass_kg - baseline_biomass_kg)
        carbon_fixed_kg = biomass_gain_kg * settings.CARBON_FRACTION
        co2_captured_kg = carbon_fixed_kg * settings.CO2_TO_CARBON_RATIO

        daily_co2_rate_kg = co2_captured_kg / max(1.0, days)
        monthly_projection_tonnes = (daily_co2_rate_kg * 30.0) / 1000.0

        return {
            "volume_m3": round(volume_m3, 2),
            "baseline_biomass_kg": round(baseline_biomass_kg, 2),
            "current_biomass_kg": round(current_biomass_kg, 2),
            "biomass_gain_kg": round(biomass_gain_kg, 2),
            "carbon_fixed_kg": round(carbon_fixed_kg, 2),
            "co2_captured_kg": round(co2_captured_kg, 2),
            "daily_co2_rate_kg": round(daily_co2_rate_kg, 2),
            "monthly_co2_projection_tonnes": round(monthly_projection_tonnes, 3)
        }

    def calculate_farm_total_co2(self, pond_calculations: list) -> dict:
        total_biomass_gain = sum(p["biomass_gain_kg"] for p in pond_calculations)
        total_carbon_fixed = sum(p["carbon_fixed_kg"] for p in pond_calculations)
        total_co2_captured = sum(p["co2_captured_kg"] for p in pond_calculations)
        total_daily_rate = sum(p["daily_co2_rate_kg"] for p in pond_calculations)
        monthly_tonnes = (total_daily_rate * 30.0) / 1000.0

        return {
            "biomass_gain_kg": round(total_biomass_gain, 2),
            "carbon_fixed_kg": round(total_carbon_fixed, 2),
            "co2_captured_kg": round(total_co2_captured, 2),
            "daily_co2_rate_kg": round(total_daily_rate, 2),
            "monthly_co2_projection_tonnes": round(monthly_tonnes, 3)
        }

co2_engine = CO2SequestrationEngine()
