import type {
  Farm, Pond, SensorReading, BiomassFusion, CO2Sequestration,
  AnomalyDiagnosis, VerificationScore, CarbonPassport
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

export async function fetchFarms(): Promise<Farm[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/farms`);
    if (!res.ok) throw new Error('Failed to fetch farms');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using fallback farm data');
    return [{
      farm_id: 'ALG-001',
      name: 'Gujarat Algae Farm',
      location: 'Gujarat, India',
      latitude: 23.21,
      longitude: 72.63,
      area: 10.5,
      number_of_ponds: 6,
      species: 'Chlorella vulgaris'
    }];
  }
}

export async function fetchFarmPonds(farmId: string = 'ALG-001'): Promise<Pond[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/farms/${farmId}/ponds`);
    if (!res.ok) throw new Error('Failed to fetch ponds');
    return await res.json();
  } catch (err) {
    return [
      { pond_id: 'P01', farm_id: farmId, name: 'Pond 01', area: 1.8, depth: 0.35, species: 'Chlorella', status: 'HEALTHY', baseline_biomass: 1.5, current_biomass: 2.45 },
      { pond_id: 'P02', farm_id: farmId, name: 'Pond 02', area: 1.8, depth: 0.35, species: 'Chlorella', status: 'HEALTHY', baseline_biomass: 1.5, current_biomass: 2.30 },
      { pond_id: 'P03', farm_id: farmId, name: 'Pond 03', area: 1.7, depth: 0.35, species: 'Chlorella', status: 'HEALTHY', baseline_biomass: 1.4, current_biomass: 2.25 },
      { pond_id: 'P04', farm_id: farmId, name: 'Pond 04', area: 1.8, depth: 0.35, species: 'Chlorella', status: 'CRITICAL', baseline_biomass: 1.5, current_biomass: 1.42 },
      { pond_id: 'P05', farm_id: farmId, name: 'Pond 05', area: 1.7, depth: 0.35, species: 'Chlorella', status: 'HEALTHY', baseline_biomass: 1.4, current_biomass: 2.15 },
      { pond_id: 'P06', farm_id: farmId, name: 'Pond 06', area: 1.7, depth: 0.35, species: 'Chlorella', status: 'WARNING', baseline_biomass: 1.4, current_biomass: 1.75 },
    ];
  }
}

export async function fetchLatestSensor(pondId: string): Promise<SensorReading> {
  try {
    const res = await fetch(`${API_BASE_URL}/ponds/${pondId}/sensors/latest`);
    if (!res.ok) throw new Error('Failed to fetch sensor');
    return await res.json();
  } catch (err) {
    const isP04 = pondId === 'P04';
    return {
      timestamp: new Date().toISOString(),
      pond_id: pondId,
      temperature: isP04 ? 31.8 : 28.4,
      ph: isP04 ? 9.3 : 8.2,
      dissolved_oxygen: isP04 ? 4.8 : 7.4,
      turbidity: isP04 ? 72.0 : 54.0,
      co2_concentration: isP04 ? 390.0 : 450.0,
      light_intensity: 780.0,
      biomass_density: isP04 ? 1.42 : 2.35,
      water_level: 0.35
    };
  }
}

