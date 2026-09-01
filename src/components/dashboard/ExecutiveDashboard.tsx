import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Landmark,
  Satellite,
  CheckCircle2,
  AlertOctagon,
  Radio,
  Target,
  TrendingUp,
  MapPin,
  FileText,
  Activity,
  Sparkles,
  Sun,
  ShieldCheck,
  Compass,
  ArrowUpRight,
  Calculator,
  Layers,
  ChevronRight,
  Clock,
  Zap,
  Globe,
  HelpCircle,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const ExecutiveDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    dashboardStats,
    parcels,
    encroachments,
    gnssState,
    setSelectedParcel,
    setMapViewport,
    setIsPlainGuideOpen,
    setIsDemoModalOpen,
  } = useApp();

  const [areaUnit, setAreaUnit] = useState<'acres' | 'gunthas' | 'hectares' | 'cents'>('acres');
  const [activeChartTab, setActiveChartTab] = useState<'velocity' | 'accuracy' | 'status'>('velocity');
  
  // Quick Land Calculator state
  const [calcInput, setCalcInput] = useState<number>(2.5);
  const [calcUnit, setCalcUnit] = useState<'acres' | 'cents' | 'gunthas' | 'hectares'>('acres');

  const stats = dashboardStats || {
    totalParcels: 20,
    activeSurveys: 3,
    completedSurveys: 14,
    pendingVerifications: 2,
    detectedEncroachments: 2,
    totalAreaSurveyedAcres: 148.5,
    onlineCorsStations: 4,
    totalCorsStations: 4,
    avgSurveyAccuracyCm: 1.4,
    villageStats: [
      { village: 'Thondamuthur', parcelCount: 5, areaAcres: 42.5, crop: 'Sugarcane & Coconut', progress: 92 },
      { village: 'Anaimalai', parcelCount: 4, areaAcres: 34.2, crop: 'Nutmeg & Tea', progress: 85 },
      { village: 'Alandi', parcelCount: 4, areaAcres: 28.6, crop: 'Soybean & Onion', progress: 78 },
      { village: 'Channarayapatna', parcelCount: 4, areaAcres: 24.8, crop: 'Ragi & Maize', progress: 88 },
      { village: 'Bapatla', parcelCount: 3, areaAcres: 18.4, crop: 'Paddy & Chilies', progress: 95 },
    ],
    surveyStatusStats: [
      { name: 'Verified & Sealed', value: 12, color: '#10b981' },
      { name: 'Survey in Progress', value: 3, color: '#06b6d4' },
      { name: 'Awaiting Official Sign', value: 3, color: '#f59e0b' },
      { name: 'Disputed Overlap', value: 2, color: '#f43f5e' },
    ],
    encroachmentSeverityStats: [
      { name: 'Critical (>5m)', value: 1, color: '#e11d48' },
      { name: 'High (2-5m)', value: 1, color: '#f97316' },
      { name: 'Medium (0.8-2m)', value: 2, color: '#eab308' },
      { name: 'Minor (<0.8m)', value: 1, color: '#06b6d4' },
    ],
    monthlySurveyTrends: [
      { month: 'Sep', newSurveys: 12, resurveys: 8, verified: 18 },
      { month: 'Oct', newSurveys: 19, resurveys: 14, verified: 22 },
      { month: 'Nov', newSurveys: 24, resurveys: 18, verified: 35 },
      { month: 'Dec', newSurveys: 30, resurveys: 21, verified: 42 },
      { month: 'Jan', newSurveys: 38, resurveys: 26, verified: 54 },
      { month: 'Feb', newSurveys: 44, resurveys: 31, verified: 68 },
    ],
    accuracyDistribution: [
      { range: '< 1.5 cm (RTK Fixed)', count: 14, color: '#10b981' },
      { range: '1.5 - 2.5 cm (High Prec.)', count: 4, color: '#38bdf8' },
      { range: '2.5 - 5.0 cm (Acceptable)', count: 2, color: '#f59e0b' },
      { range: '> 5.0 cm (Sub-optimal)', count: 0, color: '#ef4444' },
    ],
  };

  const getConvertedArea = (acres: number) => {
    switch (areaUnit) {
      case 'gunthas':
        return `${(acres * 40).toFixed(1)} Gunthas`;
      case 'hectares':
        return `${(acres * 0.404686).toFixed(2)} Ha`;
      case 'cents':
        return `${(acres * 100).toFixed(0)} Cents`;
      default:
        return `${acres.toFixed(1)} Acres`;
    }
  };

  // Calculate live conversions for calculator
  const calcAcres = calcUnit === 'acres' ? calcInput : calcUnit === 'cents' ? calcInput / 100 : calcUnit === 'gunthas' ? calcInput / 40 : calcInput / 0.404686;
  const calcCents = (calcAcres * 100).toFixed(1);
  const calcGunthas = (calcAcres * 40).toFixed(1);
  const calcHectares = (calcAcres * 0.404686).toFixed(3);
  const calcSqM = (calcAcres * 4046.86).toFixed(0);

  const handleFocusVillage = (villageName: string) => {
    const parcel = parcels.find((p) => p.village === villageName) || parcels[0];
    if (parcel && parcel.geometry?.coordinates?.[0]?.[0]) {
      const coords = parcel.geometry.coordinates[0][0];
      setSelectedParcel(parcel);
      setMapViewport([coords[1], coords[0]], 17);
      onNavigate('gis');
    }
  };

  return (
    <div className="h-[calc(100vh-61px)] overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 space-y-6 transition-colors">
      
      {/* 🌟 LIVELY HERO HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 text-white p-6 sm:p-8 shadow-xl shadow-emerald-900/20 border border-emerald-400/30">
        {/* Subtle decorative background circles */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-48 h-48 rounded-full bg-cyan-400/20 blur-xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-mono text-xs font-bold border border-white/30 flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                BHU-BHARAT CADASTRAL ENGINE
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-900/40 text-cyan-200 text-xs font-semibold backdrop-blur-sm border border-cyan-400/30 flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-300" />
                Ionospheric Kp: 1.8 (Optimal RTK)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/40 text-emerald-200 text-xs font-semibold backdrop-blur-sm border border-emerald-400/30 flex items-center gap-1">
                <Compass className="w-3 h-3 text-emerald-300" />
                NavIC + GPS L5
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight drop-shadow-sm">
              Agricultural Land Resurvey & Cadastral Intelligence
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl font-normal leading-relaxed">
              Real-time centimeter-level RTK correction, PostGIS automated boundary overlap detection, and farmer-friendly digital Patta certification across Indian revenue villages.
            </p>
          </div>

          {/* Action Launchers */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl text-xs font-black shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-900 animate-spin" />
              <span>1-Click Demo Survey</span>
            </button>
            <button
              onClick={() => onNavigate('survey')}
              className="px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Satellite className="w-4 h-4 text-emerald-600" />
              <span>Launch Field Rover</span>
            </button>
            <button
              onClick={() => setIsPlainGuideOpen(true)}
              className="px-3.5 py-2.5 bg-emerald-800/60 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer"
              title="Open Plain Language Guide"
            >
              <HelpCircle className="w-4 h-4 text-emerald-300" />
              <span>Plain Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🚀 NON-REPETITIVE BENTO METRICS GRID (Each card has distinct styling & purpose) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* BENTO CARD 1: Total Farmland Acreage with Unit Toggle */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <Landmark className="w-5 h-5" />
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  onClick={() => setAreaUnit('acres')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${areaUnit === 'acres' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}
                >
                  Ac
                </button>
                <button
                  onClick={() => setAreaUnit('gunthas')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${areaUnit === 'gunthas' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}
                >
                  Gu
                </button>
                <button
                  onClick={() => setAreaUnit('hectares')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${areaUnit === 'hectares' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}
                >
                  Ha
                </button>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {getConvertedArea(stats.totalAreaSurveyedAcres)}
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                Total Farmland Area
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% this cycle
            </span>
            <button onClick={() => onNavigate('parcels')} className="hover:underline flex items-center gap-0.5">
              <span>Parcels</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* BENTO CARD 2: RTK Precision Circular Health Gauge */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-xs">
                <Target className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 text-[10px] font-mono font-bold border border-cyan-300 dark:border-cyan-800">
                RTK FIXED
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 tracking-tight flex items-baseline gap-1">
                ±{stats.avgSurveyAccuracyCm} <span className="text-sm font-semibold text-slate-500">cm</span>
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                Avg GNSS Accuracy
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span>24 Satellites</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">NavIC + GPS</span>
          </div>
        </div>

        {/* BENTO CARD 3: Active Operations Pulse */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs">
                <Satellite className="w-5 h-5 animate-pulse" />
              </div>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {stats.activeSurveys} Active
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                Field RTK Rovers
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
            <span className="truncate">Thondamuthur SF 142</span>
            <button onClick={() => onNavigate('survey')} className="hover:underline flex items-center gap-0.5">
              <span>Join</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* BENTO CARD 4: Encroachment Radar Alerts */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold border border-rose-300 dark:border-rose-800 animate-pulse">
                ACTION REQ.
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                {stats.detectedEncroachments} Overlaps
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                Boundary Disputes
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
            <span>1 Critical (&gt;5m)</span>
            <button onClick={() => onNavigate('encroachments')} className="hover:underline flex items-center gap-0.5">
              <span>Inspect</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* BENTO CARD 5: CORS Network Station Status */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                <Radio className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 18ms
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {stats.onlineCorsStations}/{stats.totalCorsStations} Towers
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                SoI CORS Caster
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
            <span>RTCM 3.2 MSM4</span>
            <button onClick={() => onNavigate('cors')} className="hover:underline flex items-center gap-0.5">
              <span>Network</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* BENTO CARD 6: Official Revenue Verification Queue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-300 dark:border-amber-800">
                FORM IV
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {stats.pendingVerifications} Pending
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                RDO Review Queue
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            <span>Tahsildar Sign-off</span>
            <button onClick={() => onNavigate('verification')} className="hover:underline flex items-center gap-0.5">
              <span>Review</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* 🌾 VILLAGE PROGRESS BENTO SECTION */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Village-Wise Agricultural Cadastral Progress</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive survey completion rates and crop profiles across pilot revenue clusters
            </p>
          </div>
          <button
            onClick={() => onNavigate('gis')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All on GIS Map</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {stats.villageStats.map((v, i) => (
            <div
              key={i}
              onClick={() => handleFocusVillage(v.village)}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {v.village}
                </span>
                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {v.progress}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${v.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>{v.parcelCount} Plots • {v.areaAcres} Ac</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-[100px]">
                  {v.crop}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📊 CHARTS & SPATIAL ANALYTICS (Rich interactive visualization) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Interactive Charts with Tab Switcher */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>Survey Velocity & Accuracy Matrix</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Temporal trends of digital boundary verifications and GNSS tolerance
              </p>
            </div>

            {/* Tab controls */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveChartTab('velocity')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeChartTab === 'velocity'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Monthly Trend
              </button>
              <button
                onClick={() => setActiveChartTab('accuracy')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeChartTab === 'accuracy'
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Accuracy Spread
              </button>
              <button
                onClick={() => setActiveChartTab('status')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeChartTab === 'status'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Status Split
              </button>
            </div>
          </div>

          {/* Chart Rendering */}
          <div className="h-72 w-full pt-2">
            {activeChartTab === 'velocity' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlySurveyTrends}>
                  <defs>
                    <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="verified"
                    name="Verified & Sealed (Form IV)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorVerified)"
                  />
                  <Area
                    type="monotone"
                    dataKey="newSurveys"
                    name="New GNSS RTK Surveys"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorNew)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'accuracy' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.accuracyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
                  <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" name="Survey Sessions" radius={[8, 8, 0, 0]}>
                    {stats.accuracyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'status' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.surveyStatusStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.surveyStatusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Interactive Land Area Tool & Solar Weather */}
        <div className="space-y-4 flex flex-col justify-between">
          
          {/* Quick Area Calculator Widget */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Instant Area Converter</span>
              </h4>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                Agri Units
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                value={calcInput}
                onChange={(e) => setCalcInput(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <select
                value={calcUnit}
                onChange={(e) => setCalcUnit(e.target.value as any)}
                className="flex-1 px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="acres">Acres (ஏக்கர் / एकड़)</option>
                <option value="cents">Cents (சென்ட் - 100/ac)</option>
                <option value="gunthas">Gunthas (गुंठा - 40/ac)</option>
                <option value="hectares">Hectares (ஹெக்டேர்)</option>
              </select>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">In Cents</span>
                <span className="text-sm font-black text-emerald-800 dark:text-emerald-200 font-mono">{calcCents} Cts</span>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-800/60">
                <span className="text-[10px] text-cyan-700 dark:text-cyan-400 block font-semibold">In Gunthas</span>
                <span className="text-sm font-black text-cyan-800 dark:text-cyan-200 font-mono">{calcGunthas} Gts</span>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60">
                <span className="text-[10px] text-indigo-700 dark:text-indigo-400 block font-semibold">In Hectares</span>
                <span className="text-sm font-black text-indigo-800 dark:text-indigo-200 font-mono">{calcHectares} Ha</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block font-semibold">In Sq. Meters</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200 font-mono">{calcSqM} m²</span>
              </div>
            </div>
          </div>

          {/* Real-time Field Telemetry Pill */}
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-5 rounded-3xl border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400 animate-spin" />
                Live NavIC / GPS Constellation
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700 font-mono">
                L1/L2/L5
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>IRNSS / NavIC (India)</span>
                <span className="font-bold text-emerald-400">7 Satellites</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>GPS (USA) + Galileo (EU)</span>
                <span className="font-bold text-cyan-400">13 Satellites</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>GLONASS + BeiDou</span>
                <span className="font-bold text-amber-400">4 Satellites</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">CORS Station: <strong className="text-white">TN-CBE-01</strong></span>
              <button
                onClick={() => onNavigate('cors')}
                className="text-emerald-400 hover:underline font-bold"
              >
                Inspect NTRIP →
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
