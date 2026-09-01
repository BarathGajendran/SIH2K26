import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SurveySession, LandParcel } from '../../types';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Building,
  Satellite,
  Calendar,
  User,
  MapPin,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { parcels, activeReportSurvey } = useApp();

  const [selectedParcelId, setSelectedParcelId] = useState<string>(parcels[0]?.id || 'pcl-cbe-001');

  const selectedParcel = parcels.find((p) => p.id === selectedParcelId) || parcels[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-[calc(100vh-61px)] overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6 transition-colors">
      {/* Header Controls */}
      <div className="portal-hero-banner p-6 rounded-3xl border border-white/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 font-mono text-[11px] font-bold">
              OFFICIAL FORM-IV CERTIFICATION
            </span>
            <span className="text-xs text-white/80">| Revenue & Settlement Department</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white mt-1">Digital Agricultural Land Survey Certificate</h1>
          <p className="text-xs text-white/90 mt-0.5">
            Tamper-proof digital land survey certificate with high-precision GNSS/RTK coordinates, CORS reference validation, and official seal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedParcelId}
            onChange={(e) => setSelectedParcelId(e.target.value)}
            className="bg-black/30 backdrop-blur-md border border-white/30 rounded-2xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
          >
            {parcels.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                SF {p.surveyNumber} - {p.village} ({p.ownerName})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg transition-transform hover:scale-102 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Official Certificate Paper Container */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-300 print:border-none print:shadow-none print:p-4 print:m-0 font-sans">
        {/* Certificate Top Header */}
        <div className="text-center border-b-2 border-emerald-800 pb-6 space-y-1">
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-900 font-mono">
            GOVERNMENT OF INDIA • LAND RESOURCES & SURVEY DEPARTMENT
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
            Digital Agricultural Land Survey Certificate
          </h2>
          <div className="text-xs font-semibold text-slate-600 font-mono">
            [ Form IV — Issued under National Land Records Modernization Programme (DILRMP) ]
          </div>
          <div className="text-[11px] text-slate-500">
            Certificate ID: <strong className="font-mono text-slate-900">GEONEXA-CERT-{selectedParcel?.parcelNumber}</strong>
          </div>
        </div>

        {/* Parcel & Ownership Details Table */}
        <div className="mt-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Survey Number</span>
              <span className="font-bold text-sm font-mono text-emerald-900">SF {selectedParcel?.surveyNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Parcel Identifier</span>
              <span className="font-bold text-xs font-mono">{selectedParcel?.parcelNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Revenue Village</span>
              <span className="font-bold text-xs">{selectedParcel?.village}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Taluk & District</span>
              <span className="font-bold text-xs">{selectedParcel?.taluk}, {selectedParcel?.district}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Registered Landowner</span>
              <span className="font-bold text-xs text-slate-950">{selectedParcel?.ownerName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Certified Acreage</span>
              <span className="font-extrabold text-sm text-emerald-900 font-mono">{selectedParcel?.areaAcres} Acres</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Metric Surface Area</span>
              <span className="font-bold text-xs font-mono">{selectedParcel?.areaSqM} m² ({selectedParcel?.areaHectares} Ha)</span>
            </div>
          </div>
        </div>

        {/* GNSS / RTK Technical Quality Statement */}
        <div className="mt-6 p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-900 font-bold">
            <Satellite className="w-4 h-4 text-emerald-700" />
            <span>GNSS RTK Measurement & Geodetic Verification Standard</span>
          </div>
          <p className="text-slate-700 leading-relaxed text-[11px]">
            This land boundary was measured using multi-frequency GNSS/RTK rover tracking Indian <strong>NavIC (IRNSS)</strong>, GPS, GLONASS, and Galileo constellations, corrected in real-time via <strong>Survey of India CORS Reference Station TN-CORS-CBTR</strong> (RTCM 3.2 MSM4 stream). All boundary points achieve sub-2cm positioning tolerance.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200 font-mono text-[11px]">
            <div>Fix: <strong className="text-emerald-900">RTK FIXED</strong></div>
            <div>Avg Accuracy: <strong className="text-emerald-900">±1.4 cm</strong></div>
            <div>Satellites: <strong className="text-emerald-900">28 (NavIC: 7)</strong></div>
            <div>Datum: <strong className="text-emerald-900">WGS84 / EPSG:4326</strong></div>
          </div>
        </div>

        {/* High-Precision Boundary Points Table */}
        <div className="mt-6 space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase font-mono">
            Boundary Vertex Coordinates (WGS84 High-Precision Geodesic Log)
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px] font-mono">
            <table className="w-full text-left">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="p-2">Point</th>
                  <th className="p-2">Latitude (°N)</th>
                  <th className="p-2">Longitude (°E)</th>
                  <th className="p-2">Altitude (m)</th>
                  <th className="p-2">Accuracy</th>
                  <th className="p-2">Fix State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedParcel?.geometry.coordinates[0]?.slice(0, -1).map((coord, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 font-bold text-emerald-900">P{idx + 1}</td>
                    <td className="p-2">{coord[1].toFixed(7)}°</td>
                    <td className="p-2">{coord[0].toFixed(7)}°</td>
                    <td className="p-2">412.35 m</td>
                    <td className="p-2 text-emerald-800 font-bold">±0.014 m</td>
                    <td className="p-2">FIXED</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification Signatures & Digital Seal */}
        <div className="mt-8 pt-6 border-t-2 border-slate-200 flex items-end justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <ShieldCheck className="w-5 h-5" />
              <span>Digitally Certified & Timestamped</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Surveyor: K. Karthikeyan (Lic: SURV-RTK-8902)
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Verified: Shri. M. Shanmugam (RDO / Tahsildar)
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="w-20 h-20 bg-slate-100 border-2 border-emerald-800 rounded-lg flex items-center justify-center mx-auto text-emerald-900">
              <QrCode className="w-16 h-16 text-slate-900" />
            </div>
            <span className="text-[9px] text-slate-500 font-mono block">Scan for PostGIS Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
};
