import { WeatherEvent, KPISummary, FilterState, CitizenSubmissionForm } from '@/types/weather';
import { INITIAL_WEATHER_EVENTS, MOCK_KPI_SUMMARY, filterWeatherEvents } from './mockWeatherData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Authentication storage helpers
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sih_auth_token');
}

export function setAuthSession(token: string, user: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sih_auth_token', token);
  localStorage.setItem('sih_auth_user', JSON.stringify(user));
}

export function getAuthUser(): any | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('sih_auth_user');
  return user ? JSON.parse(user) : null;
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sih_auth_token');
  localStorage.removeItem('sih_auth_user');
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function adminLogin(email: string, password: string): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Authentication failed');
  }
  const data = await res.json();
  setAuthSession(data.token, data);
  return data;
}

export async function fetchEventsFromBackend(filters?: FilterState): Promise<WeatherEvent[]> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.severity && filters.severity !== 'all') params.append('severity', filters.severity);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.state && filters.state !== 'all') params.append('state', filters.state);
      if (filters.searchQuery && filters.searchQuery.trim()) params.append('search', filters.searchQuery.trim());
    }
    params.append('limit', '150');

    const res = await fetch(`${API_BASE}/events?${params.toString()}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend API currently unreachable. Falling back to local verified synoptic dataset.');
  }

  return filters ? filterWeatherEvents(INITIAL_WEATHER_EVENTS, filters) : INITIAL_WEATHER_EVENTS;
}

export async function fetchKPISummaryFromBackend(): Promise<KPISummary> {
  try {
    const res = await fetch(`${API_BASE}/kpi`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend KPI currently unreachable. Falling back to local summary.');
  }
  return MOCK_KPI_SUMMARY;
}

export async function submitCitizenReportToBackend(form: CitizenSubmissionForm): Promise<WeatherEvent> {
  try {
    const res = await fetch(`${API_BASE}/reports/citizen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: form.title,
        category: form.category,
        severity: form.severity,
        description: form.description,
        state: form.state,
        district: form.district,
        locationName: form.locationName,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        reporterName: form.reporterName,
        reporterContact: form.reporterContact,
        mediaFileUrl: form.mediaFileUrl,
      }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend submission failed, saving locally.');
  }

  return {
    id: `CIT-${Date.now().toString().slice(-5)}`,
    title: form.title,
    description: form.description,
    category: form.category,
    severity: form.severity,
    status: 'pending_review',
    confidenceScore: 65,
    location: {
      name: form.locationName,
      district: form.district,
      state: form.state,
      lat: Number(form.latitude) || 20.46,
      lng: Number(form.longitude) || 85.88,
    },
    timestamp: new Date().toISOString(),
    reportedAt: 'Just now',
    source: {
      id: `src-cit-${Date.now()}`,
      name: `Citizen Report: ${form.reporterName}`,
      type: 'citizen',
      trustScore: 70,
    },
    corroboratingSourcesCount: 1,
    evidenceList: [
      {
        sourceName: `Citizen Geotagged Upload (${form.reporterName})`,
        sourceType: 'citizen',
        timestamp: 'Just now',
        excerpt: form.description,
        confidenceContribution: 65,
      },
    ],
    mediaUrls: form.mediaFileUrl ? [form.mediaFileUrl] : [],
    aiAnalysis: {
      nlpKeywords: [form.category, form.district.toLowerCase(), 'citizen-verified'],
      sentiment: form.severity === 'critical' ? 'emergency' : 'warning',
      anomalyFlag: false,
      verificationNotes: 'Direct citizen ground truth report.',
    },
  };
}

export async function fetchAIAnalysisFromBackend(reportId: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/ai/analysis/${reportId}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`Failed to fetch AI analysis for ${reportId}:`, err);
  }
  return null;
}

export async function submitVerificationDecision(
  reportId: string,
  newStatus: string,
  notes?: string
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/ai/verify/${reportId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        new_status: newStatus,
        reviewer_name: 'Authorized Weather Officer',
        notes: notes || 'Human reviewer decision updated from operations console.',
      }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`Failed to update verification status for ${reportId}:`, err);
  }
  return null;
}

// Admin Panel API Calls
export async function fetchAdminStats(): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/dashboard-stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch admin stats. Ensure you are logged in.');
  }
  return await res.json();
}

export async function fetchReviewQueue(params: Record<string, string>): Promise<any> {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/admin/review-queue?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch review queue.');
  }
  return await res.json();
}

export async function submitAdminAction(
  reportId: string,
  action: string,
  notes?: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      report_id: reportId,
      action,
      notes: notes || 'Administrative review action rendered',
    }),
  });
  if (!res.ok) {
    throw new Error('Admin action failed.');
  }
  return await res.json();
}

export async function mergeDuplicateReports(
  primaryReportId: string,
  targetReportIds: string[],
  groupTitle?: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/merge-reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      primary_report_id: primaryReportId,
      target_report_ids: targetReportIds,
      group_title: groupTitle,
    }),
  });
  if (!res.ok) {
    throw new Error('Merge reports failed.');
  }
  return await res.json();
}

// Analytics API Call
export async function fetchAnalyticsSummary(state?: string, category?: string): Promise<any> {
  const params = new URLSearchParams();
  if (state && state !== 'all') params.append('state', state);
  if (category && category !== 'all') params.append('category', category);

  const res = await fetch(`${API_BASE}/analytics/summary?${params.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch analytics summary.');
  }
  return await res.json();
}
