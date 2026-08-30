'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function MasterReportViewPage() {
  const [showCatalog, setShowCatalog] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [period, setPeriod] = useState('THIS_MONTH');
  const [branch, setBranch] = useState('ALL');

  // Active Report State (Default: Customer List Standard)
  const [activeReport, setActiveReport] = useState({
    code: 'REP_L_001',
    title: 'Customer List Standard',
    category: 'Lists',
  });

  // 93 Reports Master Catalog Structure
  const reportCategories = [
    {
      id: 'internal_control',
      title: '1. Internal Control',
      icon: '🛡️',
      reports: [
        { code: 'REP_IC_001', title: 'Summary of Voids' },
        { code: 'REP_IC_002', title: 'Summary of Refunds' },
        { code: 'REP_IC_003', title: 'Duplicate Invoices' },
        { code: 'REP_IC_004', title: 'Meter Reports' },
        { code: 'REP_IC_005', title: 'No Sale' },
        { code: 'REP_IC_006', title: 'Transactions on Hold' },
      ],
    },
    {
      id: 'financial',
      title: '2. Financial Reports',
      icon: '💵',
      reports: [
        { code: 'REP_F_101', title: 'Sales Summary' },
        { code: 'REP_F_102', title: 'Statistics by Workstation' },
        { code: 'REP_F_201', title: 'Tax Summary' },
        { code: 'REP_F_301', title: 'Summary of Discount by Divisions' },
        { code: 'REP_F_401', title: 'Summary of Payment' },
        { code: 'REP_F_601', title: 'Profit by Invoices Summary' },
      ],
    },
    {
      id: 'product_sales',
      title: '3. Product Sales',
      icon: '📦',
      reports: [
        { code: 'REP_P_101', title: 'Summary of Sales by Items' },
        { code: 'REP_S_00191', title: 'Sales by Items' },
        { code: 'REP_S_00192', title: 'Sales by Invoices' },
        { code: 'REP_P_105', title: 'Sales by Categories' },
        { code: 'REP_P_106', title: 'Sales by Divisions' },
        { code: 'REP_P_301', title: 'Top N Sold by Quantity' },
      ],
    },
    {
      id: 'customer_sales',
      title: '4. Customer Sales',
      icon: '👥',
      reports: [
        { code: 'REP_C_101', title: 'Top N Customers by Amount' },
        { code: 'REP_C_201', title: 'Sales by Customer and Detail' },
        { code: 'REP_C_202', title: 'Sales by Zone' },
        { code: 'REP_C_203', title: 'Delivery Sales Summary' },
      ],
    },
    {
      id: 'todays_and_history',
      title: "5. Today's and History",
      icon: '📅',
      reports: [
        { code: 'REP_TH_101', title: "Today's Statistics" },
        { code: 'REP_TH_102', title: "Today's Summary of Payment" },
        { code: 'REP_TH_103', title: "Today's Summary by Employee" },
        { code: 'REP_TH_104', title: "Today's Transactions" },
      ],
    },
    {
      id: 'time_attendance',
      title: '6. Time and Attendance',
      icon: '⏱️',
      reports: [
        { code: 'REP_TA_001', title: 'Employee Attendance' },
        { code: 'REP_TA_002', title: 'Time and Attendance' },
        { code: 'REP_TA_003', title: 'Labor Cost' },
      ],
    },
    {
      id: 'lists',
      title: '7. Lists',
      icon: '📋',
      reports: [
        { code: 'REP_L_001', title: 'Customer List Standard' },
        { code: 'REP_L_002', title: 'Not Active Customers' },
        { code: 'REP_L_003', title: 'New Customers' },
        { code: 'REP_L_004', title: 'Blacklist Customers' },
      ],
    },
  ];

  // Specific Datasets for Each Category
  const customerListRows = [
    { code: 'CUST-01', name: 'Al-Baraka Supermarket S.A.R.L', region: 'Mount Lebanon', city: 'Choueifat Main Highway', phone: '03112233', rep: 'Ahmad Ali Kassem', creditLimit: 5000.0, balance: 1400.0, status: 'Active Verified' },
    { code: 'CUST-02', name: 'Al-Nour Food Establishment', region: 'Beirut', city: 'Hamra (Makdessi Street)', phone: '01778899', rep: 'Hiba Aloulou', creditLimit: 3500.0, balance: 890.0, status: 'Active Verified' },
    { code: 'CUST-03', name: 'Al-Kheir Olive Center', region: 'South Lebanon', city: 'Saida (Riad El Solh)', phone: '07722334', rep: 'Hussein Mahdi', creditLimit: 7000.0, balance: 3000.0, status: 'Active Verified' },
    { code: 'CUST-04', name: 'Byblos Green Grocers', region: 'Mount Lebanon', city: 'Jbeil / Byblos Main Road', phone: '09540112', rep: 'Ahmad Ali Kassem', creditLimit: 4000.0, balance: 1700.0, status: 'Active Verified' },
    { code: 'CUST-05', name: 'Bekaa Traditional Trading', region: 'Bekaa', city: 'Zahle Boulevard', phone: '08812345', rep: 'Hussein Mahdi', creditLimit: 6500.0, balance: 0.0, status: 'Active Verified' },
  ];

  const voidRows = [
    { date: '22-Aug-2026 5:31 PM', server: 'Hiba Aloulou', invoice: '103225', description: 'عرض العطاء جديد - زيت زيتون بكر ممتاز 17.5 لتر', qty: 1.0, valueLbp: 9000000.0, reason: 'تعداد خاطئ' },
    { date: '13-Aug-2026 6:58 PM', server: 'Hiba Aloulou', invoice: '103125', description: 'ألفية زيت زيتون خضير بلدي 1000 مل', qty: 1.0, valueLbp: 990000.0, reason: 'تعداد خاطئ' },
    { date: '13-Aug-2026 6:58 PM', server: 'Hiba Aloulou', invoice: '103125', description: 'حبوب اللقاح البلدية 360غ', qty: 1.0, valueLbp: 900000.0, reason: 'تعداد خاطئ' },
  ];

  const salesRows = [
    { ref: 'INV-0891', date: '28-Aug-2026', client: 'Al-Baraka Supermarket', item: '17.5L Olive Oil Tin', qty: 12, totalUsd: 1400.0, rep: 'Ahmad Ali' },
    { ref: 'INV-0892', date: '28-Aug-2026', client: 'Al-Nour Food Est.', item: 'Pomegranate Molasses Box', qty: 24, totalUsd: 890.0, rep: 'Hiba Aloulou' },
    { ref: 'INV-0893', date: '29-Aug-2026', client: 'Al-Kheir Olive Center', item: 'Extra Virgin Glass 1L', qty: 50, totalUsd: 3000.0, rep: 'Hussein Mahdi' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800 select-none text-left">
      
      {/* Top Controls Bar */}
      <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCatalog(!showCatalog)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer"
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

        <span className="text-xs font-mono text-slate-500">
          Southern Olive Oil Products S.A.R.L - Vanguard Matrix Engine
        </span>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left 93 Reports Tree */}
        {showCatalog && (
          <aside className="w-[280px] h-[calc(100vh-48px)] bg-white border-r border-slate-300 print:hidden overflow-y-auto p-2 space-y-2 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search all 93 reports..."
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:border-[#1a629b] focus:outline-none mb-1.5"
            />
            {reportCategories.map((cat) => (
              <div key={cat.id} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/60">
                <div className="px-2.5 py-1.5 bg-slate-100 font-bold text-slate-800 text-[11px] border-b border-slate-200">
                  {cat.icon} {cat.title}
                </div>
                <div className="p-1 space-y-0.5 bg-white">
                  {cat.reports
                    .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.code.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((r) => (
                      <button
                        key={r.code}
                        type="button"
                        onClick={() => setActiveReport({ ...r, category: cat.title })}
                        className={`w-full text-left px-2 py-1 rounded truncate block text-xs transition-colors cursor-pointer ${
                          activeReport.code === r.code ? 'bg-[#1a629b] text-white font-bold' : 'hover:bg-slate-100 text-slate-700 font-medium'
                        }`}
                      >
                        [{r.code}] {r.title}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </aside>
        )}

        {/* Right Canvas: Filters Toolbar + Crisp High-Contrast A4 Paper */}
        <main className="flex-1 h-[calc(100vh-48px)] overflow-y-auto p-6 bg-[#f1f5f9] custom-scrollbar">
          
          {/* Universal Toolbar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-300 mb-5 flex items-center justify-between text-xs print:hidden shadow-xs">
            <div className="flex items-center gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">Period:</label>
                <select value={period} onChange={(e) => setPeriod(e.target.value)} className="p-1.5 bg-white border border-slate-300 rounded font-semibold text-xs focus:outline-none">
                  <option value="THIS_MONTH">This Month (August 2026)</option>
                  <option value="TODAY">Today</option>
                  <option value="YESTERDAY">Yesterday</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">Branch:</label>
                <select value={branch} onChange={(e) => setBranch(e.target.value)} className="p-1.5 bg-white border border-slate-300 rounded font-semibold text-xs focus:outline-none">
                  <option value="ALL">All Operating Branches</option>
                  <option value="Choueifat">Choueifat Main Facility</option>
                  <option value="Beirut">Beirut Branch</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#1a629b] hover:bg-[#124b77] text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>🖨️ Print A4 Report</span>
            </button>
          </div>

          {/* =============================================================== */}
          {/* HIGH-CONTRAST A4 PAPER MATRIX (w-[794px] min-h-[1123px])       */}
          {/* =============================================================== */}
          <div className="w-[794px] min-h-[1123px] page-break-after-always relative bg-white p-8 text-black font-sans mx-auto border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 print:p-6 select-none">
            
            {/* Master Header */}
            <div className="border-b-2 border-black pb-2 mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-sm font-bold uppercase tracking-tight text-slate-900">
                    Southern Olive Oil Products S.A.R.L
                  </h1>
                  <h2 className="text-base font-bold mt-0.5 text-slate-900">{activeReport.title}</h2>
                </div>
                <div className="text-right text-[10.5px] font-mono text-slate-700 space-y-0.5">
                  <div>Prepared By: Mohammed</div>
                  <div>Report Code: {activeReport.code}</div>
                  <div>Page 1 of 1</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10.5px] font-mono mt-2 pt-1 border-t border-slate-300 text-slate-700">
                <div>Period: 01-Aug-2026 to 31-Aug-2026</div>
                <div>Branch: {branch === 'ALL' ? 'Southern Olive Oil Products S.A.R.L' : branch}</div>
              </div>
            </div>

            {/* ============================================================= */}
            {/* VIEW A: LISTS / CUSTOMER DIRECTORY TABLE                      */}
            {/* ============================================================= */}
            {(activeReport.category === 'Lists' || activeReport.code.startsWith('REP_L_')) && (
              <div>
                <table className="w-full table-fixed text-left border-collapse text-[11px] mt-2">
                  <thead>
                    <tr className="border-b border-black bg-slate-100 font-bold text-black leading-tight">
                      <th className="py-1 px-1 normal-case font-bold w-[12%]">code</th>
                      <th className="py-1 px-1 normal-case font-bold w-[28%]">customer / store name</th>
                      <th className="py-1 px-1 normal-case font-bold w-[14%]">region</th>
                      <th className="py-1 px-1 normal-case font-bold w-[16%]">phone</th>
                      <th className="py-1 px-1 normal-case font-bold w-[15%]">assigned rep</th>
                      <th className="py-1 px-1 normal-case font-bold w-[15%] text-right">balance ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {customerListRows.map((cust) => (
                      <tr key={cust.code} className="hover:bg-slate-50 leading-normal">
                        <td className="py-1.5 px-1 font-mono font-bold">{cust.code}</td>
                        <td className="py-1.5 px-1 font-bold text-slate-900">{cust.name}</td>
                        <td className="py-1.5 px-1 text-slate-700">{cust.region}</td>
                        <td className="py-1.5 px-1 font-mono text-slate-700">{cust.phone}</td>
                        <td className="py-1.5 px-1 text-slate-800">{cust.rep.split(' ')[0]}</td>
                        <td className="py-1.5 px-1 text-right font-mono font-bold text-[#1a629b]">
                          ${cust.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t-2 border-black mt-4 pt-2 text-[11px] font-mono flex justify-between items-center font-bold">
                  <span>Total Customers: {customerListRows.length} Active Partners</span>
                  <span>Total Outstanding Balance: ${customerListRows.reduce((s, c) => s + c.balance, 0).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* VIEW B: INTERNAL CONTROL / SUMMARY OF VOIDS TABLE             */}
            {/* ============================================================= */}
            {activeReport.code === 'REP_IC_001' && (
              <div>
                <table className="w-full table-fixed text-left border-collapse text-[11px] mt-2">
                  <thead>
                    <tr className="border-b border-black bg-slate-100 font-bold text-black leading-tight">
                      <th className="py-1 px-1 normal-case font-bold w-[16%]">date & time</th>
                      <th className="py-1 px-1 normal-case font-bold w-[14%]">cashier</th>
                      <th className="py-1 px-1 normal-case font-bold w-[8%] text-center">invoice</th>
                      <th className="py-1 px-1 normal-case font-bold w-[32%]">item description</th>
                      <th className="py-1 px-1 normal-case font-bold w-[6%] text-center">qty</th>
                      <th className="py-1 px-1 normal-case font-bold w-[12%] text-right">value (LBP)</th>
                      <th className="py-1 px-1 normal-case font-bold w-[12%]">reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {voidRows.map((v, i) => (
                      <tr key={i} className="hover:bg-slate-50 leading-normal align-top">
                        <td className="py-1.5 px-1 font-mono text-[10px] text-slate-700">{v.date}</td>
                        <td className="py-1.5 px-1 font-semibold">{v.server}</td>
                        <td className="py-1.5 px-1 font-mono font-bold text-center">{v.invoice}</td>
                        <td className="py-1.5 px-1 font-bold text-slate-900 leading-snug whitespace-normal break-words">
                          {v.description}
                        </td>
                        <td className="py-1.5 px-1 text-center font-mono font-bold">{v.qty.toFixed(2)}</td>
                        <td className="py-1.5 px-1 text-right font-mono font-bold">{v.valueLbp.toLocaleString('en-US')}</td>
                        <td className="py-1.5 px-1 text-slate-700 text-[10.5px]">{v.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t-2 border-black mt-4 pt-2 text-[11px] font-mono flex justify-end">
                  <div className="w-[300px] space-y-1">
                    <div className="flex justify-between font-bold border-b border-slate-200 pb-0.5">
                      <span>Total Voids:</span> <span>3 events</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#1a629b]">
                      <span>Total Value:</span> <span>10,890,000 LBP</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* VIEW C: SALES & FINANCIAL DEFAULT TABLE                       */}
            {/* ============================================================= */}
            {activeReport.category !== 'Lists' && activeReport.code !== 'REP_IC_001' && (
              <div>
                <table className="w-full table-fixed text-left border-collapse text-[11px] mt-2">
                  <thead>
                    <tr className="border-b border-black bg-slate-100 font-bold text-black leading-tight">
                      <th className="py-1 px-1 normal-case font-bold w-[14%]">ref #</th>
                      <th className="py-1 px-1 normal-case font-bold w-[14%]">date</th>
                      <th className="py-1 px-1 normal-case font-bold w-[24%]">client / account</th>
                      <th className="py-1 px-1 normal-case font-bold w-[26%]">item details</th>
                      <th className="py-1 px-1 normal-case font-bold w-[8%] text-center">qty</th>
                      <th className="py-1 px-1 normal-case font-bold w-[14%] text-right">total ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {salesRows.map((s, i) => (
                      <tr key={i} className="hover:bg-slate-50 leading-normal">
                        <td className="py-1.5 px-1 font-mono font-bold">{s.ref}</td>
                        <td className="py-1.5 px-1 font-mono text-[10px]">{s.date}</td>
                        <td className="py-1.5 px-1 font-bold text-slate-900">{s.client}</td>
                        <td className="py-1.5 px-1 text-slate-800">{s.item}</td>
                        <td className="py-1.5 px-1 text-center font-mono">{s.qty}</td>
                        <td className="py-1.5 px-1 text-right font-mono font-bold text-[#1a629b]">${s.totalUsd.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t-2 border-black mt-4 pt-2 text-[11px] font-mono flex justify-between items-center font-bold">
                  <span>Category: {activeReport.category}</span>
                  <span>Total Revenue: ${salesRows.reduce((s, r) => s + r.totalUsd, 0).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Official Footer */}
            <div className="absolute bottom-6 left-8 right-8 border-t border-black pt-2 flex justify-between items-center text-[10px] text-slate-600 font-mono">
              <span>Printed from Vanguard ERP System</span>
              <span>Southern Olive Oil Products S.A.R.L - Confidential</span>
              <span>Page 1 of 1</span>
            </div>

          </div>

        </main>

      </div>

    </div>
  );
}
