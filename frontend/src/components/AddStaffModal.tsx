import React, { useState } from 'react';
import { api } from '../services/api';
import { Profile } from '../types';
import { X, UserPlus, Loader2, CheckCircle2, ShieldCheck, Mail, Lock, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStaffAdded: (newStaff: Profile) => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  onStaffAdded,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [department, setDepartment] = useState('IT Staff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const generatedId = `b${Date.now()}-0000-0000-0000-${Math.floor(Math.random() * 1000000000000)}`;
      const displayName = `${name.trim()} (${department})`;

      const newStaffProfile: Profile = {
        id: generatedId,
        name: displayName,
        email: email.trim().toLowerCase(),
        role: 'Staff',
        created_at: new Date().toISOString(),
      };

      // 1. Save to campus registered accounts in localStorage
      const registeredRaw = localStorage.getItem('campus_registered_users');
      let accounts: any[] = [];
      try {
        if (registeredRaw) accounts = JSON.parse(registeredRaw);
      } catch (err) {
        accounts = [];
      }

      // Check if email already registered
      accounts = accounts.filter((a) => a.email.toLowerCase() !== newStaffProfile.email);
      accounts.push({
        ...newStaffProfile,
        password: password.trim(),
      });
      localStorage.setItem('campus_registered_users', JSON.stringify(accounts));

      // 2. Sync to backend so staff list updates across endpoints
      await api.syncUser(newStaffProfile).catch(() => {});

      onStaffAdded(newStaffProfile);
      setSuccess(`Staff specialist "${displayName}" provisioned. Credentials activated for Staff Portal.`);

      // Reset fields
      setName('');
      setEmail('');
      setPassword('Password123!');

      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to add staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in ${
      isLight ? 'bg-slate-900/40' : 'bg-black/85'
    }`}>
      <div className={`rounded-2xl max-w-md w-full p-6 shadow-2xl transition-all ${
        isLight
          ? 'bg-white border border-slate-200 text-slate-800 shadow-slate-300/50'
          : 'bg-[#0e0e0e] border border-[#262626] text-silver-100 shadow-[0_25px_60px_rgba(0,0,0,0.95)]'
      }`}>
        <div className={`flex items-center justify-between pb-4 border-b ${
          isLight ? 'border-slate-100' : 'border-[#1c1c1c]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-[#181818] border border-[#2e2e2e] text-silver-100'
            }`}>
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-silver-50'}`}>
                Provision Staff Account
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-silver-500'}`}>
                Restricted administrative authorization
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-silver-500 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 dark:bg-[#1c0d0d] dark:border-rose-500/40 dark:text-rose-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 dark:bg-[#0c1c12] dark:border-emerald-500/40 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1 ${
              isLight ? 'text-slate-700' : 'text-silver-300'
            }`}>
              Staff Full Name *
            </label>
            <div className="relative">
              <User size={15} className={`absolute left-3.5 top-3 ${
                isLight ? 'text-slate-400' : 'text-silver-500'
              }`} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Robert Martinez"
                className={`w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl transition focus:outline-none ${
                  isLight
                    ? 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-500'
                    : 'bg-[#141414] border border-[#282828] text-silver-100 placeholder-silver-600 focus:bg-[#181818] focus:border-silver-400'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${
              isLight ? 'text-slate-700' : 'text-silver-300'
            }`}>
              Specialization / Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition focus:outline-none cursor-pointer ${
                isLight
                  ? 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-slate-500'
                  : 'bg-[#141414] border border-[#282828] text-silver-200 focus:border-silver-400'
              }`}
            >
              <option value="IT Staff">IT & Network Support</option>
              <option value="Facilities Staff">Facilities & Cleaning</option>
              <option value="Electrical Staff">Electrical Maintenance</option>
              <option value="Audio/Visual Staff">Classroom & Projector AV</option>
              <option value="General Maintenance">General Campus Maintenance</option>
            </select>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${
              isLight ? 'text-slate-700' : 'text-silver-300'
            }`}>
              Institutional Email *
            </label>
            <div className="relative">
              <Mail size={15} className={`absolute left-3.5 top-3 ${
                isLight ? 'text-slate-400' : 'text-silver-500'
              }`} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. robert.staff@campus.edu"
                className={`w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl transition focus:outline-none ${
                  isLight
                    ? 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-500'
                    : 'bg-[#141414] border border-[#282828] text-silver-100 placeholder-silver-600 focus:bg-[#181818] focus:border-silver-400'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${
              isLight ? 'text-slate-700' : 'text-silver-300'
            }`}>
              Initial Access Password *
            </label>
            <div className="relative">
              <Lock size={15} className={`absolute left-3.5 top-3 ${
                isLight ? 'text-slate-400' : 'text-silver-500'
              }`} />
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password123!"
                className={`w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl font-mono transition focus:outline-none ${
                  isLight
                    ? 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-500'
                    : 'bg-[#141414] border border-[#282828] text-silver-100 placeholder-silver-600 focus:bg-[#181818] focus:border-silver-400'
                }`}
              />
            </div>
            <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-silver-500'}`}>
              Personnel must authenticate using these credentials in the Staff Portal.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition cursor-pointer ${
                isLight ? 'text-slate-500 hover:text-slate-800' : 'text-silver-400 hover:text-white'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-silver-sheen inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin text-black" />
              ) : (
                <UserPlus size={15} />
              )}
              <span>Provision Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
