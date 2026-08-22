'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Crown } from 'lucide-react';
import { useTenant } from '../lib/TenantContext';

export default function Header() {
  const { currentTenant } = useTenant();
  const router = useRouter();

  return (
    <header dir="rtl" className="w-full bg-[#1e293b] border-b-2 border-[#d97706] px-6 py-4 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
      <div className="flex items-center gap-3">
        <img src="/assets/images/logo.png" alt="Southern Olive Logo" className="w-12 h-12 rounded-full border-2 border-[#d97706] shadow-sm" />
        <div>
          <h1 className="font-black text-lg text-white">{currentTenant.brandNameAr || 'منتوجات زيت وزيتون الجنوب ش.م.م'}</h1>
          <p className="text-xs text-amber-400 font-semibold">{currentTenant.brandNameEn || 'Southern Olive Oil Products, S.A.R.L.'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/admin')}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl shadow-lg text-xs flex items-center gap-2 transition-all border border-amber-300"
        >
          <Crown className="w-4 h-4 text-slate-950" /> Vanguard Admin
        </button>
      </div>
    </header>
  );
}
