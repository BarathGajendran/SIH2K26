import {
  User,
  LandParcel,
  SurveySession,
  CorsStation,
  EncroachmentAlert,
  SurveyDocument,
  AuditLog,
  SpatialToleranceConfig,
  GNSSLiveState,
} from '../src/types';
import { calculateGeodesicArea, calculatePerimeter, convertArea } from './spatial';

export interface DatabaseState {
  users: User[];
  parcels: LandParcel[];
  surveys: SurveySession[];
  corsStations: CorsStation[];
  encroachments: EncroachmentAlert[];
  documents: SurveyDocument[];
  auditLogs: AuditLog[];
  config: SpatialToleranceConfig;
  liveGNSS: GNSSLiveState;
}

// Initial Seed Users
const initialUsers: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Dr. Rajeshwari Ramanathan (IAS)',
    email: 'admin@bhubharat.gov.in',
    phone: '+91 98401 23456',
    role: 'ADMIN',
    organization: 'Survey and Settlement Department, Govt of India',
    badgeNumber: 'IAS-2012-TN-098',
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'usr-official-1',
    name: 'Shri. M. Shanmugam',
    email: 'official@bhubharat.gov.in',
    phone: '+91 94432 87654',
    role: 'OFFICIAL',
    organization: 'Revenue Divisional Office (RDO), Coimbatore North',
    badgeNumber: 'REV-OFF-4412',
    createdAt: '2024-01-15T11:00:00Z',
  },
  {
    id: 'usr-surveyor-1',
    name: 'K. Karthikeyan, Licensed Surveyor',
    email: 'surveyor@bhubharat.gov.in',
    phone: '+91 97890 54321',
    role: 'SURVEYOR',
    organization: 'National Cadastral Survey Agency / SoI Empanelled',
    badgeNumber: 'SURV-RTK-8902',
    createdAt: '2024-01-20T09:30:00Z',
  },
  {
    id: 'usr-landowner-1',
    name: 'K. S. Ramasamy Gounder',
    email: 'farmer@bhubharat.gov.in',
    phone: '+91 94421 11223',
    role: 'LANDOWNER',
    organization: 'Agricultural Landholder (Patta Holder)',
    badgeNumber: 'PATTA-THOND-142',
    createdAt: '2024-02-01T14:20:00Z',
  },
  {
    id: 'usr-landowner-2',
    name: 'S. Selvaraj & Family',
    email: 'selvaraj.farmer@gmail.com',
    phone: '+91 94876 33445',
    role: 'LANDOWNER',
    organization: 'Agricultural Landholder',
    badgeNumber: 'PATTA-THOND-143',
    createdAt: '2024-02-05T10:00:00Z',
  },
];

