export type UserRole = 'LANDOWNER' | 'SURVEYOR' | 'OFFICIAL' | 'ADMIN';
export type ThemeMode = 'light' | 'dark' | 'emerald' | 'saffron' | 'ocean';

export interface PortalInfo {
  id: UserRole;
  title: string;
  shortTitle: string;
  tagline: string;
  badge: string;
  iconName: string;
  description: string;
  plainTermsSummary: string;
  loginMethods: string[];
  demoUser: {
    name: string;
    email: string;
    badge: string;
    organization: string;
  };
  accentColor: string;
  allowedTabs: string[];
  keyFeatures: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
  badgeNumber?: string;
  createdAt: string;
}

export type ParcelStatus = 'VERIFIED' | 'PENDING_SURVEY' | 'SURVEY_IN_PROGRESS' | 'DISPUTED' | 'RESURVEY_REQUESTED';

export interface LandParcel {
  id: string;
  parcelNumber: string; // e.g. "TN-CBE-2024-0012"
  surveyNumber: string; // e.g. "142/3B"
  khasraNumber?: string;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  village: string;
  taluk: string;
  district: string;
  state: string;
  areaAcres: number;
  areaSqM: number;
  areaHectares: number;
  areaGunthas?: number;
  perimeterM: number;
  geometry: GeoJSON.Polygon; // GeoJSON Polygon [lng, lat]
  status: ParcelStatus;
  landType: 'WET_AGRICULTURAL' | 'DRY_AGRICULTURAL' | 'GARDEN_LAND' | 'ORCHARD' | 'FALLOW';
  soilType?: string;
  crops?: string[];
  lastSurveyDate?: string;
  lastSurveyorName?: string;
  lastSurveyAccuracyM?: number;
  assignedSurveyorId?: string;
  assignedSurveyorName?: string;
  createdAt: string;
  updatedAt: string;
  documentsCount?: number;
  encroachmentFlag?: boolean;
}

export type SurveyType = 'NEW_SURVEY' | 'RESURVEY' | 'BOUNDARY_VERIFICATION' | 'DISPUTE_SETTLEMENT';
export type SurveyStatus = 'IN_PROGRESS' | 'COMPLETED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'RESURVEY_REQUESTED';
export type FixType = 'SINGLE' | 'DGPS' | 'FLOAT' | 'FIXED';

export interface SurveyPoint {
  id: string;
  surveySessionId: string;
  sequenceNumber: number;
  pointCode: string; // e.g. "P1", "P2"
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number; // in meters, e.g. 0.014
  fixType: FixType;
  satelliteCount: number;
  hdop: number;
  vdop: number;
  timestamp: string;
  notes?: string;
}

