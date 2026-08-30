'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isLinkActive = (path: string) => {
    if (path === '/backoffice/dashboard' && (pathname === '/backoffice' || pathname === '/backoffice/dashboard')) return true;
    return pathname?.startsWith(path);
  };

  // If on reportview, allow full viewport space since reportview has its own dedicated master navigation & catalog
  if (pathname?.startsWith('/backoffice/reportview')) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full bg-[#0f172a] font-sans text-slate-100 antialiased overflow-hidden text-left">
      {/* Backoffice Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-[#1e293b] flex flex-col justify-between shrink-0 select-none">
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-slate-700 pb-3">
            <h1 className="text-sm font-bold text-white tracking-tight">
              Southern Olive Oil Products S.A.R.L
            </h1>
            <p className="text-[11px] text-amber-400 font-mono mt-0.5">
              Vanguard ERP Backoffice
            </p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 text-xs font-medium">
            <Link
              href="/backoffice/dashboard"
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                isLinkActive('/backoffice/dashboard')
                  ? 'bg-[#1a629b] text-white font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>📊</span>
                <span>Dashboard</span>
              </div>
            </Link>

            {/* 1. Sales Control & POS Group */}
            <div className="pt-2">
              <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                1. Sales Control & POS
              </div>
              <Link
                href="/backoffice/reportview"
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                  isLinkActive('/backoffice/reportview')
                    ? 'bg-[#1a629b] text-white font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>📈</span>
                  <span>Sales Reports</span>
                </div>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-1 rounded">93 Rep</span>
              </Link>
            </div>

            {/* Management & Insights */}
            <div className="pt-2">
              <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Insights & Relations
              </div>
              <Link
                href="/backoffice/products"
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                  isLinkActive('/backoffice/products')
                    ? 'bg-[#1a629b] text-white font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>📦</span>
                  <span>Product Insights</span>
                </div>
              </Link>

              <Link
                href="/backoffice/customers"
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                  isLinkActive('/backoffice/customers')
                    ? 'bg-[#1a629b] text-white font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>👥</span>
                  <span>Customer Insights</span>
                </div>
              </Link>

              <Link
                href="/backoffice/social-crm"
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                  isLinkActive('/backoffice/social-crm')
                    ? 'bg-[#1a629b] text-white font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>💬</span>
                  <span>Social CRM & Hub</span>
                </div>
              </Link>
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">
            ← Return to Hub
          </Link>
          <span className="font-mono text-slate-500">v2.6</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#f8fafc] text-slate-800">
        {children}
      </main>
    </div>
  );
}