// Seed CORS reference stations
const initialCorsStations: CorsStation[] = [
  {
    id: 'cors-tn-cbe-01',
    stationName: 'Coimbatore Agriculture Univ CORS',
    stationCode: 'TN-CORS-CBTR',
    host: 'cors.surveyofindia.gov.in',
    port: 2101,
    mountpoint: 'RTCM32_MSM4_CBTR',
    status: 'ONLINE',
    latitude: 11.0125,
    longitude: 76.9356,
    elevationM: 426.8,
    format: 'RTCM 3.2 MSM4 (1004, 1006, 1012, 1074, 1084, 1134)',
    correctionLatencyMs: 24,
    connectedRoversCount: 14,
    uptimePct: 99.98,
    carrierFrequencies: ['GPS L1/L2/L5', 'GLONASS G1/G2', 'Galileo E1/E5a', 'NavIC L5/S'],
    agency: 'Survey of India (SoI) National CORS Network',
    lastHeartbeat: new Date().toISOString(),
  },
  {
    id: 'cors-tn-chn-01',
    stationName: 'Chennai Guindy Reference Station',
    stationCode: 'TN-CORS-CHNN',
    host: 'cors.surveyofindia.gov.in',
    port: 2101,
    mountpoint: 'RTCM32_MSM4_CHNN',
    status: 'ONLINE',
    latitude: 13.0102,
    longitude: 80.2158,
    elevationM: 28.4,
    format: 'RTCM 3.2 MSM4',
    correctionLatencyMs: 18,
    connectedRoversCount: 28,
    uptimePct: 99.94,
    carrierFrequencies: ['GPS L1/L2', 'GLONASS G1/G2', 'NavIC L5'],
    agency: 'Survey of India (SoI)',
    lastHeartbeat: new Date().toISOString(),
  },
  {
    id: 'cors-ka-blr-01',
    stationName: 'Bengaluru GKVK Reference Station',
    stationCode: 'KA-CORS-BLR1',
    host: 'cors.karnataka.gov.in',
    port: 2101,
    mountpoint: 'RTCM33_MSM5_BLR',
    status: 'ONLINE',
    latitude: 13.0768,
    longitude: 77.5752,
    elevationM: 924.1,
    format: 'RTCM 3.3 MSM5',
    correctionLatencyMs: 31,
    connectedRoversCount: 19,
    uptimePct: 99.89,
    carrierFrequencies: ['GPS L1/L2/L5', 'Galileo E1/E5', 'NavIC L5'],
    agency: 'Karnataka Remote Sensing Applications Centre (KSRSAC)',
    lastHeartbeat: new Date().toISOString(),
  },
  {
    id: 'cors-mh-pun-01',
    stationName: 'Pune Pashan CORS Base',
    stationCode: 'MH-CORS-PUNE',
    host: 'cors.maharashtra.gov.in',
    port: 2101,
    mountpoint: 'RTCM32_MSM4_PUN',
    status: 'ONLINE',
    latitude: 18.5362,
    longitude: 73.8052,
    elevationM: 574.0,
    format: 'RTCM 3.2 MSM4',
    correctionLatencyMs: 22,
    connectedRoversCount: 22,
    uptimePct: 99.91,
    carrierFrequencies: ['GPS L1/L2', 'GLONASS G1/G2', 'NavIC L5'],
    agency: 'Maharashtra Land Records Department',
    lastHeartbeat: new Date().toISOString(),
  },
];

// Helper to create polygons with metrics
function makeParcel(
  id: string,
  parcelNumber: string,
  surveyNumber: string,
  ownerId: string,
  ownerName: string,
  village: string,
  taluk: string,
  district: string,
  state: string,
  coords: number[][],
  status: LandParcel['status'],
  landType: LandParcel['landType'],
  crops: string[],
  soilType: string,
  options?: Partial<LandParcel>
): LandParcel {
  const polyCoords = [...coords];
  // Ensure closed
  if (
    polyCoords[0][0] !== polyCoords[polyCoords.length - 1][0] ||
    polyCoords[0][1] !== polyCoords[polyCoords.length - 1][1]
  ) {
    polyCoords.push([...polyCoords[0]]);
  }

  const areaSqM = calculateGeodesicArea(polyCoords);
  const perimeterM = calculatePerimeter(polyCoords);
  const converted = convertArea(areaSqM);

  return {
    id,
    parcelNumber,
    surveyNumber,
    khasraNumber: `KH-${surveyNumber.replace('/', '-')}`,
    ownerId,
    ownerName,
    ownerPhone: '+91 98401 55667',
    village,
    taluk,
    district,
    state,
    areaAcres: converted.acres,
    areaSqM: converted.sqM,
    areaHectares: converted.hectares,
    areaGunthas: converted.gunthas,
    perimeterM: Number(perimeterM.toFixed(2)),
    geometry: {
      type: 'Polygon',
      coordinates: [polyCoords],
    },
    status,
    landType,
    soilType,
    crops,
    lastSurveyDate: '2024-01-14',
    lastSurveyorName: 'K. Karthikeyan, Licensed Surveyor',
    lastSurveyAccuracyM: 0.018,
    createdAt: '2023-11-10T10:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    documentsCount: 3,
    ...options,
  };
}

