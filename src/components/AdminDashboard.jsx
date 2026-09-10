import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Activity,
  Zap,
  FileText,
  Download,
  Search,
  RefreshCw,
  X,
  CheckCircle2,
  Radio,
  Server,
  TrendingUp,
  GraduationCap,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  UserCheck,
  Megaphone,
  BarChart3,
  HardDrive,
  Send,
  Sparkles,
  BookOpen,
  Lock,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';

export default function AdminDashboard({
  isOpen,
  onClose
}) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authAttempts, setAuthAttempts] = useState(0);

  // Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeStatus, setPasswordChangeStatus] = useState(null);

  // Dashboard Tab state
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, ai, reports, system
  const [stats, setStats] = useState(() => analyticsService.getAggregateStats());
  const [users, setUsers] = useState(() => analyticsService.getUsers() || []);
  const [events, setEvents] = useState(() => analyticsService.getEvents() || []);
  const [announcement, setAnnouncement] = useState(() => analyticsService.getAnnouncement());

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUniversity, setFilterUniversity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Announcement Form State
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('info');
  const [isBroadcastSaved, setIsBroadcastSaved] = useState(false);

  // Live Auto-Refresh
  const [isLiveActive, setIsLiveActive] = useState(true);

  const refreshData = () => {
    try {
      setStats(analyticsService.getAggregateStats());
      setUsers(analyticsService.getUsers() || []);
      setEvents(analyticsService.getEvents() || []);
      const ann = analyticsService.getAnnouncement();
      setAnnouncement(ann);
      if (ann?.message && !broadcastMessage) {
        setBroadcastMessage(ann.message);
        setBroadcastType(ann.type || 'info');
      }
    } catch (err) {
      console.warn('Refresh data error:', err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    refreshData();

    if (isLiveActive && isAuthenticated) {
      const interval = setInterval(() => {
        refreshData();
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isOpen, isLiveActive, isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!passwordInput) {
      setAuthError('Tafadhali weka nenosiri.');
      return;
    }

    if (analyticsService.verifyPassword(passwordInput)) {
      setIsAuthenticated(true);
      setAuthError('');
      setPasswordInput('');
      refreshData();
    } else {
      setAuthAttempts(prev => prev + 1);
      setAuthError('Nenosiri si sahihi! Hakikisha una ruhusa ya Admin.');
    }
  };

  const handleChangeMasterPassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordChangeStatus({ success: false, message: 'Nenosiri jipya na uthibitisho havilingani.' });
      return;
    }

    const res = analyticsService.updatePassword(oldPassword, newPassword);
    setPasswordChangeStatus(res);
    if (res.success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordChangeStatus(null), 4000);
    }
  };

  // Filtered users list
  const filteredUsers = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    return list.filter(u => {
      if (!u) return false;
      const matchesSearch = 
        !searchQuery || 
        (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.regNumber && u.regNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.company && u.company.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesUni = filterUniversity === 'ALL' || (u.university && u.university.toUpperCase() === filterUniversity.toUpperCase());
      const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus;

      return matchesSearch && matchesUni && matchesStatus;
    });
  }, [users, searchQuery, filterUniversity, filterStatus]);

  // Unique universities list
  const universitiesList = useMemo(() => {
    const list = Array.isArray(users) ? users.map(u => u?.university).filter(Boolean) : [];
    const unique = Array.from(new Set(list));
    return ['ALL', ...unique];
  }, [users]);

  // Top users by AI token consumption
  const topConsumers = useMemo(() => {
    const list = Array.isArray(users) ? [...users] : [];
    return list.sort((a, b) => (b?.tokensUsed || 0) - (a?.tokensUsed || 0)).slice(0, 5);
  }, [users]);

  const handleToggleStatus = (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'idle' : currentStatus === 'idle' ? 'offline' : 'active';
    analyticsService.updateUserStatus(userId, nextStatus);
    refreshData();
  };

  const handleDeleteUser = (userId, name) => {
    if (window.confirm(`Je, una uhakika unataka kumfuta mwanafunzi "${name || 'huyu'}"?`)) {
      analyticsService.deleteUser(userId);
      refreshData();
    }
  };

  const handleSaveBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    analyticsService.saveAnnouncement({
      active: true,
      type: broadcastType,
      message: broadcastMessage.trim(),
      createdAt: Date.now(),
      author: 'Super Admin'
    });
    setIsBroadcastSaved(true);
    refreshData();
    setTimeout(() => setIsBroadcastSaved(false), 3000);
  };

  const handleExportCSV = () => {
    try {
      const csvData = analyticsService.exportUsersToCSV();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ReportAI_Production_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert('Imeshindwa ku-export CSV');
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('WARNING: Je, una uhakika unataka kufuta rekodi na takwimu ZOTE za mfumo?')) {
      analyticsService.clearAllData();
      refreshData();
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Sasa hivi';
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return `${Math.max(1, diffSec)}s zilizopita`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m zilizopita`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h zilizopita`;
    return `${Math.floor(diffHours / 24)}d zilizopita`;
  };

  if (!isOpen) return null;

  // Render Password Lock Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 font-sans text-slate-100 animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-[#18191c] border border-[#2d2f33] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-[#25272a] transition"
            title="Funga"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Report AI <span className="text-amber-400">Master Admin</span>
            </h2>
            <p className="text-xs text-slate-400">
              Ufikiaji wa mfumo wa usimamizi na takwimu umefungwa. Weka nenosiri la msimamizi kuendelea.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Master Password:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="Weka password..."
                  autoFocus
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#222428] border border-[#333539] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center space-x-2 animate-in shake">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-lg flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Fungua Dashboard</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalUsersCount = stats?.totalUsers || (users?.length || 0);
  const activeNowCount = stats?.activeNow || 0;
  const idleCount = stats?.idleCount || 0;
  const offlineCount = stats?.offlineCount || 0;
  const totalWordsVal = stats?.totalWords || 0;
  const totalPromptsVal = stats?.totalPrompts || 0;
  const totalTokensVal = stats?.totalTokens || 0;
  const totalDocxVal = stats?.totalDocx || 0;
  const costUSDVal = stats?.costUSD || '0.00';
  const costTZSVal = stats?.costTZS || '0';
  const avgVivaScoreVal = stats?.avgVivaScore || 0;
  const uniCountsObj = stats?.uniCounts || {};

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between overflow-hidden select-none font-sans text-slate-100">
      {/* Top Navbar Header */}
      <header className="h-16 px-4 sm:px-8 border-b border-[#2d3034] bg-[#1a1b1d]/95 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Report AI <span className="text-amber-400 font-medium text-xs sm:text-sm">Admin & Analytics</span>
              </h1>
              <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE PRODUCTION</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Usimamizi wa watumiaji, matumizi ya AI, vyuo & takwimu za ripoti
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setIsLiveActive(!isLiveActive)}
            className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              isLiveActive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-[#282a2d] border-[#383a3e] text-slate-400 hover:text-white'
            }`}
            title="Washa/Zima Usawazishaji wa Moja kwa Moja"
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveActive ? 'text-emerald-400 animate-pulse' : ''}`} />
            <span>{isLiveActive ? 'Live Sync' : 'Paused'}</span>
          </button>

          <button
            onClick={refreshData}
            className="p-2 rounded-lg bg-[#282a2d] hover:bg-[#333539] text-slate-300 hover:text-white border border-[#383a3e] transition"
            title="Pakia Data Upya"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition"
            title="Pakua Takwimu Kamili (CSV)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="p-2 rounded-lg bg-[#282a2d] hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-[#383a3e] transition"
            title="Funga Session (Lock)"
          >
            <Lock className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#282a2d] hover:bg-red-500/20 hover:text-red-400 text-slate-400 border border-[#383a3e] hover:border-red-500/30 transition"
            title="Funga Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div className="px-4 sm:px-8 border-b border-[#282a2e] bg-[#161719] flex items-center space-x-1 sm:space-x-2 overflow-x-auto shrink-0 custom-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-3.5 py-3 border-b-2 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-amber-400 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1e2023]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Muhtasari & Takwimu</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-3.5 py-3 border-b-2 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-amber-400 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1e2023]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Watumiaji & Vyuo ({totalUsersCount})</span>
          {activeNowCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              {activeNowCount} Active
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center space-x-2 px-3.5 py-3 border-b-2 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
            activeTab === 'ai'
              ? 'border-amber-400 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1e2023]'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Matumizi ya AI & Tokens</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center space-x-2 px-3.5 py-3 border-b-2 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
            activeTab === 'reports'
              ? 'border-amber-400 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1e2023]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Ripoti & DOCX Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center space-x-2 px-3.5 py-3 border-b-2 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
            activeTab === 'system'
              ? 'border-amber-400 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1e2023]'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Mfumo & Usalama</span>
        </button>
      </div>

      {/* Main Dashboard Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#121315] space-y-6 custom-scrollbar">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Top KPI Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Active Users Right Now */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#1a1b1e] border border-[#282a2e] shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Watumiaji Walio Active
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {activeNowCount}
                  </span>
                  <span className="text-xs text-emerald-400 font-medium flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1 animate-ping" />
                    Online Sasa
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#25272a] flex items-center justify-between text-xs text-slate-400">
                  <span>Jumla: <strong className="text-slate-200">{totalUsersCount}</strong></span>
                  <span>Idle: <strong className="text-amber-400">{idleCount}</strong></span>
                  <span>Offline: <strong className="text-slate-400">{offlineCount}</strong></span>
                </div>
              </div>

              {/* Card 2: AI Prompts & Words Generated */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#1a1b1e] border border-[#282a2e] shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Maneno Yaliyozalishwa
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {totalWordsVal.toLocaleString()}
                  </span>
                  <span className="text-xs text-amber-400 font-medium">Maneno</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#25272a] flex items-center justify-between text-xs text-slate-400">
                  <span>AI Prompts: <strong className="text-slate-200">{totalPromptsVal}</strong></span>
                  <span className="text-slate-400">Avg <strong>{Math.round(totalWordsVal / (totalPromptsVal || 1))}</strong> w/req</span>
                </div>
              </div>

              {/* Card 3: Token Usage & Cost Estimator */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#1a1b1e] border border-[#282a2e] shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Tokens & Gharama
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {totalTokensVal.toLocaleString()}
                  </span>
                  <span className="text-xs text-blue-400 font-medium">Tokens</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#25272a] flex items-center justify-between text-xs text-slate-400">
                  <span>USD: <strong className="text-emerald-400">${costUSDVal}</strong></span>
                  <span>TZS: <strong className="text-slate-200">~{costTZSVal}/=</strong></span>
                </div>
              </div>

              {/* Card 4: Reports & DOCX Exported */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#1a1b1e] border border-[#282a2e] shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    DOCX Zilizopakuliwa
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {totalDocxVal}
                  </span>
                  <span className="text-xs text-purple-400 font-medium">Word Docs</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#25272a] flex items-center justify-between text-xs text-slate-400">
                  <span>Viva Prep Avg: <strong className="text-emerald-400">{avgVivaScoreVal}%</strong></span>
                  <span className="text-slate-400">Submissions</span>
                </div>
              </div>
            </div>

            {/* Middle Section: University Distribution & AI Health Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* University Distribution Card */}
              <div className="p-5 rounded-2xl bg-[#1a1b1e] border border-[#282a2e] shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-amber-400" />
                    <span>Usambazaji wa Vyuo</span>
                  </h3>
                  <span className="text-xs text-slate-400">{Object.keys(uniCountsObj).length} Vyuo</span>
                </div>

                {Object.keys(uniCountsObj).length === 0 ? (
                  <div className="py-6 text-center text-slate-500 text-xs">
                    Hakuna data bado. Data zitaanza kuonekana wanafunzi wanapoanza kuandaa ripoti.
                  </div>
                ) : (
                  <div className="space-y-3 pt-1">
                    {Object.entries(uniCountsObj).map(([uni, count]) => {
                      const percentage = Math.round(((count || 0) / (totalUsersCount || 1)) * 100);
                      return (
                        <div key={uni} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-200">{uni}</span>
                            <span className="text-slate-400">{count} students ({percentage}%)</span>
                          </div>
                          <div className="w-full h-2 bg-[#25272a] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* AI Engine & System Health Status */}
              <div className="p-5 rounded-2xl bg-[#1a1b1e] border border-[#282a2e] shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span>Hali ya AI & Mfumo</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                    OPERATIONAL
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#222428] border border-[#2c2e33] flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">Active Model</div>
                      <div className="text-[11px] text-slate-400">DeepSeek Flash (Official 1M Context API)</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 font-mono text-[11px]">
                      deepseek-flash
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#222428] border border-[#2c2e33] flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">Response Latency</div>
                      <div className="text-[11px] text-slate-400">Direct streaming connection</div>
                    </div>
                    <span className="font-bold text-emerald-400 font-mono text-xs">~1.2s</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#222428] border border-[#2c2e33] flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">System Uptime</div>
                      <div className="text-[11px] text-slate-400">VPS Production Gateway</div>
                    </div>
                    <span className="font-bold text-emerald-400 font-mono text-xs">99.9%</span>
                  </div>
                </div>
              </div>

              {/* Quick Action Broadcast Widget */}
              <div className="p-5 rounded-2xl bg-[#1a1b1e] border border-[#282a2e] shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Megaphone className="w-4 h-4 text-orange-400" />
                    <span>Tangazo la Mfumo (Banner)</span>
                  </h3>
                  {announcement?.active && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-[#222428] border border-[#2e3035] space-y-2">
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{announcement?.message || 'Hakuna tangazo lililochapishwa kwa sasa.'}"
                  </p>
                  {announcement?.createdAt && (
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-[#2a2c30]">
                      <span>Mwandishi: {announcement?.author || 'Admin'}</span>
                      <span>{formatTimeAgo(announcement?.createdAt)}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setActiveTab('system')}
                  className="w-full py-2 px-3 rounded-xl bg-[#282a2d] hover:bg-[#333539] text-xs font-semibold text-amber-400 flex items-center justify-center space-x-1.5 transition border border-[#383a3e]"
                >
                  <span>Dhibiti Tangazo la Wanafunzi</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Section: Real-Time Live Activity Feed */}
            <div className="p-5 rounded-2xl bg-[#1a1b1e] border border-[#282a2e] shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="text-sm font-bold text-white">
                    Shughuli za Watumiaji Papo Hapo (Live Activity Stream)
                  </h3>
                </div>
                <span className="text-xs text-slate-400">{events?.length || 0} matukio</span>
              </div>

              {events?.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Hakuna shughuli bado. Matukio yote yataanza kutiririka hapa live wanafunzi wanapofanya kazi.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(events || []).slice(0, 10).map(evt => (
                    <div
                      key={evt?.id || Math.random()}
                      className="p-3 rounded-xl bg-[#222428] hover:bg-[#282a2e] border border-[#2c2e33] flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                          {evt?.type === 'ai_generation' ? <Sparkles className="w-4 h-4" /> :
                           evt?.type === 'docx_export' ? <Download className="w-4 h-4 text-purple-400" /> :
                           evt?.type === 'logbook_sync' ? <BookOpen className="w-4 h-4 text-blue-400" /> :
                           <UserCheck className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-100">{evt?.userName || 'Mwanafunzi'}</span>
                            <span className="px-1.5 py-0.2 rounded bg-[#333539] text-slate-300 text-[10px] font-mono">
                              {evt?.university || 'DIT'}
                            </span>
                            <span className="text-xs text-amber-400 font-semibold">{evt?.title || ''}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{evt?.description || ''}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                        {evt?.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-[#1e2023] border border-[#333539] text-[10px] font-mono text-slate-300">
                            {evt.badge}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 font-mono">
                          {formatTimeAgo(evt?.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE USERS & DIRECTORY */}
        {activeTab === 'users' && (
          <div className="space-y-5 max-w-7xl mx-auto">
            {/* Filter and Search Controls Bar */}
            <div className="p-4 rounded-2xl bg-[#1a1b1e] border border-[#282a2e] flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tafuta jina, reg no, email, kampuni..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#222428] border border-[#333539] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <select
                  value={filterUniversity}
                  onChange={(e) => setFilterUniversity(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#222428] border border-[#333539] text-xs text-slate-200 focus:outline-none focus:border-amber-400 transition"
                >
                  <option value="ALL">Vyuo Vyote</option>
                  {universitiesList.filter(u => u !== 'ALL').map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#222428] border border-[#333539] text-xs text-slate-200 focus:outline-none focus:border-amber-400 transition"
                >
                  <option value="ALL">Hali Zote</option>
                  <option value="active">Active Now</option>
                  <option value="idle">Idle</option>
                  <option value="offline">Offline</option>
                </select>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center space-x-1.5 transition shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl bg-[#1a1b1e] border border-[#282a2e] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#222428] text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-[#2c2e33]">
                    <tr>
                      <th className="py-3 px-4">Mwanafunzi</th>
                      <th className="py-3 px-4">Chuo & Idara</th>
                      <th className="py-3 px-4">Kampuni ya Field</th>
                      <th className="py-3 px-4">Maendeleo ya Ripoti</th>
                      <th className="py-3 px-4">Matumizi ya AI</th>
                      <th className="py-3 px-4">Hali</th>
                      <th className="py-3 px-4 text-right">Vitendo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#25272a]">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-10 text-center text-slate-500">
                          Hakuna mwanafunzi aliyepatikana kwa sasa.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const progressPct = Math.round(((u?.chaptersCompleted || 0) / 5) * 100);
                        return (
                          <tr key={u.id} className="hover:bg-[#222428]/60 transition group">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || 'Student')}`}
                                  alt={u.name || 'Student'}
                                  className="w-9 h-9 rounded-full object-cover ring-1 ring-amber-500/30 shrink-0"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || 'Student')}`;
                                  }}
                                />
                                <div>
                                  <div className="font-bold text-slate-100 flex items-center space-x-1.5">
                                    <span>{u.name}</span>
                                    {u.role === 'Admin' && (
                                      <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 text-[9px] font-bold">
                                        ADMIN
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-mono">{u.regNumber || u.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-amber-400">{u.university || 'DIT'}</div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[160px]" title={u.department}>
                                {u.department || 'N/A'}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="text-slate-200 font-medium truncate max-w-[170px]" title={u.company}>
                                {u.company || 'N/A'}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                Sup: {u.supervisor || 'N/A'}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-300 font-medium">Sura {u.chaptersCompleted || 0}/5</span>
                                  <span className="text-amber-400 font-bold">{progressPct}%</span>
                                </div>
                                <div className="w-28 h-1.5 bg-[#2a2c30] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                                    style={{ width: `${progressPct}%` }}
                                  />
                                </div>
                                <div className="text-[10px] text-slate-500 flex items-center space-x-2">
                                  <span>Logbook: <strong>{u.logbookWeeksFilled || 0}w</strong></span>
                                  <span>DOCX: <strong>{u.docxExports || 0}</strong></span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-mono text-slate-200 font-semibold">
                                {(u.tokensUsed || 0).toLocaleString()} <span className="text-[10px] text-slate-400 font-sans">tokens</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {u.totalPrompts || 0} maombi • {(u.wordsGenerated || 0).toLocaleString()} words
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <button
                                onClick={() => handleToggleStatus(u.id, u.status)}
                                className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                                  u.status === 'active'
                                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                                    : u.status === 'idle'
                                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                                    : 'bg-slate-500/15 border-slate-500/30 text-slate-400 hover:bg-slate-500/25'
                                }`}
                                title="Bofya kubadili hadhi"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  u.status === 'active' ? 'bg-emerald-400 animate-ping' :
                                  u.status === 'idle' ? 'bg-amber-400' : 'bg-slate-500'
                                }`} />
                                <span className="capitalize">{u.status || 'offline'}</span>
                              </button>
                              <div className="text-[9px] text-slate-500 mt-0.5 font-mono">
                                {formatTimeAgo(u.lastActive)}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => setSelectedStudent(u)}
                                  className="p-1.5 rounded-lg bg-[#282a2e] hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 border border-[#383a3f] transition"
                                  title="Kagua Mwanafunzi"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  className="p-1.5 rounded-lg bg-[#282a2e] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-[#383a3f] transition"
                                  title="Futa Mwanafunzi"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
          </div>
        )}

        {/* TAB 3: AI USAGE */}
        {activeTab === 'ai' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-[#1a1b1e] border border-[#282a2e] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Jumla ya Tokens Zilizotumiwa</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-extrabold text-white font-mono">
                  {totalTokensVal.toLocaleString()}
                </div>
                <p className="text-xs text-slate-400">
                  Wastani wa ~{Math.round(totalTokensVal / (totalPromptsVal || 1))} tokens kwa kila request
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#1a1b1e] border border-[#282a2e] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Gharama Iliyokadiriwa</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                  ${costUSDVal}
                </div>
                <p className="text-xs text-slate-400">
                  Sawa na takriban <strong>TZS {costTZSVal}/=</strong> (Flash Engine API)
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#1a1b1e] border border-[#282a2e] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Mtiririko wa AI (Prompts)</span>
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-3xl font-extrabold text-white font-mono">
                  {totalPromptsVal}
                </div>
                <p className="text-xs text-slate-400">
                  {totalWordsVal.toLocaleString()} maneno yaliyozalishwa
                </p>
              </div>
            </div>

            {/* Top Consumers Ranking */}
            <div className="p-5 rounded-2xl bg-[#1a1b1e] border border-[#282a2e] shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>Wanafunzi Wanaoongoza kwa Matumizi ya AI</span>
                </h3>
              </div>

              {topConsumers.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">
                  Hakuna data za matumizi ya AI bado.
                </div>
              ) : (
                <div className="space-y-3">
                  {topConsumers.map((c, idx) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl bg-[#222428] border border-[#2c2e33] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                          idx === 0 ? 'bg-amber-500 text-black' :
                          idx === 1 ? 'bg-slate-300 text-black' :
                          idx === 2 ? 'bg-amber-700 text-white' : 'bg-[#333539] text-slate-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <img
                          src={c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name || 'Student')}`}
                          alt={c.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-bold text-slate-100 text-xs">{c.name}</div>
                          <div className="text-[11px] text-slate-400">{c.university} • {c.company}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-amber-400 text-xs">
                          {(c.tokensUsed || 0).toLocaleString()} tokens
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {c.totalPrompts || 0} prompts • {(c.wordsGenerated || 0).toLocaleString()} words
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: REPORTS & PIPELINE */}
        {activeTab === 'reports' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="p-5 rounded-2xl bg-[#1a1b1e] border border-[#282a2e] shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span>Hatua za Uandishi wa Ripoti (Chapters 1 hadi 5)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                {[
                  { num: 1, name: 'Chapter 1: Company Overview', color: 'border-blue-500/40 text-blue-400' },
                  { num: 2, name: 'Chapter 2: Technical Duties', color: 'border-amber-500/40 text-amber-400' },
                  { num: 3, name: 'Chapter 3: Skills & Methods', color: 'border-emerald-500/40 text-emerald-400' },
                  { num: 4, name: 'Chapter 4: Technical Gaps', color: 'border-purple-500/40 text-purple-400' },
                  { num: 5, name: 'Chapter 5: Recommendations', color: 'border-rose-500/40 text-rose-400' }
                ].map(chap => {
                  const completedCount = (users || []).filter(u => (u?.chaptersCompleted || 0) >= chap.num).length;
                  const pct = Math.round((completedCount / ((users?.length) || 1)) * 100);

                  return (
                    <div key={chap.num} className={`p-4 rounded-xl bg-[#222428] border ${chap.color} space-y-2`}>
                      <span className="text-[11px] font-bold text-slate-300 block truncate" title={chap.name}>
                        {chap.name}
                      </span>
                      <div className="text-2xl font-extrabold text-white">
                        {completedCount} <span className="text-xs text-slate-400 font-normal">/ {users?.length || 0}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#2c2e33] rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">{pct}% wamekamilisha</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DOCX Download Log */}
            <div className="p-5 rounded-2xl bg-[#1a1b1e] border border-[#282a2e] shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Kumbukumbu ya DOCX Downloads ({totalDocxVal} zilizotolewa)</span>
                </h3>
              </div>

              {(events || []).filter(e => e?.type === 'docx_export').length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">
                  Hakuna ripoti ya DOCX iliyopakuliwa bado.
                </div>
              ) : (
                <div className="space-y-2">
                  {(events || []).filter(e => e?.type === 'docx_export').map(e => (
                    <div key={e.id} className="p-3 rounded-xl bg-[#222428] border border-[#2c2e33] flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-100">{e.userName} ({e.university})</div>
                          <div className="text-[11px] text-slate-400">{e.description}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{formatTimeAgo(e.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM HEALTH, BROADCAST & SECURITY */}
        {activeTab === 'system' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Change Master Password Card */}
            <div className="p-6 rounded-2xl bg-[#1a1b1e] border border-[#282a2e] shadow-lg space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Badilisha Master Password ya Admin</h3>
                  <p className="text-[11px] text-slate-400">
                    Weka nenosiri thabiti linalokulinda peke yako
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangeMasterPassword} className="space-y-3 max-w-md pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password ya Sasa:</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Weka password ya zamani..."
                    className="w-full p-2.5 rounded-xl bg-[#222428] border border-[#333539] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password Mpya (Herufi 8+):</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Weka password mpya..."
                    className="w-full p-2.5 rounded-xl bg-[#222428] border border-[#333539] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Thibitisha Password Mpya:</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Rudia password mpya..."
                    className="w-full p-2.5 rounded-xl bg-[#222428] border border-[#333539] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                {passwordChangeStatus && (
                  <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                    passwordChangeStatus.success ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/15 text-red-300 border border-red-500/30'
                  }`}>
                    {passwordChangeStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-red-400" />}
                    <span>{passwordChangeStatus.message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition shadow-md flex items-center space-x-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Hifadhi Nenosiri Jipya</span>
                </button>
              </form>
            </div>

            {/* Broadcast Announcement Editor */}
            <div className="p-6 rounded-2xl bg-[#1a1b1e] border border-[#282a2e] shadow-lg space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Tangazo la Mfumo (Global Announcement Banner)</h3>
                  <p className="text-[11px] text-slate-400">
                    Ujumbe huu utaonekana juu ya skrini ya wanafunzi wote wanaotumia Report AI
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveBroadcast} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Maandishi ya Tangazo:
                  </label>
                  <textarea
                    rows={3}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Andika tangazo hapa kwa wanafunzi wote..."
                    className="w-full p-3 rounded-xl bg-[#222428] border border-[#333539] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <label className="text-xs text-slate-400">Aina:</label>
                    <select
                      value={broadcastType}
                      onChange={(e) => setBroadcastType(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-[#222428] border border-[#333539] text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    >
                      <option value="info">Taarifa (Info)</option>
                      <option value="warning">Onyo (Warning)</option>
                      <option value="success">Mafanikio (Success)</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isBroadcastSaved && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tangazo Limetumwa!</span>
                      </span>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center space-x-1.5 transition shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Rusha Tangazo Sasa</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Database Clear Controls */}
            <div className="p-6 rounded-2xl bg-[#1a1b1e] border border-[#282a2e] shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-red-400" />
                <span>Vidhibiti vya Hifadhi (Production Storage Wipe)</span>
              </h3>

              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-red-400">Futa Rekodi Zote (Wipe All Data)</div>
                  <p className="text-[11px] text-slate-400">
                    Hii itasafisha orodha ya watumiaji wote na matukio ya kumbukumbu.
                  </p>
                </div>
                <button
                  onClick={handleClearAllData}
                  className="px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-semibold transition shrink-0"
                >
                  Wipe All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* STUDENT DETAIL MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#1a1b1e] border border-[#333539] rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#282a2e] bg-[#222428] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedStudent.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedStudent.name || 'Student')}`}
                  alt={selectedStudent.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500"
                />
                <div>
                  <h3 className="text-base font-bold text-white">{selectedStudent.name}</h3>
                  <div className="text-xs text-amber-400 font-semibold">
                    {selectedStudent.universityFullName || selectedStudent.university}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg bg-[#282a2d] hover:bg-[#333539] text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-[#222428] border border-[#2c2e33]">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Registration Number</div>
                  <div className="font-bold text-slate-100 font-mono mt-0.5">{selectedStudent.regNumber || 'N/A'}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#222428] border border-[#2c2e33]">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Email Address</div>
                  <div className="font-bold text-slate-100 font-mono mt-0.5">{selectedStudent.email || 'N/A'}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#222428] border border-[#2c2e33]">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Idara</div>
                  <div className="font-bold text-slate-100 mt-0.5">{selectedStudent.department}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#222428] border border-[#2c2e33]">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Kampuni ya Field</div>
                  <div className="font-bold text-slate-100 mt-0.5">{selectedStudent.company}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#222428] border border-[#2c2e33] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Maendeleo ya Ripoti ya IPT</span>
                  <span className="font-bold text-amber-400">
                    Sura {selectedStudent.chaptersCompleted || 0} kati ya 5 (
                    {Math.round(((selectedStudent.chaptersCompleted || 0) / 5) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[#2a2c30] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                    style={{ width: `${((selectedStudent.chaptersCompleted || 0) / 5) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                  <div className="p-2 rounded-lg bg-[#1a1b1e]">
                    <div className="text-[10px] text-slate-400">AI Prompts</div>
                    <div className="font-bold text-white font-mono">{selectedStudent.totalPrompts || 0}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#1a1b1e]">
                    <div className="text-[10px] text-slate-400">Tokens</div>
                    <div className="font-bold text-amber-400 font-mono">{(selectedStudent.tokensUsed || 0).toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#1a1b1e]">
                    <div className="text-[10px] text-slate-400">Logbook Weeks</div>
                    <div className="font-bold text-blue-400 font-mono">{selectedStudent.logbookWeeksFilled || 0}/10</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#1a1b1e]">
                    <div className="text-[10px] text-slate-400">Viva Prep</div>
                    <div className="font-bold text-emerald-400 font-mono">{selectedStudent.vivaPrepScore || 80}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#282a2e] bg-[#222428] flex items-center justify-end space-x-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-[#282a2d] hover:bg-[#333539] text-xs font-semibold text-slate-300"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
