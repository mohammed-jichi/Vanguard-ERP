'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function POSTouchTerminalPage() {
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([
    { id: '1', name: '17.5L Extra Virgin Olive Oil Tin', price: 110.0, qty: 1 },
    { id: '2', name: 'Pure Pomegranate Molasses 500ml', price: 6.0, qty: 2 },
  ]);

  const totalUsd = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalLbp = totalUsd * 89500;

  return (
    <div className="w-full h-screen bg-[#1e232d] text-white flex flex-col font-sans select-none text-left">
      {/* POS Header */}
      <header className="h-14 bg-[#161a22] border-b border-slate-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/backoffice/dashboard" className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold text-slate-300 transition-colors">
            ← Back to Backoffice
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-sm">POS Touch Terminal (Choueifat Main)</span>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Southern Olive Oil Products S.A.R.L | Cashier: Mohammed
        </div>
      </header>

      {/* POS Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Product Grid */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: '1', name: '17.5L Olive Oil Tin (Cold Pressed)', price: 110.0, category: 'Olive Oil' },
            { id: '2', name: '1L Extra Virgin Glass Bottle', price: 12.0, category: 'Olive Oil' },
            { id: '3', name: 'Pomegranate Molasses 500ml', price: 6.0, category: 'Preserves' },
            { id: '4', name: 'Pickled Green Olives 1KG', price: 5.5, category: 'Olives' },
            { id: '5', name: 'Eau de Javel 4L Cleaner', price: 4.0, category: 'Detergents' },
            { id: '6', name: 'Traditional Liquid Soap 1L', price: 3.5, category: 'Detergents' },
          ].map((prod) => (
            <button
              key={prod.id}
              onClick={() => setCart((prev) => [...prev, { ...prod, qty: 1 }])}
              className="p-4 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 text-left flex flex-col justify-between transition-all cursor-pointer"
            >
              <div>
                <span className="text-[10px] text-amber-400 font-mono block uppercase">{prod.category}</span>
                <span className="text-xs font-bold text-slate-100 block mt-1">{prod.name}</span>
              </div>
              <span className="text-sm font-bold text-emerald-400 font-mono mt-3">${prod.price.toFixed(2)}</span>
            </button>
          ))}
        </div>

        {/* Right: Cart & Checkout */}
        <div className="w-[360px] bg-[#161a22] border-l border-slate-800 flex flex-col justify-between p-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="font-bold text-xs">Current Receipt ({cart.length} items)</span>
              <button onClick={() => setCart([])} className="text-[11px] text-red-400 hover:underline cursor-pointer">Clear</button>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50 text-xs">
                  <div>
                    <span className="font-bold block truncate w-44">{item.name}</span>
                    <span className="text-slate-400 text-[10.5px]">Qty: {item.qty} x ${item.price.toFixed(2)}</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 space-y-3">
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Total USD:</span>
              <span className="text-emerald-400 font-mono text-base">${totalUsd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
              <span>Total LBP (89,500):</span>
              <span>{totalLbp.toLocaleString()} LBP</span>
            </div>

            <button
              onClick={() => { alert(`Receipt issued successfully! Total: $${totalUsd.toFixed(2)}`); setCart([]); }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Complete Sale & Print Bill (F12)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
