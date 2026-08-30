'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BackofficeMasterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Accordion state for all 7 modules (all open and accessible)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sales: true,
    fleet: true,
    social: true,
    operations: true,
    customers: true,
    accounting: true,
    hr: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const isLinkActive = (href: string) => pathname === href || (pathname && pathname.startsWith(href));

  return (
    <div className="flex w-full min-h-screen bg-[#f8fafc] font-sans text-slate-800 text-left select-none">
      
      {/* 1. Master Left Sidebar Navigation */}
      <aside className="w-[280px] bg-[#1e232d] text-slate-300 flex flex-col justify-between border-r border-slate-800 print:hidden select-none shrink-0 h-screen sticky top-0">
        <div>
          {/* Header Branding */}
          <div className="p-3.5 border-b border-slate-800 bg-[#181c24]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="font-bold text-white text-sm tracking-tight">Vanguard ERP</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
              Southern Olive Oil Products S.A.R.L
            </p>
          </div>

          {/* Navigation Accordion Tree (All 7 Modules - Standard Industrial Labels) */}
          <nav className="p-2 space-y-1 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-110px)] custom-scrollbar">
            
            {/* 1. SALES CONTROL & POS */}
            <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-900/30">
              <button
                type="button"
                onClick={() => toggleSection('sales')}
                className="w-full flex items-center justify-between px-3 py-2 text-slate-200 hover:bg-slate-800 text-[11.5px] font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>🛒</span>
                  <span>1. Sales Control & POS</span>
                </div>
                <span className="text-[9px]">{openSections.sales ? '▲' : '▼'}</span>
              </button>

              {openSections.sales && (
                <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-800 bg-[#161a22] text-[11px]">
                  <Link href="/backoffice/dashboard" className={`block px-2.5 py-1 rounded transition-colors ${pathname === '/backoffice/dashboard' ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Dashboard Overview
                  </Link>
                  <Link href="/backoffice/reportview" className={`flex items-center justify-between px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/reportview') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    <span>Sales Reports Matrix</span>
                    <span className="text-[9.5px] font-mono bg-blue-500/20 text-blue-300 px-1 rounded">93 Rep</span>
                  </Link>
                  <Link href="/backoffice/online-orders" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/online-orders') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Online Orders Control
                  </Link>
                  <Link href="/backoffice/end-of-day" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/end-of-day') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    End of Day (EOD) Z-Report
                  </Link>
                  <Link href="/pos" className="flex items-center justify-between px-2.5 py-1 rounded text-amber-400 hover:bg-slate-800 transition-colors">
                    <span>POS Touch Terminal</span>
                    <span className="text-[9px]">↗</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 2. SUPERSONIC FLEET MANAGEMENT */}
            <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-900/30">
              <button
                type="button"
                onClick={() => toggleSection('fleet')}
                className="w-full flex items-center justify-between px-3 py-2 text-slate-200 hover:bg-slate-800 text-[11.5px] font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>🚚</span>
                  <span>2. SuperSonic Fleet</span>
                </div>
                <span className="text-[9px]">{openSections.fleet ? '▲' : '▼'}</span>
              </button>

              {openSections.fleet && (
                <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-800 bg-[#161a22] text-[11px]">
                  <Link href="/backoffice/fleet/dispatch" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/fleet/dispatch') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Live Fleet Map & Dispatch
                  </Link>
                  <Link href="/backoffice/fleet/vehicles" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/fleet/vehicles') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Vehicles & Maintenance
                  </Link>
                  <Link href="/backoffice/fleet/drivers" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/fleet/drivers') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Drivers Directory
                  </Link>
                  <Link href="/backoffice/fleet/settlements" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/fleet/settlements') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    COD & Cash Settlements
                  </Link>
                </div>
              )}
            </div>

            {/* 3. SOCIAL CRM & SUPPORT */}
            <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-900/30">
              <button
                type="button"
                onClick={() => toggleSection('social')}
                className="w-full flex items-center justify-between px-3 py-2 text-slate-200 hover:bg-slate-800 text-[11.5px] font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>💬</span>
                  <span>3. Social CRM & Support</span>
                </div>
                <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1 rounded">ENT</span>
              </button>

              {openSections.social && (
                <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-800 bg-[#161a22] text-[11px]">
                  <Link href="/backoffice/social-crm" className={`block px-2.5 py-1 rounded transition-colors ${pathname === '/backoffice/social-crm' ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Social Management Hub
                  </Link>
                  <Link href="/backoffice/social-crm/inbox" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/social-crm/inbox') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Unified Social Inbox
                  </Link>
                  <Link href="/backoffice/social-crm/orders" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/social-crm/orders') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Platform Orders & SLA
                  </Link>
                  <Link href="/backoffice/social-crm/calendar" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/social-crm/calendar') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Publishing & WhatsApp Calendar
                  </Link>
                  <Link href="/backoffice/social-crm/cpl" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/social-crm/cpl') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Ad Campaigns & CPL Analytics
                  </Link>
                </div>
              )}
            </div>

            {/* 4. OPERATIONS & PRESSING CENTER */}
            <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-900/30">
              <button
                type="button"
                onClick={() => toggleSection('operations')}
                className="w-full flex items-center justify-between px-3 py-2 text-slate-200 hover:bg-slate-800 text-[11.5px] font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>⚙️</span>
                  <span>4. Operations & Pressing</span>
                </div>
                <span className="text-[9px]">{openSections.operations ? '▲' : '▼'}</span>
              </button>

              {openSections.operations && (
                <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-800 bg-[#161a22] text-[11px]">
                  <Link href="/backoffice/operations/dashboard" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/operations/dashboard') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Operations Overview
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

            {/* 5. CUSTOMER MANAGEMENT & AR */}
            <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-900/30">
              <button
                type="button"
                onClick={() => toggleSection('customers')}
                className="w-full flex items-center justify-between px-3 py-2 text-slate-200 hover:bg-slate-800 text-[11.5px] font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>👥</span>
                  <span>5. Customer Management & AR</span>
                </div>
                <span className="text-[9px]">{openSections.customers ? '▲' : '▼'}</span>
              </button>

              {openSections.customers && (
                <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-800 bg-[#161a22] text-[11px]">
                  <Link href="/backoffice/customers/directory" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/customers/directory') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Master Directory & Stores
                  </Link>
                  <Link href="/backoffice/customers/kyc" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/customers/kyc') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Enterprise KYC Onboarding (PDF)
                  </Link>
                  <Link href="/backoffice/customers/ar-invoices" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/customers/ar-invoices') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Accounts Receivable & Invoices
                  </Link>
                  <Link href="/backoffice/customers/receipts" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/customers/receipts') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Payment Receipts & Collections
                  </Link>
                </div>
              )}
            </div>

            {/* 6. ACCOUNTING & FINANCE */}
            <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-900/30">
              <button
                type="button"
                onClick={() => toggleSection('accounting')}
                className="w-full flex items-center justify-between px-3 py-2 text-slate-200 hover:bg-slate-800 text-[11.5px] font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>📈</span>
                  <span>6. Accounting & Finance</span>
                </div>
                <span className="text-[9px]">{openSections.accounting ? '▲' : '▼'}</span>
              </button>

              {openSections.accounting && (
                <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-800 bg-[#161a22] text-[11px]">
                  <Link href="/backoffice/accounting/coa" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/accounting/coa') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Chart of Accounts (COA)
                  </Link>
                  <Link href="/backoffice/accounting/journal" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/accounting/journal') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Journal Entries & Vouchers
                  </Link>
                  <Link href="/backoffice/accounting/ledger" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/accounting/ledger') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    General Ledger & Trial Balance
                  </Link>
                </div>
              )}
            </div>

            {/* 7. HR & PAYROLL MANAGEMENT */}
            <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-900/30">
              <button
                type="button"
                onClick={() => toggleSection('hr')}
                className="w-full flex items-center justify-between px-3 py-2 text-slate-200 hover:bg-slate-800 text-[11.5px] font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>🪪</span>
                  <span>7. HR & Payroll Management</span>
                </div>
                <span className="text-[9px]">{openSections.hr ? '▲' : '▼'}</span>
              </button>

              {openSections.hr && (
                <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-800 bg-[#161a22] text-[11px]">
                  <Link href="/backoffice/hr/employees" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/hr/employees') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Employees Directory
                  </Link>
                  <Link href="/backoffice/hr/attendance" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/hr/attendance') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    Attendance Logs
                  </Link>
                  <Link href="/backoffice/hr/payroll" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/hr/payroll') ? 'bg-[#1a629b] text-white font-bold' : 'text-slate-400 hover:text-white'}`}>
                    BLOM Bank Payroll Export
                  </Link>
                </div>
              )}
            </div>

          </nav>
        </div>

        {/* User Identity Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#161a22] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#1a629b] text-white font-bold flex items-center justify-center text-[10px]">M</div>
            <span className="font-bold text-slate-200">Mohammed</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Live Session</span>
        </div>
      </aside>

      {/* Main Viewport Workspace */}
      <main className="flex-1 min-w-0 overflow-y-auto h-screen">
        {children}
      </main>

    </div>
  );
}
