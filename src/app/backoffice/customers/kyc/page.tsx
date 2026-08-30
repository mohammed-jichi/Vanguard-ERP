import React from 'react';

export default function EnterpriseKYCPage() {
  return (
    <div className="p-6 space-y-4 text-left">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">Enterprise KYC Onboarding & Compliance</h1>
        <p className="text-xs text-slate-500">Commercial register PDF verification, tax identification, and corporate signatory records</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
        <span className="text-3xl block mb-2">📑</span>
        <h2 className="text-sm font-bold text-slate-800">Enterprise KYC Onboarding Module</h2>
        <p className="text-xs text-slate-500 mt-1">Upload and verify Lebanese Commercial Register & Signatory IDs</p>
      </div>
    </div>
  );
}
