class BiomassFateEngine:
    """
    Biomass Fate & Permanence Tracking Engine.
    Applies permanence scores to harvested algae biomass based on end-product disposition:
    - Biochar / Pyrolysis: 100% Permanence (1000+ years)
    - Deep-Sea Sediment Burial: 100% Permanence (1000+ years)
    - Concrete Additive: 95% Permanence (500+ years)
    - Soil Amendment / Bio-Stimulant: 75% Permanence (100+ years)
    - Bio-Plastics / Polymers: 60% Permanence (50+ years)
    - Animal Feed / Protein: 15% Permanence (1-5 years)
    - Biofuel / Combustion: 0% Permanence (Immediate carbon release)
    """

    PATHWAYS = {
        "biochar": {
            "name": "Biochar & Pyrolysis Soil Injection",
            "permanence_score_pct": 100.0,
            "permanence_horizon": "1000+ Years (Geological)",
            "tier": "TIER_1_PERMANENT"
        },
        "deep_sea": {
            "name": "Deep-Sea Anoxic Sediment Burial",
            "permanence_score_pct": 100.0,
            "permanence_horizon": "1000+ Years (Oceanic)",
            "tier": "TIER_1_PERMANENT"
        },
        "concrete": {
            "name": "Bio-Concrete Building Material Additive",
            "permanence_score_pct": 95.0,
            "permanence_horizon": "500+ Years (Built Env)",
            "tier": "TIER_1_PERMANENT"
        },
        "soil_amendment": {
            "name": "Agricultural Soil Amendment",
            "permanence_score_pct": 75.0,
            "permanence_horizon": "100+ Years (Regenerative)",
            "tier": "TIER_2_DURABLE"
        },
        "bioplastic": {
            "name": "Durable Bio-Polymers & Composites",
            "permanence_score_pct": 60.0,
            "permanence_horizon": "50+ Years (Industrial)",
            "tier": "TIER_2_DURABLE"
        },
        "animal_feed": {
            "name": "Aquaculture & Cattle Protein Feed",
            "permanence_score_pct": 15.0,
            "permanence_horizon": "1-5 Years (Short Cycle)",
            "tier": "TIER_3_SHORT_CYCLE"
        },
        "biofuel": {
            "name": "Aviation Biofuel / Combustion",
            "permanence_score_pct": 0.0,
            "permanence_horizon": "Immediate Emission (Recycled)",
            "tier": "TIER_4_NEUTRAL"
        }
    }

    def calculate_permanence_credits(self, net_co2_kg: float, pathway_key: str = "biochar") -> dict:
        pathway = self.PATHWAYS.get(pathway_key, self.PATHWAYS["biochar"])
        score_pct = pathway["permanence_score_pct"]
        permanent_credits_kg = (net_co2_kg * score_pct) / 100.0

        return {
            "pathway_key": pathway_key,
            "pathway_name": pathway["name"],
            "permanence_score_pct": score_pct,
            "permanence_horizon": pathway["permanence_horizon"],
            "tier": pathway["tier"],
            "net_co2_removed_kg": round(net_co2_kg, 2),
            "permanent_credits_kg": round(permanent_credits_kg, 2),
            "permanent_credits_tonnes": round(permanent_credits_kg / 1000.0, 3)
        }

biomass_fate_engine = BiomassFateEngine()
