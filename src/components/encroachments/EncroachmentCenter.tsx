import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EncroachmentAlert, EncroachmentSeverity, EncroachmentStatus } from '../../types';
import { api } from '../../services/api';
import {
  AlertOctagon,
  ShieldAlert,
  MapPin,
  Clock,
  Sliders,
  CheckCircle2,
  Send,
  Eye,
  FileWarning,
  Building,
  ArrowRight,
} from 'lucide-react';

interface EncroachmentsProps {
  onNavigateToMap?: (parcelId: string) => void;
}

export const EncroachmentCenter: React.FC<EncroachmentsProps> = ({ onNavigateToMap }) => {
  const { encroachments, parcels, setSelectedParcel, setMapViewport, refreshData, showNotification } = useApp();

  const [selectedAlert, setSelectedAlert] = useState<EncroachmentAlert | null>(encroachments[0] || null);
  const [toleranceThreshold, setToleranceThreshold] = useState<number>(0.5); // meters
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredAlerts = encroachments.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    return true;
  });

  const getSeverityBadge = (severity: EncroachmentSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'HIGH':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'MEDIUM':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'LOW':
        return 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800';
    }
  };

  const handleUpdateStatus = async (alertId: string, status: EncroachmentStatus) => {
    try {
      const res = await api.updateEncroachmentStatus(alertId, {
        status,
        resolutionNotes: `Status updated to ${status} by Revenue Officer on ${new Date().toLocaleDateString()}`,
      });
      if (res.success) {
        showNotification(`Encroachment status updated to ${status}`, 'success');
        await refreshData();
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to update status', 'error');
    }
  };

  const handleInspectOnMap = (alert: EncroachmentAlert) => {
    const parcel = parcels.find((p) => p.id === alert.parcelId);
    if (parcel) {
      setSelectedParcel(parcel);
      const coords = parcel.geometry.coordinates[0];
      if (coords && coords.length > 0) {
        setMapViewport([coords[0][1], coords[0][0]], 18);
      }
      if (onNavigateToMap) onNavigateToMap(parcel.id);
      showNotification(`Focused on disputed SF ${alert.surveyNumber}`, 'info');
    }
  };

  return (
    <div className="h-[calc(100vh-61px)] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-mono text-[11px] font-bold">
              SPATIAL INTERSECTION ENGINE
            </span>
            <span className="text-xs text-slate-500">| PostGIS ST_Intersection & ST_Difference Analysis</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
            Boundary Discrepancy & Encroachment Detection Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated spatial tolerance validation comparing newly surveyed RTK coordinates against adjoining revenue land records.
          </p>
        </div>

        {/* Tolerance Slider Control */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Tolerance Threshold:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={toleranceThreshold}
              onChange={(e) => setToleranceThreshold(parseFloat(e.target.value))}
              className="accent-emerald-500 cursor-pointer"
            />
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{toleranceThreshold.toFixed(1)}m</span>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Alerts List */}
        <div className="w-[380px] sm:w-[420px] border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 flex flex-col h-full overflow-y-auto shrink-0">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
              DETECTED ALERTS ({filteredAlerts.length})
            </span>
            <div className="flex gap-1 text-[10px]">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSeverity(s)}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    filterSeverity === s
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 overflow-y-auto flex-1">
            {filteredAlerts.map((alert) => {
              const isSelected = selectedAlert?.id === alert.id;
              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-4 transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-rose-50/70 dark:bg-slate-800/90 border-l-4 border-l-rose-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">SF {alert.surveyNumber}</span>
                        <span className="text-slate-400 text-xs">vs</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                          {alert.affectedParcelNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {alert.village}, {alert.taluk}, {alert.district}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${getSeverityBadge(
                        alert.severity
                      )}`}
                    >
                      {alert.severity}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs font-mono">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
                      Overlap: {alert.overlapAreaSqM} m² ({alert.overlapAreaAcres} Ac)
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">Disp: {alert.displacementM}m</span>
                  </div>

                  <div className="mt-2 text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 inline-block font-mono">
                    Status: {alert.status.replace('_', ' ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail & Spatial Inspector */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {selectedAlert ? (
            <>
              {/* Alert Header Banner */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5 text-rose-500" />
                    <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                      SPATIAL OVERLAP INCIDENT #{selectedAlert.id}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-mono font-bold border ${getSeverityBadge(
                      selectedAlert.severity
                    )}`}
                  >
                    SEVERITY: {selectedAlert.severity}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Overlap on Survey No. {selectedAlert.surveyNumber} ({selectedAlert.village})
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{selectedAlert.description}</p>
              </div>

              {/* Spatial Geometry Calculation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs font-mono">
                  <span className="text-[10px] text-slate-400 uppercase">ST_Intersection Area</span>
                  <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-1">
                    {selectedAlert.overlapAreaSqM} m²
                  </div>
                  <div className="text-[11px] text-slate-500">({selectedAlert.overlapAreaAcres} Acres)</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs font-mono">
                  <span className="text-[10px] text-slate-400 uppercase">Max Boundary Displacement</span>
                  <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1">
                    {selectedAlert.displacementM} meters
                  </div>
                  <div className="text-[11px] text-slate-500">Exceeds {toleranceThreshold}m tolerance</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs font-mono">
                  <span className="text-[10px] text-slate-400 uppercase">Detection Timestamp</span>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {new Date(selectedAlert.detectedAt).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(selectedAlert.detectedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Conflicting Parties Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Surveyed Parcel</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">SF {selectedAlert.surveyNumber}</div>
                  <div className="text-xs text-slate-500">{selectedAlert.parcelNumber}</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Adjoining Patta Holder</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedAlert.affectedOwnerName}</div>
                  <div className="text-xs text-slate-500">{selectedAlert.affectedParcelNumber}</div>
                </div>
              </div>

              {/* Action Decision Bar */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">Official Action & Resolution</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'NOTICE_ISSUED')}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Issue Notice to Landowners
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'UNDER_INVESTIGATION')}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Assign Ground Re-survey
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'RESOLVED')}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>

                  <button
                    onClick={() => handleInspectOnMap(selectedAlert)}
                    className="px-4 py-2.5 bg-cyan-50 dark:bg-cyan-950/80 hover:bg-cyan-100 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect on Interactive GIS Map
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Select an encroachment alert on the left to inspect spatial analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
