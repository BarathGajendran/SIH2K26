import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { SurveyConsole } from './components/survey/SurveyConsole';
import { GisMap } from './components/gis/GisMap';
import { EncroachmentCenter } from './components/encroachments/EncroachmentCenter';
import { VerificationQueue } from './components/verification/VerificationQueue';
import { CorsMonitor } from './components/cors/CorsMonitor';
import { ParcelsList } from './components/parcels/ParcelsList';
import { ReportsView } from './components/reports/ReportsView';
import { DocumentVault } from './components/documents/DocumentVault';
import { FarmerPortalView } from './components/farmer/FarmerPortalView';
import { AdminPanel } from './components/admin/AdminPanel';
import { DroneMappingHub } from './components/drone/DroneMappingHub';
import { AuthScreen } from './components/auth/AuthScreen';
import { DemoSurveyModal } from './components/demo/DemoSurveyModal';
import { PresentationModal } from './components/presentation/PresentationModal';
import { AuthPortalModal } from './components/auth/AuthPortalModal';
import { PlainLanguageGuideModal } from './components/help/PlainLanguageGuideModal';
import { LandParcel, SurveySession } from './types';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Wheat,
  Plane,
  Satellite,
  Map,
  Grid,
  Menu,
} from 'lucide-react';

const MainApp: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedParcel,
    setSelectedParcel,
    notification,
    showNotification,
    setActiveReportSurvey,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isPlainGuideOpen,
    setIsPlainGuideOpen,
    isAuthenticated,
  } = useApp();

  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isPresModalOpen, setIsPresModalOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  const handleStartSurvey = (parcel: LandParcel) => {
    setSelectedParcel(parcel);
    setActiveTab('survey');
  };

  const handleNavigateToMap = (parcel: LandParcel) => {
    setSelectedParcel(parcel);
    setActiveTab('gis');
  };

  const handleViewReport = (survey: SurveySession) => {
    setActiveReportSurvey(survey);
    setActiveTab('reports');
  };

  // If user is not authenticated or explicitly selected the auth page, render AuthScreen
  if (!isAuthenticated || activeTab === 'auth') {
    return (
      <div className="min-h-screen w-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <AuthScreen
          onSuccess={() => {
            // on success, AppContext sets isAuthenticated and activeTab
          }}
        />

        {/* Floating Notification Toast */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
            <div
              className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold backdrop-blur-md ${
                notification.type === 'success'
                  ? 'bg-emerald-900/90 dark:bg-emerald-950/90 border-emerald-500/50 text-white'
                  : notification.type === 'error'
                  ? 'bg-rose-900/90 dark:bg-rose-950/90 border-rose-500/50 text-white'
                  : 'bg-cyan-900/90 dark:bg-cyan-950/90 border-cyan-500/50 text-white'
              }`}
            >
              {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />}
              {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />}
              {notification.type === 'info' && <Info className="w-4 h-4 text-cyan-300 shrink-0" />}
              <span>{notification.message}</span>
              <button
                onClick={() => showNotification('')}
                className="ml-2 text-white/70 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans select-none transition-colors duration-200">
      {/* Top Header */}
      <Header
        onNavigate={(tab) => {
          setActiveTab(tab);
          setIsMobileDrawerOpen(false);
        }}
        onOpenDemo={() => setIsDemoModalOpen(true)}
        onOpenPresentation={() => setIsPresModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
      />

      {/* Body: Sidebar + Main Stage */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Mobile Slide-in Drawer */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
              onClick={() => setIsMobileDrawerOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full shadow-2xl z-10 flex flex-col">
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider font-mono text-emerald-600 dark:text-emerald-400">
                  GeoNexa Navigation
                </span>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  activeTab={activeTab}
                  setActiveTab={(t) => {
                    setActiveTab(t);
                    setIsMobileDrawerOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 h-full overflow-hidden relative bg-slate-50 dark:bg-slate-950 pb-14 md:pb-0">
          {activeTab === 'farmer' && (
            <FarmerPortalView
              onNavigateToMap={handleNavigateToMap}
              onNavigateToDocuments={() => setActiveTab('documents')}
              onNavigateToReports={() => setActiveTab('reports')}
            />
          )}
          {activeTab === 'drone' && (
            <DroneMappingHub
              onNavigateToMap={() => setActiveTab('gis')}
              onNavigateToVerification={() => setActiveTab('verification')}
            />
          )}
          {activeTab === 'admin' && <AdminPanel />}
          {activeTab === 'dashboard' && <ExecutiveDashboard onNavigate={(t) => setActiveTab(t)} />}
          {activeTab === 'survey' && (
            <SurveyConsole initialParcel={selectedParcel} onViewReport={handleViewReport} />
          )}
          {activeTab === 'gis' && (
            <div className="h-[calc(100vh-61px)] w-full">
              <GisMap />
            </div>
          )}
          {activeTab === 'encroachments' && (
            <EncroachmentCenter onNavigateToMap={(id) => setActiveTab('gis')} />
          )}
          {activeTab === 'verification' && <VerificationQueue onViewReport={handleViewReport} />}
          {activeTab === 'cors' && <CorsMonitor />}
          {activeTab === 'parcels' && (
            <ParcelsList onStartSurvey={handleStartSurvey} onNavigateToMap={handleNavigateToMap} />
          )}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'documents' && <DocumentVault />}
        </main>
      </div>

      {/* Mobile Bottom Quick Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around z-40 px-1 shadow-lg backdrop-blur-md">
        <button
          onClick={() => setActiveTab('farmer')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            activeTab === 'farmer' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Wheat className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Farmland</span>
        </button>

        <button
          onClick={() => setActiveTab('drone')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            activeTab === 'drone' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Plane className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Drone</span>
        </button>

        <button
          onClick={() => setActiveTab('survey')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            activeTab === 'survey' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Satellite className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">RTK Survey</span>
        </button>

        <button
          onClick={() => setActiveTab('gis')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            activeTab === 'gis' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">GIS Map</span>
        </button>

        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-500 dark:text-slate-400"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">All Portals</span>
        </button>
      </div>

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-16 md:bottom-6 right-6 z-50 animate-fade-in">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-emerald-900/90 dark:bg-emerald-950/90 border-emerald-500/50 text-white'
                : notification.type === 'error'
                ? 'bg-rose-900/90 dark:bg-rose-950/90 border-rose-500/50 text-white'
                : 'bg-cyan-900/90 dark:bg-cyan-950/90 border-cyan-500/50 text-white'
            }`}
          >
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />}
            {notification.type === 'info' && <Info className="w-4 h-4 text-cyan-300 shrink-0" />}
            <span>{notification.message}</span>
            <button
              onClick={() => showNotification('')}
              className="ml-2 text-white/70 hover:text-white p-1 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AuthPortalModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <PlainLanguageGuideModal isOpen={isPlainGuideOpen} onClose={() => setIsPlainGuideOpen(false)} />
      <DemoSurveyModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
      <PresentationModal isOpen={isPresModalOpen} onClose={() => setIsPresModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

