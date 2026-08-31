'use client';

import React, { useState } from 'react';

export default function MasterReportViewPage() {
  const [showCatalog, setShowCatalog] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [period, setPeriod] = useState('THIS_MONTH');
  const [branch, setBranch] = useState('ALL');

  // Accordion State
  const [expandedCats, setExpandedCats] = useState<string[]>([
    'internal_control',
    'financial',
    'product_sales',
    'customer_sales',
    'todays_history',
    'time_attendance',
    'lists',
  ]);
  const [expandedSubCats, setExpandedSubCats] = useState<string[]>([
    'fin_stats',
    'prod_sales_sub',
    'cust_delivery',
    'todays_sales_sub',
  ]);

  const toggleCat = (id: string) => {
    setExpandedCats((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );
  };

  const toggleSubCat = (id: string) => {
    setExpandedSubCats((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );
  };

  // Active Report State
  const [activeReport, setActiveReport] = useState({
    code: 'REP_IC_001',
    title: 'Summary of Voids',
    category: 'Internal Control',
  });

  // Complete 93-Reports Master Catalog
  const masterCatalog = [
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
        { code: 'REP_IC_007', title: 'User Log Report' },
        { code: 'REP_IC_008', title: 'Discount Summary' },
      ],
    },
    {
      id: 'financial',
      title: '2. Financial Reports',
      icon: '💵',
      subCategories: [
        {
          id: 'fin_stats',
          title: 'Financial Statistics',
          reports: [
            { code: 'REP_F_101', title: 'Sales Summary' },
            { code: 'REP_F_102', title: 'Statistics by Workstation' },
            { code: 'REP_F_103', title: 'Statistics by Department' },
            { code: 'REP_F_104', title: 'Summary of Sales by Employee' },
            { code: 'REP_F_105', title: 'Sales by Employee by Category' },
            { code: 'REP_F_106', title: 'Sales by Supplier' },
            { code: 'REP_F_107', title: 'Delivery Orders by Date and Branch' },
          ],
        },
        {
          id: 'tax_reports',
          title: 'Tax Reports',
          reports: [
            { code: 'REP_F_201', title: 'Tax Summary' },
            { code: 'REP_F_202', title: 'Tax Summary Comparative' },
          ],
        },
        {
          id: 'discount_reports',
          title: 'Discount Reports',
          reports: [
            { code: 'REP_F_301', title: 'Summary of Discount by Divisions' },
            { code: 'REP_F_302', title: 'Discount by Category by Department' },
            { code: 'REP_F_303', title: 'Summary of Discount' },
            { code: 'REP_F_304', title: 'Discount by Description by Employee' },
            { code: 'REP_F_305', title: 'Summary of Discount by Items Amount' },
            { code: 'REP_F_306', title: 'Discount Summary' },
          ],
        },
        {
          id: 'payments',
          title: 'Payments',
          reports: [
            { code: 'REP_F_401', title: 'Summary of Payment' },
            { code: 'REP_F_402', title: 'Summary of Payment by Department' },
            { code: 'REP_F_403', title: 'Summary of Payment by Workstation' },
            { code: 'REP_F_404', title: 'Summary of Payment by Employee' },
            { code: 'REP_F_405', title: 'Advanced Payment History' },
            { code: 'REP_F_406', title: 'Unpaid/Paid In/Paid Out' },
            { code: 'REP_F_407', title: 'Customer Payments' },
            { code: 'REP_F_408', title: 'List of Layaway Sales' },
            { code: 'REP_F_409', title: 'Layaway History' },
            { code: 'REP_F_410', title: 'List of Pending Invoices with Advanced Payment' },
          ],
        },
        {
          id: 'fin_internal_ctrl',
          title: 'Internal Control (Financial)',
          reports: [
            { code: 'REP_F_501', title: 'Meter Report' },
            { code: 'REP_F_502', title: 'No Sale' },
            { code: 'REP_F_503', title: 'Transactions on Hold' },
            { code: 'REP_F_504', title: 'User Log Report' },
          ],
        },
        {
          id: 'profit_summary',
          title: 'Profit Summary',
          reports: [
            { code: 'REP_F_601', title: 'Profit by Invoices Summary' },
            { code: 'REP_F_602', title: 'Profit by Item Summary' },
            { code: 'REP_F_603', title: 'Profit by Category Summary' },
            { code: 'REP_F_604', title: 'Profit by Category by Department' },
            { code: 'REP_F_605', title: 'Profit by Invoices' },
          ],
        },
        {
          id: 'comparative',
          title: 'Comparative Reports',
          reports: [
            { code: 'REP_F_701', title: 'Sales Summary by Day' },
            { code: 'REP_F_702', title: 'Daily Sales' },
            { code: 'REP_F_703', title: 'Comparative Yearly Sales' },
            { code: 'REP_F_704', title: 'Comparative Monthly Sales' },
            { code: 'REP_F_705', title: 'Comparative Monthly Sales by Employee' },
          ],
        },
        {
          id: 'transaction_summary',
          title: 'Transaction Summary',
          reports: [
            { code: 'REP_F_801', title: 'Transaction by Date' },
            { code: 'REP_F_802', title: 'Credit Sales' },
            { code: 'REP_F_803', title: 'Credit Card Report' },
            { code: 'REP_F_804', title: 'Electronic Journal' },
          ],
        },
        {
          id: 'time_sales_analysis',
          title: 'Time Sales Analysis',
          reports: [
            { code: 'REP_F_901', title: 'Time Report Group by Transactions Count' },
            { code: 'REP_F_902', title: 'Time Report by Date' },
            { code: 'REP_F_903', title: 'Time Report - Average Check' },
            { code: 'REP_F_904', title: 'Time Report by EOD Date' },
            { code: 'REP_F_905', title: 'Transaction Report by Time' },
          ],
        },
      ],
    },
    {
      id: 'product_sales',
      title: '3. Product Sales',
      icon: '📦',
      subCategories: [
        {
          id: 'prod_sales_sub',
          title: 'Product Sales',
          reports: [
            { code: 'REP_P_101', title: 'Summary of Sales by Items' },
            { code: 'REP_S_00191', title: 'Sales by Items' },
            { code: 'REP_S_00192', title: 'Sales by Invoices' },
            { code: 'REP_P_102', title: 'Sales Details for One Sales Item' },
            { code: 'REP_P_103', title: 'Sales by Customer by Items' },
            { code: 'REP_P_104', title: 'Daily Sales by Items' },
            { code: 'REP_P_105', title: 'Sales by Categories' },
            { code: 'REP_P_106', title: 'Sales by Divisions' },
            { code: 'REP_P_107', title: 'Sales Items by Transaction' },
            { code: 'REP_P_108', title: 'Not Sold Items' },
            { code: 'REP_P_109', title: 'Sold Serial Number' },
          ],
        },
        {
          id: 'comparative_by_branch',
          title: 'Comparative by Branch',
          reports: [
            { code: 'REP_P_201', title: 'Sales by Category' },
            { code: 'REP_P_202', title: 'Sales by Division' },
            { code: 'REP_P_203', title: 'Sales by Groups' },
            { code: 'REP_P_204', title: 'Sales by Items' },
          ],
        },
        {
          id: 'top_performers_prod',
          title: 'Top Performers',
          reports: [
            { code: 'REP_P_301', title: 'Top N Sold by Quantity' },
            { code: 'REP_P_302', title: 'Top N Sold by Amount' },
          ],
        },
        {
          id: 'voids_and_refunds_prod',
          title: 'Voids and Refunds',
          reports: [
            { code: 'REP_P_401', title: 'Summary of Voids' },
            { code: 'REP_P_402', title: 'Summary of Refunds' },
            { code: 'REP_P_403', title: 'Details of Refunds' },
          ],
        },
      ],
    },
    {
      id: 'customer_sales',
      title: '4. Customer Sales',
      icon: '👥',
      subCategories: [
        {
          id: 'top_performers_cust',
          title: 'Top Performers',
          reports: [{ code: 'REP_C_101', title: 'Top N Customers by Amount' }],
        },
        {
          id: 'cust_delivery',
          title: 'Customers and Delivery',
          reports: [
            { code: 'REP_C_201', title: 'Sales by Customer and Detail' },
            { code: 'REP_C_202', title: 'Sales by Zone' },
            { code: 'REP_C_203', title: 'Delivery Sales Summary' },
            { code: 'REP_C_204', title: 'Drivers History' },
          ],
        },
      ],
    },
    {
      id: 'todays_history',
      title: "5. Today's and History",
      icon: '📅',
      subCategories: [
        {
          id: 'todays_sales_sub',
          title: "Today's Sales",
          reports: [
            { code: 'REP_TH_101', title: "Today's Statistics" },
            { code: 'REP_TH_102', title: "Today's Summary of Payment" },
            { code: 'REP_TH_103', title: "Today's Summary by Employee" },
            { code: 'REP_TH_104', title: "Today's Transactions" },
          ],
        },
        {
          id: 'history_sub',
          title: 'History',
          reports: [
            { code: 'REP_TH_201', title: 'Preview Order Sales' },
            { code: 'REP_TH_202', title: 'Main Reading History' },
          ],
        },
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

  // Specific Datasets
  const customerListRows = [
    { code: 'CUST-01', name: 'Al-Baraka Supermarket S.A.R.L', region: 'Mount Lebanon', city: 'Choueifat Main Highway', phone: '03112233', rep: 'Ahmad Ali Kassem', creditLimit: 5000.0, balance: 1400.0 },
    { code: 'CUST-02', name: 'Al-Nour Food Establishment', region: 'Beirut', city: 'Hamra (Makdessi Street)', phone: '01778899', rep: 'Hiba Aloulou', creditLimit: 3500.0, balance: 890.0 },
    { code: 'CUST-03', name: 'Al-Kheir Olive Center', region: 'South Lebanon', city: 'Saida (Riad El Solh)', phone: '07722334', rep: 'Hussein Mahdi', creditLimit: 7000.0, balance: 3000.0 },
    { code: 'CUST-04', name: 'Byblos Green Grocers', region: 'Mount Lebanon', city: 'Jbeil Main Road', phone: '09540112', rep: 'Ahmad Ali Kassem', creditLimit: 4000.0, balance: 1700.0 },
    { code: 'CUST-05', name: 'Bekaa Traditional Trading', region: 'Bekaa', city: 'Zahle Boulevard', phone: '08812345', rep: 'Hussein Mahdi', creditLimit: 6500.0, balance: 0.0 },
  ];

  const voidRows = [
    { date: '22-Aug-2026 5:31 PM', server: 'Hiba Aloulou', invoice: '103225', description: 'عرض العطاء جديد - زيت زيتون بكر ممتاز 17.5 لتر', qty: 1.0, valueLbp: 9000000.0, reason: 'تعداد خاطئ' },
    { date: '13-Aug-2026 6:58 PM', server: 'Hiba Aloulou', invoice: '103125', description: 'ألفية زيت زيتون خضير بلدي 1000 مل', qty: 1.0, valueLbp: 990000.0, reason: 'تعداد خاطئ' },
    { date: '13-Aug-2026 6:58 PM', server: 'Hiba Aloulou', invoice: '103125', description: 'حبوب اللقاح البلدية 360غ', qty: 1.0, valueLbp: 900000.0, reason: 'تعداد خاطئ' },
  ];

  const genericSalesRows = [
    { ref: 'INV-0891', date: '28-Aug-2026', client: 'Al-Baraka Supermarket', item: '17.5L Olive Oil Tin', qty: 12, totalUsd: 1400.0, rep: 'Ahmad Ali' },
    { ref: 'INV-0892', date: '28-Aug-2026', client: 'Al-Nour Food Est.', item: 'Pomegranate Molasses Box', qty: 24, totalUsd: 890.0, rep: 'Hiba Aloulou' },
    { ref: 'INV-0893', date: '29-Aug-2026', client: 'Al-Kheir Olive Center', item: 'Extra Virgin Glass 1L', qty: 50, totalUsd: 3000.0, rep: 'Hussein Mahdi' },
  ];

  return (
    <div className="w-full flex overflow-hidden h-[calc(100vh-80px)] select-none">
      
      {/* 1. Left 93-Reports Tree Sidebar (HIGH CONTRAST & DISTINCT CARDS) */}
      {showCatalog && (
        <aside className="w-[300px] bg-[#eef3ee] border-r border-slate-300 print:hidden overflow-y-auto p-2.5 space-y-2 shrink-0 mr-4 shadow-sm custom-scrollbar rounded-xl">
          
          {/* Search Box */}
          <div className="bg-white p-1 rounded-lg border border-slate-300 shadow-2xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search all 93 reports..."
              className="w-full px-2.5 py-1.5 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Tree Categories */}
          {masterCatalog.map((cat) => (
            <div key={cat.id} className="border border-slate-300/80 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div
                onClick={() => toggleCat(cat.id)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200/80 cursor-pointer font-bold text-slate-900 text-[11px] flex items-center justify-between border-b border-slate-200 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <span>{cat.icon}</span> <span>{cat.title}</span>
                </span>
                <span className="text-[9px] text-[#1e3a2b] font-bold">{expandedCats.includes(cat.id) ? '▲' : '▼'}</span>
              </div>

              {expandedCats.includes(cat.id) && (
                <div className="p-1 space-y-1 bg-white">
                  
                  {/* Direct Reports */}
                  {cat.reports && cat.reports
                    .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.code.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((r) => (
                      <button
                        key={r.code}
                        type="button"
                        onClick={() => setActiveReport({ ...r, category: cat.title })}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg truncate block text-xs transition-all ${
                          activeReport.code === r.code
                            ? 'bg-[#1e3a2b] text-white font-bold shadow-xs'
                            : 'hover:bg-slate-100 text-slate-700 font-medium'
                        }`}
                      >
                        <span className="font-mono text-[9.5px] opacity-75 mr-1">[{r.code}]</span>
                        <span>{r.title}</span>
                      </button>
                    ))}

                  {/* Sub-Categories */}
                  {cat.subCategories && cat.subCategories.map((sub) => (
                    <div key={sub.id} className="border border-slate-200 rounded-lg bg-slate-50/60">
                      <div
                        onClick={() => toggleSubCat(sub.id)}
                        className="px-2.5 py-1 font-bold text-slate-800 hover:text-[#1e3a2b] cursor-pointer flex items-center justify-between text-[10.5px]"
                      >
                        <span>📁 {sub.title} ({sub.reports.length})</span>
                        <span className="text-[8px] text-[#1e3a2b] font-bold">{expandedSubCats.includes(sub.id) ? '−' : '+'}</span>
                      </div>

                      {expandedSubCats.includes(sub.id) && (
                        <div className="pl-2 pr-1 py-0.5 space-y-0.5 border-t border-slate-200/80 bg-white">
                          {sub.reports
                            .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.code.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((r) => (
                              <button
                                key={r.code}
                                type="button"
                                onClick={() => setActiveReport({ ...r, category: `${cat.title} - ${sub.title}` })}
                                className={`w-full text-left px-2 py-1 rounded truncate block text-xs transition-all ${
                                  activeReport.code === r.code
                                    ? 'bg-[#1e3a2b] text-white font-bold shadow-xs'
                                    : 'hover:bg-slate-100 text-slate-700 font-medium'
                                }`}
                              >
                                <span className="font-mono text-[9.5px] opacity-75 mr-1">[{r.code}]</span>
                                <span>{r.title}</span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}

                </div>
              )}
            </div>
          ))}
        </aside>
      )}

      {/* 2. Right Canvas: Controls Toolbar + A4 Paper (HIGH DEFINITION & ZERO BLUE) */}
      <div className="flex-1 overflow-y-auto">
        
        {/* Controls Toolbar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-300 mb-4 flex items-center justify-between text-xs print:hidden shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowCatalog(!showCatalog)}
              className="px-3.5 py-1.5 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-800 hover:bg-slate-200 transition-colors"
            >
              {showCatalog ? '◀ Hide Catalog' : '▶ Show Catalog'}
            </button>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-xs focus:outline-none">
              <option value="THIS_MONTH">This Month (August 2026)</option>
              <option value="TODAY">Today</option>
            </select>
            <select value={branch} onChange={(e) => setBranch(e.target.value)} className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-xs focus:outline-none">
              <option value="ALL">All Operating Branches</option>
              <option value="Choueifat">Choueifat Main Facility</option>
              <option value="Beirut">Beirut Branch</option>
            </select>
          </div>

          {/* High-Contrast Olive Print Button (Zero Blue) */}
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 border border-[#1e3a2b]"
          >
            <span>🖨️ Print A4 Report</span>
          </button>
        </div>

        {/* High-Contrast A4 Paper Container */}
        <div className="w-[794px] min-h-[1123px] page-break-after-always relative bg-white p-8 text-black font-sans mx-auto border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 print:p-6 select-none">
          
          {/* Header */}
          <div className="border-b-2 border-black pb-2 mb-2">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-sm font-bold text-slate-900 uppercase">Southern Olive Oil Products S.A.R.L</h1>
                <h2 className="text-base font-bold mt-0.5 text-slate-900">{activeReport.title}</h2>
              </div>
              <div className="text-right text-[10.5px] font-mono text-slate-700 space-y-0.5">
                <div>Prepared By: Mohammed</div>
                <div>Code: {activeReport.code}</div>
                <div>Page 1 of 1</div>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10.5px] font-mono mt-2 pt-1 border-t border-slate-300 text-slate-700">
              <div>Period: 01-Aug-2026 to 31-Aug-2026</div>
              <div>Branch: Southern Olive Oil Products S.A.R.L</div>
            </div>
          </div>

          {/* VIEW A: LISTS / CUSTOMERS */}
          {(activeReport.code.startsWith('REP_L_') || activeReport.category.includes('Lists')) && (
            <div>
              <table className="w-full table-fixed text-left border-collapse text-[11px] mt-3">
                <thead>
                  <tr className="border-b border-black bg-slate-100 font-bold text-black leading-tight">
                    <th className="py-1 px-1 normal-case w-[12%]">code</th>
                    <th className="py-1 px-1 normal-case w-[28%]">customer / store name</th>
                    <th className="py-1 px-1 normal-case w-[14%]">region</th>
                    <th className="py-1 px-1 normal-case w-[16%]">phone</th>
                    <th className="py-1 px-1 normal-case w-[15%]">assigned rep</th>
                    <th className="py-1 px-1 normal-case w-[15%] text-right">balance ($)</th>
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
                      <td className="py-1.5 px-1 text-right font-mono font-bold text-[#1e3a2b]">
                        ${cust.balance.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t-2 border-black mt-4 pt-2 text-[11px] font-mono flex justify-between items-center font-bold">
                <span>Total Customers: {customerListRows.length} Active Partners</span>
                <span>Total Balance: ${customerListRows.reduce((s, c) => s + c.balance, 0).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* VIEW B: VOIDS & INTERNAL CONTROL */}
          {activeReport.code === 'REP_IC_001' && (
            <div>
              <table className="w-full table-fixed text-left border-collapse text-[11px] mt-3">
                <thead>
                  <tr className="border-b border-black bg-slate-100 font-bold text-black leading-tight">
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
                  {voidRows.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 leading-normal align-top">
                      <td className="py-2 px-1 font-mono text-[10px] text-slate-700">{item.date}</td>
                      <td className="py-2 px-1 font-mono text-[10px] text-slate-700">{item.date}</td>
                      <td className="py-2 px-1 font-semibold text-slate-800">{item.server}</td>
                      <td className="py-2 px-1 font-mono font-bold text-center">{item.invoice}</td>
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

              <div className="border-t-2 border-black mt-4 pt-2 text-[11px] font-mono flex justify-end">
                <div className="w-[300px] space-y-1">
                  <div className="flex justify-between font-bold border-b border-slate-200 pb-0.5">
                    <span>Total Voids:</span> <span>3</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1e3a2b]">
                    <span>Total Value:</span> <span>10,890,000.00 LBP</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW C: SALES & OTHER MATRIX */}
          {!activeReport.code.startsWith('REP_L_') && activeReport.code !== 'REP_IC_001' && (
            <div>
              <table className="w-full table-fixed text-left border-collapse text-[11px] mt-3">
                <thead>
                  <tr className="border-b border-black bg-slate-100 font-bold text-black leading-tight">
                    <th className="py-1 px-1 normal-case w-[14%]">ref #</th>
                    <th className="py-1 px-1 normal-case w-[14%]">date</th>
                    <th className="py-1 px-1 normal-case w-[24%]">client / account</th>
                    <th className="py-1 px-1 normal-case w-[26%]">item details</th>
                    <th className="py-1 px-1 normal-case w-[8%] text-center">qty</th>
                    <th className="py-1 px-1 normal-case w-[14%] text-right">total ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {genericSalesRows.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 leading-normal">
                      <td className="py-1.5 px-1 font-mono font-bold">{s.ref}</td>
                      <td className="py-1.5 px-1 font-mono text-[10px]">{s.date}</td>
                      <td className="py-1.5 px-1 font-bold text-slate-900">{s.client}</td>
                      <td className="py-1.5 px-1 text-slate-800">{s.item}</td>
                      <td className="py-1.5 px-1 text-center font-mono">{s.qty}</td>
                      <td className="py-1.5 px-1 text-right font-mono font-bold text-[#1e3a2b]">${s.totalUsd.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t-2 border-black mt-4 pt-2 text-[11px] font-mono flex justify-between items-center font-bold">
                <span>Category: {activeReport.category}</span>
                <span>Total Revenue: ${genericSalesRows.reduce((s, r) => s + r.totalUsd, 0).toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="absolute bottom-6 left-8 right-8 border-t border-black pt-2 flex justify-between items-center text-[10px] text-slate-600 font-mono">
            <span>Printed from Vanguard ERP System</span>
            <span>Southern Olive Oil Products S.A.R.L - Confidential</span>
            <span>Page 1 of 1</span>
          </div>
        </div>

      </div>

    </div>
  );
}
