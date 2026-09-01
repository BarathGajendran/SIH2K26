import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { LandParcel } from '../../types';
import {
  Layers,
  Maximize2,
  Compass,
  Ruler,
  Square,
  Eye,
  Satellite,
  Radio,
  MapPin,
  Info,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface GisMapProps {
  onStartSurvey?: (parcel: LandParcel) => void;
  showComparison?: boolean;
  activePoints?: { lat: number; lng: number; code: string }[];
  roverPosition?: { lat: number; lng: number };
  highlightParcelId?: string;
}

export const GisMap: React.FC<GisMapProps> = ({
  onStartSurvey,
  showComparison = false,
  activePoints,
  roverPosition,
  highlightParcelId,
}) => {
  const {
    parcels,
    selectedParcel,
    setSelectedParcel,
    gnssState,
    corsStations,
    encroachments,
    mapCenter,
    mapZoom,
    setMapViewport,
    setActiveReportSurvey,
    showNotification,
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const parcelLayersRef = useRef<L.FeatureGroup | null>(null);
  const activeSurveyGroupRef = useRef<L.FeatureGroup | null>(null);
  const roverMarkerRef = useRef<L.Marker | null>(null);
  const corsGroupRef = useRef<L.FeatureGroup | null>(null);
  const measurementGroupRef = useRef<L.FeatureGroup | null>(null);

  const [activeBaseLayer, setActiveBaseLayer] = useState<'satellite' | 'streets' | 'dark'>('satellite');
  const [showCorsLayer, setShowCorsLayer] = useState<boolean>(true);
  const [showEncroachmentZones, setShowEncroachmentZones] = useState<boolean>(true);
  const [showParcelLabels, setShowParcelLabels] = useState<boolean>(true);
  const [measureMode, setMeasureMode] = useState<'none' | 'distance' | 'area'>('none');
  const [measurePoints, setMeasurePoints] = useState<L.LatLng[]>([]);
  const [measureResult, setMeasureResult] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: mapCenter,
      zoom: mapZoom,
      zoomControl: false,
    });

    // Add scale bar
    L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(map);

    // Layer groups
    const parcelGroup = L.featureGroup().addTo(map);
    const activeGroup = L.featureGroup().addTo(map);
    const corsGroup = L.featureGroup().addTo(map);
    const measGroup = L.featureGroup().addTo(map);

    parcelLayersRef.current = parcelGroup;
    activeSurveyGroupRef.current = activeGroup;
    corsGroupRef.current = corsGroup;
    measurementGroupRef.current = measGroup;

    mapInstanceRef.current = map;

    // Measurement click handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      // If measure mode is active, handle measurement
      // (Handled in dedicated effect)
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update base tiles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = '';
    let maxZoom = 20;

    if (activeBaseLayer === 'satellite') {
      // High-resolution ESRI World Imagery
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 19;
    } else if (activeBaseLayer === 'dark') {
      // CartoDB Dark Matter
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else {
      // OpenStreetMap Standard
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom,
      attribution:
        activeBaseLayer === 'satellite'
          ? '&copy; Esri & Maxar Earthstar Geographics'
          : '&copy; OpenStreetMap contributors',
    });

    tileLayer.addTo(map);
    tileLayer.bringToBack();
  }, [activeBaseLayer]);

  // Sync Map Viewport
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setView(mapCenter, mapZoom, { animate: true });
  }, [mapCenter, mapZoom]);

  // Render Land Parcels
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = parcelLayersRef.current;
    if (!map || !group) return;

    group.clearLayers();

    parcels.forEach((parcel) => {
      const coords = parcel.geometry.coordinates[0];
      if (!coords || coords.length < 3) return;

      const latLngs = coords.map((c) => [c[1], c[0]] as [number, number]);
      const isSelected = selectedParcel?.id === parcel.id || highlightParcelId === parcel.id;

      // Color coding by status
      let strokeColor = '#10b981'; // emerald
      let fillColor = '#10b981';
      let fillOpacity = 0.25;

      if (parcel.status === 'DISPUTED' || parcel.encroachmentFlag) {
        strokeColor = '#f43f5e'; // rose
        fillColor = '#f43f5e';
        fillOpacity = 0.35;
      } else if (parcel.status === 'SURVEY_IN_PROGRESS') {
        strokeColor = '#38bdf8'; // sky blue
        fillColor = '#0284c7';
        fillOpacity = 0.3;
      } else if (parcel.status === 'PENDING_SURVEY') {
        strokeColor = '#f59e0b'; // amber
        fillColor = '#f59e0b';
        fillOpacity = 0.2;
      } else if (parcel.status === 'RESURVEY_REQUESTED') {
        strokeColor = '#a855f7'; // purple
        fillColor = '#a855f7';
        fillOpacity = 0.25;
      }

      if (isSelected) {
        strokeColor = '#fbbf24'; // bright amber glow
        fillOpacity = 0.45;
      }

      const polygon = L.polygon(latLngs, {
        color: strokeColor,
        weight: isSelected ? 3.5 : 2,
        opacity: 0.95,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        dashArray: parcel.status === 'PENDING_SURVEY' ? '5, 5' : undefined,
      });

      // Tooltip / permanent label
      if (showParcelLabels) {
        polygon.bindTooltip(
          `<div class="font-mono text-[11px] font-bold leading-tight">
            <div>SF ${parcel.surveyNumber}</div>
            <div class="text-[9px] font-normal opacity-90">${parcel.areaAcres} Ac (${parcel.ownerName.split(' ')[0]})</div>
          </div>`,
          {
            permanent: true,
            direction: 'center',
            className: 'bg-slate-950/85 text-white px-2 py-1 rounded border border-slate-700 shadow-md font-sans',
          }
        );
      }

      polygon.on('click', () => {
        setSelectedParcel(parcel);
        setIsInspectorOpen(true);
      });

      group.addLayer(polygon);
    });
  }, [parcels, selectedParcel, highlightParcelId, showParcelLabels]);

  // Render Active Survey Points & Dynamic Line
  useEffect(() => {
    const group = activeSurveyGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (activePoints && activePoints.length > 0) {
      const latLngs = activePoints.map((p) => [p.lat, p.lng] as [number, number]);

      // Connect points with high-vis line
      if (latLngs.length > 1) {
        const polyline = L.polyline(latLngs, {
          color: '#38bdf8',
          weight: 3,
          dashArray: '6, 6',
        });
        group.addLayer(polyline);
      }

      // Add point markers
      activePoints.forEach((pt, index) => {
        const icon = L.divIcon({
          className: 'custom-survey-point',
          html: `<div class="w-6 h-6 rounded-full bg-cyan-500 border-2 border-white text-slate-950 font-mono font-bold text-[10px] flex items-center justify-center shadow-lg shadow-cyan-950">${pt.code || `P${index + 1}`}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([pt.lat, pt.lng], { icon });
        marker.bindPopup(
          `<div class="p-1 font-mono text-xs">
            <div class="font-bold text-cyan-600">${pt.code} (Survey Vertex)</div>
            <div>Lat: ${pt.lat.toFixed(6)}</div>
            <div>Lng: ${pt.lng.toFixed(6)}</div>
          </div>`
        );
        group.addLayer(marker);
      });
    }
  }, [activePoints]);

  // Live RTK Rover Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const lat = roverPosition?.lat ?? gnssState.latitude;
    const lng = roverPosition?.lng ?? gnssState.longitude;

    if (!roverMarkerRef.current) {
      const roverIcon = L.divIcon({
        className: 'rtk-rover-icon',
        html: `<div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-60"></span>
          <div class="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border-2 border-white shadow-xl flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([lat, lng], { icon: roverIcon, zIndexOffset: 1000 }).addTo(map);
      marker.bindPopup(
        `<div class="font-mono text-xs p-1">
          <div class="font-bold text-emerald-600 flex items-center gap-1">
            <span>●</span> RTK Rover (${gnssState.fixType})
          </div>
          <div>Lat: ${lat.toFixed(6)}°</div>
          <div>Lng: ${lng.toFixed(6)}°</div>
          <div>Accuracy: ±${(gnssState.accuracy * 100).toFixed(1)} cm</div>
          <div>CORS: ${gnssState.corsStationCode}</div>
        </div>`
      );
      roverMarkerRef.current = marker;
    } else {
      roverMarkerRef.current.setLatLng([lat, lng]);
    }
  }, [roverPosition, gnssState.latitude, gnssState.longitude, gnssState.accuracy, gnssState.fixType, gnssState.corsStationCode]);

  // Render CORS Reference Stations
  useEffect(() => {
    const group = corsGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (!showCorsLayer) return;

    corsStations.forEach((stn) => {
      const corsIcon = L.divIcon({
        className: 'cors-station-icon',
        html: `<div class="w-7 h-7 rounded-lg bg-indigo-900 border-2 border-indigo-400 text-indigo-200 flex items-center justify-center shadow-lg shadow-indigo-950 font-bold text-xs">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([stn.latitude, stn.longitude], { icon: corsIcon });
      marker.bindPopup(
        `<div class="font-sans text-xs p-1 max-w-xs">
          <div class="font-bold text-indigo-400">${stn.stationName}</div>
          <div class="font-mono text-[11px] text-slate-300">Code: ${stn.stationCode} | Port: ${stn.port}</div>
          <div class="text-[11px] text-slate-300">Format: ${stn.format}</div>
          <div class="text-[11px] text-emerald-400 font-mono">Status: ${stn.status} (${stn.correctionLatencyMs}ms latency)</div>
          <div class="text-[10px] text-slate-400 mt-1">${stn.agency}</div>
        </div>`
      );
      group.addLayer(marker);
    });
  }, [corsStations, showCorsLayer]);

  // Interactive Measurement tool click handlers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = measurementGroupRef.current;
    if (!map || !group) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (measureMode === 'none') return;

      const newPts = [...measurePoints, e.latlng];
      setMeasurePoints(newPts);

      group.clearLayers();

      // Render measurement markers
      newPts.forEach((pt, i) => {
        const marker = L.circleMarker(pt, {
          radius: 5,
          color: '#fbbf24',
          fillColor: '#f59e0b',
          fillOpacity: 1,
        });
        group.addLayer(marker);
      });

      if (measureMode === 'distance' && newPts.length > 1) {
        const line = L.polyline(newPts, { color: '#fbbf24', weight: 3, dashArray: '5, 5' });
        group.addLayer(line);

        let totalDist = 0;
        for (let i = 0; i < newPts.length - 1; i++) {
          totalDist += newPts[i].distanceTo(newPts[i + 1]);
        }
        setMeasureResult(`Total Distance: ${totalDist.toFixed(2)} meters (${(totalDist / 1000).toFixed(3)} km)`);
      } else if (measureMode === 'area' && newPts.length >= 3) {
        const poly = L.polygon(newPts, { color: '#fbbf24', fillColor: '#fbbf24', fillOpacity: 0.25 });
        group.addLayer(poly);

        // Approximate geodesic area
        const coords = newPts.map((p) => [p.lng, p.lat]);
        coords.push([...coords[0]]);
        let area = 0;
        const R = 6378137;
        for (let i = 0; i < coords.length - 1; i++) {
          const p1 = coords[i];
          const p2 = coords[i + 1];
          const lng1 = (p1[0] * Math.PI) / 180;
          const lat1 = (p1[1] * Math.PI) / 180;
          const lng2 = (p2[0] * Math.PI) / 180;
          const lat2 = (p2[1] * Math.PI) / 180;
          area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
        }
        area = Math.abs((area * R * R) / 2);
        const acres = (area * 0.000247105).toFixed(3);
        const cents = (Number(acres) * 100).toFixed(1);
        setMeasureResult(`Area: ${acres} Acres (${cents} Cents / ${area.toFixed(1)} m²)`);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [measureMode, measurePoints]);

  const resetMeasurement = () => {
    setMeasurePoints([]);
    setMeasureResult(null);
    if (measurementGroupRef.current) measurementGroupRef.current.clearLayers();
  };

  const jumpToVillage = (villageName: string) => {
    if (villageName === 'Thondamuthur') setMapViewport([10.99215, 76.83512], 17);
    else if (villageName === 'Pollachi') setMapViewport([10.58215, 76.93412], 17);
    else if (villageName === 'Alandi') setMapViewport([18.67512, 73.89612], 17);
    else if (villageName === 'Hassan') setMapViewport([12.90512, 76.38812], 17);
    else if (villageName === 'Bapatla') setMapViewport([15.90512, 80.46812], 17);
    showNotification(`Jumped map view to ${villageName}`, 'info');
  };

  return (
    <div className="relative w-full h-[calc(100vh-61px)] overflow-hidden bg-slate-950 flex">
      {/* Map Stage */}
      <div className="flex-1 relative h-full">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Top Left: Quick Village Switcher */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-xl">
          <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center px-2">VILLAGE:</span>
          {['Thondamuthur', 'Pollachi', 'Alandi', 'Hassan', 'Bapatla'].map((v) => (
            <button
              key={v}
              onClick={() => jumpToVillage(v)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-700/60 hover:text-emerald-200 text-slate-300 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              {v}
            </button>
          ))}
        </div>

        {/* Top Right: Layer Switcher & Map Tools */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {/* Tile Layer Selector */}
          <div className="flex bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-xl">
            <button
              onClick={() => setActiveBaseLayer('satellite')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeBaseLayer === 'satellite'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              Satellite (ESRI)
            </button>
            <button
              onClick={() => setActiveBaseLayer('streets')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeBaseLayer === 'streets'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              OSM Streets
            </button>
            <button
              onClick={() => setActiveBaseLayer('dark')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeBaseLayer === 'dark'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Carto Dark
            </button>
          </div>

          {/* Spatial Toolkit: Measure Distance & Area */}
          <div className="flex bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-xl">
            <button
              onClick={() => {
                if (measureMode === 'distance') {
                  setMeasureMode('none');
                  resetMeasurement();
                } else {
                  setMeasureMode('distance');
                  resetMeasurement();
                  showNotification('Click points on the map to measure geodesic distance', 'info');
                }
              }}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                measureMode === 'distance' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Measure Distance (m)"
            >
              <Ruler className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (measureMode === 'area') {
                  setMeasureMode('none');
                  resetMeasurement();
                } else {
                  setMeasureMode('area');
                  resetMeasurement();
                  showNotification('Click 3 or more boundary points to calculate area in Acres', 'info');
                }
              }}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                measureMode === 'area' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Measure Area (Acres/m²)"
            >
              <Square className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowParcelLabels(!showParcelLabels)}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                showParcelLabels ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:bg-slate-800'
              }`}
              title="Toggle Parcel SF Labels"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Measurement Result Banner */}
        {measureMode !== 'none' && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 bg-amber-950/90 text-amber-200 border border-amber-500/50 backdrop-blur-md px-4 py-2 rounded-xl shadow-2xl flex items-center gap-3 font-mono text-xs">
            <span className="font-bold">
              {measureMode === 'distance' ? '📏 Distance Tool Active' : '📐 Area Tool Active'}
            </span>
            <span>{measureResult || 'Click on map to add vertices...'}</span>
            <button
              onClick={resetMeasurement}
              className="px-2 py-0.5 bg-amber-600/40 hover:bg-amber-600 text-amber-100 rounded text-[11px] transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        {/* Bottom Legend Bar */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-700/80 shadow-xl flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-400"></span>
            <span className="text-slate-300">Verified Land</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500/40 border border-rose-400"></span>
            <span className="text-slate-300">Disputed / Overlap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-sky-500/40 border border-sky-400"></span>
            <span className="text-slate-300">Survey Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-400"></span>
            <span className="text-slate-300">Pending Survey</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-emerald-400">RTK Rover Live</span>
          </div>
        </div>
      </div>

      {/* Right Drawer: Selected Parcel Inspector */}
      {isInspectorOpen && selectedParcel && (
        <div className="w-96 bg-slate-900 border-l border-slate-800 h-full overflow-y-auto flex flex-col z-20 shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                  SF {selectedParcel.surveyNumber}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold font-mono ${
                    selectedParcel.status === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : selectedParcel.status === 'DISPUTED'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {selectedParcel.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-100 mt-1">{selectedParcel.parcelNumber}</h2>
              <p className="text-xs text-slate-400">{selectedParcel.village}, {selectedParcel.taluk}, {selectedParcel.district}</p>
            </div>
            <button
              onClick={() => setIsInspectorOpen(false)}
              className="text-slate-500 hover:text-slate-300 p-1 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Body Info */}
          <div className="p-4 space-y-4 flex-1">
            {/* Area Grid */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Acreage</span>
                <div className="text-lg font-extrabold text-emerald-400">{selectedParcel.areaAcres} Acres</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Metric Area</span>
                <div className="text-sm font-bold text-slate-200">{selectedParcel.areaSqM} m²</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Hectares</span>
                <div className="text-xs text-slate-300">{selectedParcel.areaHectares} Ha</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Perimeter</span>
                <div className="text-xs text-slate-300">{selectedParcel.perimeterM} m</div>
              </div>
            </div>

            {/* Landowner details */}
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Registered Patta Holder</span>
              <div className="text-sm font-bold text-slate-100 mt-0.5">{selectedParcel.ownerName}</div>
              <div className="text-xs text-slate-400 mt-0.5 font-mono">{selectedParcel.ownerPhone}</div>
              <div className="text-[11px] text-slate-400 mt-1">Khasra / Khata: {selectedParcel.khasraNumber}</div>
            </div>

            {/* Land & Soil Classification */}
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Agricultural Classification</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                  {selectedParcel.landType.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-300 font-mono">{selectedParcel.soilType}</span>
              </div>
              {selectedParcel.crops && selectedParcel.crops.length > 0 && (
                <div className="mt-2 text-xs text-slate-300">
                  <span className="text-slate-400">Crops: </span>
                  {selectedParcel.crops.join(', ')}
                </div>
              )}
            </div>

            {/* Encroachment Alert if flagged */}
            {selectedParcel.encroachmentFlag && (
              <div className="bg-rose-950/60 border border-rose-500/50 p-3 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  Boundary Overlap Flagged
                </div>
                <p className="text-rose-200/90 text-[11px]">
                  PostGIS ST_Intersection detected an active boundary discrepancy exceeding 0.5m standard RTK tolerance against adjacent parcel.
                </p>
              </div>
            )}

            {/* Survey History */}
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Latest Survey Record</span>
              <div className="mt-1 text-slate-300">Date: {selectedParcel.lastSurveyDate || 'Pending initial RTK survey'}</div>
              <div className="text-slate-300">Surveyor: {selectedParcel.lastSurveyorName || 'Assigned to K. Karthikeyan'}</div>
              <div className="text-emerald-400 font-mono">Accuracy: ±{( (selectedParcel.lastSurveyAccuracyM || 0.015) * 100 ).toFixed(1)} cm</div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-2">
            <button
              onClick={() => {
                if (onStartSurvey) onStartSurvey(selectedParcel);
              }}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Satellite className="w-4 h-4" />
              Launch Live RTK Resurvey
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
