/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Users,
  Trash2,
  Search,
  Filter,
  Download,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Building2,
  Activity,
  X,
  Eye,
  EyeOff,
  ChevronRight,
  HelpCircle,
  LogOut,
  Info,
  Radio,
  FileText,
} from 'lucide-react';
import {
  UserProfile,
  fetchAllUsers,
  deleteUserProfile,
  saveUserProfile,
  ADMIN_CREDENTIALS,
  ADMIN_EMAIL,
  isAdminUser,
} from '../services/firebase';
import { getAllDivisions, getZillasByDivision, getUpazilasByZilla } from '../data/bangladeshLocations';
import { useLanguage } from '../context/LanguageContext';

interface AdminPanelProps {
  currentUserProfile: UserProfile | null;
  onProfileUpdated?: (profile: UserProfile) => void;
  onNavigateTab?: (tab: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUserProfile,
  onProfileUpdated,
  onNavigateTab,
}) => {
  const { t } = useLanguage();

  // Admin authentication state
  const isSuperAdminLoggedIn = isAdminUser(currentUserProfile?.email);
  const [adminEmailInput, setAdminEmailInput] = useState('sohanfardin546@gmail.com');
  const [adminPasswordInput, setAdminPasswordInput] = useState('7642625274');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Users data state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Modal states
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [userToInspect, setUserToInspect] = useState<UserProfile | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userToEditRole, setUserToEditRole] = useState<UserProfile | null>(null);

  // New user form state
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserProfile['role']>('citizen');
  const [newDivision, setNewDivision] = useState('Dhaka');
  const [newZilla, setNewZilla] = useState('Dhaka');
  const [newUpazila, setNewUpazila] = useState('Mirpur');

  // Load users list
  const loadUsersList = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (e) {
      console.error('Failed to load users list', e);
      showToast('error', 'Failed to retrieve user registry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsersList();
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Admin Login Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const emailClean = adminEmailInput.trim().toLowerCase();
    const passClean = adminPasswordInput.trim();

    if (emailClean === ADMIN_CREDENTIALS.email.toLowerCase() && passClean === ADMIN_CREDENTIALS.password) {
      const adminProfile: UserProfile = {
        uid: 'admin_sohan_root',
        email: ADMIN_CREDENTIALS.email,
        displayName: 'Sohanur Rahman (Super Admin)',
        division: 'Dhaka',
        zilla: 'Dhaka',
        upazila: 'Mirpur',
        locationName: 'Mirpur (Dhaka, Dhaka)',
        lat: 23.8041,
        lon: 90.3687,
        role: 'super_admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        authProvider: 'email',
      };

      saveUserProfile(adminProfile);
      onProfileUpdated?.(adminProfile);
      setAuthSuccess('Authenticated as Super Administrator successfully.');
      showToast('success', 'Admin Command Center unlocked.');
      loadUsersList();
    } else {
      setAuthError('Invalid Admin credentials. Please check email and password.');
    }
  };

  // Quick prefill admin credentials button
  const handleQuickPrefill = () => {
    setAdminEmailInput(ADMIN_CREDENTIALS.email);
    setAdminPasswordInput(ADMIN_CREDENTIALS.password);
  };

  // Delete User Handler
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    if (userToDelete.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      showToast('error', 'The Super Administrator root account cannot be deleted.');
      setUserToDelete(null);
      return;
    }

    try {
      await deleteUserProfile(userToDelete.uid);
      setUsers((prev) => prev.filter((u) => u.uid !== userToDelete.uid));
      showToast('success', `Account for "${userToDelete.displayName || userToDelete.email}" was permanently deleted.`);
      setUserToDelete(null);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete user account.');
    }
  };

  // Add New User Handler
  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName.trim() || !newEmail.trim()) {
      showToast('error', 'Please provide a full name and email address.');
      return;
    }

    const newUserObj: UserProfile = {
      uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: newEmail.trim().toLowerCase(),
      displayName: newDisplayName.trim(),
      division: newDivision,
      zilla: newZilla,
      upazila: newUpazila,
      locationName: `${newUpazila} (${newZilla}, ${newDivision})`,
      lat: 23.8041,
      lon: 90.3687,
      role: newRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      authProvider: 'admin_provisioned',
    };

    await saveUserProfile(newUserObj);
    setUsers((prev) => [newUserObj, ...prev.filter((u) => u.email.toLowerCase() !== newUserObj.email.toLowerCase())]);
    setIsAddUserModalOpen(false);
    setNewDisplayName('');
    setNewEmail('');
    showToast('success', `User account for ${newUserObj.displayName} created successfully.`);
  };

  // Update Role Handler
  const handleSaveUpdatedRole = async (targetRole: UserProfile['role']) => {
    if (!userToEditRole) return;
    const updated = { ...userToEditRole, role: targetRole, updatedAt: new Date().toISOString() };
    await saveUserProfile(updated);
    setUsers((prev) => prev.map((u) => (u.uid === updated.uid ? updated : u)));
    showToast('success', `Role updated to "${targetRole}" for ${updated.displayName || updated.email}.`);
    setUserToEditRole(null);
  };

  // Export Users CSV
  const handleExportCSV = () => {
    if (users.length === 0) return;
    const headers = ['UID', 'DisplayName', 'Email', 'Role', 'Division', 'Zilla', 'Upazila', 'Status', 'AuthProvider', 'CreatedAt'];
    const rows = users.map((u) => [
      `"${u.uid}"`,
      `"${u.displayName || ''}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.division || ''}"`,
      `"${u.zilla || ''}"`,
      `"${u.upazila || ''}"`,
      `"${u.status || 'active'}"`,
      `"${u.authProvider || 'email'}"`,
      `"${u.createdAt || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nagarshield_users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('info', 'User records exported to CSV.');
  };

  // Filtered and searched users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !searchQuery.trim() ||
        (u.displayName && u.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.upazila && u.upazila.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.zilla && u.zilla.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.division && u.division.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.uid && u.uid.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchRole =
        roleFilter === 'all' ||
        (roleFilter === 'admin' && (u.role === 'super_admin' || isAdminUser(u.email))) ||
        (roleFilter === 'planner' && (u.role === 'urban_planner' || u.role === 'planner')) ||
        (roleFilter === 'responder' && (u.role === 'emergency_responder' || u.role === 'emergency_officer')) ||
        (roleFilter === 'researcher' && u.role === 'researcher') ||
        (roleFilter === 'citizen' && u.role === 'citizen');

      const matchDivision = divisionFilter === 'all' || u.division === divisionFilter;

      return matchSearch && matchRole && matchDivision;
    });
  }, [users, searchQuery, roleFilter, divisionFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const planners = users.filter((u) => u.role === 'urban_planner' || u.role === 'planner').length;
    const responders = users.filter((u) => u.role === 'emergency_responder' || u.role === 'emergency_officer').length;
    const citizens = users.filter((u) => u.role === 'citizen').length;
    const researchers = users.filter((u) => u.role === 'researcher').length;
    const uniqueDivisions = new Set(users.map((u) => u.division).filter(Boolean)).size;

    return { total, planners, responders, citizens, researchers, uniqueDivisions };
  }, [users]);

  // Helper for role pill styling
  const getRoleBadge = (user: UserProfile) => {
    if (isAdminUser(user.email) || user.role === 'super_admin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <Sparkles className="w-3 h-3 text-amber-500" /> Super Admin
        </span>
      );
    }
    if (user.role === 'urban_planner' || user.role === 'planner') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          <Building2 className="w-3 h-3 text-emerald-500" /> Urban Planner
        </span>
      );
    }
    if (user.role === 'emergency_responder' || user.role === 'emergency_officer') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
          <ShieldAlert className="w-3 h-3 text-rose-500" /> Emergency Officer
        </span>
      );
    }
    if (user.role === 'researcher') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
          <Activity className="w-3 h-3 text-purple-500" /> Researcher
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
        <Users className="w-3 h-3 text-blue-500" /> Citizen
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-bottom-4 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
              : 'bg-slate-900/90 border-slate-700 text-slate-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toastMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              NagarShield Executive Control Center
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Administrative & User Management Portal
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Super-Administrator command interface for inspecting all registered citizens, urban planners, emergency officers, and managing municipal accounts across all Bangladesh divisions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isSuperAdminLoggedIn ? (
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <div className="text-left">
                  <div className="text-xs text-amber-200/80 font-medium">Logged in as Root Admin</div>
                  <div className="text-sm font-bold truncate max-w-[200px]">{ADMIN_EMAIL}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                <Lock className="w-4 h-4 text-rose-400" />
                Admin Authentication Required
              </div>
            )}

            <button
              onClick={() => loadUsersList()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh User Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Admin Sign-In Gate (Displayed if not currently logged in as Super Admin) */}
      {!isSuperAdminLoggedIn && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                <KeyRound className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Super-Admin Security Authentication
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Please enter the authorized root administrator email and password to access privileged user deletion and municipal control operations.
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{authSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    required
                    placeholder="sohanfardin546@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Admin Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    required
                    placeholder="Enter admin password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleQuickPrefill}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Auto-fill Registered Admin Credentials
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" /> Sign In to Admin Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Total Signups</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">All registered users</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Planners</span>
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.planners}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Urban mobility planners</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Responders</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{stats.responders}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Emergency & Fire officers</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Researchers</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{stats.researchers}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Climate data analysts</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Citizens</span>
            <UserCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.citizens}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Public reporters</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Divisions</span>
            <MapPin className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.uniqueDivisions}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Coverage zones</div>
        </div>
      </div>

      {/* Main Users Table Section */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, upazila, zilla..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="py-2 pl-2.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Super Admin</option>
                <option value="planner">Urban Planner</option>
                <option value="responder">Emergency Officer</option>
                <option value="researcher">Researcher</option>
                <option value="citizen">Citizen</option>
              </select>
            </div>

            {/* Division Filter */}
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="py-2 pl-2.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Divisions</option>
              {getAllDivisions().map((d) => (
                <option key={d} value={d}>
                  {d} Division
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>

            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Provision Account
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 md:px-6">User / Display Name</th>
                <th className="py-3.5 px-4 md:px-6">Email & Provider</th>
                <th className="py-3.5 px-4 md:px-6">Role</th>
                <th className="py-3.5 px-4 md:px-6">Jurisdiction</th>
                <th className="py-3.5 px-4 md:px-6">Registered On</th>
                <th className="py-3.5 px-4 md:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No registered users found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isAdmin = isAdminUser(user.email) || user.role === 'super_admin';
                  return (
                    <tr
                      key={user.uid}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4 md:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-xs ${
                              isAdmin
                                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400/50'
                                : user.role === 'urban_planner' || user.role === 'planner'
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                : user.role === 'emergency_responder' || user.role === 'emergency_officer'
                                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                                : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                            }`}
                          >
                            {user.displayName ? user.displayName.slice(0, 2) : user.email.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{user.displayName || 'Anonymous Citizen'}</span>
                              {isAdmin && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              UID: {user.uid.slice(0, 16)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email & Provider */}
                      <td className="py-3.5 px-4 md:px-6">
                        <div className="space-y-0.5">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{user.email}</div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span className="capitalize">{user.authProvider || 'email'}</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4 md:px-6">{getRoleBadge(user)}</td>

                      {/* Jurisdiction */}
                      <td className="py-3.5 px-4 md:px-6">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {user.upazila || 'Mirpur'}, {user.zilla || 'Dhaka'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 pl-5">
                          {user.division || 'Dhaka'} Division
                        </div>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 md:px-6 text-xs text-slate-500 dark:text-slate-400">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Recent'}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 md:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Info */}
                          <button
                            onClick={() => setUserToInspect(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
                            title="Inspect User Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Role */}
                          <button
                            onClick={() => setUserToEditRole(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                            title="Change Role"
                          >
                            <Shield className="w-4 h-4" />
                          </button>

                          {/* Delete Account */}
                          <button
                            onClick={() => setUserToDelete(user)}
                            disabled={isAdmin}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isAdmin
                                ? 'text-slate-300 dark:text-slate-700 opacity-40 cursor-not-allowed'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                            }`}
                            title={isAdmin ? 'Super Admin cannot be deleted' : 'Delete Account'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Confirm Delete User Account */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete User Account</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Are you sure you want to permanently delete the account for{' '}
                <strong className="text-slate-900 dark:text-white">
                  {userToDelete.displayName || userToDelete.email}
                </strong>
                ?
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1 text-slate-600 dark:text-slate-300 font-mono">
              <div>Email: {userToDelete.email}</div>
              <div>Role: {userToDelete.role}</div>
              <div>Jurisdiction: {userToDelete.locationName || `${userToDelete.upazila}, ${userToDelete.zilla}`}</div>
            </div>

            <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              This action cannot be undone. User access and permissions will be revoked immediately.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-md shadow-rose-600/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Inspect User Details */}
      {userToInspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">User Profile Details</h3>
                  <div className="text-xs text-slate-400 font-mono">UID: {userToInspect.uid}</div>
                </div>
              </div>
              <button
                onClick={() => setUserToInspect(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="text-slate-400 font-medium">Display Name</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{userToInspect.displayName || 'N/A'}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="text-slate-400 font-medium">Email Address</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{userToInspect.email}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="text-slate-400 font-medium">Assigned Role</div>
                <div>{getRoleBadge(userToInspect)}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="text-slate-400 font-medium">Auth Provider</div>
                <div className="text-sm font-semibold capitalize text-slate-900 dark:text-white">{userToInspect.authProvider || 'email'}</div>
              </div>

              <div className="col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="text-slate-400 font-medium">Jurisdiction & Location Coordinates</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {userToInspect.locationName || `${userToInspect.upazila}, ${userToInspect.zilla}, ${userToInspect.division}`}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Latitude: {userToInspect.lat || 23.8041} | Longitude: {userToInspect.lon || 90.3687}
                </div>
              </div>

              <div className="col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="text-slate-400 font-medium">Registration & Activity Timestamps</div>
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  Created: {userToInspect.createdAt ? new Date(userToInspect.createdAt).toLocaleString() : 'N/A'}
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  Last Updated: {userToInspect.updatedAt ? new Date(userToInspect.updatedAt).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setUserToInspect(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Change User Role */}
      {userToEditRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white">Change Account Role</h3>
              <button
                onClick={() => setUserToEditRole(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select new access level for <strong>{userToEditRole.displayName || userToEditRole.email}</strong>:
            </p>

            <div className="space-y-2">
              {[
                { key: 'citizen', label: 'Citizen (Public Safe Routing & Incident Reports)' },
                { key: 'urban_planner', label: 'Urban Planner (Traffic & Metro Operations)' },
                { key: 'emergency_responder', label: 'Emergency Officer (Disaster Triage & Dispatch)' },
                { key: 'researcher', label: 'Researcher (Climate & Resilience Modeling)' },
              ].map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => handleSaveUpdatedRole(r.key as any)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    userToEditRole.role === r.key
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{r.label}</span>
                  {userToEditRole.role === r.key && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Provision / Add New User */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white">Provision User Account</h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Display Name</label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="e.g. Engr. Tanvir Ahmed"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@dhaka.gov.bd"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="citizen">Citizen</option>
                  <option value="urban_planner">Urban Planner</option>
                  <option value="emergency_responder">Emergency Officer</option>
                  <option value="researcher">Researcher</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Division</label>
                  <select
                    value={newDivision}
                    onChange={(e) => {
                      setNewDivision(e.target.value);
                      const z = getZillasByDivision(e.target.value);
                      if (z.length > 0) setNewZilla(z[0]);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {getAllDivisions().map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Upazila / Thana</label>
                  <input
                    type="text"
                    value={newUpazila}
                    onChange={(e) => setNewUpazila(e.target.value)}
                    placeholder="e.g. Mirpur"
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
