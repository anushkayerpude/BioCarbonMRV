from typing import Dict, Any, Optional

PARAMETER_UNITS = {
    "temperature": "°C",
    "solar_radiation": "W/m²",
    "rainfall": "mm",
    "relative_humidity": "%"
}

PARAMETER_DATASET_NAMES = {
    "temperature": "Gujarat Temperature Telemetry Hourly",
    "solar_radiation": "Gujarat Solar Radiation Telemetry Hourly",
    "rainfall": "Gujarat Rainfall Telemetry Hourly",
    "relative_humidity": "Gujarat Relative Humidity Telemetry Hourly"
}

def create_canonical_observation(
    source: str,
    dataset: str,
    station_id: str,
    station_name: str,
    latitude: float,
    longitude: float,
    timestamp_iso: str,
    parameter: str,
    value: float,
    unit: str,
    quality_code: str = "PASSED_QC"
) -> Dict[str, Any]:
    """
    Constructs the exact canonical environmental observation schema:
    {
        "source": "NWDP",
        "dataset": "...",
        "station_id": "...",
        "station_name": "...",
        "latitude": 0,
        "longitude": 0,
        "timestamp": "...",
        "parameter": "...",
        "value": 0,
        "unit": "..."
    }
    """
    return {
        "source": str(source),
        "dataset": str(dataset),
        "station_id": str(station_id),
        "station_name": str(station_name),
        "latitude": round(float(latitude), 4),
        "longitude": round(float(longitude), 4),
        "timestamp": str(timestamp_iso),
        "parameter": str(parameter),
        "value": round(float(value), 2),
        "unit": str(unit),
        "quality_code": str(quality_code)
    }

def normalize_nwdp_record(
    station_code: str,
    station_name: str,
    latitude: float,
    longitude: float,
    timestamp_iso: str,
    parameter: str,
    value: float,
    quality_code: str = "PASSED_QC"
) -> Dict[str, Any]:
    """
    Normalizes raw observation into the canonical schema based on parameter metadata.
    """
    unit = PARAMETER_UNITS.get(parameter, "")
    dataset = PARAMETER_DATASET_NAMES.get(parameter, f"Gujarat {parameter.capitalize()} Telemetry Hourly")
    
    return create_canonical_observation(
        source="NWDP",
        dataset=dataset,
        station_id=station_code,
        station_name=station_name,
        latitude=latitude,
        longitude=longitude,
        timestamp_iso=timestamp_iso,
        parameter=parameter,
        value=value,
        unit=unit,
        quality_code=quality_code
    )
