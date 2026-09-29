# National Weather Intelligence Platform for India
### Smart India Hackathon (SIH 2026) • Multi-Source Hazard Corroboration & Verification

The National Weather Intelligence Platform for India is an AI-assisted meteorological data fusion, event classification, and human-in-the-loop verification system. The platform aggregates weather reports from permitted internet sources, synoptic meteorological datasets, automated weather station (AWS) feeds, and crowdsourced citizen ground observations. It organizes reports by location, time, and weather event, cross-corroborates physical telemetry, deduplicates incident clusters within a 20-kilometer radius, and presents actionable intelligence through interactive dashboards, macro analytics, and an official administrative triage console.

---

## Problem Statement & Objective

During extreme weather events (such as intense cloudbursts, urban flash floods, localized squalls, severe thunderstorms, and heatwaves), ground information is often scattered, contradictory, or delayed across disparate sources. 

This platform addresses these challenges by:
- Ingesting heterogeneous weather observations across all 543 Indian parliamentary districts.
- Extracting geographic entities (districts, localities, landmarks) and temporal markers from text.
- Classifying multi-lingual and unstructured reports into standardized Indian meteorological hazard categories.
- Clustering and deduplicating nearby concurrent reports using geospatial Haversine metrics and cosine text similarity.
- Cross-corroborating reports against numerical telemetry (precipitation, pressure, wind gusts, temperature, air quality).
- Enforcing a strict Human-in-the-Loop verification protocol where AI assists and prioritizes, but human officers sign off on official alerts.

---

## Core System Architecture

```
                       [ Citizen Ground Reports ]
                       [ Automatic Weather (AWS) ]
                       [ Synoptic Datasets       ]
                                   |
                                   v
                 +-----------------------------------+
                 |    Weather Ingestion Pipeline     |
                 +-----------------------------------+
                                   |
            +----------------------+----------------------+
            |                                             |
            v                                             v
 +----------------------+                      +----------------------+
 | AI Processing Engine |                      | Relational Database  |
 | - NLP Classification |                      | - 2,000+ Incidents   |
 | - Gazetteer NER      |                      | - Clustered Groups   |
 | - 20km Deduplication |                      | - AI Analysis Logs   |
 | - Telemetry Corrobor.|                      | - Audit History Log  |
 +----------------------+                      +----------------------+
            |                                             |
            +----------------------+----------------------+
                                   |
                                   v
 +--------------------------------------------------------------------+
 |                       Web Application Interface                    |
 |                                                                    |
 |  /dashboard   - Live India Map, Severity Filters & KPIs            |
 |  /explorer    - Multi-Filter Weather Incident Browser              |
 |  /analytics   - Macro Hazard Distribution & Regional Impact Hub    |
 |  /report      - Citizen Geotagged Ground Truth Submission Portal   |
 |  /admin/login - Role-Based Authentication Gateway                  |
 |  /admin       - Operations Console, Review Queue & Triage Workflow |
 |  /about       - Technical Blueprint & Problem Statement Brief      |
 +--------------------------------------------------------------------+
```

---

## Key Capabilities & Features

### 1. Multi-Source Ingestion & Data Catalog
- Ingests and standardizes 24,070 synoptic rows and 7,056 urban weather records into unified schema structures.
- Connectors for live automated weather station sensor data and synoptic baselines.
- Real-time citizen ground-truth submission pipeline with geotagging and media uploads.

### 2. AI Hazard Classification & Entity Extraction
- Multi-class NLP classifier trained across 8 core Indian hazard categories:
  - Rainfall
  - Flooding
  - Thunderstorm
  - Heatwave
  - Fog
  - Dust storm
  - Strong winds
  - Other / Unclear
- Gazetteer-based Named Entity Recognition (NER) covering Indian states, districts, and urban landmarks.
- Extraction of temporal cues and localized impact phrases.

### 3. Geospatial Deduplication & Incident Clustering
- Haversine distance matrix identifying candidate reports within a 20 km proximity.
- Cosine textual similarity identifying duplicate descriptions.
- Automated tagging into three cluster tiers:
  - Possible Duplicate (same locality, same hazard window)
  - Related (broader district impact)
  - Independent (unique isolated event)
