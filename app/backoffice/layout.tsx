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

  const isLinkActive = (href: string) => {
    if (href === '/backoffice/dashboard') {
      return pathname === '/backoffice/dashboard' || pathname === '/backoffice';
    }
    return pathname === href || (pathname && pathname.startsWith(href) && href !== '/backoffice');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f1f5f9] font-sans text-slate-800 text-left select-none relative">
      
      {/* =================================================================== */}
      {/* 1. MASTER TOP GLOBAL HEADER (EMBEDDED GOLDEN VANGUARD EMBLEM)       */}
      {/* =================================================================== */}
      <header
        style={{
          background: 'linear-gradient(110deg, #101624 0%, #172238 25%, #2a261c 48%, #8a703b 68%, #c5a059 80%, #a8843c 88%, #141c2c 100%)',
        }}
        className="h-[68px] px-5 flex items-center justify-between print:hidden shrink-0 text-white z-40 relative shadow-md"
      >
        {/* Left Side: Toggle + Pure Vector Vanguard Logo (with Hover Pop) + Title */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="p-2 rounded-xl bg-black/25 hover:bg-black/45 text-amber-200 hover:text-white transition-colors border border-amber-400/25 shadow-xs"
            title="Toggle Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Interactive Vanguard Logo & Title with 3D Hover Pop */}
          <Link href="/backoffice/dashboard" className="flex items-center gap-3 group cursor-pointer">
            
            {/* Pure Inline Vector Vanguard Gold Emblem (Guaranteed Render) */}
            <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-gradient-to-br from-black/50 to-[#2a2418]/60 border border-amber-300/30 group-hover:border-amber-300/80 transition-all duration-300 shadow-md">
              <svg
                className="w-8 h-8 transition-all duration-300 ease-out transform group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:drop-shadow-[0_0_14px_rgba(212,175,55,0.7)]"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* SVG Definitions for Luxury Gold Gradient */}
                <defs>
                  <linearGradient id="vanguardGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f7e7b4" />
                    <stop offset="30%" stopColor="#d4af37" />
                    <stop offset="70%" stopColor="#8a703b" />
                    <stop offset="100%" stopColor="#c5a059" />
                  </linearGradient>
                  <linearGradient id="vanguardDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e2638" />
                    <stop offset="100%" stopColor="#0f1420" />
                  </linearGradient>
                </defs>

                {/* Shield / Sail Emblem Shape */}
                <path
                  d="M24 4L40 10V22C40 32.5 33.2 42.1 24 44C14.8 42.1 8 32.5 8 22V10L24 4Z"
                  fill="url(#vanguardDarkGrad)"
                  stroke="url(#vanguardGoldGrad)"
                  strokeWidth="2"
                />
                {/* Vanguard Stylized V / Ship Sail */}
                <path
                  d="M17 14L24 34L31 14H26.5L24 23.5L21.5 14H17Z"
                  fill="url(#vanguardGoldGrad)"
                />
                <circle cx="24" cy="9" r="2" fill="#f7e7b4" />
              </svg>
            </div>

            {/* Scaled Vanguard ERP Typography */}
            <div className="flex flex-col">
              <span className="font-extrabold text-[17px] tracking-tight text-white drop-shadow transition-all duration-300 group-hover:text-amber-200 group-hover:translate-x-0.5">
                Vanguard ERP
              </span>
              <span className="text-[10px] font-mono text-amber-200/90 -mt-0.5 tracking-wider uppercase">
                Enterprise Operations System
              </span>
            </div>
          </Link>
        </div>

        {/* Right Side: Tenant Badge + Action Icons + Profile */}
        <div className="flex items-center gap-3.5">
          <div className="hidden sm:flex items-center px-4 py-1.5 rounded-full bg-black/45 border border-[#c5a059]/45 shadow-sm backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#c5a059] to-[#8a703b] mr-2.5 shadow-xs animate-pulse"></span>
            <span className="text-[12.5px] font-bold tracking-wide text-amber-100 drop-shadow-xs">
              00001 - Southern Olive Oil Products S.A.R.L
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-200">
            <Link
              href="/backoffice/dashboard"
              className="p-2 rounded-xl bg-black/25 hover:bg-black/45 text-slate-200 hover:text-white transition-colors border border-white/10"
              title="Dashboard Home"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </Link>

            <Link
              href="/backoffice/social-crm"
              className="p-2 rounded-xl bg-black/25 hover:bg-black/45 text-slate-200 hover:text-white transition-colors border border-white/10 relative"
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

            <Link
              href="/backoffice/dashboard"
              className="p-2 rounded-xl bg-black/25 hover:bg-black/45 text-slate-200 hover:text-white transition-colors border border-white/10"
              title="Help & Support"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-full bg-black/35 hover:bg-black/55 border border-[#c5a059]/40 transition-colors shadow-xs"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#8a703b] to-[#c5a059] text-slate-950 font-bold flex items-center justify-center text-[11px] shadow-xs">
                M
              </div>
              <span className="text-xs font-semibold text-slate-100">Jichi Mohammed</span>
              <span className="text-[11px] text-amber-300">▾</span>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#1a202c] border border-amber-400/30 rounded-xl shadow-2xl py-1.5 text-xs text-slate-200 z-50">
                <div className="px-4 py-2.5 border-b border-slate-700/80 bg-slate-900/60">
                  <div className="font-bold text-white text-[13px]">Jichi Mohammed</div>
                  <div className="text-[10.5px] text-amber-300 font-mono truncate mt-0.5">General Operations Manager</div>
                </div>
                <Link href="/backoffice/dashboard" className="block px-4 py-2 hover:bg-slate-800 text-slate-300 hover:text-white">
                  Dashboard Overview
                </Link>
                <Link href="/backoffice/reportview" className="block px-4 py-2 hover:bg-slate-800 text-slate-300 hover:text-white">
                  Vanguard Reports Matrix (93)
                </Link>
                <div className="border-t border-slate-700/80 mt-1 pt-1">
                  <button type="button" onClick={() => alert('Signed out successfully')} className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-800">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4PX THICK INVERSE ACCENT BORDER */}
        <div
          style={{
            background: 'linear-gradient(90deg, #c5a059 0%, #d4af37 25%, #8a703b 50%, #1c263c 75%, #0f1624 100%)',
          }}
          className="absolute bottom-0 left-0 right-0 h-[4px] shadow-sm"
        />
      </header>

      {/* =================================================================== */}
      {/* 2. BODY WORKSPACE: BRONZE-GOLD METALLIC SIDEBAR + 4PX INVERSE BORDER*/}
      {/* =================================================================== */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Master Sidebar */}
        {sidebarVisible && (
          <aside
            style={{
              background: 'linear-gradient(180deg, #181510 0%, #201a13 25%, #2e2417 50%, #423520 75%, #584729 100%)',
            }}
            className="w-[280px] text-amber-100 flex flex-col justify-between print:hidden select-none shrink-0 h-[calc(100vh-68px)] overflow-y-auto custom-scrollbar shadow-xl relative"
          >
            <div>
              {/* Sidebar Header */}
              <div className="p-3.5 border-b border-[#b89542]/30 bg-black/30">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059] animate-pulse shadow-xs"></span>
                  <span className="font-bold text-amber-200 text-xs tracking-tight">Main Navigation Modules</span>
                </div>
              </div>

              {/* Menu Search */}
              <div className="p-2 border-b border-[#b89542]/20 bg-black/20">
                <input
                  type="text"
                  placeholder="Search modules..."
                  className="w-full px-2.5 py-1.5 bg-black/40 border border-[#b89542]/30 rounded-lg text-xs text-amber-100 placeholder-amber-200/50 focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              {/* Navigation Accordion Tree (7 Modules & 35+ Sub-routes) */}
              <nav className="p-2 space-y-1.5 text-xs font-semibold">
                
                {/* 1. SALES CONTROL & POS */}
                <div className="border border-[#b89542]/30 rounded-xl overflow-hidden bg-black/30 shadow-xs">
                  <button
                    type="button"
                    onClick={() => toggleSection('sales')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-amber-100 hover:bg-[#584729]/40 text-[11.5px] font-bold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>🛒</span>
                      <span className="text-amber-100">1. Sales Control & POS</span>
                    </div>
                    <span className="text-[9px] text-amber-300">{openSections.sales ? '▲' : '▼'}</span>
                  </button>

                  {openSections.sales && (
                    <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-[#b89542]/20 bg-black/40 text-[11px]">
                      <Link href="/backoffice/dashboard" className={`block px-2.5 py-1.5 rounded transition-colors ${pathname === '/backoffice/dashboard' ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Dashboard Overview
                      </Link>
                      <Link href="/backoffice/reportview" className={`flex items-center justify-between px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/reportview') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        <span>Sales Reports Matrix</span>
                        <span className="text-[9.5px] font-mono bg-black/50 text-amber-300 px-1.5 py-0.5 rounded border border-[#c5a059]/40">93 Rep</span>
                      </Link>
                      <Link href="/backoffice/online-orders" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/online-orders') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Online Orders Control
                      </Link>
                      <Link href="/backoffice/end-of-day" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/end-of-day') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        End of Day (EOD) Z-Report
                      </Link>
                      <Link href="/backoffice/sales-setup" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/sales-setup') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        POS Pricing & Setup
                      </Link>
                      <a href="/pos" target="_blank" className="flex items-center justify-between px-2.5 py-1.5 rounded text-amber-300 hover:bg-black/40 transition-colors">
                        <span>POS Touch Terminal ↗</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* 2. SUPERSONIC FLEET */}
                <div className="border border-[#b89542]/30 rounded-xl overflow-hidden bg-black/30 shadow-xs">
                  <button
                    type="button"
                    onClick={() => toggleSection('fleet')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-amber-100 hover:bg-[#584729]/40 text-[11.5px] font-bold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>🚚</span>
                      <span>2. SuperSonic Fleet</span>
                    </div>
                    <span className="text-[9px] text-amber-300">{openSections.fleet ? '▲' : '▼'}</span>
                  </button>

                  {openSections.fleet && (
                    <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-[#b89542]/20 bg-black/40 text-[11px]">
                      <Link href="/backoffice/fleet" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/fleet') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Live Fleet Map & Dispatch
                      </Link>
                      <Link href="/backoffice/fleet/vehicles" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/fleet/vehicles') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Vehicles & Maintenance
                      </Link>
                      <Link href="/backoffice/fleet/drivers" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/fleet/drivers') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Drivers Directory & History
                      </Link>
                      <Link href="/backoffice/fleet/settlements" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/fleet/settlements') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        COD & Cash Settlements
                      </Link>
                    </div>
                  )}
                </div>

                {/* 3. SOCIAL CRM */}
                <div className="border border-[#b89542]/30 rounded-xl overflow-hidden bg-black/30 shadow-xs">
                  <button
                    type="button"
                    onClick={() => toggleSection('social')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-amber-100 hover:bg-[#584729]/40 text-[11.5px] font-bold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>💬</span>
                      <span>3. Social CRM & Support</span>
                    </div>
                    <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1 rounded border border-[#c5a059]/40">ENT</span>
                  </button>

                  {openSections.social && (
                    <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-[#b89542]/20 bg-black/40 text-[11px]">
                      <Link href="/backoffice/social-crm" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/social-crm') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Social Management Hub (6 Pillars)
                      </Link>
                    </div>
                  )}
                </div>

                {/* 4. OPERATIONS */}
                <div className="border border-[#b89542]/30 rounded-xl overflow-hidden bg-black/30 shadow-xs">
                  <button
                    type="button"
                    onClick={() => toggleSection('operations')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-amber-100 hover:bg-[#584729]/40 text-[11.5px] font-bold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>⚙️</span>
                      <span>4. Operations & Pressing</span>
                    </div>
                    <span className="text-[9px] text-amber-300">{openSections.operations ? '▲' : '▼'}</span>
                  </button>

                  {openSections.operations && (
                    <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-[#b89542]/20 bg-black/40 text-[11px]">
                      <Link href="/backoffice/operations" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/operations') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Operations Center Overview
                      </Link>
                      <Link href="/backoffice/operations/pressing" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/operations/pressing') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Olive Pressing & Oil Yield %
                      </Link>
                      <Link href="/backoffice/operations/formulations" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/operations/formulations') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Recipe Formulations & Production
                      </Link>
                      <Link href="/backoffice/operations/tanks" className={`block px-2.5 py-1 rounded transition-colors ${isLinkActive('/backoffice/operations/tanks') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Storage Tanks & Bulk Inventory
                      </Link>
                    </div>
                  )}
                </div>

                {/* 5. CUSTOMERS */}
                <div className="border border-[#b89542]/30 rounded-xl overflow-hidden bg-black/30 shadow-xs">
                  <button
                    type="button"
                    onClick={() => toggleSection('customers')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-amber-100 hover:bg-[#584729]/40 text-[11.5px] font-bold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>👥</span>
                      <span>5. Customer Management & AR</span>
                    </div>
                    <span className="text-[9px] text-amber-300">{openSections.customers ? '▲' : '▼'}</span>
                  </button>

                  {openSections.customers && (
                    <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-[#b89542]/20 bg-black/40 text-[11px]">
                      <Link href="/backoffice/customers" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/customers') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Master Directory & KYC (PDF)
                      </Link>
                      <Link href="/backoffice/customers/invoices" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/customers/invoices') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Accounts Receivable & Aging Invoices
                      </Link>
                      <Link href="/backoffice/customers/receipts" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/customers/receipts') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Payment Receipts & Settlements
                      </Link>
                      <Link href="/backoffice/customers/statements" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/customers/statements') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Statements of Account (SOA A4)
                      </Link>
                    </div>
                  )}
                </div>

                {/* 6. ACCOUNTING */}
                <div className="border border-[#b89542]/30 rounded-xl overflow-hidden bg-black/30 shadow-xs">
                  <button
                    type="button"
                    onClick={() => toggleSection('accounting')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-amber-100 hover:bg-[#584729]/40 text-[11.5px] font-bold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>📈</span>
                      <span>6. Accounting & Finance</span>
                    </div>
                    <span className="text-[9px] text-amber-300">{openSections.accounting ? '▲' : '▼'}</span>
                  </button>

                  {openSections.accounting && (
                    <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-[#b89542]/20 bg-black/40 text-[11px]">
                      <Link href="/backoffice/accounting" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/accounting') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Chart of Accounts (COA)
                      </Link>
                      <Link href="/backoffice/accounting/journal" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/accounting/journal') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Journal Entries & Vouchers
                      </Link>
                      <Link href="/backoffice/accounting/ledger" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/accounting/ledger') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        General Ledger & Trial Balance
                      </Link>
                      <Link href="/backoffice/accounting/cost-centers" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/accounting/cost-centers') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Branches & Factory Cost Centers
                      </Link>
                    </div>
                  )}
                </div>

                {/* 7. HR */}
                <div className="border border-[#b89542]/30 rounded-xl overflow-hidden bg-black/30 shadow-xs">
                  <button
                    type="button"
                    onClick={() => toggleSection('hr')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-amber-100 hover:bg-[#584729]/40 text-[11.5px] font-bold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>🪪</span>
                      <span>7. HR & Payroll Management</span>
                    </div>
                    <span className="text-[9px] text-amber-300">{openSections.hr ? '▲' : '▼'}</span>
                  </button>

                  {openSections.hr && (
                    <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-[#b89542]/20 bg-black/40 text-[11px]">
                      <Link href="/backoffice/hr" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/hr') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Employees Directory
                      </Link>
                      <Link href="/backoffice/hr/attendance" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/hr/attendance') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        Attendance Logs & Overtime
                      </Link>
                      <Link href="/backoffice/hr/payroll" className={`block px-2.5 py-1.5 rounded transition-colors ${isLinkActive('/backoffice/hr/payroll') ? 'bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold shadow-xs' : 'text-amber-200/80 hover:text-white hover:bg-black/30'}`}>
                        BLOM Bank Payroll Export
                      </Link>
                    </div>
                  )}
                </div>

              </nav>
            </div>

            {/* Sidebar User Identity Footer */}
            <div className="p-3 border-t-2 border-[#b89542]/30 bg-black/40 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#c5a059] to-[#8a703b] text-slate-950 font-bold flex items-center justify-center text-[10px] shadow-xs">
                  M
                </div>
                <span className="font-bold text-amber-100">Mohammed</span>
              </div>
              <span className="text-[10px] text-amber-300 font-mono bg-black/40 px-1.5 py-0.5 rounded border border-[#c5a059]/40">Live</span>
            </div>

            {/* 3.5PX THICK INVERSE ACCENT BORDER */}
            <div
              style={{
                background: 'linear-gradient(180deg, #c5a059 0%, #d4af37 30%, #8a703b 60%, #1c263c 85%, #0f1624 100%)',
              }}
              className="absolute top-0 right-0 bottom-0 w-[3.5px] shadow-sm"
            />
          </aside>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 overflow-y-auto h-[calc(100vh-68px)] bg-[#f1f5f9] p-4 md:p-6 custom-scrollbar">
          {children}
        </main>

      </div>

    </div>
  );
}
