import React from 'react';
import { IssueCategory, IssuePriority, IssueStatus } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Search, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  search: string;
  category: IssueCategory | '';
  priority: IssuePriority | '';
  status: IssueStatus | '';
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: IssueCategory | '') => void;
  onPriorityChange: (value: IssuePriority | '') => void;
  onStatusChange: (value: IssueStatus | '') => void;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  category,
  priority,
  status,
  onSearchChange,
  onCategoryChange,
  onPriorityChange,
  onStatusChange,
  onReset,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const hasActiveFilters = Boolean(search || category || priority || status);

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between transition-all ${
        isLight
          ? 'bg-white border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
          : 'bg-[#0d0d0d] border-[#222222] shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
      }`}
    >
      {/* Search Input */}
      <div className="relative flex-1">
        <Search
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
            isLight ? 'text-slate-400' : 'text-silver-500'
          }`}
          size={15}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter by title, description, or campus sector..."
          className={`w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none transition ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-500'
              : 'bg-[#141414] border-[#282828] text-silver-100 placeholder-silver-600 focus:border-silver-400 focus:bg-[#181818]'
          }`}
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
        {/* Category */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as IssueCategory | '')}
          className={`text-xs sm:text-sm py-2 px-3 rounded-xl border focus:outline-none transition cursor-pointer ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-500 focus:bg-white'
              : 'bg-[#141414] border-[#282828] text-silver-200 focus:border-silver-400'
          }`}
        >
          <option value="">All Categories</option>
          <option value="Computer">Computer</option>
          <option value="Internet">Internet</option>
          <option value="Electricity">Electricity</option>
          <option value="Classroom">Classroom</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Furniture">Furniture</option>
          <option value="Other">Other</option>
        </select>

        {/* Priority */}
        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value as IssuePriority | '')}
          className={`text-xs sm:text-sm py-2 px-3 rounded-xl border focus:outline-none transition cursor-pointer ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-500 focus:bg-white'
              : 'bg-[#141414] border-[#282828] text-silver-200 focus:border-silver-400'
          }`}
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as IssueStatus | '')}
          className={`text-xs sm:text-sm py-2 px-3 rounded-xl border focus:outline-none transition cursor-pointer ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-500 focus:bg-white'
              : 'bg-[#141414] border-[#282828] text-silver-200 focus:border-silver-400'
          }`}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className={`flex items-center gap-1.5 text-xs py-2 px-3 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200'
                : 'text-silver-300 hover:text-white bg-[#1a1a1a] hover:bg-[#222222] border-[#333333]'
            }`}
            title="Clear filters"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
