from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Text, Boolean, JSON, ForeignKey
)
from sqlalchemy.orm import relationship
from backend.database import Base

class WeatherReport(Base):
    __tablename__ = "weather_reports"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)  # cyclone, flood, heavy_rainfall, heatwave, etc.
    severity = Column(String(20), nullable=False, index=True)  # critical, high, moderate, low
    status = Column(String(30), nullable=False, default="pending_review", index=True)  # verified, pending_review, under_review, flagged, rejected, duplicate
    confidence_score = Column(Float, nullable=False, default=50.0)

    # Location Information
    location_name = Column(String(150), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    country = Column(String(50), default="India")
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)

    # Timing
    event_timestamp = Column(DateTime, nullable=False, index=True)  # Observation/event time
    ingestion_timestamp = Column(DateTime, default=datetime.utcnow)  # Time ingested into DB
    reported_at = Column(String(50), default="Recently")

    # Source & Attribution
    source_name = Column(String(150), nullable=False)
    source_type = Column(String(50), nullable=False, default="dataset")  # dataset, imd, openmeteo, citizen, news
    trust_score = Column(Float, default=80.0)
    source_url = Column(String(255), nullable=True)
    source_verified = Column(Boolean, default=False)
    corroborating_sources_count = Column(Integer, default=1)

    # Grouping & Relationships
    event_group_id = Column(String(64), nullable=True, index=True)

    # Meteorological Metrics
    precipitation_mm = Column(Float, nullable=True)
    wind_speed_kph = Column(Float, nullable=True)
    temperature_c = Column(Float, nullable=True)
    humidity_percent = Column(Float, nullable=True)
    pressure_mb = Column(Float, nullable=True)
    air_quality_index = Column(Float, nullable=True)

    # Structured Evidences & AI Analysis
    evidence_list = Column(JSON, default=list)
    media_urls = Column(JSON, default=list)
    ai_analysis = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AIAnalysisRecord(Base):
    __tablename__ = "ai_analysis_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(String(64), ForeignKey("weather_reports.id"), nullable=False, index=True)
    model_name = Column(String(100), default="TF-IDF + Calibrated Classifier")
    model_version = Column(String(20), default="v1.0")

    # Classification
    predicted_category = Column(String(50), nullable=False)
    classification_confidence = Column(Float, nullable=False)
    category_probabilities = Column(JSON, default=dict)

    # Extraction
    extracted_locations = Column(JSON, default=dict)  # {city, district, state, place_name, lat, lng}
    extracted_time = Column(String(100), nullable=True)

    # Duplication & Clustered Groups
    duplicate_status = Column(String(50), default="independent")  # possible_duplicate, related, independent
    event_group_id = Column(String(64), nullable=True, index=True)
    duplicate_rationale = Column(Text, nullable=True)

    # Evidence & Verification Assistance
    evidence_status = Column(String(50), default="insufficient")  # supporting, conflicting, insufficient
    evidence_summary = Column(JSON, default=dict)
    risk_priority = Column(String(20), default="normal")  # urgent, high, normal, low

    processed_at = Column(DateTime, default=datetime.utcnow)


class EventGroup(Base):
    __tablename__ = "event_groups"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)
    state = Column(String(100), nullable=False)
    center_latitude = Column(Float, nullable=False)
    center_longitude = Column(Float, nullable=False)
    report_count = Column(Integer, default=1)
    earliest_time = Column(DateTime, nullable=True)
    latest_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class VerificationHistoryRecord(Base):
    __tablename__ = "verification_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(String(64), ForeignKey("weather_reports.id"), nullable=False, index=True)
    previous_status = Column(String(30), nullable=False)
    new_status = Column(String(30), nullable=False)
    reviewer_name = Column(String(100), default="Authorized Reviewer")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class CitizenSubmission(Base):
    __tablename__ = "citizen_submissions"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    description = Column(Text, nullable=False)
    
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    location_name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    reporter_name = Column(String(150), nullable=False)
    reporter_contact = Column(String(100), nullable=True)
    media_url = Column(String(500), nullable=True)
    status = Column(String(30), default="pending_review")

    observed_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


class DatasetImportLog(Base):
    __tablename__ = "dataset_import_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dataset_name = Column(String(150), nullable=False)
    file_path = Column(String(500), nullable=False)
    records_read = Column(Integer, default=0)
    records_imported = Column(Integer, default=0)
    records_skipped = Column(Integer, default=0)
    records_rejected = Column(Integer, default=0)
    status = Column(String(50), default="completed")
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
