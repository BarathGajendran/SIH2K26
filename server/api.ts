import express, { Request, Response, Router } from 'express';
import { db } from './db';
import {
  calculateGeodesicArea,
  calculatePerimeter,
  convertArea,
  validatePolygon,
  calculateBoundaryDisplacement,
  computePolygonOverlap,
  haversineDistance,
} from './spatial';
import { LandParcel, SurveyPoint, SurveySession, EncroachmentAlert, FixType } from '../src/types';

export const apiRouter = Router();

// ----------------------------------------------------
// 1. AUTHENTICATION & PERSONAS
// ----------------------------------------------------

apiRouter.get('/auth/users', (req: Request, res: Response) => {
  res.json({ success: true, users: db.state.users });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, role } = req.body;
  let user = db.state.users.find((u) => u.email === email);
  if (!user && role) {
    user = db.state.users.find((u) => u.role === role);
  }
  if (!user) {
    user = db.state.users[2]; // Default to Surveyor
  }

  db.logAudit(
    user.id,
    user.name,
    user.role,
    'USER_LOGIN',
    'AUTH',
    user.id,
    `Logged in as ${user.role} (${user.name})`
  );

  res.json({
    success: true,
    user,
    token: `jwt-mock-token-${user.id}-${Date.now()}`,
  });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, role, organization } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name,
    email,
    phone: phone || '+91 90000 00000',
    role: role || 'LANDOWNER',
    organization: organization || 'Individual Farmer / Landholder',
    createdAt: new Date().toISOString(),
  };

  db.state.users.push(newUser);
  db.logAudit(newUser.id, newUser.name, newUser.role, 'USER_REGISTER', 'AUTH', newUser.id, 'Registered new user');

  res.status(201).json({ success: true, user: newUser, token: `jwt-token-${newUser.id}` });
});

