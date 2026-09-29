# National Weather Intelligence Platform for India
### Smart India Hackathon (SIH 2026) • Multi-Source Hazard Corroboration & Verification

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black.svg?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An enterprise-grade, multi-source weather intelligence and human-in-the-loop verification platform built for India. The system ingests synoptic datasets, live automatic weather stations (AWS via Open-Meteo), and crowdsourced citizen ground observations. Using an AI-assisted classification and deduplication pipeline, it flags anomalies, groups duplicate reports within a 20 km radius, and surfaces prioritized events for official verification.

---

## Key Highlights

- **Multi-Source Data Ingestion:** Over 2,000 catalogued Indian weather events spanning synoptic IMD records, Open-Meteo live sensor feeds, and geotagged citizen submissions across 543 districts.
- **AI Classification & Telemetry Corroboration:** TF-IDF + Logistic Regression NLP classification across 8 Indian weather hazards (`Rainfall`, `Flooding`, `Thunderstorm`, `Heatwave`, `Fog`, `Dust storm`, `Strong winds`, `Other`).
- **Geospatial Deduplication Engine:** Haversine distance calculations combined with text cosine similarity to cluster redundant incidents within a 20 km geo-temporal window.
- **Human-in-the-Loop Triage Console:** Role-based access control (RBAC) allowing verification officers to review AI advisory cards, compare physical telemetry evidence, and render authenticated decisions (`verify`, `under_review`, `flag`, `reject`).
- **Interactive Macro Analytics Hub:** Real-time distribution charts showing national hazard frequencies, top impacted states, verification rates, and observation extremes.
- **Interactive Geographic Visualizer:** Leaflet-powered India map with severity-coded markers, cluster badges, and detailed report inspectors.

---

## Architecture Overview

```
                                  [ Citizen Reports ]
                                  [ Open-Meteo API  ]
                                  [ Synoptic Data   ]
                                          |
                                          v
                        +------------------------------------+
                        |      FastAPI Ingestion Engine      |
                        +------------------------------------+
                                          |
                   +----------------------+----------------------+
                   |                                             |
                   v                                             v
        +---------------------+                       +---------------------+
        | AI Processing Queue |                       | SQLite DB (2,000+ ) |
        | - NLP Classification|                       | - WeatherReports    |
        | - Indian Gazetteer  |                       | - EventGroups       |
        | - 20km Deduplication|                       | - AIAnalysisRecords |
        | - Telemetry Matcher |                       | - AuditTrail        |
        +---------------------+                       +---------------------+
                   |                                             |
                   +----------------------+----------------------+
                                          |
                                          v
        +-------------------------------------------------------------------+
        |                         Next.js 14 Frontend                       |
        |  /dashboard  (Live Map & KPIs)      /admin (Operations Console)   |
        |  /explorer   (Report Search)        /analytics (Macro Hub)        |
        |  /report     (Citizen Submission)   /about (Architecture)         |
        +-------------------------------------------------------------------+
```

---

## System Modules & Routes

| Route | Role / Visibility | Purpose & Capabilities |
| :--- | :--- | :--- |
| `/` | Public | National Weather Intelligence landing page |
| `/dashboard` | Public / Operations | Interactive India map with hazard markers, filters, and live KPIs |
| `/explorer` | Public / Research | Grid search & inspection of all 2,000+ multi-source reports |
| `/analytics` | Public / Policy | Hazard distributions, top impacted states, and observation extremes |
| `/report` | Citizen / Public | Geotagged ground-truth report submission portal with instant AI feedback |
| `/admin/login` | Officers / Evaluators | Role-based authentication portal with SIH evaluator quick-access |
| `/admin` | Reviewer / Admin | Operations console, review queue, AI triage, deduplication, and audit log |
| `/about` | Public | Architecture blueprint and SIH problem statement solution brief |

---

## Quickstart Guide

### 1. One-Click Launch (Windows)
Double-click `start_platform.bat` or run:
```bat
start_platform.bat
```
This automatically verifies Python dependencies, launches the FastAPI backend on port 8000, and starts the Next.js frontend on port 3000.

### 2. Docker Compose
```bash
docker compose up --build
```

### 3. Manual Development Setup

**Backend (Python 3.12+):**
```bash
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

**Frontend (Node.js 20+):**
```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser. API docs are available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

## Demo Evaluator Credentials (SIH 2026)

For jury and evaluator access to the Admin & Verification Console:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Chief Admin** | `admin@sih.gov.in` | `Admin@2026` | Full queue triage, duplicate merging, overrides, audit logs |
| **Verification Officer** | `reviewer@sih.gov.in` | `Reviewer@2026` | Queue triage, telemetry corroboration, human verification decisions |

*Note: The Admin Login portal (`/admin/login`) includes instant one-click demo login buttons for evaluators.*

---

## Verification & Testing

Run the automated 8-step end-to-end integration test:
```bash
python -m backend.tests.test_part4_e2e
```

Run frontend production build verification:
```bash
npm run build
```

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Leaflet, Lucide Icons
- **Backend:** FastAPI, Python 3.12, SQLAlchemy, Pydantic v2
- **AI & NLP:** Scikit-Learn (TF-IDF, Logistic Regression), Indian Gazetteer NER, Haversine Geospatial Matrix
- **Database:** SQLite (Relational ACID with immutable audit trails)
- **Deployment:** Docker, Docker Compose, Uvicorn, Multi-stage Node Alpine

---

## License

Built for the **Smart India Hackathon (SIH 2026)**. Released under the [MIT License](LICENSE).
