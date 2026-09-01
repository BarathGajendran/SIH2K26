import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  ThemeMode,
  LandParcel,
  SurveySession,
  GNSSLiveState,
  CorsStation,
  EncroachmentAlert,
  DashboardStats,
} from '../types';
import { api } from '../services/api';

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  users: User[];
  switchUserRole: (role: UserRole) => Promise<void>;
  loginWithCredentials: (role: UserRole, identifier: string, passwordOrOtp?: string) => Promise<boolean>;
  registerFarmer: (data: {
    name: string;
    phone: string;
    email?: string;
    village?: string;
    taluk?: string;
    district?: string;
    state?: string;
    surveyNumber?: string;
    pattaNumber?: string;
    areaAcres?: number;
    landType?: string;
    crops?: string[];
  }) => Promise<boolean>;
  requestResurvey: (data: {
    parcelId: string;
    reason: string;
    notes?: string;
    preferredDate?: string;
    applicantName?: string;
    applicantPhone?: string;
  }) => Promise<boolean>;
  logout: () => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (val: boolean) => void;
  targetPortalForAuth: UserRole | null;
  setTargetPortalForAuth: (role: UserRole | null) => void;
  isPlainGuideOpen: boolean;
  setIsPlainGuideOpen: (val: boolean) => void;
  parcels: LandParcel[];
  selectedParcel: LandParcel | null;
  setSelectedParcel: (parcel: LandParcel | null) => void;
  activeSurvey: SurveySession | null;
  setActiveSurvey: (survey: SurveySession | null) => void;
  gnssState: GNSSLiveState;
  setGnssState: React.Dispatch<React.SetStateAction<GNSSLiveState>>;
  corsStations: CorsStation[];
  encroachments: EncroachmentAlert[];
  dashboardStats: DashboardStats | null;
  refreshData: () => Promise<void>;
  isPresentationMode: boolean;
  setIsPresentationMode: (val: boolean) => void;
  isDemoModalOpen: boolean;
  setIsDemoModalOpen: (val: boolean) => void;
  activeReportSurvey: SurveySession | null;
  setActiveReportSurvey: (survey: SurveySession | null) => void;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  isGNSSSimulating: boolean;
  setIsGNSSSimulating: (val: boolean) => void;
  mapCenter: [number, number];
  mapZoom: number;
  setMapViewport: (center: [number, number], zoom: number) => void;
}

