import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Satellite,
  Radio,
  Layers,
  ShieldCheck,
  Award,
  Zap,
  TrendingUp,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({ isOpen, onClose }) => {
  const [slide, setSlide] = useState<number>(0);

  const slides = [
    {
      title: 'GeoNexa: Next-Gen Digital Cadastral Infrastructure',
      subtitle: 'Modernizing Agricultural Land Survey, Drone Photogrammetry & Boundary Governance',
      icon: Satellite,
      tag: 'VISION & ARCHITECTURE',
      points: [
        'Replacing manual chain and optical theodolites with sub-centimeter multi-frequency GNSS/RTK and autonomous drone mapping.',
        'Seamless integration with national CORS network broadcasting RTCM 3.2 MSM4 geodetic corrections.',
        'High-precision carrier-phase ambiguity resolution leveraging NavIC (IRNSS), GPS, GLONASS, and Galileo constellations.',
        'PostGIS spatial verification engine preventing boundary disputes with automated encroachment detection and AI assistance.',
      ],
    },
    {
      title: 'Real-Time CORS & NTRIP Correction Network',
      subtitle: 'Sub-2cm Accuracy Across Agricultural Fields Without Local Base Stations',
      icon: Radio,
      tag: 'GEODETIC CORRECTION',
      points: [
        'NTRIP v2.0 client connects to state & national reference towers on port 2101.',
        'Sub-second correction latency (avg. 120ms) broadcasting dual-frequency L1/L2 and L5 carrier observables.',
        'Automatic ambiguity resolution switching from SINGLE (±1.5m) to FLOAT (±8cm) to FIXED (±1.4cm).',
        'Open NMEA-0183 & RTCM 3.2 software protocol engine compatible with any standard GNSS field rover or drone telemetry link.',
      ],
    },
    {
      title: 'Autonomous Drone Aerial Photogrammetry',
      subtitle: '1.1cm/px Ground Sampling Distance (GSD) for High-Throughput Cadastral Mapping',
      icon: Zap,
      tag: 'DRONE MAPPING HUB',
      points: [
        'Autonomous lawnmower flight path planning with 80% forward & 70% lateral overlap for high-density point clouds.',
        'Direct software drone control link streaming real-time battery, satellite fix, altitude, and live orthomosaic stitching.',
        'Automated edge detection identifying physical boundary bunds, stone markings, and field hedge vertices.',
        'Seamless export to GIS cadastral map layers and instant Form-IV verification queue.',
      ],
    },
    {
      title: 'Automated PostGIS Encroachment Detection',
      subtitle: 'Mathematical Boundary Topology & Overlap Prevention',
      icon: Layers,
      tag: 'SPATIAL ALGORITHMS',
      points: [
        'ST_Intersection detects real-time overlaps between surveyed boundaries and adjoining land records.',
        'Configurable spatial tolerance threshold (e.g. 0.5m) to filter natural hedge variance from illegal encroachment.',
        'Haversine geodesic boundary measurement computing area in Acres, Hectares, Gunthas, and Cents.',
        'Audit-ready delta logging recording coordinate displacements down to 7 decimal precision.',
      ],
    },
    {
      title: 'DILRMP Compliance & Citizen Empowerment',
      subtitle: 'Form-IV Digital Certification & Frictionless Mobile Land Governance',
      icon: ShieldCheck,
      tag: 'IMPACT & DEPLOYMENT',
      points: [
        'Instant generation of Form-IV Digital Agricultural Land Survey Certificates with QR verification and cryptographic seals.',
        'Dedicated Citizen / Farmer portal to view certified land records, calculate areas, and track resurvey requests.',
        'Reduces boundary dispute litigation time in revenue courts by over 80%.',
        'Production-ready scalable architecture built for nationwide rollout under Digital India Land Records.',
      ],
    },
  ];

  if (!isOpen) return null;

  const current = slides[slide];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-8 space-y-6 shadow-2xl relative font-sans text-slate-900 dark:text-slate-100 transition-colors">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Slide Tag */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-mono text-xs font-bold">
            {current.tag}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            SLIDE {slide + 1} OF {slides.length}
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-2xl border border-emerald-300 dark:border-emerald-800">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{current.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{current.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Bullet Points */}
        <div className="space-y-3 pt-2">
          {current.points.map((pt, i) => (
            <div
              key={i}
              className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{pt}</span>
            </div>
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setSlide((prev) => Math.max(0, prev - 1))}
            disabled={slide === 0}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Slide
          </button>

          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                onClick={() => setSlide(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === slide ? 'w-6 bg-emerald-600 dark:bg-emerald-400' : 'w-2 bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setSlide((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={slide === slides.length - 1}
            className="portal-btn-primary px-4 py-2 disabled:opacity-30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            Next Slide
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
