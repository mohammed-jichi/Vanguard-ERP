'use client';

import React, { useState } from 'react';
import {
  branchesList,
  getEodDateOptions,
  getDynamicPeriodInfo,
  masterCatalog,
  getAllFlattenedReports,
} from './report-data';

interface ReportRibbonProps {
  activeReport: { code: string; title: string; category: string };
  transactionSubType: string;
  setTransactionSubType: (val: string) => void;
  periodPreset: string;
  setPeriodPreset: (val: string) => void;
  fromDate: string;
  setFromDate: (val: string) => void;
  toDate: string;
  setToDate: (val: string) => void;
  eodDate: string;
  setEodDate: (val: string) => void;
  selectedBranches: string[];
  setSelectedBranches: (val: string[]) => void;
  invoiceTypeFilter: string;
  setInvoiceTypeFilter: (val: string) => void;
  paymentTypeFilter: string;
  setPaymentTypeFilter: (val: string) => void;
  selectedInvoiceCriteria: string[];
  setSelectedInvoiceCriteria: (val: string[]) => void;
  selectedDepartments: string[];
  setSelectedDepartments: (val: string[]) => void;
  fromInvoiceNum: string;
  setFromInvoiceNum: (val: string) => void;
  toInvoiceNum: string;
  setToInvoiceNum: (val: string) => void;
  customerSearchInput: string;
  setCustomerSearchInput: (val: string) => void;
  vatNumberFilter: string;
  setVatNumberFilter: (val: string) => void;
  serverFilter: string;
  setServerFilter: (val: string) => void;
  groupedByServer: boolean;
  setGroupedByServer: (val: boolean) => void;
  realDateFilter: boolean;
  setRealDateFilter: (val: boolean) => void;
  showRateFilter: boolean;
  setShowRateFilter: (val: boolean) => void;
  groupByDateFilter: boolean;
  setGroupByDateFilter: (val: boolean) => void;
  showSummaryFilter: boolean;
  setShowSummaryFilter: (val: boolean) => void;
  showZeroTaxFilter: boolean;
  setShowZeroTaxFilter: (val: boolean) => void;
  zoomLevel: number;
  setZoomLevel: (val: number) => void;
  triggerCSVExport: () => void;
}