apiRouter.post('/auth/register-farmer', (req: Request, res: Response) => {
  const {
    name,
    email,
    phone,
    village,
    taluk,
    district,
    state,
    surveyNumber,
    pattaNumber,
    areaAcres,
    landType,
    crops,
    password,
  } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Farmer name and mobile phone are required' });
  }

  const generatedEmail = email || `farmer_${phone.replace(/\D/g, '').slice(-10)}@bhubharat.gov.in`;

  const newFarmerUser = {
    id: `usr-farmer-${Date.now()}`,
    name,
    email: generatedEmail,
    phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
    role: 'LANDOWNER' as const,
    organization: 'Agricultural Landholder (Patta Registered)',
    badgeNumber: pattaNumber ? `PATTA-${pattaNumber}` : `PATTA-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
  };

  db.state.users.push(newFarmerUser);

  // Generate an initial agricultural land parcel for this newly registered farmer
  const acres = parseFloat(String(areaAcres)) || 2.5;
  const sqM = Math.round(acres * 4046.86);
  const hectares = parseFloat((acres * 0.404686).toFixed(3));
  const gunthas = parseFloat((acres * 40).toFixed(1));

  // Center around Coimbatore / Tamil Nadu geodetic baseline
  const baseLat = 10.9915 + (Math.random() - 0.5) * 0.01;
  const baseLng = 76.8335 + (Math.random() - 0.5) * 0.01;
  const dLat = 0.0012;
  const dLng = 0.0012;

  const generatedParcel: LandParcel = {
    id: `pcl-${Date.now()}`,
    parcelNumber: `TN-CBE-2025-${Math.floor(1000 + Math.random() * 9000)}`,
    surveyNumber: surveyNumber || `${Math.floor(100 + Math.random() * 900)}/${Math.floor(1 + Math.random() * 4)}A`,
    khasraNumber: `KH-${Math.floor(1000 + Math.random() * 9000)}`,
    ownerId: newFarmerUser.id,
    ownerName: newFarmerUser.name,
    ownerPhone: newFarmerUser.phone,
    village: village || 'Thondamuthur',
    taluk: taluk || 'Perur',
    district: district || 'Coimbatore',
    state: state || 'Tamil Nadu',
    areaAcres: acres,
    areaSqM: sqM,
    areaHectares: hectares,
    areaGunthas: gunthas,
    perimeterM: Math.round(Math.sqrt(sqM) * 4),
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [baseLng, baseLat],
          [baseLng + dLng, baseLat],
          [baseLng + dLng, baseLat + dLat],
          [baseLng, baseLat + dLat],
          [baseLng, baseLat],
        ],
      ],
    },
    status: 'VERIFIED',
    landType: (landType as any) || 'WET_AGRICULTURAL',
    soilType: 'Red Loam / Clay Alluvium',
    crops: crops ? (Array.isArray(crops) ? crops : [crops]) : ['Sugarcane (Co 86032)', 'Coconut Palms'],
    lastSurveyDate: new Date().toISOString().split('T')[0],
    lastSurveyorName: 'K. Karthikeyan, Licensed Surveyor',
    lastSurveyAccuracyM: 0.014,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    documentsCount: 3,
    encroachmentFlag: false,
  };

  db.state.parcels.unshift(generatedParcel);

  // Add initial documents for this farmer
  db.state.documents.push(
    {
      id: `doc-${Date.now()}-1`,
      parcelId: generatedParcel.id,
      parcelNumber: generatedParcel.parcelNumber,
      documentType: 'PATTA_CHITTA',
      title: `e-Patta Passbook - SF ${generatedParcel.surveyNumber}`,
      fileName: `Patta_${generatedParcel.surveyNumber.replace('/', '_')}.pdf`,
      fileSizeKb: 1420,
      fileUrl: '#',
      uploadedBy: 'system',
      uploadedByName: 'Revenue Department Portal',
      uploadedAt: new Date().toISOString(),
      verified: true,
    },
    {
      id: `doc-${Date.now()}-2`,
      parcelId: generatedParcel.id,
      parcelNumber: generatedParcel.parcelNumber,
      documentType: 'FMB_SKETCH',
      title: `Field Measurement Book (FMB) Sketch - SF ${generatedParcel.surveyNumber}`,
      fileName: `FMB_${generatedParcel.surveyNumber.replace('/', '_')}.pdf`,
      fileSizeKb: 2850,
      fileUrl: '#',
      uploadedBy: 'system',
      uploadedByName: 'Survey & Settlement Directorate',
      uploadedAt: new Date().toISOString(),
      verified: true,
    }
  );

  db.logAudit(
    newFarmerUser.id,
    newFarmerUser.name,
    'LANDOWNER',
    'FARMER_REGISTRATION',
    'AUTH',
    newFarmerUser.id,
    `Registered new farmer ${newFarmerUser.name} with parcel SF ${generatedParcel.surveyNumber} (${generatedParcel.areaAcres} Acres)`
  );

  res.status(201).json({
    success: true,
    message: 'Farmer account and agricultural land holding registered successfully!',
    user: newFarmerUser,
    parcel: generatedParcel,
    token: `jwt-token-${newFarmerUser.id}`,
  });
});

apiRouter.post('/farmer/request-resurvey', (req: Request, res: Response) => {
  const { parcelId, reason, preferredDate, notes, applicantName, applicantPhone } = req.body;
  const parcel = db.state.parcels.find((p) => p.id === parcelId);
  if (!parcel) {
    return res.status(404).json({ success: false, message: 'Land parcel not found' });
  }

  parcel.status = 'RESURVEY_REQUESTED';
  parcel.updatedAt = new Date().toISOString();

  db.logAudit(
    parcel.ownerId || 'usr-farmer',
    applicantName || parcel.ownerName,
    'LANDOWNER',
    'RESURVEY_REQUESTED',
    'PARCEL',
    parcel.id,
    `Resurvey application submitted for SF ${parcel.surveyNumber} (${parcel.village}). Reason: ${reason || 'Boundary verification'}`
  );

  res.json({
    success: true,
    message: `Resurvey request for Survey No. ${parcel.surveyNumber} submitted to Tahsildar / Revenue Divisional Office!`,
    parcel,
  });
});

// ----------------------------------------------------
// 2. LAND PARCELS (PostGIS GeoJSON API)
// ----------------------------------------------------

apiRouter.get('/parcels', (req: Request, res: Response) => {
  const { village, district, status, ownerId, search } = req.query;
  let list = [...db.state.parcels];

  if (village) {
    list = list.filter((p) => p.village.toLowerCase() === String(village).toLowerCase());
  }
  if (district) {
    list = list.filter((p) => p.district.toLowerCase() === String(district).toLowerCase());
  }
  if (status) {
    list = list.filter((p) => p.status === status);
  }
  if (ownerId) {
    list = list.filter((p) => p.ownerId === ownerId);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (p) =>
        p.parcelNumber.toLowerCase().includes(q) ||
        p.surveyNumber.toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: list.length, parcels: list });
});

// GeoJSON FeatureCollection Endpoint
apiRouter.get('/parcels/geojson', (req: Request, res: Response) => {
  const features = db.state.parcels.map((p) => ({
    type: 'Feature',
    id: p.id,
    geometry: p.geometry,
    properties: {
      parcelNumber: p.parcelNumber,
      surveyNumber: p.surveyNumber,
      ownerName: p.ownerName,
      village: p.village,
      district: p.district,
      state: p.state,
      areaAcres: p.areaAcres,
      areaSqM: p.areaSqM,
      status: p.status,
      landType: p.landType,
      encroachmentFlag: p.encroachmentFlag || false,
    },
  }));

  res.json({
    type: 'FeatureCollection',
    features,
  });
});

apiRouter.get('/parcels/:id', (req: Request, res: Response) => {
  const parcel = db.state.parcels.find((p) => p.id === req.params.id || p.parcelNumber === req.params.id);
  if (!parcel) {
    return res.status(404).json({ success: false, message: 'Land parcel not found' });
  }

  // Find related surveys, documents, alerts
  const surveys = db.state.surveys.filter((s) => s.parcelId === parcel.id);
  const documents = db.state.documents.filter((d) => d.parcelId === parcel.id);
  const alerts = db.state.encroachments.filter((e) => e.parcelId === parcel.id || e.affectedParcelId === parcel.id);

  res.json({
    success: true,
    parcel,
    surveys,
    documents,
    alerts,
  });
});

apiRouter.post('/parcels', (req: Request, res: Response) => {
  const {
    surveyNumber,
    ownerName,
    ownerPhone,
    village,
    taluk,
    district,
    state,
    coordinates,
    landType,
    soilType,
    crops,
  } = req.body;

  if (!surveyNumber || !ownerName || !coordinates || coordinates.length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Survey number, owner name, and at least 3 boundary coordinates are required.',
    });
  }

  const polyCoords = [...coordinates];
  if (
    polyCoords[0][0] !== polyCoords[polyCoords.length - 1][0] ||
    polyCoords[0][1] !== polyCoords[polyCoords.length - 1][1]
  ) {
    polyCoords.push([...polyCoords[0]]);
  }

  const validation = validatePolygon(polyCoords);
  if (!validation.isValid) {
    return res.status(400).json({ success: false, message: validation.error });
  }

  const areaSqM = calculateGeodesicArea(polyCoords);
  const perimeterM = calculatePerimeter(polyCoords);
  const converted = convertArea(areaSqM);

  const stateCode = (state || 'TN').substring(0, 2).toUpperCase();
  const distCode = (district || 'CBE').substring(0, 3).toUpperCase();
  const autoParcelNum = `${stateCode}-${distCode}-${village.toUpperCase().replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`;

  const newParcel: LandParcel = {
    id: `pcl-${Date.now()}`,
    parcelNumber: autoParcelNum,
    surveyNumber,
    khasraNumber: `KH-${surveyNumber.replace('/', '-')}`,
    ownerId: `usr-owner-${Date.now()}`,
    ownerName,
    ownerPhone: ownerPhone || '+91 94444 00000',
    village: village || 'Thondamuthur',
    taluk: taluk || 'Coimbatore South',
    district: district || 'Coimbatore',
    state: state || 'Tamil Nadu',
    areaAcres: converted.acres,
    areaSqM: converted.sqM,
    areaHectares: converted.hectares,
    areaGunthas: converted.gunthas,
    perimeterM: Number(perimeterM.toFixed(2)),
    geometry: {
      type: 'Polygon',
      coordinates: [polyCoords],
    },
    status: 'PENDING_SURVEY',
    landType: landType || 'WET_AGRICULTURAL',
    soilType: soilType || 'Red Sandy Loam',
    crops: crops || ['Paddy', 'Coconut'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    documentsCount: 0,
  };

  db.state.parcels.push(newParcel);
  db.logAudit(
    'usr-admin-1',
    'Administrator',
    'ADMIN',
    'CREATE_PARCEL',
    'PARCEL',
    newParcel.id,
    `Registered new agricultural land parcel ${newParcel.parcelNumber} (Survey No. ${newParcel.surveyNumber})`
  );

  res.status(201).json({ success: true, parcel: newParcel });
});

// ----------------------------------------------------
// 3. SURVEY SESSIONS & POINT CAPTURE
// ----------------------------------------------------

apiRouter.get('/surveys', (req: Request, res: Response) => {
  const { parcelId, surveyorId, status } = req.query;
  let list = [...db.state.surveys];

  if (parcelId) list = list.filter((s) => s.parcelId === parcelId);
  if (surveyorId) list = list.filter((s) => s.surveyorId === surveyorId);
  if (status) list = list.filter((s) => s.status === status);

  res.json({ success: true, count: list.length, surveys: list });
});

apiRouter.get('/surveys/:id', (req: Request, res: Response) => {
  const survey = db.state.surveys.find((s) => s.id === req.params.id);
  if (!survey) {
    return res.status(404).json({ success: false, message: 'Survey session not found' });
  }
  const parcel = db.state.parcels.find((p) => p.id === survey.parcelId);
  res.json({ success: true, survey, parcel });
});

apiRouter.post('/surveys', (req: Request, res: Response) => {
  const { parcelId, surveyType, surveyorId, surveyorName, correctionSource, notes } = req.body;

  const parcel = db.state.parcels.find((p) => p.id === parcelId);
  if (!parcel) {
    return res.status(404).json({ success: false, message: 'Invalid parcel ID' });
  }

  const session: SurveySession = {
    id: `srv-session-${Date.now()}`,
    parcelId: parcel.id,
    parcelNumber: parcel.parcelNumber,
    surveyNumber: parcel.surveyNumber,
    village: parcel.village,
    surveyorId: surveyorId || 'usr-surveyor-1',
    surveyorName: surveyorName || 'K. Karthikeyan, Licensed Surveyor',
    surveyType: surveyType || 'RESURVEY',
    startedAt: new Date().toISOString(),
    accuracy: 0.014,
    correctionSource: correctionSource || 'TN-CORS-CBTR (NTRIP/RTCM 3.2 MSM4)',
    status: 'IN_PROGRESS',
    points: [],
    oldGeometry: parcel.geometry,
    notes: notes || '',
  };

  db.state.surveys.unshift(session);
  parcel.status = 'SURVEY_IN_PROGRESS';
  parcel.assignedSurveyorName = session.surveyorName;

  db.logAudit(
    session.surveyorId,
    session.surveyorName,
    'SURVEYOR',
    'START_SURVEY',
    'SURVEY',
    session.id,
    `Started ${session.surveyType} for Parcel ${parcel.parcelNumber} (${parcel.surveyNumber})`
  );

  res.status(201).json({ success: true, survey: session });
});

// Capture coordinate point in active survey session
apiRouter.post('/surveys/:id/points', (req: Request, res: Response) => {
  const survey = db.state.surveys.find((s) => s.id === req.params.id);
  if (!survey) {
    return res.status(404).json({ success: false, message: 'Survey session not found' });
  }

  const { latitude, longitude, altitude, accuracy, fixType, satelliteCount, hdop, vdop, notes } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
  }

  const seq = survey.points.length + 1;
  const point: SurveyPoint = {
    id: `pt-${Date.now()}-${seq}`,
    surveySessionId: survey.id,
    sequenceNumber: seq,
    pointCode: `P${seq}`,
    latitude: Number(latitude),
    longitude: Number(longitude),
    altitude: Number(altitude || 412.5),
    accuracy: Number(accuracy || 0.015),
    fixType: (fixType as FixType) || 'FIXED',
    satelliteCount: Number(satelliteCount || 28),
    hdop: Number(hdop || 0.72),
    vdop: Number(vdop || 0.94),
    timestamp: new Date().toISOString(),
    notes: notes || `Boundary vertex P${seq}`,
  };

  survey.points.push(point);

  // Update average accuracy
  const totalAcc = survey.points.reduce((sum, p) => sum + p.accuracy, 0);
  survey.accuracy = Number((totalAcc / survey.points.length).toFixed(3));

  db.logAudit(
    survey.surveyorId,
    survey.surveyorName,
    'SURVEYOR',
    'CAPTURE_POINT',
    'POINT',
    point.id,
    `Captured survey point ${point.pointCode} [${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}] with ${point.fixType} fix (${(point.accuracy * 100).toFixed(1)} cm)`
  );

  res.status(201).json({ success: true, point, pointsCount: survey.points.length, survey });
});

// Close boundary & calculate polygon metrics
apiRouter.post('/surveys/:id/close-boundary', (req: Request, res: Response) => {
  const survey = db.state.surveys.find((s) => s.id === req.params.id);
  if (!survey) {
    return res.status(404).json({ success: false, message: 'Survey session not found' });
  }

  if (survey.points.length < 3) {
    return res.status(400).json({
      success: false,
      message: 'At least 3 points are required to close an agricultural boundary polygon.',
    });
  }

  const coords: number[][] = survey.points.map((p) => [p.longitude, p.latitude]);
  // Close loop
  coords.push([...coords[0]]);

  const validation = validatePolygon(coords);
  if (!validation.isValid) {
    return res.status(400).json({ success: false, message: validation.error });
  }

  const areaSqM = calculateGeodesicArea(coords);
  const perimeterM = calculatePerimeter(coords);
  const converted = convertArea(areaSqM);

  const newGeometry: GeoJSON.Polygon = {
    type: 'Polygon',
    coordinates: [coords],
  };

  survey.calculatedAreaSqM = converted.sqM;
  survey.calculatedAreaAcres = converted.acres;
  survey.calculatedPerimeterM = Number(perimeterM.toFixed(2));
  survey.newGeometry = newGeometry;

  // Compare with old geometry if available
  if (survey.oldGeometry) {
    const oldCoords = survey.oldGeometry.coordinates[0];
    const oldAreaSqM = calculateGeodesicArea(oldCoords);
    const diffSqM = areaSqM - oldAreaSqM;
    const diffPct = (diffSqM / oldAreaSqM) * 100;
    const disp = calculateBoundaryDisplacement(oldCoords, coords);

    survey.areaDiscrepancySqM = Number(diffSqM.toFixed(2));
    survey.areaDiscrepancyPct = Number(diffPct.toFixed(2));
    survey.maxDisplacementM = disp.maxM;
  }

  res.json({
    success: true,
    survey,
    areaAcres: converted.acres,
    areaSqM: converted.sqM,
    areaGunthas: converted.gunthas,
    areaCents: converted.cents,
    perimeterM: survey.calculatedPerimeterM,
    discrepancy: {
      diffSqM: survey.areaDiscrepancySqM,
      diffPct: survey.areaDiscrepancyPct,
      maxDisplacementM: survey.maxDisplacementM,
    },
  });
});

// Finalize & Submit Survey for Verification
apiRouter.post('/surveys/:id/complete', (req: Request, res: Response) => {
  const survey = db.state.surveys.find((s) => s.id === req.params.id);
  if (!survey) {
    return res.status(404).json({ success: false, message: 'Survey session not found' });
  }

  if (!survey.newGeometry) {
    return res.status(400).json({ success: false, message: 'Boundary must be closed and calculated before finalizing' });
  }

  survey.status = 'SUBMITTED';
  survey.completedAt = new Date().toISOString();

  // Run automated encroachment check against adjacent parcels
  const newCoords = survey.newGeometry.coordinates[0];
  const otherParcels = db.state.parcels.filter((p) => p.id !== survey.parcelId);
  const foundAlerts: EncroachmentAlert[] = [];

  for (const other of otherParcels) {
    const overlap = computePolygonOverlap(newCoords, other.geometry.coordinates[0]);
    if (overlap.hasOverlap && overlap.overlapAreaSqM > 10) {
      const disp = calculateBoundaryDisplacement(other.geometry.coordinates[0], newCoords);
      let severity: EncroachmentAlert['severity'] = 'LOW';
      if (disp.maxM > 5) severity = 'CRITICAL';
      else if (disp.maxM > 2) severity = 'HIGH';
      else if (disp.maxM > 0.8) severity = 'MEDIUM';

      const alert: EncroachmentAlert = {
        id: `enc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        parcelId: survey.parcelId,
        parcelNumber: survey.parcelNumber,
        surveyNumber: survey.surveyNumber,
        affectedParcelId: other.id,
        affectedParcelNumber: `${other.parcelNumber} (SF ${other.surveyNumber})`,
        affectedOwnerName: other.ownerName,
        village: survey.village,
        taluk: other.taluk,
        district: other.district,
        overlapAreaSqM: overlap.overlapAreaSqM,
        overlapAreaAcres: Number((overlap.overlapAreaSqM * 0.000247105).toFixed(4)),
        displacementM: disp.maxM,
        severity,
        status: 'DETECTED',
        detectedAt: new Date().toISOString(),
        description: `Automated PostGIS ST_Intersection detected ${overlap.overlapAreaSqM} sq.m overlap (displacement ${disp.maxM}m) with adjacent survey number ${other.surveyNumber}.`,
        surveySessionId: survey.id,
      };

      db.state.encroachments.unshift(alert);
      foundAlerts.push(alert);

      const targetParcel = db.state.parcels.find((p) => p.id === survey.parcelId);
      if (targetParcel) targetParcel.encroachmentFlag = true;
    }
  }

  db.logAudit(
    survey.surveyorId,
    survey.surveyorName,
    'SURVEYOR',
    'SUBMIT_SURVEY',
    'SURVEY',
    survey.id,
    `Submitted survey session ${survey.id} for official verification (${survey.points.length} points, ${survey.calculatedAreaAcres} Acres)`
  );

  res.json({
    success: true,
    survey,
    encroachmentsDetected: foundAlerts.length,
    alerts: foundAlerts,
  });
});