// 20 realistic agricultural parcels around Coimbatore (Thondamuthur & Pollachi), Pune (Haveli), Hassan, and Bapatla
const initialParcels: LandParcel[] = [
  // Village 1: Thondamuthur, Coimbatore, Tamil Nadu (Center ~10.992, 76.835)
  makeParcel(
    'pcl-cbe-001',
    'TN-CBE-THOND-2024-001',
    '142/3A',
    'usr-landowner-1',
    'K. S. Ramasamy Gounder',
    'Thondamuthur',
    'Coimbatore South',
    'Coimbatore',
    'Tamil Nadu',
    [
      [76.83412, 10.99215],
      [76.83585, 10.99245],
      [76.83612, 10.99082],
      [76.83438, 10.99052],
      [76.83412, 10.99215],
    ],
    'VERIFIED',
    'WET_AGRICULTURAL',
    ['Sugarcane', 'Coconut', 'Paddy'],
    'Red Loam / Clay',
    {
      assignedSurveyorId: 'usr-surveyor-1',
      assignedSurveyorName: 'K. Karthikeyan',
    }
  ),

  makeParcel(
    'pcl-cbe-002',
    'TN-CBE-THOND-2024-002',
    '142/3B',
    'usr-landowner-2',
    'S. Selvaraj & Family',
    'Thondamuthur',
    'Coimbatore South',
    'Coimbatore',
    'Tamil Nadu',
    // Adjoining parcel with a subtle 3.8m overlap that triggers encroachment warning
    [
      [76.83575, 10.99242],
      [76.83765, 10.99268],
      [76.83788, 10.99105],
      [76.83602, 10.99080],
      [76.83575, 10.99242],
    ],
    'DISPUTED',
    'WET_AGRICULTURAL',
    ['Turmeric', 'Banana'],
    'Black Cotton / Clay Loam',
    {
      encroachmentFlag: true,
    }
  ),

  makeParcel(
    'pcl-cbe-003',
    'TN-CBE-THOND-2024-003',
    '143/1',
    'usr-landowner-1',
    'K. S. Ramasamy Gounder',
    'Thondamuthur',
    'Coimbatore South',
    'Coimbatore',
    'Tamil Nadu',
    [
      [76.83425, 10.99042],
      [76.83605, 10.99072],
      [76.83628, 10.98912],
      [76.83448, 10.98882],
      [76.83425, 10.99042],
    ],
    'PENDING_SURVEY',
    'GARDEN_LAND',
    ['Areca Nut', 'Nutmeg', 'Pepper'],
    'Red Sandy Loam'
  ),

  makeParcel(
    'pcl-cbe-004',
    'TN-CBE-THOND-2024-004',
    '144/2A',
    'usr-landowner-3',
    'P. Muthusamy',
    'Thondamuthur',
    'Coimbatore South',
    'Coimbatore',
    'Tamil Nadu',
    [
      [76.83618, 10.99068],
      [76.83802, 10.99092],
      [76.83825, 10.98932],
      [76.83642, 10.98905],
      [76.83618, 10.99068],
    ],
    'VERIFIED',
    'ORCHARD',
    ['Mango (Alphonso)', 'Guava'],
    'Alluvial Sand'
  ),

  makeParcel(
    'pcl-cbe-005',
    'TN-CBE-THOND-2024-005',
    '145/1C',
    'usr-landowner-4',
    'V. Murugesan',
    'Thondamuthur',
    'Coimbatore South',
    'Coimbatore',
    'Tamil Nadu',
    [
      [76.83225, 10.99202],
      [76.83398, 10.99228],
      [76.83420, 10.99062],
      [76.83248, 10.99035],
      [76.83225, 10.99202],
    ],
    'SURVEY_IN_PROGRESS',
    'DRY_AGRICULTURAL',
    ['Maize', 'Cotton', 'Pulses'],
    'Red Gravel'
  ),

  // Village 2: Pollachi Anaimalai (Coconut Capital, Tamil Nadu) ~10.582, 76.935
  makeParcel(
    'pcl-pol-001',
    'TN-CBE-POL-2024-010',
    '88/2',
    'usr-landowner-5',
    'A. Palanisamy',
    'Anaimalai',
    'Pollachi',
    'Coimbatore',
    'Tamil Nadu',
    [
      [76.93215, 10.58245],
      [76.93485, 10.58278],
      [76.93512, 10.58065],
      [76.93242, 10.58032],
      [76.93215, 10.58245],
    ],
    'VERIFIED',
    'ORCHARD',
    ['Tender Coconut', 'Cocoa', 'Vanilla'],
    'Rich Red Loam'
  ),

  makeParcel(
    'pcl-pol-002',
    'TN-CBE-POL-2024-011',
    '89/1A',
    'usr-landowner-6',
    'N. Soundararajan',
    'Anaimalai',
    'Pollachi',
    'Coimbatore',
    'Tamil Nadu',
    [
      [76.93502, 10.58272],
      [76.93765, 10.58302],
      [76.93792, 10.58092],
      [76.93528, 10.58062],
      [76.93502, 10.58272],
    ],
    'RESURVEY_REQUESTED',
    'WET_AGRICULTURAL',
    ['Paddy (Ponni)', 'Jasmine'],
    'Clayey Loam'
  ),

  // Village 3: Alandi / Haveli, Pune, Maharashtra ~18.675, 73.895
  makeParcel(
    'pcl-pun-001',
    'MH-PUN-HAV-2024-021',
    '72/4',
    'usr-landowner-7',
    'Dnyaneshwar Babanrao Patil',
    'Alandi',
    'Haveli',
    'Pune',
    'Maharashtra',
    [
      [73.89425, 18.67512],
      [73.89665, 18.67545],
      [73.89692, 18.67362],
      [73.89452, 18.67328],
      [73.89425, 18.67512],
    ],
    'VERIFIED',
    'WET_AGRICULTURAL',
    ['Sugarcane', 'Onion', 'Soybean'],
    'Medium Deep Black'
  ),

  makeParcel(
    'pcl-pun-002',
    'MH-PUN-HAV-2024-022',
    '73/1',
    'usr-landowner-8',
    'Sambhaji Tukaram Shinde',
    'Alandi',
    'Haveli',
    'Pune',
    'Maharashtra',
    [
      [73.89658, 18.67540],
      [73.89885, 18.67570],
      [73.89912, 18.67388],
      [73.89685, 18.67358],
      [73.89658, 18.67540],
    ],
    'DISPUTED',
    'DRY_AGRICULTURAL',
    ['Wheat', 'Gram', 'Bajra'],
    'Black Cotton Soil',
    {
      encroachmentFlag: true,
    }
  ),

  // Village 4: Channarayapatna, Hassan, Karnataka ~12.905, 76.388
  makeParcel(
    'pcl-has-001',
    'KA-HAS-CRP-2024-031',
    '105/2B',
    'usr-landowner-9',
    'H. K. Devegowda & Sons',
    'Channarayapatna',
    'Channarayapatna',
    'Hassan',
    'Karnataka',
    [
      [76.38725, 12.90545],
      [76.38985, 12.90582],
      [76.39012, 12.90378],
      [76.38752, 12.90342],
      [76.38725, 12.90545],
    ],
    'VERIFIED',
    'GARDEN_LAND',
    ['Coconut', 'Ragi', 'Potato'],
    'Red Sandy Loam'
  ),

  // Village 5: Bapatla, Guntur, Andhra Pradesh ~15.905, 80.468
  makeParcel(
    'pcl-bap-001',
    'AP-GNT-BAP-2024-041',
    '54/3A',
    'usr-landowner-10',
    'K. Venkata Subbarao',
    'Karlapalem',
    'Bapatla',
    'Bapatla',
    'Andhra Pradesh',
    [
      [80.46725, 15.90515],
      [80.46985, 15.90552],
      [80.47012, 15.90348],
      [80.46752, 15.90312],
      [80.46725, 15.90515],
    ],
    'PENDING_SURVEY',
    'WET_AGRICULTURAL',
    ['Paddy (BPT 5204 Samba Masuri)', 'Chilli'],
    'Coastal Alluvial'
  ),
];

