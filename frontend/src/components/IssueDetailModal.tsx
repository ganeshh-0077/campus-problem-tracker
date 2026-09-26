import React, { useState, useEffect } from 'react';
import { Issue, IssueStatus, IssuePriority, Profile } from '../types';
import { api } from '../services/api';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { CommentSection } from './CommentSection';
import { HistoryTimeline } from './HistoryTimeline';
import {
  X,
  MapPin,
  Calendar,
  User,
  Wrench,
  Trash2,
  Loader2,
  CheckCircle2,
  Save,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface IssueDetailModalProps {
  issue: Issue | null;
  currentUser: Profile | null;
  onClose: () => void;
  onIssueUpdated: (updated: Issue) => void;
  onIssueDeleted: (deletedId: string) => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  currentUser,
  onClose,
  onIssueUpdated,
  onIssueDeleted,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(issue);
  const [staffList, setStaffList] = useState<Profile[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'discussion' | 'history'>('discussion');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form controls for Admin / Staff
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus>('Pending');
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<IssuePriority>('Medium');

  useEffect(() => {
    setCurrentIssue(issue);
    if (issue) {
      setSelectedStatus(issue.status);
      setSelectedStaff(issue.assigned_to || '');
      setSelectedPriority(issue.priority);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
    if (currentUser?.role === 'Admin') {
      api
        .getStaffUsers()
        .then((users) => setStaffList(users))
        .catch((err) => console.error('Error fetching staff list:', err));
    }
  }, [issue, currentUser]);

  if (!currentIssue) return null;

  const isAdmin = currentUser?.role === 'Admin';
  const isStaff = currentUser?.role === 'Staff';
  const isStudent = currentUser?.role === 'Student';
  const isAssignee = currentIssue.assigned_to === currentUser?.id;
  const isCreator = currentIssue.created_by === currentUser?.id;

  const canChangeStatus = isAdmin || (isStaff && isAssignee);
  const canAssign = isAdmin;
  const canChangePriority = isAdmin;
  const canDelete = isAdmin || (isStudent && isCreator && currentIssue.status === 'Pending');

  const hasUnsavedChanges =
    selectedStatus !== currentIssue.status ||
    selectedStaff !== (currentIssue.assigned_to || '') ||
    selectedPriority !== currentIssue.priority;

  // Handle saving staff assignment & status & priority together
  const handleSaveChanges = async () => {
    try {
      setActionLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      let updated = currentIssue;

      // 1. Assign staff if Admin and assignment changed
      if (canAssign && selectedStaff !== (currentIssue.assigned_to || '')) {
        updated = await api.assignIssue(currentIssue.id, selectedStaff ? selectedStaff : null);
      }

      // 2. Update status and/or priority
      const updates: { status?: IssueStatus; priority?: IssuePriority } = {};
      if (canChangeStatus && selectedStatus !== updated.status) {
        updates.status = selectedStatus;
      }
      if (canChangePriority && selectedPriority !== updated.priority) {
        updates.priority = selectedPriority;
      }

      if (Object.keys(updates).length > 0) {
        updated = await api.updateIssue(currentIssue.id, updates);
      }

      setCurrentIssue(updated);
      onIssueUpdated(updated);
      setSuccessMsg('Operational updates saved successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save changes');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await api.deleteIssue(currentIssue.id);
      onIssueDeleted(currentIssue.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete issue');
    } finally {
      setActionLoading(false);
    }
  };

  const formattedDate = new Date(currentIssue.created_at).toLocaleString();

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-fade-in ${
      isLight ? 'bg-slate-900/40' : 'bg-black/85'
    }`}>
      <div className={`rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl transition-all overflow-hidden ${
        isLight
          ? 'bg-white border border-slate-200 text-slate-800 shadow-slate-300/50'
          : 'bg-[#0d0d0d] border border-[#242424] text-silver-100 shadow-[0_25px_60px_rgba(0,0,0,0.95)]'
      }`}>
        {/* Header */}
        <div className={`p-5 border-b flex items-start justify-between gap-4 ${
          isLight ? 'bg-slate-50/80 border-slate-100' : 'bg-[#0f0f0f] border-[#1c1c1c]'
        }`}>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <CategoryBadge category={currentIssue.category} size="sm" />
              <PriorityBadge priority={currentIssue.priority} size="sm" />
              <StatusBadge status={currentIssue.status} size="sm" />
            </div>
            <h2 className={`text-lg sm:text-xl font-bold leading-snug ${
              isLight ? 'text-slate-900' : 'text-silver-50'
            }`}>
              {currentIssue.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-silver-400 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-5 mt-3 p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 dark:bg-[#1c0d0d] dark:border-rose-500/40 dark:text-rose-300 rounded-xl">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mx-5 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 dark:bg-[#0c1c12] dark:border-emerald-500/40 dark:text-emerald-300 rounded-xl flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-500 dark:text-emerald-400" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Content Body (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Metadata Grid */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl text-xs border ${
            isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-[#121212] border-[#222222]'
          }`}>
            <div>
              <span className={`block font-medium ${isLight ? 'text-slate-500' : 'text-silver-500'}`}>Campus Sector</span>
              <span className={`font-semibold flex items-center gap-1.5 mt-0.5 ${isLight ? 'text-slate-800' : 'text-silver-200'}`}>
                <MapPin size={13} className={isLight ? 'text-slate-400' : 'text-silver-400'} />
                <span className="truncate">{currentIssue.location}</span>
              </span>
            </div>
            <div>
              <span className={`block font-medium ${isLight ? 'text-slate-500' : 'text-silver-500'}`}>Originator</span>
              <span className={`font-semibold flex items-center gap-1.5 mt-0.5 ${isLight ? 'text-slate-800' : 'text-silver-200'}`}>
                <User size={13} className={isLight ? 'text-slate-400' : 'text-silver-400'} />
                <span className="truncate">{currentIssue.creator?.name || 'Student'}</span>
              </span>
            </div>
            <div>
              <span className={`block font-medium ${isLight ? 'text-slate-500' : 'text-silver-500'}`}>Assigned Staff</span>
              <span className={`font-semibold flex items-center gap-1.5 mt-0.5 ${isLight ? 'text-slate-800' : 'text-silver-200'}`}>
                <Wrench size={13} className={isLight ? 'text-slate-400' : 'text-silver-400'} />
                <span className="truncate">
                  {currentIssue.assignee ? currentIssue.assignee.name : 'Unassigned'}
                </span>
              </span>
            </div>
            <div>
              <span className={`block font-medium ${isLight ? 'text-slate-500' : 'text-silver-500'}`}>Timestamp</span>
              <span className={`font-semibold flex items-center gap-1.5 mt-0.5 font-mono ${isLight ? 'text-slate-800' : 'text-silver-200'}`}>
                <Calendar size={13} className={isLight ? 'text-slate-400' : 'text-silver-400'} />
                <span className="truncate">{formattedDate.split(',')[0]}</span>
              </span>
            </div>
          </div>

          {/* Problem Description */}
          <div>
            <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${
              isLight ? 'text-slate-500' : 'text-silver-400'
            }`}>
              Incident Diagnostics & Description
            </h4>
            <p className={`text-sm leading-relaxed p-4 rounded-xl border whitespace-pre-wrap font-normal ${
              isLight ? 'bg-slate-50/80 border-slate-200/80 text-slate-700' : 'bg-[#121212] border-[#222222] text-silver-200'
            }`}>
              {currentIssue.description}
            </p>
          </div>

          {/* Student View: Read-Only Progress Tracker */}
          {isStudent && (
            <div className={`p-4 rounded-xl border space-y-3 ${
              isLight ? 'bg-slate-50/80 border-slate-200/80' : 'bg-[#121212] border-[#222222]'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isLight ? 'text-slate-700' : 'text-silver-300'
                }`}>
                  <Clock size={14} className={isLight ? 'text-slate-400' : 'text-silver-400'} />
                  <span>Ticket Lifecycle Progression</span>
                </h4>
                <StatusBadge status={currentIssue.status} size="sm" />
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                {(['Pending', 'In Progress', 'Resolved', 'Closed'] as IssueStatus[]).map((step, idx) => {
                  const statusOrder = ['Pending', 'In Progress', 'Resolved', 'Closed'];
                  const currentIndex = statusOrder.indexOf(currentIssue.status);
                  const isDone = currentIndex >= idx;
                  const isCurrent = currentIssue.status === step;

                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          isCurrent
                            ? isLight
                              ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-400'
                              : 'bg-silver-100 text-black shadow-[0_0_12px_rgba(255,255,255,0.4)] ring-2 ring-silver-400'
                            : isDone
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                            : isLight
                            ? 'bg-slate-100 text-slate-400 border border-slate-200'
                            : 'bg-[#1a1a1a] text-silver-600 border border-[#262626]'
                        }`}
                      >
                        {isDone && !isCurrent ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] mt-1 font-medium ${
                          isCurrent
                            ? isLight ? 'text-slate-900 font-bold' : 'text-silver-100 font-bold'
                            : isDone
                            ? isLight ? 'text-emerald-700' : 'text-emerald-400'
                            : isLight ? 'text-slate-400' : 'text-silver-600'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className={`pt-3 border-t flex items-center justify-between text-xs ${
                isLight ? 'border-slate-200 text-slate-500' : 'border-[#1c1c1c] text-silver-400'
              }`}>
                <span>Designated Specialist:</span>
                <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-silver-200'}`}>
                  {currentIssue.assignee ? currentIssue.assignee.name : 'Pending Assignment (Under Administrative Review)'}
                </span>
              </div>
            </div>
          )}

          {/* Admin / Staff Controls: Status, Assign Staff, Priority + Save Button */}
          {(canChangeStatus || canAssign || canChangePriority) && (
            <div className={`p-4 rounded-xl border space-y-4 ${
              isLight ? 'bg-slate-50/80 border-slate-200/80' : 'bg-[#121212] border-[#262626]'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isLight ? 'text-slate-700' : 'text-silver-200'
                }`}>
                  <ShieldCheck size={15} className={isLight ? 'text-slate-400' : 'text-silver-300'} />
                  <span>Administrative Control Matrix</span>
                </h4>
                {hasUnsavedChanges && (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 border border-amber-300 dark:text-amber-300 dark:bg-amber-500/20 dark:border-amber-500/40 px-2 py-0.5 rounded-full">
                    Pending Verification
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Staff Assignment (Admin Only) */}
                {canAssign && (
                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 ${
                      isLight ? 'text-slate-600' : 'text-silver-400'
                    }`}>
                      Assigned Personnel
                    </label>
                    <select
                      value={selectedStaff}
                      disabled={actionLoading}
                      onChange={(e) => setSelectedStaff(e.target.value)}
                      className={`w-full text-xs p-2.5 rounded-lg font-medium focus:outline-none cursor-pointer transition ${
                        isLight
                          ? 'bg-white border border-slate-200 text-slate-800 focus:border-slate-500'
                          : 'bg-[#181818] border border-[#303030] text-silver-100 focus:border-silver-300'
                      }`}
                    >
                      <option value="">-- Unassigned --</option>
                      {staffList.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Status / Progress Switcher */}
                {canChangeStatus && (
                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 ${
                      isLight ? 'text-slate-600' : 'text-silver-400'
                    }`}>
                      Operational Status
                    </label>
                    <select
                      value={selectedStatus}
                      disabled={actionLoading}
                      onChange={(e) => setSelectedStatus(e.target.value as IssueStatus)}
                      className={`w-full text-xs p-2.5 rounded-lg font-medium focus:outline-none cursor-pointer transition ${
                        isLight
                          ? 'bg-white border border-slate-200 text-slate-800 focus:border-slate-500'
                          : 'bg-[#181818] border border-[#303030] text-silver-100 focus:border-silver-300'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                )}

                {/* Priority Changer (Admin Only) */}
                {canChangePriority && (
                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 ${
                      isLight ? 'text-slate-600' : 'text-silver-400'
                    }`}>
                      Severity Rating
                    </label>
                    <select
                      value={selectedPriority}
                      disabled={actionLoading}
                      onChange={(e) => setSelectedPriority(e.target.value as IssuePriority)}
                      className={`w-full text-xs p-2.5 rounded-lg font-medium focus:outline-none cursor-pointer transition ${
                        isLight
                          ? 'bg-white border border-slate-200 text-slate-800 focus:border-slate-500'
                          : 'bg-[#181818] border border-[#303030] text-silver-100 focus:border-silver-300'
                      }`}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Explicit Save Button */}
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={actionLoading || !hasUnsavedChanges}
                  className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition cursor-pointer ${
                    hasUnsavedChanges
                      ? 'btn-silver-sheen cursor-pointer'
                      : isLight
                      ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-[#181818] border border-[#2a2a2a] text-silver-600 cursor-not-allowed'
                  }`}
                >
                  {actionLoading ? (
                    <Loader2 size={15} className="animate-spin text-black" />
                  ) : (
                    <Save size={15} />
                  )}
                  <span>Commit Changes</span>
                </button>
              </div>
            </div>
          )}

          {/* Tabs for Discussion & History */}
          <div className={`pt-2 border-t ${isLight ? 'border-slate-200' : 'border-[#1c1c1c]'}`}>
            <div className={`flex border-b mb-4 ${isLight ? 'border-slate-200' : 'border-[#222222]'}`}>
              <button
                type="button"
                onClick={() => setActiveTab('discussion')}
                className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition cursor-pointer ${
                  activeTab === 'discussion'
                    ? isLight
                      ? 'border-slate-900 text-slate-900'
                      : 'border-silver-200 text-silver-100'
                    : isLight
                    ? 'border-transparent text-slate-400 hover:text-slate-700'
                    : 'border-transparent text-silver-500 hover:text-silver-300'
                }`}
              >
                Communications Log
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition cursor-pointer ${
                  activeTab === 'history'
                    ? isLight
                      ? 'border-slate-900 text-slate-900'
                      : 'border-silver-200 text-silver-100'
                    : isLight
                    ? 'border-transparent text-slate-400 hover:text-slate-700'
                    : 'border-transparent text-silver-500 hover:text-silver-300'
                }`}
              >
                Telemetry & Audit Trail
              </button>
            </div>

            {activeTab === 'discussion' ? (
              <CommentSection issueId={currentIssue.id} currentUser={currentUser} />
            ) : (
              <HistoryTimeline issueId={currentIssue.id} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isLight ? 'bg-slate-50/80 border-slate-100' : 'bg-[#0a0a0a] border-[#1c1c1c]'
        }`}>
          <div>
            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 dark:hover:bg-[#1f0d0d] dark:hover:border-rose-500/30 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Purge Issue</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`text-xs sm:text-sm px-4 py-2 font-medium rounded-xl transition cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-sm'
                : 'bg-[#181818] hover:bg-[#222222] border border-[#2e2e2e] text-silver-200 hover:text-white'
            }`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
