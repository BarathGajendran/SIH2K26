import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { LandParcel, DroneTelemetry, DroneWaypoint, DroneDetectedVertex } from '../../types';
import { api } from '../../services/api';
import {
  Satellite,
  Radio,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Zap,
  Layers,
  Camera,
  Compass,
  ArrowUpRight,
  Shield,
  Activity,
  Maximize2,
  Sparkles,
  MapPin,
  RefreshCw,
  Sliders,
  Plane,
  Eye,
  Crosshair,
  Flame,
  Leaf,
  Mountain,
  FileText,
} from 'lucide-react';

interface DroneMappingHubProps {
  onNavigateToMap?: () => void;
  onNavigateToVerification?: () => void;
}

export const DroneMappingHub: React.FC<DroneMappingHubProps> = ({
  onNavigateToMap,
  onNavigateToVerification,
}) => {
  const {
    parcels,
    selectedParcel,
    setSelectedParcel,
    currentUser,
    refreshData,
    showNotification,
    setActiveTab,
  } = useApp();

  const targetParcel: LandParcel = selectedParcel || parcels[0];

  // Drone State
  const [droneState, setDroneState] = useState<DroneTelemetry>({
    id: 'drone-geonexa-x4',
    model: 'GeoNexa AeroScan-X4 Autonomous Drone Engine',
    status: 'DISCONNECTED',
    batteryPct: 96,
    altitudeM: 0,
    targetAltitudeM: 55,
    speedMs: 0,
    flightHeadingDeg: 42,
    currentWaypointIndex: 0,
    totalWaypoints: 16,
    waypoints: [],
    gsdCmPerPixel: 1.15,
    orthophotoStitchProgressPct: 0,
    photosCaptured: 0,
    totalPhotosTarget: 24,
    signalStrengthPct: 99,
    latitude: targetParcel ? targetParcel.geometry.coordinates[0][0][1] : 10.99215,
    longitude: targetParcel ? targetParcel.geometry.coordinates[0][0][0] : 76.83412,
    flightDurationSec: 0,
    isCameraStreaming: true,
    detectedVertices: [],
    estimatedSurveyTimeMin: 3.5,
    liveCameraMode: 'RGB_ORTHO',
  });

  const [flightIntervalActive, setFlightIntervalActive] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<'PLAN' | 'FLIGHT' | 'STITCH' | 'EXTRACT' | 'SYNCED'>('PLAN');
  const [isSubmittingToRegistry, setIsSubmittingToRegistry] = useState<boolean>(false);
  const flightTimerRef = useRef<any>(null);

  // Generate Flight Waypoints when parcel changes
  useEffect(() => {
    if (!targetParcel) return;
    const coords = targetParcel.geometry.coordinates[0];
    if (!coords || coords.length < 3) return;

    // Create a 4x4 serpentine flight grid around parcel bounding box
    const lats = coords.map((c) => c[1]);
    const lngs = coords.map((c) => c[0]);
    const minLat = Math.min(...lats) - 0.0003;
    const maxLat = Math.max(...lats) + 0.0003;
    const minLng = Math.min(...lngs) - 0.0003;
    const maxLng = Math.max(...lngs) + 0.0003;

    const generatedWaypoints: DroneWaypoint[] = [];
    const gridRows = 4;
    const gridCols = 4;
    let count = 0;

    for (let r = 0; r < gridRows; r++) {
      const lat = minLat + (maxLat - minLat) * (r / (gridRows - 1));
      const colIndices = r % 2 === 0 ? [0, 1, 2, 3] : [3, 2, 1, 0];
      for (const c of colIndices) {
        const lng = minLng + (maxLng - minLng) * (c / (gridCols - 1));
        count++;
        generatedWaypoints.push({
          id: `wp-${count}`,
          latitude: lat,
          longitude: lng,
          altitudeM: 55,
          speedMs: 4.8,
          status: count === 1 ? 'ACTIVE' : 'PENDING',
        });
      }
    }

    setDroneState((prev) => ({
      ...prev,
      latitude: minLat,
      longitude: minLng,
      waypoints: generatedWaypoints,
      totalWaypoints: generatedWaypoints.length,
      totalPhotosTarget: generatedWaypoints.length * 2,
    }));
  }, [targetParcel]);

  // Handle Direct Drone Connection
  const handleConnectDrone = () => {
    setDroneState((prev) => ({ ...prev, status: 'CONNECTING' }));
    showNotification('Connecting to GeoNexa Drone Flight Controller via Software WebMavLink...', 'info');

    setTimeout(() => {
      setDroneState((prev) => ({
        ...prev,
        status: 'CONNECTED',
        signalStrengthPct: 98,
        batteryPct: 96,
      }));
      showNotification('GeoNexa Drone Connected: Dual-frequency GNSS locked, 26 Satellites, RTK Fixed.', 'success');
    }, 1200);
  };

  // Launch Autonomous Cadastral Flight
  const handleLaunchFlight = () => {
    if (droneState.status === 'DISCONNECTED') {
      handleConnectDrone();
    }

    setDroneState((prev) => ({
      ...prev,
      status: 'FLYING',
      altitudeM: 55,
      speedMs: 5.2,
      currentWaypointIndex: 0,
      photosCaptured: 1,
      orthophotoStitchProgressPct: 5,
    }));

    setActiveStep('FLIGHT');
    setFlightIntervalActive(true);
    showNotification(`Autonomous Drone Mission Launched for SF ${targetParcel?.surveyNumber || 'Plot'}!`, 'success');
  };

  // Flight simulation loop
  useEffect(() => {
    if (!flightIntervalActive || droneState.status !== 'FLYING') return;

    const interval = setInterval(() => {
      setDroneState((prev) => {
        const nextIdx = prev.currentWaypointIndex + 1;
        const targetWp = prev.waypoints[nextIdx];

        if (nextIdx >= prev.totalWaypoints || !targetWp) {
          // Mission finished!
          clearInterval(interval);
          setFlightIntervalActive(false);

          // Extract boundary vertices automatically from the parcel coordinates
          const coords = targetParcel.geometry.coordinates[0];
          const detected: DroneDetectedVertex[] = coords.slice(0, 4).map((c, i) => ({
            code: `D-P${i + 1}`,
            latitude: c[1] + (Math.random() * 0.00004 - 0.00002),
            longitude: c[0] + (Math.random() * 0.00004 - 0.00002),
            altitudeM: 412.3 + i * 0.2,
            confidencePct: +(97.8 + Math.random() * 2.1).toFixed(1),
            markerType: i === 0 ? 'CORNER_STONE' : i === 1 ? 'FENCE_JUNCTION' : i === 2 ? 'HEDGE_BORDER' : 'CANAL_BANK',
          }));

          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
          showNotification('Aerial photogrammetry flight completed! Orthomosaic stitched & corners extracted.', 'success');
          setActiveStep('EXTRACT');

          return {
            ...prev,
            status: 'MISSION_COMPLETE',
            speedMs: 0,
            altitudeM: 0,
            currentWaypointIndex: prev.totalWaypoints,
            photosCaptured: prev.totalPhotosTarget,
            orthophotoStitchProgressPct: 100,
            detectedVertices: detected,
            calculatedAreaAcres: +(targetParcel.areaAcres * (1 + (Math.random() * 0.004 - 0.002))).toFixed(2),
            calculatedAreaSqM: Math.round(targetParcel.areaSqM * 1.001),
            perimeterM: Math.round(targetParcel.perimeterM),
          };
        }

        const photos = Math.min(prev.totalPhotosTarget, prev.photosCaptured + 2);
        const stitchPct = Math.min(95, Math.round((nextIdx / prev.totalWaypoints) * 100));

        return {
          ...prev,
          currentWaypointIndex: nextIdx,
          latitude: targetWp.latitude,
          longitude: targetWp.longitude,
          photosCaptured: photos,
          orthophotoStitchProgressPct: stitchPct,
          flightDurationSec: prev.flightDurationSec + 3,
          batteryPct: Math.max(72, prev.batteryPct - 0.5),
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [flightIntervalActive, droneState.status, targetParcel]);

  // Sync to Land Registry & Verification Queue
  const handleSyncToLandRegistry = async () => {
    setIsSubmittingToRegistry(true);
    try {
      // Create survey session automatically
      const res = await api.createSurvey({
        parcelId: targetParcel.id,
        surveyType: 'RESURVEY',
        surveyorId: currentUser?.id || 'usr-surveyor-1',
        surveyorName: `${currentUser?.name || 'Licensed Drone Pilot'} (GeoNexa Drone Aerial)`,
        notes: `High-resolution autonomous drone photogrammetry completed. GSD 1.15 cm/pixel, 24 aerial frames stitched, 4 corner vertices auto-detected with >98% AI confidence.`,
      });

      // Submit points
      if (res.survey && droneState.detectedVertices.length > 0) {
        for (let i = 0; i < droneState.detectedVertices.length; i++) {
          const v = droneState.detectedVertices[i];
          await api.addSurveyPoint(res.survey.id, {
            sequenceNumber: i + 1,
            pointCode: v.code,
            latitude: v.latitude,
            longitude: v.longitude,
            altitude: v.altitudeM,
            accuracy: 0.012,
            fixType: 'FIXED',
            satelliteCount: 26,
            hdop: 0.65,
            vdop: 0.88,
          });
        }
        await api.closeBoundary(res.survey.id);
        await api.completeSurvey(res.survey.id);
      }

      await refreshData();
      setIsSubmittingToRegistry(false);
      setActiveStep('SYNCED');
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      showNotification('Drone Cadastral Survey sealed & submitted to Revenue Official Verification Queue!', 'success');
    } catch (err: any) {
      setIsSubmittingToRegistry(false);
      showNotification(err.message || 'Survey submission failed', 'error');
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto font-sans transition-colors duration-200">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700 flex items-center gap-1">
                <Plane className="w-3 h-3" />
                Autonomous Drone Aerial Cadastre
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Software Protocol • 1.15 cm/pixel GSD
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>GeoNexa Drone Aerial Mapping & Photogrammetry Hub</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
              Connect survey drones directly, generate serpentine flight grids over agricultural holdings, capture high-res aerial orthomosaics, and automatically detect legal boundary stones in minutes.
            </p>
          </div>

          {/* Quick Connection Action */}
          <div className="flex items-center gap-2 shrink-0">
            {droneState.status === 'DISCONNECTED' ? (
              <button
                onClick={handleConnectDrone}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-950/40 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <Zap className="w-4 h-4" />
                <span>Connect Drone Directly</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>DRONE LINK ACTIVE ({droneState.batteryPct}%)</span>
                </div>

                {droneState.status !== 'FLYING' && activeStep !== 'EXTRACT' && activeStep !== 'SYNCED' && (
                  <button
                    onClick={handleLaunchFlight}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                  >
                    <Play className="w-4 h-4" />
                    <span>Launch Aerial Mission</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Container */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 w-full space-y-6">
        {/* Selected Land Parcel Selector Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-slate-500 uppercase">Target Agricultural Plot for Drone Flight</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>SF {targetParcel?.surveyNumber || '142/3A'} ({targetParcel?.ownerName})</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-normal">
                  {targetParcel?.areaAcres} Acres • {targetParcel?.village}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={targetParcel?.id}
              onChange={(e) => {
                const found = parcels.find((p) => p.id === e.target.value);
                if (found) setSelectedParcel(found);
              }}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {parcels.map((p) => (
                <option key={p.id} value={p.id}>
                  SF {p.surveyNumber} - {p.ownerName} ({p.areaAcres} Ac)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Drone Telemetry & Mission Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Drone Flight Control & Telemetry Deck (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Drone Status Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 font-sans">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-700 flex items-center justify-center text-cyan-700 dark:text-cyan-300">
                    <Plane className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
                      AeroScan Drone Engine
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono">Direct Telemetry Link (MavLink v2)</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                    droneState.status === 'FLYING'
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse'
                      : droneState.status === 'CONNECTED'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                      : droneState.status === 'MISSION_COMPLETE'
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {droneState.status}
                </span>
              </div>

              {/* Drone Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block uppercase">Altitude (AGL)</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {droneState.altitudeM.toFixed(1)} m
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block uppercase">Flight Speed</span>
                  <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                    {droneState.speedMs.toFixed(1)} m/s
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block uppercase">Battery</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {droneState.batteryPct}%
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block uppercase">GSD Resolution</span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {droneState.gsdCmPerPixel} cm/px
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block uppercase">Photos Captured</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {droneState.photosCaptured} / {droneState.totalPhotosTarget}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block uppercase">Waypoints</span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    {droneState.currentWaypointIndex} / {droneState.totalWaypoints}
                  </span>
                </div>
              </div>

              {/* Orthophoto Stitching Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400">Live Orthomosaic Stitching Engine</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {droneState.orthophotoStitchProgressPct}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-400 h-full transition-all duration-500"
                    style={{ width: `${droneState.orthophotoStitchProgressPct}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {activeStep === 'PLAN' && (
                  <button
                    onClick={handleLaunchFlight}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102"
                  >
                    <Play className="w-4 h-4" />
                    <span>Launch Autonomous Cadastral Flight</span>
                  </button>
                )}

                {activeStep === 'FLIGHT' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFlightIntervalActive(!flightIntervalActive)}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{flightIntervalActive ? 'Pause Mission' : 'Resume Flight'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setFlightIntervalActive(false);
                        setDroneState((prev) => ({ ...prev, status: 'CONNECTED', speedMs: 0, altitudeM: 0 }));
                        setActiveStep('PLAN');
                        showNotification('Drone commanded to Return-to-Home (RTH) safely.', 'info');
                      }}
                      className="px-3 py-2.5 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Emergency RTH
                    </button>
                  </div>
                )}

                {activeStep === 'EXTRACT' && (
                  <button
                    onClick={handleSyncToLandRegistry}
                    disabled={isSubmittingToRegistry}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {isSubmittingToRegistry ? 'Sealing Cadastral Record...' : 'Sync Drone Boundary to Land Registry'}
                    </span>
                  </button>
                )}

                {activeStep === 'SYNCED' && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Drone Cadastral Survey Sealed!</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300/80">
                      The survey dossier has been linked to SF {targetParcel?.surveyNumber} and routed to the Revenue Officer Verification queue.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setActiveTab('verification')}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        View in Official Queue
                      </button>
                      <button
                        onClick={() => setActiveStep('PLAN')}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        New Flight
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Detected Cadastral Corners Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
                    AI Auto-Detected Boundary Corners
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {droneState.detectedVertices.length > 0 ? `${droneState.detectedVertices.length} Pegs Found` : 'Awaiting Flight'}
                </span>
              </div>

              {droneState.detectedVertices.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs font-mono space-y-2">
                  <Crosshair className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 animate-pulse" />
                  <p>Boundary vertices will be automatically recognized and extracted from aerial imagery during flight.</p>
                </div>
              ) : (
                <div className="space-y-2 font-mono text-xs">
                  {droneState.detectedVertices.map((v, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-bold flex items-center justify-center text-[10px]">
                          {v.code}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {v.latitude.toFixed(6)}° N, {v.longitude.toFixed(6)}° E
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {v.markerType.replace('_', ' ')} • Alt {v.altitudeM.toFixed(1)}m
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                          {v.confidencePct}% match
                        </span>
                      </div>
                    </div>
                  ))}

                  {droneState.calculatedAreaAcres && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-300 dark:border-emerald-700 text-xs flex justify-between items-center">
                      <span className="font-bold text-emerald-800 dark:text-emerald-200">Computed Aerial Surface Area:</span>
                      <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                        {droneState.calculatedAreaAcres} Acres ({droneState.calculatedAreaSqM?.toLocaleString()} m²)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Drone Nadir Viewfinder & Flight Simulation Canvas (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Viewfinder Container */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl relative flex flex-col">
              {/* Viewfinder Top Bar */}
              <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between font-mono text-xs z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    LIVE 4K NADIR DRONE CAM (GSD 1.15 cm)
                  </span>
                </div>

                {/* Viewfinder mode toggle */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[10px]">
                  {[
                    { id: 'RGB_ORTHO', label: 'RGB Ortho', icon: Eye },
                    { id: 'NDVI_CROP', label: 'NDVI Health', icon: Leaf },
                    { id: 'THERMAL_SOIL', label: 'Thermal', icon: Flame },
                    { id: 'ELEVATION_DSM', label: 'DSM Elevation', icon: Mountain },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setDroneState((prev) => ({ ...prev, liveCameraMode: m.id as any }))}
                        className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
                          droneState.liveCameraMode === m.id
                            ? 'bg-cyan-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span className="hidden sm:inline">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Simulated High-Res Drone Viewfinder Surface */}
              <div className="h-80 sm:h-96 relative bg-slate-950 overflow-hidden flex items-center justify-center select-none">
                {/* Visual Imagery Layers */}
                {droneState.liveCameraMode === 'RGB_ORTHO' && (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80')`,
                      filter: 'contrast(1.1) brightness(0.95)',
                    }}
                  />
                )}
                {droneState.liveCameraMode === 'NDVI_CROP' && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600 via-lime-500 to-yellow-500 opacity-80 mix-blend-multiply" />
                )}
                {droneState.liveCameraMode === 'THERMAL_SOIL' && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 via-purple-700 to-amber-500 opacity-80 mix-blend-color" />
                )}
                {droneState.liveCameraMode === 'ELEVATION_DSM' && (
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-teal-700 to-yellow-600 opacity-75 mix-blend-overlay" />
                )}

                {/* Serpentine Drone Flight Grid Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-cyan-400/80 stroke-2 fill-none">
                  {/* Serpentine flight lines */}
                  <path
                    d="M 60 70 L 480 70 L 480 140 L 60 140 L 60 210 L 480 210 L 480 280 L 60 280"
                    strokeDasharray="6 4"
                    className="opacity-70"
                  />
                  {/* Cadastral Polygon Boundary preview */}
                  <polygon
                    points="120,90 420,80 440,260 100,250"
                    className="fill-emerald-500/20 stroke-emerald-400 stroke-2"
                  />
                </svg>

                {/* Drone Crosshair HUD */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-32 border border-cyan-400/40 rounded-full flex items-center justify-center">
                    <div className="w-16 h-16 border-2 border-cyan-400/80 rounded-full flex items-center justify-center">
                      <Crosshair className="w-8 h-8 text-cyan-300 animate-spin" style={{ animationDuration: '15s' }} />
                    </div>
                  </div>
                </div>

                {/* Flight Telemetry HUD Badges */}
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md p-2 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300 space-y-0.5">
                  <div>LAT: {droneState.latitude.toFixed(6)}° N</div>
                  <div>LNG: {droneState.longitude.toFixed(6)}° E</div>
                  <div className="text-cyan-400 font-bold">ALT: {droneState.altitudeM.toFixed(1)}m (AGL)</div>
                </div>

                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md p-2 rounded-xl border border-slate-800 text-[10px] font-mono text-right text-slate-300 space-y-0.5">
                  <div className="text-emerald-400 font-bold">FIX: RTK FIXED</div>
                  <div>SATS: 26 (NavIC+GPS)</div>
                  <div>GSD: {droneState.gsdCmPerPixel} cm/px</div>
                </div>

                {/* Flight Status Indicator */}
                {droneState.status === 'FLYING' && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-950/90 text-amber-300 border border-amber-500/60 px-4 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-2 shadow-xl animate-bounce">
                    <Plane className="w-4 h-4 animate-pulse" />
                    <span>AUTONOMOUS FLIGHT IN PROGRESS • WP {droneState.currentWaypointIndex}/{droneState.totalWaypoints}</span>
                  </div>
                )}
              </div>

              {/* Viewfinder Bottom Status Bar */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-3">
                  <span>FOV: 84° Nadir</span>
                  <span>Overlap: 80% Front / 75% Side</span>
                  <span className="hidden sm:inline">Camera: 48MP CMOS Mechanical Shutter</span>
                </div>
                <button
                  onClick={() => setActiveTab('gis')}
                  className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open in Full GIS Map Studio</span>
                </button>
              </div>
            </div>

            {/* How GeoNexa Drone Mapping Works (Citizen Plain-Language Guide) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 font-sans">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>How GeoNexa Drone Aerial Mapping Works (Simple 4-Step Guide)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>1-Tap Autonomous Drone Launch</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    The software automatically calculates the best flight path over your farm and commands the drone to take off safely.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 font-bold flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>Sub-2cm Orthophoto Stitching</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    Hundreds of overlapping 4K aerial photos are stitched in real time to produce a crisp photo map down to 1.15 cm per pixel.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <span>AI Boundary Stone Detection</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    Our AI software pinpoints corner boundary stones, fence lines, and hedges with over 98% accuracy without disturbing crops.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 font-bold flex items-center justify-center text-[10px]">
                      4
                    </span>
                    <span>Instant Legal Form IV Certificate</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    The boundary map and acreage are synced straight to the Tahsildar / Revenue Officer queue for legal digital signature.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