// Seed active / previous survey sessions
const initialSurveys: SurveySession[] = [
  {
    id: 'srv-session-001',
    parcelId: 'pcl-cbe-001',
    parcelNumber: 'TN-CBE-THOND-2024-001',
    surveyNumber: '142/3A',
    village: 'Thondamuthur',
    surveyorId: 'usr-surveyor-1',
    surveyorName: 'K. Karthikeyan, Licensed Surveyor',
    surveyType: 'RESURVEY',
    startedAt: '2024-01-14T08:30:00Z',
    completedAt: '2024-01-14T10:15:00Z',
    accuracy: 0.014, // 1.4 cm
    correctionSource: 'TN-CORS-CBTR (NTRIP/RTCM 3.2 MSM4)',
    status: 'APPROVED',
    calculatedAreaSqM: 32450.8,
    calculatedAreaAcres: 8.018,
    calculatedPerimeterM: 732.4,
    points: [
      {
        id: 'pt-001',
        surveySessionId: 'srv-session-001',
        sequenceNumber: 1,
        pointCode: 'P1',
        latitude: 10.99215,
        longitude: 76.83412,
        altitude: 412.35,
        accuracy: 0.012,
        fixType: 'FIXED',
        satelliteCount: 28,
        hdop: 0.72,
        vdop: 0.94,
        timestamp: '2024-01-14T08:45:12Z',
        notes: 'NW boundary concrete survey stone corner',
      },
      {
        id: 'pt-002',
        surveySessionId: 'srv-session-001',
        sequenceNumber: 2,
        pointCode: 'P2',
        latitude: 10.99245,
        longitude: 76.83585,
        altitude: 412.82,
        accuracy: 0.014,
        fixType: 'FIXED',
        satelliteCount: 29,
        hdop: 0.68,
        vdop: 0.88,
        timestamp: '2024-01-14T09:05:40Z',
        notes: 'NE boundary adjacent to irrigation canal',
      },
      {
        id: 'pt-003',
        surveySessionId: 'srv-session-001',
        sequenceNumber: 3,
        pointCode: 'P3',
        latitude: 10.99082,
        longitude: 76.83612,
        altitude: 411.95,
        accuracy: 0.015,
        fixType: 'FIXED',
        satelliteCount: 27,
        hdop: 0.75,
        vdop: 0.98,
        timestamp: '2024-01-14T09:35:18Z',
        notes: 'SE boundary corner adjacent to Cart Track road',
      },
      {
        id: 'pt-004',
        surveySessionId: 'srv-session-001',
        sequenceNumber: 4,
        pointCode: 'P4',
        latitude: 10.99052,
        longitude: 76.83438,
        altitude: 411.60,
        accuracy: 0.016,
        fixType: 'FIXED',
        satelliteCount: 28,
        hdop: 0.70,
        vdop: 0.91,
        timestamp: '2024-01-14T10:02:05Z',
        notes: 'SW corner survey peg at village boundary',
      },
    ],
    verifiedBy: 'Shri. M. Shanmugam (RDO)',
    verifiedAt: '2024-01-15T12:00:00Z',
    verificationNotes: 'Boundary matches FMB sketch perfectly within 1.8cm RTK tolerance. Approved for Patta passbook update.',
  },
  {
    id: 'srv-session-002',
    parcelId: 'pcl-cbe-002',
    parcelNumber: 'TN-CBE-THOND-2024-002',
    surveyNumber: '142/3B',
    village: 'Thondamuthur',
    surveyorId: 'usr-surveyor-1',
    surveyorName: 'K. Karthikeyan, Licensed Surveyor',
    surveyType: 'DISPUTE_SETTLEMENT',
    startedAt: '2024-02-18T09:00:00Z',
    completedAt: '2024-02-18T11:30:00Z',
    accuracy: 0.019,
    correctionSource: 'TN-CORS-CBTR (NTRIP/RTCM 3.2 MSM4)',
    status: 'SUBMITTED',
    calculatedAreaSqM: 35120.4,
    calculatedAreaAcres: 8.678,
    calculatedPerimeterM: 765.2,
    areaDiscrepancySqM: 142.6,
    areaDiscrepancyPct: 2.8,
    maxDisplacementM: 3.82,
    points: [
      {
        id: 'pt-011',
        surveySessionId: 'srv-session-002',
        sequenceNumber: 1,
        pointCode: 'P1',
        latitude: 10.99242,
        longitude: 76.83575,
        altitude: 412.7,
        accuracy: 0.018,
        fixType: 'FIXED',
        satelliteCount: 26,
        hdop: 0.76,
        vdop: 0.99,
        timestamp: '2024-02-18T09:20:00Z',
      },
      {
        id: 'pt-012',
        surveySessionId: 'srv-session-002',
        sequenceNumber: 2,
        pointCode: 'P2',
        latitude: 10.99268,
        longitude: 76.83765,
        altitude: 413.1,
        accuracy: 0.019,
        fixType: 'FIXED',
        satelliteCount: 28,
        hdop: 0.72,
        vdop: 0.91,
        timestamp: '2024-02-18T09:55:00Z',
      },
      {
        id: 'pt-013',
        surveySessionId: 'srv-session-002',
        sequenceNumber: 3,
        pointCode: 'P3',
        latitude: 10.99105,
        longitude: 76.83788,
        altitude: 412.2,
        accuracy: 0.021,
        fixType: 'FIXED',
        satelliteCount: 27,
        hdop: 0.74,
        vdop: 0.95,
        timestamp: '2024-02-18T10:30:00Z',
      },
      {
        id: 'pt-014',
        surveySessionId: 'srv-session-002',
        sequenceNumber: 4,
        pointCode: 'P4',
        latitude: 10.99080,
        longitude: 76.83602,
        altitude: 411.8,
        accuracy: 0.018,
        fixType: 'FIXED',
        satelliteCount: 29,
        hdop: 0.69,
        vdop: 0.89,
        timestamp: '2024-02-18T11:05:00Z',
      },
    ],
    notes: 'Western boundary fence appears displaced eastward by 3.82 meters into Survey No. 142/3A.',
  },
];