// ----------------------------------------------------
// 4. GNSS & CORS TELEMETRY
// ----------------------------------------------------

apiRouter.get('/gnss/status', (req: Request, res: Response) => {
  // Add realistic subtle jitter to live telemetry
  const jitterLat = (Math.random() - 0.5) * 0.000004;
  const jitterLng = (Math.random() - 0.5) * 0.000004;
  const jitterAcc = 0.012 + Math.random() * 0.006;

  db.state.liveGNSS.latitude += jitterLat;
  db.state.liveGNSS.longitude += jitterLng;
  db.state.liveGNSS.accuracy = Number(jitterAcc.toFixed(3));
  db.state.liveGNSS.rtcmPacketsReceived += 1;
  db.state.liveGNSS.correctionAgeSec = Number((0.8 + Math.random() * 0.5).toFixed(1));

  res.json({ success: true, gnss: db.state.liveGNSS });
});

apiRouter.post('/gnss/update-pos', (req: Request, res: Response) => {
  const { latitude, longitude, altitude, fixType, accuracy } = req.body;
  if (latitude !== undefined) db.state.liveGNSS.latitude = Number(latitude);
  if (longitude !== undefined) db.state.liveGNSS.longitude = Number(longitude);
  if (altitude !== undefined) db.state.liveGNSS.altitude = Number(altitude);
  if (fixType) db.state.liveGNSS.fixType = fixType;
  if (accuracy !== undefined) db.state.liveGNSS.accuracy = Number(accuracy);

  res.json({ success: true, gnss: db.state.liveGNSS });
});

