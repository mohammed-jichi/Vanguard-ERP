'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isLinkActive = (href: string) => pathname === href || pathname.startsWith(href);

  return (
    <div className="flex w-full min-h-screen bg-[#f8fafc] font-sans text-slate-800 text-left select-none">
      
      {/* Master Persistent Sidebar */}
      <aside className="w-[280px] bg-[#1e232d] text-slate-300 flex flex-col justify-between border-r border-slate-800 print:hidden select-none shrink-0 h-screen sticky top-0">
        <div>
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800 bg-[#181c24]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="font-bold text-white text-sm tracking-tight">Vanguard ERP</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
              Southern Olive Oil Products S.A.R.L
            </p>
          </div>

          {/* Navigation Links with REAL Next.js Links */}
          <nav className="p-2 space-y-1 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-110px)] custom-scrollbar">
            
            {/* 1. Sales Control & POS */}
            <div className="border border-slate-800/80 rounded-lg p-1.5 bg-slate-900/30 space-y-0.5">
              <div className="px-2 py-1 text-slate-400 uppercase text-[10px] font-bold">1. Sales Control & POS</div>
              
              <Link href="/backoffice/dashboard" className={`block px-2.5 py-1.5 rounded transition-colors ${pathname === '/backoffice/dashboard' ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
                Dashboard Overview
              </Link>
              
              <Link href="/backoffice/reportview" className={`flex items-center justify-between px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/reportview') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
                <span>Sales Reports Matrix</span>
                <span className="text-[9.5px] font-mono bg-blue-500/20 text-blue-300 px-1 rounded">93 Rep</span>
              </Link>

              <Link href="/backoffice/online-orders" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/online-orders') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
                Online Orders Control
              </Link>

              <Link href="/backoffice/end-of-day" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/end-of-day') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
                End of Day (EOD) Z-Report
              </Link>

              <Link href="/pos" className="flex items-center justify-between px-2.5 py-1.5 rounded text-amber-400 hover:bg-slate-800 transition-colors">
                <span>POS Touch Terminal</span>
                <span className="text-[9px]">↗</span>
              </Link>
            </div>

            {/* 2. SuperSonic Fleet Management */}
            <Link href="/backoffice/fleet" className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isLinkActive('/backoffice/fleet') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <span>🚚</span> <span>2. SuperSonic Fleet</span>
            </Link>

            {/* 3. Social CRM & Support */}
            <Link href="/backoffice/social-crm" className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${isLinkActive('/backoffice/social-crm') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <div className="flex items-center gap-2">
                <span>💬</span> <span>3. Social CRM & Support</span>
              </div>
              <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1 rounded">ENT</span>
            </Link>

            {/* 4. Operations & Pressing */}
            <Link href="/backoffice/operations" className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isLinkActive('/backoffice/operations') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <span>⚙️</span> <span>4. Operations & Pressing</span>
            </Link>

            {/* 5. Customer Management & AR */}
            <Link href="/backoffice/customers" className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isLinkActive('/backoffice/customers') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <span>👥</span> <span>5. Customer Management & AR</span>
            </Link>

            {/* 6. Accounting & Finance */}
            <Link href="/backoffice/accounting" className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isLinkActive('/backoffice/accounting') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <span>📈</span> <span>6. Accounting & Finance</span>
            </Link>

            {/* 7. HR & Payroll */}
            <Link href="/backoffice/hr" className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isLinkActive('/backoffice/hr') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <span>🪪</span> <span>7. HR & Payroll Management</span>
            </Link>

          </nav>
        </div>

        {/* Footer User Profile */}
        <div className="p-3 border-t border-slate-800 bg-[#161a22] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#1a629b] text-white font-bold flex items-center justify-center text-[10px]">M</div>
            <span className="font-bold text-slate-200">Mohammed</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Live</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto h-screen">
        {children}
      </main>

    </div>
  );
}
