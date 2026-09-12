# BioCarbonMRV

> **From algae growth to verified carbon impact.**

**BioCarbonMRV** is an AI-powered digital Measurement, Reporting & Verification (MRV) platform for algae-based carbon removal. It combines simulated IoT sensor data, remote imagery, historical trends, and machine-learning biomass predictions to estimate CO₂ capture, detect underperforming ponds, and provide an explainable evidence trail for every carbon estimate.

> **HackOut — DA-IICT | Circular Carbon Ecosystem | Hackathon MVP**

---

## Why BioCarbonMRV?

Algae farms can capture CO₂ while producing valuable biomass, but carbon-removal claims are difficult to independently validate.

A single sensor reading or model output is not enough.

BioCarbonMRV approaches the problem through **multi-source evidence fusion**:

```text
             ALGAE FARM
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
   IoT Sensors          Drone/Satellite
       │                   Imagery
       └──────────┬──────────┘
                  ▼
          AI Biomass Model
                  │
                  ▼
          DATA FUSION ENGINE
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
 Biomass Estimate       Anomaly Detection
       │                     │
       └──────────┬──────────┘
                  ▼
          CO₂ ESTIMATION
                  │
                  ▼
        VERIFICATION ENGINE
                  │
                  ▼
       CONFIDENCE + EVIDENCE
                  │
                  ▼
       CARBON REPORT/PASSPORT
```

The core principle is simple:

> **Every carbon-capture estimate should have an explainable evidence trail rather than being a single black-box number.**

---

## Key Features

### 🌱 Farm & Pond Monitoring

- One demo algae farm
- Six monitored ponds
- Pond-level health states
- Live environmental metrics
- Pond digital twin/status view

### 📡 Simulated IoT Monitoring

The MVP simulates sensor readings every few seconds.

Tracked parameters include:

- Temperature
- pH
- Dissolved oxygen
- Turbidity
- CO₂ concentration
- Light intensity
- Biomass density
- Water level

The simulator maintains continuity, natural fluctuations, and deliberate anomaly behavior.

### 🛰️ Remote Imagery

The MVP uses preloaded/sample imagery rather than depending on an external satellite API.

The image pipeline derives an algae proxy from visual features such as:

- RGB channels
- Normalized green index
- Color ratios
- Pixel intensity
- Water/algae area ratio

### 🤖 AI Biomass Prediction

A supervised ML model predicts next biomass using environmental and historical features.

Preferred model:

```text
RandomForestRegressor
```

A deterministic fallback is used if model training fails or data is insufficient.

### 🔬 Multi-Source Data Fusion

Three biomass estimates are combined:

```text
Sensor estimate     40%
Image estimate      30%
ML estimate         30%
```

```text
Final Biomass =
    0.40 × Sensor
  + 0.30 × Image
  + 0.30 × ML
```

The weights are configurable.

### 🚨 Anomaly Detection

BioCarbonMRV uses two layers:

**Rule-based detection** - pH threshold violations - Temperature threshold violations - Rapid biomass decline - Abnormal dissolved oxygen - Large sensor changes

**ML detection** - IsolationForest - Environmental + biomass features - NORMAL / WARNING / CRITICAL classification

The system also generates a human-readable explanation of likely contributing factors.

### 🧮 Estimated CO₂ Capture

The MVP uses a configurable biomass-based estimation model:

```text
biomass_gain =
    current_biomass - baseline_biomass

carbon_fixed =
    biomass_gain × carbon_fraction

CO₂_captured =
    carbon_fixed × 44 / 12
```

All carbon values are explicitly presented as **estimates**, not guaranteed sequestration.

### 🛡️ Verification Confidence

For each carbon estimate, the verification engine evaluates:

- Sensor agreement
- Image agreement
- ML confidence
- Data completeness
- Historical consistency

These are combined into an overall **Verification Confidence** score.

### 📊 Carbon Passport

The platform can generate a farm-level carbon passport containing:

- Farm identity
- Monitoring period
- Biomass production
- Estimated CO₂ capture
- Average daily capture
- Pond count
- Data completeness
- Verification confidence
- Detected anomalies
- Evidence sources
- Methodology summary

---

## Demo Scenario

The primary demonstration centers around **Pond 04**.

### 1. Live Farm Dashboard

The dashboard shows:

- Estimated CO₂ captured today
- Monthly estimated capture
- Total biomass
- Active ponds
- Growth rate
- Verification confidence
- Live sensor readings

### 2. Detect the Anomaly

Pond 04 transitions into a critical state.

Example behavior:

```text
Biomass     ↓
pH          ↑
Temperature ↑
CO₂ uptake  ↓
```

### 3. AI Diagnosis

The platform explains the event:

> Productivity decline likely caused by pH + temperature stress.

### 4. Inspect Evidence

The judge can open the carbon estimate and inspect:

```text
Sensor estimate
Image estimate
ML estimate
Cross-source agreement
Data completeness
Historical consistency
Overall confidence
```

### 5. Generate Carbon Report

