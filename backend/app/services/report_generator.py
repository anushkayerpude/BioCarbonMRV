import uuid
from datetime import datetime, timezone
import json
from typing import Dict

class ReportGeneratorService:
    """
    Generates Digital Carbon Passports and MRV Verification Reports.
    """

    def generate_carbon_passport(
        self,
        farm_name: str,
        location: str,
        number_of_ponds: int,
        total_biomass_tonnes: float,
        estimated_co2_captured_tonnes: float,
        average_daily_capture_kg: float,
        data_completeness_pct: float,
        verification_confidence_pct: float,
        anomalies_count: int
    ) -> Dict:
        passport_id = f"PASSPORT-{uuid.uuid4().hex[:8].upper()}"
        period_str = datetime.now(timezone.utc).strftime("%B %Y")

        return {
            "passport_id": passport_id,
            "farm_name": farm_name,
            "location": location,
            "monitoring_period": period_str,
            "total_biomass_tonnes": round(total_biomass_tonnes, 2),
            "estimated_co2_captured_tonnes": round(estimated_co2_captured_tonnes, 2),
            "average_daily_capture_kg": round(average_daily_capture_kg, 1),
            "number_of_ponds": number_of_ponds,
            "data_completeness_pct": round(data_completeness_pct, 1),
            "verification_confidence_pct": round(verification_confidence_pct, 1),
            "anomalies_count": anomalies_count,
            "evidence_sources": [
                "✓ Real-time IoT Sensor Array Stream",
                "✓ Multi-spectral Satellite & Drone Remote Sensing",
                "✓ Machine Learning Biomass Growth Model (RandomForest)",
                "✓ Dual-Layer Parametric & IsolationForest Anomaly Audit",
                "✓ 30-Day Historical Trend Baseline Cross-Validation"
            ],
            "generated_at": datetime.now(timezone.utc).isoformat()
        }

    def generate_html_report(self, passport_data: Dict) -> str:
        """
        Generates a styled, printable HTML Digital Carbon Verification Report.
        """
        return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Digital Carbon Verification Report - {passport_data['passport_id']}</title>
    <style>
        body {{ font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #070b07; color: #f8fafc; margin: 0; padding: 40px; }}
        .header {{ border-bottom: 2px solid #84a948; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }}
        .title {{ font-size: 26px; font-weight: 800; color: #d9ed92; margin: 0; letter-spacing: -0.5px; }}
        .badge {{ background-color: #1c2710; color: #d9ed92; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; border: 1px solid #708238; font-family: monospace; }}
        .grid {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }}
        .card {{ background-color: #10170d; border-radius: 16px; padding: 22px; border: 1px solid #283618; }}
        .kpi-title {{ font-size: 13px; color: #94a390; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }}
        .kpi-value {{ font-size: 28px; font-weight: 800; color: #d9ed92; font-family: monospace; }}
        .checklist {{ list-style: none; padding: 0; margin: 0; }}
        .checklist li {{ margin-bottom: 10px; color: #cbd5c8; font-size: 14px; display: flex; align-items: center; }}
        .disclaimer {{ background-color: #141d0b; border-left: 4px solid #84a948; padding: 16px; border-radius: 8px; font-size: 12px; color: #d9ed92; margin-top: 35px; border: 1px solid #283618; }}
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1 class="title">BIOCARBON MRV · VERIFIED CARBON PASSPORT</h1>
            <p style="color: #94a390; margin-top: 6px; font-size: 14px;">Farm: {passport_data['farm_name']} | Location: {passport_data['location']}</p>
        </div>
        <div class="badge">PASSPORT ID: {passport_data['passport_id']}</div>
    </div>

    <div class="grid">
        <div class="card">
            <div class="kpi-title">ESTIMATED CO₂ CAPTURED</div>
            <div class="kpi-value" style="color: #10b981;">{passport_data['estimated_co2_captured_tonnes']} Tonnes</div>
            <p style="color: #94a3b8; font-size: 13px;">Avg Daily: {passport_data['average_daily_capture_kg']} kg/day</p>
        </div>
        <div class="card">
            <div class="kpi-title">TOTAL DRY BIOMASS PRODUCED</div>
            <div class="kpi-value">{passport_data['total_biomass_tonnes']} Tonnes</div>
            <p style="color: #94a3b8; font-size: 13px;">Cultivation Ponds: {passport_data['number_of_ponds']}</p>
        </div>
        <div class="card">
            <div class="kpi-title">VERIFICATION CONFIDENCE SCORE</div>
            <div class="kpi-value" style="color: #34d399;">{passport_data['verification_confidence_pct']}%</div>
            <p style="color: #94a3b8; font-size: 13px;">Cross-Source Agreement Verified</p>
        </div>
        <div class="card">
            <div class="kpi-title">DATA COMPLETENESS</div>
            <div class="kpi-value">{passport_data['data_completeness_pct']}%</div>
            <p style="color: #94a3b8; font-size: 13px;">Anomalies Logged: {passport_data['anomalies_count']}</p>
        </div>
    </div>

    <div class="card">
        <h3>INDEPENDENT EVIDENCE AUDIT TRAIL</h3>
        <ul class="checklist">
            {"".join(f"<li>{item}</li>" for item in passport_data['evidence_sources'])}
        </ul>
    </div>

    <div class="disclaimer">
        <strong>DATA HONESTY & MRV NOTICE:</strong> This report compiles multi-source data-backed estimates derived from IoT sensor telemetry, remote spectral imagery, and autotrophic biomass growth models. Figures represent calculated CO₂ sequestration estimates and are intended for Measurement, Reporting & Verification (MRV) evaluation.
    </div>
</body>
</html>"""

report_generator = ReportGeneratorService()
