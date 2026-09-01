import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LandParcel, ParcelStatus } from '../../types';
import {
  Landmark,
  Search,
  Filter,
  MapPin,
  Satellite,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Plus,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

interface ParcelsListProps {
  onStartSurvey: (parcel: LandParcel) => void;
  onNavigateToMap: (parcel: LandParcel) => void;
}

export const ParcelsList: React.FC<ParcelsListProps> = ({ onStartSurvey, onNavigateToMap }) => {
  const { parcels, setSelectedParcel, setMapViewport, showNotification } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const villages = Array.from(new Set(parcels.map((p) => p.village)));

  const filteredParcels = parcels.filter((p) => {
    if (selectedVillage !== 'ALL' && p.village !== selectedVillage) return false;
    if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.parcelNumber.toLowerCase().includes(q) ||
        p.surveyNumber.toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: ParcelStatus) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
      case 'DISPUTED':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700';
      case 'SURVEY_IN_PROGRESS':
        return 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700';
      case 'PENDING_SURVEY':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700';
      case 'RESURVEY_REQUESTED':
        return 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700';
    }
  };

  const handleInspect = (parcel: LandParcel) => {
    setSelectedParcel(parcel);
    const coords = parcel.geometry.coordinates[0];
    if (coords && coords.length > 0) {
      setMapViewport([coords[0][1], coords[0][0]], 18);
    }
    onNavigateToMap(parcel);
    showNotification(`Focused map on SF ${parcel.surveyNumber}`, 'info');
  };

  return (
    <div className="h-[calc(100vh-61px)] overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 space-y-6 transition-colors">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-mono text-[11px] font-bold">
              CADASTRAL PARCEL REGISTRY
            </span>
            <span className="text-xs text-slate-500">| PostGIS Spatial Geometry Database</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">Agricultural Land Parcels Catalog</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage cadastral survey numbers, Patta passbooks, digital boundaries, and RTK survey status across all revenue villages.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
          <span>Showing: </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">{filteredParcels.length} Parcels</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by Survey No, Owner, Village, Parcel ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Village Filter */}
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 font-mono focus:outline-none"
          >
            <option value="ALL">All Villages ({villages.length})</option>
            {villages.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 font-mono focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="DISPUTED">Disputed</option>
            <option value="SURVEY_IN_PROGRESS">Survey Active</option>
            <option value="PENDING_SURVEY">Pending Survey</option>
            <option value="RESURVEY_REQUESTED">Resurvey Requested</option>
          </select>
        </div>
      </div>

      {/* Parcels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParcels.map((parcel) => (
          <div
            key={parcel.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      SF {parcel.surveyNumber}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${getStatusBadge(parcel.status)}`}>
                      {parcel.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">{parcel.parcelNumber}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {parcel.village}, {parcel.taluk}, {parcel.district}
                  </p>
                </div>
              </div>

              {/* Area & Owner Readout */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 mt-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Acreage</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">{parcel.areaAcres} Acres</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Surface Area</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{parcel.areaSqM} m²</span>
                </div>
              </div>

              <div className="mt-3 text-xs space-y-1">
                <div>
                  <span className="text-slate-400 font-mono">Owner: </span>
                  <strong className="text-slate-800 dark:text-slate-200">{parcel.ownerName}</strong>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Type: {parcel.landType.replace('_', ' ')}</span>
                  <span>Soil: {parcel.soilType}</span>
                </div>
              </div>

              {parcel.encroachmentFlag && (
                <div className="mt-2 p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-[11px] text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Boundary overlap alert detected on adjoining stone.</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleInspect(parcel)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Inspect Map
              </button>

              <button
                onClick={() => onStartSurvey(parcel)}
                className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                <Satellite className="w-3.5 h-3.5" />
                RTK Resurvey
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
