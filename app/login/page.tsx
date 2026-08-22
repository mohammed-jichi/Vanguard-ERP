'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Sparkles, 
  ShoppingCart, 
  Package, 
  Receipt, 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  Smartphone, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

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
    <div className="min-h-screen relative overflow-hidden bg-slate-900 font-sans flex flex-col justify-between p-6 md:p-12">
      
      {/* FLOWING DYNAMIC WAVES OF LIGHTER BLUE AND GOLDEN COLORS */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* LIGHT BLUE AND LIQUID GOLD WAVES SVG */}
        <svg 
          className="absolute w-full h-full object-cover opacity-80"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 900" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.85" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* BACK BLUE LIGHT WAVES */}
          <path 
            fill="url(#blueGradient)" 
            d="M0,192L48,208C96,224,192,256,288,245.3C384,235,480,181,576,170.7C672,160,768,192,864,213.3C960,235,1056,245,1152,229.3C1248,213,1344,171,1392,149.3L1440,128L1440,900L1392,900C1344,900,1248,900,1152,900C1056,900,960,900,864,900C768,900,672,900,576,900C480,900,384,900,288,900C192,900,96,900,48,900L0,900Z"
          />

          {/* DYNAMIC LIQUID GOLD WAVES */}
          <path 
            fill="url(#goldGradient)" 
            filter="url(#glow)"
            d="M0,400C320,300 480,550 800,420C1120,290 1280,480 1440,380L1440,900L0,900Z"
            className="animate-pulse"
          />
        </svg>

        {/* GLOWING ORBS */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-amber-500/25 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* TOP SCENE: LEFT MARKETING TEXT & RIGHT LOGIN BOX */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto w-full">
        
        {/* LEFT MARKETING CONTENT (CLEAN WHITE TYPOGRAPHY) */}
        <div className="lg:col-span-7 space-y-8 pt-4 md:pt-10">
          
          {/* VANGUARD BUSINESS SOLUTIONS */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs px-4 py-1.5 rounded-full font-bold shadow-lg">
              <Sparkles className="w-4 h-4 text-amber-400" /> Vanguard ERP Core Systems
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg">
              Vanguard Business Solutions
            </h1>
            
            <p className="text-lg md:text-xl text-slate-100 font-bold flex flex-wrap items-center gap-3">
              <span className="bg-slate-800/60 backdrop-blur-md border border-slate-700/80 px-4 py-1.5 rounded-xl shadow">Restaurants</span>
              <span className="text-amber-400">•</span>
              <span className="bg-slate-800/60 backdrop-blur-md border border-slate-700/80 px-4 py-1.5 rounded-xl shadow">Hotels</span>
              <span className="text-amber-400">•</span>
              <span className="bg-slate-800/60 backdrop-blur-md border border-slate-700/80 px-4 py-1.5 rounded-xl shadow">Retail</span>
            </p>
          </div>

          {/* VANGUARD PLATFORMS */}
          <div className="space-y-4 pt-2">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2 drop-shadow">
              Vanguard Platforms
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/80 text-white rounded-xl p-3 flex items-center gap-2.5 shadow-md">
                <ShoppingCart className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-extrabold">POS</span>
              </div>
              <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/80 text-white rounded-xl p-3 flex items-center gap-2.5 shadow-md">
                <Package className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-extrabold">Inventory</span>
              </div>
              <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/80 text-white rounded-xl p-3 flex items-center gap-2.5 shadow-md">
                <Receipt className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-extrabold">Accounting</span>
              </div>
              <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/80 text-white rounded-xl p-3 flex items-center gap-2.5 shadow-md">
                <Users className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-extrabold">HR & Payroll</span>
              </div>
              <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/80 text-white rounded-xl p-3 flex items-center gap-2.5 shadow-md">
                <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-extrabold">CRM & Loyalty</span>
              </div>
              <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/80 text-white rounded-xl p-3 flex items-center gap-2.5 shadow-md">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-extrabold">Tasks & Calendar</span>
              </div>
              <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/80 text-white rounded-xl p-3 flex items-center gap-2.5 shadow-md">
                <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-extrabold">Analytics</span>
              </div>
              <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/80 text-white rounded-xl p-3 flex items-center gap-2.5 shadow-md">
                <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-extrabold">Mobile</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDE (SLEEK LOGIN BOX IN UPPER RIGHT QUADRANT) */}
        <div className="lg:col-span-5 w-full flex justify-end">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6 relative">
            
            {/* LOGO ANIMATION & BEHAVIOR (ACTIVELY GLOWING & SHINING WITH GOLDEN LIGHT BURSTS & MOTION TRAILS) */}
            <div className="flex flex-col items-center justify-center space-y-3 pt-2">
              <div className="relative flex items-center justify-center">
                {/* GOLDEN MOTION LIGHT BURST AURA */}
                <div className="absolute w-28 h-28 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 rounded-full filter blur-xl opacity-80 animate-pulse"></div>
                <div className="absolute w-36 h-36 bg-amber-400/30 rounded-full filter blur-2xl animate-ping opacity-50"></div>
                
                {/* LOGO IMAGE WITH 2S SPIN-STOP ANIMATION & GOLDEN FLARE */}
                <img
                  src="/assets/images/vanguard_logo.png"
                  alt="Vanguard Logo"
                  className="w-20 h-20 rounded-2xl object-cover animate-[spin_2s_ease-out_1] drop-shadow-[0_0_25px_rgba(245,158,11,0.9)] border-2 border-amber-400 p-1 bg-slate-900 relative z-10"
                />
              </div>

              <div className="text-center pt-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to Vanguard</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Enterprise Resource Planning Portal</p>
              </div>
            </div>

            {/* FORM ELEMENTS */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 pl-10 text-sm text-slate-900 font-bold focus:border-amber-500 focus:bg-white focus:outline-none transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 pl-10 text-sm text-slate-900 font-bold focus:border-amber-500 focus:bg-white focus:outline-none transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="flex justify-end">
                <a href="#forgot" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-amber-500 hover:from-blue-700 hover:to-amber-600 text-white font-black py-3 px-6 rounded-xl shadow-xl text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01]"
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

            <div className="text-center text-[11px] text-slate-400 font-semibold border-t border-slate-100 pt-4 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Protected by Vanguard Enterprise Security Systems</span>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM LEFT BUTTONS (CRITICAL, ANCHORED ON MARKETING BACKGROUND AREA) */}
      <div className="relative z-10 pt-10 flex flex-wrap items-center gap-4">
        {/* GOLDEN BUTTON (LEFT) */}
        <a
          href="#request-demo"
          className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-6 py-3 rounded-xl shadow-xl text-sm transition-all duration-200 hover:scale-105 border border-amber-400 flex items-center gap-2"
        >
          (Request A Demo)
        </a>

        {/* BLUE BUTTON (RIGHT) */}
        <a
          href="#contact-us"
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3 rounded-xl shadow-xl text-sm transition-all duration-200 hover:scale-105 border border-blue-500 flex items-center gap-2"
        >
          (Contact Us)
        </a>
      </div>

    </div>
  );
}
