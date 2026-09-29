from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from backend.database import get_db
from backend.models import CitizenSubmission, WeatherReport
from backend.schemas import CitizenReportCreate, WeatherEventResponse
from backend.routes.events import model_to_response

router = APIRouter(prefix="/reports/citizen", tags=["Citizen Reporting"])

@router.post("", response_model=WeatherEventResponse)
def submit_citizen_report(data: CitizenReportCreate, db: Session = Depends(get_db)):
    if not (6.0 <= data.latitude <= 38.0 and 68.0 <= data.longitude <= 98.0):
        raise HTTPException(status_code=400, detail="Coordinates outside India geographic envelope")

    sub_id = f"CIT-{uuid.uuid4().hex[:6].upper()}"

    # 1. Record Citizen Submission
    submission = CitizenSubmission(
        id=sub_id,
        title=data.title,
        category=data.category,
        severity=data.severity,
        description=data.description,
        state=data.state,
        district=data.district,
        location_name=data.locationName,
        latitude=data.latitude,
        longitude=data.longitude,
        reporter_name=data.reporterName,
        reporter_contact=data.reporterContact,
        media_url=data.mediaFileUrl,
        status="pending_review",
        observed_at=datetime.utcnow()
    )
    db.add(submission)

    # 2. Ingest as WeatherReport in DB
    weather_report = WeatherReport(
        id=sub_id,
        title=data.title,
        description=data.description,
        category=data.category,
        severity=data.severity,
        status="pending_review",
        confidence_score=68.0,
        location_name=data.locationName,
        district=data.district,
        state=data.state,
        country="India",
        latitude=data.latitude,
        longitude=data.longitude,
        event_timestamp=datetime.utcnow(),
        reported_at="Just now",
        source_name=f"Citizen Ground Truth: {data.reporterName}",
        source_type="citizen",
        trust_score=75.0,
        source_verified=False,
        corroborating_sources_count=1,
        evidence_list=[
            {
                "sourceName": f"Citizen Geotagged Upload ({data.reporterName})",
                "sourceType": "citizen",
                "timestamp": datetime.utcnow().strftime("%H:%M IST"),
                "excerpt": data.description,
                "confidenceContribution": 68
            }
        ],
        media_urls=[data.mediaFileUrl] if data.mediaFileUrl else [],
        ai_analysis={
            "nlpKeywords": [data.category, data.district.lower(), "citizen-verified"],
            "sentiment": "emergency" if data.severity == "critical" else "warning",
            "anomalyFlag": False,
            "verificationNotes": "Citizen report submitted. Queued for satellite reanalysis cross-check."
        }
    )
    db.add(weather_report)
    db.commit()
    db.refresh(weather_report)

    return model_to_response(weather_report)
