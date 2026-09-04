'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get('tab') || 'southern-olive' : 'southern-olive';

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sales: false,
    fleet: true,
    social: false,
    operations: false,
    customers: false,
    accounting: false,
    hr: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col select-none text-xs font-sans print:hidden shrink-0 shadow-2xs">
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Main Navigation Modules</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {/* 1. SALES CONTROL */}
        <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => toggleSection('sales')}
            className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 text-xs text-left"
          >
            <span className="flex items-center gap-2"><span>🛒</span><span>1. Sales Control & POS</span></span>
            <span className="text-[10px] text-slate-400">{openSections.sales ? '▲' : '▼'}</span>
          </button>
          {openSections.sales && (
            <div className="p-1 space-y-0.5 bg-white border-t border-slate-100">
              <Link href="/backoffice/dashboard" className="block px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-[11.5px]">Dashboard Overview</Link>
              <Link href="/backoffice/reportview" className="block px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-[11.5px]">Sales Reports Matrix</Link>
              <Link href="/backoffice/online-orders" className="block px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-[11.5px]">Online Orders Control</Link>
            </div>
          )}
        </div>

        {/* 2. SUPERSONIC FLEET */}
        <div className="border border-[#1e3a2b]/30 rounded-xl overflow-hidden bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => toggleSection('fleet')}
            className="w-full px-3 py-2 bg-[#edf2ee] hover:bg-[#e4ebe5] flex items-center justify-between font-bold text-[#1e3a2b] text-xs text-left"
          >
            <span className="flex items-center gap-2"><span>🚚</span><span>2. SuperSonic Fleet</span></span>
            <span className="text-[10px] text-[#1e3a2b]">{openSections.fleet ? '▲' : '▼'}</span>
          </button>

          {openSections.fleet && (
            <div className="p-1 space-y-0.5 bg-white border-t border-slate-100">
              <Link
                href="/backoffice/fleet?tab=southern-olive"
                className={`block px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${currentTab === 'southern-olive' && pathname.includes('/fleet') ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                🫒 Southern Olive Oil Orders
              </Link>

              <Link
                href="/backoffice/fleet?tab=3pl-orders"
                className={`block px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${currentTab === '3pl-orders' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                🏢 SuperSonic 3PL Orders
              </Link>

              <Link
                href="/backoffice/fleet?tab=dispatch"
                className={`block px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${currentTab === 'dispatch' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                📋 Corridors & Dispatch
              </Link>

              <Link
                href="/backoffice/fleet?tab=path-cards"
                className={`block px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${currentTab === 'path-cards' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                🗂️ Route Cards
              </Link>

              <Link
                href="/backoffice/fleet?tab=vendors"
                className={`block px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${currentTab === 'vendors' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                🤝 Vendor & Merchant Accounts
              </Link>

              <Link
                href="/backoffice/fleet?tab=accounting"
                className={`block px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${currentTab === 'accounting' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                💰 SuperSonic Accounting & Finance
              </Link>

              <Link
                href="/backoffice/fleet?tab=hr"
                className={`block px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${currentTab === 'hr' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                👔 SuperSonic HR & Staff Registry
              </Link>

              <Link
                href="/backoffice/fleet?tab=complaints"
                className={`block px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${currentTab === 'complaints' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                🎧 Customer Complaints & Care
              </Link>

              <Link
                href="/backoffice/fleet?tab=reports"
                className={`block px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${currentTab === 'reports' || currentTab === 'settlements' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                📊 Reports
              </Link>

              <Link
                href="/backoffice/fleet?tab=radar"
                className={`block px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${currentTab === 'radar' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                📡 Live Fleet Radar & GPS
              </Link>

              <Link
                href="/backoffice/fleet?tab=pod"
                className={`block px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${currentTab === 'pod' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                ✍️ Proof of Delivery (POD)
              </Link>

              <Link
                href="/backoffice/fleet?tab=vehicles"
                className={`block px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${currentTab === 'vehicles' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                🚐 Vehicles & Odometer Log
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={<aside className="w-64 bg-white border-r border-slate-200 min-h-screen" />}>
      <SidebarContent />
    </Suspense>
  );
}