// CSV Point Import parser
apiRouter.post('/gnss/import-csv', (req: Request, res: Response) => {
  const { csvContent, parcelId } = req.body;
  if (!csvContent) {
    return res.status(400).json({ success: false, message: 'CSV content is required' });
  }

  const lines = csvContent.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return res.status(400).json({ success: false, message: 'CSV has no data rows' });
  }

  const header = lines[0].toLowerCase().split(',').map((h: string) => h.trim());
  const latIdx = header.findIndex((h: string) => h.includes('lat'));
  const lngIdx = header.findIndex((h: string) => h.includes('lon') || h.includes('lng'));
  const altIdx = header.findIndex((h: string) => h.includes('alt') || h.includes('ele'));
  const accIdx = header.findIndex((h: string) => h.includes('acc'));
  const ptIdIdx = header.findIndex((h: string) => h.includes('point') || h.includes('id') || h.includes('code'));

  if (latIdx === -1 || lngIdx === -1) {
    return res.status(400).json({
      success: false,
      message: 'CSV must contain latitude and longitude columns (e.g. point_id,latitude,longitude,altitude,accuracy)',
    });
  }

  const importedPoints: SurveyPoint[] = [];
  const coords: number[][] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',').map((p: string) => p.trim());
    const lat = parseFloat(parts[latIdx]);
    const lng = parseFloat(parts[lngIdx]);
    const alt = altIdx !== -1 ? parseFloat(parts[altIdx]) || 412.0 : 412.0;
    const acc = accIdx !== -1 ? parseFloat(parts[accIdx]) || 0.015 : 0.015;
    const code = ptIdIdx !== -1 && parts[ptIdIdx] ? parts[ptIdIdx] : `P${i}`;

    if (isNaN(lat) || isNaN(lng)) continue;

    importedPoints.push({
      id: `pt-csv-${i}`,
      surveySessionId: 'csv-import',
      sequenceNumber: i,
      pointCode: code,
      latitude: lat,
      longitude: lng,
      altitude: alt,
      accuracy: acc,
      fixType: 'FIXED',
      satelliteCount: 28,
      hdop: 0.7,
      vdop: 0.9,
      timestamp: new Date().toISOString(),
    });

    coords.push([lng, lat]);
  }

  if (coords.length < 3) {
    return res.status(400).json({
      success: false,
      message: `Only found ${coords.length} valid coordinates. Need at least 3 coordinates.`,
    });
  }

  coords.push([...coords[0]]);
  const areaSqM = calculateGeodesicArea(coords);
  const perimeterM = calculatePerimeter(coords);
  const converted = convertArea(areaSqM);

  res.json({
    success: true,
    pointsCount: importedPoints.length,
    points: importedPoints,
    areaAcres: converted.acres,
    areaSqM: converted.sqM,
    perimeterM: Number(perimeterM.toFixed(2)),
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
  });
});

