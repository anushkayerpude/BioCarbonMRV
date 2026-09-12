import json
import logging
from pathlib import Path
from datetime import datetime, timezone

from app.data.pipeline import environmental_pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nwdp_ingest")

def run_ingestion():
    base_dir = Path(__file__).resolve().parent.parent.parent
    processed_dir = base_dir / "data" / "processed"
    metadata_dir = base_dir / "data" / "metadata"
    processed_dir.mkdir(parents=True, exist_ok=True)
    metadata_dir.mkdir(parents=True, exist_ok=True)

    processed_file = processed_dir / "nwdp_environmental_feature_store.json"
    metadata_file = metadata_dir / "nwdp_multi_param_metadata.json"

    # Run ingestion across all 4 parameters
    summary = environmental_pipeline.initialize_and_run()
    provider = environmental_pipeline.provider

    # Export canonical records for all parameters
    all_normalized_records = []
    for param in ["temperature", "solar_radiation", "rainfall", "relative_humidity"]:
        recs = provider.get_normalized_records_for_parameter(param)
        all_normalized_records.extend(recs)

    with open(processed_file, "w", encoding="utf-8") as f:
        json.dump(all_normalized_records, f, indent=2)

    # Export Metadata Summary
    metadata = {
        "ingested_at": datetime.now(timezone.utc).isoformat(),
        "total_canonical_records": len(all_normalized_records),
        "parameters_summary": summary,
        "aoi": {
            "name": "BioCarbonMRV Gujarat Demonstration AOI (ALG-001)",
            "latitude": environmental_pipeline.aoi_lat,
            "longitude": environmental_pipeline.aoi_lon
        }
    }

    with open(metadata_file, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # Print Formatted CLI Summary Output
    t_sum = summary["temperature"]
    s_sum = summary["solar_radiation"]
    r_sum = summary["rainfall"]
    h_sum = summary["relative_humidity"]

    print("NWDP ingestion complete\n")

    print("Temperature:")
    print(f"  rows: {t_sum['row_count']}")
    print(f"  stations: {t_sum['station_count']}")
    print(f"  date range: {t_sum['date_range_start']} to {t_sum['date_range_end']}\n")

    print("Solar radiation:")
    print(f"  rows: {s_sum['row_count']}")
    print(f"  stations: {s_sum['station_count']}")
    print(f"  date range: {s_sum['date_range_start']} to {s_sum['date_range_end']}\n")

    print("Rainfall:")
    print(f"  rows: {r_sum['row_count']}")
    print(f"  stations: {r_sum['station_count']}")
    print(f"  date range: {r_sum['date_range_start']} to {r_sum['date_range_end']}\n")

    print("Relative humidity:")
    print(f"  rows: {h_sum['row_count']}")
    print(f"  stations: {h_sum['station_count']}")
    print(f"  date range: {h_sum['date_range_start']} to {h_sum['date_range_end']}\n")

    print("Spatial matching:")
    print(f"  nearest temperature station: {t_sum['nearest_station']['station_name']} ({t_sum['nearest_station']['station_id']}) [{t_sum['nearest_station']['distance_km']} km]")
    print(f"  nearest solar station: {s_sum['nearest_station']['station_name']} ({s_sum['nearest_station']['station_id']}) [{s_sum['nearest_station']['distance_km']} km]")
    print(f"  nearest rainfall station: {r_sum['nearest_station']['station_name']} ({r_sum['nearest_station']['station_id']}) [{r_sum['nearest_station']['distance_km']} km]")
    print(f"  nearest humidity station: {h_sum['nearest_station']['station_name']} ({h_sum['nearest_station']['station_id']}) [{h_sum['nearest_station']['distance_km']} km]")

if __name__ == "__main__":
    run_ingestion()
