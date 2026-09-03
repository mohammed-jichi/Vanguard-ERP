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
    setExpandedCats((prev) => (prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]));
  };

  const toggleSubCat = (id: string) => {
    setExpandedSubCats((prev) => (prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]));
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

  return (
    <div className="w-full flex flex-col h-[calc(100vh-80px)] select-none text-left font-sans print:h-auto print:overflow-visible">
      
      {/* BULLETPROOF INLINE A4 PRINT CSS */}
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

      {/* 1. TOP SUB-HEADER BAR */}
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

      {/* 3. WORKSPACE & DYNAMIC A4 PRINT ENGINE */}
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
                            {sub.reports.filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase())).map((sr) => (
                              <button
                                key={sr.code}
                                type="button"
                                onClick={() => {
                                  setActiveReport({ ...sr, category: `${cat.title} - ${sub.title}` });
                                  setTransactionSubType(sr.title);
                                }}
                                className={`w-full text-left px-2.5 py-1 rounded truncate block text-xs transition-all ${
                                  activeReport.code === sr.code ? 'bg-[#1e3a2b] text-white font-bold' : 'hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                {sr.title}
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
            
            {/* =============================================================== */}
            {/* A. INTERNAL CONTROL: ALL 8 VERIFIED REPORTS                      */}
            {/* =============================================================== */}

            {/* 1. Summary of voids (REP_IC_001) */}
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

            {/* 2. Summary & Details of refunds (REP_IC_002) */}
            {activeReport.code === 'REP_IC_002' && (
              <div className="space-y-6">
                <div className="text-center font-bold text-base text-slate-900">Details of refunds</div>
                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>02-Sep-2026</span><span>{dynamicPeriodInfo.header}</span><span>Page 1 of 3</span>
                </div>
                <div className="space-y-2 border-b border-slate-200 pb-4">
                  <div className="flex justify-between items-start text-[11px] font-mono">
                    <div className="space-y-0.5">
                      <div><strong className="underline">Branch Name:</strong> Southern Olive Oil Products - Choueifat</div>
                      <div><strong>EOD Date:</strong> 11-08-2026</div>
                      <div><strong>Invoice Number:</strong> 103098</div>
                    </div>
                    <div><strong>Customer:</strong> null null</div>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between font-bold border-b border-slate-300 pb-1 text-xs"><span>QTY Description</span><span>Total Price</span></div>
                    <div className="flex justify-between py-1 text-xs font-mono font-bold text-red-700"><span>-0.90 كزبرة ناعم كيلو</span><span>-630,000.00</span></div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <div className="w-56 text-[11px] font-mono space-y-0.5">
                      <div className="flex justify-between"><span>Sub Total:</span> <strong className="text-red-700">-630,000.00</strong></div>
                      <div className="flex justify-between text-slate-500"><span>Discount:</span> <span>0.00</span></div>
                      <div className="flex justify-between text-slate-500"><span>Tax:</span> <span>0.00</span></div>
                      <div className="flex justify-between border-t border-black pt-0.5 font-bold"><span>Grand Total:</span> <strong className="text-red-700">-630,000.00</strong></div>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t-2 border-black flex justify-between items-end">
                  <div className="text-[10.5px] font-mono text-slate-600"><div>Printed: 02-Sep-2026</div><div>{dynamicPeriodInfo.header}</div></div>
                  <div className="w-64 text-xs font-mono space-y-1 bg-slate-50 p-2.5 rounded border border-slate-200">
                    <div className="flex justify-between"><span>Sub Total:</span> <strong className="text-red-700">-990,000.00</strong></div>
                    <div className="flex justify-between border-t border-black pt-1 font-bold text-sm"><span>Grand Total:</span> <strong className="text-red-700">-990,000.00</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Duplicate Invoices & All 13 Transaction Sub-Modes (REP_IC_003) */}
            {activeReport.code === 'REP_IC_003' && (
              <div className="space-y-3">
                <div className="text-blue-700 font-bold text-xs">Southern Olive Oil Products - Choueifat</div>
                <div className="text-center font-bold text-sm text-slate-900 -mt-2">
                  {transactionSubType === 'Duplicate Invoices' ? 'Duplicate Invoices Report' : transactionSubType}
                </div>
                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>02-Sep-2026</span><span>{dynamicPeriodInfo.header}</span><span>Page 1 of 1</span>
                </div>

                {/* Sub-Mode 1: Transactions by date (REP_S_00002) */}
                {transactionSubType === 'Transactions by date' && (
                  <table className="w-full table-fixed text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b border-black font-bold text-black leading-tight">
                        <th className="py-1 px-0.5 normal-case w-[12%]">Date</th>
                        <th className="py-1 px-0.5 normal-case w-[7%]">Time</th>
                        <th className="py-1 px-0.5 normal-case w-[9%]">Invoice #</th>
                        <th className="py-1 px-0.5 normal-case w-[8%]">Cust_ID</th>
                        <th className="py-1 px-0.5 normal-case w-[14%]">Customer Name</th>
                        <th className="py-1 px-0.5 normal-case w-[7%] text-center">Order #</th>
                        <th className="py-1 px-0.5 normal-case w-[13%] text-right">SubTotal</th>
                        <th className="py-1 px-0.5 normal-case w-[11%] text-right">Discount</th>
                        <th className="py-1 px-0.5 normal-case w-[5%] text-right">Tax</th>
                        <th className="py-1 px-0.5 normal-case w-[9%]">Pay Type</th>
                        <th className="py-1 px-0.5 normal-case w-[14%] text-right">Total</th>
                        {showRateFilter && <th className="py-1 px-0.5 normal-case w-[10%] text-right">Rate</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-[9.5px]">
                      <tr><td colSpan={showRateFilter ? 12 : 11} className="py-1 px-0.5 font-bold underline bg-slate-50/50">Branch : Southern Olive Oil Products - Choueifat</td></tr>
                      <tr className="align-top leading-tight hover:bg-slate-50">
                        <td className="py-1 px-0.5 font-mono">11-Aug-2026</td><td className="py-1 px-0.5 font-mono">18:56</td>
                        <td className="py-1 px-0.5 font-mono font-bold">103098</td><td className="py-1 px-0.5 font-mono text-slate-400">-</td>
                        <td className="py-1 px-0.5 text-slate-400">-</td><td className="py-1 px-0.5 text-center font-mono">1</td>
                        <td className="py-1 px-0.5 text-right font-mono text-red-700">-630,000.00</td>
                        <td className="py-1 px-0.5 text-right font-mono text-red-700">0.00</td>
                        <td className="py-1 px-0.5 text-right font-mono">0.00</td><td className="py-1 px-0.5 font-mono font-bold">CASH</td>
                        <td className="py-1 px-0.5 text-right font-mono font-bold text-red-700">-630,000.00</td>
                        {showRateFilter && <td className="py-1 px-0.5 text-right font-mono font-bold">90,000.00</td>}
                      </tr>
                    </tbody>
                  </table>
                )}

                {/* Sub-Mode 2: Duplicate Invoices Default (REP_S_00428) */}
                {transactionSubType === 'Duplicate Invoices' && (
                  <table className="w-full table-fixed text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b border-black font-bold text-black leading-tight">
                        <th className="py-1 px-0.5 normal-case w-[10%]">Invoice #</th>
                        <th className="py-1 px-0.5 normal-case w-[12%]">Date</th>
                        <th className="py-1 px-0.5 normal-case w-[8%]">Time</th>
                        <th className="py-1 px-0.5 normal-case w-[8%] text-center">Order #</th>
                        <th className="py-1 px-0.5 normal-case w-[8%]">Cust. #</th>
                        <th className="py-1 px-0.5 normal-case w-[16%] text-right">Amount</th>
                        <th className="py-1 px-0.5 normal-case w-[12%] text-right">Discount</th>
                        <th className="py-1 px-0.5 normal-case w-[12%]">TaxPay Type</th>
                        <th className="py-1 px-0.5 normal-case w-[14%] text-right">TotalPrint#</th>
                        {showRateFilter && <th className="py-1 px-0.5 normal-case w-[10%] text-right">Rate</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-[9.5px]">
                      <tr><td colSpan={showRateFilter ? 10 : 9} className="py-1 px-0.5 font-bold underline bg-slate-50">Branch: Southern Olive Oil Products</td></tr>
                      <tr><td colSpan={showRateFilter ? 10 : 9} className="py-0.5 px-0.5 font-bold text-slate-700 pl-2">Sale Date: 2026-08-01</td></tr>
                      <tr>
                        <td className="py-0.5 px-0.5 font-mono font-bold">102971</td><td className="py-0.5 px-0.5 font-mono">01-Aug-2026</td><td className="py-0.5 px-0.5 font-mono">10:57</td><td className="py-0.5 px-0.5 text-center font-mono">1</td>
                        <td className="py-0.5 px-0.5 font-mono text-slate-400">-</td><td className="py-0.5 px-0.5 text-right font-mono">1260000.00</td><td className="py-0.5 px-0.5 text-right font-mono">0.00</td>
                        <td className="py-0.5 px-0.5 font-mono">0.00CASH</td><td className="py-0.5 px-0.5 text-right font-mono font-bold">1260000.002</td>
                        {showRateFilter && <td className="py-0.5 px-0.5 text-right font-mono font-bold">90,000.00</td>}
                      </tr>
                    </tbody>
                  </table>
                )}

                {/* Sub-Mode 3: Transactions by employees by payment (REP_S_00131) */}
                {transactionSubType === 'Transactions by employees by payment' && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono">
                      <div><strong>Branch:</strong> Southern Olive Oil Products</div>
                      <div><strong>Sale Date:</strong> 2026-08-01</div>
                      <div><strong>Employee Name:</strong> Hiba Aloulou | <strong>Payment Type:</strong> CASH</div>
                    </div>
                    <table className="w-full table-fixed text-left border-collapse text-[10px]">
                      <thead><tr className="border-b border-black font-bold bg-slate-50"><th className="py-1 px-1 normal-case w-[20%]">Invoice#</th><th className="py-1 px-1 normal-case w-[25%]">Date</th><th className="py-1 px-1 normal-case w-[20%]">Time</th><th className="py-1 px-1 normal-case w-[15%] text-center">Table#</th><th className="py-1 px-1 normal-case w-[20%] text-right">Amount</th></tr></thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[9.5px]">
                        <tr><td className="py-1 px-1 font-bold">102971</td><td>01-Aug-2026</td><td>10.57 AM</td><td className="text-center">0</td><td className="text-right font-bold">1,260,000.00</td></tr>
                        <tr><td className="py-1 px-1 font-bold">102974</td><td>01-Aug-2026</td><td>11.50 AM</td><td className="text-center">0</td><td className="text-right font-bold">8,100,000.00</td></tr>
                      </tbody>
                    </table>
                    <div className="text-right font-mono font-bold text-xs pt-1 border-t border-black">Total Branch: 1,809,645,000.00 LBP</div>
                  </div>
                )}

                {/* Sub-Mode 4: Transactions by Customers Details (REP_S_00130_D) */}
                {transactionSubType === 'Transactions by customers details' && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono">
                      <div><strong>Customer:</strong> Hussein Daik | <strong>Date:</strong> 19-Feb-2026</div>
                    </div>
                    <table className="w-full table-fixed text-left border-collapse text-[10px]">
                      <thead><tr className="border-b border-black font-bold bg-slate-50"><th className="py-1 px-1 normal-case w-[12%]">Invoice</th><th className="py-1 px-1 normal-case w-[12%]">Date</th><th className="py-1 px-1 normal-case w-[12%]">Employee</th><th className="py-1 px-1 normal-case w-[18%] text-right">Total</th><th className="py-1 px-1 normal-case w-[46%]">Item Name</th></tr></thead>
                      <tbody className="divide-y divide-slate-100 text-[9.5px]">
                        <tr className="align-top font-mono">
                          <td className="py-1 px-1 font-bold">4000022</td><td>19-Feb-2026</td><td>Mahdi</td><td className="text-right font-bold text-emerald-800">706,968,000.00</td>
                          <td className="font-sans text-[9px] leading-tight">ألفية زيت زيتون خضير بلدي 1500 مل*6، صندوق خل أبيض 500مل*12قنينة، دبس رمان نقي 500مل*12، زعتر أحمر حلبي 500غ*12...</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="text-right font-mono font-bold text-xs pt-1 border-t border-black">Total Net Sales: 706,968,000.00 LBP</div>
                  </div>
                )}

                {/* Sub-Mode 5: Transactions by invoice number (REP_S_00003) */}
                {transactionSubType === 'Transactions by invoice number' && (
                  <table className="w-full table-fixed text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b border-black font-bold text-black leading-tight">
                        <th className="py-1 px-0.5 normal-case w-[12%]">Invoice #</th><th className="py-1 px-0.5 normal-case w-[14%]">Date</th><th className="py-1 px-0.5 normal-case w-[10%]">Time</th><th className="py-1 px-0.5 normal-case w-[20%] text-right">Amount</th><th className="py-1 px-0.5 normal-case w-[14%]">Payment</th><th className="py-1 px-0.5 normal-case w-[20%] text-right">Total</th><th className="py-1 px-0.5 normal-case w-[10%] text-center">Print #</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[9.5px]">
                      <tr><td className="py-1 px-0.5 font-bold">101720</td><td>28-Mar-2026</td><td>20:00</td><td className="text-right">2561700.0</td><td>CASH</td><td className="text-right font-bold">2,561,700.00</td><td className="text-center">1</td></tr>
                      <tr><td className="py-1 px-0.5 font-bold">101730</td><td>29-Mar-2026</td><td>15:17</td><td className="text-right">1310000.0</td><td>CASH</td><td className="text-right font-bold">1,310,000.00</td><td className="text-center">1</td></tr>
                    </tbody>
                  </table>
                )}

                {/* Other Sub-Modes Default */}
                {!['Transactions by date', 'Duplicate Invoices', 'Transactions by employees by payment', 'Transactions by customers details', 'Transactions by invoice number'].includes(transactionSubType) && (
                  <table className="w-full table-fixed text-left border-collapse text-[10.5px]">
                    <thead>
                      <tr className="border-b border-black font-bold text-black leading-tight">
                        <th className="py-1 px-1 normal-case w-[15%]">Invoice #</th><th className="py-1 px-1 normal-case w-[15%]">Date</th><th className="py-1 px-1 normal-case w-[12%]">Time</th><th className="py-1 px-1 normal-case w-[28%]">Customer / Account</th><th className="py-1 px-1 normal-case w-[15%]">Payment Method</th><th className="py-1 px-1 normal-case w-[15%] text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-[10px]">
                      <tr>
                        <td className="py-1 px-1 font-mono font-bold">INV-103349</td><td className="py-1 px-1 font-mono">01-Sep-2026</td><td className="py-1 px-1 font-mono">10:14</td><td className="py-1 px-1 font-bold">Al-Baraka Supermarket S.A.R.L</td><td className="py-1 px-1 font-semibold">CASH</td><td className="py-1 px-1 text-right font-mono font-bold text-emerald-800">9,000,000.00</td>
                      </tr>
                    </tbody>
                  </table>
                )}

                {/* Bottom Red KPIs for Duplicate Invoices & Modes */}
                <div className="pt-3 border-t border-black space-y-1 text-[10.5px] font-mono">
                  <div className="flex justify-between items-center text-red-600 font-bold border-b border-slate-200 pb-1">
                    <span>Total for: Southern Olive Oil Products</span>
                    <div className="flex gap-4"><span>Gross: 1,868,425,450.00</span><span>Disc: 58,780,450.00</span><span>Net: 1,809,645,000.00</span></div>
                  </div>
                  <div className="pt-2 max-w-[280px] space-y-0.5 text-xs">
                    <div className="flex justify-between text-red-600 font-bold"><span>Gross Sales:</span> <span>1,868,425,450.00</span></div>
                    <div className="flex justify-between text-slate-800"><span>Total Tax:</span> <span>0.00</span></div>
                    <div className="flex justify-between text-slate-800"><span>Total Discount:</span> <span>58,780,450.00</span></div>
                    <div className="flex justify-between text-red-600 font-bold"><span>Net Revenue:</span> <span>1,809,645,000.00</span></div>
                    <div className="flex justify-between text-red-600 font-bold"><span>Net Sales:</span> <span>1,809,645,000.00</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Meter reports (REP_IC_004) */}
            {activeReport.code === 'REP_IC_004' && (
              <div className="space-y-4">
                <div className="text-center font-bold text-base text-slate-900">Meter Report</div>
                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>02-Sep-2026</span><span>{dynamicPeriodInfo.header}</span><span>Page 1 of 1</span>
                </div>
                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-black font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[28%]">Branch Name</th><th className="py-1.5 px-1 normal-case w-[28%]">Date</th><th className="py-1.5 px-1 normal-case w-[22%]">By Employee</th><th className="py-1.5 px-1 normal-case w-[22%]">To Employee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
                    <tr><td colSpan={4} className="py-1 font-bold underline bg-slate-50">Branch: Southern Olive Oil Products</td></tr>
                    <tr><td colSpan={4} className="py-1 font-bold text-slate-700 pl-2">EOD Date 17-Dec-2025</td></tr>
                    <tr><td className="py-0.5 px-1">Choueifat Facility</td><td className="py-0.5 px-1 font-mono">17-12-2025 00.00.00</td><td className="py-0.5 px-1">Mahdi</td><td className="py-0.5 px-1 font-semibold">Server Mahdi</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* 5. No sale (REP_IC_005) */}
            {activeReport.code === 'REP_IC_005' && (
              <div className="space-y-4">
                <div className="text-center font-bold text-base text-slate-900">No Sale Report</div>
                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>02-Sep-2026</span><span>{dynamicPeriodInfo.header}</span><span>Page 1 of 1</span>
                </div>
                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-black font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[40%]">Employee Name</th><th className="py-1.5 px-1 normal-case w-[35%]">Date</th><th className="py-1.5 px-1 normal-case w-[25%] text-right">Workstation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
                    <tr><td colSpan={3} className="py-1 font-bold underline bg-slate-50">Branch Name: Southern Olive Oil Products</td></tr>
                    <tr><td colSpan={3} className="py-1 font-bold text-slate-700 pl-4">EOD Date: 01-Jan-26</td></tr>
                    <tr><td className="py-1 px-1 font-semibold">Ricky</td><td className="py-1 px-1 font-mono">01/01/2026 6.23 PM</td><td className="py-1 px-1 text-right font-mono font-bold">1</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* 6. Transactions on hold (REP_IC_006) */}
            {activeReport.code === 'REP_IC_006' && (
              <div className="space-y-4">
                <div className="text-center font-bold text-base text-slate-900">History of Transactions on Hold</div>
                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>02-Sep-2026</span><span>{dynamicPeriodInfo.header}</span><span>Page 1 of 2</span>
                </div>
                <div className="border-b border-slate-300 pb-2 text-[11px] font-mono space-y-1">
                  <div><strong>Workstation :</strong> 1 Showroom 1 | <strong>Date:</strong> 14 December 2025</div>
                  <div className="flex gap-6 text-slate-700"><span><strong>Employee ID:</strong> 2</span><span><strong>Employee Name:</strong> Cashier R</span></div>
                </div>
                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-black font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[24%]">Date</th><th className="py-1.5 px-1 normal-case w-[40%]">Qty Description</th><th className="py-1.5 px-1 normal-case w-[18%] text-right">Unit Price</th><th className="py-1.5 px-1 normal-case w-[18%] text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[10.5px] font-mono">
                    <tr><td className="py-1 px-1">14/12/2025 13.39.32</td><td className="py-1 px-1 font-bold">1.0 حليب تاترا 400 غ</td><td className="py-1 px-1 text-right">340000.0</td><td className="py-1 px-1 text-right font-bold">340000.0</td></tr>
                  </tbody>
                </table>
                <div className="border-t border-black pt-2 flex justify-end font-mono font-bold text-xs"><span>Amount : 1,435,000.0 LBP</span></div>
              </div>
            )}

            {/* 7. User log report (REP_IC_007) */}
            {activeReport.code === 'REP_IC_007' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start text-xs font-bold"><span>Southern Olive Oil Products</span><span className="text-base">User Log Report</span><span></span></div>
                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>02-Sep-2026</span><span>{dynamicPeriodInfo.header}</span><span>Page 1 of 29</span>
                </div>
                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-black font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[18%]">User</th><th className="py-1.5 px-1 normal-case w-[16%]">Date</th><th className="py-1.5 px-1 normal-case w-[16%]">Module</th><th className="py-1.5 px-1 normal-case w-[28%]">Action</th><th className="py-1.5 px-1 normal-case w-[12%]">Computer Name</th><th className="py-1.5 px-1 normal-case w-[10%] text-right">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
                    <tr><td colSpan={6} className="py-1 font-bold underline bg-slate-50">Branch : Southern Olive Oil Products</td></tr>
                    <tr><td colSpan={6} className="py-1 font-bold text-slate-800 pl-2">Module : Adjustment</td></tr>
                    <tr><td className="py-0.5 px-1 font-bold">Mohammed Jichi</td><td className="py-0.5 px-1 font-mono">01-Aug-2026</td><td className="py-0.5 px-1">Adjustment</td><td className="py-0.5 px-1 text-emerald-800 font-bold">Save & Post</td><td className="py-0.5 px-1 font-mono">POS-DESK-01</td><td className="py-0.5 px-1 text-right font-mono font-bold">41</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* 8. Discount summary (REP_IC_008) */}
            {activeReport.code === 'REP_IC_008' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start text-xs font-bold"><span className="text-blue-800">Southern Olive Oil Products</span><span className="text-base text-slate-900">Discount Summary</span><span></span></div>
                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>02-Sep-2026</span><span>Year: 2026 - All Months</span><span>Page 1 of 1</span>
                </div>
                <div className="max-w-md">
                  <table className="w-full table-fixed text-left border border-black border-collapse text-xs">
                    <thead><tr className="border-b border-black font-bold bg-slate-100"><th className="py-1.5 px-2 border-r border-black w-[55%]"></th><th className="py-1.5 px-2 text-right font-bold w-[45%]">Total Discount</th></tr></thead>
                    <tbody className="font-mono text-xs divide-y divide-black">
                      <tr><td className="py-1.5 px-2 border-r border-black font-bold font-sans">Southern Olive Oil Products</td><td className="py-1.5 px-2 text-right font-bold">104,813,558.18</td></tr>
                      <tr className="bg-blue-100/70 font-bold"><td className="py-1.5 px-2 border-r border-black font-sans">Total</td><td className="py-1.5 px-2 text-right">104,813,558.18</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* B. FINANCIAL REPORTS: (REP_F_101 & REP_F_102)                    */}
            {/* =============================================================== */}
            {activeReport.code === 'REP_F_101' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start text-xs font-bold"><span>Southern Olive Oil Products</span><span className="text-base font-bold text-slate-900">Statistics Summary Report</span><span></span></div>
                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>02-Sep-2026</span><span>Year: 2026 - Month: 8</span><span>Page 1 of 1</span>
                </div>
                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-black font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[35%]">Description</th><th className="py-1.5 px-1 normal-case w-[13%] text-right">Mode 1</th><th className="py-1.5 px-1 normal-case w-[13%] text-right">Mode 2</th><th className="py-1.5 px-1 normal-case w-[13%] text-right">Mode 3</th><th className="py-1.5 px-1 normal-case w-[13%] text-right">Mode 4</th><th className="py-1.5 px-1 normal-case w-[13%] text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                    <tr><td colSpan={6} className="py-1 font-bold underline font-sans bg-slate-50">Branch: Southern Olive Oil Products - Choueifat</td></tr>
                    <tr><td colSpan={6} className="py-0.5 font-bold font-sans text-slate-800 pl-2">Department: MAIN DEPARTMENT</td></tr>
                    <tr><td className="font-sans">Gross Sales</td><td className="text-right">1,620,025,450.0</td><td className="text-right">0.000</td><td className="text-right">0.000</td><td className="text-right">0.000</td><td className="text-right font-bold">1,620,025,450.000</td></tr>
                    <tr><td className="font-sans">Net Sales</td><td className="text-right">1,561,245,000.0</td><td className="text-right">0.000</td><td className="text-right">0.000</td><td className="text-right">0.000</td><td className="text-right font-bold">1,561,245,000.000</td></tr>
                    <tr><td colSpan={6} className="py-0.5 font-bold font-sans text-slate-800 pl-2 pt-2 border-t border-slate-300">Consolidation by branch</td></tr>
                    <tr className="font-bold"><td className="font-sans">Net Sales</td><td className="text-right">1,809,645,000.0</td><td className="text-right">0.000</td><td className="text-right">0.000</td><td className="text-right">0.000</td><td className="text-right">1,809,645,000.000</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeReport.code === 'REP_F_102' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start text-xs font-bold"><span>Southern Olive Oil Products</span><span className="text-base font-bold text-slate-900">Statistics by workstation</span><span></span></div>
                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>02-Sep-26</span><span>From Date: 01-Aug-2026 To Date: 31-Aug-2026</span><span>Page 1 of 2</span>
                </div>
                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-black font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[35%]">Description</th><th className="py-1.5 px-1 normal-case w-[13%] text-right">Mode 1</th><th className="py-1.5 px-1 normal-case w-[13%] text-right">Mode 2</th><th className="py-1.5 px-1 normal-case w-[13%] text-right">Mode 3</th><th className="py-1.5 px-1 normal-case w-[13%] text-right">Mode 4</th><th className="py-1.5 px-1 normal-case w-[13%] text-right">Total</th>
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
              </div>
            )}

            {/* =============================================================== */}
            {/* C. DEFAULT CARRIER FOR ALL OTHER FINANCIAL / LIST REPORTS        */}
            {/* =============================================================== */}
            {!activeReport.code.startsWith('REP_IC_') && activeReport.code !== 'REP_F_101' && activeReport.code !== 'REP_F_102' && (
              <div className="space-y-4">
                <div className="text-center font-bold text-base text-slate-900">{activeReport.title}</div>
                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>02-Sep-2026</span><span>{dynamicPeriodInfo.header}</span><span>Page 1 of 1</span>
                </div>
                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-black bg-slate-100 font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[15%]">Invoice / Code</th>
                      <th className="py-1.5 px-1 normal-case w-[15%]">Date</th>
                      <th className="py-1.5 px-1 normal-case w-[35%]">Description / Account</th>
                      <th className="py-1.5 px-1 normal-case w-[15%]">Category / Branch</th>
                      <th className="py-1.5 px-1 normal-case w-[20%] text-right">Total (LBP)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[10.5px]">
                    <tr>
                      <td className="py-2 px-1 font-bold text-slate-900">INV-103350</td>
                      <td className="py-2 px-1 text-slate-600">01-Sep-2026</td>
                      <td className="py-2 px-1 font-sans text-slate-800 font-medium">Colonel Mahmoud Abboud (Choueifat)</td>
                      <td className="py-2 px-1 font-sans text-slate-600">Main Facility</td>
                      <td className="py-2 px-1 text-right font-bold text-emerald-800">248,400,000.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* REINFORCED A4 FOOTER */}
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
