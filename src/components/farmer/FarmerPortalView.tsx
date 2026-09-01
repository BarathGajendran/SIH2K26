import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LandParcel } from '../../types';
import {
  MapPin,
  Landmark,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Download,
  Eye,
  Send,
  Calculator,
  Compass,
  Layers,
  HelpCircle,
  Radio,
  Wheat,
  ShieldCheck,
  ChevronRight,
  Printer,
  X,
  Phone,
  User,
} from 'lucide-react';

interface FarmerPortalViewProps {
  onNavigateToMap?: (parcel: LandParcel) => void;
  onNavigateToDocuments?: () => void;
  onNavigateToReports?: () => void;
}

export const FarmerPortalView: React.FC<FarmerPortalViewProps> = ({
  onNavigateToMap,
  onNavigateToDocuments,
  onNavigateToReports,
}) => {
  const {
    currentUser,
    parcels,
    setSelectedParcel,
    setActiveTab,
    requestResurvey,
    corsStations,
    showNotification,
    setIsPlainGuideOpen,
  } = useApp();

  const [isResurveyModalOpen, setIsResurveyModalOpen] = useState(false);
  const [selectedParcelForResurvey, setSelectedParcelForResurvey] = useState<LandParcel | null>(null);
  const [resurveyReason, setResurveyReason] = useState('BOUNDARY_MARKING');
  const [resurveyNotes, setResurveyNotes] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Area Calculator Tool State
  const [calcInput, setCalcInput] = useState<string>('2.5');
  const [calcUnit, setCalcUnit] = useState<'acres' | 'cents' | 'gunthas' | 'hectares' | 'sqm'>('acres');

  // Filter parcels for the logged-in farmer if they have specific parcels, or show all with clear tag
  const myParcels = currentUser?.id
    ? parcels.filter(
        (p) => p.ownerId === currentUser.id || p.ownerName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0])
      )
    : parcels;

  const displayParcels = myParcels.length > 0 ? myParcels : parcels;

  // Selected plot for highlight
  const [focusedParcelId, setFocusedParcelId] = useState<string>(displayParcels[0]?.id || '');
  const activePlot = displayParcels.find((p) => p.id === focusedParcelId) || displayParcels[0];

  const handleOpenResurvey = (parcel: LandParcel) => {
    setSelectedParcelForResurvey(parcel);
    setIsResurveyModalOpen(true);
  };

  const handleResurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcelForResurvey) return;

    setIsSubmitting(true);
    const ok = await requestResurvey({
      parcelId: selectedParcelForResurvey.id,
      reason: resurveyReason,
      notes: resurveyNotes,
      preferredDate,
      applicantName: currentUser?.name,
      applicantPhone: currentUser?.phone,
    });
    setIsSubmitting(false);

    if (ok) {
      showNotification(`Resurvey request for SF ${selectedParcelForResurvey.surveyNumber} submitted successfully to Revenue Dept!`, 'success');
      setIsResurveyModalOpen(false);
      setResurveyNotes('');
    } else {
      showNotification('Failed to submit resurvey request. Please try again.', 'error');
    }
  };

  // Unit conversion helper
  const calculateUnits = (val: number, unit: string) => {
    let acres = 0;
    if (unit === 'acres') acres = val;
    else if (unit === 'cents') acres = val / 100;
    else if (unit === 'gunthas') acres = val / 40;
    else if (unit === 'hectares') acres = val / 0.404686;
    else if (unit === 'sqm') acres = val / 4046.86;

    return {
      acres: acres.toFixed(3),
      cents: (acres * 100).toFixed(1),
      gunthas: (acres * 40).toFixed(1),
      hectares: (acres * 0.404686).toFixed(3),
      sqM: Math.round(acres * 4046.86).toLocaleString(),
      sqFt: Math.round(acres * 43560).toLocaleString(),
    };
  };

  const convertedUnits = calculateUnits(parseFloat(calcInput) || 0, calcUnit);

  return (
    <div className="h-[calc(100vh-61px)] overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Banner: Farmer Profile & Quick Actions */}
      <div className="portal-hero-banner p-6 sm:p-8 rounded-3xl border border-white/20 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-mono font-bold">
            <Wheat className="w-3.5 h-3.5" />
            OFFICIAL FARMER & LANDOWNER PORTAL
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Vanakkam, {currentUser?.name || 'K. S. Ramasamy Gounder'}
          </h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed">
            Registered Patta Holder ({currentUser?.badgeNumber || 'PATTA-THOND-142'}). Here you can monitor your surveyed agricultural plot boundaries, view official Form IV digital certificates, and apply for high-precision GNSS resurveys.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => handleOpenResurvey(activePlot || displayParcels[0])}
            className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-102 cursor-pointer"
          >
            <Send className="w-4 h-4 text-emerald-600" />
            <span>Request GNSS Resurvey</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className="px-4 py-2.5 rounded-2xl bg-black/30 hover:bg-black/40 text-white border border-white/30 backdrop-blur-md text-xs font-bold flex items-center gap-2 transition-transform hover:scale-102 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>Download Form IV Certificate</span>
          </button>
        </div>
      </div>

      {/* Grid of My Farmland Parcels */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>My Agricultural Land Holdings ({displayParcels.length} Registered Plots)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-precision cadastral boundaries verified with Survey of India CORS reference stations.
            </p>
          </div>

          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
            Total Mapped Area:{' '}
            {displayParcels.reduce((acc, p) => acc + p.areaAcres, 0).toFixed(2)} Acres (
            {(displayParcels.reduce((acc, p) => acc + p.areaAcres, 0) * 100).toFixed(0)} Cents)
          </span>
        </div>

        {/* Farmland Plot Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayParcels.map((parcel) => {
            const isSelected = parcel.id === focusedParcelId;
            return (
              <div
                key={parcel.id}
                onClick={() => {
                  setFocusedParcelId(parcel.id);
                  setSelectedParcel(parcel);
                }}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl'
                    : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Header: Survey No & Status */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-black">
                        SF No. {parcel.surveyNumber}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {parcel.parcelNumber}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                      {parcel.village}, {parcel.taluk}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {parcel.district}, {parcel.state}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold font-mono border ${
                      parcel.status === 'VERIFIED'
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                        : parcel.status === 'RESURVEY_REQUESTED'
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                        : 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700'
                    }`}
                  >
                    {parcel.status === 'RESURVEY_REQUESTED' ? 'RESURVEY PENDING' : parcel.status}
                  </span>
                </div>

                {/* Acreage & Units Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Acres</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {parcel.areaAcres} Ac
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Cents</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                      {(parcel.areaAcres * 100).toFixed(0)} Cts
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Square Metres</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mt-0.5">
                      {parcel.areaSqM.toLocaleString()} m²
                    </span>
                  </div>
                </div>

                {/* Land Classification & Crops */}
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Classification:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {parcel.landType === 'WET_AGRICULTURAL'
                        ? 'Wet Land (Nanjai)'
                        : parcel.landType === 'DRY_AGRICULTURAL'
                        ? 'Dry Land (Punjai)'
                        : 'Garden Land (Thottam)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Standing Crops:</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400 truncate max-w-[160px]">
                      {parcel.crops?.join(', ') || 'Sugarcane, Coconut'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">RTK Accuracy:</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      ±{((parcel.lastSurveyAccuracyM || 0.014) * 100).toFixed(1)} cm (CORS Fix)
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedParcel(parcel);
                      setActiveTab('gis');
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View Map</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenResurvey(parcel);
                    }}
                    className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Resurvey</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle 2-Column: Resurvey Application Tracker + Farmland Document Locker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Resurvey Application Timeline Tracker */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Cadastral Resurvey Application Tracker
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time status of your GNSS boundary resurvey and Patta update
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPlainGuideOpen(true)}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Resurvey Guidelines</span>
            </button>
          </div>

          {/* Timeline Steps */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200 dark:before:bg-emerald-900/60">
            {/* Step 1: Application Received */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                ✓
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Application Submitted & Verified by e-Governance
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
                    COMPLETED
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Land records cross-referenced with Revenue Database. Application ID: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">RSV-2025-00412</span>
                </p>
              </div>
            </div>

            {/* Step 2: Surveyor Assigned */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                ✓
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Licensed RTK Surveyor Assigned
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
                    ASSIGNED
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Surveyor: <strong className="text-slate-700 dark:text-slate-300">K. Karthikeyan (License #SURV-RTK-8902)</strong> • Rover: South Galaxy G7 (NavIC enabled)
                </p>
              </div>
            </div>

            {/* Step 3: GNSS Field Measurement */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md animate-pulse">
                3
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Centimeter RTK Field Survey & Boundary Stone Fix
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-mono font-bold">
                    IN PROGRESS
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Corner pegs P1 through P4 measured with ±1.4cm precision linked to Coimbatore Agriculture Univ CORS station.
                </p>
              </div>
            </div>

            {/* Step 4: Form IV Seal & Patta Issuance */}
            <div className="relative flex items-start gap-4 opacity-70">
              <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold">
                4
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tahsildar Verification & Digital Form IV Issuance
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                    PENDING FINAL SEAL
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Formal digital land survey certificate with QR verification will be made available in your Document Locker.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Land Document Locker */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  Official Land Records Locker
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Digitally certified records for SF {activePlot?.surveyNumber || '142/3B'}
                </p>
              </div>
            </div>

            {/* Document Items */}
            <div className="space-y-2 pt-1">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">e-Patta Passbook</h5>
                    <span className="text-[10px] text-slate-400">Revenue Dept • Verified</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('documents');
                    showNotification('Opening e-Patta document in vault', 'info');
                  }}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer border border-slate-200 dark:border-slate-700"
                  title="View Document"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">FMB Field Sketch</h5>
                    <span className="text-[10px] text-slate-400">G-Line & Ladder Diagram</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('documents');
                    showNotification('Opening FMB sketch in vault', 'info');
                  }}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer border border-slate-200 dark:border-slate-700"
                  title="View Document"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">Form IV Certificate</h5>
                    <span className="text-[10px] text-slate-400">GNSS Survey & Official Seal</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer border border-slate-200 dark:border-slate-700"
                  title="View Report"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('documents')}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Open Full Document Vault</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Agricultural Area Unit Converter */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
              Indian Agricultural Land Area Converter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quickly convert farmland area between standard Indian revenue units (Acres, Cents, Gunthas, Hectares, Sq Metres)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Enter Farmland Area
            </label>
            <input
              type="number"
              step="0.01"
              value={calcInput}
              onChange={(e) => setCalcInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Input Unit
            </label>
            <select
              value={calcUnit}
              onChange={(e) => setCalcUnit(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="acres">Acres (ac)</option>
              <option value="cents">Cents (100 Cents = 1 Acre)</option>
              <option value="gunthas">Gunthas (40 Gunthas = 1 Acre)</option>
              <option value="hectares">Hectares (ha)</option>
              <option value="sqm">Square Metres (m²)</option>
            </select>
          </div>

          <div className="md:col-span-2 grid grid-cols-3 sm:grid-cols-5 gap-2 font-mono text-center">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-[10px] text-slate-400 font-sans block">Acres</span>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">{convertedUnits.acres}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-sans block">Cents</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{convertedUnits.cents}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-sans block">Gunthas</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{convertedUnits.gunthas}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-sans block">Hectares</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{convertedUnits.hectares}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-sans block">Sq Metres</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{convertedUnits.sqM}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resurvey Request Modal */}
      {isResurveyModalOpen && selectedParcelForResurvey && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsResurveyModalOpen(false)}
              className="absolute right-6 top-6 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-2xl">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  Request GNSS Boundary Resurvey
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  SF No. {selectedParcelForResurvey.surveyNumber} • {selectedParcelForResurvey.village} ({selectedParcelForResurvey.areaAcres} Acres)
                </p>
              </div>
            </div>

            <form onSubmit={handleResurveySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Resurvey Application *
                </label>
                <select
                  value={resurveyReason}
                  onChange={(e) => setResurveyReason(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="BOUNDARY_MARKING">Erect Permanent Boundary Stones / Fencing</option>
                  <option value="NEIGHBOR_DISPUTE">Neighbor Boundary Dispute / Encroachment Suspicion</option>
                  <option value="PARTITION_SUBDIVISION">Family Partition & Land Subdivision (Kooru Kattu)</option>
                  <option value="SALE_PURCHASE_VERIFICATION">Pre-Sale / Purchase Cadastral Verification</option>
                  <option value="MISSING_BOUNDARY_STONE">Lost / Damaged Concrete Survey Peg Restoration</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Field Observation Date
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Additional Notes / Adjoining Landowners
                </label>
                <textarea
                  rows={3}
                  value={resurveyNotes}
                  onChange={(e) => setResurveyNotes(e.target.value)}
                  placeholder="e.g. Northern boundary hedge shared with SF 142/3A needs physical realignment verification."
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>
                  The survey will be carried out using multi-constellation GNSS rovers calibrated to Survey of India CORS reference standards. Form-IV legal certificate will be auto-generated upon approval.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsResurveyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="portal-btn-primary px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Resurvey Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