apiRouter.get('/cors/stations', (req: Request, res: Response) => {
  res.json({ success: true, stations: db.state.corsStations });
});

// ----------------------------------------------------
// 5. ENCROACHMENTS & SPATIAL COMPARISONS
// ----------------------------------------------------

apiRouter.get('/encroachments', (req: Request, res: Response) => {
  const { status, severity } = req.query;
  let list = [...db.state.encroachments];
  if (status) list = list.filter((e) => e.status === status);
  if (severity) list = list.filter((e) => e.severity === severity);

  res.json({ success: true, count: list.length, encroachments: list });
});

apiRouter.put('/encroachments/:id/status', (req: Request, res: Response) => {
  const alert = db.state.encroachments.find((e) => e.id === req.params.id);
  if (!alert) {
    return res.status(404).json({ success: false, message: 'Encroachment alert not found' });
  }

  const { status, resolutionNotes } = req.body;
  if (status) alert.status = status;
  if (resolutionNotes) alert.resolutionNotes = resolutionNotes;

  db.logAudit(
    'usr-official-1',
    'Shri. M. Shanmugam',
    'OFFICIAL',
    'UPDATE_ENCROACHMENT',
    'ENCROACHMENT',
    alert.id,
    `Updated encroachment status to ${alert.status} for SF ${alert.surveyNumber}`
  );

  res.json({ success: true, alert });
});

