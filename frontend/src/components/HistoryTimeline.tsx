import React, { useEffect, useState } from 'react';
import { IssueHistory } from '../types';
import { api } from '../services/api';
import { StatusBadge } from './StatusBadge';
import { History, ArrowRight, Loader2, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HistoryTimelineProps {
  issueId: string;
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ issueId }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [history, setHistory] = useState<IssueHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const data = await api.getHistory(issueId);
        setHistory(data);
      } catch (err) {
        console.error('Failed to load issue history:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [issueId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 text-xs text-silver-500">
        <Loader2 size={14} className="animate-spin mr-1.5 text-silver-300" />
        Synchronizing audit trail...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <p className="text-xs text-silver-500 italic py-2">
        No state changes recorded yet in immutable history.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-1.5 text-xs font-semibold ${
        isLight ? 'text-slate-800' : 'text-silver-300'
      }`}>
        <History size={14} className={isLight ? 'text-slate-500' : 'text-silver-400'} />
        <span>Telemetry Audit Trail</span>
      </div>

      <div className={`space-y-3 border-l-2 pl-3 ml-1 ${
        isLight ? 'border-slate-200' : 'border-[#262626]'
      }`}>
        {history.map((h) => {
          const date = new Date(h.created_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div key={h.id} className="relative text-xs">
              {/* Dot on the timeline */}
              <div className={`absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full ${
                isLight
                  ? 'bg-slate-700 border-2 border-white shadow-sm'
                  : 'bg-silver-300 border-2 border-[#0d0d0d] shadow-[0_0_8px_rgba(255,255,255,0.4)]'
              }`} />

              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge status={h.old_status} size="sm" />
                <ArrowRight size={12} className={isLight ? 'text-slate-400' : 'text-silver-500'} />
                <StatusBadge status={h.new_status} size="sm" />
              </div>

              <div className={`flex items-center gap-2 mt-1 text-[11px] ${
                isLight ? 'text-slate-500' : 'text-silver-400'
              }`}>
                <span className={`flex items-center gap-1 font-medium ${
                  isLight ? 'text-slate-700' : 'text-silver-300'
                }`}>
                  <User size={10} />
                  <span>{h.changer?.name || 'Staff Member'}</span>
                </span>
                <span className={isLight ? 'text-slate-300' : 'text-silver-600'}>•</span>
                <span className="font-mono">{date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
