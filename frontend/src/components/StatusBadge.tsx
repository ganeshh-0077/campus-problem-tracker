import React from 'react';
import { IssueStatus } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Clock, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: IssueStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 12 : 13;

  switch (status) {
    case 'Pending':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${
            isLight
              ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-xs'
              : 'bg-[#18140c] text-amber-300/90 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
          } ${sizeClasses}`}
        >
          <Clock size={iconSize} className={isLight ? 'text-amber-600' : 'text-amber-400'} />
          Pending
        </span>
      );
    case 'In Progress':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${
            isLight
              ? 'bg-sky-50 text-sky-800 border-sky-200 shadow-xs'
              : 'bg-[#0c1824] text-sky-300/90 border-sky-500/30 shadow-[0_0_10px_rgba(14,165,233,0.1)]'
          } ${sizeClasses}`}
        >
          <PlayCircle size={iconSize} className={isLight ? 'text-sky-600' : 'text-sky-400'} />
          In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${
            isLight
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs'
              : 'bg-[#0c1c14] text-emerald-300/90 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
          } ${sizeClasses}`}
        >
          <CheckCircle2 size={iconSize} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
          Resolved
        </span>
      );
    case 'Closed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${
            isLight
              ? 'bg-slate-100 text-slate-700 border-slate-300'
              : 'bg-[#141414] text-silver-400 border-silver-700'
          } ${sizeClasses}`}
        >
          <XCircle size={iconSize} className={isLight ? 'text-slate-500' : 'text-silver-500'} />
          Closed
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full border ${
            isLight
              ? 'bg-slate-100 text-slate-700 border-slate-200'
              : 'bg-[#161616] text-silver-300 border-[#2a2a2a]'
          } ${sizeClasses}`}
        >
          {status}
        </span>
      );
  }
};
