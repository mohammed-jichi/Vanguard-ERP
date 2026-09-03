'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dispatch';

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sales: true,
    fleet: true, // Expanded by default
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
      
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Main Navigation Modules</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        
        {/* ================================================================= */}
        {/* 1. SALES CONTROL & POS                                            */}
        {/* ================================================================= */}
        <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => toggleSection('sales')}
            className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 text-xs text-left"
          >
            <span className="flex items-center gap-2">
              <span>🛒</span>
              <span>1. Sales Control & POS</span>
            </span>
            <span className="text-[10px] text-slate-400">{openSections.sales ? '▲' : '▼'}</span>
          </button>

          {openSections.sales && (
            <div className="p-1 space-y-0.5 bg-white border-t border-slate-100">
              <Link href="/backoffice/dashboard" className="block px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium text-[11.5px]">
                Dashboard Overview
              </Link>
              <Link href="/backoffice/reportview" className="flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium text-[11.5px]">
                <span>Sales Reports Matrix</span>
                <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 text-[9px] font-bold rounded">93 Rep</span>
              </Link>
              <Link href="/backoffice/inbox" className="flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium text-[11.5px]">
                <span>Operations Inbox</span>
                <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[9px] font-bold rounded">2 New</span>
              </Link>
              <Link href="/backoffice/online-orders" className="block px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium text-[11.5px]">
                Online Orders Control
              </Link>
              <Link href="/backoffice/end-of-day" className="block px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium text-[11.5px]">
                End of Day (EOD) Z-Report
              </Link>
              <Link href="/pos" className="block px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium text-[11.5px]">
                POS Touch Terminal ↗
              </Link>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* 2. SUPERSONIC FLEET (NOW FULLY EXPANDED WITH ALL SUB-SECTIONS!)   */}
        {/* ================================================================= */}
        <div className="border border-[#1e3a2b]/30 rounded-xl overflow-hidden bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => toggleSection('fleet')}
            className="w-full px-3 py-2 bg-[#edf2ee] hover:bg-[#e4ebe5] flex items-center justify-between font-bold text-[#1e3a2b] text-xs text-left"
          >
            <span className="flex items-center gap-2">
              <span>🚚</span>
              <span>2. SuperSonic Fleet</span>
            </span>
            <span className="text-[10px] text-[#1e3a2b]">{openSections.fleet ? '▲' : '▼'}</span>
          </button>

          {openSections.fleet && (
            <div className="p-1 space-y-0.5 bg-white border-t border-slate-100">
              <Link
                href="/backoffice/fleet?tab=dispatch"
                className={`block px-3 py-1.5 rounded-lg text-[11.5px] font-medium transition-colors ${currentTab === 'dispatch' && pathname.includes('/fleet') ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                📋 7 Corridors & Dispatch
              </Link>
              <Link
                href="/backoffice/fleet?tab=southern-olive"
                className={`block px-3 py-1.5 rounded-lg text-[11.5px] font-medium transition-colors ${currentTab === 'southern-olive' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                🫒 Southern Olive Orders
              </Link>
              <Link
                href="/backoffice/fleet?tab=3pl"
                className={`block px-3 py-1.5 rounded-lg text-[11.5px] font-medium transition-colors ${currentTab === '3pl' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                🏢 SuperSonic 3PL Orders
              </Link>
              <Link
                href="/backoffice/fleet?tab=settlements"
                className={`block px-3 py-1.5 rounded-lg text-[11.5px] font-medium transition-colors ${currentTab === 'settlements' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                💵 COD, Whish & Reports
              </Link>
              <Link
                href="/backoffice/fleet?tab=radar"
                className={`block px-3 py-1.5 rounded-lg text-[11.5px] font-medium transition-colors ${currentTab === 'radar' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                📡 Live Fleet Radar & GPS
              </Link>
              <Link
                href="/backoffice/fleet?tab=pod"
                className={`block px-3 py-1.5 rounded-lg text-[11.5px] font-medium transition-colors ${currentTab === 'pod' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                ✍️ Proof of Delivery (POD)
              </Link>
              <Link
                href="/backoffice/fleet?tab=employees"
                className={`block px-3 py-1.5 rounded-lg text-[11.5px] font-medium transition-colors ${currentTab === 'employees' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                👥 Employees & Drivers
              </Link>
              <Link
                href="/backoffice/fleet?tab=complaints"
                className={`block px-3 py-1.5 rounded-lg text-[11.5px] font-medium transition-colors ${currentTab === 'complaints' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                🎧 Complaints & Reviews
              </Link>
              <Link
                href="/backoffice/fleet?tab=vehicles"
                className={`block px-3 py-1.5 rounded-lg text-[11.5px] font-medium transition-colors ${currentTab === 'vehicles' ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                🚐 Vehicles & Odometer Log
              </Link>
            </div>
          )}
        </div>

        {/* 3. SOCIAL CRM */}
        <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
          <button type="button" onClick={() => toggleSection('social')} className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 text-xs text-left">
            <span className="flex items-center gap-2"><span>💬</span><span>3. Social CRM & Support</span></span>
            <span className="text-[10px] text-slate-400">{openSections.social ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* 4. OPERATIONS & PRESSING */}
        <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
          <button type="button" onClick={() => toggleSection('operations')} className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 text-xs text-left">
            <span className="flex items-center gap-2"><span>⚙️</span><span>4. Operations & Pressing</span></span>
            <span className="text-[10px] text-slate-400">{openSections.operations ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* 5. CUSTOMER MANAGEMENT */}
        <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
          <button type="button" onClick={() => toggleSection('customers')} className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 text-xs text-left">
            <span className="flex items-center gap-2"><span>👥</span><span>5. Customer Management & AR</span></span>
            <span className="text-[10px] text-slate-400">{openSections.customers ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* 6. ACCOUNTING */}
        <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
          <button type="button" onClick={() => toggleSection('accounting')} className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 text-xs text-left">
            <span className="flex items-center gap-2"><span>📈</span><span>6. Accounting & Finance</span></span>
            <span className="text-[10px] text-slate-400">{openSections.accounting ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* 7. HR */}
        <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
          <button type="button" onClick={() => toggleSection('hr')} className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 text-xs text-left">
            <span className="flex items-center gap-2"><span>👔</span><span>7. HR & Payroll Management</span></span>
            <span className="text-[10px] text-slate-400">{openSections.hr ? '▲' : '▼'}</span>
          </button>
        </div>

      </div>

    </aside>
  );
}
