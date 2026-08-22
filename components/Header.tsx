'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Crown, LogOut, UserCheck, Settings, Globe } from 'lucide-react';
import { useTenant } from '../lib/TenantContext';

export default function Header() {
  const { currentTenant } = useTenant();
  const router = useRouter();

  return (
    <header dir="rtl" className="w-full bg-[#0f172a] border-b-4 border-amber-500 px-6 py-4 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
      {/* LEFT SIDE (Branding) */}
      <div className="flex items-center gap-3">
        <img 
          src="/assets/images/vanguard_logo.png" 
          alt="Vanguard Logo" 
          className="h-12 w-12 rounded-full border-2 border-amber-400 object-cover shadow-md" 
        />
        <div>
          <h1 className="font-black text-xl text-amber-400 tracking-wide flex items-center gap-2">
            VANGUARD ERP SYSTEM
          </h1>
          <p className="text-xs text-slate-300 font-semibold">
            Enterprise Resource Planning System
          </p>
        </div>
      </div>

      {/* RIGHT SIDE (Navigation / Actions) */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => router.push('/admin')}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl shadow text-xs flex items-center gap-1.5 transition-all border border-amber-300"
        >
          <Crown className="w-4 h-4 text-slate-950" /> /admin
        </button>

        <a 
          href="#roles" 
          className="text-xs font-bold text-slate-200 hover:text-amber-400 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-amber-400/50 flex items-center gap-1.5 transition-all"
        >
          <UserCheck className="w-3.5 h-3.5 text-amber-400" /> /signed in Roles
        </a>

        <a 
          href="#settings" 
          className="text-xs font-bold text-slate-200 hover:text-amber-400 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-amber-400/50 flex items-center gap-1.5 transition-all"
        >
          <Settings className="w-3.5 h-3.5 text-amber-400" /> /setting
        </a>

        <a 
          href="#language" 
          className="text-xs font-bold text-slate-200 hover:text-amber-400 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-amber-400/50 flex items-center gap-1.5 transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" /> / Language
        </a>

        <button
          onClick={() => router.push('/landing')}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <LogOut className="w-3.5 h-3.5 text-red-400" /> /logout
        </button>
      </div>
    </header>
  );
}
