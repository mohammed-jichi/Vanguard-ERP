'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function MasterReportViewPage() {
  const [showCatalog, setShowCatalog] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Period & Dynamic Date Logic
  const [periodPreset, setPeriodPreset] = useState<'TODAY' | 'YESTERDAY' | 'THIS_MONTH' | 'LAST_MONTH' | 'DATE_RANGE' | 'EOD_DATE'>('THIS_MONTH');
  const [fromDate, setFromDate] = useState('2026-08-30');
  const [toDate, setToDate] = useState('2026-08-30');
  const [eodDate, setEodDate] = useState('2026-08-31');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [zoomLevel, setZoomLevel] = useState(100);

  // Active Report State
  const [activeReport, setActiveReport] = useState({
    code: 'REP_IC_001',
    title: 'Summary of voids',
    category: 'Internal Control',
  });

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
    'tax_reports',
    'discount_reports',
    'payments',
    'internal_control_fin',
    'profit_summary',
    'comparative',
    'transaction_summary',
    'time_sales_analysis',
    'prod_sales_sub',
    'comparative_by_branch',
    'top_performers_prod',
    'voids_and_refunds_prod',
    'top_performers_cust',
    'cust_delivery',
    'todays_sales_sub',
    'history_sub',
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

  // 100% Verified 93-Report Catalog Hierarchy
  const masterCatalog = [
    {
      id: 'internal_control',
      title: '1. Internal Control',
      icon: '🛡️',
      reports: [
        { code: 'REP_IC_001', title: 'Summary of voids' },
        { code: 'REP_IC_002', title: 'Summary of refunds' },
        { code: 'REP_IC_003', title: 'Duplicate invoices' },
        { code: 'REP_IC_004', title: 'Meter reports' },
        { code: 'REP_IC_005', title: 'No sale' },
        { code: 'REP_IC_006', title: 'Transactions on hold' },
        { code: 'REP_IC_007', title: 'User log report' },
        { code: 'REP_IC_008', title: 'Discount summary' },
      ],
    },
    {
      id: 'financial',
      title: '2. Financial Reports',
      icon: '💵',
      subCategories: [
        {
          id: 'fin_stats',
          title: 'Statistics',
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
            { code: 'REP_F_302', title: 'Discount By Category by Department' },
            { code: 'REP_F_303', title: 'Summary of Discount' },
            { code: 'REP_F_304', title: 'Discount By Description by Employee' },
            { code: 'REP_F_305', title: 'Summary of Discount By Items Amount' },
            { code: 'REP_F_306', title: 'Discount Summary' },
          ],
        },
        {
          id: 'payments',
          title: 'Payments',
          reports: [
            { code: 'REP_F_401', title: 'Summary of Payment' },
            { code: 'REP_F_402', title: 'Summary of Payment by Department' },
            { code: 'REP_F_403', title: 'Summary of payment by workstation' },
            { code: 'REP_F_404', title: 'Summary of Payment by Employee' },
            { code: 'REP_F_405', title: 'Advanced Payment History' },
            { code: 'REP_F_406', title: 'Paid In/Out' },
            { code: 'REP_F_407', title: 'Customer Payments' },
            { code: 'REP_F_408', title: 'List of Layaway Sales' },
            { code: 'REP_F_409', title: 'Layaway History' },
            { code: 'REP_F_410', title: 'List of Pending Invoices with Advance Payment' },
          ],
        },
        {
          id: 'internal_control_fin',
          title: 'Internal Control',
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
            { code: 'REP_F_602', title: 'Profit by item summary' },
            { code: 'REP_F_603', title: 'Profit by category summary' },
            { code: 'REP_F_604', title: 'Profit by category by department' },
            { code: 'REP_F_605', title: 'Profit By Invoices' },
          ],
        },
        {
          id: 'comparative',
          title: 'Comparative',
          reports: [
            { code: 'REP_F_701', title: 'Sales summary by day' },
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
            { code: 'REP_F_801', title: 'Transactions by Date' },
            { code: 'REP_F_802', title: 'Credit Sales' },
            { code: 'REP_F_803', title: 'Credit Card Report' },
            { code: 'REP_F_804', title: 'Electronic Journal' },
          ],
        },
        {
          id: 'time_sales_analysis',
          title: 'Time sales analysis',
          reports: [
            { code: 'REP_F_901', title: 'Timer Report Group by transaction count' },
            { code: 'REP_F_902', title: 'Time report by date' },
            { code: 'REP_F_903', title: 'Time report - Average Check' },
            { code: 'REP_F_904', title: 'Time report By EOD date' },
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
            { code: 'REP_P_101', title: 'Summary of Sales By Items' },
            { code: 'REP_S_00191', title: 'Sales by Items' },
            { code: 'REP_P_102', title: 'Sales details for one sales item' },
            { code: 'REP_P_103', title: 'Sales By Customer By Items' },
            { code: 'REP_P_104', title: 'Daily Sales By Items' },
            { code: 'REP_P_105', title: 'Sales By Categories' },
            { code: 'REP_P_106', title: 'Sales By Divisions' },
            { code: 'REP_P_107', title: 'Sales Items by Transaction' },
            { code: 'REP_P_108', title: 'Not Sold Items' },
            { code: 'REP_P_109', title: 'Sold Serial Numbers' },
          ],
        },
        {
          id: 'comparative_by_branch',
          title: 'Comparative By Branch',
          reports: [
            { code: 'REP_P_201', title: 'Sales By Category' },
            { code: 'REP_P_202', title: 'Sales By Division' },
            { code: 'REP_P_203', title: 'Sales By Groups' },
            { code: 'REP_P_204', title: 'Sales By Items' },
          ],
        },
        {
          id: 'top_performers_prod',
          title: 'Top Performers',
          reports: [
            { code: 'REP_P_301', title: 'Top N sold by Quantity' },
            { code: 'REP_P_302', title: 'Top N sold by Amount' },
          ],
        },
        {
          id: 'voids_and_refunds_prod',
          title: 'Voids & Refunds',
          reports: [
            { code: 'REP_P_401', title: 'Summary of voids' },
            { code: 'REP_P_402', title: 'Summary of refunds' },
            { code: 'REP_P_403', title: 'Details of refunds' },
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
          title: 'Customers & Delivery',
          reports: [
            { code: 'REP_C_201', title: 'Sales by customer In Detail' },
            { code: 'REP_C_202', title: 'Sales by zone' },
            { code: 'REP_C_203', title: 'Delivery Sales Summary' },
            { code: 'REP_C_204', title: 'Drivers History' },
          ],
        },
      ],
    },
    {
      id: 'todays_history',
      title: "5. Today's & History",
      icon: '📅',
      subCategories: [
        {
          id: 'todays_sales_sub',
          title: "Today's Sales",
          reports: [
            { code: 'REP_TH_101', title: "Today's Statistics" },
            { code: 'REP_TH_102', title: "Today's Summary of payment" },
            { code: 'REP_TH_103', title: "Today's summary by Employee" },
            { code: 'REP_TH_104', title: "Today's Transactions" },
          ],
        },
        {
          id: 'history_sub',
          title: 'History',
          reports: [
            { code: 'REP_TH_201', title: 'Preview Older Sales' },
            { code: 'REP_TH_202', title: 'Main Reading History' },
          ],
        },
      ],
    },
    {
      id: 'time_attendance',
      title: '6. Time & Attendance',
      icon: '⏱️',
      reports: [
        { code: 'REP_TA_001', title: 'Employee attendance' },
        { code: 'REP_TA_002', title: 'Time and attendance' },
        { code: 'REP_TA_003', title: 'Labor cost' },
      ],
    },
    {
      id: 'lists',
      title: '7. Lists',
      icon: '📋',
      reports: [
        { code: 'REP_L_001', title: 'Customer list standard' },
        { code: 'REP_L_002', title: 'Not active customers' },
        { code: 'REP_L_003', title: 'New customers' },
        { code: 'REP_L_004', title: 'Blacklist customers' },
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
    { date: '22-Aug-2026 5:31 PM', orderDate: '22-Aug-2026 5:31 PM', server: 'Hiba Aloulou', invoice: '103225', description: 'عرض العطاء جديد - زيت زيتون بكر ممتاز 17.5 لتر', qty: 1.0, valueLbp: 9000000.0, reason: 'تعداد خاطئ' },
    { date: '13-Aug-2026 6:58 PM', orderDate: '13-Aug-2026 6:58 PM', server: 'Hiba Aloulou', invoice: '103125', description: 'ألفية زيت زيتون خضير بلدي 1000 مل', qty: 1.0, valueLbp: 990000.0, reason: 'تعداد خاطئ' },
    { date: '13-Aug-2026 6:58 PM', orderDate: '13-Aug-2026 6:58 PM', server: 'Hiba Aloulou', invoice: '103125', description: 'حبوب اللقاح البلدية 360غ', qty: 1.0, valueLbp: 900000.0, reason: 'تعداد خاطئ' },
  ];

  const genericSalesRows = [
    { ref: 'INV-0891', date: '28-Aug-2026', client: 'Al-Baraka Supermarket', item: '17.5L Olive Oil Tin', qty: 12, totalUsd: 1400.0, rep: 'Ahmad Ali' },
    { ref: 'INV-0892', date: '28-Aug-2026', client: 'Al-Nour Food Est.', item: 'Pomegranate Molasses Box', qty: 24, totalUsd: 890.0, rep: 'Hiba Aloulou' },
    { ref: 'INV-0893', date: '29-Aug-2026', client: 'Al-Kheir Olive Center', item: 'Extra Virgin Glass 1L', qty: 50, totalUsd: 3000.0, rep: 'Hussein Mahdi' },
  ];

  const getSelectedPeriodDisplay = () => {
    switch (periodPreset) {
      case 'TODAY': return '31-Aug-2026 (Today)';
      case 'YESTERDAY': return '30-Aug-2026 (Yesterday)';
      case 'THIS_MONTH': return 'August 2026 (01-Aug-2026 to 31-Aug-2026)';
      case 'LAST_MONTH': return 'July 2026 (01-Jul-2026 to 31-Jul-2026)';
      case 'DATE_RANGE': return `${fromDate} to ${toDate}`;
      case 'EOD_DATE': return `EOD Date: ${eodDate}`;
      default: return 'August 2026';
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-80px)] select-none text-left font-sans">
      
      {/* =================================================================== */}
      {/* 1. TOP SUB-HEADER BAR (HIDDEN ON PRINT)                             */}
      {/* =================================================================== */}
      <div className="h-11 bg-white border-b border-slate-200 px-4 flex items-center justify-between print:hidden shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCatalog(!showCatalog)}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <span>{showCatalog ? '◀ Hide Catalog' : '▶ Show Report Categories'}</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Active Report:</span>
            <span className="font-bold text-[#1e3a2b] bg-[#eef3ee] px-2.5 py-0.5 rounded border border-[#1e3a2b]/30">
              [{activeReport.code}] {activeReport.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono hidden md:inline">Southern Olive Oil Products S.A.R.L</span>
          <button
            type="button"
            onClick={() => alert('Report view closed')}
            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 text-xs font-medium"
          >
            Close Report
          </button>
          <Link
            href="/backoffice/dashboard"
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors flex items-center gap-1"
          >
            <span>🔄 Return to Hub</span>
          </Link>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. AUTHENTIC OMEGA REPORTING RIBBON (HIDDEN ON PRINT)               */}
      {/* =================================================================== */}
      <div className="bg-white border-b border-slate-200 p-2.5 px-4 flex flex-wrap items-center justify-between gap-2.5 print:hidden shrink-0 shadow-2xs">
        
        {/* Left Inputs: Period Dropdown + Conditional Dynamic Date Area + Branches */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          <select
            value={periodPreset}
            onChange={(e) => setPeriodPreset(e.target.value as any)}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs text-slate-800 focus:outline-none"
          >
            <option value="TODAY">Today</option>
            <option value="YESTERDAY">Yesterday</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_MONTH">Last Month</option>
            <option value="DATE_RANGE">Date Range</option>
            <option value="EOD_DATE">EOD Date</option>
          </select>

          {/* Conditional Date Display */}
          {periodPreset === 'TODAY' && (
            <input
              type="text"
              readOnly
              disabled
              value="31-Aug-2026"
              className="px-2.5 py-1.5 bg-slate-100 border border-slate-300 rounded text-xs font-mono text-slate-600 cursor-not-allowed w-28 text-center"
            />
          )}

          {periodPreset === 'YESTERDAY' && (
            <input
              type="text"
              readOnly
              disabled
              value="30-Aug-2026"
              className="px-2.5 py-1.5 bg-slate-100 border border-slate-300 rounded text-xs font-mono text-slate-600 cursor-not-allowed w-28 text-center"
            />
          )}

          {periodPreset === 'THIS_MONTH' && (
            <input
              type="text"
              readOnly
              disabled
              value="August 2026"
              className="px-2.5 py-1.5 bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-700 cursor-not-allowed w-28 text-center"
            />
          )}

          {periodPreset === 'LAST_MONTH' && (
            <input
              type="text"
              readOnly
              disabled
              value="July 2026"
              className="px-2.5 py-1.5 bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-700 cursor-not-allowed w-28 text-center"
            />
          )}

          {periodPreset === 'DATE_RANGE' && (
            <div className="flex items-center gap-1.5 bg-slate-50 p-0.5 rounded border border-slate-300">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono text-slate-800"
              />
              <span className="text-slate-400 text-xs font-bold">➔</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono text-slate-800"
              />
            </div>
          )}

          {periodPreset === 'EOD_DATE' && (
            <select
              value={eodDate}
              onChange={(e) => setEodDate(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono text-xs text-slate-800 focus:outline-none"
            >
              <option value="2026-08-31">31-Aug-2026 (Closeout)</option>
              <option value="2026-08-30">30-Aug-2026 (Closeout)</option>
              <option value="2026-08-15">15-Aug-2026 (Mid-Month Closeout)</option>
              <option value="2026-08-01">01-Aug-2026 (Start-Month Closeout)</option>
              <option value="2026-07-31">31-Jul-2026 (Month Closeout)</option>
              <option value="2025-12-10">10-Dec-2025 (Initial Rollout)</option>
            </select>
          )}

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Branches</option>
            <option value="BRANCH_1">Branch 1 (Choueifat Main Facility)</option>
            <option value="BRANCH_2">Branch 2 (Beirut Branch)</option>
            <option value="BRANCH_3">Branch 3</option>
            <option value="BRANCH_4">Branch 4</option>
          </select>

          <button
            type="button"
            onClick={() => alert('Filter applied')}
            className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded text-xs transition-colors shadow-2xs"
          >
            Filter
          </button>
          
          <button
            type="button"
            onClick={() => {
              setPeriodPreset('THIS_MONTH');
              setBranchFilter('ALL');
            }}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Right Tools: Zoom + Print + Export + Settings */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoomLevel(Math.max(75, zoomLevel - 10))}
            className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold"
            title="Zoom Out"
          >
            🔍−
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
            className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold"
            title="Zoom In"
          >
            🔍+
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>🖨️ Print</span>
          </button>

          <button
            type="button"
            onClick={() => alert('Exporting to Excel...')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-xs border border-slate-300 flex items-center gap-1"
          >
            <span>📥 Export ▾</span>
          </button>

          <button
            type="button"
            className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
            title="Report Settings"
          >
            ⚙️
          </button>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 3. WORKSPACE: 93-REPORTS TREE + PROPORTIONAL A4 PAPER               */}
      {/* =================================================================== */}
      <div className="flex-1 flex overflow-hidden p-4 bg-[#f3f5f8] print:p-0 print:m-0 print:bg-white print:overflow-visible">
        
        {/* Left 93-Reports Tree Sidebar (Strictly hidden on print) */}
        {showCatalog && (
          <aside className="w-[300px] bg-[#eef3ee] border-r border-slate-300 print:hidden overflow-y-auto p-2.5 space-y-2 shrink-0 mr-4 shadow-2xs custom-scrollbar rounded-xl">
            
            {/* Search Box */}
            <div className="bg-white p-1 rounded-lg border border-slate-300 shadow-2xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search all reports..."
                className="w-full px-2.5 py-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Complete 7-Categories Hierarchy */}
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
                          <span>📁 {sub.title}</span>
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

        {/* Right Canvas: Isolated A4 Paper Container */}
        <main className="flex-1 overflow-y-auto custom-scrollbar flex justify-center print:overflow-visible print:p-0 print:m-0">
          
          <div
            id="printable-a4-report"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-[794px] min-h-[1123px] page-break-after-always relative bg-white p-8 text-black font-sans border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 print:p-6 print:transform-none transition-transform duration-200 select-none"
          >
            {/* Header */}
            <div className="border-b-2 border-black pb-2 mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-sm font-bold text-slate-900 uppercase">Southern Olive Oil Products S.A.R.L</h1>
                  <h2 className="text-base font-bold mt-0.5 text-slate-900">{activeReport.title}</h2>
                </div>
                <div className="text-right text-[10.5px] font-mono text-slate-700 space-y-0.5">
                  <div>Prepared By: Mohammed</div>
                  <div>Report Code: {activeReport.code}</div>
                  <div>Page 1 of 1</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10.5px] font-mono mt-2 pt-1 border-t border-slate-300 text-slate-700">
                <div>Period: {getSelectedPeriodDisplay()}</div>
                <div>Branch: {branchFilter === 'ALL' ? 'Southern Olive Oil Products S.A.R.L (All)' : branchFilter}</div>
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
                        <td className="py-2 px-1 font-mono text-[10px] text-slate-700">{item.orderDate}</td>
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
                      <span>Total Voids:</span> <span>3 events</span>
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

            {/* Footer */}
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
