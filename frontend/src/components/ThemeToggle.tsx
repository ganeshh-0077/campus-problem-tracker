import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Sun } from 'lucide-react';

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false, className = '' }) => {
  const { theme, setTheme } = useTheme();

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setTheme(theme === 'galaxy' ? 'light' : 'galaxy')}
        className={`p-2 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
          theme === 'galaxy'
            ? 'bg-[#141414] hover:bg-[#1c1c1c] border-[#2e2e2e] text-silver-200 hover:text-white'
            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm'
        } ${className}`}
        title={`Current: ${theme === 'galaxy' ? 'Galaxy Theme' : 'Light Theme'}. Click to switch.`}
      >
        {theme === 'galaxy' ? (
          <>
            <Sparkles size={15} className="text-amber-300" />
            <span className="text-xs font-semibold hidden md:inline">Galaxy</span>
          </>
        ) : (
          <>
            <Sun size={15} className="text-amber-500" />
            <span className="text-xs font-semibold hidden md:inline">Light</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-1 rounded-2xl border transition-all ${
        theme === 'galaxy'
          ? 'bg-[#0f0f0f]/90 border-[#282828] shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md'
          : 'bg-white/90 border-slate-200 shadow-md backdrop-blur-md'
      } ${className}`}
    >
      {/* Galaxy Option */}
      <button
        type="button"
        onClick={() => setTheme('galaxy')}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          theme === 'galaxy'
            ? 'btn-silver-sheen shadow-sm text-black font-extrabold'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Sparkles size={14} className={theme === 'galaxy' ? 'text-black' : 'text-slate-400'} />
        <span>Galaxy Theme</span>
      </button>

      {/* Light Option */}
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          theme === 'light'
            ? 'bg-slate-900 text-white shadow-md font-extrabold'
            : 'text-silver-400 hover:text-white'
        }`}
      >
        <Sun size={14} className={theme === 'light' ? 'text-amber-400' : 'text-silver-500'} />
        <span>Light Theme</span>
      </button>
    </div>
  );
};
