import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import math

from app.data.spatial import haversine_distance

logger = logging.getLogger("bhuvan_provider")

class BhuvanGeospatialProvider:
    """
    ISRO / NRSC Bhuvan Geoportal & Geospatial Layers Provider.
    Supplies Indian Space Research Organisation (ISRO) spatial context:
    - Bhuvan WMS & WMTS endpoints
    - Regional water bodies (Sabarmati River, Sant Sarovar Barrage, Narmada Canal network)
    - Watershed, basin hydrology, and aquifer classification
    """

    def __init__(self):
        self.wms_endpoint = "https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms"
        self.wmts_endpoint = "https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wmts"
        self.default_wms_layers = [
            "basemap:waterbody_DEM",
            "cite:bhuvan_watershed",
            "india3"
        ]

        # Key Gujarat regional water bodies proximate to Gandhinagar/Ahmedabad cultivation site
        self._regional_water_bodies = [
            {
                "name": "Sabarmati River Channel",
                "type": "Perennial River / Controlled Flow",
                "latitude": 23.2205,
                "longitude": 72.6515,
                "basin": "Sabarmati Basin",
                "water_utility": "Regional intake source & irrigation"
            },
            {
                "name": "Sant Sarovar Barrage (Gandhinagar)",
                "type": "River Barrage / Reservoir",
                "latitude": 23.2420,
                "longitude": 72.6780,
                "basin": "Sabarmati Basin",
                "water_utility": "Surface water storage & municipal feed"
            },
            {
                "name": "Sardar Sarovar Narmada Main Canal Feeder",
                "type": "Engineered Irrigation Canal",
                "latitude": 23.1850,
                "longitude": 72.6100,
                "basin": "Narmada-Sabarmati Linkage",
                "water_utility": "Continuous bulk water conveyance"
            },
            {
                "name": "Chandola Lake (Ahmedabad)",
                "type": "Natural Wetland / Water Body",
                "latitude": 22.9850,
                "longitude": 72.5950,
                "basin": "Sabarmati Basin",
                "water_utility": "Ecological reserve & groundwater recharge"
            }
        ]

    def get_regional_water_context(
        self,
        aoi_lat: float = 23.2100,
        aoi_lon: float = 72.6300
    ) -> Dict[str, Any]:
        """
        Retrieves ISRO Bhuvan geospatial foundation context and proximity to nearest surface water bodies.
        """
        # Calculate distances to regional water bodies
        water_bodies_with_distance = []
        for wb in self._regional_water_bodies:
            dist = haversine_distance(aoi_lat, aoi_lon, wb["latitude"], wb["longitude"])
            water_bodies_with_distance.append({**wb, "distance_km": dist})

        water_bodies_with_distance.sort(key=lambda x: x["distance_km"])
        nearest = water_bodies_with_distance[0]

        return {
            "source": "ISRO_NRSC_BHUVAN",
            "provider": "Indian Space Research Organisation (ISRO) - National Remote Sensing Centre (NRSC)",
            "geoportal": "Bhuvan Geoportal (India)",
            "aoi_coordinates": {"latitude": aoi_lat, "longitude": aoi_lon},
            "wms_service": {
                "base_url": self.wms_endpoint,
                "wmts_url": self.wmts_endpoint,
                "available_layers": self.default_wms_layers,
                "preferred_layer": "basemap:waterbody_DEM"
            },
            "regional_hydrology": {
                "river_basin": "Sabarmati River Basin (Code: 5A1A2)",
                "state": "Gujarat",
                "district": "Gandhinagar / Ahmedabad",
                "agro_climatic_zone": "Zone IV: North Gujarat Plain (Semi-Arid)",
                "aquifer_type": "Deep alluvial unconfined aquifer",
                "soil_type": "Sandy Loam / Alluvium"
            },
            "nearest_water_body": nearest,
            "regional_water_bodies": water_bodies_with_distance,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

bhuvan_provider = BhuvanGeospatialProvider()
