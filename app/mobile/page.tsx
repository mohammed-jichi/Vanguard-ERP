import React from 'react';

export default function MobilePointOfSalePage() {
  const mockItems = [
    { id: '1', name: 'Premium Extra Virgin Olive Oil (1L)', weight: '1.000', qty: 2, priceUsd: 14.50, priceLbp: 1297750 },
    { id: '2', name: 'Organic Black Olives (500g)', weight: '0.500', qty: 1, priceUsd: 4.25, priceLbp: 380375 },
    { id: '3', name: 'Cold Pressed Olive Oil (5L Tin)', weight: '5.000', qty: 1, priceUsd: 65.00, priceLbp: 5817500 },
  ];

  const totalUsd = mockItems.reduce((acc, item) => acc + (item.qty * item.priceUsd), 0);
  const totalLbp = mockItems.reduce((acc, item) => acc + (item.qty * item.priceLbp), 0);

  return (
    <div className="flex flex-col h-full w-full p-2 space-y-2">
      {/* Scrollable Item Listing */}
      <div className="bg-white rounded-xl shadow-sm p-3 border border-slate-200 flex-1 overflow-y-auto">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Current Ticket</h2>
        <div className="space-y-3">
          {mockItems.map((item) => (
            <div key={item.id} className="flex justify-between items-start border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <div className="flex-1 pr-2">
                <div className="text-[13px] font-bold text-slate-900 leading-tight mb-1">{item.name}</div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono tabular-nums">
                    {item.qty}x
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono tabular-nums font-semibold">
                    ${item.priceUsd.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                    ({item.weight}kg)
                  </span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="text-[15px] font-black text-slate-900 font-mono tabular-nums tracking-tight">
                  ${(item.qty * item.priceUsd).toFixed(2)}
                </div>
                <div className="text-[10px] font-semibold text-slate-400 font-mono tabular-nums mt-0.5">
                  LBP {(item.qty * item.priceLbp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* High-Contrast Checkout Total */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-lg flex justify-between items-center shrink-0 border border-slate-800">
        <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Due</div>
        <div className="text-right">
          <div className="text-[26px] leading-none font-black font-mono tabular-nums tracking-tighter mb-1">
            ${totalUsd.toFixed(2)}
          </div>
          <div className="text-[11px] font-semibold text-emerald-400 font-mono tabular-nums">
            LBP {totalLbp.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
