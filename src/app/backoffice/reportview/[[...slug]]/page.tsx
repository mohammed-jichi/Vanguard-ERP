'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ReportRibbon from '../ReportRibbon';
import {
  branchesList,
  getDynamicPeriodInfo,
  masterCatalog,
} from '../report-data';

export default function MasterReportViewPage() {
  const [showCatalog, setShowCatalog] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);

  // Filter States
  const [periodPreset, setPeriodPreset] = useState('THIS_MONTH');
  const [fromDate, setFromDate] = useState('2026-08-01');
  const [toDate, setToDate] = useState('2026-08-31');
  const [eodDate, setEodDate] = useState('2026-08-31');

  const [selectedBranches, setSelectedBranches] = useState<string[]>(['ALL']);
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState('ALL');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('ALL');
  const [selectedInvoiceCriteria, setSelectedInvoiceCriteria] = useState<string[]>(['Show refund']);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(['ALL']);
  const [fromInvoiceNum, setFromInvoiceNum] = useState('101720');
  const [toInvoiceNum, setToInvoiceNum] = useState('101730');
  const [customerSearchInput, setCustomerSearchInput] = useState('');
  const [vatNumberFilter, setVatNumberFilter] = useState('ALL');
  const [serverFilter, setServerFilter] = useState('ALL');
  const [groupedByServer, setGroupedByServer] = useState(true);
  const [realDateFilter, setRealDateFilter] = useState(false);
  const [showRateFilter, setShowRateFilter] = useState(false);
  const [groupByDateFilter, setGroupByDateFilter] = useState(false);
  const [showSummaryFilter, setShowSummaryFilter] = useState(false);
  const [showZeroTaxFilter, setShowZeroTaxFilter] = useState(false);

  // Active Report State
  const [transactionSubType, setTransactionSubType] = useState('Duplicate Invoices');
  const [activeReport, setActiveReport] = useState({
    code: 'REP_IC_001',
    title: 'Summary of voids',
    category: '1. Internal Control',
  });

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

  const dynamicPeriodInfo = getDynamicPeriodInfo(periodPreset, fromDate, toDate, eodDate);

  const getBranchesDisplayLabel = () => {
    if (selectedBranches.includes('ALL') || selectedBranches.length === 0) {
      return `All Branches (${branchesList.length})`;
    }
    if (selectedBranches.length === 1) {
      const found = branchesList.find((b) => b.code === selectedBranches[0]);
      return found ? found.name : selectedBranches[0];
    }
    return `${selectedBranches.length} Branches Selected`;
  };

  const triggerCSVExport = () => {
    let csvContent = '\uFEFF';
    csvContent += `Company: Southern Olive Oil Products S.A.R.L\n`;
    csvContent += `Report: ${activeReport.code === 'REP_IC_003' ? transactionSubType : activeReport.title}\n`;
    csvContent += `Period: ${dynamicPeriodInfo.header}\n`;
    csvContent += `Branch: ${getBranchesDisplayLabel()}\n\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Vanguard_${activeReport.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sample Datasets for Immediate Visual Grounding
  const productSalesRows = [
    { code: 'OIL-175', name: 'زيت زيتون بكر ممتاز بلدي 17.5 لتر', unit: '17.5L Tin', qty: 120, unitPrice: 9000000, gross: 1080000000, discount: 54000000, net: 1026000000 },
    { code: 'OIL-100', name: 'ألفية زيت زيتون خضير بلدي 1000 مل', unit: '1L Glass', qty: 350, unitPrice: 990000, gross: 346500000, discount: 0, net: 346500000 },
    { code: 'MOL-500', name: 'دبس رمان بلدي نقي 500 مل', unit: '500ml Bottle', qty: 480, unitPrice: 450000, gross: 216000000, discount: 4500000, net: 211500000 },
  ];

  const customerSalesRows = [
    { code: 'CUST-001', name: 'Al-Baraka Supermarket S.A.R.L', zone: 'Beirut - Hamra', ordersCount: 24, totalLbp: 450000000, totalUsd: 5000, rep: 'Ahmad Ali Kassem' },
    { code: 'CUST-002', name: 'Colonel Mahmoud Abboud', zone: 'Mount Lebanon - Choueifat', ordersCount: 4, totalLbp: 248400000, totalUsd: 2760, rep: 'Hiba Aloulou' },
    { code: 'CUST-003', name: 'Hussein Daik Retail Mart', zone: 'South Lebanon - Saida', ordersCount: 12, totalLbp: 706968000, totalUsd: 7855, rep: 'Mahdi' },
  ];

  return (
    <div className="w-full flex flex-col h-[calc(100vh-80px)] select-none text-left font-sans print:h-auto print:overflow-visible">
      
      {/* BULLETPROOF INLINE A4 PRINT ISOLATION */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm !important;
          }
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            visibility: hidden !important;
          }
          body * {
            visibility: hidden !important;
          }
          header, aside, nav, button, input, select, .print-hidden, [class*="print:hidden"] {
            display: none !important;
            visibility: hidden !important;
          }
          #isolated-a4-print-sheet, #isolated-a4-print-sheet * {
            visibility: visible !important;
          }
          #isolated-a4-print-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            min-height: 100vh !important;
            margin: 0 !important;
            padding: 12mm 15mm !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            display: block !important;
            z-index: 999999 !important;
          }
        }
      `}} />

      {/* 1. TOP SUB-HEADER */}
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
              {activeReport.code === 'REP_IC_003' ? transactionSubType : activeReport.title}
            </span>
            <span className="text-slate-400">({activeReport.category})</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono hidden md:inline">Southern Olive Oil Products S.A.R.L</span>
          <Link
            href="/backoffice/dashboard"
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors flex items-center gap-1"
          >
            <span>🔄 Return to Hub</span>
          </Link>
        </div>
      </div>

      {/* 2. ADAPTIVE FILTER RIBBON */}
      <ReportRibbon
        activeReport={activeReport}
        transactionSubType={transactionSubType}
        setTransactionSubType={setTransactionSubType}
        periodPreset={periodPreset}
        setPeriodPreset={setPeriodPreset}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        eodDate={eodDate}
        setEodDate={setEodDate}
        selectedBranches={selectedBranches}
        setSelectedBranches={setSelectedBranches}
        invoiceTypeFilter={invoiceTypeFilter}
        setInvoiceTypeFilter={setInvoiceTypeFilter}
        paymentTypeFilter={paymentTypeFilter}
        setPaymentTypeFilter={setPaymentTypeFilter}
        selectedInvoiceCriteria={selectedInvoiceCriteria}
        setSelectedInvoiceCriteria={setSelectedInvoiceCriteria}
        selectedDepartments={selectedDepartments}
        setSelectedDepartments={setSelectedDepartments}
        fromInvoiceNum={fromInvoiceNum}
        setFromInvoiceNum={setFromInvoiceNum}
        toInvoiceNum={toInvoiceNum}
        setToInvoiceNum={setToInvoiceNum}
        customerSearchInput={customerSearchInput}
        setCustomerSearchInput={setCustomerSearchInput}
        vatNumberFilter={vatNumberFilter}
        setVatNumberFilter={setVatNumberFilter}
        serverFilter={serverFilter}
        setServerFilter={setServerFilter}
        groupedByServer={groupedByServer}
        setGroupedByServer={setGroupedByServer}
        realDateFilter={realDateFilter}
        setRealDateFilter={setRealDateFilter}
        showRateFilter={showRateFilter}
        setShowRateFilter={setShowRateFilter}
        groupByDateFilter={groupByDateFilter}
        setGroupByDateFilter={setGroupByDateFilter}
        showSummaryFilter={showSummaryFilter}
        setShowSummaryFilter={setShowSummaryFilter}
        showZeroTaxFilter={showZeroTaxFilter}
        setShowZeroTaxFilter={setShowZeroTaxFilter}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        triggerCSVExport={triggerCSVExport}
      />

      {/* 3. WORKSPACE & DYNAMIC A4 PRINT CANVAS */}
      <div className="flex-1 flex overflow-hidden p-4 bg-[#f3f5f8] print:p-0 print:m-0 print:bg-white print:overflow-visible">
        
        {/* Left 93-Catalog Tree */}
        {showCatalog && (
          <aside className="w-[280px] bg-[#eef3ee] border-r border-slate-300 print:hidden overflow-y-auto p-2.5 space-y-2 shrink-0 mr-4 shadow-2xs custom-scrollbar rounded-xl">
            <div className="bg-white p-1 rounded-lg border border-slate-300">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="🔍 Search all 93 reports..." className="w-full px-2 py-0.5 bg-transparent text-xs text-slate-900 focus:outline-none" />
            </div>

            {masterCatalog.map((cat) => (
              <div key={cat.id} className="border border-slate-300/80 rounded-xl overflow-hidden bg-white shadow-2xs">
                <div onClick={() => toggleCat(cat.id)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200/80 cursor-pointer font-bold text-slate-900 text-[11px] flex items-center justify-between border-b border-slate-200">
                  <span>{cat.icon} {cat.title}</span>
                  <span className="text-[9px] text-[#1e3a2b] font-bold">{expandedCats.includes(cat.id) ? '▲' : '▼'}</span>
                </div>

                {expandedCats.includes(cat.id) && (
                  <div className="p-1 space-y-1 bg-white">
                    {cat.reports && cat.reports.filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase())).map((r) => (
                      <button
                        key={r.code}
                        type="button"
                        onClick={() => {
                          setActiveReport({ ...r, category: cat.title });
                          if (r.code === 'REP_IC_003') setTransactionSubType('Duplicate Invoices');
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg truncate block text-xs transition-all ${
                          activeReport.code === r.code ? 'bg-[#1e3a2b] text-white font-bold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.title}
                      </button>
                    ))}

                    {cat.subCategories && cat.subCategories.map((sub) => (
                      <div key={sub.id} className="border border-slate-200 rounded-lg bg-slate-50/60">
                        <div onClick={() => toggleSubCat(sub.id)} className="px-2.5 py-1 font-bold text-slate-800 hover:text-[#1e3a2b] cursor-pointer flex items-center justify-between text-[10.5px]">
                          <span>📁 {sub.title}</span>
                          <span className="text-[8px] text-[#1e3a2b] font-bold">{expandedSubCats.includes(sub.id) ? '−' : '+'}</span>
                        </div>

                        {expandedSubCats.includes(sub.id) && (
                          <div className="pl-2 pr-1 py-0.5 space-y-0.5 border-t border-slate-200/80 bg-white">
                            {sub.reports.filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase())).map((r) => (
                              <button
                                key={r.code}
                                type="button"
                                onClick={() => {
                                  setActiveReport({ ...r, category: `${cat.title} - ${sub.title}` });
                                  setTransactionSubType(r.title);
                                }}
                                className={`w-full text-left px-2.5 py-1 rounded truncate block text-xs transition-all ${
                                  activeReport.code === r.code ? 'bg-[#1e3a2b] text-white font-bold' : 'hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                {r.title}
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

        {/* Right Canvas: AUTHENTIC A4 MATRIX */}
        <main className="flex-1 overflow-y-auto custom-scrollbar flex justify-center print:overflow-visible print:p-0 print:m-0">
          
          <div
            id="isolated-a4-print-sheet"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-[794px] min-h-[1123px] page-break-after-always relative bg-white p-8 text-black font-sans border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 print:p-6 print:transform-none select-none"
          >
            
            {/* 1. SALES SUMMARY (REP_F_101 / REP_S_00020) */}
            {activeReport.code === 'REP_F_101' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start text-xs font-bold">
                  <span>Southern Olive Oil Products</span>
                  <span className="text-base font-bold text-slate-900">Statistics Summary Report</span>
                  <span></span>
                </div>
                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>02-Sep-2026</span><span>Year: 2026 - Month: 8</span><span>Page 1 of 1</span>
                </div>
                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-black font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[35%]">Description</th>
                      <th className="py-1.5 px-1 normal-case w-[13%] text-right">Mode 1</th>
                      <th className="py-1.5 px-1 normal-case w-[13%] text-right">Mode 2</th>
                      <th className="py-1.5 px-1 normal-case w-[13%] text-right">Mode 3</th>
                      <th className="py-1.5 px-1 normal-case w-[13%] text-right">Mode 4</th>
                      <th className="py-1.5 px-1 normal-case w-[13%] text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                    <tr><td colSpan={6} className="py-1 font-bold underline font-sans bg-slate-50">Branch: Southern Olive Oil Products - Choueifat</td></tr>
                    <tr><td colSpan={6} className="py-0.5 font-bold font-sans text-slate-800 pl-2">Department: MAIN DEPARTMENT</td></tr>
                    <tr><td className="font-sans">Gross Sales</td><td className="text-right">1,620,025,450.0</td><td className="text-right">0.000</td><td className="text-right">0.000</td><td className="text-right">0.000</td><td className="text-right font-bold">1,620,025,450.000</td></tr>
                    <tr><td className="font-sans">Discount</td><td className="text-right">58,780,450.000</td><td className="text-right">0.000</td><td className="text-right">0.000</td><td className="text-right">0.000</td><td className="text-right font-bold">58,780,450.000</td></tr>
                    <tr><td className="font-sans">Net Sales</td><td className="text-right">1,561,245,000.0</td><td className="text-right">0.000</td><td className="text-right">0.000</td><td className="text-right">0.000</td><td className="text-right font-bold">1,561,245,000.000</td></tr>
                    <tr><td className="font-sans">Number of Customers</td><td className="text-right">366</td><td className="text-right">0</td><td className="text-right">0</td><td className="text-right">0</td><td className="text-right font-bold">366</td></tr>
                    <tr><td colSpan={6} className="py-0.5 font-bold font-sans text-slate-800 pl-2 pt-2 border-t border-slate-300">Consolidation by branch</td></tr>
                    <tr className="font-bold"><td className="font-sans">Gross Sales</td><td className="text-right">1,868,425,450.0</td><td className="text-right">0.000</td><td className="text-right">0.000</td><td className="text-right">0.000</td><td className="text-right">1,868,425,450.000</td></tr>
                    <tr className="font-bold"><td className="font-sans">Net Sales</td><td className="text-right">1,809,645,000.0</td><td className="text-right">0.000</td><td className="text-right">0.000</td><td className="text-right">0.000</td><td className="text-right">1,809,645,000.000</td></tr>
                  </tbody>
                </table>
                <div className="absolute bottom-6 left-8 right-8 border-t border-black pt-2 flex justify-between items-center text-[10px] text-slate-600 font-mono">
                  <span>REP_S_00020</span><span>Copyright © 2026 Southern Olive Oil Products S.A.R.L. All Rights Reserved.</span><span>Page 1 of 1</span>
                </div>
              </div>
            )}

            {/* 2. STATISTICS BY WORKSTATION (REP_F_102 / REP_S_00192) */}
            {activeReport.code === 'REP_F_102' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start text-xs font-bold">
                  <span>Southern Olive Oil Products</span>
                  <span className="text-base font-bold text-slate-900">Statistics by workstation</span>
                  <span></span>
                </div>
                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>02-Sep-26</span><span>From Date: 01-Aug-2026 To Date: 31-Aug-2026</span><span>Page 1 of 2</span>
                </div>
                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-black font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[35%]">Description</th>
                      <th className="py-1.5 px-1 normal-case w-[13%] text-right">Mode 1</th>
                      <th className="py-1.5 px-1 normal-case w-[13%] text-right">Mode 2</th>
                      <th className="py-1.5 px-1 normal-case w-[13%] text-right">Mode 3</th>
                      <th className="py-1.5 px-1 normal-case w-[13%] text-right">Mode 4</th>
                      <th className="py-1.5 px-1 normal-case w-[13%] text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                    <tr><td colSpan={6} className="py-1 font-bold underline font-sans bg-slate-50">Branch: Southern Olive Oil Products</td></tr>
                    <tr><td colSpan={6} className="py-0.5 font-bold font-sans text-slate-800 pl-2">Workstation: 1 (MAIN DEPARTMENT)</td></tr>
                    <tr><td className="font-sans">Gross Sales</td><td className="text-right">1,674,275,450.00</td><td className="text-right">0.00</td><td className="text-right">0.00</td><td className="text-right">0.00</td><td className="text-right font-bold">1,674,275,450.00</td></tr>
                    <tr><td className="font-sans">Net Sales</td><td className="text-right">1,615,315,000.00</td><td className="text-right">0.00</td><td className="text-right">0.00</td><td className="text-right">0.00</td><td className="text-right font-bold">1,615,315,000.00</td></tr>
                    <tr><td colSpan={6} className="py-0.5 font-bold font-sans text-slate-800 pl-2 pt-2 border-t border-slate-300">Consolidation by workstation</td></tr>
                    <tr className="font-bold"><td className="font-sans">Net Sales</td><td className="text-right">1,863,715,000.00</td><td className="text-right">0.00</td><td className="text-right">0.00</td><td className="text-right">0.00</td><td className="text-right">1,863,715,000.00</td></tr>
                  </tbody>
                </table>
                <div className="absolute bottom-6 left-8 right-8 border-t border-black pt-2 flex justify-between items-center text-[10px] text-slate-600 font-mono">
                  <span>REP_S_00192</span><span>Copyright © 2026 Southern Olive Oil Products S.A.R.L. All Rights Reserved.</span><span>Page 1 of 2</span>
                </div>
              </div>
            )}

            {/* 3. PRODUCT SALES: SUMMARY OF SALES BY ITEMS (REP_P_101) */}
            {activeReport.code.startsWith('REP_P_') && (
              <div className="space-y-4">
                <div className="text-center font-bold text-base text-slate-900">{activeReport.title}</div>
                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>02-Sep-2026</span><span>{dynamicPeriodInfo.header}</span><span>Page 1 of 1</span>
                </div>
                <table className="w-full table-fixed text-left border-collapse text-[10.5px]">
                  <thead>
                    <tr className="border-b border-black bg-slate-100 font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[14%]">Item Code</th>
                      <th className="py-1.5 px-1 normal-case w-[36%]">Description</th>
                      <th className="py-1.5 px-1 normal-case w-[12%]">Unit</th>
                      <th className="py-1.5 px-1 normal-case w-[10%] text-center">Qty Sold</th>
                      <th className="py-1.5 px-1 normal-case w-[14%] text-right">Gross (LBP)</th>
                      <th className="py-1.5 px-1 normal-case w-[14%] text-right">Net Sales (LBP)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                    {productSalesRows.map((p) => (
                      <tr key={p.code} className="hover:bg-slate-50">
                        <td className="py-1.5 px-1 font-bold text-slate-900">{p.code}</td>
                        <td className="py-1.5 px-1 font-sans font-medium text-slate-800">{p.name}</td>
                        <td className="py-1.5 px-1 font-sans">{p.unit}</td>
                        <td className="py-1.5 px-1 text-center font-bold">{p.qty}</td>
                        <td className="py-1.5 px-1 text-right">{p.gross.toLocaleString('en-US')}</td>
                        <td className="py-1.5 px-1 text-right font-bold text-[#1e3a2b]">{p.net.toLocaleString('en-US')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pt-4 border-t-2 border-black flex justify-between font-mono font-bold text-xs">
                  <span>Total Quantity Sold: {productSalesRows.reduce((a, b) => a + b.qty, 0)} Units</span>
                  <span>Total Net Revenue: {productSalesRows.reduce((a, b) => a + b.net, 0).toLocaleString('en-US')} LBP</span>
                </div>
                <div className="absolute bottom-6 left-8 right-8 border-t border-black pt-2 flex justify-between items-center text-[10px] text-slate-600 font-mono">
                  <span>REP_S_00191</span><span>Copyright © 2026 Southern Olive Oil Products S.A.R.L. All Rights Reserved.</span><span>Page 1 of 1</span>
                </div>
              </div>
            )}

            {/* 4. CUSTOMER SALES: (REP_C_...) */}
            {activeReport.code.startsWith('REP_C_') && (
              <div className="space-y-4">
                <div className="text-center font-bold text-base text-slate-900">{activeReport.title}</div>
                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>02-Sep-2026</span><span>{dynamicPeriodInfo.header}</span><span>Page 1 of 1</span>
                </div>
                <table className="w-full table-fixed text-left border-collapse text-[10.5px]">
                  <thead>
                    <tr className="border-b border-black bg-slate-100 font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[14%]">Cust #</th>
                      <th className="py-1.5 px-1 normal-case w-[28%]">Customer / Enterprise</th>
                      <th className="py-1.5 px-1 normal-case w-[18%]">Delivery Zone</th>
                      <th className="py-1.5 px-1 normal-case w-[8%] text-center">Invoices</th>
                      <th className="py-1.5 px-1 normal-case w-[16%] text-right">Total (LBP)</th>
                      <th className="py-1.5 px-1 normal-case w-[16%] text-right">Assigned Rep</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
                    {customerSalesRows.map((c) => (
                      <tr key={c.code} className="hover:bg-slate-50">
                        <td className="py-1.5 px-1 font-mono font-bold">{c.code}</td>
                        <td className="py-1.5 px-1 font-bold text-slate-900">{c.name}</td>
                        <td className="py-1.5 px-1 text-slate-700">{c.zone}</td>
                        <td className="py-1.5 px-1 text-center font-mono">{c.ordersCount}</td>
                        <td className="py-1.5 px-1 text-right font-mono font-bold text-[#1e3a2b]">{c.totalLbp.toLocaleString('en-US')}</td>
                        <td className="py-1.5 px-1 text-right text-slate-800">{c.rep}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="absolute bottom-6 left-8 right-8 border-t border-black pt-2 flex justify-between items-center text-[10px] text-slate-600 font-mono">
                  <span>REP_S_00130</span><span>Copyright © 2026 Southern Olive Oil Products S.A.R.L. All Rights Reserved.</span><span>Page 1 of 1</span>
                </div>
              </div>
            )}

            {/* 5. INTERNAL CONTROL: (REP_IC_001 TO REP_IC_008) */}
            {activeReport.code === 'REP_IC_001' && (
              <div className="space-y-4">
                <div className="text-center font-bold text-base text-slate-900">Summary of voids</div>
                <div className="text-right text-[10.5px] font-mono text-slate-700 -mt-3">Prepared By: Mohammed Jichi</div>
                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>02-Sep-2026</span><span>{dynamicPeriodInfo.header}</span><span>Page 1 of 1</span>
                </div>
                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-black font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[14%]">Date</th>
                      <th className="py-1.5 px-1 normal-case w-[14%]">Order Date</th>
                      <th className="py-1.5 px-1 normal-case w-[12%]">Server</th>
                      <th className="py-1.5 px-1 normal-case w-[10%]">Invoice</th>
                      <th className="py-1.5 px-1 normal-case w-[26%]">Description</th>
                      <th className="py-1.5 px-1 normal-case w-[6%] text-center">QTY</th>
                      <th className="py-1.5 px-1 normal-case w-[10%] text-right">Value</th>
                      <th className="py-1.5 px-1 normal-case w-[8%]">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr><td colSpan={8} className="py-1.5 px-1 font-bold underline bg-slate-50/50">Branch: Southern Olive Oil Products S.A.R.L - Choueifat</td></tr>
                    <tr className="align-top leading-normal">
                      <td className="py-1 px-1 font-mono text-[10px]">22-Aug-2026 5:31 PM</td>
                      <td className="py-1 px-1 font-mono text-[10px]">22-Aug-2026 5:31 PM</td>
                      <td className="py-1 px-1">Hiba Aloulou</td>
                      <td className="py-1 px-1 font-mono font-bold">103225</td>
                      <td className="py-1 px-1 font-bold">عرض العطاء جديد - زيت زيتون 17.5L</td>
                      <td className="py-1 px-1 text-center font-mono">1.00</td>
                      <td className="py-1 px-1 text-right font-mono font-bold">9,000,000.00</td>
                      <td className="py-1 px-1 text-[10px]">تعداد خاطئ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* DEFAULT REINFORCED A4 FOOTER */}
            <div className="absolute bottom-6 left-8 right-8 border-t border-black pt-2 flex justify-between items-center text-[10px] text-slate-600 font-mono">
              <span>Vanguard ERP Master Reporting System</span>
              <span>Southern Olive Oil Products S.A.R.L - Confidential</span>
              <span>Page 1 of 1</span>
            </div>

          </div>

        </main>

      </div>

    </div>
  );
}
