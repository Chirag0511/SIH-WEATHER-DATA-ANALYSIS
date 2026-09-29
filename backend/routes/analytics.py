from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, Dict, Any, List

from backend.database import get_db
from backend.models import WeatherReport, EventGroup, AIAnalysisRecord

router = APIRouter(prefix="/analytics", tags=["Weather Analytics"])

@router.get("/summary")
def get_analytics_summary(
    state: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Computes aggregates from actual stored database records.
    """
    query = db.query(WeatherReport)
    if state and state != "all":
        query = query.filter(WeatherReport.state == state)
    if category and category != "all":
        query = query.filter(WeatherReport.category == category)

    total_events = query.count()

    # 1. Events by Category
    cat_rows = (
        query.with_entities(WeatherReport.category, func.count(WeatherReport.id))
        .group_by(WeatherReport.category)
        .all()
    )
    categories_data = [
        {"category": cat, "count": count, "percentage": round((count / max(total_events, 1)) * 100, 1)}
        for cat, count in sorted(cat_rows, key=lambda x: x[1], reverse=True)
    ]

    # 2. Events by State (Top 10)
    state_rows = (
        query.with_entities(WeatherReport.state, func.count(WeatherReport.id))
        .group_by(WeatherReport.state)
        .order_by(desc(func.count(WeatherReport.id)))
        .limit(10)
        .all()
    )
    states_data = [{"state": s, "count": c} for s, c in state_rows]

    # 3. Verification Distribution
    status_rows = (
        query.with_entities(WeatherReport.status, func.count(WeatherReport.id))
        .group_by(WeatherReport.status)
        .all()
    )
    status_data = [{"status": s, "count": c} for s, c in status_rows]

    # 4. Severity Distribution
    sev_rows = (
        query.with_entities(WeatherReport.severity, func.count(WeatherReport.id))
        .group_by(WeatherReport.severity)
        .all()
    )
    severity_data = [{"severity": s, "count": c} for s, c in sev_rows]

    # 5. Source Distribution
    source_rows = (
        query.with_entities(WeatherReport.source_type, func.count(WeatherReport.id))
        .group_by(WeatherReport.source_type)
        .all()
    )
    sources_data = [{"source_type": s, "count": c} for s, c in source_rows]

    # 6. Event Groups & Duplicate clusters
    total_groups = db.query(EventGroup).count()

    # 7. Meteorological Extremes in dataset
    max_rain = query.with_entities(func.max(WeatherReport.precipitation_mm)).scalar() or 0.0
    max_temp = query.with_entities(func.max(WeatherReport.temperature_c)).scalar() or 0.0
    min_temp = query.with_entities(func.min(WeatherReport.temperature_c)).scalar() or 0.0
    max_wind = query.with_entities(func.max(WeatherReport.wind_speed_kph)).scalar() or 0.0

    return {
        "total_events": total_events,
        "categories": categories_data,
        "top_states": states_data,
        "verification_distribution": status_data,
        "severity_distribution": severity_data,
        "sources_distribution": sources_data,
        "event_clusters_count": total_groups,
        "meteorological_extremes": {
            "max_precipitation_mm": round(float(max_rain), 1),
            "max_temperature_c": round(float(max_temp), 1),
            "min_temperature_c": round(float(min_temp), 1),
            "max_wind_kph": round(float(max_wind), 1),
        }
    }
