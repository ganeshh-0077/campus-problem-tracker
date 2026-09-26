import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';
import { ShieldCheck, Wrench, GraduationCap, LogOut, Radio } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  realtimeStatus?: 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
}

export const Navbar: React.FC<NavbarProps> = ({ realtimeStatus = 'IDLE' }) => {
  const { profile, signOut } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case 'Admin':
        return <ShieldCheck size={14} className={isLight ? 'text-purple-600' : 'text-silver-100'} />;
      case 'Staff':
        return <Wrench size={14} className={isLight ? 'text-blue-600' : 'text-silver-200'} />;
      default:
        return <GraduationCap size={14} className={isLight ? 'text-emerald-600' : 'text-silver-300'} />;
    }
  };

  const getRoleBadgeColor = (role?: UserRole) => {
    if (isLight) {
      switch (role) {
        case 'Admin':
          return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'Staff':
          return 'bg-blue-50 text-blue-700 border-blue-200';
        default:
          return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      }
    } else {
      switch (role) {
        case 'Admin':
          return 'bg-[#181818] text-silver-100 border-[#383838] shadow-[0_0_12px_rgba(255,255,255,0.06)]';
        case 'Staff':
          return 'bg-[#141414] text-silver-200 border-[#2f2f2f]';
        default:
          return 'bg-[#111111] text-silver-300 border-[#262626]';
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 transition-all ${
        isLight
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs text-slate-900'
          : 'bg-[#080808]/90 backdrop-blur-md border-b border-[#222222] text-silver-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shadow-sm ${
                isLight
                  ? 'bg-slate-900 text-white'
                  : 'bg-gradient-to-br from-white via-silver-200 to-silver-500 text-black shadow-[0_0_15px_rgba(255,255,255,0.18)]'
              }`}
            >
              CIT
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span
                  className={`text-sm sm:text-base font-bold tracking-tight truncate block ${
                    isLight ? 'text-slate-900' : 'text-silver-50'
                  }`}
                >
                  Campus Issue Tracker
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider hidden sm:inline-block border shrink-0 ${
                    isLight
                      ? 'bg-slate-100 border-slate-200 text-slate-600'
                      : 'bg-[#161616] border-[#2a2a2a] text-silver-400'
                  }`}
                >
                  v2.0 PRO
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] sm:text-xs hidden md:inline truncate ${isLight ? 'text-slate-500' : 'text-silver-500'}`}>
                  Autonomous Operations Matrix
                </span>
                <span className={isLight ? 'text-slate-300 hidden md:inline' : 'text-silver-700 hidden md:inline'}>
                  •
                </span>
                {/* Realtime Status Indicator */}
                <div
                  className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-medium border shrink-0 ${
                    realtimeStatus === 'CONNECTED'
                      ? isLight
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-[#0a180e] text-emerald-400 border-emerald-500/30'
                      : realtimeStatus === 'CONNECTING'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                      : isLight
                      ? 'bg-slate-100 text-slate-500 border-slate-200'
                      : 'bg-[#121212] text-silver-500 border-[#222222]'
                  }`}
                  title={`Supabase Realtime: ${realtimeStatus}`}
                >
                  <Radio size={10} className={realtimeStatus === 'CONNECTED' ? 'animate-pulse' : ''} />
                  <span>{realtimeStatus === 'CONNECTED' ? 'Live Telemetry' : realtimeStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Theme Switcher & Authenticated Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle Button */}
            <ThemeToggle compact />

            {/* Profile Info */}
            {profile && (
              <div
                className={`flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l ${
                  isLight ? 'border-slate-200' : 'border-[#222222]'
                }`}
              >
                <div className="text-right hidden sm:block">
                  <p
                    className={`text-sm font-semibold leading-tight ${
                      isLight ? 'text-slate-900' : 'text-silver-100'
                    }`}
                  >
                    {profile.name}
                  </p>
                  <p className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-silver-500'}`}>
                    {profile.email}
                  </p>
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 text-xs px-2 sm:px-2.5 py-1 rounded-full border font-semibold ${getRoleBadgeColor(
                    profile.role
                  )}`}
                >
                  {getRoleIcon(profile.role)}
                  <span>{profile.role}</span>
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  title="Sign out of portal"
                  className={`p-1.5 sm:p-2 rounded-xl border border-transparent transition cursor-pointer ${
                    isLight
                      ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200'
                      : 'text-silver-400 hover:text-silver-100 hover:bg-[#161616] hover:border-[#2a2a2a]'
                  }`}
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
