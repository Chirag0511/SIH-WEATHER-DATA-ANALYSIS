import math
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from backend.models import WeatherReport, EventGroup

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two GPS coordinates using the Haversine formula.
    """
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_text_similarity(text1: str, text2: str) -> float:
    """
    Calculates cosine similarity between two texts using TF-IDF.
    """
    if not text1 or not text2:
        return 0.0
    try:
        tfidf = TfidfVectorizer().fit([text1, text2])
        vecs = tfidf.transform([text1, text2])
        sim = cosine_similarity(vecs[0:1], vecs[1:2])[0][0]
        return float(sim)
    except Exception:
        # Fallback to token Jaccard similarity
        tokens1 = set(text1.lower().split())
        tokens2 = set(text2.lower().split())
        if not tokens1 or not tokens2:
            return 0.0
        return len(tokens1 & tokens2) / len(tokens1 | tokens2)

def detect_duplicates_and_relationships(
    target_report: WeatherReport,
    db: Session,
    max_search_limit: int = 150
) -> Dict[str, Any]:
    """
    Compares the target report against candidate reports in the database using:
    - Geographic proximity (Haversine km)
    - Time proximity (delta hours)
    - Text semantic similarity (TF-IDF cosine)
    - Weather category matching

    Returns:
    - duplicate_status: 'possible_duplicate' | 'related' | 'independent'
    - event_group_id: string cluster identifier
    - rationale: detailed explanation of match criteria
    - related_reports: list of matching report IDs with similarity scores
    """
    # Find candidate reports in same state or nearby bounding box
    candidates = db.query(WeatherReport).filter(
        WeatherReport.id != target_report.id,
        WeatherReport.state == target_report.state
    ).limit(max_search_limit).all()

    target_text = f"{target_report.title} {target_report.description}"
    best_match = None
    highest_sim = 0.0
    min_dist = float('inf')
    relation_type = "independent"
    rationale_parts = []
    related_candidates = []

    for cand in candidates:
        cand_text = f"{cand.title} {cand.description}"
        sim = calculate_text_similarity(target_text, cand_text)
        dist = haversine_distance_km(
            target_report.latitude, target_report.longitude,
            cand.latitude, cand.longitude
        )

        time_delta_hrs = 24.0
        if target_report.event_timestamp and cand.event_timestamp:
            time_delta_hrs = abs((target_report.event_timestamp - cand.event_timestamp).total_seconds()) / 3600.0

        # Criteria 1: Duplicate (distance <= 20 km, time <= 12 hours, text_sim >= 0.55 or identical title)
        if dist <= 20.0 and time_delta_hrs <= 12.0 and (sim >= 0.55 or target_report.title.lower() == cand.title.lower()):
            relation_type = "possible_duplicate"
            highest_sim = sim
            min_dist = dist
            best_match = cand
            related_candidates.append({
                "id": cand.id,
                "title": cand.title,
                "distance_km": round(dist, 1),
                "time_delta_hrs": round(time_delta_hrs, 1),
                "text_similarity": round(sim, 2),
                "relationship": "possible_duplicate"
            })
            break

        # Criteria 2: Related (distance <= 80 km, time <= 48 hours, category match or text_sim >= 0.35)
        elif dist <= 80.0 and time_delta_hrs <= 48.0 and (target_report.category.lower() == cand.category.lower() or sim >= 0.35):
            if relation_type != "possible_duplicate":
                relation_type = "related"
            related_candidates.append({
                "id": cand.id,
                "title": cand.title,
                "distance_km": round(dist, 1),
                "time_delta_hrs": round(time_delta_hrs, 1),
                "text_similarity": round(sim, 2),
                "relationship": "related"
            })
            if sim > highest_sim:
                highest_sim = sim
                min_dist = dist
                best_match = cand

    # Assign or create event_group_id
    group_id = None
    if best_match and best_match.event_group_id:
        group_id = best_match.event_group_id
    elif relation_type in ["possible_duplicate", "related"]:
        group_id = f"GRP-{target_report.category.upper()[:4]}-{target_report.location_name[:3].upper()}-{target_report.id[:6]}"
        # Ensure EventGroup record exists in DB
        existing_group = db.query(EventGroup).filter(EventGroup.id == group_id).first()
        if not existing_group:
            eg = EventGroup(
                id=group_id,
                title=f"{target_report.category.title()} Cluster: {target_report.location_name}, {target_report.state}",
                category=target_report.category,
                state=target_report.state,
                center_latitude=target_report.latitude,
                center_longitude=target_report.longitude,
                report_count=len(related_candidates) + 1,
                earliest_time=target_report.event_timestamp,
                latest_time=target_report.event_timestamp
            )
            db.add(eg)
            db.commit()

    if relation_type == "possible_duplicate":
        rationale = f"Detected high semantic similarity ({highest_sim:.2f}) within {min_dist:.1f} km and temporal proximity to report {best_match.id}."
    elif relation_type == "related":
        rationale = f"Identified regional cluster within {min_dist:.1f} km sharing meteorological category '{target_report.category}' in {target_report.state}."
    else:
        rationale = "No overlapping reports found within 80km and 48 hours. Classified as an independent report."

    return {
        "duplicate_status": relation_type,
        "event_group_id": group_id,
        "duplicate_rationale": rationale,
        "related_reports": related_candidates,
        "match_count": len(related_candidates)
    }
