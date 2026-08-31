'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function MasterReportViewPage() {
  const [showCatalog, setShowCatalog] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Universal Ribbon Controls
  const [periodPreset, setPeriodPreset] = useState('THIS_MONTH');
  const [dateRangeText, setDateRangeText] = useState('Aug 1 - Aug 31, 2026');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [zoomLevel, setZoomLevel] = useState(100);

  // Dynamic Context-Specific Filter States
  const [serverFilter, setServerFilter] = useState('ALL');
  const [voidReasonFilter, setVoidReasonFilter] = useState('ALL');
  
  // Product Sales Cascading States
  const [divisionFilter, setDivisionFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Customer & Delivery States
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [customerTierFilter, setCustomerTierFilter] = useState('ALL');

  // Financial & Payment States
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('ALL');

  // Checkbox Toggles
  const [showAuthManager, setShowAuthManager] = useState(true);
  const [showProfitMargins, setShowProfitMargins] = useState(false);
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(true);
  const [includeZeroBalances, setIncludeZeroBalances] = useState(false);

  // Active Report State (Default: Summary of Voids)
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

  // ==========================================================================
  // COMPLETE 100% EXHAUSTIVE 93-REPORT TREE (ALL 8 MAIN & 17 SUB-CATEGORIES)
  // ==========================================================================
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
          title: 'Financial Statistics (7)',
          reports: [
            { code: 'REP_F_101', title: 'Sales summary' },
            { code: 'REP_F_102', title: 'Statistics by workstation' },
            { code: 'REP_F_103', title: 'Statistics by department' },
            { code: 'REP_F_104', title: 'Summary of sales by employee' },
            { code: 'REP_F_105', title: 'Sales by employee by category' },
            { code: 'REP_F_106', title: 'Sales by supplier' },
            { code: 'REP_F_107', title: 'Delivery orders by date and branch' },
          ],
        },
        {
          id: 'tax_reports',
          title: 'Tax Reports (2)',
          reports: [
            { code: 'REP_F_201', title: 'Tax summary' },
            { code: 'REP_F_202', title: 'Tax summary comparative' },
          ],
        },
        {
          id: 'discount_reports',
          title: 'Discount Reports (6)',
          reports: [
            { code: 'REP_F_301', title: 'Summary of discount by divisions' },
            { code: 'REP_F_302', title: 'Discount by category by department' },
            { code: 'REP_F_303', title: 'Summary of discount' },
            { code: 'REP_F_304', title: 'Discount by description by employee' },
            { code: 'REP_F_305', title: 'Summary of discount by items amount' },
            { code: 'REP_F_306', title: 'Discount summary' },
          ],
        },
        {
          id: 'payments',
          title: 'Payments (10)',
          reports: [
            { code: 'REP_F_401', title: 'Summary of payment' },
            { code: 'REP_F_402', title: 'Summary of payment by department' },
            { code: 'REP_F_403', title: 'Summary of payment by workstation' },
            { code: 'REP_F_404', title: 'Summary of payment by employee' },
            { code: 'REP_F_405', title: 'Advanced payment history' },
            { code: 'REP_F_406', title: 'Unpaid/Paid In/Paid Out' },
            { code: 'REP_F_407', title: 'Customer payments' },
            { code: 'REP_F_408', title: 'List of layaway sales' },
            { code: 'REP_F_409', title: 'Layaway history' },
            { code: 'REP_F_410', title: 'List of pending invoices with advanced payment' },
          ],
        },
        {
          id: 'internal_control_fin',
          title: 'Internal Control (Financial) (4)',
          reports: [
            { code: 'REP_F_501', title: 'Summary of voids' },
            { code: 'REP_F_502', title: 'Summary of refunds' },
            { code: 'REP_F_503', title: 'Duplicate invoices' },
            { code: 'REP_F_504', title: 'Meter reports' },
          ],
        },
        {
          id: 'profit_summary',
          title: 'Profit Summary (5)',
          reports: [
            { code: 'REP_F_601', title: 'Profit by invoices summary' },
            { code: 'REP_F_602', title: 'Profit by item summary' },
            { code: 'REP_F_603', title: 'Profit by category summary' },
            { code: 'REP_F_604', title: 'Profit by category by department' },
            { code: 'REP_F_605', title: 'Profit by invoices' },
          ],
        },
        {
          id: 'comparative',
          title: 'Comparative Reports (5)',
          reports: [
            { code: 'REP_F_701', title: 'Sales summary by day' },
            { code: 'REP_F_702', title: 'Daily sales' },
            { code: 'REP_F_703', title: 'Comparative yearly sales' },
            { code: 'REP_F_704', title: 'Comparative monthly sales' },
            { code: 'REP_F_705', title: 'Comparative monthly sales by employee' },
          ],
        },
        {
          id: 'transaction_summary',
          title: 'Transaction Summary (4)',
          reports: [
            { code: 'REP_F_801', title: 'Transaction by date' },
            { code: 'REP_F_802', title: 'Credit sales' },
            { code: 'REP_F_803', title: 'Credit card report' },
            { code: 'REP_F_804', title: 'Electronic journal' },
          ],
        },
        {
          id: 'time_sales_analysis',
          title: 'Time Sales Analysis (5)',
          reports: [
            { code: 'REP_F_901', title: 'Time report group by transactions count' },
            { code: 'REP_F_902', title: 'Time report by date' },
            { code: 'REP_F_903', title: 'Time report - average check' },
            { code: 'REP_F_904', title: 'Time report by EOD date' },
            { code: 'REP_F_905', title: 'Transaction report by time' },
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
          title: 'Product Sales (11)',
          reports: [
            { code: 'REP_P_101', title: 'Summary of sales by items' },
            { code: 'REP_S_00191', title: 'Sales by items' },
            { code: 'REP_S_00192', title: 'Sales by invoices' },
            { code: 'REP_P_102', title: 'Sales details for one sales item' },
            { code: 'REP_P_103', title: 'Sales by customer by items' },
            { code: 'REP_P_104', title: 'Daily sales by items' },
            { code: 'REP_P_105', title: 'Sales by categories' },
            { code: 'REP_P_106', title: 'Sales by divisions' },
            { code: 'REP_P_107', title: 'Sales items by transaction' },
            { code: 'REP_P_108', title: 'Not sold items' },
            { code: 'REP_P_109', title: 'Sold serial number' },
          ],
        },
        {
          id: 'comparative_by_branch',
          title: 'Comparative by Branch (4)',
          reports: [
            { code: 'REP_P_201', title: 'Sales by category' },
            { code: 'REP_P_202', title: 'Sales by division' },
            { code: 'REP_P_203', title: 'Sales by groups' },
            { code: 'REP_P_204', title: 'Sales by items' },
          ],
        },
        {
          id: 'top_performers_prod',
          title: 'Top Performers (2)',
          reports: [
            { code: 'REP_P_301', title: 'Top N sold by quantity' },
            { code: 'REP_P_302', title: 'Top N sold by amount' },
          ],
        },
        {
          id: 'voids_and_refunds_prod',
          title: 'Voids and Refunds (3)',
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
          title: 'Top Performers (1)',
          reports: [{ code: 'REP_C_101', title: 'Top N customers by amount' }],
        },
        {
          id: 'cust_delivery',
          title: 'Customers and Delivery (4)',
          reports: [
            { code: 'REP_C_201', title: 'Sales by customer and detail' },
            { code: 'REP_C_202', title: 'Sales by zone' },
            { code: 'REP_C_203', title: 'Delivery sales summary' },
            { code: 'REP_C_204', title: 'Drivers history' },
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
          title: "Today's Sales (4)",
          reports: [
            { code: 'REP_TH_101', title: "Today's statistics" },
            { code: 'REP_TH_102', title: "Today's summary of payment" },
            { code: 'REP_TH_103', title: "Today's summary by employee" },
            { code: 'REP_TH_104', title: "Today's transactions" },
          ],
        },
        {
          id: 'history_sub',
          title: 'History (2)',
          reports: [
            { code: 'REP_TH_201', title: 'Preview order sales' },
            { code: 'REP_TH_202', title: 'Main reading history' },
          ],
        },
      ],
    },
    {
      id: 'time_attendance',
      title: '6. Time and Attendance',
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

  return (
    <div className="w-full flex flex-col h-[calc(100vh-80px)] select-none text-left font-sans">
      
      {/* =================================================================== */}
      {/* 1. TOP SUB-HEADER BAR                                               */}
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
      {/* 2. DYNAMIC ADAPTIVE FILTER RIBBON TOOLBAR                           */}
      {/* =================================================================== */}
      <div className="bg-white border-b border-slate-200 p-3 px-4 flex flex-col gap-2.5 print:hidden shrink-0 shadow-2xs">
        
        {/* Top Filter Ribbon Line */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Left Inputs: Period, Date Range, Branch */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={periodPreset}
              onChange={(e) => setPeriodPreset(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs text-slate-800 focus:outline-none"
            >
              <option value="THIS_MONTH">This Month (August 2026)</option>
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="LAST_MONTH">Last Month</option>
            </select>

            <input
              type="text"
              value={dateRangeText}
              onChange={(e) => setDateRangeText(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-mono text-xs text-slate-800 w-44 text-center focus:outline-none"
            />

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Operating Branches</option>
              <option value="Choueifat">Choueifat Main Facility</option>
              <option value="Beirut">Beirut Branch</option>
            </select>

            {/* DYNAMIC FIELD 1: Cashier/Server (For Voids & POS Reports) */}
            {(activeReport.category === 'Internal Control' || activeReport.code.startsWith('REP_IC_') || activeReport.code.startsWith('REP_TH_')) && (
              <select
                value={serverFilter}
                onChange={(e) => setServerFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-bold text-[#1e3a2b] text-xs focus:outline-none"
              >
                <option value="ALL">All Cashiers / Servers</option>
                <option value="Hiba Aloulou">Hiba Aloulou</option>
                <option value="Ahmad Ali Kassem">Ahmad Ali Kassem</option>
                <option value="Hussein Mahdi">Hussein Mahdi</option>
              </select>
            )}

            {/* DYNAMIC FIELD 2: Void Reason (For Voids Reports) */}
            {activeReport.code === 'REP_IC_001' && (
              <select
                value={voidReasonFilter}
                onChange={(e) => setVoidReasonFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs text-slate-800 focus:outline-none"
              >
                <option value="ALL">All Void Reasons</option>
                <option value="WRONG_COUNT">تعداد خاطئ (Wrong Count)</option>
                <option value="PRICE_DISPUTE">Price Dispute</option>
                <option value="CUSTOMER_CANCEL">Customer Cancelled</option>
              </select>
            )}

            {/* DYNAMIC FIELD 3: Product Division & Category (For Product Sales Reports) */}
            {(activeReport.category.includes('Product Sales') || activeReport.code.startsWith('REP_P_') || activeReport.code.startsWith('REP_S_')) && (
              <>
                <select
                  value={divisionFilter}
                  onChange={(e) => setDivisionFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs text-slate-800 focus:outline-none"
                >
                  <option value="ALL">All Product Divisions</option>
                  <option value="OLIVE_OIL">Olive Oil & Extra Virgin</option>
                  <option value="PRESERVES">Pomegranate Molasses & Jams</option>
                  <option value="DETERGENTS">Industrial Cleaners & Javel</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs text-slate-800 focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="TINS_17L">17.5L Bulk Tins</option>
                  <option value="GLASS_1L">1L Glass Bottles</option>
                  <option value="MOLASSES">Pomegranate Molasses 500ml</option>
                </select>
              </>
            )}

            {/* DYNAMIC FIELD 4: Customer Zone & Ratio (For Customer Sales & Lists) */}
            {(activeReport.category.includes('Customer') || activeReport.code.startsWith('REP_C_') || activeReport.code.startsWith('REP_L_')) && (
              <>
                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs text-slate-800 focus:outline-none"
                >
                  <option value="ALL">All Lebanon Zones</option>
                  <option value="Mount Lebanon">Mount Lebanon (Choueifat / Metn)</option>
                  <option value="Beirut">Beirut Governorate</option>
                  <option value="South Lebanon">South Lebanon (Saida / Tyre)</option>
                  <option value="Bekaa">Bekaa Valley</option>
                  <option value="North Lebanon">North Lebanon (Tripoli)</option>
                </select>

                <select
                  value={customerTierFilter}
                  onChange={(e) => setCustomerTierFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-bold text-[#1e3a2b] text-xs focus:outline-none"
                >
                  <option value="ALL">All Customer Ratios / Tiers</option>
                  <option value="WHOLESALE">B2B Wholesale Distributor</option>
                  <option value="SUPERMARKET">Supermarket Commercial Tier</option>
                  <option value="RETAIL">Retail Customer</option>
                </select>
              </>
            )}

            {/* DYNAMIC FIELD 5: Payment Method (For Financial & Invoices Reports) */}
            {(activeReport.category.includes('Financial') || activeReport.code.startsWith('REP_F_') || activeReport.code === 'REP_S_00192') && (
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs text-slate-800 focus:outline-none"
              >
                <option value="ALL">All Payment Methods</option>
                <option value="CASH">Cash on Delivery / POS</option>
                <option value="WHISH">Whish Money</option>
                <option value="CREDIT">Credit (On Account)</option>
              </select>
            )}

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
                setServerFilter('ALL');
                setDivisionFilter('ALL');
                setZoneFilter('ALL');
              }}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Right Tools: Zoom + Print + Export */}
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
          </div>

        </div>

        {/* Dynamic Checkbox Flags Row */}
        <div className="flex flex-wrap items-center gap-4 pt-1.5 border-t border-slate-100 text-xs">
          {activeReport.code === 'REP_IC_001' && (
            <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
              <input type="checkbox" checked={showAuthManager} onChange={(e) => setShowAuthManager(e.target.checked)} className="accent-[#1e3a2b] w-3.5 h-3.5 rounded" />
              <span>Show Authorizing Manager</span>
            </label>
          )}

          {(activeReport.category.includes('Product Sales') || activeReport.code.startsWith('REP_P_')) && (
            <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
              <input type="checkbox" checked={showProfitMargins} onChange={(e) => setShowProfitMargins(e.target.checked)} className="accent-[#1e3a2b] w-3.5 h-3.5 rounded" />
              <span>Show Cost & Profit Margins</span>
            </label>
          )}

          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
            <input type="checkbox" checked={showTaxBreakdown} onChange={(e) => setShowTaxBreakdown(e.target.checked)} className="accent-[#1e3a2b] w-3.5 h-3.5 rounded" />
            <span>Show Tax / VAT Breakdown</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
            <input type="checkbox" checked={includeZeroBalances} onChange={(e) => setIncludeZeroBalances(e.target.checked)} className="accent-[#1e3a2b] w-3.5 h-3.5 rounded" />
            <span>Include Zero Balances / Sales</span>
          </label>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 3. WORKSPACE: 93-REPORTS TREE + PROPORTIONAL A4 PAPER               */}
      {/* =================================================================== */}
      <div className="flex-1 flex overflow-hidden p-4 bg-[#f3f5f8]">
        
        {/* Left 93-Reports Tree Sidebar */}
        {showCatalog && (
          <aside className="w-[300px] bg-[#eef3ee] border-r border-slate-300 print:hidden overflow-y-auto p-2.5 space-y-2 shrink-0 mr-4 shadow-2xs custom-scrollbar rounded-xl">
            
            {/* Search Box */}
            <div className="bg-white p-1 rounded-lg border border-slate-300 shadow-2xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search all 93 reports..."
                className="w-full px-2.5 py-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Complete 93-Reports Categories & Sub-Categories */}
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

                    {/* All Sub-Categories with Exact Counts */}
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

        {/* Right Canvas: Zoomable A4 Paper */}
        <main className="flex-1 overflow-y-auto custom-scrollbar flex justify-center">
          
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-[794px] min-h-[1123px] page-break-after-always relative bg-white p-8 text-black font-sans border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 print:p-6 transition-transform duration-200 select-none"
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
                <div>Period: {dateRangeText}</div>
                <div>Branch: {branchFilter === 'ALL' ? 'Southern Olive Oil Products S.A.R.L' : branchFilter}</div>
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
