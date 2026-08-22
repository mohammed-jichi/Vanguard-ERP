'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Crown } from 'lucide-react';
import { useTenant } from '../lib/TenantContext';

export default function Header() {
  const { currentTenant } = useTenant();
  const tenantName = currentTenant?.brandNameAr;
  const router = useRouter();

  return (
    <header dir="rtl" className="w-full bg-white border-b border-gray-200 px-6 py-4 text-gray-900 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <img src="/assets/images/logo.png" alt="Southern Olive Logo" className="w-12 h-12 rounded-full border-2 border-amber-500 shadow-sm" />
        <div>
          <h1 className="font-black text-lg text-gray-900 flex items-center gap-2">
            <img src="/assets/images/vanguard_logo.png" alt="Vanguard Logo" className="w-8 h-8 object-contain" />
            <span>{tenantName || "Vanguard ERP System"}</span>
          </h1>
          <p className="text-xs text-gray-600 font-semibold">{currentTenant?.brandNameEn || 'Southern Olive Oil Products, S.A.R.L.'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/admin')}
          className="bg-amber-500 hover:bg-amber-600 text-white font-black px-4 py-2 rounded-xl shadow-sm text-xs flex items-center gap-2 transition-all border border-amber-600"
        >
          <Crown className="w-4 h-4 text-white" /> Vanguard Admin
        </button>
      </div>
    </header>
  );
}