// ----------------------------------------------------
// 6. OFFICIAL VERIFICATION QUEUE
// ----------------------------------------------------

apiRouter.get('/verification/queue', (req: Request, res: Response) => {
  const pendingSurveys = db.state.surveys.filter((s) => s.status === 'SUBMITTED' || s.status === 'IN_PROGRESS');
  const enriched = pendingSurveys.map((s) => {
    const parcel = db.state.parcels.find((p) => p.id === s.parcelId);
    const relatedAlerts = db.state.encroachments.filter((e) => e.surveySessionId === s.id || e.parcelId === s.parcelId);
    return {
      survey: s,
      parcel,
      alerts: relatedAlerts,
    };
  });

  res.json({ success: true, count: enriched.length, queue: enriched });
});

apiRouter.post('/verification/:id/action', (req: Request, res: Response) => {
  const { action, notes, officialName, officialId } = req.body;
  const survey = db.state.surveys.find((s) => s.id === req.params.id);

  if (!survey) {
    return res.status(404).json({ success: false, message: 'Survey session not found' });
  }

  const parcel = db.state.parcels.find((p) => p.id === survey.parcelId);
  const reviewer = officialName || 'Shri. M. Shanmugam (RDO)';

  if (action === 'APPROVE') {
    survey.status = 'APPROVED';
    survey.verifiedBy = reviewer;
    survey.verifiedAt = new Date().toISOString();
    survey.verificationNotes = notes || 'Digitally verified against Cadastral FMB baseline. Coordinates compliant with 2cm RTK standard.';

    if (parcel && survey.newGeometry) {
      parcel.geometry = survey.newGeometry;
      parcel.status = 'VERIFIED';
      if (survey.calculatedAreaAcres) parcel.areaAcres = survey.calculatedAreaAcres;
      if (survey.calculatedAreaSqM) parcel.areaSqM = survey.calculatedAreaSqM;
      if (survey.calculatedPerimeterM) parcel.perimeterM = survey.calculatedPerimeterM;
      parcel.lastSurveyDate = new Date().toISOString().split('T')[0];
      parcel.lastSurveyorName = survey.surveyorName;
      parcel.lastSurveyAccuracyM = survey.accuracy;
    }

    db.logAudit(
      officialId || 'usr-official-1',
      reviewer,
      'OFFICIAL',
      'APPROVE_SURVEY',
      'SURVEY',
      survey.id,
      `Officially approved and committed survey ${survey.id} to revenue land registry.`
    );
  } else if (action === 'REJECT') {
    survey.status = 'REJECTED';
    survey.verifiedBy = reviewer;
    survey.verifiedAt = new Date().toISOString();
    survey.verificationNotes = notes || 'Rejected due to boundary anomaly or excessive deviation.';

    if (parcel) parcel.status = 'DISPUTED';

    db.logAudit(
      officialId || 'usr-official-1',
      reviewer,
      'OFFICIAL',
      'REJECT_SURVEY',
      'SURVEY',
      survey.id,
      `Rejected survey ${survey.id}. Reason: ${notes}`
    );
  } else if (action === 'REQUEST_RESURVEY') {
    survey.status = 'RESURVEY_REQUESTED';
    survey.verificationNotes = notes || 'Ground re-verification required for corner points.';

    if (parcel) parcel.status = 'RESURVEY_REQUESTED';

    db.logAudit(
      officialId || 'usr-official-1',
      reviewer,
      'OFFICIAL',
      'REQUEST_RESURVEY',
      'SURVEY',
      survey.id,
      `Requested resurvey for ${survey.id}. Notes: ${notes}`
    );
  }

  res.json({ success: true, survey, parcel });
});

// ----------------------------------------------------
// 7. DASHBOARD STATS & GLOBAL SEARCH
// ----------------------------------------------------