// Seed Encroachment Alerts
const initialEncroachments: EncroachmentAlert[] = [
  {
    id: 'enc-alert-001',
    parcelId: 'pcl-cbe-002',
    parcelNumber: 'TN-CBE-THOND-2024-002',
    surveyNumber: '142/3B',
    affectedParcelId: 'pcl-cbe-001',
    affectedParcelNumber: 'TN-CBE-THOND-2024-001 (142/3A)',
    affectedOwnerName: 'K. S. Ramasamy Gounder',
    village: 'Thondamuthur',
    taluk: 'Coimbatore South',
    district: 'Coimbatore',
    overlapAreaSqM: 142.6,
    overlapAreaAcres: 0.035,
    displacementM: 3.82,
    severity: 'HIGH',
    status: 'DETECTED',
    detectedAt: '2024-02-18T11:35:00Z',
    description: 'PostGIS ST_Intersection detected 142.6 sq.m western boundary overlap beyond 0.5m standard RTK tolerance. Borewell pipeline installed in overlap area.',
    surveySessionId: 'srv-session-002',
  },
  {
    id: 'enc-alert-002',
    parcelId: 'pcl-pun-002',
    parcelNumber: 'MH-PUN-HAV-2024-022',
    surveyNumber: '73/1',
    affectedParcelId: 'pcl-pun-001',
    affectedParcelNumber: 'MH-PUN-HAV-2024-021 (72/4)',
    affectedOwnerName: 'Dnyaneshwar Babanrao Patil',
    village: 'Alandi',
    taluk: 'Haveli',
    district: 'Pune',
    overlapAreaSqM: 88.4,
    overlapAreaAcres: 0.022,
    displacementM: 2.15,
    severity: 'MEDIUM',
    status: 'NOTICE_ISSUED',
    detectedAt: '2024-02-10T14:20:00Z',
    description: 'Agricultural bund (Dhur) shifted 2.15m onto adjacent parcel during tractor leveling work.',
  },
];

