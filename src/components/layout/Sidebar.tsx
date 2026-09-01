import React from 'react';
import { useApp } from '../../context/AppContext';
import { PORTALS } from '../../data/portals';
import {
  Map,
  Satellite,
  LayoutDashboard,
  AlertOctagon,
  CheckSquare,
  Radio,
  Landmark,
  FileText,
  FolderLock,
  ShieldCheck,
  Shield,
  KeyRound,
  Sparkles,
  HelpCircle,
  Wheat,
  LogOut,
  Sliders,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentUser,
    encroachments,
    dashboardStats,
    setIsAuthModalOpen,
    setIsPlainGuideOpen,
    logout,
  } = useApp();

  const unresolvedEncroachmentsCount = encroachments.filter(
    (e) => e.status === 'DETECTED' || e.status === 'UNDER_INVESTIGATION' || e.status === 'NOTICE_ISSUED'
  ).length;

  const pendingVerificationCount = dashboardStats?.pendingVerifications || 1;
  const currentPortal = currentUser ? PORTALS[currentUser.role] : PORTALS.LANDOWNER;

  const navItems = [
    // Farmer / Citizen Portal
    {
      id: 'farmer',
      label: 'My Farmland & e-Patta',
      icon: Wheat,
      description: 'Farmer holdings & resurvey requests',
      badge: currentUser?.role === 'LANDOWNER' ? 'CITIZEN' : undefined,
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    },
    // Surveyor Live RTK
    {
      id: 'survey',
      label: 'Live RTK Field Survey',
      icon: Satellite,
      description: 'GNSS rover & 1.4cm point capture',
      badge: currentUser?.role === 'SURVEYOR' ? 'ROVER' : 'LIVE',
      badgeColor: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700',
    },
    // Official Verification
    {
      id: 'verification',
      label: 'Official Verification Queue',
      icon: CheckSquare,
      description: 'RDO review queue & Form IV seal',
      badge: pendingVerificationCount > 0 ? `${pendingVerificationCount} Review` : undefined,
      badgeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    },
    // Admin Panel
    {
      id: 'admin',
      label: 'National Admin Panel',
      icon: Shield,
      description: 'User licensing & tolerance engine',
      badge: currentUser?.role === 'ADMIN' ? 'IAS' : 'SECURE',
      badgeColor: 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    },
    // General Modules
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      description: 'Analytics, trends & live metrics',
    },
    {
      id: 'gis',
      label: 'GIS Map Studio',
      icon: Map,
      description: 'Satellite maps & boundary layers',
    },
    {
      id: 'parcels',
      label: 'Land Parcels Catalog',
      icon: Landmark,
      description: 'Agricultural plots, Patta details',
    },
    {
      id: 'encroachments',
      label: 'Encroachments & Disputes',
      icon: AlertOctagon,
      description: 'Boundary overlap & dispute alerts',
      badge: unresolvedEncroachmentsCount > 0 ? `${unresolvedEncroachmentsCount} Alerts` : undefined,
      badgeColor: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700 animate-pulse',
    },
    {
      id: 'cors',
      label: 'CORS & NTRIP Network',
      icon: Radio,
      description: 'SoI Base stations, RTCM 3.2',
    },
    {
      id: 'reports',
      label: 'Survey Dossier & Reports',
      icon: FileText,
      description: 'Govt Form IV legal certificates',
    },
    {
      id: 'documents',
      label: 'Document Vault',
      icon: FolderLock,
      description: 'Patta, FMB sketches & RINEX',
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-61px)] select-none shrink-0 transition-colors">
      {/* Navigation list */}
      <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono flex items-center justify-between">
          <span>Cadastral Portals & Modules</span>
          <button
            onClick={() => setIsPlainGuideOpen(true)}
            className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 lowercase font-sans text-[10px] cursor-pointer"
          >
            <HelpCircle className="w-2.5 h-2.5" />
            <span>guide</span>
          </button>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all group cursor-pointer ${
                isActive
                  ? 'portal-nav-active font-bold shadow-xs border'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-current' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                  }`}
                />
                <div className="truncate">
                  <div className="text-xs truncate font-semibold">{item.label}</div>
                  <div className="text-[10px] opacity-75 truncate">{item.description}</div>
                </div>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold border ml-2 shrink-0 ${
                    item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Persona Profile Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-xs shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {currentUser?.name || 'Authenticated User'}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate font-semibold">
                {currentPortal?.shortTitle || 'Authenticated Portal'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="py-1.5 px-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <KeyRound className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Switch Role</span>
          </button>

          <button
            onClick={() => logout()}
            className="py-1.5 px-2 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <LogOut className="w-3 h-3 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
