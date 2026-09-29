import logging
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.models import WeatherReport, AIAnalysisRecord, EventGroup
from backend.ai.classifier import classifier
from backend.ai.extractor import extract_location_from_text, extract_time_from_text
from backend.ai.deduplicator import detect_duplicates_and_relationships
from backend.ai.verifier import evaluate_evidence_and_verification_assistance

logger = logging.getLogger("ai_pipeline")

def process_weather_report(report_id: str, db: Session) -> Optional[Dict[str, Any]]:
    """
    Executes the end-to-end AI processing pipeline on a stored weather report.
    Returns structured AI analysis and persists output to database.
    """
    report = db.query(WeatherReport).filter(WeatherReport.id == report_id).first()
    if not report:
        logger.error(f"Report {report_id} not found in database.")
        return None

    report_text = f"{report.title}. {report.description}"

    # 1. Weather Event Classification
    classification_res = classifier.predict(report_text)
    predicted_cat = classification_res["predicted_category"]
    cat_conf = classification_res["classification_confidence"]

    # 2. Location & Time Extraction
    default_loc = {
        "name": report.location_name,
        "district": report.district,
        "state": report.state,
        "lat": report.latitude,
        "lng": report.longitude,
    }
    extracted_loc = extract_location_from_text(report_text, default_location=default_loc)
    extracted_time_res = extract_time_from_text(report_text, default_time=report.event_timestamp)

    # 3. Duplicate and Related Reports Detection
    dedup_res = detect_duplicates_and_relationships(report, db)
    dup_status = dedup_res["duplicate_status"]
    group_id = dedup_res["event_group_id"]

    # 4. Evidence and Verification Assistance Evaluation
    evidence_res = evaluate_evidence_and_verification_assistance(report)

    # 5. Persist or Update AIAnalysisRecord in DB
    existing_ai = db.query(AIAnalysisRecord).filter(AIAnalysisRecord.report_id == report.id).first()
    if existing_ai:
        existing_ai.predicted_category = predicted_cat
        existing_ai.classification_confidence = cat_conf
        existing_ai.category_probabilities = classification_res["probabilities"]
        existing_ai.extracted_locations = extracted_loc
        existing_ai.extracted_time = extracted_time_res["extracted_time_str"]
        existing_ai.duplicate_status = dup_status
        existing_ai.event_group_id = group_id
        existing_ai.duplicate_rationale = dedup_res["duplicate_rationale"]
        existing_ai.evidence_status = evidence_res["evidence_status"]
        existing_ai.evidence_summary = evidence_res
        existing_ai.risk_priority = evidence_res["risk_priority"]
        existing_ai.processed_at = datetime.utcnow()
        ai_record = existing_ai
    else:
        ai_record = AIAnalysisRecord(
            report_id=report.id,
            model_name=classification_res["model_name"],
            model_version=classification_res["model_version"],
            predicted_category=predicted_cat,
            classification_confidence=cat_conf,
            category_probabilities=classification_res["probabilities"],
            extracted_locations=extracted_loc,
            extracted_time=extracted_time_res["extracted_time_str"],
            duplicate_status=dup_status,
            event_group_id=group_id,
            duplicate_rationale=dedup_res["duplicate_rationale"],
            evidence_status=evidence_res["evidence_status"],
            evidence_summary=evidence_res,
            risk_priority=evidence_res["risk_priority"],
            processed_at=datetime.utcnow()
        )
        db.add(ai_record)

    # 6. Update WeatherReport metadata with AI cluster and analysis signals (without mutating human verification)
    report.event_group_id = group_id
    report.ai_analysis = {
        "nlpKeywords": [predicted_cat.lower(), report.state.lower(), report.district.lower()],
        "predictedCategory": predicted_cat,
        "classificationConfidence": cat_conf,
        "sentiment": "emergency" if evidence_res["risk_priority"] == "urgent" else "warning",
        "duplicateStatus": dup_status,
        "duplicateClusterId": group_id,
        "evidenceStatus": evidence_res["evidence_status"],
        "riskPriority": evidence_res["risk_priority"],
        "anomalyFlag": evidence_res["evidence_status"] == "conflicting",
        "verificationNotes": evidence_res["ai_reviewer_advisory"]
    }

    db.commit()

    return {
        "report_id": report.id,
        "classification": {
            "predicted_category": predicted_cat,
            "confidence": cat_conf,
            "model": classification_res["model_name"],
            "version": classification_res["model_version"],
            "probabilities": classification_res["probabilities"]
        },
        "location_extraction": extracted_loc,
        "time_extraction": extracted_time_res,
        "deduplication": dedup_res,
        "evidence_assistance": evidence_res,
        "verification_status": report.status,  # Note: human decision is explicitly kept separate!
        "processed_at": ai_record.processed_at.isoformat()
    }
