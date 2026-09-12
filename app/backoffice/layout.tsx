'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

function MasterBackofficeLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentOpsSection = searchParams.get('section') || 'dashboard';

  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickDrawerOpen, setQuickDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'UPDATES' | 'ALERTS' | 'ACTIVITIES' | 'HELP' | 'DARK'>('UPDATES');

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f3f5f8] font-sans text-slate-800 text-left select-none relative print:bg-white print:m-0 print:p-0">

      {/* 1. MASTER TOP GLOBAL HEADER */}
      <header className="h-[68px] bg-white border-b-2 border-[#1e3a2b]/20 px-5 flex items-center justify-between print:hidden shrink-0 text-slate-800 z-40 relative shadow-xs">

        {/* Left Side: Toggle + Vanguard Logo & Title */}
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

        {/* Right Side: Action Icons -> QUICK MENU FIRST -> JICHI MOHAMMED */}
        <div className="flex items-center gap-3 shrink-0">

          <div className="flex items-center gap-1.5 text-slate-600">
            {/* 1. Home */}
            <Link
              href="/backoffice/dashboard"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200"
              title="Dashboard Home"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </Link>

            {/* 2. OPERATIONAL INBOX */}
            <Link
              href="/backoffice/inbox"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 relative"
              title="Operations & Approvals Inbox"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
                2
              </span>
            </Link>

            {/* 3. Alerts */}
            <button
              type="button"
              onClick={() => { setActiveDrawerTab('ALERTS'); setQuickDrawerOpen(true); }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 relative"
              title="Alerts & Notifications"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </button>

            {/* 4. Help */}
            <button
              type="button"
              onClick={() => { setActiveDrawerTab('HELP'); setQuickDrawerOpen(true); }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200"
              title="Help & Support"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </button>

            {/* 5. QUICK MENU GRID BUTTON */}
            <button
              type="button"
              onClick={() => setQuickDrawerOpen(!quickDrawerOpen)}
              className="p-2 rounded-xl bg-[#1e3a2b] hover:bg-[#14281e] text-white transition-colors shadow-2xs"
              title="Open Quick Menu Drawer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>

          {/* 6. JICHI MOHAMMED PROFILE */}
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

            {/* 10-Item Authentic Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-300 rounded-2xl shadow-2xl py-2 text-xs text-slate-800 z-50 animate-fadeIn">
                <div className="px-4 py-2.5 border-b border-slate-100 bg-[#f8faf8]">
                  <div className="font-bold text-slate-900 text-sm">Jichi Mohammed</div>
                  <div className="text-[10.5px] text-[#1e3a2b] font-mono font-semibold">General Operations Manager</div>
                  <div className="text-[9.5px] text-slate-400 font-mono truncate mt-0.5">
                    Southern Olive Oil Products S.A.R.L
                  </div>
                </div>

                <div className="py-1">
                  <button type="button" onClick={() => { alert('Organization Settings'); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">
                    <span className="text-sm">🏢</span> <span>Organization</span>
                  </button>
                  <button type="button" onClick={() => { setActiveDrawerTab('ALERTS'); setQuickDrawerOpen(true); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">
                    <span className="text-sm">🔔</span> <span>Alerts</span>
                  </button>
                  <Link href="/backoffice/inbox" onClick={() => setUserDropdownOpen(false)} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">
                    <span className="text-sm">💬</span> <span>Notifications & Inbox</span>
                  </Link>
                  <button type="button" onClick={() => { alert('Language: English (Default)'); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">
                    <span className="text-sm">🌐</span> <span>Language</span>
                  </button>
                  <button type="button" onClick={() => { alert('My Account Settings'); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">
                    <span className="text-sm">👤</span> <span>My Account</span>
                  </button>
                  <button type="button" onClick={() => { alert('Roles & Permissions'); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">
                    <span className="text-sm">🔑</span> <span>Roles</span>
                  </button>
                  <button type="button" onClick={() => { alert('Users Management'); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">
                    <span className="text-sm">👥</span> <span>Users</span>
                  </button>
                  <button type="button" onClick={() => { setActiveDrawerTab('UPDATES'); setQuickDrawerOpen(true); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">
                    <span className="text-sm">📰</span> <span>Latest Updates</span>
                  </button>
                  <button type="button" onClick={() => { setActiveDrawerTab('HELP'); setQuickDrawerOpen(true); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors">
                    <span className="text-sm">❓</span> <span>Support Center</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button type="button" onClick={() => alert('Signed out successfully')} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-bold flex items-center gap-2.5 transition-colors">
                    <span className="text-sm">🚪</span> <span>Logout</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

        <div
          style={{
            background: 'linear-gradient(90deg, #c5a059 0%, #1e3a2b 50%, #c5a059 100%)',
          }}
          className="absolute bottom-0 left-0 right-0 h-[2.5px] print:hidden"
        />
      </header>

      {/* 2. BODY WORKSPACE */}
      <div className="flex-1 flex overflow-hidden print:overflow-visible print:m-0 print:p-0">

        {/* Master Left Sidebar (Unified with Product Insights & Customer Insights) */}
        <Sidebar
          activeScreen={pathname}
          isOpen={sidebarVisible}
          onToggleOpen={(open) => setSidebarVisible(open)}
          className="h-[calc(100vh-68px)]"
        />

        {/* Main Canvas Viewport */}
        <main className={`flex-1 min-w-0 overflow-y-auto h-[calc(100vh-68px)] bg-[#f3f5f8] ${
          (pathname === '/backoffice/operations' && (currentOpsSection === 'dashboard' || currentOpsSection === 'reports')) || pathname === '/backoffice/operations/dashboard'
            ? 'p-0'
            : 'p-4 md:p-6'
        } custom-scrollbar print:overflow-visible print:m-0 print:p-0 print:bg-white`}>
          {children}
        </main>

        {/* 3. SLIDING QUICK MENU DRAWER */}
        {quickDrawerOpen && (
          <aside className="w-[360px] bg-white border-l border-slate-300 shadow-2xl flex flex-col h-[calc(100vh-68px)] z-50 shrink-0 print:hidden animate-slideLeft">

            <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50 text-center text-xs">
              <button
                type="button"
                onClick={() => setActiveDrawerTab('UPDATES')}
                className={`py-3 px-1 flex flex-col items-center gap-1 border-r border-slate-200 transition-colors ${activeDrawerTab === 'UPDATES' ? 'bg-white text-[#1e3a2b] font-bold border-b-2 border-b-[#1e3a2b]' : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span className="text-base">📰</span>
                <span className="text-[10px] leading-tight">Latest<br />Updates</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDrawerTab('ALERTS')}
                className={`py-3 px-1 flex flex-col items-center gap-1 border-r border-slate-200 transition-colors ${activeDrawerTab === 'ALERTS' ? 'bg-white text-[#1e3a2b] font-bold border-b-2 border-b-[#1e3a2b]' : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span className="text-base">🔔</span>
                <span className="text-[10px] leading-tight">Alerts</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDrawerTab('ACTIVITIES')}
                className={`py-3 px-1 flex flex-col items-center gap-1 border-r border-slate-200 transition-colors ${activeDrawerTab === 'ACTIVITIES' ? 'bg-white text-[#1e3a2b] font-bold border-b-2 border-b-[#1e3a2b]' : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span className="text-base">🕒</span>
                <span className="text-[10px] leading-tight">Last<br />Activities</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDrawerTab('HELP')}
                className={`py-3 px-1 flex flex-col items-center gap-1 border-r border-slate-200 transition-colors ${activeDrawerTab === 'HELP' ? 'bg-white text-[#1e3a2b] font-bold border-b-2 border-b-[#1e3a2b]' : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span className="text-base">❓</span>
                <span className="text-[10px] leading-tight">Help</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDrawerTab('DARK')}
                className={`py-3 px-1 flex flex-col items-center gap-1 transition-colors ${activeDrawerTab === 'DARK' ? 'bg-white text-[#1e3a2b] font-bold border-b-2 border-b-[#1e3a2b]' : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span className="text-base">🌙</span>
                <span className="text-[10px] leading-tight">Theme</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 text-xs">
              {activeDrawerTab === 'UPDATES' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Latest Updates</h3>
                    <button type="button" onClick={() => setQuickDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">Sales Control</span>
                      <span className="text-[10px] text-slate-400 font-mono">31 Aug 2026</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      High-contrast matrix reporting engine with multi-format exports (PDF, Excel, CSV) now live for Southern Olive Oil Products S.A.R.L.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">Operations Center</span>
                      <span className="text-[10px] text-slate-400 font-mono">26 Aug 2026</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      A new role access has been configured under Operations Center: Purchase Order - Hide Cost option.
                    </p>
                  </div>
                </div>
              )}

              {activeDrawerTab === 'ALERTS' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Alerts</h3>
                    <button type="button" onClick={() => setQuickDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                  </div>

                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 font-medium space-y-2">
                    <span className="text-2xl block">🔔</span>
                    <span>No active alerts right now.</span>
                  </div>
                </div>
              )}

              {activeDrawerTab === 'ACTIVITIES' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Last Activities</h3>
                    <button type="button" onClick={() => setQuickDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">Sales Control</span>
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="font-semibold">Sales:</span>
                        <span className="font-mono text-slate-400">Sun 30 Aug 2026 06:13 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Quotations:</span>
                        <span className="font-mono text-slate-400">Sat 22 Aug 2026 09:33 AM</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">Operations Center</span>
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="font-semibold">Adjustments:</span>
                        <span className="font-mono text-slate-400">Sat 1 Aug 2026 01:39 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Production:</span>
                        <span className="font-mono text-slate-400">Thu 9 Jul 2026 10:13 AM</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDrawerTab === 'HELP' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Help & Support</h3>
                    <button type="button" onClick={() => setQuickDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">?</span>
                      <div>
                        <h4 className="font-bold text-slate-900">Support Center</h4>
                        <p className="text-[10.5px] text-slate-500">Open the main support page for guides and videos.</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => alert('Support Center Opened')} className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded font-bold text-xs text-slate-800">
                      Open Support
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">💬</span>
                      <div>
                        <h4 className="font-bold text-slate-900">Feedback</h4>
                        <p className="text-[10.5px] text-slate-500">Open the feedback form and send your direct comments.</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => alert('Feedback Form Opened')} className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded font-bold text-xs text-slate-800">
                      Open Feedback
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">ℹ️ Quick Tips</span>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div className="p-2 bg-white rounded border border-slate-200 flex gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[9px] shrink-0">1</span>
                        <span>Use the left catalog to swap between all 93 reports.</span>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200 flex gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[9px] shrink-0">2</span>
                        <span>Use the ribbon toolbar to filter by live rolling EOD dates.</span>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200 flex gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[9px] shrink-0">3</span>
                        <span>Export directly to PDF, Excel, and CSV with Arabic UTF-8.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDrawerTab === 'DARK' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Theme Settings</h3>
                    <button type="button" onClick={() => setQuickDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                    <span className="text-2xl block">☀️</span>
                    <span className="font-bold text-slate-800 block">Active Mode: Warm Light Mode</span>
                    <p className="text-[11px] text-slate-500">High-Contrast Light Theme is active and locked for optimal eye comfort.</p>
                  </div>
                </div>
              )}

            </div>
          </aside>
        )}

      </div>

    </div>
  );
}

export default function MasterBackofficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex flex-col w-full min-h-screen bg-[#f3f5f8] p-4 text-xs text-slate-500">Loading Vanguard Backoffice...</div>}>
      <MasterBackofficeLayoutContent>{children}</MasterBackofficeLayoutContent>
    </Suspense>
  );
}
