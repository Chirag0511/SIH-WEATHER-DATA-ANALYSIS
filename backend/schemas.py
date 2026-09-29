from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class LocationSchema(BaseModel):
    name: str
    district: str
    state: str
    lat: float
    lng: float

class SourceSchema(BaseModel):
    id: str
    name: str
    type: str
    trustScore: float
    url: Optional[str] = None
    verifiedBadge: Optional[bool] = False

class CorroboratingEvidenceSchema(BaseModel):
    sourceName: str
    sourceType: str
    timestamp: str
    excerpt: str
    confidenceContribution: float

class WeatherMetricsSchema(BaseModel):
    precipitationMm: Optional[float] = None
    windSpeedKmh: Optional[float] = None
    temperatureC: Optional[float] = None
    humidityPercent: Optional[float] = None
    pressureMb: Optional[float] = None
    airQualityIndex: Optional[float] = None

class AIAnalysisSchema(BaseModel):
    nlpKeywords: List[str] = []
    sentiment: str = "warning"
    duplicateClusterId: Optional[str] = None
    anomalyFlag: bool = False
    verificationNotes: str = ""

class WeatherEventResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    severity: str
    status: str
    confidenceScore: float
    location: LocationSchema
    timestamp: str
    reportedAt: str
    source: SourceSchema
    corroboratingSourcesCount: int
    evidenceList: List[Dict[str, Any]] = []
    mediaUrls: List[str] = []
    metrics: Optional[WeatherMetricsSchema] = None
    aiAnalysis: Optional[AIAnalysisSchema] = None

class KPISummaryResponse(BaseModel):
    totalEvents: int
    verifiedEvents: int
    criticalAlerts: int
    pendingReview: int
    activeStatesCount: int
    averageConfidence: float
    citizenReportsCount: int
    lastSyncTimestamp: str

class CitizenReportCreate(BaseModel):
    title: str
    category: str
    severity: str
    description: str
    state: str
    district: str
    locationName: str
    latitude: float
    longitude: float
    reporterName: str
    reporterContact: Optional[str] = None
    mediaFileUrl: Optional[str] = None
    observedAt: Optional[str] = None

class ImportReportResponse(BaseModel):
    dataset_name: str
    records_read: int
    records_imported: int
    records_skipped: int
    records_rejected: int
    status: str
    details: Dict[str, Any]
