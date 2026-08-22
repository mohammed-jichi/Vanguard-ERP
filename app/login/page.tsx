'use client';

import React, { useState } from 'react';
import { Mail, Lock, Sparkles, Building2, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-100 via-white to-yellow-100 font-sans flex flex-col justify-between p-6 md:p-12">
      
      {/* BACKGROUND DYNAMIC LIGHT WAVES */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-yellow-200 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-sky-200 rounded-full filter blur-3xl"></div>
      </div>

      {/* TOP CONTAINER: LEFT MARKETING & RIGHT LOGIN CARD */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto w-full">
        
        {/* LEFT SIDE TEXT (VANGUARD MARKETING) */}
        <div className="lg:col-span-7 space-y-8 pt-4 md:pt-10">
          
          {/* BRAND HEADLINE */}
          <div className="space-y-3">
            <span className="bg-blue-600/10 text-blue-800 border border-blue-600/20 text-xs px-3.5 py-1 rounded-full font-bold inline-flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Vanguard ERP Ecosystem v2.0
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Vanguard Business Solutions
            </h1>
            <p className="text-lg md:text-xl text-blue-900 font-bold flex flex-wrap items-center gap-2">
              <span className="bg-white/80 px-3 py-1 rounded-lg border border-blue-200 shadow-sm">Restaurants</span>
              <span className="text-amber-500">•</span>
              <span className="bg-white/80 px-3 py-1 rounded-lg border border-blue-200 shadow-sm">Hotels</span>
              <span className="text-amber-500">•</span>
              <span className="bg-white/80 px-3 py-1 rounded-lg border border-blue-200 shadow-sm">Retail</span>
            </p>
          </div>

          {/* VANGUARD PLATFORMS */}
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-xl space-y-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-amber-500" /> Vanguard Platforms
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-extrabold text-slate-700">
              <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-2.5 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> POS
              </div>
              <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-2.5 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" /> Inventory
              </div>
              <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-2.5 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Accounting
              </div>
              <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-2.5 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" /> HR & Payroll
              </div>
              <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-2.5 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" /> CRM & Loyalty
              </div>
              <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-2.5 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Tasks & Calendar
              </div>
              <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-2.5 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" /> Analytics
              </div>
              <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-2.5 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Mobile Apps
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDE (FLOATING LOGIN BOX) */}
        <div className="lg:col-span-5 w-full flex justify-end">
          <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* GLOWING SPINNING VANGUARD LOGO */}
            <div className="flex flex-col items-center justify-center space-y-3 pt-2">
              <div className="relative">
                <img
                  src="/assets/images/vanguard_logo.png"
                  alt="Vanguard Logo"
                  className="w-20 h-20 rounded-2xl object-cover animate-[spin_2s_ease-out_1] drop-shadow-[0_0_20px_rgba(234,179,8,0.85)] border-2 border-amber-400 p-1 bg-slate-900"
                />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-slate-900">Sign In to Vanguard</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Enterprise ERP Portal Access</p>
              </div>
            </div>

            {/* LOGIN FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 block">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pl-10 text-sm text-slate-900 font-bold focus:border-amber-500 focus:bg-white focus:outline-none transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 block">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pl-10 text-sm text-slate-900 font-bold focus:border-amber-500 focus:bg-white focus:outline-none transition-all"
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
                className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-amber-500 hover:from-blue-700 hover:to-amber-600 text-white font-black py-3 px-6 rounded-xl shadow-lg text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01]"
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

            <div className="text-center text-[11px] text-slate-400 font-semibold border-t border-slate-100 pt-4">
              Protected by Vanguard Enterprise Security Systems
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM LEFT BUTTONS */}
      <div className="relative z-10 pt-10 flex flex-wrap items-center gap-4">
        <a
          href="#request-demo"
          className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-xl text-sm transition-all duration-200 hover:scale-105 border border-yellow-400"
        >
          Request A Demo
        </a>
        <a
          href="#contact-us"
          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-2xl shadow-xl text-sm transition-all duration-200 hover:scale-105 border border-blue-500"
        >
          Contact Us
        </a>
      </div>

    </div>
  );
}
