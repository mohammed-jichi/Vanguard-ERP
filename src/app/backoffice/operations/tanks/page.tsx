import React from 'react';

export default function StorageTanksPage() {
  return (
    <div className="p-6 space-y-4 text-left">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">Storage Tanks & Bulk Inventory</h1>
        <p className="text-xs text-slate-500">Stainless steel oil storage tanks telemetry and batch lot tracking</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
        <span className="text-3xl block mb-2">🛢️</span>
        <h2 className="text-sm font-bold text-slate-800">Tank Farm Inventory Online</h2>
        <p className="text-xs text-slate-500 mt-1">Stainless steel bulk storage monitoring</p>
      </div>
    </div>
  );
}
