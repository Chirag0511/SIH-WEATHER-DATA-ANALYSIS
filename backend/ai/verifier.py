from typing import Dict, Any, List
from backend.models import WeatherReport

def evaluate_evidence_and_verification_assistance(report: WeatherReport) -> Dict[str, Any]:
    """
    Evaluates corroborating telemetry and evidence signals for human reviewer assistance.
    Categorizes evidence as: 'supporting', 'conflicting', or 'insufficient'.
    Computes review risk priority: 'urgent', 'high', 'normal', 'low'.
    DOES NOT automatically declare a report verified or fake.
    """
    supporting_signals = []
    conflicting_signals = []
    category_lower = report.category.lower()

    # Signal 1: Instrumental Telemetry checks
    if report.precipitation_mm is not None:
        if category_lower in ['rainfall', 'heavy_rainfall', 'flooding', 'flood']:
            if report.precipitation_mm >= 25.0:
                supporting_signals.append(f"Recorded heavy precipitation ({report.precipitation_mm:.1f} mm) corroborates flood/rain claim.")
            elif report.precipitation_mm == 0.0:
                conflicting_signals.append(f"Instrumental rain gauge reports 0.0 mm precipitation despite claimed rainfall event.")
            else:
                supporting_signals.append(f"Precipitation reading of {report.precipitation_mm:.1f} mm indicates active shower.")

    if report.temperature_c is not None:
        if category_lower in ['heatwave']:
            if report.temperature_c >= 38.0:
                supporting_signals.append(f"Synoptic temperature ({report.temperature_c:.1f}°C) exceeds extreme thermal advisory threshold.")
            elif report.temperature_c < 30.0:
                conflicting_signals.append(f"Measured temperature ({report.temperature_c:.1f}°C) is substantially below heatwave definition.")
        elif category_lower in ['cold_wave']:
            if report.temperature_c <= 6.0:
                supporting_signals.append(f"Surface temperature of {report.temperature_c:.1f}°C confirms severe cold wave conditions.")
            elif report.temperature_c > 15.0:
                conflicting_signals.append(f"Temperature reading of {report.temperature_c:.1f}°C conflicts with cold wave claim.")

    if report.wind_speed_kph is not None:
        if category_lower in ['cyclone', 'strong winds', 'thunderstorm']:
            if report.wind_speed_kph >= 40.0:
                supporting_signals.append(f"Peak wind velocity ({report.wind_speed_kph:.1f} km/h) corroborates gale/storm conditions.")

    # Signal 2: Corroborating sources count
    sources_count = report.corroborating_sources_count or 1
    if sources_count >= 3:
        supporting_signals.append(f"Cross-verified by {sources_count} distinct data feeds.")
    elif sources_count == 1:
        if report.source_type == 'citizen':
            supporting_signals.append("Single-observer citizen submission awaiting satellite reanalysis confirmation.")

    # Signal 3: Source Trust
    trust = report.trust_score or 70.0
    if trust >= 90.0:
        supporting_signals.append(f"Primary source '{report.source_name}' carries high institutional trust index ({trust:.0f}%).")
    elif trust < 50.0:
        conflicting_signals.append(f"Source carries low credibility index ({trust:.0f}%), flagged for rumor cross-check.")

    # Determine Evidence Status
    if conflicting_signals and len(conflicting_signals) >= len(supporting_signals):
        evidence_status = "conflicting"
    elif len(supporting_signals) >= 2:
        evidence_status = "supporting"
    elif len(supporting_signals) == 1 and not conflicting_signals:
        evidence_status = "supporting"
    else:
        evidence_status = "insufficient"

    # Compute Review Priority
    if report.severity == 'critical':
        risk_priority = "urgent"
    elif report.severity == 'high' or evidence_status == "conflicting":
        risk_priority = "high"
    elif report.severity == 'moderate':
        risk_priority = "normal"
    else:
        risk_priority = "low"

    summary = {
        "evidence_status": evidence_status,
        "risk_priority": risk_priority,
        "supporting_signals": supporting_signals,
        "conflicting_signals": conflicting_signals,
        "supporting_count": len(supporting_signals),
        "conflicting_count": len(conflicting_signals),
        "ai_reviewer_advisory": (
            "URGENT REVIEW: Severe anomaly requiring rapid corroboration." if risk_priority == "urgent" else
            "REVIEW ADVISORY: Potential data discrepancy detected between claim and sensors." if evidence_status == "conflicting" else
            "STANDARD QUEUE: Evidence aligns with regional synoptic baseline."
        )
    }

    return summary