// Seed Documents
const initialDocuments: SurveyDocument[] = [
  {
    id: 'doc-001',
    parcelId: 'pcl-cbe-001',
    parcelNumber: 'TN-CBE-THOND-2024-001',
    documentType: 'PATTA_CHITTA',
    title: 'e-Patta Passbook No. 142/2023',
    fileName: 'patta_chitta_142_3a.pdf',
    fileSizeKb: 482,
    fileUrl: '/documents/patta_142_3a.pdf',
    uploadedBy: 'usr-landowner-1',
    uploadedByName: 'K. S. Ramasamy Gounder',
    uploadedAt: '2024-01-10T11:00:00Z',
    verified: true,
  },
  {
    id: 'doc-002',
    parcelId: 'pcl-cbe-001',
    parcelNumber: 'TN-CBE-THOND-2024-001',
    documentType: 'FMB_SKETCH',
    title: 'Field Measurement Book (FMB) Sketch - SF 142',
    fileName: 'fmb_sf142_thondamuthur.pdf',
    fileSizeKb: 1240,
    fileUrl: '/documents/fmb_142.pdf',
    uploadedBy: 'usr-official-1',
    uploadedByName: 'Shri. M. Shanmugam (RDO)',
    uploadedAt: '2024-01-12T14:30:00Z',
    verified: true,
  },
  {
    id: 'doc-003',
    parcelId: 'pcl-cbe-001',
    parcelNumber: 'TN-CBE-THOND-2024-001',
    documentType: 'SURVEY_REPORT',
    title: 'Digital RTK Resurvey Certificate (Form IV)',
    fileName: 'rtk_cert_tn_cbe_001.pdf',
    fileSizeKb: 890,
    fileUrl: '/documents/rtk_cert_001.pdf',
    uploadedBy: 'usr-surveyor-1',
    uploadedByName: 'K. Karthikeyan, Licensed Surveyor',
    uploadedAt: '2024-01-15T12:30:00Z',
    verified: true,
  },
];

