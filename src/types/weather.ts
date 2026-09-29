export type WeatherCategory = 
  | 'cyclone'
  | 'flood'
  | 'heavy_rainfall'
  | 'heatwave'
  | 'thunderstorm'
  | 'landslide'
  | 'cold_wave';

export type SeverityLevel = 'low' | 'moderate' | 'high' | 'critical';

export type VerificationStatus = 'verified' | 'pending_review' | 'unverified' | 'flagged';

export type SourceType = 'citizen' | 'imd' | 'openmeteo' | 'news' | 'social';

export interface WeatherSource {
  id: string;
  name: string;
  type: SourceType;
  trustScore: number; // 0 - 100
  url?: string;
  verifiedBadge?: boolean;
}

export interface WeatherLocation {
  name: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  elevationM?: number;
}

export interface CorroboratingEvidence {
  sourceName: string;
  sourceType: SourceType;
  timestamp: string;
  excerpt: string;
  confidenceContribution: number;
  url?: string;
}

export interface WeatherEvent {
  id: string;
  title: string;
  description: string;
  category: WeatherCategory;
  severity: SeverityLevel;
  status: VerificationStatus;
  confidenceScore: number; // 0 - 100%
  location: WeatherLocation;
  timestamp: string;
  reportedAt: string;
  source: WeatherSource;
  corroboratingSourcesCount: number;
  evidenceList: CorroboratingEvidence[];
  mediaUrls: string[];
  metrics?: {
    precipitationMm?: number;
    windSpeedKmh?: number;
    temperatureC?: number;
    humidityPercent?: number;
    airQualityIndex?: number;
  };
  aiAnalysis?: {
    nlpKeywords: string[];
    sentiment: 'emergency' | 'warning' | 'advisory' | 'neutral';
    duplicateClusterId?: string;
    anomalyFlag: boolean;
    verificationNotes: string;
  };
}

export interface FilterState {
  searchQuery: string;
  category: string;
  severity: string;
  status: string;
  state: string;
  dateRange: 'all' | '24h' | '7d' | '30d';
}

export interface KPISummary {
  totalEvents: number;
  verifiedEvents: number;
  criticalAlerts: number;
  pendingReview: number;
  activeStatesCount: number;
  averageConfidence: number;
  citizenReportsCount: number;
  lastSyncTimestamp: string;
}

export interface CitizenSubmissionForm {
  title: string;
  category: WeatherCategory;
  severity: SeverityLevel;
  description: string;
  state: string;
  district: string;
  locationName: string;
  latitude: number | '';
  longitude: number | '';
  reporterName: string;
  reporterContact?: string;
  mediaFileUrl?: string;
  observedAt: string;
}
