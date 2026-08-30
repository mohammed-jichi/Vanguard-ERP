'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SubRoute {
  title: string;
  href: string;
  icon?: string;
  badge?: string;
  isExternal?: boolean;
}

interface ModuleSection {
  id: string;
  title: string;
  icon: string;
  subRoutes: SubRoute[];
}

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const modules: ModuleSection[] = useMemo(() => [
    {
      id: 'sales',
      title: 'Sales Control',
      icon: '🛒',
      subRoutes: [
        { title: 'Dashboard', href: '/backoffice/dashboard', icon: '📊' },
        { title: 'Reports', href: '/backoffice/reportview', icon: '📑', badge: '93 Rep' },
        { title: 'Online Orders', href: '/backoffice/online-orders', icon: '🌐' },
        { title: 'End of Day', href: '/backoffice/end-of-day', icon: '🧾' },
        { title: 'Setup & Pricing', href: '/backoffice/sales-setup', icon: '⚙️' },
        { title: 'POS Touch Terminal', href: '/pos', icon: '💻', isExternal: true },
      ],
    },
    {
      id: 'fleet',
      title: 'SuperSonic Fleet',
      icon: '🚚',
      subRoutes: [
        { title: 'Live Fleet Dispatch', href: '/backoffice/fleet', icon: '🗺️' },
        { title: 'Vehicles & Maintenance', href: '/backoffice/fleet/vehicles', icon: '🚐' },
        { title: 'Drivers Directory', href: '/backoffice/fleet/drivers', icon: '🪪' },
        { title: 'COD & Cash Settlements', href: '/backoffice/fleet/settlements', icon: '💵' },
      ],
    },
    {
      id: 'social',
      title: 'Social CRM & Support',
      icon: '💬',
      subRoutes: [
        { title: 'Social Management Hub (6 Pillars)', href: '/backoffice/social-crm', icon: '📱' },
      ],
    },
    {
      id: 'operations',
      title: 'Operations & Pressing',
      icon: '⚙️',
      subRoutes: [
        { title: 'Operations Center Overview', href: '/backoffice/operations', icon: '🏭' },
        { title: 'Olive Pressing & Oil Yield %', href: '/backoffice/operations/pressing', icon: '🫒' },
        { title: 'Recipe Formulations & Production', href: '/backoffice/operations/formulations', icon: '🧪' },
        { title: 'Storage Tanks & Bulk Inventory', href: '/backoffice/operations/tanks', icon: '🛢️' },
      ],
    },
    {
      id: 'customers',
      title: 'Customer Management & AR',
      icon: '👥',
      subRoutes: [
        { title: 'Master Directory & KYC (PDF)', href: '/backoffice/customers', icon: '📋' },
        { title: 'Accounts Receivable & Aging', href: '/backoffice/customers/invoices', icon: '🧾' },
        { title: 'Payment Receipts & Settlements', href: '/backoffice/customers/receipts', icon: '💳' },
        { title: 'Statements of Account (SOA A4)', href: '/backoffice/customers/statements', icon: '📑' },
      ],
    },
    {
      id: 'accounting',
      title: 'Accounting & Finance',
      icon: '📈',
      subRoutes: [
        { title: 'Chart of Accounts (COA)', href: '/backoffice/accounting', icon: '📒' },
        { title: 'Journal Entries & Vouchers', href: '/backoffice/accounting/journal', icon: '📝' },
        { title: 'General Ledger & Trial Balance', href: '/backoffice/accounting/ledger', icon: '⚖️' },
        { title: 'Branches & Cost Centers', href: '/backoffice/accounting/cost-centers', icon: '🏢' },
      ],
    },
    {
      id: 'hr',
      title: 'HR & Payroll Management',
      icon: '🪪',
      subRoutes: [
        { title: 'Employees Directory', href: '/backoffice/hr', icon: '🧑‍💼' },
        { title: 'Attendance Logs & Overtime', href: '/backoffice/hr/attendance', icon: '⏱️' },
        { title: 'BLOM Bank Payroll Export', href: '/backoffice/hr/payroll', icon: '🏦' },
      ],
    },
  ], []);

  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;
    const query = searchQuery.toLowerCase();
    return modules
      .map((mod) => {
        const matchesMod = mod.title.toLowerCase().includes(query);
        const matchedSub = mod.subRoutes.filter((sub) => sub.title.toLowerCase().includes(query));
        if (matchesMod || matchedSub.length > 0) {
          return {
            ...mod,
            subRoutes: matchesMod ? mod.subRoutes : matchedSub,
          };
        }
        return null;
      })
      .filter(Boolean) as ModuleSection[];
  }, [modules, searchQuery]);

  const isLinkActive = (href: string) => {
    if (href === '/backoffice/dashboard') {
      return pathname === '/backoffice/dashboard' || pathname === '/backoffice';
    }
    return pathname === href || (pathname && pathname.startsWith(href) && href !== '/backoffice');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f8fafc] font-sans text-slate-800 text-left select-none">
      
      {/* 1. TOP NAVBAR (Reference Exact Header) */}
      <header className="w-full bg-[#1e1e1e] text-white h-[50px] flex items-center justify-between px-3 md:px-4 border-b border-[#2d2d2d] z-50 shrink-0 sticky top-0">
        
        {/* Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-slate-300 hover:text-white p-1 rounded focus:outline-hidden"
            title="Toggle Sidebar"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" clipRule="evenodd" />
            </svg>
          </button>

          <Link href="/backoffice/dashboard" className="flex items-center gap-2 text-decoration-none">
            <span className="text-xl">🫒</span>
            <span className="font-bold text-white text-[15px] tracking-tight hover:text-amber-400 transition-colors">
              Vanguard ERP
            </span>
          </Link>
        </div>

        {/* Center Company Identifier */}
        <div className="hidden md:flex items-center text-center">
          <span className="text-white text-[13.5px] font-medium tracking-wide bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
            22901 - Southern Olive Oil Products S.A.R.L
          </span>
        </div>

        {/* Right Top Action Icons & User Dropdown */}
        <div className="flex items-center gap-1.5 md:gap-3 text-xs">
          
          {/* Home Icon */}
          <Link
            href="/backoffice/dashboard"
            className="text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition-colors"
            title="Home"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </Link>

          {/* Inbox with Red Badge */}
          <div className="relative">
            <button
              type="button"
              className="text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition-colors flex items-center"
              title="Inbox Notifications"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-bold px-1 rounded-full">
                0
              </span>
            </button>
          </div>

          {/* Support Link */}
          <Link
            href="/backoffice/dashboard"
            className="text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition-colors"
            title="Support Center"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </Link>

          {/* User Profile Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 text-white hover:text-slate-200 px-2 py-1.5 rounded hover:bg-slate-800 transition-colors font-medium text-[13px]"
            >
              <div className="w-5 h-5 rounded-full bg-[#1a629b] text-white flex items-center justify-center text-[10px] font-bold">
                M
              </div>
              <span className="hidden sm:inline">Jichi Mohammed</span>
              <span className="text-[10px] text-amber-500">▼</span>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                  <p className="font-bold text-slate-900">Jichi Mohammed</p>
                  <p className="text-[10.5px] text-slate-500 font-mono">Operations Administrator</p>
                </div>
                <Link
                  href="/backoffice/dashboard"
                  onClick={() => setUserDropdownOpen(false)}
                  className="block px-3 py-2 hover:bg-slate-100 text-slate-700"
                >
                  🏢 Organization
                </Link>
                <Link
                  href="/backoffice/reportview"
                  onClick={() => setUserDropdownOpen(false)}
                  className="block px-3 py-2 hover:bg-slate-100 text-slate-700"
                >
                  📊 Executive Reports
                </Link>
                <hr className="my-1 border-slate-100" />
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 font-bold"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>

          {/* Quick Apps Matrix Icon */}
          <Link
            href="/backoffice/reportview"
            className="text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition-colors"
            title="Open Quick Menu"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </Link>

        </div>

      </header>

      {/* 2. MAIN BODY CONTAINER: SIDEBAR + CONTENT */}
      <div className="flex flex-1 w-full min-h-[calc(100vh-50px)] overflow-hidden">
        
        {/* SIDEBAR NAVIGATION (Exact #364150 Vanguard Palette) */}
        <aside
          className={`${
            sidebarCollapsed ? 'w-0 hidden' : 'w-[260px] md:w-[275px]'
          } bg-[#364150] text-[#c0c9d6] flex flex-col justify-between border-r border-[#2b3542] print:hidden select-none shrink-0 transition-all duration-150 ease-in-out`}
        >
          <div className="flex flex-col h-full">
            
            {/* Sidebar Home Rail Key */}
            <Link
              href="/backoffice/dashboard"
              className={`flex items-center gap-2.5 px-4 py-2.5 bg-[#2c3542] hover:bg-[#232b36] text-white border-b border-[#222933] text-[13px] font-bold transition-colors ${
                pathname === '/backoffice/dashboard' ? 'bg-[#1a629b]' : ''
              }`}
            >
              <span className="text-base">🏠</span>
              <span>Home</span>
            </Link>

            {/* Sidebar Search Input */}
            <div className="p-2 bg-[#2c3542] border-b border-[#222933]">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="search menu..."
                  className="w-full bg-[#1e232d] text-slate-100 placeholder-slate-400 text-xs px-3 py-1.5 pl-8 rounded border border-[#3e4b5c] focus:outline-hidden focus:border-amber-500 font-sans"
                />
                <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs">🔍</span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1.5 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Accordion Modules Tree */}
            <nav className="flex-1 p-1 space-y-1 overflow-y-auto custom-scrollbar text-xs">
              {filteredModules.map((mod) => {
                const isOpen = openSections[mod.id] ?? true;
                return (
                  <div key={mod.id} className="border-b border-[#2c3542]/60 pb-0.5">
                    
                    {/* Module Level 1 Header */}
                    <button
                      type="button"
                      onClick={() => toggleSection(mod.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-slate-100 hover:bg-[#2c3542] text-[12px] font-bold transition-colors rounded"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{mod.icon}</span>
                        <span className="text-white tracking-tight">{mod.title}</span>
                      </div>
                      <span className="text-[#bb770f] text-[11px] font-bold">
                        {isOpen ? '▲' : '▼'}
                      </span>
                    </button>

                    {/* Module Sub-Routes List */}
                    {isOpen && (
                      <div className="py-0.5 space-y-0.5 bg-[#28313e]/90 rounded-sm">
                        {mod.subRoutes.map((sub) => {
                          const active = isLinkActive(sub.href);
                          return sub.isExternal ? (
                            <a
                              key={sub.title}
                              href={sub.href}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between pl-7 pr-2.5 py-1.5 text-[11.5px] text-amber-400 hover:bg-[#1e232d] hover:text-white transition-colors"
                            >
                              <div className="flex items-center gap-1.5">
                                <span>{sub.icon}</span>
                                <span>{sub.title}</span>
                              </div>
                              <span className="text-[10px]">↗</span>
                            </a>
                          ) : (
                            <Link
                              key={sub.title}
                              href={sub.href}
                              className={`flex items-center justify-between pl-7 pr-2.5 py-1.5 text-[11.5px] rounded transition-colors ${
                                active
                                  ? 'bg-[#1a629b] text-white font-bold shadow-xs'
                                  : 'text-[#b4bcc8] hover:bg-[#1e232d] hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span>{sub.icon}</span>
                                <span className="truncate">{sub.title}</span>
                              </div>
                              {sub.badge && (
                                <span className="text-[9.5px] font-mono bg-blue-500/30 text-blue-200 px-1 py-0.2 rounded border border-blue-400/30">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })}
            </nav>

            {/* Sidebar User Identity Status Footer */}
            <div className="p-2.5 bg-[#2c3542] border-t border-[#222933] text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-slate-200 text-[11.5px]">Facility Online</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">v4.8 Enterprise</span>
            </div>

          </div>
        </aside>

        {/* 3. MAIN WORKSPACE VIEWPORT */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-[#f8fafc] text-slate-800">
          {children}
        </main>

      </div>

    </div>
  );
}
