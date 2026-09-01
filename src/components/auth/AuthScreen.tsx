import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { PORTALS } from '../../data/portals';
import {
  Shield,
  Satellite,
  UserCheck,
  MapPin,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  UserPlus,
  LogIn,
  Sun,
  Moon,
  Leaf,
  Compass,
  Radio,
  FileCheck,
  Layers,
  ChevronRight,
  Wheat,
  Phone,
  Mail,
  User as UserIcon,
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const {
    users,
    loginWithCredentials,
    registerFarmer,
    theme,
    setTheme,
    showNotification,
  } = useApp();

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER_FARMER'>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<UserRole>('LANDOWNER');
  const [emailOrPhone, setEmailOrPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('geonexa2025');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Farmer registration fields
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regVillage, setRegVillage] = useState<string>('Thondamuthur');
  const [regTaluk, setRegTaluk] = useState<string>('Perur');
  const [regDistrict, setRegDistrict] = useState<string>('Coimbatore');
  const [regSurveyNo, setRegSurveyNo] = useState<string>('142/4A');
  const [regPattaNo, setRegPattaNo] = useState<string>('1892');
  const [regAreaAcres, setRegAreaAcres] = useState<string>('3.50');
  const [regLandType, setRegLandType] = useState<string>('WET_AGRICULTURAL');
  const [regCrops, setRegCrops] = useState<string>('Sugarcane, Coconut Palms, Paddy');

  const portalConfig = PORTALS[selectedRole];

  // Quick 1-Click Demo Login handler
  const handleDemoLogin = async (role: UserRole) => {
    setIsSubmitting(true);
    const demoUser = users.find((u) => u.role === role);
    const email = demoUser ? demoUser.email : `${role.toLowerCase()}@bhubharat.gov.in`;

    const ok = await loginWithCredentials(role, email);
    setIsSubmitting(false);
    if (ok) {
      showNotification(`Successfully authenticated as ${demoUser?.name || role} (${role})`, 'success');
      if (onSuccess) onSuccess();
    } else {
      showNotification('Authentication failed. Please retry.', 'error');
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      showNotification('Please enter your email, mobile number, or Patta ID', 'error');
      return;
    }

    setIsSubmitting(true);
    const ok = await loginWithCredentials(selectedRole, emailOrPhone.trim(), password);
    setIsSubmitting(false);
    if (ok) {
      showNotification(`Logged in successfully to ${selectedRole} portal`, 'success');
      if (onSuccess) onSuccess();
    } else {
      showNotification('Authentication failed. Please verify your credentials or select another portal.', 'error');
    }
  };

  const handleFarmerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) {
      showNotification('Farmer name and mobile phone are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await registerFarmer({
        name: regName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim() || undefined,
        village: regVillage,
        taluk: regTaluk,
        district: regDistrict,
        state: 'Tamil Nadu',
        surveyNumber: regSurveyNo.trim() || '142/4A',
        pattaNumber: regPattaNo.trim() || '1892',
        areaAcres: parseFloat(regAreaAcres) || 3.5,
        landType: regLandType,
        crops: regCrops.split(',').map((c) => c.trim()),
      });

      setIsSubmitting(false);
      if (ok) {
        showNotification(`Welcome, ${regName}! Your farmer account & land holding are registered.`, 'success');
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setIsSubmitting(false);
      showNotification(err.message || 'Registration failed', 'error');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Top Bar: Emblem, Title, Theme Switcher */}
      <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20">
            <Satellite className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              GeoNexa
            </span>
          </div>
        </div>

        {/* Live Network Pill & Standard Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">SoI CORS Network Online</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600 dark:text-slate-300">±1.4cm Fix</span>
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Standard Light Theme' : 'Switch to Standard Dark Theme'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content: Hero Banner + Grid of Portals + Auth Form */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Section */}
        <div className="portal-hero-banner rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl text-white relative overflow-hidden">
          <div className="max-w-3xl space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-mono font-bold">
              <Shield className="w-3.5 h-3.5" />
              AUTHENTICATED ACCESS GATEWAY
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Single Unified Cadastral Platform for Farmers, Surveyors & Revenue Officials
            </h1>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              Login to your designated portal with role-based access control. Farmers can view verified Patta boundaries & request GNSS resurveys. Licensed field officers operate centimeter RTK rovers, and Super Admins manage the national cadastral registry.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 backdrop-blur-md border border-white/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Multi-Constellation GNSS (NavIC / GPS / GLONASS / Galileo)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 backdrop-blur-md border border-white/20">
              <Radio className="w-3.5 h-3.5 text-cyan-300" />
              <span>RTCM 3.2 MSM4 Geodetic Streams</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 backdrop-blur-md border border-white/20">
              <FileCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Form-IV Digital Legal Certification</span>
            </div>
          </div>
        </div>

        {/* Auth Mode Toggle Bar */}
        <div className="flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md inline-flex gap-2">
            <button
              onClick={() => setAuthMode('LOGIN')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                authMode === 'LOGIN'
                  ? 'portal-btn-primary shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Portal Sign In (All Roles)
            </button>
            <button
              onClick={() => {
                setAuthMode('REGISTER_FARMER');
                setSelectedRole('LANDOWNER');
              }}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                authMode === 'REGISTER_FARMER'
                  ? 'portal-btn-primary shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              New Farmer / Citizen Registration
            </button>
          </div>
        </div>

        {/* LOGIN MODE: 4-Portal Grid + Login Panel */}
        {authMode === 'LOGIN' && (
          <div className="space-y-6">
            {/* Step 1: Select Portal */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2">
                  <span>1. Select Designated Portal</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-normal">
                    Role-Based Access
                  </span>
                </h2>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  Click any card to select or 1-Click Demo Login
                </span>
              </div>

              {/* Grid of 4 Persona Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Farmer / Landowner */}
                <div
                  onClick={() => setSelectedRole('LANDOWNER')}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                    selectedRole === 'LANDOWNER'
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        CITIZEN
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Farmer & Landowner</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        View agricultural land parcels, check Patta boundaries, request resurveys & download Form IV.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDemoLogin('LANDOWNER');
                      }}
                      disabled={isSubmitting}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>1-Click Demo Farmer</span>
                    </button>
                  </div>
                </div>

                {/* 2. Field Officer / RTK Surveyor */}
                <div
                  onClick={() => setSelectedRole('SURVEYOR')}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                    selectedRole === 'SURVEYOR'
                      ? 'bg-cyan-50/80 dark:bg-cyan-950/40 border-cyan-500 dark:border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                        <Satellite className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700">
                        FIELD ROVER
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">RTK Field Surveyor</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        Sub-centimeter point capture, CORS NTRIP RTCM streaming, boundary closure & CSV import.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDemoLogin('SURVEYOR');
                      }}
                      disabled={isSubmitting}
                      className="w-full py-2 px-3 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>1-Click Demo Surveyor</span>
                    </button>
                  </div>
                </div>

                {/* 3. Revenue Officer (RDO / Tahsildar) */}
                <div
                  onClick={() => setSelectedRole('OFFICIAL')}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                    selectedRole === 'OFFICIAL'
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                        REVENUE
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Revenue Official (RDO)</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        Verification review queue, encroachment dispute resolution & Form-IV digital seal approval.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDemoLogin('OFFICIAL');
                      }}
                      disabled={isSubmitting}
                      className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>1-Click Demo RDO</span>
                    </button>
                  </div>
                </div>

                {/* 4. Super Admin (Settlement Directorate / IAS) */}
                <div
                  onClick={() => setSelectedRole('ADMIN')}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                    selectedRole === 'ADMIN'
                      ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-500 dark:border-purple-500 ring-2 ring-purple-500/20 shadow-lg'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        <Shield className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                        SUPER ADMIN
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">National Admin Panel</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        Admin-only panel: User & surveyor management, geodetic tolerance parameters & audit logs.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDemoLogin('ADMIN');
                      }}
                      disabled={isSubmitting}
                      className="w-full py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>1-Click Demo Admin</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Login Details Card for Selected Portal */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Selected Portal
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {portalConfig.title}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">
                    Sign in to {portalConfig.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {portalConfig.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Test Account:</span>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin(selectedRole)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quick Fill & Login</span>
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleCustomLogin} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      {selectedRole === 'LANDOWNER' ? 'Mobile Number / Patta ID / Email' : 'Official Email / Badge Number'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        {selectedRole === 'LANDOWNER' ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                      </div>
                      <input
                        type="text"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        placeholder={
                          selectedRole === 'LANDOWNER'
                            ? '+91 94421 11223 or farmer@bhubharat.gov.in'
                            : selectedRole === 'SURVEYOR'
                            ? 'surveyor@bhubharat.gov.in (SURV-RTK-8902)'
                            : selectedRole === 'OFFICIAL'
                            ? 'official@bhubharat.gov.in (REV-OFF-4412)'
                            : 'admin@bhubharat.gov.in (IAS-2012)'
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Password / Access PIN
                      </label>
                      <span className="text-[11px] text-slate-400">Demo default: bhubharat2025</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="portal-btn-primary w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-101 cursor-pointer"
                  >
                    <span>Authenticate & Access {portalConfig.shortTitle}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Portal Features & Access Rights */}
                <div className="bg-slate-50 dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                    <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Authorized Modules in this Portal:</span>
                  </div>

                  <div className="space-y-2">
                    {portalConfig.keyFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    <p>
                      <strong>Access Clearance:</strong>{' '}
                      {selectedRole === 'ADMIN'
                        ? 'Full System Administrator Access (User Licensing, Tolerance Config, Audit Logs)'
                        : selectedRole === 'SURVEYOR'
                        ? 'Field Rover Console, RTK GNSS Logging, CORS Base Stations'
                        : selectedRole === 'OFFICIAL'
                        ? 'Encroachment Hearings, Verification Dossiers, Legal Form IV Signature'
                        : 'Citizen Farmland View, e-Patta & Resurvey Application Access'}
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* REGISTRATION MODE: Farmer / Citizen Registration */}
        {authMode === 'REGISTER_FARMER' && (
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <Wheat className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                    Farmer & Landowner Registration
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Register your agricultural land holding to check your GPS boundaries, view Patta passbook, and request GNSS resurveys.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleFarmerRegister} className="space-y-6">
              {/* Personal Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  1. Farmer / Landholder Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name (as in Patta) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. K. S. Ramasamy Gounder"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Number (for OTP & SMS) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="e.g. +91 94421 11223"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. farmer.ramasamy@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Land Parcel & Patta Details */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  2. Agricultural Farmland & Revenue Records
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Village (Gramam)
                    </label>
                    <input
                      type="text"
                      value={regVillage}
                      onChange={(e) => setRegVillage(e.target.value)}
                      placeholder="Thondamuthur"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Taluk
                    </label>
                    <input
                      type="text"
                      value={regTaluk}
                      onChange={(e) => setRegTaluk(e.target.value)}
                      placeholder="Perur"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      placeholder="Coimbatore"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Survey Number (SF No.)
                    </label>
                    <input
                      type="text"
                      value={regSurveyNo}
                      onChange={(e) => setRegSurveyNo(e.target.value)}
                      placeholder="e.g. 142/4A"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Patta Passbook Number
                    </label>
                    <input
                      type="text"
                      value={regPattaNo}
                      onChange={(e) => setRegPattaNo(e.target.value)}
                      placeholder="e.g. 1892"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Holding Area (in Acres)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={regAreaAcres}
                      onChange={(e) => setRegAreaAcres(e.target.value)}
                      placeholder="3.50"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Land Classification
                    </label>
                    <select
                      value={regLandType}
                      onChange={(e) => setRegLandType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                      <option value="WET_AGRICULTURAL">Wet Land (Nanjai / Canal Irrigated)</option>
                      <option value="DRY_AGRICULTURAL">Dry Land (Punjai / Rainfed)</option>
                      <option value="GARDEN_LAND">Garden Land (Thottam / Well Irrigated)</option>
                      <option value="ORCHARD">Orchard / Plantation (Coconut, Mango)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Standing Crops
                    </label>
                    <input
                      type="text"
                      value={regCrops}
                      onChange={(e) => setRegCrops(e.target.value)}
                      placeholder="Sugarcane, Coconut, Paddy"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Submit & Cancel */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAuthMode('LOGIN')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Back to Portal Sign In
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="portal-btn-primary w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-102 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Farmer Registration & Access My Land Holding</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          GeoNexa Digital Cadastral Infrastructure & Drone Photogrammetry Platform • Survey of India Geodetic Standards • PostGIS Spatial Engine
        </p>
      </footer>
    </div>
  );
};