- Incident consolidation workflow allowing officers to merge redundant reports under a single canonical incident group.

### 4. Human-in-the-Loop Verification Console
- Clear operational separation: AI generates evidence recommendations; human officers make final verification determinations.
- Four triage decision states:
  - Verified: Confirmed ground truth published to public dashboard.
  - Under Review: Investigating; awaiting corroborating automatic station telemetry.
  - Flagged: Anomaly detected or conflicting data.
  - Rejected: False alert or spam.
- Immutable audit trail recording officer identity, timestamp, previous status, updated status, and rationale.

### 5. Macro Analytics & National Impact Hub
- Real-time hazard frequency and percentage distribution charts.
- Top 10 impacted Indian states density index.
- Triage health monitoring (Verified vs. Pending vs. Duplicates vs. Flagged).
- Ingested observation extremes:
  - Maximum 24-hour precipitation recorded
  - Maximum ambient heatwave temperature
  - Minimum coldwave temperature
  - Peak wind gust speed

### 6. Interactive Geospatial Weather Map
- Leaflet map of India with custom severity-coded marker clusters.
- Filters by hazard type, severity level (minor, moderate, severe, critical), verification status, state, and search query.
- Event inspection cards with telemetry metrics (rainfall in mm, temperature, wind speed, air quality index).

---

## Application Navigation Structure

| Page Route | Access Level | Description |
| :--- | :--- | :--- |
| `/` | Public | High-impact National Weather Intelligence landing page |
| `/dashboard` | Public / Operations | Interactive India map with hazard markers, filters, and live KPIs |
| `/explorer` | Public / Research | Grid search and inspection of catalogued multi-source reports |
| `/analytics` | Public / Policy | Hazard distributions, top impacted states, and observation extremes |
| `/report` | Citizen / Public | Geotagged ground-truth report submission portal |
| `/admin/login` | Officers / Evaluators | Role-based authentication portal with quick evaluator access |
| `/admin` | Reviewer / Admin | Operations console, review queue, AI triage, and audit trail |
| `/about` | Public | Architecture blueprint and system design brief |

---

## Role-Based Access Control (RBAC)

The platform enforces three distinct authorization tiers:

1. **Chief Operations Administrator (`admin`):**
   - Full review queue triage privileges
   - Incident consolidation and duplicate report merging
   - Status overrides and system audits
   - Demo Account: `admin@sih.gov.in` / `Admin@2026`

2. **Weather Verification Officer (`reviewer`):**
   - Review queue inspection and priority filtering
   - AI telemetry correlation assessment
   - Human verification decision rendering (`verify`, `under_review`, `flag`, `reject`)
   - Demo Account: `reviewer@sih.gov.in` / `Reviewer@2026`

3. **General Public / Citizen (`public`):**
   - View verified public alerts and interactive India weather map
   - Submit ground-truth weather observations and geotagged incident reports
   - View macro analytics and regional summaries

---

## Technology Stack

- **Frontend Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Styling & Components:** Tailwind CSS, Lucide Icons, Glassmorphism UI
- **Mapping & Geospatial:** Leaflet
- **Backend Service:** FastAPI, Python 3.12, Uvicorn
- **Database & ORM:** SQLite, SQLAlchemy 2.0
- **Machine Learning & NLP:** Scikit-Learn (TF-IDF Vectorization, Logistic Regression), NumPy
- **Data Processing:** Pandas, OpenPyXL
- **Containerization & Deployment:** Docker, Docker Compose, Multi-stage Node Alpine

---

## System Governance & Compliance

- **Human Accountability:** AI provides confidence scores, keyword extraction, and telemetry correlation flags. Official warning dissemination requires human reviewer sign-off.
- **Data Integrity:** All state transitions generate immutable audit records with officer credentials and rationale notes.
- **Offline Resilience:** The frontend includes cached fallback data profiles to ensure seamless presentation even during network interruptions.
