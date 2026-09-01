import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, AuditLog, SpatialToleranceConfig } from '../../types';
import { api } from '../../services/api';
import {
  Shield,
  Users,
  Sliders,
  FileCheck,
  Activity,
  UserPlus,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Search,
  Filter,
  Radio,
  Satellite,
  Compass,
  ArrowRight,
  UserCheck,
  Clock,
  Sparkles,
  KeyRound,
  X,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    currentUser,
    users,
    switchUserRole,
    dashboardStats,
    showNotification,
    setActiveTab,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'USERS' | 'TOLERANCE' | 'AUDIT' | 'DIAGNOSTICS'>('USERS');
  const [userList, setUserList] = useState<User[]>(users);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchUserQuery, setSearchUserQuery] = useState<string>('');
  const [searchAuditQuery, setSearchAuditQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Geodetic Tolerance State
  const [toleranceConfig, setToleranceConfig] = useState<SpatialToleranceConfig>({
    normalToleranceM: 0.5,
    reviewThresholdM: 2.0,
    encroachmentThresholdM: 5.0,
  });

  // New User Licensing Modal State
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserPhone, setNewUserPhone] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('SURVEYOR');
  const [newUserOrg, setNewUserOrg] = useState<string>('Empanelled RTK Cadastral Agency');
  const [newUserBadge, setNewUserBadge] = useState<string>('SURV-RTK-9000');

  // Load audit logs and tolerance config
  useEffect(() => {
    async function loadAdminData() {
      try {
        setIsLoading(true);
        const [auditRes, tolRes, usersRes] = await Promise.all([
          api.getAuditLogs(),
          api.getToleranceConfig(),
          api.getUsers(),
        ]);
        if (auditRes.auditLogs) setAuditLogs(auditRes.auditLogs);
        if (tolRes.config) setToleranceConfig(tolRes.config);
        if (usersRes.users) setUserList(usersRes.users);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (currentUser?.role === 'ADMIN') {
      loadAdminData();
    }
  }, [currentUser]);

  // Handle Save Tolerance
  const handleSaveTolerance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await api.updateToleranceConfig(toleranceConfig);
      showNotification('Geodetic spatial tolerance parameters updated successfully!', 'success');
    } catch (err) {
      showNotification('Failed to update spatial tolerance', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showNotification('Name and email are required', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.createAdminUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        phone: newUserPhone.trim(),
        role: newUserRole,
        organization: newUserOrg,
        badgeNumber: newUserBadge,
      });

      if (res.user) {
        setUserList((prev) => [res.user, ...prev]);
        showNotification(`Licensed new ${newUserRole}: ${newUserName}`, 'success');
        setIsNewUserModalOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPhone('');
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to create user', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Export Audit Logs as JSON
  const handleExportAuditLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bhubharat_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification('System audit trail exported successfully', 'success');
  };

  // RESTRICTED ACCESS SCREEN FOR NON-ADMINS
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="h-[calc(100vh-61px)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-xs font-mono font-bold">
              SUPER ADMIN CLEARANCE REQUIRED
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
              National Cadastral Governance Panel
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This administrative control console is restricted exclusively to authorized Directors & IAS Officers of the Survey and Settlement Department.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Current User:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{currentUser?.name || 'Guest'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Role:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{currentUser?.role || 'NONE'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Required Role:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">ADMIN (IAS)</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => switchUserRole('ADMIN')}
              className="w-full py-3 px-4 rounded-2xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-102 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Switch to Demo Admin (IAS Ramanathan)</span>
            </button>

            <button
              onClick={() => setActiveTab(currentUser?.role === 'LANDOWNER' ? 'farmer' : 'dashboard')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Return to My Designated Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN IS AUTHENTICATED -> RENDER FULL ADMIN PANEL
  const filteredUsers = userList.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      !searchUserQuery.trim() ||
      u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      (u.badgeNumber && u.badgeNumber.toLowerCase().includes(searchUserQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (!searchAuditQuery.trim()) return true;
    const q = searchAuditQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q)
    );
  });

  return (
    <div className="h-[calc(100vh-61px)] overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Banner: Admin Header */}
      <div className="portal-hero-banner p-6 sm:p-8 rounded-3xl border border-white/20 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-mono font-bold">
            <Shield className="w-3.5 h-3.5" />
            NATIONAL SETTLEMENT & CADASTRAL DIRECTIVE PANEL
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Administrator System Console • Dr. Rajeshwari Ramanathan (IAS)
          </h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed">
            Central authority controls: Manage authorized personnel and licensed RTK surveyors, configure geodetic tolerances, audit all spatial ledger entries, and verify nationwide cadastral integrity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => setIsNewUserModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-102 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-purple-600" />
            <span>+ License New Surveyor / Official</span>
          </button>

          <button
            onClick={handleExportAuditLogs}
            className="px-4 py-2.5 rounded-2xl bg-black/30 hover:bg-black/40 text-white border border-white/30 backdrop-blur-md text-xs font-bold flex items-center gap-2 transition-transform hover:scale-102 cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>Export Audit Trail (JSON)</span>
          </button>
        </div>
      </div>

      {/* Admin KPI Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono">Total Users</span>
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">{userList.length}</p>
          <span className="text-[11px] text-slate-500">Farmers, Surveyors & Officers</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono">Mapped Plots</span>
            <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {dashboardStats?.totalParcels || 8}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {dashboardStats?.totalAreaSurveyedAcres || 34.2} Acres Surveyed
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono">CORS Reference</span>
            <Radio className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">4 Online</p>
          <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">RTCM 3.2 MSM4 Active</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono">RTK Accuracy</span>
            <Satellite className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">±1.4 cm</p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Carrier Phase Fixed</span>
        </div>
      </div>

      {/* Admin Module Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('USERS')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeAdminTab === 'USERS'
              ? 'bg-purple-700 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User & Surveyor Licensing ({userList.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('TOLERANCE')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeAdminTab === 'TOLERANCE'
              ? 'bg-purple-700 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Geodetic Tolerance Engine</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('AUDIT')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeAdminTab === 'AUDIT'
              ? 'bg-purple-700 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>System Audit Trail ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('DIAGNOSTICS')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeAdminTab === 'DIAGNOSTICS'
              ? 'bg-purple-700 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Platform Health & API Engine</span>
        </button>
      </div>

      {/* TAB 1: USERS & SURVEYORS MANAGEMENT */}
      {activeAdminTab === 'USERS' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Authorized Personnel & Registered Users Catalog
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grant or revoke surveyor field licenses, assign revenue jurisdiction badges, and review farmer accounts.
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  placeholder="Search user, badge, email..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none"
              >
                <option value="ALL">All Roles ({userList.length})</option>
                <option value="LANDOWNER">Farmers & Landowners</option>
                <option value="SURVEYOR">Licensed RTK Surveyors</option>
                <option value="OFFICIAL">Revenue Officers (RDO)</option>
                <option value="ADMIN">Super Admins</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-400 uppercase font-mono border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">User & Organization</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Badge / Patta ID</th>
                  <th className="p-3">Contact Email / Phone</th>
                  <th className="p-3">Created Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-950/40 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{user.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{user.organization || 'General User'}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                            : user.role === 'OFFICIAL'
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                            : user.role === 'SURVEYOR'
                            ? 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800'
                            : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {user.badgeNumber || 'N/A'}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      <div>{user.email}</div>
                      <div className="text-[10px] text-slate-400">{user.phone}</div>
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          switchUserRole(user.role);
                          showNotification(`Switched active view to ${user.name} (${user.role})`, 'info');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                      >
                        Impersonate / View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GEODETIC TOLERANCE ENGINE */}
      {activeAdminTab === 'TOLERANCE' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              National Geodetic Spatial Tolerance & PostGIS Configuration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure mathematical thresholds for boundary discrepancies, automated encroachment alarms, and RTK carrier-phase ambiguity ratios.
            </p>
          </div>

          <form onSubmit={handleSaveTolerance} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Normal Tolerance */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase font-mono">
                  Normal Tolerance (m)
                </span>
                <span className="font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                  {toleranceConfig.normalToleranceM} m
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={toleranceConfig.normalToleranceM}
                onChange={(e) =>
                  setToleranceConfig((prev) => ({ ...prev, normalToleranceM: parseFloat(e.target.value) }))
                }
                className="w-full accent-emerald-600"
              />
              <p className="text-[11px] text-slate-500">
                Displacements below this limit are considered standard hedge / fence natural variation and classified as a match.
              </p>
            </div>

            {/* Review Threshold */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase font-mono">
                  Review Threshold (m)
                </span>
                <span className="font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                  {toleranceConfig.reviewThresholdM} m
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.2"
                value={toleranceConfig.reviewThresholdM}
                onChange={(e) =>
                  setToleranceConfig((prev) => ({ ...prev, reviewThresholdM: parseFloat(e.target.value) }))
                }
                className="w-full accent-amber-600"
              />
              <p className="text-[11px] text-slate-500">
                Displacements exceeding this flag the survey for mandatory Tahsildar / Revenue Inspector manual review.
              </p>
            </div>

            {/* Encroachment Alarm Threshold */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase font-mono">
                  Encroachment Alarm (m)
                </span>
                <span className="font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                  {toleranceConfig.encroachmentThresholdM} m
                </span>
              </div>
              <input
                type="range"
                min="2.0"
                max="10.0"
                step="0.5"
                value={toleranceConfig.encroachmentThresholdM}
                onChange={(e) =>
                  setToleranceConfig((prev) => ({ ...prev, encroachmentThresholdM: parseFloat(e.target.value) }))
                }
                className="w-full accent-rose-600"
              />
              <p className="text-[11px] text-slate-500">
                Displacements above this threshold trigger automatic Form-IV dispute freezes and notices to adjoining owners.
              </p>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="portal-btn-primary px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Geodetic Tolerance Parameters</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SYSTEM-WIDE AUDIT TRAIL */}
      {activeAdminTab === 'AUDIT' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Cryptographic Cadastral Audit Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tamper-evident chronological record of every survey point capture, boundary alteration, and Form-IV certification.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchAuditQuery}
                onChange={(e) => setSearchAuditQuery(e.target.value)}
                placeholder="Filter audit logs..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor (Role)</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target Entity</th>
                  <th className="p-3">Details / Audit Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-950/40">
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                      {log.userName} ({log.userRole})
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {log.entityType} ({log.entityId})
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-sans text-xs">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PLATFORM HEALTH & DIAGNOSTICS */}
      {activeAdminTab === 'DIAGNOSTICS' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              Cadastral Server Runtime & Geodetic Engine Diagnostics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live server telemetry, PostGIS spatial algorithms status, and Survey of India CORS connection diagnostics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">PostGIS Engine</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">ONLINE</span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                Haversine geodesic boundary & polygon intersection verification v3.4 active.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">NTRIP Caster & RTCM</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">PORT 2101 (CONNECTED)</span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                Broadcasting RTCM 3.2 MSM4 multi-frequency corrections at sub-20ms latency.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">API Gateway Latency</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span className="font-bold text-purple-600 dark:text-purple-400">4.2 ms</span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                Express + Vite single-tier microservice architecture.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* License New User Modal */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsNewUserModalOpen(false)}
              className="absolute right-6 top-6 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 rounded-2xl">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  License Official Personnel / Surveyor
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Register empanelled RTK surveyor or revenue divisional officer
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none"
                >
                  <option value="SURVEYOR">Licensed RTK Surveyor (Field Officer)</option>
                  <option value="OFFICIAL">Revenue Officer (RDO / Tahsildar)</option>
                  <option value="ADMIN">Super Administrator (IAS)</option>
                  <option value="LANDOWNER">Farmer / Landowner</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. S. Venkatesh, RTK Licensed Cadastral Surveyor"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="venkatesh.survey@geonexa.gov.in"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Badge / License No</label>
                  <input
                    type="text"
                    value={newUserBadge}
                    onChange={(e) => setNewUserBadge(e.target.value)}
                    placeholder="SURV-RTK-9012"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department / Organization</label>
                <input
                  type="text"
                  value={newUserOrg}
                  onChange={(e) => setNewUserOrg(e.target.value)}
                  placeholder="Survey & Settlement Directorate, Coimbatore North"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="portal-btn-primary px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Issue License & Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
