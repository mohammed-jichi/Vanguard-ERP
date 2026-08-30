import React from 'react';

export default function CustomerInvoicesPage() {
  return (
    <div className="p-6 space-y-4 text-left">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">Accounts Receivable & Aging Invoices</h1>
        <p className="text-xs text-slate-500">Aging debt analysis, outstanding invoices, and customer credit ledger</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
        <span className="text-3xl block mb-2">🧾</span>
        <h2 className="text-sm font-bold text-slate-800">AR Aging & Invoices Ledger</h2>
        <p className="text-xs text-slate-500 mt-1">Real-time credit invoices tracking across Lebanon</p>
      </div>
    </div>
  );
}