// Seed Audit Logs
const initialAuditLogs: AuditLog[] = [
  {
    id: 'aud-001',
    userId: 'usr-surveyor-1',
    userName: 'K. Karthikeyan',
    userRole: 'SURVEYOR',
    action: 'START_SURVEY',
    entityType: 'SURVEY',
    entityId: 'srv-session-001',
    details: 'Initiated RTK boundary resurvey for Parcel TN-CBE-THOND-2024-001 (SF 142/3A) with CORS station TN-CORS-CBTR lock.',
    timestamp: '2024-01-14T08:30:00Z',
  },
  {
    id: 'aud-002',
    userId: 'usr-surveyor-1',
    userName: 'K. Karthikeyan',
    userRole: 'SURVEYOR',
    action: 'CAPTURE_COORDINATES',
    entityType: 'POINT',
    entityId: 'srv-session-001',
    details: 'Captured 4 high-precision boundary corner coordinates with RTK FIXED state (avg accuracy: 1.4 cm).',
    timestamp: '2024-01-14T10:15:00Z',
  },
  {
    id: 'aud-003',
    userId: 'usr-official-1',
    userName: 'Shri. M. Shanmugam',
    userRole: 'OFFICIAL',
    action: 'APPROVE_SURVEY',
    entityType: 'SURVEY',
    entityId: 'srv-session-001',
    details: 'Verified and officially approved digital resurvey geometry. Area verified as 8.018 Acres (32,450.8 sq.m).',
    timestamp: '2024-01-15T12:00:00Z',
  },
  {
    id: 'aud-004',
    userId: 'usr-surveyor-1',
    userName: 'K. Karthikeyan',
    userRole: 'SURVEYOR',
    action: 'ENCROACHMENT_FLAGGED',
    entityType: 'ENCROACHMENT',
    entityId: 'enc-alert-001',
    details: 'Automated PostGIS ST_Intersection flagged 142.6 sq.m overlap on SF 142/3A during survey of SF 142/3B.',
    timestamp: '2024-02-18T11:35:00Z',
  },
];

// Initial Live GNSS Simulation Telemetry State
const initialGNSSState: GNSSLiveState = {
  latitude: 10.99215,
  longitude: 76.83412,
  altitude: 412.35,
  accuracy: 0.014,
  fixType: 'FIXED',
  satelliteCount: 28,
  hdop: 0.72,
  vdop: 0.94,
  correctionAgeSec: 1.1,
  corsStation: 'Coimbatore Agriculture Univ CORS',
  corsStationCode: 'TN-CORS-CBTR',
  ntripStatus: 'AUTHENTICATED',
  rtcmStatus: 'RECEIVING',
  rtcmPacketsReceived: 4528,
  rtkRatio: 99.8,
  speedKmh: 1.8,
  headingDeg: 84.5,
  activeConstellations: {
    navic: 7, // 7 NavIC satellites in orbit
    gps: 10,
    glonass: 6,
    galileo: 5,
    beidou: 0,
  },
  isSimulated: true,
  batteryLevelPct: 92,
};

// In-Memory Database Singleton
export class Database {
  private static instance: Database;
  public state: DatabaseState;

  private constructor() {
    this.state = {
      users: [...initialUsers],
      parcels: [...initialParcels],
      surveys: [...initialSurveys],
      corsStations: [...initialCorsStations],
      encroachments: [...initialEncroachments],
      documents: [...initialDocuments],
      auditLogs: [...initialAuditLogs],
      config: {
        normalToleranceM: 0.5,
        reviewThresholdM: 2.0,
        encroachmentThresholdM: 5.0,
      },
      liveGNSS: { ...initialGNSSState },
    };
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public logAudit(
    userId: string,
    userName: string,
    userRole: User['role'],
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    details: string
  ): void {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userName,
      userRole,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1 (Authenticated Session)',
    };
    this.state.auditLogs.unshift(log);
  }
}

export const db = Database.getInstance();
