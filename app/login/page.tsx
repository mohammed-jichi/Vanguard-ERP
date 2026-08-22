'use client';

import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-slate-950 p-2 md:p-6 flex items-center justify-center font-sans">
      
      {/* MOCKUP BROWSER WINDOW CONTAINER */}
      <div className="w-full max-w-7xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[850px] relative">
        
        {/* BROWSER TOP CONTROL BAR */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-4 py-1 text-xs text-slate-300 font-semibold flex items-center gap-2 w-full max-w-md mx-auto justify-center">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>vanguard.com/login</span>
          </div>

          <div className="w-12"></div>
        </div>

        {/* MAIN CANVAS WITH LIQUID GOLD AND LIGHTER BLUE WAVE BACKGROUND */}
        <div className="relative flex-1 flex flex-col justify-between p-6 md:p-12 overflow-hidden">
          
          {/* FLOWING LIQUID GOLD & LIGHTER BLUE WAVES SVG */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg 
              className="w-full h-full object-cover" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 1440 900" 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="bgSky" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e3a8a" />
                  <stop offset="50%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>

                <linearGradient id="liquidGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
                </linearGradient>

                <linearGradient id="lightBlueWave" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.25" />
                </linearGradient>

                <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="16" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* BASE SKY BLUE GRADIENT */}
              <rect width="1440" height="900" fill="url(#bgSky)" />

              {/* LIGHTER BLUE WAVE STRANDS */}
              <path 
                fill="url(#lightBlueWave)" 
                d="M0,160 C320,300 480,50 800,220 C1120,390 1280,180 1440,280 L1440,900 L0,900 Z" 
              />

              {/* LIQUID GOLD RIBBON WAVES */}
              <path 
                fill="url(#liquidGold)" 
                filter="url(#goldGlow)"
                d="M0,450 C360,250 540,650 900,400 C1260,150 1380,520 1440,420 L1440,900 L0,900 Z" 
              />
            </svg>
          </div>

          {/* TOP SECTION: LEFT MARKETING TEXT & UPPER RIGHT LOGIN BOX */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
            
            {/* LEFT MARKETING CONTENT (CLEAN WHITE TYPOGRAPHY) */}
            <div className="lg:col-span-7 space-y-8 pt-4 md:pt-8">
              
              {/* VANGUARD BUSINESS SOLUTIONS */}
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
                  Vanguard Business Solutions
                </h1>
                <p className="text-lg md:text-xl font-bold text-amber-200 mt-1 drop-shadow-sm">
                  (Restaurants, Hotels, Retail)
                </p>
              </div>

              {/* VANGUARD PLATFORMS */}
              <div className="pt-2">
                <h2 className="text-3xl font-extrabold text-amber-300 tracking-tight drop-shadow-md">
                  Vanguard Platforms
                </h2>
                <p className="text-sm md:text-base font-semibold text-slate-100 mt-2 max-w-2xl leading-relaxed drop-shadow">
                  POS, Inventory, Accounting, Human Resources & Payroll, CRM & Loyalty, Tasks & Appointments, Analytics, Mobile
                </p>
              </div>

            </div>

            {/* UPPER RIGHT SLEEK LOGIN BOX */}
            <div className="lg:col-span-5 w-full flex justify-end">
              <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/60 space-y-6 relative">
                
                {/* STYLIZED VANGUARD LOGO ACTIVELY GLOWING AND SHINING WITH GOLDEN LIGHT BURSTS */}
                <div className="flex flex-col items-center justify-center pt-2">
                  <div className="relative flex items-center justify-center">
                    {/* GOLDEN SUNBURST FLARE */}
                    <div className="absolute w-32 h-32 bg-amber-400/60 rounded-full blur-2xl animate-pulse"></div>
                    <div className="absolute w-40 h-40 bg-yellow-300/30 rounded-full blur-3xl animate-ping"></div>

                    {/* V SHIELD SHINING LOGO WITH SPIN STOP ANIMATION */}
                    <div className="w-20 h-20 bg-slate-900 rounded-2xl p-2 border-2 border-amber-400 shadow-2xl relative z-10 flex items-center justify-center animate-[spin_2s_ease-out_1] drop-shadow-[0_0_25px_rgba(245,158,11,0.95)]">
                      <img
                        src="/assets/images/vanguard_logo.png"
                        alt="Vanguard Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* FORM FIELDS */}
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-900 font-medium rounded-lg p-3 text-sm focus:border-blue-600 focus:outline-none transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-900 font-medium rounded-lg p-3 text-sm focus:border-blue-600 focus:outline-none transition-all shadow-sm"
                    />
                  </div>

                  <div className="flex justify-end">
                    <a href="#forgot" className="text-xs font-bold text-amber-600 hover:underline">
                      Forgot Password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#003882] hover:bg-[#002860] text-white font-bold py-3.5 rounded-lg shadow-lg text-sm transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span>Signing in...</span>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center text-[11px] text-slate-400 font-semibold border-t border-slate-100 pt-3">
                  Protected by Vanguard Enterprise Security Systems
                </div>

              </div>
            </div>

          </div>

          {/* BOTTOM LEFT BUTTONS (ANCHORED ON MARKETING BACKGROUND AREA) */}
          <div className="relative z-10 pt-12 flex items-center gap-4">
            
            {/* VANGUARD BLUE (CONTACT US) */}
            <a
              href="#contact-us"
              className="bg-[#003882] hover:bg-[#002860] text-white font-bold px-6 py-3 rounded-lg shadow-xl border border-blue-400/40 text-sm transition-all hover:scale-105"
            >
              Vanguard Blue (Contact Us)
            </a>

            {/* VANGUARD GOLDEN (REQUEST A DEMO) */}
            <a
              href="#request-demo"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-6 py-3 rounded-lg shadow-xl border border-amber-400/40 text-sm transition-all hover:scale-105"
            >
              Vanguard Golden (Request A Demo)
            </a>

          </div>

        </div>

      </div>

    </div>
  );
}
