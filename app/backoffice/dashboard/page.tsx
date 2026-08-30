'use client';

import React from 'react';

export default function BackofficeDashboardPage() {
  return (
    <div className="p-6 space-y-6 select-none">
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
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs font-bold block">TODAY SALES</span>
          <span className="text-lg font-bold text-slate-900 font-mono">$4,850.00</span>
          <span className="text-[10.5px] text-emerald-600 block mt-1">42 Invoices generated</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs font-bold block">ACTIVE SOCIAL REPS</span>
          <span className="text-lg font-bold text-[#1a629b] font-mono">3 Reps Online</span>
          <span className="text-[10.5px] text-slate-500 block mt-1">1-Hour SLA Active</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs font-bold block">OLIVE PRESSING (THIS SEASON)</span>
          <span className="text-lg font-bold text-amber-600 font-mono">14,250 KG</span>
          <span className="text-[10.5px] text-slate-500 block mt-1">Avg Yield: 21.8%</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs font-bold block">CUSTOMER BASE</span>
          <span className="text-lg font-bold text-emerald-600 font-mono">104,850 Contacts</span>
          <span className="text-[10.5px] text-slate-500 block mt-1">Unified Database</span>
        </div>
      </div>
    </div>
  );
}
