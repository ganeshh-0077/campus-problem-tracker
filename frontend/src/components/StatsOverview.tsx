import React from 'react';
import { DashboardStatistics } from '../types';
import { useTheme } from '../context/ThemeContext';
import { ListFilter, Clock, PlayCircle, CheckCircle2, Flame } from 'lucide-react';

interface StatsOverviewProps {
  stats: DashboardStatistics | null;
  loading?: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, loading }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const cards = [
    {
      title: 'Total Issues',
      count: stats?.total ?? 0,
      icon: <ListFilter size={18} className={isLight ? 'text-slate-700' : 'text-silver-200'} />,
      accentColor: isLight ? 'from-slate-400/40 to-transparent' : 'from-silver-400/20 to-transparent',
      borderColor: isLight ? 'border-slate-200 hover:border-slate-400' : 'border-[#262626] hover:border-silver-500/40',
      textColor: isLight ? 'text-slate-900' : 'text-silver-50',
      bgCard: isLight ? 'bg-white' : 'bg-[#0d0d0d]',
      shadow: isLight ? 'shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]' : 'shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.85)]',
    },
    {
      title: 'Pending',
      count: stats?.pending ?? 0,
      icon: <Clock size={18} className="text-amber-500" />,
      accentColor: isLight ? 'from-amber-400/40 to-transparent' : 'from-amber-500/15 to-transparent',
      borderColor: isLight ? 'border-slate-200 hover:border-amber-400' : 'border-[#262626] hover:border-amber-500/40',
      textColor: isLight ? 'text-amber-700' : 'text-amber-200',
      bgCard: isLight ? 'bg-white' : 'bg-[#0d0d0d]',
      shadow: isLight ? 'shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]' : 'shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.85)]',
    },
    {
      title: 'In Progress',
      count: stats?.inProgress ?? 0,
      icon: <PlayCircle size={18} className="text-sky-500" />,
      accentColor: isLight ? 'from-sky-400/40 to-transparent' : 'from-sky-500/15 to-transparent',
      borderColor: isLight ? 'border-slate-200 hover:border-sky-400' : 'border-[#262626] hover:border-sky-500/40',
      textColor: isLight ? 'text-sky-700' : 'text-sky-200',
      bgCard: isLight ? 'bg-white' : 'bg-[#0d0d0d]',
      shadow: isLight ? 'shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]' : 'shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.85)]',
    },
    {
      title: 'Resolved',
      count: stats?.resolved ?? 0,
      icon: <CheckCircle2 size={18} className="text-emerald-500" />,
      accentColor: isLight ? 'from-emerald-400/40 to-transparent' : 'from-emerald-500/15 to-transparent',
      borderColor: isLight ? 'border-slate-200 hover:border-emerald-400' : 'border-[#262626] hover:border-emerald-500/40',
      textColor: isLight ? 'text-emerald-700' : 'text-emerald-200',
      bgCard: isLight ? 'bg-white' : 'bg-[#0d0d0d]',
      shadow: isLight ? 'shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]' : 'shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.85)]',
    },
    {
      title: 'Critical Severity',
      count: stats?.critical ?? 0,
      icon: <Flame size={18} className="text-rose-500" />,
      accentColor: isLight ? 'from-rose-400/40 to-transparent' : 'from-rose-500/15 to-transparent',
      borderColor: isLight ? 'border-slate-200 hover:border-rose-400' : 'border-[#262626] hover:border-rose-500/40',
      textColor: isLight ? 'text-rose-700' : 'text-rose-200',
      bgCard: isLight ? 'bg-white' : 'bg-[#0d0d0d]',
      shadow: isLight ? 'shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]' : 'shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.85)]',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`relative overflow-hidden ${card.bgCard} p-4 sm:p-5 rounded-2xl border ${card.borderColor} ${card.shadow} flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 group`}
        >
          {/* Subtle top highlight glow */}
          <div
            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accentColor} opacity-70 group-hover:opacity-100 transition`}
          />

          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                isLight ? 'text-slate-500' : 'text-silver-400'
              }`}
            >
              {card.title}
            </span>
            <div
              className={`p-2 rounded-xl border transition ${
                isLight
                  ? 'bg-slate-50 border-slate-200 group-hover:border-slate-300'
                  : 'bg-[#141414] border-[#242424] group-hover:border-[#383838]'
              }`}
            >
              {card.icon}
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            {loading ? (
              <div
                className={`h-8 w-14 rounded animate-pulse ${
                  isLight ? 'bg-slate-200' : 'bg-[#1a1a1a]'
                }`}
              />
            ) : (
              <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${card.textColor}`}>
                {card.count}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
