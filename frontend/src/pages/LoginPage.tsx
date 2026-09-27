import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  GraduationCap,
  Wrench,
  ShieldCheck,
  LogIn,
  UserPlus,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  KeyRound,
  Lock,
  Mail,
  User,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Step 1: null = choosing role; 'Student' | 'Staff' | 'Admin' = credentials step
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Auth mode: Only students can toggle 'signup'; Staff & Admin are strictly 'signin'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPasskey, setAdminPasskey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setAuthMode('signin');
    setName('');
    setEmail('');
    setPassword('');
    setAdminPasskey('');
    setError(null);
  };

  const handleBackToRoles = () => {
    setSelectedRole(null);
    setName('');
    setEmail('');
    setPassword('');
    setAdminPasskey('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    if (!email.trim() || !password.trim()) {
      setError('Please provide email and password');
      return;
    }

    // Security Rule 1: Admin portal requires valid Admin Passkey
    if (selectedRole === 'Admin') {
      if (adminPasskey.trim() !== 'Pass@123') {
        setError('Invalid Admin Passkey. Access is restricted to authorized campus administrators.');
        return;
      }
    }

    // Security Rule 2: Only students can sign up directly. Staff & Admin must use pre-assigned credentials
    if (selectedRole !== 'Student' && authMode === 'signup') {
      setError(`Direct registration is restricted for ${selectedRole}. Only campus administrators can issue accounts.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (authMode === 'signup') {
        if (!name.trim()) {
          setError('Please provide your full name');
          setLoading(false);
          return;
        }
        await signUp(email.trim(), password, name.trim(), 'Student');
      } else {
        await signIn(email.trim(), password, selectedRole);
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-transparent flex items-center justify-center p-4 antialiased transition-colors ${
        isLight ? 'text-slate-900' : 'text-silver-100'
      }`}
    >
      <div className="w-full max-w-2xl py-6">
        {/* Top Control Bar with Theme Switcher */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                isLight ? 'text-slate-500' : 'text-silver-400'
              }`}
            >
              Interface Theme
            </span>
          </div>
          {/* Segmented Galaxy vs Light Theme Switcher */}
          <ThemeToggle />
        </div>

        {/* App Title Header */}
        <div className="text-center mb-8">
          <div
            className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center font-black text-lg mb-4 shadow-sm transition ${
              isLight
                ? 'bg-slate-900 text-white'
                : 'bg-gradient-to-br from-white via-silver-200 to-silver-500 text-black shadow-[0_0_25px_rgba(255,255,255,0.18)]'
            }`}
          >
            CIT
          </div>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono uppercase tracking-widest mb-2 ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-[#121212] border-[#2a2a2a] text-silver-400'
            }`}
          >
            <Sparkles size={11} className={isLight ? 'text-amber-500' : 'text-silver-300'} />
            <span>Autonomous Facilities Gateway</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-black tracking-tight uppercase ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Campus Issue Tracker
          </h1>
          <p
            className={`text-xs sm:text-sm mt-1 max-w-md mx-auto ${
              isLight ? 'text-slate-500' : 'text-silver-400'
            }`}
          >
            Next-generation enterprise incident management & facility operations
          </p>
        </div>

        {/* STEP 1: Select Role / Portal */}
        {!selectedRole ? (
          <div
            className={`rounded-3xl p-6 sm:p-8 border space-y-6 animate-fade-in transition-all ${
              isLight
                ? 'bg-white/95 border-slate-200 shadow-[0_12px_45px_rgba(0,0,0,0.06)]'
                : 'bg-[#0d0d0d] border-[#222222] shadow-[0_12px_45px_rgba(0,0,0,0.85)]'
            }`}
          >
            <div className="text-center">
              <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-silver-100'}`}>
                Select Your Campus Portal to Authenticate
              </h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-silver-500'}`}>
                Choose your institutional domain to enter the portal
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Student Card */}
              <button
                type="button"
                onClick={() => handleRoleSelect('Student')}
                className={`text-left p-5 rounded-2xl border transition-all duration-200 group flex flex-col justify-between cursor-pointer ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 hover:shadow-md'
                    : 'bg-[#111111] border-[#242424] hover:border-silver-400/60 hover:bg-[#141414] hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.9)]'
                }`}
              >
                <div>
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition border ${
                      isLight
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-[#181818] border-[#2e2e2e] text-silver-200'
                    }`}
                  >
                    <GraduationCap size={22} className={isLight ? 'text-emerald-700' : 'text-silver-200'} />
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1.5 border ${
                      isLight
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-[#161616] border-[#282828] text-silver-400'
                    }`}
                  >
                    Learner
                  </span>
                  <h3
                    className={`text-base font-bold transition ${
                      isLight
                        ? 'text-slate-900 group-hover:text-emerald-700'
                        : 'text-silver-100 group-hover:text-white'
                    }`}
                  >
                    Student Portal
                  </h3>
                  <p
                    className={`text-xs mt-2 leading-relaxed font-normal ${
                      isLight ? 'text-slate-500' : 'text-silver-400'
                    }`}
                  >
                    Submit campus complaints, check status & monitor technician progress.
                  </p>
                </div>
                <div
                  className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-semibold transition ${
                    isLight
                      ? 'border-slate-100 text-emerald-700'
                      : 'border-[#1c1c1c] text-silver-300 group-hover:text-white'
                  }`}
                >
                  <span>Enter Student Portal</span>
                  <ChevronRight size={15} className="group-hover:translate-x-1 transition" />
                </div>
              </button>

              {/* Staff Card */}
              <button
                type="button"
                onClick={() => handleRoleSelect('Staff')}
                className={`text-left p-5 rounded-2xl border transition-all duration-200 group flex flex-col justify-between cursor-pointer ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 hover:shadow-md'
                    : 'bg-[#111111] border-[#242424] hover:border-silver-400/60 hover:bg-[#141414] hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.9)]'
                }`}
              >
                <div>
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition border ${
                      isLight
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-[#181818] border-[#2e2e2e] text-silver-200'
                    }`}
                  >
                    <Wrench size={22} className={isLight ? 'text-blue-700' : 'text-silver-200'} />
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1.5 border ${
                      isLight
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'bg-[#161616] border-[#282828] text-silver-400'
                    }`}
                  >
                    Technician
                  </span>
                  <h3
                    className={`text-base font-bold transition ${
                      isLight
                        ? 'text-slate-900 group-hover:text-blue-700'
                        : 'text-silver-100 group-hover:text-white'
                    }`}
                  >
                    Staff Portal
                  </h3>
                  <p
                    className={`text-xs mt-2 leading-relaxed font-normal ${
                      isLight ? 'text-slate-500' : 'text-silver-400'
                    }`}
                  >
                    Manage assigned tickets, log repair milestones & resolve complaints.
                  </p>
                </div>
                <div
                  className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-semibold transition ${
                    isLight
                      ? 'border-slate-100 text-blue-700'
                      : 'border-[#1c1c1c] text-silver-300 group-hover:text-white'
                  }`}
                >
                  <span>Enter Staff Portal</span>
                  <ChevronRight size={15} className="group-hover:translate-x-1 transition" />
                </div>
              </button>

              {/* Admin Card */}
              <button
                type="button"
                onClick={() => handleRoleSelect('Admin')}
                className={`text-left p-5 rounded-2xl border transition-all duration-200 group flex flex-col justify-between cursor-pointer ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-purple-500 hover:bg-purple-50/20 hover:shadow-md'
                    : 'bg-[#111111] border-[#242424] hover:border-silver-400/60 hover:bg-[#141414] hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.9)]'
                }`}
              >
                <div>
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition border ${
                      isLight
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-[#181818] border-[#2e2e2e] text-silver-200'
                    }`}
                  >
                    <ShieldCheck size={22} className={isLight ? 'text-purple-700' : 'text-silver-200'} />
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1.5 border ${
                      isLight
                        ? 'bg-purple-50 border-purple-200 text-purple-800'
                        : 'bg-[#161616] border-[#282828] text-silver-400'
                    }`}
                  >
                    Oversight
                  </span>
                  <h3
                    className={`text-base font-bold transition ${
                      isLight
                        ? 'text-slate-900 group-hover:text-purple-700'
                        : 'text-silver-100 group-hover:text-white'
                    }`}
                  >
                    Admin Portal
                  </h3>
                  <p
                    className={`text-xs mt-2 leading-relaxed font-normal ${
                      isLight ? 'text-slate-500' : 'text-silver-400'
                    }`}
                  >
                    Oversee all incidents, provision staff, and access institutional metrics.
                  </p>
                </div>
                <div
                  className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-semibold transition ${
                    isLight
                      ? 'border-slate-100 text-purple-700'
                      : 'border-[#1c1c1c] text-silver-300 group-hover:text-white'
                  }`}
                >
                  <span>Enter Admin Portal</span>
                  <ChevronRight size={15} className="group-hover:translate-x-1 transition" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: Sign In / Sign Up Form for Chosen Role */
          <div
            className={`rounded-3xl p-6 sm:p-8 border animate-fade-in max-w-md mx-auto transition-all ${
              isLight
                ? 'bg-white/95 border-slate-200 shadow-[0_16px_50px_rgba(0,0,0,0.08)]'
                : 'bg-[#0d0d0d] border-[#262626] shadow-[0_16px_50px_rgba(0,0,0,0.95)]'
            }`}
          >
            {/* Top Bar with Role Info and Back Button */}
            <div
              className={`flex items-center justify-between pb-4 border-b mb-5 ${
                isLight ? 'border-slate-100' : 'border-[#1c1c1c]'
              }`}
            >
              <button
                type="button"
                onClick={handleBackToRoles}
                className={`inline-flex items-center gap-1.5 text-xs transition font-medium cursor-pointer ${
                  isLight ? 'text-slate-500 hover:text-slate-900' : 'text-silver-400 hover:text-white'
                }`}
              >
                <ArrowLeft size={13} />
                <span>Return to Portals</span>
              </button>

              <div
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold border ${
                  isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-800'
                    : 'bg-[#161616] border-[#2e2e2e] text-silver-200'
                }`}
              >
                {selectedRole === 'Admin' ? (
                  <ShieldCheck size={13} className={isLight ? 'text-purple-600' : ''} />
                ) : selectedRole === 'Staff' ? (
                  <Wrench size={13} className={isLight ? 'text-blue-600' : ''} />
                ) : (
                  <GraduationCap size={13} className={isLight ? 'text-emerald-600' : ''} />
                )}
                <span>{selectedRole} Gateway</span>
              </div>
            </div>

            {/* Role-Specific Security Banners & Tabs */}
            {selectedRole === 'Student' ? (
              /* Students can toggle Sign In vs Sign Up */
              <div
                className={`grid grid-cols-2 p-1 rounded-xl mb-5 border ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#141414] border-[#242424]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setName('');
                    setPassword('');
                    setError(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                    authMode === 'signin'
                      ? isLight
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                        : 'bg-[#222222] text-white shadow-sm border border-[#383838]'
                      : isLight
                      ? 'text-slate-500 hover:text-slate-800'
                      : 'text-silver-500 hover:text-silver-300'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setName('');
                    setPassword('');
                    setError(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                    authMode === 'signup'
                      ? isLight
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                        : 'bg-[#222222] text-white shadow-sm border border-[#383838]'
                      : isLight
                      ? 'text-slate-500 hover:text-slate-800'
                      : 'text-silver-500 hover:text-silver-300'
                  }`}
                >
                  New Student? Register
                </button>
              </div>
            ) : selectedRole === 'Staff' ? (
              /* Staff: Strictly Sign In */
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2.5 mb-5 border ${
                  isLight
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-[#111111] border-[#282828] text-silver-300'
                }`}
              >
                <ShieldCheck size={16} className={`shrink-0 mt-0.5 ${isLight ? 'text-blue-600' : 'text-silver-400'}`} />
                <div>
                  <p className={`font-bold ${isLight ? 'text-blue-950' : 'text-silver-100'}`}>
                    Authorized Personnel Only
                  </p>
                  <p className={`text-[11px] mt-0.5 leading-relaxed ${isLight ? 'text-blue-800' : 'text-silver-400'}`}>
                    Staff credentials are issued directly by Campus Administration. Enter your assigned email & password.
                  </p>
                </div>
              </div>
            ) : (
              /* Admin: Strictly Sign In with Passkey Requirement */
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2.5 mb-5 border ${
                  isLight
                    ? 'bg-purple-50 border-purple-200 text-purple-900'
                    : 'bg-[#111111] border-[#282828] text-silver-300'
                }`}
              >
                <KeyRound size={16} className={`shrink-0 mt-0.5 ${isLight ? 'text-purple-600' : 'text-silver-300'}`} />
                <div>
                  <p className={`font-bold ${isLight ? 'text-purple-950' : 'text-silver-100'}`}>
                    Restricted Administration Access
                  </p>
                  <p className={`text-[11px] mt-0.5 leading-relaxed ${isLight ? 'text-purple-800' : 'text-silver-400'}`}>
                    Requires verified administrator identity and institutional security passkey.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  isLight
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-[#1c0d0d] border-rose-500/40 text-rose-300'
                }`}
              >
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form
              key={`form-${selectedRole}-${authMode}`}
              id={`form-${selectedRole.toLowerCase()}-${authMode}`}
              name={`form_${selectedRole.toLowerCase()}_${authMode}`}
              onSubmit={handleSubmit}
              className="space-y-4"
              autoComplete="on"
            >
              {/* Name field (Only shown for Student Sign Up) */}
              {selectedRole === 'Student' && authMode === 'signup' && (
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      isLight ? 'text-slate-700' : 'text-silver-300'
                    }`}
                  >
                    Student Full Name *
                  </label>
                  <div className="relative">
                    <User
                      size={15}
                      className={`absolute left-3.5 top-3 ${isLight ? 'text-slate-400' : 'text-silver-500'}`}
                    />
                    <input
                      id="student-name"
                      name="student_name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      className={`w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border focus:outline-none transition ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-slate-500 placeholder-slate-400'
                          : 'bg-[#141414] border-[#282828] text-silver-100 focus:bg-[#181818] focus:border-silver-400 placeholder-silver-600'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-1 ${
                    isLight ? 'text-slate-700' : 'text-silver-300'
                  }`}
                >
                  Institutional Email *
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className={`absolute left-3.5 top-3 ${isLight ? 'text-slate-400' : 'text-silver-500'}`}
                  />
                  <input
                    id={`${selectedRole.toLowerCase()}-email`}
                    name={`${selectedRole.toLowerCase()}_email`}
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      selectedRole === 'Admin'
                        ? 'admin@campus.edu'
                        : selectedRole === 'Staff'
                        ? 'staff@campus.edu'
                        : 'student@campus.edu'
                    }
                    className={`w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border focus:outline-none transition ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-slate-500 placeholder-slate-400'
                        : 'bg-[#141414] border-[#282828] text-silver-100 focus:bg-[#181818] focus:border-silver-400 placeholder-silver-600'
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-1 ${
                    isLight ? 'text-slate-700' : 'text-silver-300'
                  }`}
                >
                  Access Password *
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className={`absolute left-3.5 top-3 ${isLight ? 'text-slate-400' : 'text-silver-500'}`}
                  />
                  <input
                    id={`${selectedRole.toLowerCase()}-password`}
                    name={`${selectedRole.toLowerCase()}_password`}
                    type="password"
                    autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border focus:outline-none transition ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-slate-500 placeholder-slate-400'
                        : 'bg-[#141414] border-[#282828] text-silver-100 focus:bg-[#181818] focus:border-silver-400 placeholder-silver-600'
                    }`}
                  />
                </div>
              </div>

              {/* Admin Passkey (ONLY for Admin Role) */}
              {selectedRole === 'Admin' && (
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 flex items-center justify-between ${
                      isLight ? 'text-purple-900' : 'text-silver-300'
                    }`}
                  >
                    <span>Admin Security Passkey *</span>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-purple-600' : 'text-silver-500'}`}>
                      Institutional Passkey
                    </span>
                  </label>
                  <div className="relative">
                    <KeyRound
                      size={15}
                      className={`absolute left-3.5 top-3 ${isLight ? 'text-purple-500' : 'text-silver-400'}`}
                    />
                    <input
                      id="admin-security-passkey"
                      name="admin_security_passkey"
                      type="password"
                      autoComplete="one-time-code"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      required
                      value={adminPasskey}
                      onChange={(e) => setAdminPasskey(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border font-mono focus:outline-none transition ${
                        isLight
                          ? 'bg-purple-50/50 border-purple-200 text-purple-900 focus:bg-white focus:border-purple-500 placeholder-purple-300'
                          : 'bg-[#141414] border-[#303030] text-silver-100 focus:bg-[#181818] focus:border-silver-300 placeholder-silver-600'
                      }`}
                    />
                  </div>
                  <p className={`text-[11px] mt-1 ${isLight ? 'text-purple-600' : 'text-silver-500'}`}>
                    Confidential passkey required for administrator elevation.
                  </p>
                </div>
              )}

              {/* Role Confirmation for Student Signup */}
              {selectedRole === 'Student' && authMode === 'signup' && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                    isLight
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-[#111111] border-[#2a2a2a] text-silver-300'
                  }`}
                >
                  <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                  <span>
                    Account will be provisioned with <strong>Student</strong> rights (Complaint filing & progress tracking).
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50 ${
                  isLight
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : 'btn-silver-sheen text-black'
                }`}
              >
                {loading ? (
                  <Loader2 size={16} className={`animate-spin ${isLight ? 'text-white' : 'text-black'}`} />
                ) : authMode === 'signup' ? (
                  <>
                    <UserPlus size={15} />
                    <span>Create Student Account</span>
                  </>
                ) : (
                  <>
                    <LogIn size={15} />
                    <span>Authenticate to {selectedRole} Portal</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
