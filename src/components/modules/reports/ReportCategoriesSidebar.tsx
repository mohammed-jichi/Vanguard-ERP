'use client';

import React, { useState, useEffect } from 'react';

// ============================================================================
// COMPLETE VANGUARD REPORTS HIERARCHY TREE
// Organization: Southern Olive Oil Products S.A.R.L
// ============================================================================

export interface ReportItem {
  id: string;
  code: string;
  title: string;
  category: string;
  subCategory?: string;
}

interface ReportCategoriesSidebarProps {
  activeReportId: string;
  onSelectReport: (report: ReportItem) => void;
}

export default function ReportCategoriesSidebar({
  activeReportId,
  onSelectReport,
}: ReportCategoriesSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'financial',
    'product_sales',
    'customer_sales',
  ]);
  const [expandedSubCategories, setExpandedSubCategories] = useState<string[]>([
    'fin_stats',
    'prod_sales_sub',
  ]);
  const [recentlyViewed, setRecentlyViewed] = useState<ReportItem[]>([]);

  // Toggle Category Accordion
  const toggleCategory = (catKey: string) => {
    setExpandedCategories((prev) =>
      prev.includes(catKey) ? prev.filter((k) => k !== catKey) : [...prev, catKey]
    );
  };

  // Toggle Sub-Category Accordion
  const toggleSubCategory = (subKey: string) => {
    setExpandedSubCategories((prev) =>
      prev.includes(subKey) ? prev.filter((k) => k !== subKey) : [...prev, subKey]
    );
  };

  // Handle Report Click & Track Recently Viewed (Last 5)
  const handleReportClick = (rep: ReportItem) => {
    onSelectReport(rep);
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item.id !== rep.id);
      return [rep, ...filtered].slice(0, 5);
    });
  };

  // ==========================================================================
  // MASTER CATALOG OF ALL REPORTS
  // ==========================================================================
  const masterReportsCatalog = {
    // 1. Internal Control
    internal_control: {
      title: 'Internal Control',
      icon: '🛡️',
      items: [
        { id: 'ic_01', code: 'REP_IC_001', title: 'Summary of Voids', category: 'Internal Control' },
        { id: 'ic_02', code: 'REP_IC_002', title: 'Summary of Refunds', category: 'Internal Control' },
        { id: 'ic_03', code: 'REP_IC_003', title: 'Duplicate Invoices', category: 'Internal Control' },
        { id: 'ic_04', code: 'REP_IC_004', title: 'Meter Reports', category: 'Internal Control' },
        { id: 'ic_05', code: 'REP_IC_005', title: 'No Sale', category: 'Internal Control' },
        { id: 'ic_06', code: 'REP_IC_006', title: 'Transactions on Hold', category: 'Internal Control' },
        { id: 'ic_07', code: 'REP_IC_007', title: 'User Log Report', category: 'Internal Control' },
        { id: 'ic_08', code: 'REP_IC_008', title: 'Discount Summary', category: 'Internal Control' },
      ],
    },

    // 2. Financial
    financial: {
      title: 'Financial',
      icon: '💵',
      subGroups: {
        fin_stats: {
          title: 'Financial Statistics',
          items: [
            { id: 'fin_01', code: 'REP_F_101', title: 'Sales Summary', category: 'Financial', subCategory: 'Financial Statistics' },
            { id: 'fin_02', code: 'REP_F_102', title: 'Statistics by Workstation', category: 'Financial', subCategory: 'Financial Statistics' },
            { id: 'fin_03', code: 'REP_F_103', title: 'Statistics by Department', category: 'Financial', subCategory: 'Financial Statistics' },
            { id: 'fin_04', code: 'REP_F_104', title: 'Summary of Sales by Employee', category: 'Financial', subCategory: 'Financial Statistics' },
            { id: 'fin_05', code: 'REP_F_105', title: 'Sales by Employee by Category', category: 'Financial', subCategory: 'Financial Statistics' },
            { id: 'fin_06', code: 'REP_F_106', title: 'Sales by Supplier', category: 'Financial', subCategory: 'Financial Statistics' },
            { id: 'fin_07', code: 'REP_F_107', title: 'Delivery Orders by Date and Branch', category: 'Financial', subCategory: 'Financial Statistics' },
          ],
        },
        tax_reports: {
          title: 'Tax Reports',
          items: [
            { id: 'fin_08', code: 'REP_F_201', title: 'Tax Summary', category: 'Financial', subCategory: 'Tax Reports' },
            { id: 'fin_09', code: 'REP_F_202', title: 'Tax Summary Comparative', category: 'Financial', subCategory: 'Tax Reports' },
          ],
        },
        discount_reports: {
          title: 'Discount Reports',
          items: [
            { id: 'fin_10', code: 'REP_F_301', title: 'Summary of Discount by Divisions', category: 'Financial', subCategory: 'Discount Reports' },
            { id: 'fin_11', code: 'REP_F_302', title: 'Discount by Category by Department', category: 'Financial', subCategory: 'Discount Reports' },
            { id: 'fin_12', code: 'REP_F_303', title: 'Summary of Discount', category: 'Financial', subCategory: 'Discount Reports' },
            { id: 'fin_13', code: 'REP_F_304', title: 'Discount by Description by Employee', category: 'Financial', subCategory: 'Discount Reports' },
            { id: 'fin_14', code: 'REP_F_305', title: 'Summary of Discount by Items Amount', category: 'Financial', subCategory: 'Discount Reports' },
            { id: 'fin_15', code: 'REP_F_306', title: 'Discount Summary', category: 'Financial', subCategory: 'Discount Reports' },
          ],
        },
        payments: {
          title: 'Payments',
          items: [
            { id: 'fin_16', code: 'REP_F_401', title: 'Summary of Payment', category: 'Financial', subCategory: 'Payments' },
            { id: 'fin_17', code: 'REP_F_402', title: 'Summary of Payment by Department', category: 'Financial', subCategory: 'Payments' },
            { id: 'fin_18', code: 'REP_F_403', title: 'Summary of Payment by Workstation', category: 'Financial', subCategory: 'Payments' },
            { id: 'fin_19', code: 'REP_F_404', title: 'Summary of Payment by Employee', category: 'Financial', subCategory: 'Payments' },
            { id: 'fin_20', code: 'REP_F_405', title: 'Advanced Payment History', category: 'Financial', subCategory: 'Payments' },
            { id: 'fin_21', code: 'REP_F_406', title: 'Unpaid/Paid In/Paid Out', category: 'Financial', subCategory: 'Payments' },
            { id: 'fin_22', code: 'REP_F_407', title: 'Customer Payments', category: 'Financial', subCategory: 'Payments' },
            { id: 'fin_23', code: 'REP_F_408', title: 'List of Layaway Sales', category: 'Financial', subCategory: 'Payments' },
            { id: 'fin_24', code: 'REP_F_409', title: 'Layaway History', category: 'Financial', subCategory: 'Payments' },
            { id: 'fin_25', code: 'REP_F_410', title: 'List of Pending Invoices with Advanced Payment', category: 'Financial', subCategory: 'Payments' },
          ],
        },
        fin_internal_control: {
          title: 'Internal Control (Financial)',
          items: [
            { id: 'fin_26', code: 'REP_F_501', title: 'Meter Report', category: 'Financial', subCategory: 'Internal Control' },
            { id: 'fin_27', code: 'REP_F_502', title: 'No Sale', category: 'Financial', subCategory: 'Internal Control' },
            { id: 'fin_28', code: 'REP_F_503', title: 'Transactions on Hold', category: 'Financial', subCategory: 'Internal Control' },
            { id: 'fin_29', code: 'REP_F_504', title: 'User Log Report', category: 'Financial', subCategory: 'Internal Control' },
          ],
        },
        profit_summary: {
          title: 'Profit Summary',
          items: [
            { id: 'fin_30', code: 'REP_F_601', title: 'Profit by Invoices Summary', category: 'Financial', subCategory: 'Profit Summary' },
            { id: 'fin_31', code: 'REP_F_602', title: 'Profit by Item Summary', category: 'Financial', subCategory: 'Profit Summary' },
            { id: 'fin_32', code: 'REP_F_603', title: 'Profit by Category Summary', category: 'Financial', subCategory: 'Profit Summary' },
            { id: 'fin_33', code: 'REP_F_604', title: 'Profit by Category by Department', category: 'Financial', subCategory: 'Profit Summary' },
            { id: 'fin_34', code: 'REP_F_605', title: 'Profit by Invoices', category: 'Financial', subCategory: 'Profit Summary' },
          ],
        },
        comparative: {
          title: 'Comparative Reports',
          items: [
            { id: 'fin_35', code: 'REP_F_701', title: 'Sales Summary by Day', category: 'Financial', subCategory: 'Comparative' },
            { id: 'fin_36', code: 'REP_F_702', title: 'Daily Sales', category: 'Financial', subCategory: 'Comparative' },
            { id: 'fin_37', code: 'REP_F_703', title: 'Comparative Yearly Sales', category: 'Financial', subCategory: 'Comparative' },
            { id: 'fin_38', code: 'REP_F_704', title: 'Comparative Monthly Sales', category: 'Financial', subCategory: 'Comparative' },
            { id: 'fin_39', code: 'REP_F_705', title: 'Comparative Monthly Sales by Employee', category: 'Financial', subCategory: 'Comparative' },
          ],
        },
        transaction_summary: {
          title: 'Transaction Summary',
          items: [
            { id: 'fin_40', code: 'REP_F_801', title: 'Transaction by Date', category: 'Financial', subCategory: 'Transaction Summary' },
            { id: 'fin_41', code: 'REP_F_802', title: 'Credit Sales', category: 'Financial', subCategory: 'Transaction Summary' },
            { id: 'fin_42', code: 'REP_F_803', title: 'Credit Card Report', category: 'Financial', subCategory: 'Transaction Summary' },
            { id: 'fin_43', code: 'REP_F_804', title: 'Electronic Journal', category: 'Financial', subCategory: 'Transaction Summary' },
          ],
        },
        time_sales_analysis: {
          title: 'Time Sales Analysis',
          items: [
            { id: 'fin_44', code: 'REP_F_901', title: 'Time Report Group by Transactions Count', category: 'Financial', subCategory: 'Time Sales Analysis' },
            { id: 'fin_45', code: 'REP_F_902', title: 'Time Report by Date', category: 'Financial', subCategory: 'Time Sales Analysis' },
            { id: 'fin_46', code: 'REP_F_903', title: 'Time Report - Average Check', category: 'Financial', subCategory: 'Time Sales Analysis' },
            { id: 'fin_47', code: 'REP_F_904', title: 'Time Report by EOD Date', category: 'Financial', subCategory: 'Time Sales Analysis' },
            { id: 'fin_48', code: 'REP_F_905', title: 'Transaction Report by Time', category: 'Financial', subCategory: 'Time Sales Analysis' },
          ],
        },
      },
    },

    // 3. Product Sales
    product_sales: {
      title: 'Product Sales',
      icon: '📦',
      subGroups: {
        prod_sales_sub: {
          title: 'Product Sales',
          items: [
            { id: 'prod_01', code: 'REP_P_101', title: 'Summary of Sales by Items', category: 'Product Sales', subCategory: 'Product Sales' },
            { id: 'prod_02', code: 'REP_S_00191', title: 'Sales by Items', category: 'Product Sales', subCategory: 'Product Sales' },
            { id: 'prod_03', code: 'REP_P_102', title: 'Sales Details for One Sales Item', category: 'Product Sales', subCategory: 'Product Sales' },
            { id: 'prod_04', code: 'REP_P_103', title: 'Sales by Customer by Items', category: 'Product Sales', subCategory: 'Product Sales' },
            { id: 'prod_05', code: 'REP_P_104', title: 'Daily Sales by Items', category: 'Product Sales', subCategory: 'Product Sales' },
            { id: 'prod_06', code: 'REP_P_105', title: 'Sales by Categories', category: 'Product Sales', subCategory: 'Product Sales' },
            { id: 'prod_07', code: 'REP_P_106', title: 'Sales by Divisions', category: 'Product Sales', subCategory: 'Product Sales' },
            { id: 'prod_08', code: 'REP_P_107', title: 'Sales Items by Transaction', category: 'Product Sales', subCategory: 'Product Sales' },
            { id: 'prod_09', code: 'REP_P_108', title: 'Not Sold Items', category: 'Product Sales', subCategory: 'Product Sales' },
            { id: 'prod_10', code: 'REP_P_109', title: 'Sold Serial Number', category: 'Product Sales', subCategory: 'Product Sales' },
          ],
        },
        comparative_by_branch: {
          title: 'Comparative by Branch',
          items: [
            { id: 'prod_11', code: 'REP_P_201', title: 'Sales by Category', category: 'Product Sales', subCategory: 'Comparative by Branch' },
            { id: 'prod_12', code: 'REP_P_202', title: 'Sales by Division', category: 'Product Sales', subCategory: 'Comparative by Branch' },
            { id: 'prod_13', code: 'REP_P_203', title: 'Sales by Groups', category: 'Product Sales', subCategory: 'Comparative by Branch' },
            { id: 'prod_14', code: 'REP_P_204', title: 'Sales by Items', category: 'Product Sales', subCategory: 'Comparative by Branch' },
          ],
        },
        top_performers_prod: {
          title: 'Top Performers',
          items: [
            { id: 'prod_15', code: 'REP_P_301', title: 'Top N Sold by Quantity', category: 'Product Sales', subCategory: 'Top Performers' },
            { id: 'prod_16', code: 'REP_P_302', title: 'Top N Sold by Amount', category: 'Product Sales', subCategory: 'Top Performers' },
          ],
        },
        voids_and_refunds_prod: {
          title: 'Voids and Refunds',
          items: [
            { id: 'prod_17', code: 'REP_P_401', title: 'Summary of Voids', category: 'Product Sales', subCategory: 'Voids and Refunds' },
            { id: 'prod_18', code: 'REP_P_402', title: 'Summary of Refunds', category: 'Product Sales', subCategory: 'Voids and Refunds' },
            { id: 'prod_19', code: 'REP_P_403', title: 'Details of Refunds', category: 'Product Sales', subCategory: 'Voids and Refunds' },
          ],
        },
      },
    },

    // 4. Customer Sales
    customer_sales: {
      title: 'Customer Sales',
      icon: '👥',
      subGroups: {
        top_performers_cust: {
          title: 'Top Performers',
          items: [
            { id: 'cust_01', code: 'REP_C_101', title: 'Top N Customers by Amount', category: 'Customer Sales', subCategory: 'Top Performers' },
          ],
        },
        customers_delivery: {
          title: 'Customers and Delivery',
          items: [
            { id: 'cust_02', code: 'REP_C_201', title: 'Sales by Customer and Detail', category: 'Customer Sales', subCategory: 'Customers and Delivery' },
            { id: 'cust_03', code: 'REP_C_202', title: 'Sales by Zone', category: 'Customer Sales', subCategory: 'Customers and Delivery' },
            { id: 'cust_04', code: 'REP_C_203', title: 'Delivery Sales Summary', category: 'Customer Sales', subCategory: 'Customers and Delivery' },
            { id: 'cust_05', code: 'REP_C_204', title: 'Drivers History', category: 'Customer Sales', subCategory: 'Customers and Delivery' },
          ],
        },
      },
    },

    // 5. Today's and History
    todays_and_history: {
      title: "Today's and History",
      icon: '📅',
      subGroups: {
        todays_sales: {
          title: "Today's Sales",
          items: [
            { id: 'td_01', code: 'REP_TH_101', title: "Today's Statistics", category: "Today's and History", subCategory: "Today's Sales" },
            { id: 'td_02', code: 'REP_TH_102', title: "Today's Summary of Payment", category: "Today's and History", subCategory: "Today's Sales" },
            { id: 'td_03', code: 'REP_TH_103', title: "Today's Summary by Employee", category: "Today's and History", subCategory: "Today's Sales" },
            { id: 'td_04', code: 'REP_TH_104', title: "Today's Transactions", category: "Today's and History", subCategory: "Today's Sales" },
          ],
        },
        history_reports: {
          title: 'History',
          items: [
            { id: 'td_05', code: 'REP_TH_201', title: 'Preview Order Sales', category: "Today's and History", subCategory: 'History' },
            { id: 'td_06', code: 'REP_TH_202', title: 'Main Reading History', category: "Today's and History", subCategory: 'History' },
          ],
        },
      },
    },

    // 6. Time and Attendance
    time_attendance: {
      title: 'Time and Attendance',
      icon: '⏱️',
      items: [
        { id: 'ta_01', code: 'REP_TA_001', title: 'Employee Attendance', category: 'Time and Attendance' },
        { id: 'ta_02', code: 'REP_TA_002', title: 'Time and Attendance', category: 'Time and Attendance' },
        { id: 'ta_03', code: 'REP_TA_003', title: 'Labor Cost', category: 'Time and Attendance' },
      ],
    },

    // 7. Lists
    lists: {
      title: 'Lists',
      icon: '📋',
      items: [
        { id: 'list_01', code: 'REP_L_001', title: 'Customer List Standard', category: 'Lists' },
        { id: 'list_02', code: 'REP_L_002', title: 'Not Active Customers', category: 'Lists' },
        { id: 'list_03', code: 'REP_L_003', title: 'New Customers', category: 'Lists' },
        { id: 'list_04', code: 'REP_L_004', title: 'Blacklist Customers', category: 'Lists' },
      ],
    },
  };

  return (
    <div className="w-[280px] h-full bg-[#f8fafc] border-r border-slate-300 flex flex-col font-sans text-slate-800 text-left select-none">
      
      {/* Search Input Bar */}
      <div className="p-2.5 border-b border-slate-300 bg-white">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search reports by title or code..."
          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-[11px] font-medium focus:border-[#1a629b] focus:outline-none"
        />
      </div>

      {/* Reports Scrollable Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 text-[11px] custom-scrollbar">
        
        {/* RECENTLY VIEWED SECTION (LAST 5 VISITED) */}
        {recentlyViewed.length > 0 && !searchQuery && (
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-2 space-y-1">
            <div className="font-bold text-[#1a629b] text-[10.5px] uppercase tracking-wider flex items-center gap-1">
              <span>🕒</span> <span>Recently Viewed (Last 5)</span>
            </div>
            <div className="space-y-0.5">
              {recentlyViewed.map((rep) => (
                <button
                  key={rep.id}
                  type="button"
                  onClick={() => handleReportClick(rep)}
                  className={`w-full text-left px-2 py-1 rounded transition-all truncate block cursor-pointer ${
                    activeReportId === rep.id
                      ? 'bg-[#1a629b] text-white font-bold'
                      : 'text-slate-700 hover:bg-blue-100/60 font-medium'
                  }`}
                >
                  <span className="font-mono text-[9.5px] opacity-75 mr-1">[{rep.code}]</span>
                  <span>{rep.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 1. INTERNAL CONTROL */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div
            onClick={() => toggleCategory('internal_control')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 cursor-pointer font-bold text-slate-800 flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <span>🛡️</span> <span>1. Internal Control</span>
            </span>
            <span className="text-[9px]">{expandedCategories.includes('internal_control') ? '▲' : '▼'}</span>
          </div>

          {expandedCategories.includes('internal_control') && (
            <div className="p-1 space-y-0.5">
              {masterReportsCatalog.internal_control.items
                .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.code.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleReportClick(r)}
                    className={`w-full text-left px-2 py-1 rounded truncate block transition-all cursor-pointer ${
                      activeReportId === r.id ? 'bg-[#1a629b] text-white font-bold' : 'hover:bg-slate-100 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="font-mono text-[9px] opacity-60 mr-1">[{r.code}]</span>
                    <span>{r.title}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* 2. FINANCIAL (WITH ALL SUB-CATEGORIES) */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div
            onClick={() => toggleCategory('financial')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 cursor-pointer font-bold text-slate-800 flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <span>💵</span> <span>2. Financial Reports</span>
            </span>
            <span className="text-[9px]">{expandedCategories.includes('financial') ? '▲' : '▼'}</span>
          </div>

          {expandedCategories.includes('financial') && (
            <div className="p-1 space-y-1">
              {Object.entries(masterReportsCatalog.financial.subGroups).map(([subKey, subGroup]) => (
                <div key={subKey} className="border border-slate-100 rounded bg-slate-50/50">
                  <div
                    onClick={() => toggleSubCategory(subKey)}
                    className="px-2 py-1 font-bold text-slate-700 hover:text-[#1a629b] cursor-pointer flex items-center justify-between text-[10.5px]"
                  >
                    <span>📁 {subGroup.title} ({subGroup.items.length})</span>
                    <span className="text-[8px]">{expandedSubCategories.includes(subKey) ? '−' : '+'}</span>
                  </div>

                  {expandedSubCategories.includes(subKey) && (
                    <div className="pl-2 pr-1 py-0.5 space-y-0.5 border-t border-slate-200/60 bg-white">
                      {subGroup.items
                        .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.code.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => handleReportClick(r)}
                            className={`w-full text-left px-2 py-1 rounded truncate block transition-all cursor-pointer ${
                              activeReportId === r.id ? 'bg-[#1a629b] text-white font-bold' : 'hover:bg-slate-100 text-slate-700 font-medium'
                            }`}
                          >
                            <span className="font-mono text-[9px] opacity-60 mr-1">[{r.code}]</span>
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

        {/* 3. PRODUCT SALES (WITH ALL SUB-CATEGORIES) */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div
            onClick={() => toggleCategory('product_sales')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 cursor-pointer font-bold text-slate-800 flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <span>📦</span> <span>3. Product Sales</span>
            </span>
            <span className="text-[9px]">{expandedCategories.includes('product_sales') ? '▲' : '▼'}</span>
          </div>

          {expandedCategories.includes('product_sales') && (
            <div className="p-1 space-y-1">
              {Object.entries(masterReportsCatalog.product_sales.subGroups).map(([subKey, subGroup]) => (
                <div key={subKey} className="border border-slate-100 rounded bg-slate-50/50">
                  <div
                    onClick={() => toggleSubCategory(subKey)}
                    className="px-2 py-1 font-bold text-slate-700 hover:text-[#1a629b] cursor-pointer flex items-center justify-between text-[10.5px]"
                  >
                    <span>📁 {subGroup.title} ({subGroup.items.length})</span>
                    <span className="text-[8px]">{expandedSubCategories.includes(subKey) ? '−' : '+'}</span>
                  </div>

                  {expandedSubCategories.includes(subKey) && (
                    <div className="pl-2 pr-1 py-0.5 space-y-0.5 border-t border-slate-200/60 bg-white">
                      {subGroup.items
                        .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.code.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => handleReportClick(r)}
                            className={`w-full text-left px-2 py-1 rounded truncate block transition-all cursor-pointer ${
                              activeReportId === r.id ? 'bg-[#1a629b] text-white font-bold' : 'hover:bg-slate-100 text-slate-700 font-medium'
                            }`}
                          >
                            <span className="font-mono text-[9px] opacity-60 mr-1">[{r.code}]</span>
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

        {/* 4. CUSTOMER SALES */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div
            onClick={() => toggleCategory('customer_sales')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 cursor-pointer font-bold text-slate-800 flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <span>👥</span> <span>4. Customer Sales</span>
            </span>
            <span className="text-[9px]">{expandedCategories.includes('customer_sales') ? '▲' : '▼'}</span>
          </div>

          {expandedCategories.includes('customer_sales') && (
            <div className="p-1 space-y-1">
              {Object.entries(masterReportsCatalog.customer_sales.subGroups).map(([subKey, subGroup]) => (
                <div key={subKey} className="border border-slate-100 rounded bg-slate-50/50">
                  <div
                    onClick={() => toggleSubCategory(subKey)}
                    className="px-2 py-1 font-bold text-slate-700 hover:text-[#1a629b] cursor-pointer flex items-center justify-between text-[10.5px]"
                  >
                    <span>📁 {subGroup.title} ({subGroup.items.length})</span>
                    <span className="text-[8px]">{expandedSubCategories.includes(subKey) ? '−' : '+'}</span>
                  </div>

                  {expandedSubCategories.includes(subKey) && (
                    <div className="pl-2 pr-1 py-0.5 space-y-0.5 border-t border-slate-200/60 bg-white">
                      {subGroup.items
                        .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.code.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => handleReportClick(r)}
                            className={`w-full text-left px-2 py-1 rounded truncate block transition-all cursor-pointer ${
                              activeReportId === r.id ? 'bg-[#1a629b] text-white font-bold' : 'hover:bg-slate-100 text-slate-700 font-medium'
                            }`}
                          >
                            <span className="font-mono text-[9px] opacity-60 mr-1">[{r.code}]</span>
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

        {/* 5. TODAY'S AND HISTORY */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div
            onClick={() => toggleCategory('todays_and_history')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 cursor-pointer font-bold text-slate-800 flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <span>📅</span> <span>5. Today's and History</span>
            </span>
            <span className="text-[9px]">{expandedCategories.includes('todays_and_history') ? '▲' : '▼'}</span>
          </div>

          {expandedCategories.includes('todays_and_history') && (
            <div className="p-1 space-y-1">
              {Object.entries(masterReportsCatalog.todays_and_history.subGroups).map(([subKey, subGroup]) => (
                <div key={subKey} className="border border-slate-100 rounded bg-slate-50/50">
                  <div
                    onClick={() => toggleSubCategory(subKey)}
                    className="px-2 py-1 font-bold text-slate-700 hover:text-[#1a629b] cursor-pointer flex items-center justify-between text-[10.5px]"
                  >
                    <span>📁 {subGroup.title} ({subGroup.items.length})</span>
                    <span className="text-[8px]">{expandedSubCategories.includes(subKey) ? '−' : '+'}</span>
                  </div>

                  {expandedSubCategories.includes(subKey) && (
                    <div className="pl-2 pr-1 py-0.5 space-y-0.5 border-t border-slate-200/60 bg-white">
                      {subGroup.items
                        .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.code.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => handleReportClick(r)}
                            className={`w-full text-left px-2 py-1 rounded truncate block transition-all cursor-pointer ${
                              activeReportId === r.id ? 'bg-[#1a629b] text-white font-bold' : 'hover:bg-slate-100 text-slate-700 font-medium'
                            }`}
                          >
                            <span className="font-mono text-[9px] opacity-60 mr-1">[{r.code}]</span>
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

        {/* 6. TIME AND ATTENDANCE */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div
            onClick={() => toggleCategory('time_attendance')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 cursor-pointer font-bold text-slate-800 flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <span>⏱️</span> <span>6. Time and Attendance</span>
            </span>
            <span className="text-[9px]">{expandedCategories.includes('time_attendance') ? '▲' : '▼'}</span>
          </div>

          {expandedCategories.includes('time_attendance') && (
            <div className="p-1 space-y-0.5">
              {masterReportsCatalog.time_attendance.items
                .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.code.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleReportClick(r)}
                    className={`w-full text-left px-2 py-1 rounded truncate block transition-all cursor-pointer ${
                      activeReportId === r.id ? 'bg-[#1a629b] text-white font-bold' : 'hover:bg-slate-100 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="font-mono text-[9px] opacity-60 mr-1">[{r.code}]</span>
                    <span>{r.title}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* 7. LISTS */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div
            onClick={() => toggleCategory('lists')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 cursor-pointer font-bold text-slate-800 flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <span>📋</span> <span>7. Lists</span>
            </span>
            <span className="text-[9px]">{expandedCategories.includes('lists') ? '▲' : '▼'}</span>
          </div>

          {expandedCategories.includes('lists') && (
            <div className="p-1 space-y-0.5">
              {masterReportsCatalog.lists.items
                .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.code.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleReportClick(r)}
                    className={`w-full text-left px-2 py-1 rounded truncate block transition-all cursor-pointer ${
                      activeReportId === r.id ? 'bg-[#1a629b] text-white font-bold' : 'hover:bg-slate-100 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="font-mono text-[9px] opacity-60 mr-1">[{r.code}]</span>
                    <span>{r.title}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

      </div>

      {/* Footer Branding */}
      <div className="p-2 border-t border-slate-300 bg-slate-100 text-[10px] text-slate-500 font-mono text-center">
        Southern Olive Oil Products S.A.R.L
      </div>

    </div>
  );
}