apiRouter.get('/dashboard/stats', (req: Request, res: Response) => {
  const totalParcels = db.state.parcels.length;
  const activeSurveys = db.state.surveys.filter((s) => s.status === 'IN_PROGRESS').length;
  const completedSurveys = db.state.surveys.filter((s) => s.status === 'APPROVED' || s.status === 'SUBMITTED').length;
  const pendingVerifications = db.state.surveys.filter((s) => s.status === 'SUBMITTED').length;
  const detectedEncroachments = db.state.encroachments.filter((e) => e.status !== 'RESOLVED' && e.status !== 'DISMISSED').length;

  const totalAreaSurveyedAcres = db.state.parcels.reduce((sum, p) => sum + p.areaAcres, 0);
  const onlineCorsStations = db.state.corsStations.filter((c) => c.status === 'ONLINE').length;

  // Village aggregation
  const villageMap: Record<string, { count: number; area: number }> = {};
  db.state.parcels.forEach((p) => {
    if (!villageMap[p.village]) {
      villageMap[p.village] = { count: 0, area: 0 };
    }
    villageMap[p.village].count++;
    villageMap[p.village].area += p.areaAcres;
  });

  const villageStats = Object.entries(villageMap).map(([village, val]) => ({
    village,
    parcelCount: val.count,
    areaAcres: Number(val.area.toFixed(1)),
  }));

  const surveyStatusStats = [
    { name: 'Verified', value: db.state.parcels.filter((p) => p.status === 'VERIFIED').length, color: '#10b981' },
    { name: 'In Progress', value: db.state.parcels.filter((p) => p.status === 'SURVEY_IN_PROGRESS').length, color: '#3b82f6' },
    { name: 'Pending', value: db.state.parcels.filter((p) => p.status === 'PENDING_SURVEY').length, color: '#f59e0b' },
    { name: 'Disputed', value: db.state.parcels.filter((p) => p.status === 'DISPUTED').length, color: '#ef4444' },
    { name: 'Resurvey', value: db.state.parcels.filter((p) => p.status === 'RESURVEY_REQUESTED').length, color: '#8b5cf6' },
  ];

  const encroachmentSeverityStats = [
    { name: 'Critical (>5m)', value: db.state.encroachments.filter((e) => e.severity === 'CRITICAL').length, color: '#dc2626' },
    { name: 'High (2-5m)', value: db.state.encroachments.filter((e) => e.severity === 'HIGH').length, color: '#f97316' },
    { name: 'Medium (0.8-2m)', value: db.state.encroachments.filter((e) => e.severity === 'MEDIUM').length, color: '#eab308' },
    { name: 'Low (<0.8m)', value: db.state.encroachments.filter((e) => e.severity === 'LOW').length, color: '#06b6d4' },
  ];

  const monthlySurveyTrends = [
    { month: 'Sep', newSurveys: 12, resurveys: 8, verified: 18 },
    { month: 'Oct', newSurveys: 19, resurveys: 14, verified: 22 },
    { month: 'Nov', newSurveys: 24, resurveys: 18, verified: 35 },
    { month: 'Dec', newSurveys: 30, resurveys: 21, verified: 42 },
    { month: 'Jan', newSurveys: 38, resurveys: 26, verified: 54 },
    { month: 'Feb', newSurveys: 44, resurveys: 31, verified: 68 },
  ];

  res.json({
    success: true,
    stats: {
      totalParcels,
      activeSurveys,
      completedSurveys,
      pendingVerifications,
      detectedEncroachments,
      totalAreaSurveyedAcres: Number(totalAreaSurveyedAcres.toFixed(2)),
      onlineCorsStations,
      totalCorsStations: db.state.corsStations.length,
      avgSurveyAccuracyCm: 1.6,
      villageStats,
      surveyStatusStats,
      encroachmentSeverityStats,
      monthlySurveyTrends,
    },
  });
});

apiRouter.get('/search', (req: Request, res: Response) => {
  const q = String(req.query.q || '').toLowerCase().trim();
  if (!q) {
    return res.json({ success: true, results: [] });
  }

  const results = db.state.parcels
    .filter(
      (p) =>
        p.parcelNumber.toLowerCase().includes(q) ||
        p.surveyNumber.toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        p.taluk.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q)
    )
    .slice(0, 10);

  res.json({ success: true, results });
});

apiRouter.get('/documents', (req: Request, res: Response) => {
  const { parcelId } = req.query;
  let list = [...db.state.documents];
  if (parcelId) list = list.filter((d) => d.parcelId === parcelId);
  res.json({ success: true, documents: list });
});

apiRouter.get('/admin/audit-logs', (req: Request, res: Response) => {
  res.json({ success: true, count: db.state.auditLogs.length, auditLogs: db.state.auditLogs });
});

apiRouter.get('/admin/tolerance-config', (req: Request, res: Response) => {
  res.json({ success: true, config: db.state.config });
});

apiRouter.post('/admin/tolerance-config', (req: Request, res: Response) => {
  const { normalToleranceM, reviewThresholdM, encroachmentThresholdM } = req.body;
  if (normalToleranceM !== undefined) db.state.config.normalToleranceM = Number(normalToleranceM);
  if (reviewThresholdM !== undefined) db.state.config.reviewThresholdM = Number(reviewThresholdM);
  if (encroachmentThresholdM !== undefined) db.state.config.encroachmentThresholdM = Number(encroachmentThresholdM);

  db.logAudit(
    'usr-admin-1',
    'Dr. Rajeshwari Ramanathan (IAS)',
    'ADMIN',
    'UPDATE_TOLERANCE_CONFIG',
    'AUTH',
    'config-1',
    `Updated geodetic tolerance parameters: normal=${db.state.config.normalToleranceM}m, review=${db.state.config.reviewThresholdM}m, encroachment=${db.state.config.encroachmentThresholdM}m`
  );

  res.json({ success: true, config: db.state.config });
});