export default function ReportRibbon({
  activeReport,
  transactionSubType,
  setTransactionSubType,
  periodPreset,
  setPeriodPreset,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  eodDate,
  setEodDate,
  selectedBranches,
  setSelectedBranches,
  invoiceTypeFilter,
  setInvoiceTypeFilter,
  paymentTypeFilter,
  setPaymentTypeFilter,
  selectedInvoiceCriteria,
  setSelectedInvoiceCriteria,
  selectedDepartments,
  setSelectedDepartments,
  fromInvoiceNum,
  setFromInvoiceNum,
  toInvoiceNum,
  setToInvoiceNum,
  customerSearchInput,
  setCustomerSearchInput,
  vatNumberFilter,
  setVatNumberFilter,
  serverFilter,
  setServerFilter,
  groupedByServer,
  setGroupedByServer,
  realDateFilter,
  setRealDateFilter,
  showRateFilter,
  setShowRateFilter,
  groupByDateFilter,
  setGroupByDateFilter,
  showSummaryFilter,
  setShowSummaryFilter,
  showZeroTaxFilter,
  setShowZeroTaxFilter,
  zoomLevel,
  setZoomLevel,
  triggerCSVExport,
}: ReportRibbonProps) {
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [invoiceTypeDropdownOpen, setInvoiceTypeDropdownOpen] = useState(false);
  const [invoiceTypeSearch, setInvoiceTypeSearch] = useState('');
  const [invoicesCriteriaDropdownOpen, setInvoicesCriteriaDropdownOpen] = useState(false);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);

  // Settings & Custom Category Modals
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [customCategoryModalOpen, setCustomCategoryModalOpen] = useState(false);
  const [defaultDateSelection, setDefaultDateSelection] = useState('THIS_MONTH');
  const [settingsSearch, setSettingsSearch] = useState('');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategorySearch, setCustomCategorySearch] = useState('');
  const [customCategorySelectedReports, setCustomCategorySelectedReports] = useState<string[]>([]);
  const [selectedToolbarCats, setSelectedToolbarCats] = useState<string[]>(['internal_control', 'financial', 'product_sales']);
  const [expandedSettingsCats, setExpandedSettingsCats] = useState<string[]>([]);

  const eodDateOptions = getEodDateOptions();
  const dynamicPeriodInfo = getDynamicPeriodInfo(periodPreset, fromDate, toDate, eodDate);

  const is12PeriodReport =
    activeReport.code !== 'REP_IC_001' &&
    activeReport.code !== 'REP_IC_002' &&
    activeReport.code !== 'REP_IC_007' &&
    !(activeReport.code === 'REP_IC_003' && transactionSubType === 'Transactions By Source');

  const transactionReportSubTypes = [
    'Duplicate Invoices',
    'Transactions by salesman',
    'Transactions by date',
    'Transactions by employees by payment',
    'Transactions by customers by employee',
    'Transactions by invoice number',
    'Transactions by date by payments',
    'Transactions by customers',
    'Transactions by customers by groups',
    'Transactions by customers details',
    'Transactions by workstation',
    'Transactions by employees',
    'Transactions By Source',
  ];

  const invoiceTypeOptions = [
    { code: 'ALL', label: 'All Invoices' },
    { code: 'INVENTORY', label: 'Inventory Invoices' },
    { code: 'POS', label: 'POS Invoices' },
    { code: 'TRAINING', label: 'Training Invoices' },
  ];

  const invoiceCriteriaList = [
    'Show refund',
    'Show zero invoices',
    'Show discount',
    'Show top 10 invoices by amount',
    'Show zero tax',
  ];

  const departmentsList = [
    { code: 'LOCAL', label: 'Local' },
    { code: 'INTERNATIONAL', label: 'International' },
    { code: 'ONLINE', label: 'Online' },
  ];

  const serverOptions = ['Cashier N2', 'Cashier NK', 'Cashier NR', 'Hiba Aloulou', 'Hussein Mahdi', 'Nour Yazbek', 'Ricky'];

  const toggleBranchSelection = (code: string) => {
    if (code === 'ALL') {
      setSelectedBranches(['ALL']);
    } else {
      let updated = selectedBranches.filter((b) => b !== 'ALL');
      if (updated.includes(code)) {
        updated = updated.filter((b) => b !== code);
        if (updated.length === 0) updated = ['ALL'];
      } else {
        updated.push(code);
      }
      setSelectedBranches(updated);
    }
  };

  const toggleDepartmentSelection = (code: string) => {
    if (code === 'ALL') {
      setSelectedDepartments(['ALL']);
    } else {
      let updated = selectedDepartments.filter((d) => d !== 'ALL');
      if (updated.includes(code)) {
        updated = updated.filter((d) => d !== code);
        if (updated.length === 0) updated = ['ALL'];
      } else {
        updated.push(code);
      }
      setSelectedDepartments(updated);
    }
  };

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

  const getSelectedInvoiceTypeLabel = () => {
    const found = invoiceTypeOptions.find((o) => o.code === invoiceTypeFilter);
    return found ? found.label : 'All Invoices';
  };

  const getDepartmentsDisplayLabel = () => {
    if (selectedDepartments.includes('ALL') || selectedDepartments.length === 0) {
      return 'Show All';
    }
    if (selectedDepartments.length === 1) {
      const found = departmentsList.find((d) => d.code === selectedDepartments[0]);
      return found ? found.label : selectedDepartments[0];
    }
    return `${selectedDepartments.length} Departments`;
  };

  const allFlattenedReports = getAllFlattenedReports();

  return (
    <div className="bg-white border-b border-slate-200 p-3 px-5 flex flex-col gap-2.5 print:hidden shrink-0 shadow-2xs">
      
      {/* TOP 13-MODE SELECTOR FOR DUPLICATE INVOICES */}
      {activeReport.code === 'REP_IC_003' && (
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Transaction Mode:</span>
            <select
              value={transactionSubType}
              onChange={(e) => setTransactionSubType(e.target.value)}
              className="px-3 py-1.5 bg-[#f8faf8] border border-[#1e3a2b]/40 rounded-lg font-bold text-xs text-[#1e3a2b] focus:outline-none min-w-[280px] shadow-2xs"
            >
              {transactionReportSubTypes.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* MAIN CONTROLS ROW */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Period Dropdown */}
          {transactionSubType !== 'Transactions by invoice number' && (
            <>
              <select
                value={periodPreset}
                onChange={(e) => setPeriodPreset(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-xs text-slate-800 focus:outline-none"
              >
                <option value="LAST_MONTH">Last Month</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="TODAY">Today</option>
                <option value="YESTERDAY">Yesterday</option>
                {is12PeriodReport && (
                  <>
                    <option value="Q1">First Quarter (Q1)</option>
                    <option value="Q2">Second Quarter (Q2)</option>
                    <option value="Q3">Third Quarter (Q3)</option>
                    <option value="Q4">Fourth Quarter (Q4)</option>
                    <option value="THIS_YEAR">This Year</option>
                    <option value="LAST_YEAR">Last Year</option>
                  </>
                )}
                <option value="DATE_RANGE">Date Range</option>
                <option value="EOD_DATE">EOD Date</option>
              </select>

              {periodPreset !== 'DATE_RANGE' && periodPreset !== 'EOD_DATE' && (
                <input
                  type="text"
                  readOnly
                  disabled
                  value={dynamicPeriodInfo.chip}
                  className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-not-allowed text-center min-w-[110px]"
                />
              )}

              {periodPreset === 'DATE_RANGE' && (
                <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded border border-slate-300">
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono" />
                  <span className="text-slate-400 font-bold">➔</span>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono" />
                </div>
              )}

              {periodPreset === 'EOD_DATE' && (
                <select value={eodDate} onChange={(e) => setEodDate(e.target.value)} className="px-2 py-1.5 bg-white border border-slate-300 rounded font-mono text-xs max-w-[220px]">
                  {eodDateOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}
            </>
          )}

          {/* Branches Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-xs text-slate-800 flex items-center justify-between gap-2 min-w-[140px] focus:outline-none"
            >
              <span>{getBranchesDisplayLabel()}</span>
              <span className="text-[9px] text-slate-500">▼</span>
            </button>

            {branchDropdownOpen && (
              <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-300 rounded-xl shadow-xl py-1.5 text-xs text-slate-800 z-50">
                <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 cursor-pointer font-bold border-b border-slate-100">
                  <input type="checkbox" checked={selectedBranches.includes('ALL')} onChange={() => toggleBranchSelection('ALL')} className="accent-[#1e3a2b]" />
                  <span>All Operating Branches ({branchesList.length})</span>
                </label>
                <div className="max-h-48 overflow-y-auto custom-scrollbar py-1">
                  {branchesList.map((b) => (
                    <label key={b.id} className="flex items-center gap-2 px-3 py-1 hover:bg-slate-50 cursor-pointer text-slate-700">
                      <input type="checkbox" checked={selectedBranches.includes(b.code)} onChange={() => toggleBranchSelection(b.code)} className="accent-[#1e3a2b]" />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Invoice Number Range */}
          {activeReport.code === 'REP_IC_003' && transactionSubType === 'Transactions by invoice number' && (
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-300">
              <span className="text-slate-500 font-semibold text-xs">From #:</span>
              <input type="text" value={fromInvoiceNum} onChange={(e) => setFromInvoiceNum(e.target.value)} placeholder="101720" className="w-20 px-2 py-0.5 bg-white border border-slate-300 rounded font-mono text-xs" />
              <span className="text-slate-500 font-semibold text-xs">To #:</span>
              <input type="text" value={toInvoiceNum} onChange={(e) => setToInvoiceNum(e.target.value)} placeholder="101730" className="w-20 px-2 py-0.5 bg-white border border-slate-300 rounded font-mono text-xs" />
            </div>
          )}

          {/* Invoices Type Filter */}
          {(activeReport.code === 'REP_IC_002' ||
            (activeReport.code === 'REP_IC_003' &&
              ['Duplicate Invoices', 'Transactions by date', 'Transactions by employees by payment', 'Transactions by date by payments', 'Transactions by customers', 'Transactions by Customers by Group', 'Transactions by customers details', 'Transactions by Workstation', 'Transactions by salesman', 'Transactions By Source'].includes(transactionSubType))) && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setInvoiceTypeDropdownOpen(!invoiceTypeDropdownOpen)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-xs text-slate-800 flex items-center justify-between gap-2 min-w-[120px]"
              >
                <span>{getSelectedInvoiceTypeLabel()}</span>
                <span className="text-[9px] text-slate-500">▼</span>
              </button>

              {invoiceTypeDropdownOpen && (
                <div className="absolute left-0 mt-1 w-52 bg-white border border-slate-300 rounded-xl shadow-xl py-1 text-xs text-slate-800 z-50">
                  <div className="p-1.5 border-b border-slate-100">
                    <input
                      type="text"
                      value={invoiceTypeSearch}
                      onChange={(e) => setInvoiceTypeSearch(e.target.value)}
                      placeholder="Search..."
                      className="w-full px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs"
                      autoFocus
                    />
                  </div>
                  {invoiceTypeOptions
                    .filter((o) => o.label.toLowerCase().includes(invoiceTypeSearch.toLowerCase()))
                    .map((opt) => (
                      <button
                        key={opt.code}
                        type="button"
                        onClick={() => { setInvoiceTypeFilter(opt.code); setInvoiceTypeDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between ${invoiceTypeFilter === opt.code ? 'bg-[#edf2ee] text-[#1e3a2b] font-bold' : ''}`}
                      >
                        <span>{opt.label}</span>
                        {invoiceTypeFilter === opt.code && <span className="text-[#1e3a2b]">✓</span>}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Department Filter */}
          {activeReport.code === 'REP_IC_003' && ['Transactions by date', 'Transactions By Source'].includes(transactionSubType) && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDeptDropdownOpen(!deptDropdownOpen)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-xs text-slate-800 flex items-center justify-between gap-1.5 min-w-[130px]"
              >
                <span className="truncate">{getDepartmentsDisplayLabel()}</span>
                <span className="text-[9px] text-slate-500">▼</span>
              </button>

              {deptDropdownOpen && (
                <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-300 rounded-xl shadow-xl py-1 text-xs text-slate-800 z-50">
                  <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 cursor-pointer font-bold border-b border-slate-100">
                    <input type="checkbox" checked={selectedDepartments.includes('ALL')} onChange={() => toggleDepartmentSelection('ALL')} className="accent-[#1e3a2b]" />
                    <span>Show All</span>
                  </label>
                  {departmentsList.map((d) => (
                    <label key={d.code} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer text-slate-700">
                      <input type="checkbox" checked={selectedDepartments.includes(d.code)} onChange={() => toggleDepartmentSelection(d.code)} className="accent-[#1e3a2b]" />
                      <span>{d.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Payment Types */}
          {activeReport.code === 'REP_IC_003' && ['Transactions by date', 'Transactions by date by payments', 'Transactions By Source'].includes(transactionSubType) && (
            <select
              value={paymentTypeFilter}
              onChange={(e) => setPaymentTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-xs text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Payment Types</option>
              <option value="CASH">Cash</option>
              <option value="CREDIT">Credit</option>
              <option value="CASH_USD">Cash USD</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="CREDIT_CARD_USD">Credit Card USD</option>
            </select>
          )}

          {/* Criteria Dropdown */}
          {activeReport.code === 'REP_IC_003' && transactionSubType === 'Transactions by date' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setInvoicesCriteriaDropdownOpen(!invoicesCriteriaDropdownOpen)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-xs text-slate-800 flex items-center justify-between gap-1.5 min-w-[130px]"
              >
                <span className="truncate">{selectedInvoiceCriteria[0] || 'Show Refund'}</span>
                <span className="text-[9px] text-slate-500">▼</span>
              </button>

              {invoicesCriteriaDropdownOpen && (
                <div className="absolute left-0 mt-1 w-60 bg-white border border-slate-300 rounded-xl shadow-xl py-1 text-xs text-slate-800 z-50">
                  {invoiceCriteriaList.map((crit) => (
                    <button
                      key={crit}
                      type="button"
                      onClick={() => { setSelectedInvoiceCriteria([crit]); setInvoicesCriteriaDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between ${selectedInvoiceCriteria.includes(crit) ? 'bg-[#edf2ee] text-[#1e3a2b] font-bold' : ''}`}
                    >
                      <span>{crit}</span>
                      {selectedInvoiceCriteria.includes(crit) && <span className="text-[#1e3a2b]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Customer Search & VAT */}
          {activeReport.code === 'REP_IC_003' && ['Transactions by customers', 'Transactions by customers details'].includes(transactionSubType) && (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={customerSearchInput}
                onChange={(e) => setCustomerSearchInput(e.target.value)}
                placeholder="Search Customers..."
                className="w-36 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
              {transactionSubType === 'Transactions by customers' && (
                <select
                  value={vatNumberFilter}
                  onChange={(e) => setVatNumberFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-xs"
                >
                  <option value="ALL">All VAT</option>
                  <option value="WITH_VAT">With VATNB</option>
                  <option value="WITHOUT_VAT">Without VATNB</option>
                </select>
              )}
            </div>
          )}

          {/* Server & Grouped by Server */}
          {activeReport.code === 'REP_IC_003' && transactionSubType === 'Transactions by employees' && (
            <div className="flex items-center gap-1.5">
              <select
                value={serverFilter}
                onChange={(e) => setServerFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-xs"
              >
                <option value="ALL">All Servers</option>
                {serverOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800">
                <input type="checkbox" checked={groupedByServer} onChange={(e) => setGroupedByServer(e.target.checked)} className="accent-[#1e3a2b]" />
                <span>Grouped By Server</span>
              </label>
            </div>
          )}

          {/* Checkboxes */}
          {activeReport.code === 'REP_IC_003' && ['Transactions by employees by payment', 'Transactions by Workstation', 'Transactions by employees'].includes(transactionSubType) && (
            <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800">
              <input type="checkbox" checked={realDateFilter} onChange={(e) => setRealDateFilter(e.target.checked)} className="accent-[#1e3a2b] w-3.5 h-3.5" />
              <span>Real Date</span>
            </label>
          )}

          {activeReport.code === 'REP_IC_003' && ['Duplicate Invoices', 'Transactions by date'].includes(transactionSubType) && (
            <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800">
              <input type="checkbox" checked={showRateFilter} onChange={(e) => setShowRateFilter(e.target.checked)} className="accent-[#1e3a2b] w-3.5 h-3.5" />
              <span>Show Rate</span>
            </label>
          )}

          {activeReport.code === 'REP_IC_003' && ['Transactions by date', 'Transactions By Source'].includes(transactionSubType) && (
            <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800">
              <input type="checkbox" checked={groupByDateFilter} onChange={(e) => setGroupByDateFilter(e.target.checked)} className="accent-[#1e3a2b] w-3.5 h-3.5" />
              <span>Group By Date</span>
            </label>
          )}

          {activeReport.code === 'REP_IC_003' && ['Transactions by date by payments', 'Transactions by customers details'].includes(transactionSubType) && (
            <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800">
              <input type="checkbox" checked={showSummaryFilter} onChange={(e) => setShowSummaryFilter(e.target.checked)} className="accent-[#1e3a2b] w-3.5 h-3.5" />
              <span>Summary</span>
            </label>
          )}

          {activeReport.code === 'REP_IC_003' && transactionSubType === 'Transactions by invoice number' && (
            <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800">
              <input type="checkbox" checked={showZeroTaxFilter} onChange={(e) => setShowZeroTaxFilter(e.target.checked)} className="accent-[#1e3a2b] w-3.5 h-3.5" />
              <span>Show Zero Tax</span>
            </label>
          )}

          {/* Action Buttons */}
          <button type="button" onClick={() => alert(`Filter Applied: ${activeReport.title}`)} className="px-3.5 py-1.5 bg-[#334155] hover:bg-[#1e293b] text-white font-bold rounded-lg text-xs">
            Filter Report
          </button>
          <button type="button" onClick={() => { setShowRateFilter(false); setGroupByDateFilter(false); }} className="px-3.5 py-1.5 bg-[#78350f] hover:bg-[#58250b] text-white font-bold rounded-lg text-xs">
            Reset Filters
          </button>
        </div>

        {/* Right Tools: Zoom + Print + Export + Settings */}
        <div className="flex items-center gap-1.5 relative">
          <button type="button" onClick={() => setZoomLevel(Math.max(75, zoomLevel - 10))} className="p-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold">🔍−</button>
          <button type="button" onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))} className="p-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold">🔍+</button>
          <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 bg-[#1e293b] text-white font-bold rounded-lg text-xs shadow-2xs">Print Report</button>
          
          <div className="relative">
            <button type="button" onClick={() => setExportDropdownOpen(!exportDropdownOpen)} className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs border border-slate-300 flex items-center gap-1.5">
              <span>📥 Export</span>
              <span className="text-[9px]">▼</span>
            </button>
            {exportDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-300 rounded-xl shadow-xl py-1.5 text-xs text-slate-800 z-50">
                <button type="button" onClick={() => { window.print(); setExportDropdownOpen(false); }} className="w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center gap-2"><span>📄</span> <div className="font-bold">Export as PDF (.pdf)</div></button>
                <button type="button" onClick={triggerCSVExport} className="w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center gap-2"><span>📊</span> <div className="font-bold">Export as Excel (.xlsx / .csv)</div></button>
              </div>
            )}
          </div>

          <button type="button" onClick={() => setSettingsModalOpen(true)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300" title="Settings">⚙️</button>
        </div>

      </div>

      {/* SETTINGS MODAL */}
      {settingsModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 print:hidden animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-[#f8faf8]">
              <h2 className="text-base font-bold text-slate-900">Settings</h2>
              <button type="button" onClick={() => setSettingsModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded">✕</button>
            </div>
            <div className="p-5 overflow-y-auto custom-scrollbar space-y-5 text-xs text-slate-800">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs">Default Date Range Selection</label>
                  <button type="button" onClick={() => alert(`Default Date Range Saved as ${defaultDateSelection}`)} className="px-3.5 py-1 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-lg text-xs shadow-2xs">Save</button>
                </div>
                <select value={defaultDateSelection} onChange={(e) => setDefaultDateSelection(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-xs text-slate-800 focus:outline-none">
                  <option value="THIS_MONTH">This Month</option>
                  <option value="EOD_DATE">EOD Date</option>
                  <option value="TODAY">Today</option>
                </select>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">Toolbar Categories</h3>
                    <p className="text-[10.5px] text-slate-500">You can include up to 8 categories in the toolbar</p>
                  </div>
                  <button type="button" onClick={() => setCustomCategoryModalOpen(true)} className="px-3 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-lg text-xs shadow-2xs">Custom Category</button>
                </div>

                <div className="bg-white p-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5">
                  <span className="text-slate-400">🔍</span>
                  <input type="text" value={settingsSearch} onChange={(e) => setSettingsSearch(e.target.value)} placeholder="Search categories and reports..." className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none" />
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input type="checkbox" checked={selectedToolbarCats.includes('recently_viewed')} onChange={() => setSelectedToolbarCats(selectedToolbarCats.includes('recently_viewed') ? selectedToolbarCats.filter(k => k !== 'recently_viewed') : [...selectedToolbarCats, 'recently_viewed'])} className="accent-[#1e3a2b] w-3.5 h-3.5" />
                      <span>Recently Viewed</span>
                    </label>
                  </div>

                  {masterCatalog.map((c) => (
                    <div key={c.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                      <div className="p-2 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                        <label className="flex items-center gap-2 cursor-pointer font-semibold">
                          <input type="checkbox" checked={selectedToolbarCats.includes(c.id)} onChange={() => setSelectedToolbarCats(selectedToolbarCats.includes(c.id) ? selectedToolbarCats.filter(k => k !== c.id) : [...selectedToolbarCats, c.id])} className="accent-[#1e3a2b] w-3.5 h-3.5" />
                          <span>{c.title.replace(/^\d+\.\s*/, '')}</span>
                        </label>
                        <button type="button" onClick={() => setExpandedSettingsCats(expandedSettingsCats.includes(c.id) ? expandedSettingsCats.filter(k => k !== c.id) : [...expandedSettingsCats, c.id])} className="px-2 py-0.5 rounded border border-slate-200 text-[10px] text-slate-600 hover:bg-slate-100 font-bold">{expandedSettingsCats.includes(c.id) ? '»' : '«'}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 bg-[#f8faf8] flex justify-end">
              <button type="button" onClick={() => setSettingsModalOpen(false)} className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CATEGORY MODAL */}
      {customCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 print:hidden animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-[#f8faf8]">
              <h2 className="text-base font-bold text-slate-900">Custom Category</h2>
              <button type="button" onClick={() => setCustomCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded">✕</button>
            </div>
            <div className="p-5 space-y-4 text-xs text-slate-800">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Category Name</label>
                <div className="flex items-center gap-2">
                  <input type="text" value={customCategoryName} onChange={(e) => setCustomCategoryName(e.target.value)} placeholder="e.g. Daily Operations Summary" className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#1e3a2b]" />
                  <button type="button" onClick={() => { if (!customCategoryName.trim()) { alert('Please enter a Category Name'); return; } alert(`Custom Category "${customCategoryName}" saved!`); setCustomCategoryModalOpen(false); }} className="px-4 py-2 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-lg text-xs shadow-2xs">Save</button>
                </div>
              </div>

              <div>
                <div className="bg-white p-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5">
                  <span className="text-slate-400">🔍</span>
                  <input type="text" value={customCategorySearch} onChange={(e) => setCustomCategorySearch(e.target.value)} placeholder="Search Report..." className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none" />
                </div>
                <div className="mt-2 max-h-52 overflow-y-auto custom-scrollbar border border-slate-200 rounded-lg p-2 space-y-1 bg-slate-50">
                  {allFlattenedReports.filter((r) => r.title.toLowerCase().includes(customCategorySearch.toLowerCase())).slice(0, 30).map((r) => (
                    <label key={r.code} className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer text-slate-700 bg-white/60 border border-slate-100">
                      <input type="checkbox" checked={customCategorySelectedReports.includes(r.code)} onChange={() => setCustomCategorySelectedReports(customCategorySelectedReports.includes(r.code) ? customCategorySelectedReports.filter(k => k !== r.code) : [...customCategorySelectedReports, r.code])} className="accent-[#1e3a2b] w-3.5 h-3.5" />
                      <span className="font-semibold text-slate-900">{r.title}</span>
                      <span className="text-[9px] text-slate-400 ml-auto truncate max-w-[100px]">{r.category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 bg-[#f8faf8] flex justify-end">
              <button type="button" onClick={() => setCustomCategoryModalOpen(false)} className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
