import React from 'react';

export default function OperationsDashboardPage() {
  return (
    <div className="p-6 space-y-4 text-left">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">Operations & Factory Overview</h1>
        <p className="text-xs text-slate-500">Live machinery throughput, pressing runs, and tank telemetry</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
        <span className="text-3xl block mb-2">⚙️</span>
        <h2 className="text-sm font-bold text-slate-800">Operations Control Center Live</h2>
        <p className="text-xs text-slate-500 mt-1">Choueifat Industrial Pressing Plant</p>
      </div>
    </div>
  );
}
