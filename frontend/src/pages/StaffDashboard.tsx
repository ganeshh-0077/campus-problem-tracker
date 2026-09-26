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
import { IssueDetailModal } from '../components/IssueDetailModal';
import {
  Wrench,
  Loader2,
  RefreshCw,
  Bell,
  CheckCircle,
  Sparkles,
  UserCheck,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Primary toggle: 'assigned' (default: only show issues assigned to logged-in staff) vs 'all' (show every issue)
  const [viewScope, setViewScope] = useState<'assigned' | 'all'>('assigned');

  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
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
          scope: viewScope,
        }),
        api.getStatistics().catch(() => null),
      ]);
      setIssues(issuesData);
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error('Failed to load staff issues:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, priority, status, viewScope]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime subscription setup
  const { connectionStatus } = useRealtimeIssues({
    onIssueInsert: (newIssue) => {
      const isAssignedToMe = newIssue.assigned_to === profile?.id;
      if (viewScope === 'all' || isAssignedToMe) {
        setIssues((prev) => [newIssue, ...prev]);
      }
      if (isAssignedToMe) {
        setRealtimeNotice(`New ticket assigned to you: "${newIssue.title}"`);
      }
      api.getStatistics().then(setStats).catch(() => {});
    },
    onIssueUpdate: (updated) => {
      const isAssignedToMe = updated.assigned_to === profile?.id;

      setIssues((prev) => {
        if (viewScope === 'assigned') {
          if (isAssignedToMe) {
            const exists = prev.some((i) => i.id === updated.id);
            return exists
              ? prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
              : [updated, ...prev];
          } else {
            return prev.filter((item) => item.id !== updated.id);
          }
        } else {
          return prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item));
        }
      });

      if (selectedIssue && selectedIssue.id === updated.id) {
        setSelectedIssue((prev) => (prev ? { ...prev, ...updated } : null));
      }

      if (isAssignedToMe) {
        setRealtimeNotice(`Your ticket updated: "${updated.title}" -> ${updated.status}`);
      }
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
        {/* Realtime Toast Banner */}
        {realtimeNotice && (
          <div
            className={`border text-xs sm:text-sm font-medium px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-fade-in ${
              isLight
                ? 'bg-white border-blue-200 text-blue-900 shadow-blue-100/50'
                : 'bg-[#121212] border-silver-400/40 text-silver-100 shadow-[0_0_25px_rgba(255,255,255,0.08)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <Bell size={15} className={isLight ? 'text-blue-600' : 'text-silver-300'} />
              <span>{realtimeNotice}</span>
            </div>
            <button
              onClick={() => setRealtimeNotice(null)}
              className={`ml-2 text-xs font-bold cursor-pointer ${
                isLight ? 'text-blue-400 hover:text-blue-800' : 'text-silver-400 hover:text-white'
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
            <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-silver-500/5 blur-3xl pointer-events-none" />
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
                <span>Specialist Operations Center</span>
              </div>
              <div>
                <h1
                  className={`text-2xl sm:text-4xl font-black tracking-tight uppercase ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Staff Maintenance Queue
                </h1>
                <p
                  className={`text-sm sm:text-base mt-1 font-normal max-w-xl ${
                    isLight ? 'text-slate-600' : 'text-silver-400'
                  }`}
                >
                  {viewScope === 'assigned'
                    ? `Showing issues assigned directly to ${profile?.name || 'your profile'}. Update progress, resolve tickets, and post status dispatches.`
                    : 'Browsing all campus-wide issues across all departments and buildings.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={loadData}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border transition cursor-pointer shadow-sm ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                    : 'btn-silver-secondary'
                }`}
              >
                <RefreshCw size={14} />
                <span>Refresh Queue</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <StatsOverview stats={stats} loading={loading} />

        {/* VIEW SCOPE SELECTOR TABS: "Assigned to Me" vs "All Campus Issues" */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 sm:p-2.5 rounded-2xl border transition ${
            isLight
              ? 'bg-white border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
              : 'bg-[#0d0d0d] border-[#222222] shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
          }`}
        >
          <div
            className={`flex items-center gap-1.5 p-1 rounded-xl border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#141414] border-[#282828]'
            }`}
          >
            {/* Tab 1: Assigned to Me (Default) */}
            <button
              type="button"
              onClick={() => setViewScope('assigned')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                viewScope === 'assigned'
                  ? isLight
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'btn-silver-sheen shadow-md text-black font-extrabold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  : 'text-silver-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <UserCheck size={15} />
              <span>Assigned to Me</span>
              <span
                className={`ml-1 text-[11px] px-1.5 py-0.2 rounded font-mono ${
                  viewScope === 'assigned'
                    ? isLight
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-black/20 text-black font-extrabold'
                    : isLight
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-[#222222] text-silver-400'
                }`}
              >
                {viewScope === 'assigned' ? issues.length : 'My'}
              </span>
            </button>

            {/* Tab 2: All Campus Issues */}
            <button
              type="button"
              onClick={() => setViewScope('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                viewScope === 'all'
                  ? isLight
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'btn-silver-sheen shadow-md text-black font-extrabold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  : 'text-silver-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <Layers size={15} />
              <span>All Campus Issues</span>
              <span
                className={`ml-1 text-[11px] px-1.5 py-0.2 rounded font-mono ${
                  viewScope === 'all'
                    ? isLight
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-black/20 text-black font-extrabold'
                    : isLight
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-[#222222] text-silver-400'
                }`}
              >
                {stats?.total ?? (viewScope === 'all' ? issues.length : 'All')}
              </span>
            </button>
          </div>

          <div
            className={`text-xs font-mono px-3 ${
              isLight ? 'text-slate-500' : 'text-silver-500'
            }`}
          >
            Active Mode:{' '}
            <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-silver-200'}`}>
              {viewScope === 'assigned' ? 'Exclusive Staff Assignment' : 'Campus-Wide Overview'}
            </span>
          </div>
        </div>

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
              <span>{viewScope === 'assigned' ? 'My Assigned Work Queue' : 'All Campus Issues'}</span>
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
              Click any card to inspect or update progress
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2
                size={28}
                className={`animate-spin mb-3 ${isLight ? 'text-slate-600' : 'text-silver-300'}`}
              />
              <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-silver-500'}`}>
                {viewScope === 'assigned' ? 'Loading your assigned tickets...' : 'Loading all campus tickets...'}
              </p>
            </div>
          ) : issues.length === 0 ? (
            <div
              className={`rounded-2xl p-12 text-center border shadow-sm ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0d0d0d] border-[#222222]'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border ${
                  isLight
                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-[#161616] text-silver-300 border-[#262626]'
                }`}
              >
                <CheckCircle size={24} />
              </div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-silver-200'}`}>
                {viewScope === 'assigned'
                  ? 'No issues currently assigned to you'
                  : 'No campus issues found'}
              </h3>
              <p className={`text-xs mt-1 max-w-sm mx-auto ${isLight ? 'text-slate-500' : 'text-silver-500'}`}>
                {search || category || priority || status
                  ? 'No issues match the selected filters.'
                  : viewScope === 'assigned'
                  ? 'You are all caught up with your personal maintenance queue! Click below to view all reported campus tickets.'
                  : 'There are currently no tickets matching this view in the system.'}
              </p>
              {viewScope === 'assigned' && !search && !category && !priority && !status && (
                <button
                  type="button"
                  onClick={() => setViewScope('all')}
                  className={`mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl cursor-pointer transition ${
                    isLight
                      ? 'bg-slate-900 hover:bg-slate-800 text-white'
                      : 'btn-silver-sheen'
                  }`}
                >
                  <span>Show All Campus Issues</span>
                  <ArrowRight size={14} />
                </button>
              )}
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

      {/* Issue Detail Modal */}
      <IssueDetailModal
        issue={selectedIssue}
        currentUser={profile}
        onClose={() => setSelectedIssue(null)}
        onIssueUpdated={(updated) => {
          setIssues((prev) => {
            if (viewScope === 'assigned' && updated.assigned_to !== profile?.id) {
              return prev.filter((item) => item.id !== updated.id);
            }
            return prev.map((item) => (item.id === updated.id ? updated : item));
          });
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
