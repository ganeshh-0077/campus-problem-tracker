import React from 'react';
import { Issue } from '../types';
import { useTheme } from '../context/ThemeContext';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { MapPin, User, Wrench, Calendar, ChevronRight } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  onClick: () => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onClick }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const formattedDate = new Date(issue.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
        isLight
          ? 'bg-white border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-slate-400 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]'
          : 'bg-[#0e0e0e] border-[#222222] shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:border-silver-500/40 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.9),0_0_20px_rgba(255,255,255,0.04)]'
      }`}
    >
      {/* Top subtle highlight reflection line (Galaxy only) */}
      {!isLight && (
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-silver-400/20 to-transparent group-hover:via-silver-200/50 transition-all duration-300" />
      )}

      <div>
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <CategoryBadge category={issue.category} size="sm" />
            <PriorityBadge priority={issue.priority} size="sm" />
          </div>
          <StatusBadge status={issue.status} size="sm" />
        </div>

        {/* Title */}
        <h3
          className={`text-base font-semibold transition line-clamp-2 mb-2 leading-snug ${
            isLight
              ? 'text-slate-900 group-hover:text-sky-700'
              : 'text-silver-100 group-hover:text-white'
          }`}
        >
          {issue.title}
        </h3>

        {/* Description snippet */}
        <p
          className={`text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed font-normal ${
            isLight ? 'text-slate-600' : 'text-silver-400'
          }`}
        >
          {issue.description}
        </p>
      </div>

      {/* Meta details footer */}
      <div
        className={`pt-3.5 border-t flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2.5 ${
          isLight ? 'border-slate-100 text-slate-500' : 'border-[#1c1c1c] text-silver-500'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Location */}
          <span
            className={`flex items-center gap-1.5 font-medium ${
              isLight ? 'text-slate-700' : 'text-silver-300'
            }`}
          >
            <MapPin size={13} className={isLight ? 'text-slate-400' : 'text-silver-500'} />
            <span className="truncate max-w-[140px]">{issue.location}</span>
          </span>

          {/* Reporter */}
          <span className={`flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-silver-400'}`}>
            <User size={13} className={isLight ? 'text-slate-400' : 'text-silver-600'} />
            <span className="truncate max-w-[110px]">{issue.creator?.name || 'Student'}</span>
          </span>

          {/* Assignee */}
          {issue.assignee ? (
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md font-medium border ${
                isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-[#141414] text-silver-200 border-[#2a2a2a]'
              }`}
            >
              <Wrench size={11} className={isLight ? 'text-slate-500' : 'text-silver-400'} />
              <span className="truncate max-w-[120px]">{issue.assignee.name}</span>
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md font-medium border ${
                isLight
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-[#16140e] text-amber-300/80 border-amber-500/20'
              }`}
            >
              <Wrench size={11} className="text-amber-500" /> Unassigned
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <span className={`flex items-center gap-1.5 font-mono text-[11px] ${isLight ? 'text-slate-400' : 'text-silver-500'}`}>
            <Calendar size={12} className={isLight ? 'text-slate-400' : 'text-silver-600'} />
            <span>{formattedDate}</span>
          </span>
          <ChevronRight
            size={15}
            className={`transition ${
              isLight
                ? 'text-slate-400 group-hover:translate-x-1 group-hover:text-slate-900'
                : 'text-silver-600 group-hover:translate-x-1 group-hover:text-silver-200'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
