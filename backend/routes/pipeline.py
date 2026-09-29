import os
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.config import settings
from backend.pipeline.importer import run_dataset_import_pipeline
from backend.models import DatasetImportLog

router = APIRouter(prefix="/pipeline", tags=["Dataset Import Pipeline"])

@router.post("/run-import")
def trigger_import_pipeline(db: Session = Depends(get_db)):
    try:
        report = run_dataset_import_pipeline(db)
        return {
            "status": "success",
            "message": "Dataset import pipeline completed.",
            "report": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports")
def get_import_reports(db: Session = Depends(get_db)):
    logs = db.query(DatasetImportLog).order_by(DatasetImportLog.id.desc()).all()
    
    # Read summary json if exists
    summary_file = os.path.join(settings.DATA_REPORTS_DIR, "import_summary_report.json")
    summary = {}
    if os.path.exists(summary_file):
        with open(summary_file, "r", encoding="utf-8") as f:
            summary = json.load(f)

    return {
        "summary": summary,
        "logs": [
            {
                "id": log.id,
                "dataset_name": log.dataset_name,
                "records_read": log.records_read,
                "records_imported": log.records_imported,
                "records_skipped": log.records_skipped,
                "records_rejected": log.records_rejected,
                "status": log.status,
                "created_at": log.created_at.isoformat() if log.created_at else None
            }
            for log in logs
        ]
    }