The final report presents the farm's estimated carbon performance and the evidence supporting the estimate.

---

## Demo Data

The MVP is seeded with:

- 1 farm
- 6 ponds
- 30 days of historical data
- Multiple sensor readings
- Healthy ponds
- Variable ponds
- One deliberately anomalous pond

Default pond states:

| Pond | Status |
| --- | --- |
| P01 | Healthy |
| P02 | Healthy |
| P03 | Healthy |
| P04 | Critical |
| P05 | Healthy |
| P06 | Warning |

**Pond 04 is the primary demonstration anomaly.**

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Map-compatible visualization

### Backend

- Python
- FastAPI
- Pydantic
- NumPy
- Pandas
- scikit-learn

### Data

- SQLite / seeded demo data
- JSON configuration where appropriate

### ML

- RandomForestRegressor
- IsolationForest

### Image Processing

- OpenCV
- NumPy
- Pillow

---

## Project Structure

```text
biocarbon-mrv/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── charts/
│   │   ├── maps/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── ml/
│   │   ├── carbon/
│   │   ├── simulation/
│   │   ├── imagery/
│   │   └── main.py
│   │
│   ├── data/
│   ├── models/
│   └── requirements.txt
│
├── reports/
├── README.md
└── .env.example
```

---

## API

The backend exposes REST endpoints for the main product modules.

### Farms

```text
GET /api/farms
GET /api/farms/{farm_id}
```

### Ponds

```text
GET /api/farms/{farm_id}/ponds
GET /api/ponds/{pond_id}
```

### Sensors

```text
GET /api/ponds/{pond_id}/sensors/latest
GET /api/ponds/{pond_id}/sensors/history
```

### Biomass

```text
GET /api/ponds/{pond_id}/biomass
POST /api/biomass/predict
```

### Carbon

```text
GET /api/ponds/{pond_id}/carbon
GET /api/farms/{farm_id}/carbon
```

### Anomalies

```text
GET /api/ponds/{pond_id}/anomalies
GET /api/farms/{farm_id}/anomalies
```

### Verification

```text
GET /api/ponds/{pond_id}/verification
GET /api/farms/{farm_id}/verification
```

### Reports

```text
POST /api/reports/generate
GET /api/reports/{report_id}
```

---

## Running Locally

### Prerequisites

- Node.js 18+
- npm
- Python 3.10+

### Backend

```bash
cd backend

python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend: `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

### Frontend

Open another terminal:

```bash
cd frontend

npm install
npm run dev
```

Frontend: `http://localhost:5173`

---

## Environment Variables

Create a `.env` file where required.

Example:

```env
API_URL=http://localhost:8000
```

Do not expose secrets or API keys in frontend code.

---

## Data Honesty

This is a hackathon MVP.

The system may use:

- Simulated sensor data
- Seeded historical data
- Sample/generated imagery
- Estimated biomass
- Estimated CO₂ capture

The interface should clearly distinguish:

```text
SIMULATED SENSOR DATA
ESTIMATED CO₂ CAPTURE
ESTIMATED BIOMASS
VERIFICATION CONFIDENCE
```

BioCarbonMRV does **not** claim:

- Certified carbon credits
- Government verification
- Guaranteed carbon removal
- Formal carbon certification

The verification score represents **evidence confidence**, not regulatory certification.

---

## Product Positioning

BioCarbonMRV is not simply:

> "An algae monitoring dashboard."

It is positioned as:

> **An AI-powered digital MRV platform for algae-based carbon removal.**

### Core Value Proposition

> **Measure biomass. Verify growth. Quantify carbon capture. Detect anomalies. Build trust in algae-based carbon removal.**

---

## Future Extensions

The architecture is designed to support future integration with:

- Real IoT hardware
- MQTT
- LoRaWAN
- Sentinel satellite imagery
- Drone imagery
- Multispectral cameras
- Real-time weather APIs
- Advanced computer vision
- Species-specific biomass models
- Carbon-credit registry integrations
- Blockchain evidence anchoring
- Automated carbon documentation
- Multi-farm management
- Predictive maintenance
- Algae harvesting optimization
- Biofuel/bioplastic production tracking

These are intentionally outside the hackathon MVP.

---

## MVP Philosophy

The project prioritizes **reliability and explainability over infrastructure complexity**.

The most important product experience is:

```text
LIVE FARM
    ↓
POND ANOMALY
    ↓
AI DIAGNOSIS
    ↓
BIOMASS ESTIMATE
    ↓
CO₂ ESTIMATE
    ↓
MULTI-SOURCE EVIDENCE
    ↓
VERIFICATION CONFIDENCE
    ↓
CARBON PASSPORT
```

A judge should be able to understand this flow in approximately **60 seconds**.

---

## Hackathon

**HackOut — DA-IICT**  
**Theme:** Circular Carbon Ecosystem  
**Problem Statement:** Algae-Based Carbon Sequestration Monitoring  
**Project:** BioCarbonMRV  
**Team:** kittycat

---

## License

This project was developed as a hackathon MVP. Add an appropriate open-source license before public redistribution.
