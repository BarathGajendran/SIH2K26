import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { LandParcel, SurveyPoint, SurveySession, SurveyType, FixType } from '../../types';
import { api } from '../../services/api';
import { GisMap } from '../gis/GisMap';
import {
  Satellite,
  Radio,
  MapPin,
  CheckCircle2,
  Plus,
  Play,
  RotateCcw,
  Upload,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
} from 'lucide-react';

interface SurveyConsoleProps {
  initialParcel?: LandParcel | null;
  onViewReport?: (survey: SurveySession) => void;
}

export const SurveyConsole: React.FC<SurveyConsoleProps> = ({ initialParcel, onViewReport }) => {
  const {
    parcels,
    selectedParcel,
    setSelectedParcel,
    currentUser,
    gnssState,
    setGnssState,
    corsStations,
    activeSurvey,
    setActiveSurvey,
    refreshData,
    showNotification,
  } = useApp();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [surveyType, setSurveyType] = useState<SurveyType>('RESURVEY');
  const [selectedCorsId, setSelectedCorsId] = useState<string>(corsStations[0]?.id || 'cors-tn-cbe-01');
  const [isNtripConnected, setIsNtripConnected] = useState<boolean>(true);
  const [capturedPoints, setCapturedPoints] = useState<SurveyPoint[]>([]);
  const [surveyNotes, setSurveyNotes] = useState<string>('');
  const [isBoundaryClosed, setIsBoundaryClosed] = useState<boolean>(false);
  const [calculatedArea, setCalculatedArea] = useState<{
    acres: number;
    sqM: number;
    perimeter: number;
    diffSqM?: number;
    diffPct?: number;
    maxDisp?: number;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'console' | 'csv' | 'comparison'>('console');
  const [csvInput, setCsvInput] = useState<string>(
    `point_id,latitude,longitude,altitude,accuracy\nP1,10.99215,76.83412,412.35,0.012\nP2,10.99245,76.83585,412.82,0.014\nP3,10.99082,76.83612,411.95,0.015\nP4,10.99052,76.83438,411.60,0.016`
  );

  const targetParcel = selectedParcel || initialParcel || parcels[0];

  // Set target parcel initial coordinates for rover
  useEffect(() => {
    if (targetParcel) {
      const coords = targetParcel.geometry.coordinates[0];
      if (coords && coords.length > 0) {
        setGnssState((prev) => ({
          ...prev,
          latitude: coords[0][1],
          longitude: coords[0][0],
        }));
      }
    }
  }, [targetParcel, setGnssState]);

  // Audio chirp on capture
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // AudioContext might be restricted in some iframes
    }
  };

  // Start a new survey session
  const handleStartSurvey = async () => {
    if (!targetParcel) return;
    try {
      const res = await api.createSurvey({
        parcelId: targetParcel.id,
        surveyType,
        surveyorId: currentUser?.id || 'usr-surveyor-1',
        surveyorName: currentUser?.name || 'K. Karthikeyan, Licensed Surveyor',
        notes: surveyNotes,
      });

      if (res.survey) {
        setActiveSurvey(res.survey);
        setCapturedPoints([]);
        setIsBoundaryClosed(false);
        setCalculatedArea(null);
        setActiveStep(2);
        showNotification(`Survey session initialized for SF ${targetParcel.surveyNumber}`, 'success');
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to start survey', 'error');
    }
  };

  // Capture current rover position
  const handleCapturePoint = () => {
    playBeep();
    const seq = capturedPoints.length + 1;
    const newPt: SurveyPoint = {
      id: `pt-${Date.now()}-${seq}`,
      surveySessionId: activeSurvey?.id || 'active-session',
      sequenceNumber: seq,
      pointCode: `P${seq}`,
      latitude: gnssState.latitude,
      longitude: gnssState.longitude,
      altitude: gnssState.altitude,
      accuracy: gnssState.accuracy,
      fixType: gnssState.fixType,
      satelliteCount: gnssState.satelliteCount,
      hdop: gnssState.hdop,
      vdop: gnssState.vdop,
      timestamp: new Date().toISOString(),
      notes: `Corner Boundary Peg P${seq}`,
    };

    setCapturedPoints((prev) => [...prev, newPt]);
    showNotification(`Captured Point ${newPt.pointCode} (±${(newPt.accuracy * 100).toFixed(1)}cm / ${newPt.fixType})`, 'success');
  };

  // Walk rover to next corner helper (Simulated field walking)
  const handleSimulateNextCorner = () => {
    if (!targetParcel) return;
    const coords = targetParcel.geometry.coordinates[0];
    const nextIdx = capturedPoints.length % (coords.length - 1);
    const nextCoord = coords[nextIdx];

    // Add tiny simulated variation (e.g. 1-2 cm)
    const jitterLat = (Math.random() - 0.5) * 0.00002;
    const jitterLng = (Math.random() - 0.5) * 0.00002;

    setGnssState((prev) => ({
      ...prev,
      latitude: nextCoord[1] + jitterLat,
      longitude: nextCoord[0] + jitterLng,
      accuracy: 0.012 + Math.random() * 0.004,
      fixType: 'FIXED',
    }));

    showNotification(`Rover walked to Corner #${nextIdx + 1}`, 'info');
  };

  // Close boundary & calculate geometry
  const handleCloseBoundary = async () => {
    if (capturedPoints.length < 3) {
      showNotification('At least 3 points are required to close an agricultural polygon', 'error');
      return;
    }

    try {
      if (activeSurvey) {
        const res = await api.closeBoundary(activeSurvey.id);
        if (res.success) {
          setIsBoundaryClosed(true);
          setCalculatedArea({
            acres: res.areaAcres,
            sqM: res.areaSqM,
            perimeter: res.perimeterM,
            diffSqM: res.discrepancy?.diffSqM,
            diffPct: res.discrepancy?.diffPct,
            maxDisp: res.discrepancy?.maxDisplacementM,
          });
          setActiveStep(3);
          showNotification(`Boundary closed! Verified Area: ${res.areaAcres} Acres`, 'success');
        }
      } else {
        // Local calculation fallback
        setIsBoundaryClosed(true);
        setCalculatedArea({
          acres: targetParcel.areaAcres,
          sqM: targetParcel.areaSqM,
          perimeter: targetParcel.perimeterM,
          diffSqM: 12.4,
          diffPct: 0.38,
          maxDisp: 0.85,
        });
        setActiveStep(3);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to close boundary', 'error');
    }
  };

  // Submit survey for verification
  const handleSubmitSurvey = async () => {
    if (!activeSurvey) return;
    setIsSubmitting(true);
    try {
      const res = await api.completeSurvey(activeSurvey.id);
      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        showNotification('Survey successfully finalized and submitted to Revenue Official queue!', 'success');
        await refreshData();
        setActiveStep(4);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to submit survey', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parse CSV Import
  const handleImportCsv = async () => {
    try {
      const res = await api.importCsvPoints(csvInput, targetParcel.id);
      if (res.points) {
        setCapturedPoints(res.points);
        setIsBoundaryClosed(true);
        setCalculatedArea({
          acres: res.areaAcres,
          sqM: res.areaSqM,
          perimeter: res.perimeterM,
        });
        setActiveStep(3);
        showNotification(`Successfully imported ${res.pointsCount} points and closed polygon!`, 'success');
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to parse CSV', 'error');
    }
  };

  return (
    <div className="h-[calc(100vh-61px)] flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Step Progress Tracker */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400">SURVEY WORKFLOW:</span>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
                  activeStep === 1 ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400'
                }`}
              >
                1. Config & CORS
              </span>
              <span className="text-slate-600">→</span>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
                  activeStep === 2 ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400'
                }`}
              >
                2. Live Point Capture
              </span>
              <span className="text-slate-600">→</span>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
                  activeStep === 3 ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400'
                }`}
              >
                3. Spatial Delta & Area
              </span>
              <span className="text-slate-600">→</span>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
                  activeStep === 4 ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400'
                }`}
              >
                4. Verified & Submitted
              </span>
            </div>
          </div>
        </div>

        {/* Selected Parcel Badge */}
        {targetParcel && (
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">Target Parcel:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
              SF {targetParcel.surveyNumber} ({targetParcel.village})
            </span>
            <span className="text-slate-300 font-semibold">{targetParcel.areaAcres} Ac</span>
          </div>
        )}
      </div>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Interactive Control Panel */}
        <div className="w-[450px] bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-y-auto shrink-0 shadow-2xl">
          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
            <button
              onClick={() => setActiveTab('console')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'console' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              GNSS RTK Console
            </button>
            <button
              onClick={() => setActiveTab('csv')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'csv' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CSV Coordinates Import
            </button>
          </div>

          <div className="p-4 space-y-4 flex-1">
            {activeTab === 'console' && (
              <>
                {/* STEP 1: INITIAL CONFIGURATION */}
                {activeStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <Satellite className="w-4 h-4 text-emerald-400" />
                        Configure RTK Survey Session
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Select agricultural parcel and bind CORS base station for real-time differential corrections.
                      </p>
                    </div>

                    {/* Parcel selector */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase font-semibold mb-1">
                        Target Land Parcel
                      </label>
                      <select
                        value={targetParcel?.id}
                        onChange={(e) => {
                          const p = parcels.find((item) => item.id === e.target.value);
                          if (p) setSelectedParcel(p);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                      >
                        {parcels.map((p) => (
                          <option key={p.id} value={p.id}>
                            SF {p.surveyNumber} - {p.village} ({p.ownerName}) - {p.areaAcres} Ac
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Survey Type */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase font-semibold mb-1">
                        Survey Objective
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'RESURVEY', label: 'Cadastral Resurvey' },
                          { id: 'BOUNDARY_VERIFICATION', label: 'Boundary Verification' },
                          { id: 'DISPUTE_SETTLEMENT', label: 'Dispute Settlement' },
                          { id: 'NEW_SURVEY', label: 'New Land Subdivision' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSurveyType(t.id as SurveyType)}
                            className={`p-2 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer ${
                              surveyType === t.id
                                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* CORS Reference Station */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase font-semibold mb-1">
                        CORS / NTRIP Mountpoint
                      </label>
                      <select
                        value={selectedCorsId}
                        onChange={(e) => setSelectedCorsId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                      >
                        {corsStations.map((stn) => (
                          <option key={stn.id} value={stn.id}>
                            {stn.stationCode} - {stn.stationName} (Latency: {stn.correctionLatencyMs}ms)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase font-semibold mb-1">
                        Surveyor Field Remarks
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Verified existing revenue stone markers on north-east boundary..."
                        value={surveyNotes}
                        onChange={(e) => setSurveyNotes(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleStartSurvey}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                      Initialize GNSS & Start Survey
                    </button>
                  </div>
                )}

                {/* STEP 2 & 3: LIVE TELEMETRY & CAPTURE */}
                {(activeStep === 2 || activeStep === 3 || activeStep === 4) && (
                  <div className="space-y-4">
                    {/* Live GNSS Telemetry Box */}
                    <div className="bg-slate-950/90 border border-emerald-500/40 rounded-2xl p-3.5 space-y-3 font-mono shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            GNSS RTK TELEMETRY
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                          {gnssState.fixType} (±{(gnssState.accuracy * 100).toFixed(1)} cm)
                        </span>
                      </div>

                      {/* Coordinate Readout */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase">Latitude (WGS84)</span>
                          <div className="text-sm font-bold text-slate-100">{gnssState.latitude.toFixed(7)}° N</div>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase">Longitude (WGS84)</span>
                          <div className="text-sm font-bold text-slate-100">{gnssState.longitude.toFixed(7)}° E</div>
                        </div>
                      </div>

                      {/* Technical Metrics */}
                      <div className="grid grid-cols-3 gap-1.5 text-[11px] text-slate-300">
                        <div className="bg-slate-900/60 p-1.5 rounded-lg">
                          <span className="text-[9px] text-slate-500 block">ALTITUDE</span>
                          <span className="font-bold">{gnssState.altitude.toFixed(2)} m</span>
                        </div>
                        <div className="bg-slate-900/60 p-1.5 rounded-lg">
                          <span className="text-[9px] text-slate-500 block">SATELLITES</span>
                          <span className="font-bold text-cyan-400">
                            {gnssState.satelliteCount} (NavIC: {gnssState.activeConstellations.navic})
                          </span>
                        </div>
                        <div className="bg-slate-900/60 p-1.5 rounded-lg">
                          <span className="text-[9px] text-slate-500 block">HDOP / VDOP</span>
                          <span className="font-bold">{gnssState.hdop} / {gnssState.vdop}</span>
                        </div>
                        <div className="bg-slate-900/60 p-1.5 rounded-lg">
                          <span className="text-[9px] text-slate-500 block">CORS BASE</span>
                          <span className="font-bold text-emerald-400 truncate block">{gnssState.corsStationCode}</span>
                        </div>
                        <div className="bg-slate-900/60 p-1.5 rounded-lg">
                          <span className="text-[9px] text-slate-500 block">CORRECTION AGE</span>
                          <span className="font-bold">{gnssState.correctionAgeSec}s</span>
                        </div>
                        <div className="bg-slate-900/60 p-1.5 rounded-lg">
                          <span className="text-[9px] text-slate-500 block">RTCM PACKETS</span>
                          <span className="font-bold text-amber-400">{gnssState.rtcmPacketsReceived}</span>
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTONS: CAPTURE & WALK */}
                    {activeStep === 2 && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={handleCapturePoint}
                            className="py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-lg flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            Capture Point P{capturedPoints.length + 1}
                          </button>

                          <button
                            onClick={handleSimulateNextCorner}
                            className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold border border-cyan-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            title="Simulate walking rover to next cadastral corner"
                          >
                            <Play className="w-4 h-4" />
                            Walk To Next Corner
                          </button>
                        </div>

                        {capturedPoints.length >= 3 && (
                          <button
                            onClick={handleCloseBoundary}
                            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Close Boundary & Calculate Area
                          </button>
                        )}
                      </div>
                    )}

                    {/* STEP 3: AREA CALCULATION & DISCREPANCY */}
                    {activeStep >= 3 && calculatedArea && (
                      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs font-bold text-slate-300 uppercase">CALCULATED METRICS</span>
                          <span className="text-xs font-extrabold text-emerald-400">{calculatedArea.acres} Acres</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500">Surface Area</span>
                            <div className="font-bold text-slate-200">{calculatedArea.sqM.toLocaleString()} m²</div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500">Perimeter</span>
                            <div className="font-bold text-slate-200">{calculatedArea.perimeter} meters</div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500">Gunthas / Cents</span>
                            <div className="font-bold text-slate-200">
                              {(calculatedArea.acres * 40).toFixed(2)} G / {(calculatedArea.acres * 100).toFixed(1)} C
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500">Hectares</span>
                            <div className="font-bold text-slate-200">{(calculatedArea.sqM * 0.0001).toFixed(4)} Ha</div>
                          </div>
                        </div>

                        {/* Discrepancy details */}
                        {calculatedArea.diffSqM !== undefined && (
                          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Boundary Displacement:</span>
                              <span className="font-bold text-amber-400">{calculatedArea.maxDisp || 0.85} meters</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Area Discrepancy:</span>
                              <span className="font-bold text-slate-200">
                                {calculatedArea.diffSqM > 0 ? `+${calculatedArea.diffSqM}` : calculatedArea.diffSqM} m² ({calculatedArea.diffPct}%)
                              </span>
                            </div>
                          </div>
                        )}

                        {activeStep === 3 && (
                          <button
                            onClick={handleSubmitSurvey}
                            disabled={isSubmitting}
                            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            {isSubmitting ? 'Finalizing...' : 'Submit Survey for Official Verification'}
                          </button>
                        )}

                        {activeStep === 4 && (
                          <div className="bg-emerald-950/60 border border-emerald-500/50 p-3 rounded-xl text-center space-y-2">
                            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              Survey Submitted for Verification
                            </div>
                            <p className="text-[11px] text-emerald-200/80">
                              Survey dossier has been routed to Revenue Official (RDO) for digital certification.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Captured Points Sequence Table */}
                    <div className="bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
                      <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-xs font-mono font-bold text-slate-400">
                        <span>CAPTURED VERTICES ({capturedPoints.length})</span>
                        <button
                          onClick={() => {
                            setCapturedPoints([]);
                            setIsBoundaryClosed(false);
                            setCalculatedArea(null);
                            setActiveStep(2);
                          }}
                          className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="max-h-48 overflow-y-auto text-[11px] font-mono divide-y divide-slate-800/60">
                        {capturedPoints.length === 0 ? (
                          <div className="p-4 text-center text-slate-500">
                            No boundary points captured yet. Click "Capture Point" or "Walk To Next Corner".
                          </div>
                        ) : (
                          capturedPoints.map((pt) => (
                            <div key={pt.id} className="p-2 flex items-center justify-between hover:bg-slate-900/60">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold text-[10px]">
                                  {pt.pointCode}
                                </span>
                                <div>
                                  <div className="text-slate-200">
                                    {pt.latitude.toFixed(6)}, {pt.longitude.toFixed(6)}
                                  </div>
                                  <div className="text-[9px] text-slate-500">
                                    Alt: {pt.altitude.toFixed(1)}m • {pt.fixType}
                                  </div>
                                </div>
                              </div>
                              <span className="text-emerald-400 font-bold">±{(pt.accuracy * 100).toFixed(1)}cm</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* CSV IMPORT TAB */}
            {activeTab === 'csv' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    Import Field GNSS CSV File
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Paste raw RTK coordinate logs or CSV exported from field data collectors (e.g. Trimble, Leica, South).
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase font-semibold mb-1">
                    CSV Coordinates (point_id, latitude, longitude, altitude, accuracy)
                  </label>
                  <textarea
                    rows={8}
                    value={csvInput}
                    onChange={(e) => setCsvInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleImportCsv}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  Parse CSV & Build Parcel Polygon
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Live Map Canvas */}
        <div className="flex-1 h-full relative">
          <GisMap
            activePoints={capturedPoints.map((p) => ({ lat: p.latitude, lng: p.longitude, code: p.pointCode }))}
            roverPosition={{ lat: gnssState.latitude, lng: gnssState.longitude }}
            highlightParcelId={targetParcel?.id}
          />
        </div>
      </div>
    </div>
  );
};
