from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional
from datetime import datetime

from backend.database import get_db
from backend.models import WeatherReport
from backend.schemas import WeatherEventResponse, KPISummaryResponse

router = APIRouter(prefix="/events", tags=["Weather Events"])

def model_to_response(report: WeatherReport) -> dict:
    return {
        "id": report.id,
        "title": report.title,
        "description": report.description,
        "category": report.category,
        "severity": report.severity,
        "status": report.status,
        "confidenceScore": report.confidence_score,
        "location": {
            "name": report.location_name,
            "district": report.district,
            "state": report.state,
            "lat": report.latitude,
            "lng": report.longitude,
        },
        "timestamp": report.event_timestamp.isoformat() if report.event_timestamp else datetime.utcnow().isoformat(),
        "reportedAt": report.reported_at or "Recently",
        "source": {
            "id": f"src-{report.source_type}",
            "name": report.source_name,
            "type": report.source_type,
            "trustScore": report.trust_score,
            "url": report.source_url,
            "verifiedBadge": report.source_verified,
        },
        "corroboratingSourcesCount": report.corroborating_sources_count or 1,
        "evidenceList": report.evidence_list or [],
        "mediaUrls": report.media_urls or [],
        "metrics": {
            "precipitationMm": report.precipitation_mm,
            "windSpeedKmh": report.wind_speed_kph,
            "temperatureC": report.temperature_c,
            "humidityPercent": report.humidity_percent,
            "pressureMb": report.pressure_mb,
            "airQualityIndex": report.air_quality_index,
        },
        "aiAnalysis": report.ai_analysis or {
            "nlpKeywords": [report.category, report.state.lower()],
            "sentiment": "warning",
            "anomalyFlag": False,
            "verificationNotes": "Direct telemetry verified."
        }
    }

@router.get("", response_model=List[WeatherEventResponse])
def get_events(
    category: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    state: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(WeatherReport)

    if category and category != "all":
        query = query.filter(WeatherReport.category == category)
    if severity and severity != "all":
        query = query.filter(WeatherReport.severity == severity)
    if status and status != "all":
        query = query.filter(WeatherReport.status == status)
    if state and state != "all":
        query = query.filter(WeatherReport.state == state)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                WeatherReport.title.ilike(term),
                WeatherReport.description.ilike(term),
                WeatherReport.location_name.ilike(term),
                WeatherReport.district.ilike(term),
                WeatherReport.state.ilike(term),
                WeatherReport.category.ilike(term)
            )
        )

    # Order by event recency
    reports = query.order_by(desc(WeatherReport.event_timestamp)).offset(offset).limit(limit).all()
    return [model_to_response(r) for r in reports]

@router.get("/kpi", response_model=KPISummaryResponse)
def get_kpi_summary(db: Session = Depends(get_db)):
    total = db.query(WeatherReport).count()
    verified = db.query(WeatherReport).filter(WeatherReport.status == "verified").count()
    critical = db.query(WeatherReport).filter(WeatherReport.severity == "critical").count()
    pending = db.query(WeatherReport).filter(WeatherReport.status == "pending_review").count()
    citizen = db.query(WeatherReport).filter(WeatherReport.source_type == "citizen").count()

    # Active states
    states = db.query(WeatherReport.state).distinct().all()
    active_states_count = len(states)

    # Average confidence
    from sqlalchemy import func
    avg_conf = db.query(func.avg(WeatherReport.confidence_score)).scalar() or 85.0

    return {
        "totalEvents": total,
        "verifiedEvents": verified,
        "criticalAlerts": critical,
        "pendingReview": pending,
        "activeStatesCount": active_states_count,
        "averageConfidence": round(float(avg_conf), 1),
        "citizenReportsCount": citizen,
        "lastSyncTimestamp": datetime.utcnow().strftime("%d %b %Y, %H:%M IST")
    }

@router.get("/{event_id}", response_model=WeatherEventResponse)
def get_event_detail(event_id: str, db: Session = Depends(get_db)):
    report = db.query(WeatherReport).filter(WeatherReport.id == event_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Weather event not found")
    return model_to_response(report)