apiRouter.post('/admin/create-user', (req: Request, res: Response) => {
  const { name, email, phone, role, organization, badgeNumber } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ success: false, message: 'Name, email, and role are required' });
  }

  const newUser = {
    id: `usr-${role.toLowerCase()}-${Date.now()}`,
    name,
    email,
    phone: phone || '+91 98000 00000',
    role,
    organization: organization || 'Survey & Settlement Department',
    badgeNumber: badgeNumber || `${role}-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
  };

  db.state.users.unshift(newUser);

  db.logAudit(
    'usr-admin-1',
    'Dr. Rajeshwari Ramanathan (IAS)',
    'ADMIN',
    'LICENSE_USER',
    'AUTH',
    newUser.id,
    `Admin licensed/registered ${newUser.role}: ${newUser.name} (${newUser.badgeNumber})`
  );

  res.status(201).json({ success: true, user: newUser });
});

apiRouter.get('/admin/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    system: {
      status: 'HEALTHY',
      uptimeSec: process.uptime(),
      postgisEngine: 'ONLINE (Spatial Algorithm Emulation v3.4)',
      corsNetwork: 'CONNECTED (4 active stations)',
      ntripCaster: 'ACTIVE (Port 2101 / RTCM 3.2)',
      apiLatencyMs: 4.2,
      databaseRecords: {
        parcels: db.state.parcels.length,
        surveys: db.state.surveys.length,
        encroachments: db.state.encroachments.length,
        auditLogs: db.state.auditLogs.length,
      },
    },
  });
});

// ----------------------------------------------------
// 8. ONE-CLICK DEMO SURVEY SCENARIO RUNNER
// ----------------------------------------------------

apiRouter.post('/demo/run-scenario', (req: Request, res: Response) => {
  const targetParcel = db.state.parcels[2]; // Thondamuthur 143/1 (GARDEN_LAND)

  const simulatedPoints: SurveyPoint[] = [
    {
      id: `pt-demo-1`,
      surveySessionId: `srv-demo-${Date.now()}`,
      sequenceNumber: 1,
      pointCode: 'P1',
      latitude: 10.99042,
      longitude: 76.83425,
      altitude: 412.1,
      accuracy: 0.013,
      fixType: 'FIXED',
      satelliteCount: 29,
      hdop: 0.71,
      vdop: 0.92,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      notes: 'Demo Point P1 - Concrete Boundary Stone (NW Corner)',
    },
    {
      id: `pt-demo-2`,
      surveySessionId: `srv-demo-${Date.now()}`,
      sequenceNumber: 2,
      pointCode: 'P2',
      latitude: 10.99072,
      longitude: 76.83605,
      altitude: 412.4,
      accuracy: 0.015,
      fixType: 'FIXED',
      satelliteCount: 28,
      hdop: 0.69,
      vdop: 0.88,
      timestamp: new Date(Date.now() - 450000).toISOString(),
      notes: 'Demo Point P2 - Channel Bank Corner (NE Corner)',
    },
    {
      id: `pt-demo-3`,
      surveySessionId: `srv-demo-${Date.now()}`,
      sequenceNumber: 3,
      pointCode: 'P3',
      latitude: 10.98912,
      longitude: 76.83628,
      altitude: 411.8,
      accuracy: 0.016,
      fixType: 'FIXED',
      satelliteCount: 27,
      hdop: 0.75,
      vdop: 0.95,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      notes: 'Demo Point P3 - Cart Track Boundary (SE Corner)',
    },
    {
      id: `pt-demo-4`,
      surveySessionId: `srv-demo-${Date.now()}`,
      sequenceNumber: 4,
      pointCode: 'P4',
      latitude: 10.98882,
      longitude: 76.83448,
      altitude: 411.5,
      accuracy: 0.014,
      fixType: 'FIXED',
      satelliteCount: 29,
      hdop: 0.70,
      vdop: 0.90,
      timestamp: new Date(Date.now() - 150000).toISOString(),
      notes: 'Demo Point P4 - Survey Peg (SW Corner)',
    },
  ];

  const demoSession: SurveySession = {
    id: `srv-session-demo-${Date.now()}`,
    parcelId: targetParcel.id,
    parcelNumber: targetParcel.parcelNumber,
    surveyNumber: targetParcel.surveyNumber,
    village: targetParcel.village,
    surveyorId: 'usr-surveyor-1',
    surveyorName: 'K. Karthikeyan, Licensed Surveyor',
    surveyType: 'RESURVEY',
    startedAt: new Date(Date.now() - 600000).toISOString(),
    completedAt: new Date().toISOString(),
    accuracy: 0.014,
    correctionSource: 'TN-CORS-CBTR (NTRIP/RTCM 3.2 MSM4)',
    status: 'SUBMITTED',
    points: simulatedPoints,
    calculatedAreaSqM: targetParcel.areaSqM,
    calculatedAreaAcres: targetParcel.areaAcres,
    calculatedPerimeterM: targetParcel.perimeterM,
    newGeometry: targetParcel.geometry,
    oldGeometry: targetParcel.geometry,
    notes: 'Automated high-precision GNSS/RTK demo survey completed with centimetre accuracy.',
  };

  db.state.surveys.unshift(demoSession);
  targetParcel.status = 'SURVEY_IN_PROGRESS';

  db.logAudit(
    'usr-surveyor-1',
    'K. Karthikeyan',
    'SURVEYOR',
    'DEMO_SURVEY_COMPLETED',
    'SURVEY',
    demoSession.id,
    `Completed automated 1-click RTK survey for Parcel ${targetParcel.parcelNumber} (${targetParcel.surveyNumber})`
  );

  res.json({
    success: true,
    message: 'Demo survey executed successfully',
    survey: demoSession,
    parcel: targetParcel,
  });
});
