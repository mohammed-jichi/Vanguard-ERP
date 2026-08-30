'use client';

import React from 'react';

export default function BackofficeDashboardPage() {
  return (
    <div className="p-6 space-y-6 bg-[#f8fafc] min-h-screen select-none">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Executive Dashboard & Operations Overview</h1>
          <p className="text-xs text-slate-500 font-medium">Southern Olive Oil Products S.A.R.L - Choueifat & Beirut Facilities</p>
        </div>
        <span className="text-xs font-mono bg-blue-50 text-[#1a629b] font-bold px-3 py-1 rounded-full border border-blue-200">
          Live System Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">TODAY SALES</span>
          <span className="text-2xl font-bold text-slate-900 font-mono block mt-1">$4,850.00</span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1.5">42 Invoices generated</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">ACTIVE SOCIAL REPS</span>
          <span className="text-2xl font-bold text-[#1a629b] font-mono block mt-1">3 Reps Online</span>
          <span className="text-[11px] text-slate-500 font-semibold block mt-1.5">1-Hour SLA Active</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">OLIVE PRESSING</span>
          <span className="text-2xl font-bold text-amber-600 font-mono block mt-1">14,250 KG</span>
          <span className="text-[11px] text-slate-500 font-semibold block mt-1.5">Avg Yield: 21.8%</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">CUSTOMER BASE</span>
          <span className="text-2xl font-bold text-emerald-600 font-mono block mt-1">104,850 Contacts</span>
          <span className="text-[11px] text-slate-500 font-semibold block mt-1.5">Unified Database</span>
        </div>
      </div>
    </div>
  );
}