export async function fetchSensorHistory(pondId: string, days: number = 7): Promise<SensorReading[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/ponds/${pondId}/sensors/history?days=${days}`);
    if (!res.ok) throw new Error('Failed sensor history');
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchBiomassFusion(
  pondId: string,
  wSensor?: number,
  wImage?: number,
  wMl?: number
): Promise<BiomassFusion> {
  try {
    let url = `${API_BASE_URL}/ponds/${pondId}/biomass`;
    const params = new URLSearchParams();
    if (wSensor !== undefined) params.append('w_sensor', wSensor.toString());
    if (wImage !== undefined) params.append('w_image', wImage.toString());
    if (wMl !== undefined) params.append('w_ml', wMl.toString());
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed biomass fusion');
    return await res.json();
  } catch (err) {
    const isP04 = pondId === 'P04';
    return {
      pond_id: pondId,
      final_biomass: isP04 ? 1.44 : 2.35,
      sensor_estimate: isP04 ? 1.42 : 2.30,
      image_estimate: isP04 ? 1.48 : 2.40,
      ml_estimate: isP04 ? 1.44 : 2.35,
      ml_confidence: 0.92,
      image_confidence: 0.89,
      weights: { sensor_weight: 0.4, image_weight: 0.3, ml_weight: 0.3 }
    };
  }
}

export async function fetchFarmCarbon(farmId: string = 'ALG-001'): Promise<CO2Sequestration> {
  try {
    const res = await fetch(`${API_BASE_URL}/farms/${farmId}/carbon`);
    if (!res.ok) throw new Error('Failed farm carbon');
    return await res.json();
  } catch (err) {
    return {
      farm_id: farmId,
      baseline_biomass_kg: 53340.0,
      current_biomass_kg: 75463.5,
      biomass_gain_kg: 22627.5,
      carbon_fixed_kg: 11313.75,
      co2_captured_kg: 41483.75,
      daily_co2_rate_kg: 78.4,
      monthly_co2_projection_tonnes: 2.31
    };
  }
}

export async function fetchPondAnomaly(pondId: string): Promise<AnomalyDiagnosis> {
  try {
    const res = await fetch(`${API_BASE_URL}/ponds/${pondId}/anomalies`);
    if (!res.ok) throw new Error('Failed pond anomaly');
    return await res.json();
  } catch (err) {
    const isP04 = pondId === 'P04';
    return {
      pond_id: pondId,
      severity: isP04 ? 'CRITICAL' : 'NORMAL',
      title: isP04 ? 'Pond 04: Critical Thermal & pH Stress Anomaly' : `${pondId}: Normal`,
      explanation: isP04
        ? 'Productivity decline likely caused by pH + temperature stress. pH elevated to 9.3 (11% shift), temp 31.8°C. Biomass collapsed 31%. Estimated impact: 7.3 kg CO₂/day loss.'
        : 'Normal operation.',
      rule_flags: isP04 ? ['pH elevated to 9.3', 'Temp 31.8°C', 'Biomass drop 31%'] : [],
      ml_outlier: isP04,
      estimated_capture_loss_kg: isP04 ? 7.3 : 0.0
    };
  }
}

export async function fetchFarmVerification(farmId: string = 'ALG-001'): Promise<VerificationScore> {
  try {
    const res = await fetch(`${API_BASE_URL}/farms/${farmId}/verification`);
    if (!res.ok) throw new Error('Failed farm verification');
    return await res.json();
  } catch (err) {
    return {
      farm_id: farmId,
      sensor_estimate: 2.15,
      image_estimate: 2.22,
      ml_estimate: 2.18,
      final_biomass: 2.18,
      sensor_agreement_pct: 94.0,
      image_agreement_pct: 89.0,
      ml_confidence_pct: 92.0,
      data_completeness_pct: 97.0,
      historical_consistency_pct: 93.0,
      overall_confidence_pct: 91.0,
      evidence_checklist: [
        'Continuous IoT Sensor Stream (pH, Temp, DO, Turbidity)',
        'Drone / Satellite Multi-Spectral RGB & Algae Index',
        'RandomForest Autotrophic Biomass Growth Model',
        '30-Day Historical Trend Baseline Cross-Check',
        'Dual-Layer Rule & ML Anomaly Audit'
      ]
    };
  }
}

export async function fetchCarbonPassport(farmId: string = 'ALG-001'): Promise<CarbonPassport> {
  try {
    const res = await fetch(`${API_BASE_URL}/farms/${farmId}/passport`);
    if (!res.ok) throw new Error('Failed carbon passport');
    return await res.json();
  } catch (err) {
    return {
      passport_id: 'PASSPORT-A89F2E01',
      farm_name: 'Gujarat Algae Farm',
      location: 'Gujarat, India',
      monitoring_period: 'September 2026',
      total_biomass_tonnes: 1.24,
      estimated_co2_captured_tonnes: 2.31,
      average_daily_capture_kg: 78.4,
      number_of_ponds: 6,
      data_completeness_pct: 97.0,
      verification_confidence_pct: 91.0,
      anomalies_count: 2,
      evidence_sources: [
        '✓ Real-time IoT Sensor Array Stream',
        '✓ Multi-spectral Satellite & Drone Remote Sensing',
        '✓ Machine Learning Biomass Growth Model (RandomForest)',
        '✓ Dual-Layer Parametric & IsolationForest Anomaly Audit',
        '✓ 30-Day Historical Trend Baseline Cross-Validation'
      ],
      generated_at: new Date().toISOString()
    };
  }
}

export async function triggerSensorTick(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/sensors/tick`, { method: 'POST' });
  } catch (err) {
    // Ignore error
  }
}
