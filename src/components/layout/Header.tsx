import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, LandParcel } from '../../types';
import { PORTALS } from '../../data/portals';
import { api } from '../../services/api';
import {
  Satellite,
  Radio,
  Search,
  Layers,
  UserCheck,
  Shield,
  MapPin,
  Sparkles,
  ChevronDown,
  Activity,
  CheckCircle2,
  Sun,
  Moon,
  Leaf,
  HelpCircle,
  LogIn,
  KeyRound,
  Compass,
} from 'lucide-react';

interface HeaderProps {
  onNavigate?: (tab: string) => void;
  onOpenDemo?: () => void;
  onOpenPresentation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onOpenDemo, onOpenPresentation }) => {
  const {
    currentUser,
    switchUserRole,
    theme,
    setTheme,
    gnssState,
    setSelectedParcel,
    setMapViewport,
    setIsPresentationMode,
    setIsDemoModalOpen,
    setIsAuthModalOpen,
    setTargetPortalForAuth,
    setIsPlainGuideOpen,
    showNotification,
    logout,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LandParcel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.globalSearch(searchQuery);
        setSearchResults(res.results || []);
        setIsSearchOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSearchResult = (parcel: LandParcel) => {
    setSelectedParcel(parcel);
    const coords = parcel.geometry.coordinates[0];
    if (coords && coords.length > 0) {
      setMapViewport([coords[0][1], coords[0][0]], 18);
    }
    setIsSearchOpen(false);
    setSearchQuery('');
    if (onNavigate) onNavigate('gis');
    showNotification(`Focused on Survey No. ${parcel.surveyNumber} (${parcel.village})`, 'info');
  };

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Admin (IAS)',
          bg: 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800',
          icon: Shield,
        };
      case 'OFFICIAL':
        return {
          label: 'Revenue Officer (RDO)',
          bg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          icon: UserCheck,
        };
      case 'SURVEYOR':
        return {
          label: 'RTK Field Surveyor',
          bg: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
          icon: Satellite,
        };
      case 'LANDOWNER':
        return {
          label: 'Farmer / Landowner',
          bg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          icon: MapPin,
        };
      default:
        return {
          label: 'Select Portal',
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
          icon: LogIn,
        };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);
  const RoleIcon = roleInfo.icon;

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 sticky top-0 z-40 px-3 sm:px-4 py-2.5 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Branding & Govt Emblem */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-black tracking-tight text-base sm:text-lg text-emerald-600 dark:text-emerald-400 font-mono">
                BHU-BHARAT
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-mono font-bold">
                GNSS / RTK
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700 font-mono">
                🇮🇳 NavIC
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden lg:block">
              Agricultural Land Resurvey, CORS Correction & Encroachment Detection
            </p>
          </div>
        </div>

        {/* Center: Global Search */}
        <div ref={searchRef} className="relative flex-1 max-w-xs md:max-w-sm lg:max-w-md mx-2 hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Survey No (e.g. 142/3A), Farmer, Village..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
            />
            {isSearching && (
              <Activity className="w-3.5 h-3.5 text-emerald-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
            )}
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
              <div className="p-2.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex justify-between">
                <span>Matching Agricultural Parcels</span>
                <span>{searchResults.length} found</span>
              </div>
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectSearchResult(p)}
                  className="w-full text-left p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800/60 flex items-start justify-between gap-2 transition-colors group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-mono">
                        SF {p.surveyNumber}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                        {p.parcelNumber}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          p.status === 'VERIFIED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                            : p.status === 'DISPUTED'
                            ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {p.ownerName} • {p.village}, {p.district}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{p.areaAcres} Ac</span>
                    <p className="text-[10px] text-slate-400 font-mono">{p.areaSqM} m²</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Telemetry, Plain Terms Guide, Theme Switcher, Demo, Role Switcher */}
        <div className="flex items-center gap-2">
          {/* RTK Live Telemetry Pill */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">RTK {gnssState.fixType}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-600 dark:text-slate-300">±{(gnssState.accuracy * 100).toFixed(1)}cm</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
              <Satellite className="w-3 h-3" />
              {gnssState.satelliteCount} Sats
            </span>
          </div>

          {/* Plain Language Guide & Glossary */}
          <button
            onClick={() => setIsPlainGuideOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800/80 transition-all cursor-pointer"
            title="Open Plain Language Guide, Glossary and Area Calculator"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Plain Guide</span>
          </button>

          {/* 1-Click Run Demo Survey */}
          <button
            onClick={() => (onOpenDemo ? onOpenDemo() : setIsDemoModalOpen(true))}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/30 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            title="Launch Automated 1-Click GNSS Survey Demonstration"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span className="hidden sm:inline">Demo Survey</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Theme Selector Button & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Change Visual Theme"
            >
              {theme === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
              {theme === 'dark' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
              {theme === 'emerald' && <Leaf className="w-3.5 h-3.5 text-emerald-500" />}
              {theme === 'saffron' && <Sparkles className="w-3.5 h-3.5 text-amber-600" />}
              {theme === 'ocean' && <Compass className="w-3.5 h-3.5 text-cyan-500" />}
              <span className="hidden md:inline capitalize">{theme}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isThemeDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1.5 animate-fade-in">
                <button
                  onClick={() => {
                    setTheme('light');
                    setIsThemeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                    theme === 'light' ? 'bg-amber-50 text-amber-700 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light Clean</span>
                </button>
                <button
                  onClick={() => {
                    setTheme('emerald');
                    setIsThemeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                    theme === 'emerald' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Agri Emerald</span>
                </button>
                <button
                  onClick={() => {
                    setTheme('saffron');
                    setIsThemeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                    theme === 'saffron' ? 'bg-amber-100 text-amber-800 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Bharat Saffron</span>
                </button>
                <button
                  onClick={() => {
                    setTheme('ocean');
                    setIsThemeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                    theme === 'ocean' ? 'bg-cyan-50 text-cyan-700 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Ocean Azure</span>
                </button>
                <button
                  onClick={() => {
                    setTheme('dark');
                    setIsThemeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                    theme === 'dark' ? 'bg-indigo-950 text-indigo-300 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Night Satellite</span>
                </button>
              </div>
            )}
          </div>

          {/* Portal Authentication & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${roleInfo.bg}`}
            >
              <RoleIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{roleInfo.label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 animate-fade-in text-slate-900 dark:text-slate-100">
                <div className="px-3 py-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>Switch Stakeholder Portal</span>
                  <button
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Auth Hub</span>
                  </button>
                </div>

                <div className="py-1 space-y-1">
                  <button
                    onClick={() => {
                      switchUserRole('LANDOWNER');
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      currentUser?.role === 'LANDOWNER'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold">Citizen Farmer & Landowner</div>
                        <div className="text-[10px] text-slate-400 font-normal">Patta, boundary checks & disputes</div>
                      </div>
                    </div>
                    {currentUser?.role === 'LANDOWNER' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>

                  <button
                    onClick={() => {
                      switchUserRole('SURVEYOR');
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      currentUser?.role === 'SURVEYOR'
                        ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-900/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                        <Satellite className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold">Licensed RTK Surveyor</div>
                        <div className="text-[10px] text-slate-400 font-normal">Live GNSS rover & CORS corrections</div>
                      </div>
                    </div>
                    {currentUser?.role === 'SURVEYOR' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />}
                  </button>

                  <button
                    onClick={() => {
                      switchUserRole('OFFICIAL');
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      currentUser?.role === 'OFFICIAL'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <UserCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold">Revenue Officer (RDO)</div>
                        <div className="text-[10px] text-slate-400 font-normal">Verification queue & Form IV sealing</div>
                      </div>
                    </div>
                    {currentUser?.role === 'OFFICIAL' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />}
                  </button>

                  <button
                    onClick={() => {
                      switchUserRole('ADMIN');
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      currentUser?.role === 'ADMIN'
                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold">System Administrator</div>
                        <div className="text-[10px] text-slate-400 font-normal">National CORS towers & audit logs</div>
                      </div>
                    </div>
                    {currentUser?.role === 'ADMIN' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <button
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Switch Portal / Register</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      logout();
                    }}
                    className="w-full py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 rotate-180" />
                    <span>Log Out (Secure Exit)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
