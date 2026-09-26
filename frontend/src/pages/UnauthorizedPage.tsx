import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent text-silver-100 flex items-center justify-center p-4 antialiased">
      <div className="bg-[#0d0d0d] rounded-3xl max-w-md w-full p-8 text-center shadow-[0_16px_50px_rgba(0,0,0,0.95)] border border-[#262626]">
        <div className="w-14 h-14 bg-[#1c0d0d] text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={28} />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Access Restricted</h1>
        <p className="text-xs text-silver-400 mb-6 leading-relaxed">
          Your credentials do not possess the required clearance level to access this campus gateway.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-silver-sheen inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Return to Matrix</span>
        </button>
      </div>
    </div>
  );
};
