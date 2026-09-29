from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, func
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

from backend.database import get_db
from backend.models import WeatherReport, AIAnalysisRecord, VerificationHistoryRecord, EventGroup
from backend.auth import require_roles
from backend.routes.events import model_to_response

router = APIRouter(prefix="/admin", tags=["Administrative & Verification Queue"])

class AdminActionRequest(BaseModel):
    report_id: str
    action: str  # verify, flag, reject, duplicate, under_review
    notes: Optional[str] = "Decision rendered in review console"

class MergeReportsRequest(BaseModel):
    primary_report_id: str
    target_report_ids: List[str]
    group_title: Optional[str] = None
    notes: Optional[str] = "Reports consolidated into unified meteorological event cluster"

@router.get("/dashboard-stats")
def get_admin_dashboard_stats(
    user: dict = Depends(require_roles(["reviewer", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Returns live database counts and recent audit logs for the Admin Panel.
    """
    total = db.query(WeatherReport).count()
    pending = db.query(WeatherReport).filter(WeatherReport.status == "pending_review").count()
    under_review = db.query(WeatherReport).filter(WeatherReport.status == "under_review").count()
    verified = db.query(WeatherReport).filter(WeatherReport.status == "verified").count()
    flagged = db.query(WeatherReport).filter(WeatherReport.status == "flagged").count()
    rejected = db.query(WeatherReport).filter(WeatherReport.status == "rejected").count()
    duplicates = db.query(WeatherReport).filter(WeatherReport.status == "duplicate").count()
    
    # Priority counts from AI analysis records
    urgent_count = db.query(AIAnalysisRecord).filter(AIAnalysisRecord.risk_priority == "urgent").count()

    # Recent incoming reports (latest 6)
    recent_reports = db.query(WeatherReport).order_by(desc(WeatherReport.created_at)).limit(6).all()

    # Recent verification audit history (latest 10)
    history = db.query(VerificationHistoryRecord).order_by(desc(VerificationHistoryRecord.created_at)).limit(10).all()

    return {
        "stats": {
            "total_reports": total,
            "pending_reports": pending,
            "under_review": under_review,
            "verified_reports": verified,
            "flagged_reports": flagged,
            "rejected_reports": rejected,
            "duplicate_reports": duplicates,
            "urgent_priority": urgent_count,
        },
        "recent_incoming": [model_to_response(r) for r in recent_reports],
        "recent_actions": [
            {
                "id": h.id,
                "report_id": h.report_id,
                "previous_status": h.previous_status,
                "new_status": h.new_status,
                "reviewer": h.reviewer_name,
                "notes": h.notes,
                "timestamp": h.created_at.strftime("%d %b %Y, %H:%M IST") if h.created_at else None,
            }
            for h in history
        ]
    }

@router.get("/review-queue")
def get_review_queue(
    status: Optional[str] = None,
    category: Optional[str] = None,
    state: Optional[str] = None,
    priority: Optional[str] = None,
    source_type: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    user: dict = Depends(require_roles(["reviewer", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Searchable, filterable queue of weather reports for administrative triage.
    """
    query = db.query(WeatherReport)

    if status and status != "all":
        query = query.filter(WeatherReport.status == status)
    if category and category != "all":
        query = query.filter(WeatherReport.category == category)
    if state and state != "all":
        query = query.filter(WeatherReport.state == state)
    if source_type and source_type != "all":
        query = query.filter(WeatherReport.source_type == source_type)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                WeatherReport.id.ilike(term),
                WeatherReport.title.ilike(term),
                WeatherReport.location_name.ilike(term),
                WeatherReport.state.ilike(term)
            )
        )

    total_matched = query.count()
    reports = query.order_by(desc(WeatherReport.event_timestamp)).offset(offset).limit(limit).all()

    # Enrich each report with AI Analysis metadata
    items = []
    for r in reports:
        ai = db.query(AIAnalysisRecord).filter(AIAnalysisRecord.report_id == r.id).first()
        items.append({
            "id": r.id,
            "title": r.title,
            "category": r.category,
            "severity": r.severity,
            "status": r.status,
            "confidence_score": r.confidence_score,
            "location_name": r.location_name,
            "district": r.district,
            "state": r.state,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "source_name": r.source_name,
            "source_type": r.source_type,
            "event_timestamp": r.event_timestamp.isoformat() if r.event_timestamp else None,
            "reported_at": r.reported_at,
            "event_group_id": r.event_group_id,
            "ai": {
                "predicted_category": ai.predicted_category if ai else r.category,
                "confidence": ai.classification_confidence if ai else (r.confidence_score / 100.0),
                "duplicate_status": ai.duplicate_status if ai else "independent",
                "evidence_status": ai.evidence_status if ai else "insufficient",
                "risk_priority": ai.risk_priority if ai else ("urgent" if r.severity == "critical" else "normal"),
            }
        })

    # Optional post-filter on AI priority
    if priority and priority != "all":
        items = [i for i in items if i["ai"]["risk_priority"] == priority]

    return {
        "total_matched": total_matched,
        "items": items
    }

@router.post("/action")
def submit_admin_action(
    req: AdminActionRequest,
    user: dict = Depends(require_roles(["reviewer", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Applies human verification decision (verify, flag, reject, duplicate, under_review).
    """
    report = db.query(WeatherReport).filter(WeatherReport.id == req.report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Weather report not found.")

    status_map = {
        "verify": "verified",
        "flag": "flagged",
        "reject": "rejected",
        "duplicate": "duplicate",
        "under_review": "under_review",
    }
    new_status = status_map.get(req.action.lower(), req.action.lower())
    prev_status = report.status
    report.status = new_status

    # Record verification history
    history = VerificationHistoryRecord(
        report_id=report.id,
        previous_status=prev_status,
        new_status=new_status,
        reviewer_name=f"{user.get('name', 'Admin')} ({user.get('role', 'reviewer')})",
        notes=req.notes
    )
    db.add(history)
    db.commit()

    return {
        "status": "success",
        "report_id": report.id,
        "previous_status": prev_status,
        "new_status": new_status,
        "action_by": user.get("name")
    }

@router.post("/merge-reports")
def merge_reports(
    req: MergeReportsRequest,
    user: dict = Depends(require_roles(["reviewer", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Merges duplicate or related reports into a shared event cluster non-destructively.
    """
    primary = db.query(WeatherReport).filter(WeatherReport.id == req.primary_report_id).first()
    if not primary:
        raise HTTPException(status_code=404, detail="Primary weather report not found.")

    all_ids = [req.primary_report_id] + req.target_report_ids
    reports = db.query(WeatherReport).filter(WeatherReport.id.in_(all_ids)).all()

    # Generate or reuse event group ID
    group_id = primary.event_group_id or f"GRP-{primary.category.upper()[:4]}-{primary.location_name[:3].upper()}-{primary.id[:6]}"
    title = req.group_title or f"Consolidated {primary.category.title()} Cluster: {primary.location_name}, {primary.state}"

    # Upsert EventGroup
    eg = db.query(EventGroup).filter(EventGroup.id == group_id).first()
    if not eg:
        eg = EventGroup(
            id=group_id,
            title=title,
            category=primary.category,
            state=primary.state,
            center_latitude=primary.latitude,
            center_longitude=primary.longitude,
            report_count=len(reports),
            earliest_time=primary.event_timestamp,
            latest_time=primary.event_timestamp
        )
        db.add(eg)
    else:
        eg.report_count = len(reports)

    # Assign event_group_id across all reports and record audit trail
    for r in reports:
        prev_status = r.status
        r.event_group_id = group_id
        if r.id != primary.id:
            r.status = "duplicate"
        
        hist = VerificationHistoryRecord(
            report_id=r.id,
            previous_status=prev_status,
            new_status=r.status,
            reviewer_name=f"{user.get('name', 'Admin')} ({user.get('role', 'admin')})",
            notes=f"Merged into Event Group {group_id}. {req.notes}"
        )
        db.add(hist)

    db.commit()

    return {
        "status": "success",
        "event_group_id": group_id,
        "merged_reports_count": len(reports),
        "primary_id": primary.id
    }
