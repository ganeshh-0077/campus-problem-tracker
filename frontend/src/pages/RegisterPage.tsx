import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { UserPlus, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signUp(email, password, name, role);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-silver-100 flex items-center justify-center p-4 antialiased">
      <div className="bg-[#0d0d0d] rounded-3xl max-w-md w-full p-8 shadow-[0_16px_50px_rgba(0,0,0,0.95)] border border-[#262626]">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-white via-silver-200 to-silver-500 flex items-center justify-center text-black font-black text-lg shadow-[0_0_20px_rgba(255,255,255,0.18)] mb-3">
            CIT
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase">
            Create an Account
          </h1>
          <p className="text-xs text-silver-500 mt-1">
            Join the campus operations network to log and track issues
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#1c0d0d] border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-silver-300 mb-1">
              Full Name
            </label>
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Chen"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#141414] border border-[#282828] text-silver-100 placeholder-silver-600 rounded-xl focus:outline-none focus:border-silver-400 focus:bg-[#181818] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-silver-300 mb-1">
              Email Address
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@campus.edu"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#141414] border border-[#282828] text-silver-100 placeholder-silver-600 rounded-xl focus:outline-none focus:border-silver-400 focus:bg-[#181818] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-silver-300 mb-1">
              Password
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#141414] border border-[#282828] text-silver-100 placeholder-silver-600 rounded-xl focus:outline-none focus:border-silver-400 focus:bg-[#181818] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-silver-300 mb-1">
              Campus Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#141414] border border-[#282828] text-silver-200 rounded-xl focus:outline-none focus:border-silver-400 transition cursor-pointer"
            >
              <option value="Student" className="bg-[#141414]">Student (Report & track campus complaints)</option>
              <option value="Staff" className="bg-[#141414]">Staff (Resolve assigned maintenance tickets)</option>
              <option value="Admin" className="bg-[#141414]">Admin (Assign staff & manage campus operations)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-silver-sheen w-full py-3 px-4 font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin text-black" />
            ) : (
              <>
                <UserPlus size={15} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-xs text-silver-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-silver-300 hover:text-white underline decoration-[#333333]">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
