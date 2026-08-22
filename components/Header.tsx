'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Crown } from 'lucide-react';
import { useTenant } from '../lib/TenantContext';

export default function Header() {
  const { currentTenant } = useTenant();
  const tenant: any = {
    ...currentTenant,
    logo_url: (currentTenant as any)?.logo_url || currentTenant?.logoUrl,
    name: currentTenant?.name || currentTenant?.brandNameAr,
  };
  const router = useRouter();

  return (
    <header dir="rtl" className="w-full bg-white border-b border-gray-200 px-6 py-4 text-gray-900 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        {tenant?.logo_url ? (
          <img src={tenant.logo_url} alt={tenant?.name} className="h-10 w-auto object-contain mr-3" />
        ) : (
          <div className="text-xl font-bold font-arabic">{tenant?.name || "Vanguard ERP"}</div>
        )}
        <div>
          <h1 className="font-black text-lg text-gray-900 flex items-center gap-2">
            <span>{tenant?.brandNameAr || tenant?.name || "Vanguard ERP System"}</span>
          </h1>
          {tenant?.brandNameEn && (
            <p className="text-xs text-gray-600 font-semibold">{tenant.brandNameEn}</p>
          )}
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
