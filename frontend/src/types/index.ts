export interface Farm {
  farm_id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  area: number;
  number_of_ponds: number;
  species: string;
  created_at?: string;
}

export interface Pond {
  pond_id: string;
  farm_id: string;
  name: string;
  area: number;
  depth: number;
  species: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  baseline_biomass: number;
  current_biomass: number;
  updated_at?: string;
  dynamic_carbon_fraction?: number;
  species_purity_pct?: number;
}

export interface SensorReading {
  timestamp: string;
  pond_id: string;
  temperature: number;
  ph: number;
  dissolved_oxygen: number;
  turbidity: number;
  co2_concentration: number;
  light_intensity: number;
  biomass_density: number;
  water_level: number;
}

export interface DynamicCarbonPrediction {
  dynamic_carbon_fraction: number;
  carbon_pct: number;
  biochemical_breakdown: {
    lipid_pct: number;
    protein_pct: number;
    carbohydrate_pct: number;
  };
  stress_factors: {
    ph_stress: boolean;
    thermal_stress: boolean;
  };
}

export interface BiomassFusion {
  pond_id?: string;
  final_biomass: number;
  sensor_estimate: number;
  image_estimate: number;
  ml_estimate: number;
  ml_confidence: number;
  image_confidence: number;
  weights: {
    sensor_weight: number;
    image_weight: number;
    ml_weight: number;
  };
}

export interface CO2Sequestration {
  pond_id?: string;
  farm_id?: string;
  baseline_biomass_kg: number;
  current_biomass_kg: number;
  biomass_gain_kg: number;
  dynamic_carbon_fraction?: number;
  carbon_pct?: number;
  carbon_fixed_kg: number;
  co2_captured_kg: number;
  gross_co2_captured_kg?: number;
  operational_kwh?: number;
  operational_co2_emitted_kg?: number;
  net_co2_removed_kg?: number;
  operational_efficiency_pct?: number;
  daily_co2_rate_kg: number;
  monthly_co2_projection_tonnes: number;
}

export interface AnomalyDiagnosis {
  pond_id: string;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
  title: string;
  explanation: string;
  rule_flags: string[];
  ml_outlier: boolean;
  estimated_capture_loss_kg: number;
}

export interface VerificationScore {
  pond_id?: string;
  farm_id?: string;
  sensor_estimate: number;
  image_estimate: number;
  ml_estimate: number;
  final_biomass: number;
  sensor_agreement_pct: number;
  image_agreement_pct: number;
  ml_confidence_pct: number;
  data_completeness_pct: number;
  historical_consistency_pct: number;
  overall_confidence_pct: number;
  evidence_checklist: string[];
  crypto_anchor?: CryptoAnchor;
}

export interface BiomassFate {
  pathway_key: string;
  pathway_name: string;
  permanence_score_pct: number;
  permanence_horizon: string;
  tier: string;
  net_co2_removed_kg: number;
  permanent_credits_kg: number;
  permanent_credits_tonnes: number;
}

export interface CryptoAnchor {
  anchor_id: string;
  sha256_hash: string;
  previous_hash: string;
  merkle_root: string;
  timestamp: string;
  status: string;
  audit_trail_valid: boolean;
  signature: string;
}

export interface SpeciesDetection {
  species_detected: string;
  species_purity_pct: number;
  cyanobacteria_index: number;
  blue_green_ratio: number;
  red_green_ratio: number;
  risk_level: 'OPTIMAL_PURITY' | 'MODERATE_DRIFT' | 'CRITICAL_CONTAMINATION';
  explanation: string;
}

export interface CarbonPassport {
  passport_id: string;
  farm_name: string;
  location: string;
  monitoring_period: string;
  total_biomass_tonnes: number;
  estimated_co2_captured_tonnes: number;
  net_co2_removed_tonnes?: number;
  average_daily_capture_kg: number;
  number_of_ponds: number;
  data_completeness_pct: number;
  verification_confidence_pct: number;
  anomalies_count: number;
  evidence_sources: string[];
  generated_at: string;
  dynamic_carbon_pct?: number;
  biomass_fate?: BiomassFate;
  crypto_anchor?: CryptoAnchor;
}

export interface NWDPParameterVal {
  value: number;
  unit: string;
  station_id: string;
  station_name: string;
  distance_to_aoi_km: number;
}

export interface NWDPEnvironmentalContext {
  source: string;
  label: string;
  timestamp: string;
  parameters: {
    temperature: NWDPParameterVal;
    solar_radiation: NWDPParameterVal;
    rainfall: NWDPParameterVal;
    relative_humidity: NWDPParameterVal;
  };
  fallback_active: boolean;
}

