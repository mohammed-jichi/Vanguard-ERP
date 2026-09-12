'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SalesTeamPerformanceView from '@/components/SalesTeamPerformanceView';

export default function SalesManagerDashboardPage() {
  return (
    <div className="min-h-screen bg-[#f6f7f9] text-[#172033] font-sans pb-16">
      {/* Top Header & Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[1520px] mx-auto">
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/backoffice/operations/dashboard"
              className="font-semibold text-slate-500 hover:text-blue-600 transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Operations</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900">Sales Manager Dashboard</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1520px] mx-auto px-4 lg:px-8 mt-5">
        <SalesTeamPerformanceView />
      </div>
    </div>
  );
}
