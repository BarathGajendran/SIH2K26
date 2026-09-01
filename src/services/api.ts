import {
  LandParcel,
  SurveySession,
  SurveyPoint,
  CorsStation,
  EncroachmentAlert,
  SurveyDocument,
  AuditLog,
  DashboardStats,
  GNSSLiveState,
  User,
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'API request failed');
  }

  return res.json();
}

export const api = {
  // Auth
  getUsers: () => fetchJson<{ success: boolean; users: User[] }>('/auth/users'),
  login: (email?: string, role?: string) =>
    fetchJson<{ success: boolean; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    }),
  registerFarmer: (data: {
    name: string;
    email?: string;
    phone: string;
    village?: string;
    taluk?: string;
    district?: string;
    state?: string;
    surveyNumber?: string;
    pattaNumber?: string;
    areaAcres?: number;
    landType?: string;
    crops?: string[];
    password?: string;
  }) =>
    fetchJson<{ success: boolean; message: string; user: User; parcel: LandParcel; token: string }>(
      '/auth/register-farmer',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),
  requestFarmerResurvey: (data: {
    parcelId: string;
    reason: string;
    preferredDate?: string;
    notes?: string;
    applicantName?: string;
    applicantPhone?: string;
  }) =>
    fetchJson<{ success: boolean; message: string; parcel: LandParcel }>('/farmer/request-resurvey', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Parcels
  getParcels: (params?: { village?: string; district?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchJson<{ success: boolean; count: number; parcels: LandParcel[] }>(`/parcels?${query}`);
  },
  getParcelById: (id: string) =>
    fetchJson<{
      success: boolean;
      parcel: LandParcel;
      surveys: SurveySession[];
      documents: SurveyDocument[];
      alerts: EncroachmentAlert[];
    }>(`/parcels/${id}`),
  createParcel: (data: Partial<LandParcel> & { coordinates: number[][] }) =>
    fetchJson<{ success: boolean; parcel: LandParcel }>('/parcels', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Surveys
  getSurveys: (params?: { parcelId?: string; surveyorId?: string; status?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchJson<{ success: boolean; count: number; surveys: SurveySession[] }>(`/surveys?${query}`);
  },
  getSurveyById: (id: string) =>
    fetchJson<{ success: boolean; survey: SurveySession; parcel: LandParcel }>(`/surveys/${id}`),
  createSurvey: (data: {
    parcelId: string;
    surveyType: string;
    surveyorId?: string;
    surveyorName?: string;
    notes?: string;
  }) =>
    fetchJson<{ success: boolean; survey: SurveySession }>('/surveys', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addSurveyPoint: (surveyId: string, pointData: Partial<SurveyPoint>) =>
    fetchJson<{ success: boolean; point: SurveyPoint; pointsCount: number; survey: SurveySession }>(
      `/surveys/${surveyId}/points`,
      {
        method: 'POST',
        body: JSON.stringify(pointData),
      }
    ),
  closeBoundary: (surveyId: string) =>
    fetchJson<{
      success: boolean;
      survey: SurveySession;
      areaAcres: number;
      areaSqM: number;
      perimeterM: number;
      discrepancy?: { diffSqM: number; diffPct: number; maxDisplacementM: number };
    }>(`/surveys/${surveyId}/close-boundary`, { method: 'POST' }),
  completeSurvey: (surveyId: string) =>
    fetchJson<{ success: boolean; survey: SurveySession; encroachmentsDetected: number; alerts: EncroachmentAlert[] }>(
      `/surveys/${surveyId}/complete`,
      { method: 'POST' }
    ),

  // GNSS & CORS
  getGNSSStatus: () => fetchJson<{ success: boolean; gnss: GNSSLiveState }>('/gnss/status'),
  updateGNSSPos: (pos: Partial<GNSSLiveState>) =>
    fetchJson<{ success: boolean; gnss: GNSSLiveState }>('/gnss/update-pos', {
      method: 'POST',
      body: JSON.stringify(pos),
    }),
  importCsvPoints: (csvContent: string, parcelId?: string) =>
    fetchJson<{
      success: boolean;
      pointsCount: number;
      points: SurveyPoint[];
      areaAcres: number;
      areaSqM: number;
      perimeterM: number;
      geometry: GeoJSON.Polygon;
    }>('/gnss/import-csv', {
      method: 'POST',
      body: JSON.stringify({ csvContent, parcelId }),
    }),
  getCorsStations: () => fetchJson<{ success: boolean; stations: CorsStation[] }>('/cors/stations'),

  // Encroachments
  getEncroachments: (params?: { status?: string; severity?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchJson<{ success: boolean; count: number; encroachments: EncroachmentAlert[] }>(`/encroachments?${query}`);
  },
  updateEncroachmentStatus: (id: string, data: { status: string; resolutionNotes?: string }) =>
    fetchJson<{ success: boolean; alert: EncroachmentAlert }>(`/encroachments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Verification
  getVerificationQueue: () =>
    fetchJson<{
      success: boolean;
      count: number;
      queue: { survey: SurveySession; parcel: LandParcel; alerts: EncroachmentAlert[] }[];
    }>('/verification/queue'),
  verifySurveyAction: (
    surveyId: string,
    data: { action: 'APPROVE' | 'REJECT' | 'REQUEST_RESURVEY'; notes?: string; officialName?: string; officialId?: string }
  ) =>
    fetchJson<{ success: boolean; survey: SurveySession; parcel?: LandParcel }>(`/verification/${surveyId}/action`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Dashboard & Search
  getDashboardStats: () => fetchJson<{ success: boolean; stats: DashboardStats }>('/dashboard/stats'),
  globalSearch: (q: string) => fetchJson<{ success: boolean; results: LandParcel[] }>(`/search?q=${encodeURIComponent(q)}`),
  getDocuments: (parcelId?: string) => {
    const query = parcelId ? `?parcelId=${parcelId}` : '';
    return fetchJson<{ success: boolean; documents: SurveyDocument[] }>(`/documents${query}`);
  },
  getAuditLogs: () => fetchJson<{ success: boolean; count: number; auditLogs: AuditLog[] }>('/admin/audit-logs'),
  getToleranceConfig: () => fetchJson<{ success: boolean; config: any }>('/admin/tolerance-config'),
  updateToleranceConfig: (config: { normalToleranceM?: number; reviewThresholdM?: number; encroachmentThresholdM?: number }) =>
    fetchJson<{ success: boolean; config: any }>('/admin/tolerance-config', {
      method: 'POST',
      body: JSON.stringify(config),
    }),
  createAdminUser: (data: { name: string; email: string; phone?: string; role: string; organization?: string; badgeNumber?: string }) =>
    fetchJson<{ success: boolean; user: User }>('/admin/create-user', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSystemHealth: () => fetchJson<{ success: boolean; system: any }>('/admin/health'),

  // One-click demo
  runDemoScenario: () =>
    fetchJson<{ success: boolean; message: string; survey: SurveySession; parcel: LandParcel }>('/demo/run-scenario', {
      method: 'POST',
    }),
};
