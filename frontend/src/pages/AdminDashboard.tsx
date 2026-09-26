import React, { useState, useEffect, useCallback } from 'react';
import { Issue, DashboardStatistics, IssueCategory, IssuePriority, IssueStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useRealtimeIssues } from '../hooks/useRealtimeIssues';
import { Navbar } from '../components/Navbar';
import { StatsOverview } from '../components/StatsOverview';
import { FilterBar } from '../components/FilterBar';
import { IssueCard } from '../components/IssueCard';
import { CreateIssueModal } from '../components/CreateIssueModal';
import { IssueDetailModal } from '../components/IssueDetailModal';
import { AddStaffModal } from '../components/AddStaffModal';
import { CampusDirectoryModal } from '../components/CampusDirectoryModal';
import {
  ShieldCheck,
  PlusCircle,
  RefreshCw,
  Loader2,
  Bell,
  BarChart3,
  PieChart,
  UserPlus,
  Users,
  Sparkles,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [realtimeNotice, setRealtimeNotice] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<IssueCategory | ''>('');
  const [priority, setPriority] = useState<IssuePriority | ''>('');
  const [status, setStatus] = useState<IssueStatus | ''>('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [issuesData, statsData] = await Promise.all([
        api.getIssues({
          search: search || undefined,
          category: category || undefined,
          priority: priority || undefined,
          status: status || undefined,
        }),
        api.getStatistics().catch(() => null),
      ]);
      setIssues(issuesData);
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error('Failed to load admin issues:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, priority, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime subscription setup
  const { connectionStatus } = useRealtimeIssues({
    onIssueInsert: (newIssue) => {
      setIssues((prev) => [newIssue, ...prev]);
      setRealtimeNotice(`New campus issue reported: "${newIssue.title}" (${newIssue.category})`);
      api.getStatistics().then(setStats).catch(() => {});
    },
    onIssueUpdate: (updated) => {
      setIssues((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      if (selectedIssue && selectedIssue.id === updated.id) {
        setSelectedIssue((prev) => (prev ? { ...prev, ...updated } : null));
      }
      setRealtimeNotice(`Issue updated: "${updated.title}" -> ${updated.status}`);
      api.getStatistics().then(setStats).catch(() => {});
    },
    onIssueDelete: (deletedId) => {
      setIssues((prev) => prev.filter((item) => item.id !== deletedId));
      if (selectedIssue?.id === deletedId) {
        setSelectedIssue(null);
      }
      api.getStatistics().then(setStats).catch(() => {});
    },
  });

  useEffect(() => {
    if (realtimeNotice) {
      const timer = setTimeout(() => setRealtimeNotice(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [realtimeNotice]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setPriority('');
    setStatus('');
  };

  return (
    <div
      className={`min-h-screen bg-transparent flex flex-col antialiased transition-colors ${
        isLight ? 'text-slate-900' : 'text-silver-100'
      }`}
    >
      <Navbar realtimeStatus={connectionStatus} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Realtime Alert Banner */}
        {realtimeNotice && (
          <div
            className={`border text-xs sm:text-sm font-medium px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-fade-in ${
              isLight
                ? 'bg-white border-purple-200 text-purple-900 shadow-purple-100/50'
                : 'bg-[#121212] border-silver-400/40 text-silver-100 shadow-[0_0_25px_rgba(255,255,255,0.08)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Bell size={15} className={isLight ? 'text-purple-600' : 'text-silver-300'} />
              <span>{realtimeNotice}</span>
            </div>
            <button
              onClick={() => setRealtimeNotice(null)}
              className={`ml-2 text-xs font-bold cursor-pointer ${
                isLight ? 'text-purple-400 hover:text-purple-800' : 'text-silver-400 hover:text-white'
              }`}
            >
              ✕
            </button>
          </div>
        )}

        {/* Dashboard Hero Header */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 transition-all ${
            isLight
              ? 'bg-gradient-to-b from-white via-slate-50/80 to-white border-slate-200 shadow-[0_10px_35px_rgba(0,0,0,0.05)]'
              : 'bg-gradient-to-b from-[#111111] via-[#0d0d0d] to-[#090909] border-[#222222] shadow-[0_12px_40px_rgba(0,0,0,0.85)]'
          }`}
        >
          {!isLight && (
            <>
              <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-silver-500/5 blur-3xl pointer-events-none" />
              <div className="absolute left-1/3 -bottom-20 w-96 h-40 bg-white/[0.02] blur-2xl pointer-events-none" />
            </>
          )}

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono uppercase tracking-widest ${
                  isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-700'
                    : 'bg-[#181818] border-[#2e2e2e] text-silver-300'
                }`}
              >
                <Sparkles size={11} className={isLight ? 'text-amber-500' : 'text-silver-400'} />
                <span>Enterprise Command Matrix</span>
              </div>
              <div>
                <h1
                  className={`text-2xl sm:text-4xl font-black tracking-tight uppercase ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Campus Issue Tracker
                </h1>
                <p
                  className={`text-sm sm:text-base mt-1 font-normal max-w-xl ${
                    isLight ? 'text-slate-600' : 'text-silver-400'
                  }`}
                >
                  Campus operations, simplified. Real-time incident telemetry, automated workflow dispatch, and infrastructure lifecycle tracking.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={loadData}
                className={`p-2.5 rounded-xl border shadow-sm transition cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                    : 'bg-[#141414] hover:bg-[#1a1a1a] border-[#282828] text-silver-300 hover:text-white'
                }`}
                title="Refresh Matrix"
              >
                <RefreshCw size={16} />
              </button>

              {/* LIST STAFF & STUDENTS OPTION */}
              <button
                type="button"
                onClick={() => setIsDirectoryOpen(true)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border transition cursor-pointer shadow-sm ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                    : 'btn-silver-secondary'
                }`}
              >
                <Users size={15} className={isLight ? 'text-indigo-600' : 'text-silver-300'} />
                <span>List Staff & Students</span>
              </button>

              {/* ADD STAFF BUTTON */}
              <button
                type="button"
                onClick={() => setIsAddStaffOpen(true)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border transition cursor-pointer shadow-sm ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                    : 'btn-silver-secondary'
                }`}
              >
                <UserPlus size={15} className={isLight ? 'text-blue-600' : 'text-silver-300'} />
                <span>Add Staff</span>
              </button>

              {/* LOG ISSUE BUTTON */}
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl shadow-md cursor-pointer transition ${
                  isLight
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : 'btn-silver-sheen'
                }`}
              >
                <PlusCircle size={15} />
                <span>Log Incident</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Stats Cards */}
        <StatsOverview stats={stats} loading={loading} />

        {/* Analytical Breakdowns by Category & Priority */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Breakdown */}
            <div
              className={`p-5 sm:p-6 rounded-2xl border shadow-sm transition ${
                isLight
                  ? 'bg-white border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
                  : 'bg-[#0d0d0d] border-[#222222] shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <h3
                  className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                    isLight ? 'text-slate-600' : 'text-silver-400'
                  }`}
                >
                  <BarChart3 size={15} className={isLight ? 'text-purple-600' : 'text-silver-300'} />
                  <span>Incidents by Category</span>
                </h3>
                <span className={`text-[11px] font-mono ${isLight ? 'text-slate-400' : 'text-silver-500'}`}>
                  Distribution Profile
                </span>
              </div>
              <div className="space-y-3">
                {Object.entries(stats.byCategory).map(([cat, count]) => {
                  const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div
                        className={`flex justify-between text-xs font-medium ${
                          isLight ? 'text-slate-700' : 'text-silver-300'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={`font-mono ${isLight ? 'text-slate-500' : 'text-silver-500'}`}>
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div
                        className={`w-full h-1.5 rounded-full overflow-hidden border ${
                          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#181818] border-[#242424]'
                        }`}
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isLight
                              ? 'bg-purple-600'
                              : 'bg-gradient-to-r from-silver-400 to-silver-100'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority Breakdown */}
            <div
              className={`p-5 sm:p-6 rounded-2xl border shadow-sm transition ${
                isLight
                  ? 'bg-white border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
                  : 'bg-[#0d0d0d] border-[#222222] shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <h3
                  className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                    isLight ? 'text-slate-600' : 'text-silver-400'
                  }`}
                >
                  <PieChart size={15} className={isLight ? 'text-rose-600' : 'text-silver-300'} />
                  <span>Severity Matrix</span>
                </h3>
                <span className={`text-[11px] font-mono ${isLight ? 'text-slate-400' : 'text-silver-500'}`}>
                  Criticality Breakdown
                </span>
              </div>
              <div className="space-y-3">
                {Object.entries(stats.byPriority).map(([pri, count]) => {
                  const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  const barGradient =
                    pri === 'Critical'
                      ? 'from-rose-500 to-rose-400'
                      : pri === 'High'
                      ? 'from-amber-500 to-amber-300'
                      : pri === 'Medium'
                      ? isLight
                        ? 'from-indigo-500 to-sky-400'
                        : 'from-silver-400 to-silver-200'
                      : isLight
                      ? 'from-slate-400 to-slate-300'
                      : 'from-[#333333] to-[#555555]';

                  return (
                    <div key={pri} className="space-y-1.5">
                      <div
                        className={`flex justify-between text-xs font-medium ${
                          isLight ? 'text-slate-700' : 'text-silver-300'
                        }`}
                      >
                        <span>{pri}</span>
                        <span className={`font-mono ${isLight ? 'text-slate-500' : 'text-silver-500'}`}>
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div
                        className={`w-full h-1.5 rounded-full overflow-hidden border ${
                          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#181818] border-[#242424]'
                        }`}
                      >
                        <div
                          className={`h-full bg-gradient-to-r ${barGradient} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <FilterBar
          search={search}
          category={category}
          priority={priority}
          status={status}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onPriorityChange={setPriority}
          onStatusChange={setStatus}
          onReset={handleResetFilters}
        />

        {/* Issues List */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2
              className={`text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
                isLight ? 'text-slate-700' : 'text-silver-300'
              }`}
            >
              <span>All Active Campus Incidents</span>
              <span
                className={`px-2 py-0.5 rounded-full border font-mono text-xs ${
                  isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-600'
                    : 'bg-[#181818] border-[#2a2a2a] text-silver-400'
                }`}
              >
                {issues.length}
              </span>
            </h2>
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-silver-500'}`}>
              Select any record to inspect or reassign
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2
                size={28}
                className={`animate-spin mb-3 ${isLight ? 'text-slate-600' : 'text-silver-300'}`}
              />
              <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-silver-500'}`}>
                Synchronizing incident registry...
              </p>
            </div>
          ) : issues.length === 0 ? (
            <div
              className={`rounded-2xl p-12 text-center border shadow-sm ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0d0d0d] border-[#222222]'
              }`}
            >
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-silver-200'}`}>
                No active records found
              </h3>
              <p className={`text-xs mt-1 max-w-sm mx-auto ${isLight ? 'text-slate-500' : 'text-silver-500'}`}>
                No tickets match your filter criteria. Adjust your search or parameters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {issues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onClick={() => setSelectedIssue(issue)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Campus Directory Modal (List Staff & Students) */}
      <CampusDirectoryModal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        onOpenAddStaff={() => setIsAddStaffOpen(true)}
      />

      {/* Create Issue Modal */}
      <CreateIssueModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={loadData}
      />

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        onStaffAdded={(newStaff) => {
          setRealtimeNotice(`Staff specialist "${newStaff.name}" added to roster.`);
        }}
      />

      {/* Issue Detail Modal */}
      <IssueDetailModal
        issue={selectedIssue}
        currentUser={profile}
        onClose={() => setSelectedIssue(null)}
        onIssueUpdated={(updated) => {
          setIssues((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
          api.getStatistics().then(setStats).catch(() => {});
        }}
        onIssueDeleted={(deletedId) => {
          setIssues((prev) => prev.filter((item) => item.id !== deletedId));
          api.getStatistics().then(setStats).catch(() => {});
        }}
      />
    </div>
  );
};
