import React from 'react';
import { IssueCategory } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  Monitor,
  Wifi,
  Zap,
  GraduationCap,
  Sparkles,
  Armchair,
  HelpCircle,
} from 'lucide-react';

interface CategoryBadgeProps {
  category: IssueCategory;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'md' }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 12 : 13;

  const renderContent = () => {
    switch (category) {
      case 'Computer':
        return (
          <>
            <Monitor size={iconSize} className={isLight ? 'text-purple-600' : 'text-silver-300'} />
            <span>Computer</span>
          </>
        );
      case 'Internet':
        return (
          <>
            <Wifi size={iconSize} className={isLight ? 'text-blue-600' : 'text-silver-300'} />
            <span>Internet</span>
          </>
        );
      case 'Electricity':
        return (
          <>
            <Zap size={iconSize} className={isLight ? 'text-amber-600' : 'text-amber-400'} />
            <span>Electricity</span>
          </>
        );
      case 'Classroom':
        return (
          <>
            <GraduationCap size={iconSize} className={isLight ? 'text-emerald-600' : 'text-silver-300'} />
            <span>Classroom</span>
          </>
        );
      case 'Cleaning':
        return (
          <>
            <Sparkles size={iconSize} className={isLight ? 'text-teal-600' : 'text-silver-300'} />
            <span>Cleaning</span>
          </>
        );
      case 'Furniture':
        return (
          <>
            <Armchair size={iconSize} className={isLight ? 'text-orange-600' : 'text-silver-300'} />
            <span>Furniture</span>
          </>
        );
      default:
        return (
          <>
            <HelpCircle size={iconSize} className={isLight ? 'text-slate-500' : 'text-silver-400'} />
            <span>Other</span>
          </>
        );
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg border shadow-xs ${
        isLight
          ? 'bg-slate-100 text-slate-800 border-slate-200'
          : 'bg-[#141414] text-silver-200 border-[#2a2a2a]'
      } ${sizeClasses}`}
    >
      {renderContent()}
    </span>
  );
};
