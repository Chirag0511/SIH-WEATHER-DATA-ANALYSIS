from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from backend.database import get_db
from backend.models import WeatherReport, AIAnalysisRecord, VerificationHistoryRecord, EventGroup
from backend.ai.pipeline import process_weather_report
from backend.ai.classifier import classifier
from backend.routes.events import model_to_response

router = APIRouter(prefix="/ai", tags=["AI Verification & Processing"])

class VerificationActionRequest(BaseModel):
    new_status: str  # verified, under_review, flagged, rejected
    reviewer_name: Optional[str] = "Authorized Reviewer"
    notes: Optional[str] = None

@router.post("/process/{report_id}")
def process_report(report_id: str, db: Session = Depends(get_db)):
    """
    Triggers AI processing pipeline on an existing stored weather report.
    """
    res = process_weather_report(report_id, db)
    if not res:
        raise HTTPException(status_code=404, detail="Weather report not found.")
    return res

@router.get("/analysis/{report_id}")
def get_report_analysis(report_id: str, db: Session = Depends(get_db)):
    """
    Retrieves stored AI analysis, category probabilities, extracted locations, and review priority.
    """
    ai = db.query(AIAnalysisRecord).filter(AIAnalysisRecord.report_id == report_id).first()
    if not ai:
        # If not yet processed, process on-the-fly
        res = process_weather_report(report_id, db)
        if not res:
            raise HTTPException(status_code=404, detail="Report not found.")
        return res

    report = db.query(WeatherReport).filter(WeatherReport.id == report_id).first()
    return {
        "report_id": ai.report_id,
        "classification": {
            "predicted_category": ai.predicted_category,
            "confidence": ai.classification_confidence,
            "model": ai.model_name,
            "version": ai.model_version,
            "probabilities": ai.category_probabilities
        },
        "location_extraction": ai.extracted_locations,
        "time_extraction": {
            "extracted_time_str": ai.extracted_time,
        },
        "deduplication": {
            "duplicate_status": ai.duplicate_status,
            "event_group_id": ai.event_group_id,
            "duplicate_rationale": ai.duplicate_rationale
        },
        "evidence_assistance": ai.evidence_summary,
        "human_verification_status": report.status if report else "pending_review",
        "processed_at": ai.processed_at.isoformat() if ai.processed_at else None
    }

@router.get("/related/{report_id}")
def get_related_reports(report_id: str, db: Session = Depends(get_db)):
    """
    Retrieves candidate reports grouped within the same event cluster or geographic radius.
    """
    report = db.query(WeatherReport).filter(WeatherReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    related_reports = []
    if report.event_group_id:
        group_members = db.query(WeatherReport).filter(
            WeatherReport.event_group_id == report.event_group_id,
            WeatherReport.id != report.id
        ).limit(20).all()
        related_reports = [model_to_response(r) for r in group_members]

    return {
        "report_id": report_id,
        "event_group_id": report.event_group_id,
        "related_count": len(related_reports),
        "related_reports": related_reports
    }

@router.get("/evidence/{report_id}")
def get_evidence_details(report_id: str, db: Session = Depends(get_db)):
    """
    Returns granular supporting and conflicting evidence breakdown for a report.
    """
    report = db.query(WeatherReport).filter(WeatherReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    ai = db.query(AIAnalysisRecord).filter(AIAnalysisRecord.report_id == report_id).first()
    if not ai:
        process_weather_report(report_id, db)
        ai = db.query(AIAnalysisRecord).filter(AIAnalysisRecord.report_id == report_id).first()

    return {
        "report_id": report_id,
        "title": report.title,
        "evidence_status": ai.evidence_status if ai else "insufficient",
        "evidence_summary": ai.evidence_summary if ai else {},
        "raw_evidence_list": report.evidence_list or [],
        "metrics": {
            "precipitationMm": report.precipitation_mm,
            "temperatureC": report.temperature_c,
            "windSpeedKmh": report.wind_speed_kph,
            "humidityPercent": report.humidity_percent
        }
    }

@router.post("/batch-process")
def batch_process_reports(
    limit: int = Query(default=25, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Batch processes unprocessed or recent reports with the AI pipeline.
    """
    reports = db.query(WeatherReport).limit(limit).all()
    processed_count = 0
    results = []

    for r in reports:
        res = process_weather_report(r.id, db)
        if res:
            processed_count += 1
            results.append({
                "id": r.id,
                "category": res["classification"]["predicted_category"],
                "confidence": res["classification"]["confidence"],
                "group_id": res["deduplication"]["event_group_id"]
            })

    return {
        "status": "success",
        "batch_size": len(reports),
        "processed_count": processed_count,
        "results": results
    }

@router.post("/verify/{report_id}")
def verify_report(
    report_id: str,
    action: VerificationActionRequest,
    db: Session = Depends(get_db)
):
    """
    Human Reviewer Decision Endpoint.
    Records reviewer action and writes to verification history table.
    """
    report = db.query(WeatherReport).filter(WeatherReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    valid_statuses = ["verified", "under_review", "flagged", "rejected", "duplicate", "pending_review"]
    if action.new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    prev_status = report.status
    report.status = action.new_status

    # Record history
    history = VerificationHistoryRecord(
        report_id=report_id,
        previous_status=prev_status,
        new_status=action.new_status,
        reviewer_name=action.reviewer_name or "Authorized Reviewer",
        notes=action.notes
    )
    db.add(history)
    db.commit()
    db.refresh(report)

    return {
        "status": "success",
        "report_id": report_id,
        "previous_status": prev_status,
        "new_status": report.status,
        "reviewer": action.reviewer_name,
        "notes": action.notes
    }

@router.get("/metrics")
def get_classifier_metrics():
    """
    Returns baseline model evaluation metrics, accuracy, precision, recall, F1, and confusion matrix.
    """
    return classifier.evaluation_metrics
