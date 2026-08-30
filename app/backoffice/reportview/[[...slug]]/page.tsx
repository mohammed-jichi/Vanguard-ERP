'use client';

import React, { useState } from 'react';

export default function MasterReportViewPage() {
  const [showCatalog, setShowCatalog] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReport, setActiveReport] = useState({
    code: 'REP_IC_001',
    title: 'Summary of Voids',
    category: 'Internal Control',
  });

  const [period, setPeriod] = useState('THIS_MONTH');
  const [branch, setBranch] = useState('ALL');

  // Corrected Voids Sample Data (No squished columns)
  const voidRecords = [
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

  const totalCount = voidRecords.length;
  const totalQty = voidRecords.reduce((s, i) => s + i.qty, 0);
  const totalVal = voidRecords.reduce((s, i) => s + i.valueLbp, 0);

  const categories = [
    { id: '1', title: '1. Internal Control', reports: [{ code: 'REP_IC_001', title: 'Summary of Voids' }, { code: 'REP_IC_002', title: 'Summary of Refunds' }] },
    { id: '2', title: '2. Financial Reports', reports: [{ code: 'REP_F_101', title: 'Sales Summary' }, { code: 'REP_F_201', title: 'Tax Summary' }] },
    { id: '3', title: '3. Product Sales', reports: [{ code: 'REP_S_00191', title: 'Sales by Items' }, { code: 'REP_S_00192', title: 'Sales by Invoices' }] },
    { id: '4', title: '4. Customer Sales', reports: [{ code: 'REP_C_101', title: 'Top Customers by Amount' }] },
    { id: '5', title: "5. Today's & History", reports: [{ code: 'REP_TH_101', title: "Today's Statistics" }] },
    { id: '6', title: '6. Time & Attendance', reports: [{ code: 'REP_TA_001', title: 'Employee Attendance' }] },
    { id: '7', title: '7. Lists', reports: [{ code: 'REP_L_001', title: 'Customer List Standard' }] },
  ];

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800 select-none">
      
      {/* Top Header */}
      <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCatalog(!showCatalog)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 cursor-pointer"
          >
            {showCatalog ? '◀ Hide Catalog' : '▶ Show Report Categories'}
          </button>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Active Report:</span>
            <span className="font-bold text-[#1a629b] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              [{activeReport.code}] {activeReport.title}
            </span>
          </div>
        </div>
        <span className="text-xs font-mono text-slate-500">Southern Olive Oil Products S.A.R.L</span>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        {showCatalog && (
          <div className="w-[280px] h-[calc(100vh-48px)] bg-white border-r border-slate-300 print:hidden overflow-y-auto p-2 space-y-2 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search reports..."
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:outline-none mb-2"
            />
            {categories.map((c) => (
              <div key={c.id} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                <div className="px-2.5 py-1 bg-slate-100 font-bold text-slate-800 text-[11px] border-b border-slate-200">
                  {c.title}
                </div>
                <div className="p-1 space-y-0.5 bg-white">
                  {c.reports.map((r) => (
                    <button
                      key={r.code}
                      onClick={() => setActiveReport({ ...r, category: c.title })}
                      className={`w-full text-left px-2 py-1 rounded truncate block text-xs font-medium cursor-pointer ${
                        activeReport.code === r.code ? 'bg-[#1a629b] text-white font-bold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      [{r.code}] {r.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Report Canvas & Perfect A4 Table */}
        <div className="flex-1 h-[calc(100vh-48px)] overflow-y-auto p-6 bg-[#f1f5f9]">
          
          {/* Controls */}
          <div className="bg-white p-3 rounded-xl border border-slate-300 mb-5 flex items-center justify-between text-xs print:hidden shadow-sm">
            <div className="flex items-center gap-3">
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className="p-1.5 bg-white border border-slate-300 rounded font-semibold text-xs">
                <option value="THIS_MONTH">This Month (August 2026)</option>
                <option value="TODAY">Today</option>
              </select>
              <select value={branch} onChange={(e) => setBranch(e.target.value)} className="p-1.5 bg-white border border-slate-300 rounded font-semibold text-xs">
                <option value="ALL">All Branches</option>
                <option value="Choueifat">Choueifat Main Branch</option>
                <option value="Beirut">Beirut Branch</option>
              </select>
            </div>
            <button onClick={() => window.print()} className="px-4 py-2 bg-[#1a629b] text-white font-bold rounded-lg text-xs shadow-sm hover:bg-[#124b77] cursor-pointer">
              🖨️ Print A4 Report
            </button>
          </div>

          {/* Strict A4 Container (table-fixed WITH PROPER WIDTHS) */}
          <div className="w-[794px] min-h-[1123px] bg-white p-8 text-black font-sans mx-auto border border-slate-200 shadow-md print:border-none print:shadow-none print:m-0 print:p-6 relative">
            
            {/* Header */}
            <div className="border-b border-black pb-2 mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-sm font-bold text-slate-900 uppercase">Southern Olive Oil Products S.A.R.L</h1>
                  <h2 className="text-base font-bold mt-0.5">{activeReport.title}</h2>
                </div>
                <div className="text-right text-[10.5px] font-mono text-slate-600 space-y-0.5">
                  <div>Prepared By: Mohammed</div>
                  <div>Report Code: {activeReport.code}</div>
                  <div>Page 1 of 1</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10.5px] font-mono mt-2 pt-1 border-t border-slate-200 text-slate-700">
                <div>Period: 01-Aug-2026 to 31-Aug-2026</div>
                <div>Branch: {branch === 'ALL' ? 'Southern Olive Oil Products S.A.R.L' : branch}</div>
              </div>
            </div>

            {/* FIXED PROPORTIONS TABLE (table-fixed) */}
            <table className="w-full table-fixed text-left border-collapse text-[11px] mt-3">
              <thead>
                <tr className="border-b border-black bg-slate-50 font-bold text-black leading-tight">
                  <th className="py-1.5 px-1 normal-case font-bold w-[15%]">date</th>
                  <th className="py-1.5 px-1 normal-case font-bold w-[15%]">order date</th>
                  <th className="py-1.5 px-1 normal-case font-bold w-[12%]">server</th>
                  <th className="py-1.5 px-1 normal-case font-bold w-[8%] text-center">invoice</th>
                  <th className="py-1.5 px-1 normal-case font-bold w-[28%]">description</th>
                  <th className="py-1.5 px-1 normal-case font-bold w-[6%] text-center">qty</th>
                  <th className="py-1.5 px-1 normal-case font-bold w-[12%] text-right">value (LBP)</th>
                  <th className="py-1.5 px-1 normal-case font-bold w-[12%]">reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {voidRecords.map((item) => (
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
                    <span>{totalQty.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1a629b] text-xs pt-0.5">
                    <span>Total:</span>
                    <span>{totalVal.toLocaleString('en-US', { minimumFractionDigits: 2 })} LBP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-black pt-2 mt-12 flex justify-between items-center text-[10px] text-slate-600 font-mono">
              <span>Printed from Vanguard ERP System</span>
              <span>Southern Olive Oil Products S.A.R.L - Confidential</span>
              <span>Page 1 of 1</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
