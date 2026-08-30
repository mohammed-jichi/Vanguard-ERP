'use client';

import React, { useState } from 'react';

interface ReportNode {
  id: string;
  code: string;
  title: string;
  category: string;
  subCategory?: string;
}

export default function ReportsMasterLayout() {
  const [showCatalog, setShowCatalog] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReport, setActiveReport] = useState<ReportNode>({
    id: 'ic_01',
    code: 'REP_IC_001',
    title: 'Summary of Voids',
    category: 'Internal Control',
  });

  // Filter States
  const [period, setPeriod] = useState('THIS_MONTH');
  const [branch, setBranch] = useState('ALL');
  const [repFilter, setRepFilter] = useState('ALL');

  // Sample Void Records with Proper Widths & Integer Totals
  const voidRecords = [
    {
      id: '1',
      date: '22-Aug-2026 5:31 PM',
      orderDate: '22-Aug-2026 5:31 PM',
      server: 'Hiba Aloulou',
      invoice: '103225',
      description: 'عرض العطاء جديد - زيت زيتون بكر ممتاز 17.5L',
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

  const totalVoidsCount = voidRecords.length; // 3
  const totalQty = voidRecords.reduce((s, i) => s + i.qty, 0); // 3.00
  const totalValueLbp = voidRecords.reduce((s, i) => s + i.valueLbp, 0); // 10,890,000.00

  // 93 Reports Master Catalog Structure
  const reportCategories = [
    {
      id: 'internal_control',
      title: '1. Internal Control',
      icon: '🛡️',
      reports: [
        { id: 'ic_01', code: 'REP_IC_001', title: 'Summary of Voids' },
        { id: 'ic_02', code: 'REP_IC_002', title: 'Summary of Refunds' },
        { id: 'ic_03', code: 'REP_IC_003', title: 'Duplicate Invoices' },
        { id: 'ic_04', code: 'REP_IC_004', title: 'Meter Reports' },
        { id: 'ic_05', code: 'REP_IC_005', title: 'No Sale' },
        { id: 'ic_06', code: 'REP_IC_006', title: 'Transactions on Hold' },
        { id: 'ic_07', code: 'REP_IC_007', title: 'User Log Report' },
        { id: 'ic_08', code: 'REP_IC_008', title: 'Discount Summary' },
      ],
    },
    {
      id: 'financial',
      title: '2. Financial Reports',
      icon: '💵',
      reports: [
        { id: 'fin_01', code: 'REP_F_101', title: 'Sales Summary' },
        { id: 'fin_02', code: 'REP_F_102', title: 'Statistics by Workstation' },
        { id: 'fin_03', code: 'REP_F_103', title: 'Statistics by Department' },
        { id: 'fin_04', code: 'REP_F_104', title: 'Summary of Sales by Employee' },
        { id: 'fin_05', code: 'REP_F_201', title: 'Tax Summary' },
        { id: 'fin_06', code: 'REP_F_301', title: 'Summary of Discount by Divisions' },
        { id: 'fin_07', code: 'REP_F_401', title: 'Summary of Payment' },
        { id: 'fin_08', code: 'REP_F_601', title: 'Profit by Invoices Summary' },
        { id: 'fin_09', code: 'REP_F_701', title: 'Sales Summary by Day' },
        { id: 'fin_10', code: 'REP_F_801', title: 'Transaction by Date' },
      ],
    },
    {
      id: 'product_sales',
      title: '3. Product Sales',
      icon: '📦',
      reports: [
        { id: 'prod_01', code: 'REP_P_101', title: 'Summary of Sales by Items' },
        { id: 'prod_02', code: 'REP_S_00191', title: 'Sales by Items' },
        { id: 'prod_03', code: 'REP_P_102', title: 'Sales Details for One Sales Item' },
        { id: 'prod_04', code: 'REP_P_103', title: 'Sales by Customer by Items' },
        { id: 'prod_05', code: 'REP_P_105', title: 'Sales by Categories' },
        { id: 'prod_06', code: 'REP_P_106', title: 'Sales by Divisions' },
        { id: 'prod_07', code: 'REP_P_201', title: 'Sales by Category (Comparative by Branch)' },
        { id: 'prod_08', code: 'REP_P_301', title: 'Top N Sold by Quantity' },
        { id: 'prod_09', code: 'REP_P_401', title: 'Summary of Voids' },
        { id: 'prod_10', code: 'REP_P_402', title: 'Summary of Refunds' },
      ],
    },
    {
      id: 'customer_sales',
      title: '4. Customer Sales',
      icon: '👥',
      reports: [
        { id: 'cust_01', code: 'REP_C_101', title: 'Top N Customers by Amount' },
        { id: 'cust_02', code: 'REP_C_201', title: 'Sales by Customer and Detail' },
        { id: 'cust_03', code: 'REP_C_202', title: 'Sales by Zone' },
        { id: 'cust_04', code: 'REP_C_203', title: 'Delivery Sales Summary' },
        { id: 'cust_05', code: 'REP_C_204', title: 'Drivers History' },
      ],
    },
    {
      id: 'todays_and_history',
      title: "5. Today's and History",
      icon: '📅',
      reports: [
        { id: 'td_01', code: 'REP_TH_101', title: "Today's Statistics" },
        { id: 'td_02', code: 'REP_TH_102', title: "Today's Summary of Payment" },
        { id: 'td_03', code: 'REP_TH_103', title: "Today's Summary by Employee" },
        { id: 'td_04', code: 'REP_TH_104', title: "Today's Transactions" },
        { id: 'td_05', code: 'REP_TH_201', title: 'Preview Order Sales' },
      ],
    },
    {
      id: 'time_attendance',
      title: '6. Time and Attendance',
      icon: '⏱️',
      reports: [
        { id: 'ta_01', code: 'REP_TA_001', title: 'Employee Attendance' },
        { id: 'ta_02', code: 'REP_TA_002', title: 'Time and Attendance' },
        { id: 'ta_03', code: 'REP_TA_003', title: 'Labor Cost' },
      ],
    },
    {
      id: 'lists',
      title: '7. Lists',
      icon: '📋',
      reports: [
        { id: 'list_01', code: 'REP_L_001', title: 'Customer List Standard' },
        { id: 'list_02', code: 'REP_L_002', title: 'Not Active Customers' },
        { id: 'list_03', code: 'REP_L_003', title: 'New Customers' },
        { id: 'list_04', code: 'REP_L_004', title: 'Blacklist Customers' },
      ],
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800 text-left select-none">
      
      {/* Top Header Bar */}
      <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between print:hidden">
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
            <span className="font-bold text-[#1a629b] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              [{activeReport.code}] {activeReport.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-slate-500">Southern Olive Oil Products S.A.R.L</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Navigation Tree (93 Reports) */}
        {showCatalog && (
          <div className="w-[280px] h-[calc(100vh-48px)] bg-white border-r border-slate-300 flex flex-col print:hidden">
            <div className="p-2 border-b border-slate-200">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search all 93 reports..."
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-[11px] font-medium focus:border-[#1a629b] focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 text-[11px] custom-scrollbar">
              {reportCategories.map((cat) => (
                <div key={cat.id} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                  <div className="px-2.5 py-1.5 bg-slate-100 font-bold text-slate-800 text-[11px] flex items-center gap-1.5 border-b border-slate-200">
                    <span>{cat.icon}</span> <span>{cat.title}</span>
                  </div>
                  <div className="p-1 space-y-0.5 bg-white">
                    {cat.reports
                      .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.code.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setActiveReport({ ...r, category: cat.title })}
                          className={`w-full text-left px-2 py-1 rounded truncate block transition-all cursor-pointer ${
                            activeReport.code === r.code ? 'bg-[#1a629b] text-white font-bold' : 'hover:bg-slate-100 text-slate-700 font-medium'
                          }`}
                        >
                          <span className="font-mono text-[9px] opacity-60 mr-1">[{r.code}]</span>
                          <span>{r.title}</span>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Viewport: Filter Bar + Perfect A4 Sheet */}
        <div className="flex-1 h-[calc(100vh-48px)] overflow-y-auto p-4 md:p-6 bg-[#f1f5f9] custom-scrollbar">
          
          {/* Universal Dynamic Filter Toolbar */}
          <div className="bg-white p-3 rounded-xl border border-slate-300 mb-5 shadow-2xs print:hidden flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">Period:</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="p-1.5 bg-white border border-slate-300 rounded font-semibold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="THIS_MONTH">This Month (Aug 1 - Aug 31, 2026)</option>
                  <option value="TODAY">Today</option>
                  <option value="YESTERDAY">Yesterday</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">Branch / Location:</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="p-1.5 bg-white border border-slate-300 rounded font-semibold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Operating Branches</option>
                  <option value="Choueifat">Choueifat Main Branch</option>
                  <option value="Beirut">Beirut Branch</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">Cashier / Server:</label>
                <select
                  value={repFilter}
                  onChange={(e) => setRepFilter(e.target.value)}
                  className="p-1.5 bg-white border border-slate-300 rounded font-bold text-[#1a629b] text-xs focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Cashiers / Servers</option>
                  <option value="Hiba Aloulou">Hiba Aloulou</option>
                  <option value="Ahmad Ali Kassem">Ahmad Ali Kassem</option>
                  <option value="Hussein Mahdi">Hussein Mahdi</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#1a629b] hover:bg-[#124b77] text-white font-bold rounded-lg shadow-sm text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>🖨️ Print A4 Document</span>
              </button>
            </div>
          </div>

          {/* ================================================================= */}
          {/* PERFECT OMEGA A4 PAPER (FIXED PROPORTIONS - NO SQUISHED TEXT)     */}
          {/* ================================================================= */}
          <div className="w-[794px] min-h-[1123px] page-break-after-always relative bg-white p-8 text-black font-sans mx-auto border border-slate-200 shadow-md print:border-none print:shadow-none print:m-0 print:p-6 select-none">
            
            {/* Header */}
            <div className="border-b border-black pb-2 mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-sm font-bold text-slate-900 uppercase">
                    Southern Olive Oil Products S.A.R.L
                  </h1>
                  <h2 className="text-base font-bold mt-1 text-slate-900">{activeReport.title}</h2>
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

            {/* FIXED-WIDTH TABLE (table-fixed WITH EXACT WIDTHS) */}
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
                {voidRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 leading-normal align-top">
                    <td className="py-2 px-1 font-mono text-[10px] text-slate-700">{item.date}</td>
                    <td className="py-2 px-1 font-mono text-[10px] text-slate-700">{item.orderDate}</td>
                    <td className="py-2 px-1 font-semibold text-slate-800">{item.server}</td>
                    <td className="py-2 px-1 font-mono font-bold text-center">{item.invoice}</td>
                    
                    {/* WIDE DESCRIPTION: Proper horizontal flow, no letter-breaking */}
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

            {/* CORRECTED FOOTER TOTALS (INTEGER COUNTS) */}
            <div className="border-t-2 border-black mt-4 pt-2 text-[11px] font-mono">
              <div className="flex justify-end space-y-1">
                <div className="w-[320px] space-y-1">
                  <div className="flex justify-between font-bold border-b border-slate-200 pb-0.5">
                    <span>Total Voids:</span>
                    <span>{totalVoidsCount}</span>
                  </div>
                  <div className="flex justify-between font-bold border-b border-slate-200 pb-0.5">
                    <span>Total Qty:</span>
                    <span>{totalQty.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1a629b] text-xs pt-0.5">
                    <span>Total Value:</span>
                    <span>{totalValueLbp.toLocaleString('en-US', { minimumFractionDigits: 2 })} LBP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Footer */}
            <div className="absolute bottom-6 left-8 right-8 border-t border-black pt-2 flex justify-between items-center text-[10px] text-slate-600 font-mono">
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
