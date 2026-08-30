'use client';

import React, { useState } from 'react';

export default function ReportViewPage() {
  const [period, setPeriod] = useState('THIS_MONTH');
  const [branch, setBranch] = useState('ALL');

  const voidItems = [
    {
      id: '1',
      date: '22-Aug-2026 5:31 PM',
      orderDate: '22-Aug-2026 5:31 PM',
      server: 'Hiba Aloulou',
      invoice: '103225',
      description: 'عرض العطاء جديد - زيت زيتون بكر ممتاز 17.5 لتر',
      qty: 1.0,
      valueLbp: 9000000.0,
      reason: 'تعداد خاطئ',
    },
    {
      id: '2',
      date: '13-Aug-2026 6:58 PM',
      orderDate: '13-Aug-2026 6:58 PM',
      server: 'Hiba Aloulou',
      invoice: '103125',
      description: 'ألفية زيت زيتون خضير بلدي 1000 مل',
      qty: 1.0,
      valueLbp: 990000.0,
      reason: 'تعداد خاطئ',
    },
    {
      id: '3',
      date: '13-Aug-2026 6:58 PM',
      orderDate: '13-Aug-2026 6:58 PM',
      server: 'Hiba Aloulou',
      invoice: '103125',
      description: 'حبوب اللقاح البلدية 360غ',
      qty: 1.0,
      valueLbp: 900000.0,
      reason: 'تعداد خاطئ',
    },
  ];

  const totalCount = voidItems.length; // Exactly 3
  const totalQuantity = voidItems.reduce((s, i) => s + i.qty, 0); // Exactly 3.00
  const totalValue = voidItems.reduce((s, i) => s + i.valueLbp, 0); // 10,890,000.00

  return (
    <div className="w-full min-h-screen bg-[#f1f5f9] p-6 font-sans select-none text-left">
      
      {/* Control Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-300 mb-5 flex items-center justify-between text-xs print:hidden shadow-2xs">
        <div className="flex items-center gap-3">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="p-1.5 bg-white border border-slate-300 rounded font-semibold text-xs cursor-pointer">
            <option value="THIS_MONTH">This Month (Aug 1 - Aug 31, 2026)</option>
            <option value="TODAY">Today</option>
          </select>
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className="p-1.5 bg-white border border-slate-300 rounded font-semibold text-xs cursor-pointer">
            <option value="ALL">All Branches</option>
            <option value="Choueifat">Choueifat Main Branch</option>
            <option value="Beirut">Beirut Branch</option>
          </select>
        </div>
        <button onClick={() => window.print()} className="px-4 py-2 bg-[#1a629b] text-white font-bold rounded-lg text-xs cursor-pointer">
          🖨️ Print A4 Report
        </button>
      </div>

      {/* Strict Fixed-Width A4 Sheet */}
      <div className="w-[794px] min-h-[1123px] bg-white p-8 text-black font-sans mx-auto border border-slate-200 shadow-md print:border-none print:shadow-none print:m-0 print:p-6">
        
        {/* Header */}
        <div className="border-b border-black pb-2 mb-2">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-sm font-bold text-slate-900 uppercase">Southern Olive Oil Products S.A.R.L</h1>
              <h2 className="text-base font-bold mt-0.5">Summary of voids</h2>
            </div>
            <div className="text-right text-[10.5px] font-mono text-slate-600 space-y-0.5">
              <div>Prepared By: Mohammed</div>
              <div>Report Code: REP_IC_001</div>
              <div>Page 1 of 1</div>
            </div>
          </div>
          <div className="flex justify-between items-center text-[10.5px] font-mono mt-2 pt-1 border-t border-slate-200 text-slate-700">
            <div>Period: 01-Aug-2026 to 31-Aug-2026</div>
            <div>Branch: {branch === 'ALL' ? 'Southern Olive Oil Products S.A.R.L' : branch}</div>
          </div>
        </div>

        {/* FIXED PROPORTIONS TABLE (table-fixed WITH EXACT WIDTHS) */}
        <table className="w-full table-fixed text-left border-collapse text-[11px] mt-3">
          <thead>
            <tr className="border-b border-black bg-slate-50 font-bold text-black leading-tight">
              <th className="py-1.5 px-1 normal-case w-[15%]">date</th>
              <th className="py-1.5 px-1 normal-case w-[15%]">order date</th>
              <th className="py-1.5 px-1 normal-case w-[12%]">server</th>
              <th className="py-1.5 px-1 normal-case w-[8%] text-center">invoice</th>
              <th className="py-1.5 px-1 normal-case w-[28%]">description</th>
              <th className="py-1.5 px-1 normal-case w-[6%] text-center">qty</th>
              <th className="py-1.5 px-1 normal-case w-[12%] text-right">value (LBP)</th>
              <th className="py-1.5 px-1 normal-case w-[12%]">reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            {voidItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 leading-normal align-top">
                <td className="py-2 px-1 font-mono text-[10px] text-slate-700">{item.date}</td>
                <td className="py-2 px-1 font-mono text-[10px] text-slate-700">{item.orderDate}</td>
                <td className="py-2 px-1 font-semibold text-slate-800">{item.server}</td>
                <td className="py-2 px-1 font-mono font-bold text-center">{item.invoice}</td>
                
                {/* WIDE DESCRIPTION: Proper horizontal reading */}
                <td className="py-2 px-1 font-bold text-slate-900 leading-snug whitespace-normal break-words">
                  {item.description}
                </td>

                <td className="py-2 px-1 text-center font-mono font-bold">{item.qty.toFixed(2)}</td>
                <td className="py-2 px-1 text-right font-mono font-bold">{item.valueLbp.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="py-2 px-1 text-slate-700 text-[10.5px] leading-tight font-medium">{item.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Footer */}
        <div className="border-t-2 border-black mt-4 pt-2 text-[11px] font-mono">
          <div className="flex justify-end space-y-1">
            <div className="w-[320px] space-y-1">
              <div className="flex justify-between font-bold border-b border-slate-200 pb-0.5">
                <span>Total Voids:</span>
                <span>{totalCount}</span>
              </div>
              <div className="flex justify-between font-bold border-b border-slate-200 pb-0.5">
                <span>Total Qty:</span>
                <span>{totalQuantity.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-[#1a629b] text-xs pt-0.5">
                <span>Total Value:</span>
                <span>{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} LBP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-8 right-8 border-t border-black pt-2 flex justify-between items-center text-[10px] text-slate-600 font-mono">
          <span>Printed from Vanguard ERP System</span>
          <span>Southern Olive Oil Products S.A.R.L - Confidential</span>
          <span>Page 1 of 1</span>
        </div>

      </div>

    </div>
  );
}
