import React, { useState } from 'react';
import { IssueCategory, IssuePriority } from '../types';
import { api } from '../services/api';
import { X, PlusCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Computer');
  const [priority, setPriority] = useState<IssuePriority>('Medium');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.createIssue({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        location: location.trim(),
      });
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setCategory('Computer');
      setPriority('Medium');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in ${
      isLight ? 'bg-slate-900/40' : 'bg-black/85'
    }`}>
      <div className={`rounded-2xl max-w-lg w-full p-6 shadow-2xl transition-all ${
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
              <PlusCircle size={18} />
            </div>
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-silver-50'}`}>
                Log Campus Incident
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-silver-500'}`}>
                Dispatch diagnostics to college operations staff
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1 ${
              isLight ? 'text-slate-700' : 'text-silver-300'
            }`}>
              Incident Summary / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. High-density WiFi outage in Library West Wing"
              className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition focus:outline-none ${
                isLight
                  ? 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-500'
                  : 'bg-[#141414] border border-[#282828] text-silver-100 placeholder-silver-600 focus:bg-[#181818] focus:border-silver-400'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${
                isLight ? 'text-slate-700' : 'text-silver-300'
              }`}>
                Domain / Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory)}
                className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition focus:outline-none cursor-pointer ${
                  isLight
                    ? 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-slate-500'
                    : 'bg-[#141414] border border-[#282828] text-silver-200 focus:border-silver-400'
                }`}
              >
                <option value="Computer">Computer</option>
                <option value="Internet">Internet</option>
                <option value="Electricity">Electricity</option>
                <option value="Classroom">Classroom</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Furniture">Furniture</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${
                isLight ? 'text-slate-700' : 'text-silver-300'
              }`}>
                Severity Rating *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition focus:outline-none cursor-pointer ${
                  isLight
                    ? 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-slate-500'
                    : 'bg-[#141414] border border-[#282828] text-silver-200 focus:border-silver-400'
                }`}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${
              isLight ? 'text-slate-700' : 'text-silver-300'
            }`}>
              Precise Campus Sector / Room *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Science Complex, Lab 304, Terminal Desk 12"
              className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition focus:outline-none ${
                isLight
                  ? 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-500'
                  : 'bg-[#141414] border border-[#282828] text-silver-100 placeholder-silver-600 focus:bg-[#181818] focus:border-silver-400'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${
              isLight ? 'text-slate-700' : 'text-silver-300'
            }`}>
              Diagnostic Log / Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact details of the malfunction, frequency, and symptoms..."
              className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl resize-none transition focus:outline-none ${
                isLight
                  ? 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-500'
                  : 'bg-[#141414] border border-[#282828] text-silver-100 placeholder-silver-600 focus:bg-[#181818] focus:border-silver-400'
              }`}
            />
          </div>

          <div className={`flex items-center justify-end gap-3 pt-3 border-t ${
            isLight ? 'border-slate-100' : 'border-[#1c1c1c]'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`text-xs sm:text-sm px-4 py-2 font-medium rounded-xl transition cursor-pointer ${
                isLight ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-silver-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-silver-sheen inline-flex items-center gap-2 text-xs sm:text-sm px-5 py-2.5 font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 size={15} className="animate-spin text-black" />}
              <span>Submit Incident</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
