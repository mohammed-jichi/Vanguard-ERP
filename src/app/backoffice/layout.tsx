'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MasterBackofficeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Sidebar visibility & Accordion state
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sales: true,
    fleet: true,
    social: true,
    operations: true,
    customers: true,
    accounting: true,
    hr: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isLinkActive = (href: string) => {
    if (href === '/backoffice/dashboard') {
      return pathname === '/backoffice/dashboard' || pathname === '/backoffice';
    }
    return pathname === href || (pathname && pathname.startsWith(href) && href !== '/backoffice');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f1f5f9] font-sans text-slate-800 text-left select-none">
      
      {/* =================================================================== */}
      {/* 1. MASTER TOP GLOBAL HEADER (MATCHING EXACT SCREENSHOT & COLORS)    */}
      {/* =================================================================== */}
      <header className="h-11 bg-[#161a22] border-b border-slate-800 px-3 flex items-center justify-between print:hidden shrink-0 text-white z-40">
        
        {/* Left Side: Toggle + Logo + Vanguard ERP Title */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Toggle Sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Vanguard Logo & Title */}
          <Link href="/backoffice/dashboard" className="flex items-center gap-1.5 group">
            {/* Vanguard Gold/Navy Shield Icon */}
            <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-400 via-amber-600 to-slate-900 border border-amber-300/40 flex items-center justify-center shadow-xs">
              <span className="text-[10px] font-bold text-slate-950 font-serif">V</span>
            </div>
            <span className="font-bold text-[13.5px] tracking-tight text-slate-100 group-hover:text-amber-200 transition-colors">
              Vanguard ERP
            </span>
          </Link>
        </div>

        {/* Right Side: Tenant Badge + Action Icons + User Profile */}
        <div className="flex items-center gap-3">
          
          {/* Tenant Badge with Golden Shimmer & Translucent Navy Blend */}
          <div className="hidden sm:flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#1c2438]/90 via-[#2a2318]/70 to-[#1c2438]/90 border border-amber-400/35 shadow-xs backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 mr-2 shadow-xs"></span>
            <span className="text-[11.5px] font-bold tracking-wide bg-gradient-to-r from-amber-100 via-amber-200 to-amber-300 bg-clip-text text-transparent">
              00001 - Southern Olive Oil Products S.A.R.L
            </span>
          </div>

          {/* Quick Icons */}
          <div className="flex items-center gap-1 text-slate-300">
            {/* Home Icon */}
            <Link
              href="/backoffice/dashboard"
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors"
              title="Dashboard Home"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </Link>

            {/* Notification Mail with Red Badge */}
            <Link
              href="/backoffice/social-crm"
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors relative"
              title="Messages & Alerts"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-600 text-white rounded-full text-[8.5px] font-bold flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Help Icon */}
            <Link
              href="/backoffice/dashboard"
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors"
              title="Help & Support"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded hover:bg-slate-800 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[#1a629b] text-white font-bold flex items-center justify-center text-[10px] shadow-xs">
                M
              </div>
              <span className="text-xs font-semibold text-slate-200">Jichi Mohammed</span>
              <span className="text-[10px] text-amber-400">▾</span>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-[#1e232d] border border-slate-700 rounded-xl shadow-xl py-1 text-xs text-slate-200 z-50">
                <div className="px-3 py-2 border-b border-slate-700">
                  <div className="font-bold text-white">Jichi Mohammed</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">Operations Administrator</div>
                </div>
                <Link
                  href="/backoffice/dashboard"
                  onClick={() => setUserDropdownOpen(false)}
                  className="block px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/backoffice/reportview"
                  onClick={() => setUserDropdownOpen(false)}
                  className="block px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white"
                >
                  Reports Center
                </Link>
                <div className="border-t border-slate-700 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-3 py-1.5 text-red-400 hover:bg-slate-800"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Apps Switcher Grid Icon */}
          <Link
            href="/backoffice/reportview"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="App Launcher"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </Link>

        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. BODY WORKSPACE: SIDEBAR + MAIN PAGE VIEWPORT                     */}
      {/* =================================================================== */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        {sidebarVisible && (
          <aside className="w-[275px] bg-[#1e232d] text-slate-300 flex flex-col justify-between border-r border-slate-800 print:hidden select-none shrink-0 h-[calc(100vh-44px)] overflow-y-auto custom-scrollbar">
            <div className="p-2 space-y-1 text-xs font-semibold">
              
              {/* 1. SALES CONTROL & POS */}
              <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-900/30">
                <button
                  type="button"
                  onClick={() => toggleSection('sales')}
                  className="w-full flex items-center justify-between px-3 py-2 text-slate-200 hover:bg-slate-800 text-[11.5px] font-bold"
                >
                  <div className="flex items-center gap-2">
                    <span>🛒</span>
                    <span>1. Sales Control & POS</span>
                  </div>
                  <span className="text-[9px]">{openSections.sales ? '▲' : '▼'}</span>
                </button>

                {openSections.sales && (
                  <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-800 bg-[#161a22] text-[11px]">
                    <Link href="/backoffice/dashboard" className={`block px-2.5 py-1.5 rounded transition-colors ${pathname === '/backoffice/dashboard' ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Dashboard Overview
                    </Link>
                    <Link href="/backoffice/reportview" className={`flex items-center justify-between px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/reportview') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      <span>Sales Reports Matrix</span>
                      <span className="text-[9.5px] font-mono bg-blue-500/20 text-blue-300 px-1 rounded">93 Rep</span>
                    </Link>
                    <Link href="/backoffice/online-orders" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/online-orders') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Online Orders Control
                    </Link>
                    <Link href="/backoffice/end-of-day" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/end-of-day') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      End of Day (EOD) Z-Report
                    </Link>
                    <Link href="/backoffice/sales-setup" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/sales-setup') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      POS Pricing & Setup
                    </Link>
                    <a href="/pos" target="_blank" className="flex items-center justify-between px-2.5 py-1.5 rounded text-amber-400 hover:bg-slate-800 transition-colors">
                      <span>POS Touch Terminal ↗</span>
                    </a>
                  </div>
                )}
              </div>

              {/* 2. SUPERSONIC FLEET */}
              <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-900/30">
                <button
                  type="button"
                  onClick={() => toggleSection('fleet')}
                  className="w-full flex items-center justify-between px-3 py-2 text-slate-200 hover:bg-slate-800 text-[11.5px] font-bold"
                >
                  <div className="flex items-center gap-2">
                    <span>🚚</span>
                    <span>2. SuperSonic Fleet</span>
                  </div>
                  <span className="text-[9px]">{openSections.fleet ? '▲' : '▼'}</span>
                </button>

                {openSections.fleet && (
                  <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-800 bg-[#161a22] text-[11px]">
                    <Link href="/backoffice/fleet" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/fleet') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Live Fleet Map & Dispatch
                    </Link>
                    <Link href="/backoffice/fleet/vehicles" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/fleet/vehicles') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Vehicles & Maintenance
                    </Link>
                    <Link href="/backoffice/fleet/drivers" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/fleet/drivers') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Drivers Directory & History
                    </Link>
                    <Link href="/backoffice/fleet/settlements" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/fleet/settlements') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      COD & Cash Settlements
                    </Link>
                  </div>
                )}
              </div>

              {/* 3. SOCIAL CRM */}
              <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-900/30">
                <button
                  type="button"
                  onClick={() => toggleSection('social')}
                  className="w-full flex items-center justify-between px-3 py-2 text-slate-200 hover:bg-slate-800 text-[11.5px] font-bold"
                >
                  <div className="flex items-center gap-2">
                    <span>💬</span>
                    <span>3. Social CRM & Support</span>
                  </div>
                  <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1 rounded">ENT</span>
                </button>

                {openSections.social && (
                  <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-800 bg-[#161a22] text-[11px]">
                    <Link href="/backoffice/social-crm" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/social-crm') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Social Management Hub (6 Pillars)
                    </Link>
                  </div>
                )}
              </div>

              {/* 4. OPERATIONS */}
              <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-900/30">
                <button
                  type="button"
                  onClick={() => toggleSection('operations')}
                  className="w-full flex items-center justify-between px-3 py-2 text-slate-200 hover:bg-slate-800 text-[11.5px] font-bold"
                >
                  <div className="flex items-center gap-2">
                    <span>⚙️</span>
                    <span>4. Operations & Pressing</span>
                  </div>
                  <span className="text-[9px]">{openSections.operations ? '▲' : '▼'}</span>
                </button>

                {openSections.operations && (
                  <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-800 bg-[#161a22] text-[11px]">
                    <Link href="/backoffice/operations" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/operations') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Operations Center Overview
                    </Link>
                    <Link href="/backoffice/operations/pressing" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/operations/pressing') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Olive Pressing & Oil Yield %
                    </Link>
                    <Link href="/backoffice/operations/formulations" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/operations/formulations') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Recipe Formulations & Production
                    </Link>
                    <Link href="/backoffice/operations/tanks" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/operations/tanks') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Storage Tanks & Bulk Inventory
                    </Link>
                  </div>
                )}
              </div>

              {/* 5. CUSTOMERS */}
              <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-900/30">
                <button
                  type="button"
                  onClick={() => toggleSection('customers')}
                  className="w-full flex items-center justify-between px-3 py-2 text-slate-200 hover:bg-slate-800 text-[11.5px] font-bold"
                >
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>5. Customer Management & AR</span>
                  </div>
                  <span className="text-[9px]">{openSections.customers ? '▲' : '▼'}</span>
                </button>

                {openSections.customers && (
                  <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-800 bg-[#161a22] text-[11px]">
                    <Link href="/backoffice/customers" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/customers') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Master Directory & KYC (PDF)
                    </Link>
                    <Link href="/backoffice/customers/invoices" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/customers/invoices') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Accounts Receivable & Aging Invoices
                    </Link>
                    <Link href="/backoffice/customers/receipts" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/customers/receipts') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Payment Receipts & Settlements
                    </Link>
                    <Link href="/backoffice/customers/statements" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/customers/statements') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Statements of Account (SOA A4)
                    </Link>
                  </div>
                )}
              </div>

              {/* 6. ACCOUNTING */}
              <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-900/30">
                <button
                  type="button"
                  onClick={() => toggleSection('accounting')}
                  className="w-full flex items-center justify-between px-3 py-2 text-slate-200 hover:bg-slate-800 text-[11.5px] font-bold"
                >
                  <div className="flex items-center gap-2">
                    <span>📈</span>
                    <span>6. Accounting & Finance</span>
                  </div>
                  <span className="text-[9px]">{openSections.accounting ? '▲' : '▼'}</span>
                </button>

                {openSections.accounting && (
                  <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-800 bg-[#161a22] text-[11px]">
                    <Link href="/backoffice/accounting" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/accounting') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Chart of Accounts (COA)
                    </Link>
                    <Link href="/backoffice/accounting/journal" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/accounting/journal') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Journal Entries & Vouchers
                    </Link>
                    <Link href="/backoffice/accounting/ledger" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/accounting/ledger') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      General Ledger & Trial Balance
                    </Link>
                    <Link href="/backoffice/accounting/cost-centers" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/accounting/cost-centers') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Branches & Factory Cost Centers
                    </Link>
                  </div>
                )}
              </div>

              {/* 7. HR */}
              <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-900/30">
                <button
                  type="button"
                  onClick={() => toggleSection('hr')}
                  className="w-full flex items-center justify-between px-3 py-2 text-slate-200 hover:bg-slate-800 text-[11.5px] font-bold"
                >
                  <div className="flex items-center gap-2">
                    <span>🪪</span>
                    <span>7. HR & Payroll Management</span>
                  </div>
                  <span className="text-[9px]">{openSections.hr ? '▲' : '▼'}</span>
                </button>

                {openSections.hr && (
                  <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-800 bg-[#161a22] text-[11px]">
                    <Link href="/backoffice/hr" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/hr') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Employees Directory
                    </Link>
                    <Link href="/backoffice/hr/attendance" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/hr/attendance') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      Attendance Logs & Overtime
                    </Link>
                    <Link href="/backoffice/hr/payroll" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/hr/payroll') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                      BLOM Bank Payroll Export
                    </Link>
                  </div>
                )}
              </div>

            </div>
          </aside>
        )}

        {/* Main Content Workspace */}
        <main className="flex-1 min-w-0 overflow-y-auto h-[calc(100vh-44px)] bg-[#f1f5f9] p-4 md:p-6 custom-scrollbar">
          {children}
        </main>

      </div>

    </div>
  );
}
