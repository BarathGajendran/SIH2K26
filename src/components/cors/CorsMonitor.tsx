import React from 'react';
import { useApp } from '../../context/AppContext';
import { CorsStation } from '../../types';
import {
  Radio,
  Satellite,
  Activity,
  Server,
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Code2,
  Layers,
} from 'lucide-react';

export const CorsMonitor: React.FC = () => {
  const { corsStations, gnssState } = useApp();

  return (
    <div className="h-[calc(100vh-61px)] overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6 transition-colors">
      {/* Header Banner */}
      <div className="portal-hero-banner p-6 rounded-3xl border border-white/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 font-mono text-[11px] font-bold">
              NATIONAL CORS NETWORK
            </span>
            <span className="text-xs text-white/80">| Survey of India (SoI) & State Geodetic Reference Infrastructure</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white mt-1">
            Continuously Operating Reference Station (CORS) & NTRIP Caster Monitor
          </h1>
          <p className="text-xs text-white/90 mt-1 max-w-2xl">
            Real-time Carrier-Phase Differential GNSS corrections broadcasted via NTRIP protocol in RTCM 3.2 MSM4 format for sub-centimeter agricultural parcel surveying.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 font-mono text-xs text-white">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
          <span className="text-emerald-300 font-bold">CASTER ONLINE</span>
          <span className="text-white/40">|</span>
          <span className="text-white/90">Port 2101 (NTRIP v2.0)</span>
        </div>
      </div>

      {/* CORS Base Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {corsStations.map((station) => (
          <div
            key={station.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 font-mono text-xs relative overflow-hidden group hover:border-cyan-500/40 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{station.stationName}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{station.stationCode} • {station.agency}</div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold text-[10px]">
                {station.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block">STREAM LATENCY</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{station.correctionLatencyMs} ms</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block">CONNECTED ROVERS</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold text-sm">{station.connectedRoversCount} Active</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block">NETWORK UPTIME</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold text-sm">{station.uptimePct}%</span>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Base Coordinates:</span>
                <span className="text-slate-800 dark:text-slate-200">{station.latitude.toFixed(4)}°N, {station.longitude.toFixed(4)}°E (Alt: {station.elevationM}m)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mountpoint:</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{station.mountpoint}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Format:</span>
                <span className="text-slate-800 dark:text-slate-200">{station.format}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Carrier Frequencies:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{station.carrierFrequencies.join(', ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Educational Architecture & Message Standards Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RTCM 3.2 MSM Message Structure */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>RTCM 3.2 MSM4 Message Stream Composition</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-sans">
            The NTRIP caster streams standard binary packets decoded in real time by the rover to resolve carrier-phase integer ambiguities:
          </p>

          <div className="space-y-2">
            {[
              { code: 'Type 1004', desc: 'Extended L1 & L2 GPS RTK observables' },
              { code: 'Type 1006', desc: 'Stationary RTK Reference Station ARP with Antenna Height' },
              { code: 'Type 1012', desc: 'Extended L1 & L2 GLONASS RTK observables' },
              { code: 'Type 1074', desc: 'MSM4 Full GPS Pseudoranges, PhaseRanges, CNR' },
              { code: 'Type 1084', desc: 'MSM4 Full GLONASS observables' },
              { code: 'Type 1134', desc: 'MSM4 NavIC (India IRNSS) L5 and S-band Carrier Observables' },
            ].map((msg) => (
              <div key={msg.code} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">{msg.code}</span>
                <span className="text-slate-700 dark:text-slate-300 text-[11px] font-sans">{msg.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hardware Agnostic GNSSProvider Interface */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold">
            <Code2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Pluggable GNSSProvider Software Driver Architecture</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-sans">
            The platform isolates field instruments behind an extensible TypeScript software provider interface:
          </p>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-2">
            <div className="text-emerald-600 dark:text-emerald-400 font-bold">// Pluggable Software Driver Protocols:</div>
            <div>• <strong className="text-slate-900 dark:text-slate-100">SimulationGNSSProvider</strong> (Real-time Autonomous Geodesic Engine)</div>
            <div>• <strong className="text-slate-900 dark:text-slate-100">DronePhotogrammetryProvider</strong> (Autonomous Flight & Aerial GSD Link)</div>
            <div>• <strong className="text-slate-900 dark:text-slate-100">BluetoothGNSSProvider</strong> (BLE Standard Location Telemetry)</div>
            <div>• <strong className="text-slate-900 dark:text-slate-100">NetworkNTRIPProvider</strong> (TCP / RTCM 3.2 Geodetic Stream)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
