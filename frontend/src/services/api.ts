import type {
  Farm, Pond, SensorReading, BiomassFusion, CO2Sequestration,
  AnomalyDiagnosis, VerificationScore, CarbonPassport,
  BiomassFate, CryptoAnchor, SpeciesDetection, NWDPEnvironmentalContext
} from '../types';

export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000/api/v1'
    : '/api/v1');

export function getReportHtmlUrl(farmId: string = 'ALG-001'): string {
  const root = API_BASE_URL.replace(/\/v1$/, '');
  return `${root}/reports/html?farm_id=${farmId}`;
}

export async function fetchNWDPContext(): Promise<NWDPEnvironmentalContext> {
  const res = await fetch(`${API_BASE_URL}/environmental/nwdp/context`);
  if (!res.ok) throw new Error(`Failed to fetch NWDP environmental context: ${res.statusText}`);
  return await res.json();
}

export async function fetchFarms(): Promise<Farm[]> {
  const res = await fetch(`${API_BASE_URL}/farms`);
  if (!res.ok) throw new Error(`Failed to fetch farms: ${res.statusText}`);
  return await res.json();
}

export async function fetchFarmPonds(farmId: string = 'ALG-001'): Promise<Pond[]> {
  const res = await fetch(`${API_BASE_URL}/farms/${farmId}/ponds`);
  if (!res.ok) throw new Error(`Failed to fetch ponds for farm ${farmId}`);
  return await res.json();
}

export async function fetchLatestSensor(pondId: string): Promise<SensorReading> {
  const res = await fetch(`${API_BASE_URL}/ponds/${pondId}/sensors/latest`);
  if (!res.ok) throw new Error(`Failed to fetch latest sensor reading for pond ${pondId}`);
  return await res.json();
}

export async function fetchSensorHistory(pondId: string, days: number = 7): Promise<SensorReading[]> {
  const res = await fetch(`${API_BASE_URL}/ponds/${pondId}/sensors/history?days=${days}`);
  if (!res.ok) throw new Error(`Failed to fetch sensor history for pond ${pondId}`);
  return await res.json();
}

export async function fetchBiomassFusion(pondId: string): Promise<BiomassFusion> {
  const res = await fetch(`${API_BASE_URL}/ponds/${pondId}/biomass`);
  if (!res.ok) throw new Error(`Failed to fetch biomass fusion for pond ${pondId}`);
  return await res.json();
}

export async function fetchFarmCarbon(farmId: string = 'ALG-001'): Promise<CO2Sequestration> {
  const res = await fetch(`${API_BASE_URL}/farms/${farmId}/carbon`);
  if (!res.ok) throw new Error(`Failed to fetch carbon sequestration metrics for farm ${farmId}`);
  return await res.json();
}

export async function fetchPondAnomaly(pondId: string): Promise<AnomalyDiagnosis> {
  const res = await fetch(`${API_BASE_URL}/ponds/${pondId}/anomalies`);
  if (!res.ok) throw new Error(`Failed to fetch anomaly diagnosis for pond ${pondId}`);
  return await res.json();
}

export async function fetchFarmVerification(farmId: string = 'ALG-001'): Promise<VerificationScore> {
  const res = await fetch(`${API_BASE_URL}/farms/${farmId}/verification`);
  if (!res.ok) throw new Error(`Failed to fetch verification score for farm ${farmId}`);
  return await res.json();
}

export async function fetchBiomassFate(netCo2Kg: number = 41097.5, pathwayKey: string = 'biochar'): Promise<BiomassFate> {
  const res = await fetch(`${API_BASE_URL}/biomass-fate?net_co2_kg=${netCo2Kg}&pathway_key=${pathwayKey}`);
  if (!res.ok) throw new Error(`Failed to fetch biomass fate`);
  return await res.json();
}

export async function fetchCryptoAnchor(pondId: string = 'P01'): Promise<CryptoAnchor> {
  const res = await fetch(`${API_BASE_URL}/ponds/${pondId}/crypto-anchor`);
  if (!res.ok) throw new Error(`Failed to fetch crypto anchor for pond ${pondId}`);
  return await res.json();
}

export async function fetchSpeciesDetection(pondId: string): Promise<SpeciesDetection> {
  const res = await fetch(`${API_BASE_URL}/ponds/${pondId}/species`);
  if (!res.ok) throw new Error(`Failed to fetch species detection for pond ${pondId}`);
  return await res.json();
}

export async function fetchCarbonPassport(farmId: string = 'ALG-001'): Promise<CarbonPassport> {
  const res = await fetch(`${API_BASE_URL}/farms/${farmId}/passport`);
  if (!res.ok) throw new Error(`Failed to fetch carbon passport for farm ${farmId}`);
  return await res.json();
}

export async function triggerSensorTick(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/sensors/tick`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger sensor tick');
}

export async function fetchPondImagery(pondId: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/ponds/${pondId}/imagery`);
  if (!res.ok) throw new Error(`Failed to fetch imagery for pond ${pondId}`);
  return await res.json();
}

export async function fetchCPCBWaterQuality(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/environmental/cpcb/water-quality`);
  if (!res.ok) throw new Error('Failed to fetch CPCB water quality baseline');
  return await res.json();
}

export async function fetchBhuvanContext(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/environmental/bhuvan/water-context`);
  if (!res.ok) throw new Error('Failed to fetch Bhuvan geospatial context');
  return await res.json();
}

export async function fetchMLEvaluation(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/ml/biomass/evaluation`);
  if (!res.ok) throw new Error('Failed to fetch ML biomass evaluation');
  return await res.json();
}
