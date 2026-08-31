'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MasterBackofficeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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

  const isLinkActive = (href: string) => pathname === href || (pathname && pathname.startsWith(href));

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f3f5f8] font-sans text-slate-800 text-left select-none relative print:bg-white print:m-0 print:p-0">
      
      {/* 1. MASTER TOP GLOBAL HEADER (STRICTLY HIDDEN ON PRINT) */}
      <header className="h-[68px] bg-white border-b-2 border-[#1e3a2b]/20 px-5 flex items-center justify-between print:hidden shrink-0 text-slate-800 z-40 relative shadow-xs">
        
        {/* Left Side: Toggle + Vanguard Medallion Logo & Title */}
        <div className="flex items-center gap-3.5 shrink-0">
          <button
            type="button"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-300 shadow-2xs"
            title="Toggle Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link href="/backoffice/dashboard" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-[52px] h-[52px] rounded-full overflow-hidden border-2 border-[#c5a059] shadow-md bg-black shrink-0 group-hover:scale-105 transition-all duration-300">
              <img
                src="/vanguard-logo.jpg"
                alt="Vanguard ERP Circular Emblem"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('Vanguard (Login Page and Header).jpg')) {
                    target.src = '/Vanguard (Login Page and Header).jpg';
                  } else if (!target.src.includes('vanguard-emblem.jpg')) {
                    target.src = '/vanguard-emblem.jpg';
                  }
                }}
                className="w-full h-full object-cover scale-105"
              />
            </div>

            <div className="flex flex-col">
              <span className="font-extrabold text-[18px] tracking-tight text-[#0f172a] transition-colors duration-300 group-hover:text-[#1e3a2b]">
                Vanguard ERP
              </span>
              <span className="text-[10px] font-mono text-[#475569] -mt-0.5 tracking-wider uppercase font-semibold">
                Enterprise Operations System
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Tenant Badge */}
        <div className="flex-1 flex justify-center items-center px-4">
          <div className="flex items-center px-5 py-2 rounded-full bg-[#edf2ee] border border-[#1e3a2b]/30 shadow-xs hover:border-[#1e3a2b] transition-all">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a2b] mr-3 shadow-xs animate-pulse"></span>
            <span className="text-[13px] font-bold tracking-wide text-[#0f172a]">
              00001 - Southern Olive Oil Products S.A.R.L
            </span>
          </div>
        </div>

        {/* Right Side: Action Icons + User Profile */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="flex items-center gap-2 text-slate-600">
            <Link
              href="/backoffice/dashboard"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200"
              title="Dashboard Home"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </Link>

            <Link
              href="/backoffice/social-crm"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 relative"
              title="Messages & Alerts"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
                0
              </span>
            </Link>

            <button
              type="button"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200"
              title="Help & Support"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors shadow-2xs"
            >
              <div className="w-6 h-6 rounded-full bg-[#1e3a2b] text-white font-bold flex items-center justify-center text-[11px] shadow-xs">
                M
              </div>
              <span className="text-xs font-semibold text-slate-900">Jichi Mohammed</span>
              <span className="text-[11px] text-[#1e3a2b]">▾</span>
            </button>
          </div>
        </div>

        {/* Accent Bottom Line */}
        <div
          style={{
            background: 'linear-gradient(90deg, #c5a059 0%, #1e3a2b 50%, #c5a059 100%)',
          }}
          className="absolute bottom-0 left-0 right-0 h-[2.5px] print:hidden"
        />
      </header>

      {/* 2. BODY WORKSPACE (SIDEBAR HIDDEN ON PRINT) */}
      <div className="flex-1 flex overflow-hidden print:overflow-visible print:m-0 print:p-0">
        
        {/* Master Left Sidebar (Strictly hidden on print) */}
        {sidebarVisible && (
          <aside
            style={{
              background: '#e9eee9',
            }}
            className="w-[280px] text-slate-800 flex flex-col justify-between print:hidden select-none shrink-0 h-[calc(100vh-68px)] overflow-y-auto custom-scrollbar border-r border-[#1e3a2b]/20 shadow-xs"
          >
            <div>
              <div className="p-3.5 border-b border-[#1e3a2b]/15 bg-white/70">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a2b] shadow-xs"></span>
                  <span className="font-bold text-[#0f172a] text-xs tracking-tight">Main Navigation Modules</span>
                </div>
              </div>

              <nav className="p-2 space-y-1.5 text-xs font-semibold">
                
                {/* 1. SALES CONTROL & POS */}
                <div className="border border-slate-300/80 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => toggleSection('sales')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-slate-900 hover:bg-slate-100 text-[11.5px] font-bold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>🛒</span>
                      <span>1. Sales Control & POS</span>
                    </div>
                    <span className="text-[9px] text-[#1e3a2b]">{openSections.sales ? '▲' : '▼'}</span>
                  </button>

                  {openSections.sales && (
                    <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-200 bg-[#f8fafc] text-[11px]">
                      <Link href="/backoffice/dashboard" className={`block px-2.5 py-1.5 rounded transition-colors ${pathname === '/backoffice/dashboard' ? 'bg-[#1e3a2b] text-white font-bold shadow-2xs' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/70'}`}>
                        Dashboard Overview
                      </Link>
                      <Link href="/backoffice/reportview" className={`flex items-center justify-between px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/reportview') ? 'bg-[#1e3a2b] text-white font-bold shadow-2xs' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/70'}`}>
                        <span>Sales Reports Matrix</span>
                        <span className="text-[9.5px] font-mono bg-[#1e3a2b]/15 text-[#1e3a2b] px-1.5 py-0.5 rounded font-bold">93 Rep</span>
                      </Link>
                      <Link href="/backoffice/online-orders" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/online-orders') ? 'bg-[#1e3a2b] text-white font-bold shadow-2xs' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/70'}`}>
                        Online Orders Control
                      </Link>
                      <Link href="/backoffice/end-of-day" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/end-of-day') ? 'bg-[#1e3a2b] text-white font-bold shadow-2xs' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/70'}`}>
                        End of Day (EOD) Z-Report
                      </Link>
                      <a href="/pos" target="_blank" className="flex items-center justify-between px-2.5 py-1.5 rounded text-[#1e3a2b] font-bold hover:bg-slate-200/70 transition-colors">
                        <span>POS Touch Terminal ↗</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* 2. SUPERSONIC FLEET */}
                <div className="border border-slate-300/80 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => toggleSection('fleet')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-slate-900 hover:bg-slate-100 text-[11.5px] font-bold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>🚚</span>
                      <span>2. SuperSonic Fleet</span>
                    </div>
                    <span className="text-[9px] text-[#1e3a2b]">{openSections.fleet ? '▲' : '▼'}</span>
                  </button>

                  {openSections.fleet && (
                    <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-200 bg-[#f8fafc] text-[11px]">
                      <Link href="/backoffice/fleet" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/fleet') ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-700 hover:text-slate-950'}`}>
                        Live Fleet Map & Dispatch
                      </Link>
                    </div>
                  )}
                </div>

                {/* 3. SOCIAL CRM */}
                <div className="border border-slate-300/80 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => toggleSection('social')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-slate-900 hover:bg-slate-100 text-[11.5px] font-bold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>💬</span>
                      <span>3. Social CRM & Support</span>
                    </div>
                    <span className="text-[9px] bg-[#1e3a2b]/15 text-[#1e3a2b] px-1 rounded font-bold">ENT</span>
                  </button>

                  {openSections.social && (
                    <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-200 bg-[#f8fafc] text-[11px]">
                      <Link href="/backoffice/social-crm" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/social-crm') ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-700 hover:text-slate-950'}`}>
                        Social Management Hub
                      </Link>
                    </div>
                  )}
                </div>

                {/* 4. OPERATIONS */}
                <div className="border border-slate-300/80 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => toggleSection('operations')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-slate-900 hover:bg-slate-100 text-[11.5px] font-bold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>⚙️</span>
                      <span>4. Operations & Pressing</span>
                    </div>
                    <span className="text-[9px] text-[#1e3a2b]">{openSections.operations ? '▲' : '▼'}</span>
                  </button>

                  {openSections.operations && (
                    <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-200 bg-[#f8fafc] text-[11px]">
                      <Link href="/backoffice/operations" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/operations') ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-700 hover:text-slate-950'}`}>
                        Operations Center Overview
                      </Link>
                    </div>
                  )}
                </div>

                {/* 5. CUSTOMERS */}
                <div className="border border-slate-300/80 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => toggleSection('customers')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-slate-900 hover:bg-slate-100 text-[11.5px] font-bold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>👥</span>
                      <span>5. Customer Management & AR</span>
                    </div>
                    <span className="text-[9px] text-[#1e3a2b]">{openSections.customers ? '▲' : '▼'}</span>
                  </button>

                  {openSections.customers && (
                    <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-200 bg-[#f8fafc] text-[11px]">
                      <Link href="/backoffice/customers" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/customers') ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-700 hover:text-slate-950'}`}>
                        Master Directory & KYC
                      </Link>
                    </div>
                  )}
                </div>

                {/* 6. ACCOUNTING */}
                <div className="border border-slate-300/80 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => toggleSection('accounting')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-slate-900 hover:bg-slate-100 text-[11.5px] font-bold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>📈</span>
                      <span>6. Accounting & Finance</span>
                    </div>
                    <span className="text-[9px] text-[#1e3a2b]">{openSections.accounting ? '▲' : '▼'}</span>
                  </button>

                  {openSections.accounting && (
                    <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-200 bg-[#f8fafc] text-[11px]">
                      <Link href="/backoffice/accounting" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/accounting') ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-700 hover:text-slate-950'}`}>
                        General Ledger & COA
                      </Link>
                    </div>
                  )}
                </div>

                {/* 7. HR */}
                <div className="border border-slate-300/80 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => toggleSection('hr')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-slate-900 hover:bg-slate-100 text-[11.5px] font-bold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>🪪</span>
                      <span>7. HR & Payroll Management</span>
                    </div>
                    <span className="text-[9px] text-[#1e3a2b]">{openSections.hr ? '▲' : '▼'}</span>
                  </button>

                  {openSections.hr && (
                    <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-slate-200 bg-[#f8fafc] text-[11px]">
                      <Link href="/backoffice/hr" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/hr') ? 'bg-[#1e3a2b] text-white font-bold' : 'text-slate-700 hover:text-slate-950'}`}>
                        Employees & BLOM Payroll
                      </Link>
                    </div>
                  )}
                </div>

              </nav>
            </div>

            <div className="p-3 border-t border-[#1e3a2b]/20 bg-white/70 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#1e3a2b] text-white font-bold flex items-center justify-center text-[10px] shadow-xs">
                  M
                </div>
                <span className="font-bold text-[#0f172a]">Mohammed</span>
              </div>
              <span className="text-[10px] text-[#1e3a2b] font-mono bg-[#1e3a2b]/15 px-2 py-0.5 rounded-full font-bold">Online</span>
            </div>
          </aside>
        )}

        {/* Main Canvas Viewport */}
        <main className="flex-1 min-w-0 overflow-y-auto h-[calc(100vh-68px)] bg-[#f3f5f8] p-4 md:p-6 custom-scrollbar print:overflow-visible print:m-0 print:p-0 print:bg-white">
          {children}
        </main>

      </div>

    </div>
  );
}
