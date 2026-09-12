import math
from typing import Dict, List, Any, Optional

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the great-circle distance between two points on the Earth in kilometers
    using the Haversine formula.
    """
    R = 6371.0 # Earth's radius in kilometers

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    distance_km = R * c
    return round(distance_km, 2)

def match_nearest_station(
    aoi_lat: float,
    aoi_lon: float,
    stations: List[Dict[str, Any]]
) -> Optional[Dict[str, Any]]:
    """
    Identifies the spatially nearest station to the specified Area of Interest (AOI).
    Each station dict must contain 'latitude' and 'longitude' fields.
    Returns the station dictionary augmented with 'distance_km'.
    """
    if not stations:
        return None

    nearest_station = None
    min_dist = float("inf")

    for station in stations:
        dist = haversine_distance(aoi_lat, aoi_lon, station["latitude"], station["longitude"])
        if dist < min_dist:
            min_dist = dist
            nearest_station = {**station, "distance_km": dist}

    return nearest_station
