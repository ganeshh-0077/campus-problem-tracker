import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  Users,
  Wrench,
  GraduationCap,
  Search,
  Loader2,
  Mail,
  UserPlus,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface CampusDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddStaff?: () => void;
}

export const CampusDirectoryModal: React.FC<CampusDirectoryModalProps> = ({
  isOpen,
  onClose,
  onOpenAddStaff,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<'staff' | 'students'>('staff');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<Profile[]>([]);
  const [studentList, setStudentList] = useState<Profile[]>([]);

  const loadDirectory = async () => {
    try {
      setLoading(true);
      const data = await api.getDirectory();
      
      // Also check localStorage for any newly registered students or staff
      let localAccounts: any[] = [];
      try {
        const raw = localStorage.getItem('campus_registered_users');
        if (raw) localAccounts = JSON.parse(raw);
      } catch (e) {
        localAccounts = [];
      }

      const staffMap = new Map<string, Profile>();
      data.staff.forEach((s) => staffMap.set(s.id, s));
      localAccounts.filter((a) => a.role === 'Staff').forEach((s) => staffMap.set(s.id, s));

      const studentMap = new Map<string, Profile>();
      data.students.forEach((s) => studentMap.set(s.id, s));
      localAccounts.filter((a) => a.role === 'Student').forEach((s) => studentMap.set(s.id, s));

      setStaffList(Array.from(staffMap.values()));
      setStudentList(Array.from(studentMap.values()));
    } catch (err) {
      console.error('Failed to load campus directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDirectory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredStudents = studentList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border overflow-hidden transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.1)]'
            : 'bg-[#0d0d0d] border-[#262626] text-silver-100 shadow-[0_25px_60px_rgba(0,0,0,0.95)]'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 border-b flex items-start justify-between gap-4 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f0f0f] border-[#1c1c1c]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
                  : 'bg-[#181818] border-[#2e2e2e] text-silver-100'
              }`}
            >
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Campus User Directory</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-silver-400'}`}>
                Verified college roster: maintenance specialists & registered students
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              isLight
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                : 'text-silver-500 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher & Search */}
        <div
          className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isLight ? 'bg-white border-slate-100' : 'bg-[#0d0d0d] border-[#1c1c1c]'
          }`}
        >
          {/* Tabs */}
          <div
            className={`inline-flex items-center p-1 rounded-xl border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#141414] border-[#242424]'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'staff'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'btn-silver-sheen text-black shadow-sm'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-800'
                  : 'text-silver-400 hover:text-white'
              }`}
            >
              <Wrench size={13} />
              <span>Staff Specialists</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  activeTab === 'staff'
                    ? isLight
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-black/20 text-black font-extrabold'
                    : isLight
                    ? 'bg-slate-200 text-slate-600'
                    : 'bg-[#222222] text-silver-400'
                }`}
              >
                {staffList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'students'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'btn-silver-sheen text-black shadow-sm'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-800'
                  : 'text-silver-400 hover:text-white'
              }`}
            >
              <GraduationCap size={13} />
              <span>Student Learners</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  activeTab === 'students'
                    ? isLight
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-black/20 text-black font-extrabold'
                    : isLight
                    ? 'bg-slate-200 text-slate-600'
                    : 'bg-[#222222] text-silver-400'
                }`}
              >
                {studentList.length}
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              size={14}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isLight ? 'text-slate-400' : 'text-silver-500'
              }`}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${activeTab === 'staff' ? 'staff members' : 'students'}...`}
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none transition ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-slate-400 placeholder-slate-400'
                  : 'bg-[#141414] border-[#282828] text-silver-100 focus:bg-[#181818] focus:border-silver-400 placeholder-silver-600'
              }`}
            />
          </div>
        </div>

        {/* Directory Content List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1 max-h-[50vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2
                size={26}
                className={`animate-spin mb-2 ${isLight ? 'text-slate-600' : 'text-silver-300'}`}
              />
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-silver-500'}`}>
                Querying campus database...
              </p>
            </div>
          ) : activeTab === 'staff' ? (
            filteredStaff.length === 0 ? (
              <div className="text-center py-10">
                <p className={`text-xs italic ${isLight ? 'text-slate-400' : 'text-silver-500'}`}>
                  No staff members match "{search}".
                </p>
              </div>
            ) : (
              filteredStaff.map((staff) => (
                <div
                  key={staff.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    isLight
                      ? 'bg-slate-50/70 hover:bg-slate-50 border-slate-200/80 shadow-xs'
                      : 'bg-[#121212] hover:bg-[#161616] border-[#222222]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border shrink-0 ${
                        isLight
                          ? 'bg-sky-100 text-sky-800 border-sky-200'
                          : 'bg-[#1a1a1a] text-silver-200 border-[#2e2e2e]'
                      }`}
                    >
                      <Wrench size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold leading-snug">{staff.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[11px] flex items-center gap-1 font-mono ${
                            isLight ? 'text-slate-500' : 'text-silver-400'
                          }`}
                        >
                          <Mail size={11} />
                          <span>{staff.email}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isLight
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-[#0c1c14] text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      Staff Member
                    </span>
                  </div>
                </div>
              ))
            )
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-10">
              <p className={`text-xs italic ${isLight ? 'text-slate-400' : 'text-silver-500'}`}>
                No students match "{search}".
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                  isLight
                    ? 'bg-slate-50/70 hover:bg-slate-50 border-slate-200/80 shadow-xs'
                    : 'bg-[#121212] hover:bg-[#161616] border-[#222222]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border shrink-0 ${
                      isLight
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-[#1a1a1a] text-silver-200 border-[#2e2e2e]'
                    }`}
                  >
                    <GraduationCap size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold leading-snug">{student.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[11px] flex items-center gap-1 font-mono ${
                          isLight ? 'text-slate-500' : 'text-silver-400'
                        }`}
                      >
                        <Mail size={11} />
                        <span>{student.email}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isLight
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-[#161616] text-silver-400 border-[#282828]'
                    }`}
                  >
                    Registered Student
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0a0a0a] border-[#1c1c1c]'
          }`}
        >
          <div>
            {activeTab === 'staff' && onOpenAddStaff && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddStaff();
                }}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  isLight
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : 'btn-silver-sheen text-black font-bold'
                }`}
              >
                <UserPlus size={14} />
                <span>Provision New Staff</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`text-xs px-4 py-2 font-medium rounded-xl transition cursor-pointer ${
              isLight
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                : 'bg-[#181818] hover:bg-[#222222] border border-[#2e2e2e] text-silver-200 hover:text-white'
            }`}
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