const defaultGNSSState: GNSSLiveState = {
  latitude: 10.99215,
  longitude: 76.83412,
  altitude: 412.35,
  accuracy: 0.014,
  fixType: 'FIXED',
  satelliteCount: 28,
  hdop: 0.72,
  vdop: 0.94,
  correctionAgeSec: 1.1,
  corsStation: 'Coimbatore Agriculture Univ CORS',
  corsStationCode: 'TN-CORS-CBTR',
  ntripStatus: 'AUTHENTICATED',
  rtcmStatus: 'RECEIVING',
  rtcmPacketsReceived: 4528,
  rtkRatio: 99.8,
  speedKmh: 1.8,
  headingDeg: 84.5,
  activeConstellations: {
    navic: 7,
    gps: 10,
    glonass: 6,
    galileo: 5,
    beidou: 0,
  },
  isSimulated: true,
  batteryLevelPct: 94,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('bhubharat_auth') === 'true';
  });
  const [users, setUsers] = useState<User[]>([]);
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('bhubharat_theme') as ThemeMode;
    return saved || 'light';
  });
  const [activeTab, setActiveTab] = useState<string>(() => {
    const savedRole = localStorage.getItem('bhubharat_saved_role');
    if (savedRole === 'ADMIN') return 'admin';
    if (savedRole === 'SURVEYOR') return 'survey';
    if (savedRole === 'OFFICIAL') return 'verification';
    if (savedRole === 'LANDOWNER') return 'farmer';
    return 'auth';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [targetPortalForAuth, setTargetPortalForAuth] = useState<UserRole | null>(null);
  const [isPlainGuideOpen, setIsPlainGuideOpen] = useState<boolean>(false);
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<LandParcel | null>(null);
  const [activeSurvey, setActiveSurvey] = useState<SurveySession | null>(null);
  const [gnssState, setGnssState] = useState<GNSSLiveState>(defaultGNSSState);
  const [corsStations, setCorsStations] = useState<CorsStation[]>([]);
  const [encroachments, setEncroachments] = useState<EncroachmentAlert[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [activeReportSurvey, setActiveReportSurvey] = useState<SurveySession | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isGNSSSimulating, setIsGNSSSimulating] = useState<boolean>(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([10.99215, 76.83512]);
  const [mapZoom, setMapZoom] = useState<number>(17);

  // Sync theme to DOM
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('bhubharat_theme', newTheme);
    document.documentElement.classList.remove('dark', 'theme-emerald', 'theme-saffron', 'theme-ocean');
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'emerald') {
      document.documentElement.classList.add('theme-emerald');
    } else if (newTheme === 'saffron') {
      document.documentElement.classList.add('theme-saffron');
    } else if (newTheme === 'ocean') {
      document.documentElement.classList.add('theme-ocean');
    }
  };

  useEffect(() => {
    setTheme(theme);
  }, []);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  }, []);

  const setMapViewport = useCallback((center: [number, number], zoom: number) => {
    setMapCenter(center);
    setMapZoom(zoom);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [parcelsRes, corsRes, encRes, statsRes] = await Promise.all([
        api.getParcels(),
        api.getCorsStations(),
        api.getEncroachments(),
        api.getDashboardStats(),
      ]);

      if (parcelsRes.parcels) {
        setParcels(parcelsRes.parcels);
        if (!selectedParcel && parcelsRes.parcels.length > 0) {
          setSelectedParcel(parcelsRes.parcels[0]);
        }
      }
      if (corsRes.stations) setCorsStations(corsRes.stations);
      if (encRes.encroachments) setEncroachments(encRes.encroachments);
      if (statsRes.stats) setDashboardStats(statsRes.stats);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, [selectedParcel]);

  // Load users & initial session
  useEffect(() => {
    async function init() {
      try {
        const usersRes = await api.getUsers();
        if (usersRes.users) {
          setUsers(usersRes.users);
          const savedRole = localStorage.getItem('bhubharat_saved_role');
          const defaultUser = usersRes.users.find((u) => u.role === savedRole) || usersRes.users.find((u) => u.role === 'LANDOWNER') || usersRes.users[0];
          setCurrentUser(defaultUser);
        }
        await refreshData();
      } catch (err) {
        console.error('Init error:', err);
      }
    }
    init();
  }, [refreshData]);

  // Live GNSS polling / jitter simulation
  useEffect(() => {
    if (!isGNSSSimulating) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.getGNSSStatus();
        if (res.gnss) {
          setGnssState((prev) => ({
            ...res.gnss,
            latitude: res.gnss.latitude,
            longitude: res.gnss.longitude,
          }));
        }
      } catch (e) {
        // quiet fallback
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isGNSSSimulating]);

  const getRoleDefaultTab = (role: UserRole): string => {
    switch (role) {
      case 'ADMIN':
        return 'admin';
      case 'SURVEYOR':
        return 'survey';
      case 'OFFICIAL':
        return 'verification';
      case 'LANDOWNER':
        return 'farmer';
      default:
        return 'dashboard';
    }
  };

  const switchUserRole = async (role: UserRole) => {
    const user = users.find((u) => u.role === role);
    if (user) {
      try {
        await api.login(user.email, user.role);
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('bhubharat_auth', 'true');
        localStorage.setItem('bhubharat_saved_role', role);
        setActiveTab(getRoleDefaultTab(role));
        showNotification(`Active portal switched to ${user.name} (${user.role})`, 'success');
      } catch (e) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setActiveTab(getRoleDefaultTab(role));
      }
    }
  };

  const loginWithCredentials = async (role: UserRole, identifier: string, passwordOrOtp?: string): Promise<boolean> => {
    try {
      const res = await api.login(identifier, role);
      if (res.user) {
        setCurrentUser(res.user);
        setIsAuthenticated(true);
        localStorage.setItem('bhubharat_auth', 'true');
        localStorage.setItem('bhubharat_saved_role', res.user.role);
        setActiveTab(getRoleDefaultTab(res.user.role));
        return true;
      }
      return false;
    } catch (err) {
      // Fallback to local user
      const user = users.find((u) => u.role === role) || users[0];
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('bhubharat_auth', 'true');
        localStorage.setItem('bhubharat_saved_role', user.role);
        setActiveTab(getRoleDefaultTab(user.role));
        return true;
      }
      return false;
    }
  };

  const registerFarmer = async (data: {
    name: string;
    phone: string;
    email?: string;
    village?: string;
    taluk?: string;
    district?: string;
    state?: string;
    surveyNumber?: string;
    pattaNumber?: string;
    areaAcres?: number;
    landType?: string;
    crops?: string[];
  }): Promise<boolean> => {
    try {
      const res = await api.registerFarmer(data);
      if (res.user) {
        setCurrentUser(res.user);
        setUsers((prev) => [res.user, ...prev]);
        if (res.parcel) {
          setParcels((prev) => [res.parcel, ...prev]);
          setSelectedParcel(res.parcel);
        }
        setIsAuthenticated(true);
        localStorage.setItem('bhubharat_auth', 'true');
        localStorage.setItem('bhubharat_saved_role', 'LANDOWNER');
        setActiveTab('farmer');
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Registration failed:', err);
      throw err;
    }
  };

  const requestResurvey = async (data: {
    parcelId: string;
    reason: string;
    notes?: string;
    preferredDate?: string;
    applicantName?: string;
    applicantPhone?: string;
  }): Promise<boolean> => {
    try {
      const res = await api.requestFarmerResurvey(data);
      if (res.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to request resurvey:', err);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('bhubharat_auth');
    localStorage.removeItem('bhubharat_saved_role');
    setActiveTab('auth');
    showNotification('Signed out securely. Please log in to access your portal.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        setIsAuthenticated,
        users,
        switchUserRole,
        loginWithCredentials,
        registerFarmer,
        requestResurvey,
        logout,
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        isAuthModalOpen,
        setIsAuthModalOpen,
        targetPortalForAuth,
        setTargetPortalForAuth,
        isPlainGuideOpen,
        setIsPlainGuideOpen,
        parcels,
        selectedParcel,
        setSelectedParcel,
        activeSurvey,
        setActiveSurvey,
        gnssState,
        setGnssState,
        corsStations,
        encroachments,
        dashboardStats,
        refreshData,
        isPresentationMode,
        setIsPresentationMode,
        isDemoModalOpen,
        setIsDemoModalOpen,
        activeReportSurvey,
        setActiveReportSurvey,
        notification,
        showNotification,
        isGNSSSimulating,
        setIsGNSSSimulating,
        mapCenter,
        mapZoom,
        setMapViewport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