export interface SurveySession {
  id: string;
  parcelId: string;
  parcelNumber: string;
  surveyNumber: string;
  village: string;
  surveyorId: string;
  surveyorName: string;
  surveyType: SurveyType;
  startedAt: string;
  completedAt?: string;
  accuracy: number; // avg accuracy in meters
  correctionSource: string; // e.g. "TN-CORS-CBTR-01 (NTRIP/RTCM 3.2)"
  status: SurveyStatus;
  points: SurveyPoint[];
  calculatedAreaSqM?: number;
  calculatedAreaAcres?: number;
  calculatedPerimeterM?: number;
  newGeometry?: GeoJSON.Polygon;
  oldGeometry?: GeoJSON.Polygon;
  areaDiscrepancySqM?: number;
  areaDiscrepancyPct?: number;
  maxDisplacementM?: number;
  notes?: string;
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface GNSSLiveState {
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number; // in meters
  fixType: FixType;
  satelliteCount: number;
  hdop: number;
  vdop: number;
  correctionAgeSec: number;
  corsStation: string;
  corsStationCode: string;
  ntripStatus: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'AUTHENTICATED';
  rtcmStatus: 'IDLE' | 'RECEIVING' | 'DECODING';
  rtcmPacketsReceived: number;
  rtkRatio: number;
  speedKmh: number;
  headingDeg: number;
  activeConstellations: {
    navic: number; // India's IRNSS/NavIC
    gps: number;
    glonass: number;
    galileo: number;
    beidou: number;
  };
  isSimulated: boolean;
  batteryLevelPct?: number;
}

export interface CorsStation {
  id: string;
  stationName: string;
  stationCode: string;
  host: string;
  port: number;
  mountpoint: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  latitude: number;
  longitude: number;
  elevationM: number;
  format: string; // "RTCM 3.2 MSM4"
  correctionLatencyMs: number;
  connectedRoversCount: number;
  uptimePct: number;
  carrierFrequencies: string[]; // ["L1", "L2", "L5", "E1", "E5a", "S-band"]
  agency: string; // e.g. "Survey of India (SoI) National CORS Network"
  lastHeartbeat: string;
}

export type EncroachmentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EncroachmentStatus = 'DETECTED' | 'UNDER_INVESTIGATION' | 'NOTICE_ISSUED' | 'RESOLVED' | 'DISMISSED';

export interface EncroachmentAlert {
  id: string;
  parcelId: string;
  parcelNumber: string;
  surveyNumber: string;
  affectedParcelId: string;
  affectedParcelNumber: string;
  affectedOwnerName: string;
  village: string;
  taluk: string;
  district: string;
  overlapGeometry?: GeoJSON.Polygon;
  overlapAreaSqM: number;
  overlapAreaAcres: number;
  displacementM: number;
  severity: EncroachmentSeverity;
  status: EncroachmentStatus;
  detectedAt: string;
  description: string;
  surveySessionId?: string;
  resolutionNotes?: string;
}

export interface BoundaryComparison {
  parcelId: string;
  parcelNumber: string;
  oldAreaSqM: number;
  newAreaSqM: number;
  oldAreaAcres: number;
  newAreaAcres: number;
  areaDifferenceSqM: number;
  percentageChange: number;
  maxDisplacementM: number;
  meanDisplacementM: number;
  intersectionAreaSqM: number;
  overlapPercentage: number;
  mismatchCategory: 'MATCH' | 'MINOR_DISCREPANCY' | 'SUSPECTED_ENCROACHMENT' | 'SIGNIFICANT_DISPUTE';
  oldGeometry: GeoJSON.Polygon;
  newGeometry: GeoJSON.Polygon;
  intersectionGeometry?: GeoJSON.Polygon;
  differenceOldGeometry?: GeoJSON.Polygon;
  differenceNewGeometry?: GeoJSON.Polygon;
}

export interface SurveyDocument {
  id: string;
  parcelId: string;
  parcelNumber: string;
  documentType: 'PATTA_CHITTA' | '7_12_EXTRACT' | 'CADASTRAL_MAP' | 'FMB_SKETCH' | 'SURVEY_REPORT' | 'RAW_GNSS_RINEX' | 'ENCROACHMENT_NOTICE';
  title: string;
  fileName: string;
  fileSizeKb: number;
  fileUrl: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  verified: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'PARCEL' | 'SURVEY' | 'POINT' | 'ENCROACHMENT' | 'CORS' | 'DOCUMENT' | 'AUTH';
  entityId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface DashboardStats {
  totalParcels: number;
  activeSurveys: number;
  completedSurveys: number;
  pendingVerifications: number;
  detectedEncroachments: number;
  totalAreaSurveyedAcres: number;
  onlineCorsStations: number;
  totalCorsStations: number;
  avgSurveyAccuracyCm: number;
  villageStats: { village: string; parcelCount: number; areaAcres: number }[];
  surveyStatusStats: { name: string; value: number; color: string }[];
  encroachmentSeverityStats: { name: string; value: number; color: string }[];
  monthlySurveyTrends: { month: string; newSurveys: number; resurveys: number; verified: number }[];
  accuracyDistribution: { range: string; count: number }[];
}

export interface SpatialToleranceConfig {
  normalToleranceM: number; // e.g. 0.5m
  reviewThresholdM: number; // e.g. 2.0m
  encroachmentThresholdM: number; // e.g. 5.0m
}
