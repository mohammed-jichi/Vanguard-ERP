'use client';

import React, { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  const platforms = [
    'POS',
    'Inventory',
    'Accounting',
    'Human Resources & Payroll',
    'CRM & Loyalty',
    'Tasks & Appointments',
    'Analytics',
    'Mobile',
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-slate-950 p-6 md:p-12 font-sans">
      
      {/* 1. BACKGROUND WAVES VIA CSS BLURRED BLOBS */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-600/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-yellow-500/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 -left-20 w-[500px] h-[500px] bg-sky-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* 2. MAIN LAYOUT STRUCTURE */}
      <div className="relative z-10 max-w-7xl w-full flex flex-col lg:flex-row items-center justify-between gap-12">

        {/* 3. LEFT COLUMN (MARKETING CONTENT) */}
        <div className="flex-1 w-full text-left space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md mb-2">
              Vanguard Business Solutions
            </h1>
            <p className="text-lg md:text-xl font-semibold text-blue-200 mb-8">
              (Restaurants, Hotels, Retail)
            </p>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 drop-shadow">
              Vanguard Platforms
            </h2>
            <div className="flex flex-wrap gap-3 max-w-2xl">
              {platforms.map((platform) => (
                <span
                  key={platform}
                  className="bg-white/10 border border-white/20 backdrop-blur-sm text-white font-medium text-sm rounded-full px-4 py-2 shadow-sm transition-all hover:bg-white/20 cursor-default"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap gap-4 pt-6">
            <button
              onClick={() => (window.location.href = '/')}
              className="bg-[#123b70] hover:bg-[#0b254a] text-white font-bold px-8 py-3.5 rounded-xl shadow-xl transition-all border border-blue-400/30 hover:scale-105 cursor-pointer"
            >
              Contact Us
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className="bg-gradient-to-r from-[#ab8320] to-[#d4b055] hover:brightness-110 text-white font-bold px-8 py-3.5 rounded-xl shadow-xl transition-all border border-yellow-300/50 hover:scale-105 cursor-pointer"
            >
              Request A Demo
            </button>
          </div>
        </div>

        {/* 4. RIGHT COLUMN (THE GLASSMORPHISM LOGIN CARD) */}
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-2xl p-8 max-w-md w-full relative">
            
            {/* LOGO AREA WITH SOFT GOLDEN GLOW */}
            <div className="flex justify-center mb-8 relative">
              <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse"></div>
              <img
                src="/vanguard.jpg"
                alt="Vanguard Logo"
                className="h-28 object-contain relative z-10"
              />
            </div>

            {/* LOGIN FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-blue-100 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border border-white/10 focus:border-blue-400 focus:bg-white/10 text-white placeholder-gray-400 rounded-xl p-3.5 text-sm w-full outline-none transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-100 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border border-white/10 focus:border-blue-400 focus:bg-white/10 text-white placeholder-gray-400 rounded-xl p-3.5 text-sm w-full outline-none transition-all shadow-inner"
                />
              </div>

              <div className="flex justify-end">
                <a
                  href="#forgot"
                  className="text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors"
                >
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#123b70] hover:bg-[#0b254a] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all text-base tracking-wide w-full cursor-pointer hover:scale-[1.01]"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center text-[11px] text-slate-400 font-semibold border-t border-white/10 mt-6 pt-4">
              Protected by Vanguard Enterprise Security Systems
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}