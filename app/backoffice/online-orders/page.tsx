import React from 'react';

export default function OnlineOrdersPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">Online Orders Control</h1>
        <p className="text-xs text-slate-500">Live incoming e-commerce & WhatsApp orders dispatch</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
        <span className="text-3xl block mb-2">🛍️</span>
        <h2 className="text-sm font-bold text-slate-800">Online Orders Pipeline Active</h2>
        <p className="text-xs text-slate-500 mt-1">Real-time sync with WhatsApp and Web store orders</p>
      </div>
    </div>
  );
}
