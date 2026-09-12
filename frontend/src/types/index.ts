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
  carbon_fixed_kg: number;
  co2_captured_kg: number;
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
}

export interface CarbonPassport {
  passport_id: string;
  farm_name: string;
  location: string;
  monitoring_period: string;
  total_biomass_tonnes: number;
  estimated_co2_captured_tonnes: number;
  average_daily_capture_kg: number;
  number_of_ponds: number;
  data_completeness_pct: number;
  verification_confidence_pct: number;
  anomalies_count: number;
  evidence_sources: string[];
  generated_at: string;
}
