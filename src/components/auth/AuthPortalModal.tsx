import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PORTALS } from '../../data/portals';
import { UserRole, PortalInfo } from '../../types';
import {
  Shield,
  Satellite,
  UserCheck,
  MapPin,
  CheckCircle2,
  Lock,
  Smartphone,
  KeyRound,
  FileText,
  Sparkles,
  X,
  ArrowRight,
  ChevronRight,
  LogOut,
  UserPlus,
  RefreshCw,
  BadgeCheck,
  Building,
  HelpCircle,
} from 'lucide-react';

interface AuthPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPortal?: UserRole | null;
}

export const AuthPortalModal: React.FC<AuthPortalModalProps> = ({
  isOpen,
  onClose,
  targetPortal = null,
}) => {
  const {
    currentUser,
    users,
    switchUserRole,
    loginWithCredentials,
    logout,
    showNotification,
    setActiveTab,
    setIsPlainGuideOpen,
  } = useApp();

  const [selectedPortal, setSelectedPortal] = useState<UserRole>(targetPortal || currentUser?.role || 'LANDOWNER');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'OTP' | 'REGISTER'>('LOGIN');

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Register Form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('LANDOWNER');
  const [regOrg, setRegOrg] = useState('');

  if (!isOpen) return null;

  const currentPortalInfo: PortalInfo = PORTALS[selectedPortal] || PORTALS.LANDOWNER;

  const getPortalIcon = (role: UserRole) => {
    switch (role) {
      case 'LANDOWNER':
        return MapPin;
      case 'SURVEYOR':
        return Satellite;
      case 'OFFICIAL':
        return UserCheck;
      case 'ADMIN':
        return Shield;
      default:
        return Shield;
    }
  };

  const handleSendOtp = () => {
    if (!identifier) {
      showNotification('Please enter your registered mobile number or Patta number', 'error');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsOtpSent(true);
      setOtpCode('849201'); // Auto-filled for frictionless user test
      showNotification('Government OTP code sent: 849201 (Auto-filled for testing)', 'success');
    }, 600);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Login with selected portal
      const success = await loginWithCredentials(selectedPortal, identifier || currentPortalInfo.demoUser.email, password || otpCode);
      if (success) {
        showNotification(`Welcome to ${currentPortalInfo.title}!`, 'success');
        // Auto-navigate to portal's primary tab
        if (selectedPortal === 'LANDOWNER') setActiveTab('parcels');
        else if (selectedPortal === 'SURVEYOR') setActiveTab('survey');
        else if (selectedPortal === 'OFFICIAL') setActiveTab('verification');
        else if (selectedPortal === 'ADMIN') setActiveTab('dashboard');
        onClose();
      }
    } catch (err: any) {
      showNotification(err.message || 'Login failed. Please verify credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantDemoLogin = async (role: UserRole) => {
    setIsLoading(true);
    setSelectedPortal(role);
    try {
      await switchUserRole(role);
      const portal = PORTALS[role];
      showNotification(`Signed in as ${portal.demoUser.name} (${portal.shortTitle})`, 'success');
      if (role === 'LANDOWNER') setActiveTab('parcels');
      else if (role === 'SURVEYOR') setActiveTab('survey');
      else if (role === 'OFFICIAL') setActiveTab('verification');
      else if (role === 'ADMIN') setActiveTab('dashboard');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 my-auto flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold font-mono text-sm shadow-md shadow-emerald-600/30">
              🇮🇳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">GeoNexa Unified Portal Authentication</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700">
                  Role-Based Security
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select your specific stakeholder portal to log in, verify land records, or perform GNSS surveys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body: Portal Selector (Left) + Login Form (Right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          {/* Left Column: 4 Portal Selection Cards (5 cols) */}
          <div className="lg:col-span-5 p-6 bg-slate-50/70 dark:bg-slate-950/50 border-r border-slate-200 dark:border-slate-800 space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Select Stakeholder Portal
              </span>
              <button
                onClick={() => setIsPlainGuideOpen(true)}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>What is this?</span>
              </button>
            </div>

            {(['LANDOWNER', 'SURVEYOR', 'OFFICIAL', 'ADMIN'] as UserRole[]).map((role) => {
              const portal = PORTALS[role];
              const isSelected = selectedPortal === role;
              const isCurrentRole = currentUser?.role === role;
              const Icon = getPortalIcon(role);

              return (
                <div
                  key={role}
                  onClick={() => setSelectedPortal(role)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500'
                      : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        role === 'LANDOWNER'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : role === 'SURVEYOR'
                          ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                          : role === 'OFFICIAL'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {portal.title}
                        </h4>
                        {isCurrentRole && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {portal.tagline}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <span className="text-[10px] text-slate-400 font-mono">Demo: {portal.demoUser.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInstantDemoLogin(role);
                          }}
                          className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>1-Click Demo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Portal-Specific Login Card (7 cols) */}
          <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Selected Portal Summary Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-slate-100 dark:to-slate-900/50 border border-emerald-500/20 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {currentPortalInfo.badge}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {currentPortalInfo.shortTitle}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                    Secure Entry
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {currentPortalInfo.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  💡 <span className="font-semibold text-slate-800 dark:text-slate-200">In plain terms: </span>
                  {currentPortalInfo.plainTermsSummary}
                </p>
              </div>

              {/* Login Mode Switcher */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-4">
                <button
                  type="button"
                  onClick={() => setAuthMode('LOGIN')}
                  className={`pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    authMode === 'LOGIN'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {selectedPortal === 'LANDOWNER' ? 'Patta / Passbook Login' : 'Credentials Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('OTP')}
                  className={`pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    authMode === 'OTP'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Mobile OTP / Aadhaar
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('REGISTER')}
                  className={`pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    authMode === 'REGISTER'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Register New Citizen / Surveyor
                </button>
              </div>

              {/* AUTH FORM 1: STANDARD CREDENTIALS */}
              {authMode === 'LOGIN' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {selectedPortal === 'LANDOWNER'
                        ? 'Patta No. / Email / Mobile'
                        : selectedPortal === 'SURVEYOR'
                        ? 'Surveyor License Badge ID'
                        : selectedPortal === 'OFFICIAL'
                        ? 'Official Revenue ID / Service No.'
                        : 'Administrator Email'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={
                          selectedPortal === 'LANDOWNER'
                            ? 'e.g. PATTA-THOND-142 or farmer@bhubharat.gov.in'
                            : selectedPortal === 'SURVEYOR'
                            ? 'e.g. SURV-RTK-8902 or surveyor@bhubharat.gov.in'
                            : selectedPortal === 'OFFICIAL'
                            ? 'e.g. REV-OFF-4412 or official@bhubharat.gov.in'
                            : 'admin@bhubharat.gov.in'
                        }
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {selectedPortal === 'OFFICIAL' ? 'DSC PIN / Password' : 'Password / Security PIN'}
                      </label>
                      <span className="text-[11px] text-slate-400">Demo PIN: 123456</span>
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Sign In to {currentPortalInfo.shortTitle}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInstantDemoLogin(selectedPortal)}
                      className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-300 dark:border-slate-700"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Instant 1-Click Demo</span>
                    </button>
                  </div>
                </form>
              )}

              {/* AUTH FORM 2: MOBILE OTP / AADHAAR */}
              {authMode === 'OTP' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Registered Mobile Number or 12-Digit Aadhaar
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="+91 94421 11223 or Aadhaar 5481-9921-0021"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isLoading}
                        className="px-4 py-2.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                      >
                        Send OTP
                      </button>
                    </div>
                  </div>

                  {isOtpSent && (
                    <div className="space-y-2 animate-fade-in">
                      <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Enter 6-Digit Government OTP (Auto-filled: 849201)
                      </label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="849201"
                        className="w-full px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 rounded-xl text-center text-base font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-300 focus:outline-none"
                      />
                      <p className="text-[11px] text-slate-400 text-center">
                        Simulated SMS verification for BHU-BHARAT Indian Land Registry
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleLoginSubmit}
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Verify & Enter {currentPortalInfo.shortTitle}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* AUTH FORM 3: REGISTRATION */}
              {authMode === 'REGISTER' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Anand Kumar"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Role Type
                      </label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                      >
                        <option value="LANDOWNER">Farmer / Landowner (Patta Holder)</option>
                        <option value="SURVEYOR">Certified RTK Surveyor</option>
                        <option value="OFFICIAL">Revenue Officer / VAO</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Mobile Phone
                      </label>
                      <input
                        type="text"
                        placeholder="+91 98400 12345"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Village / Organization
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Thondamuthur Village"
                        value={regOrg}
                        onChange={(e) => setRegOrg(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="name@domain.gov.in"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      showNotification(`Account created for ${regName || 'New Citizen'}. You can now sign in!`, 'success');
                      setAuthMode('LOGIN');
                    }}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register & Continue to Portal</span>
                  </button>
                </div>
              )}
            </div>

            {/* Portal Key Features Checklist */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2 font-mono">
                Key Features in {currentPortalInfo.shortTitle}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                {currentPortalInfo.keyFeatures.map((feat, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Logged in as:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {currentUser?.name || 'Guest Explorer'} ({currentUser?.role || 'NONE'})
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  showNotification('Signed out from portal', 'info');
                }}
                className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
