import React from 'react';
import { IssuePriority } from '../types';
import { useTheme } from '../context/ThemeContext';
import { AlertCircle, AlertTriangle, ArrowDown, Flame } from 'lucide-react';

interface PriorityBadgeProps {
  priority: IssuePriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 12 : 13;

  switch (priority) {
    case 'Critical':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${
            isLight
              ? 'bg-rose-50 text-rose-800 border-rose-200 shadow-xs'
              : 'bg-[#1c0d0d] text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.18)]'
          } ${sizeClasses}`}
        >
          <Flame size={iconSize} className="text-rose-500 animate-pulse" />
          Critical
        </span>
      );
    case 'High':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${
            isLight
              ? 'bg-orange-50 text-orange-800 border-orange-200 shadow-xs'
              : 'bg-[#1c120a] text-amber-300 border border-amber-500/35 shadow-[0_0_10px_rgba(245,158,11,0.12)]'
          } ${sizeClasses}`}
        >
          <AlertCircle size={iconSize} className="text-orange-500" />
          High
        </span>
      );
    case 'Medium':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${
            isLight
              ? 'bg-indigo-50 text-indigo-800 border-indigo-200 shadow-xs'
              : 'bg-[#141414] text-silver-200 border border-silver-600/50'
          } ${sizeClasses}`}
        >
          <AlertTriangle size={iconSize} className={isLight ? 'text-indigo-600' : 'text-silver-400'} />
          Medium
        </span>
      );
    case 'Low':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${
            isLight
              ? 'bg-slate-100 text-slate-700 border-slate-200'
              : 'bg-[#101010] text-silver-400 border border-[#242424]'
          } ${sizeClasses}`}
        >
          <ArrowDown size={iconSize} className={isLight ? 'text-slate-500' : 'text-silver-500'} />
          Low
        </span>
      );
    default:
      return <span className={sizeClasses}>{priority}</span>;
  }
};
