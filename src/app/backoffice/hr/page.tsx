import React from 'react';

export default function HRPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">7. HR & Payroll Management</h1>
        <p className="text-xs text-slate-500">Employee records, biometric attendance logs, and BLOM Bank payroll run</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
        <span className="text-3xl block mb-2">🪪</span>
        <h2 className="text-sm font-bold text-slate-800">HR & Payroll Workspace</h2>
        <p className="text-xs text-slate-500 mt-1">Staff management and bank salary transfers</p>
      </div>
    </div>
  );
}
