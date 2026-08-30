import React from 'react';

export default function CustomerStatementsPage() {
  return (
    <div className="p-6 space-y-4 text-left">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">Statements of Account (SOA A4)</h1>
        <p className="text-xs text-slate-500">Generate printable A4 statements of account for commercial clients and stores</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
        <span className="text-3xl block mb-2">📑</span>
        <h2 className="text-sm font-bold text-slate-800">Customer SOA Engine</h2>
        <p className="text-xs text-slate-500 mt-1">Export A4 statement of accounts with invoice debits and payment credits</p>
      </div>
    </div>
  );
}
