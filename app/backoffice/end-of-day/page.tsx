'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  FileText, 
  Printer, 
  DollarSign, 
  CreditCard, 
  Receipt, 
  Layers, 
  ShieldCheck, 
  X,
  ChevronRight,
  TrendingUp,
  Download,
  AlertCircle
} from 'lucide-react';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { OmegaBranchEod, INITIAL_EOD_BRANCHES } from '@/lib/omegaEndOfDayData';

export default function EndOfDayPage() {
  const { currentTenant } = useTenant();
  const { t, dir } = useLanguage();
  const [branches, setBranches] = useState<OmegaBranchEod[]>(INITIAL_EOD_BRANCHES);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [zReportModalOpen, setZReportModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; title: string; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'closing' | 'matrix' | 'reconciliation' | 'history'>('closing');

  const selectedBranch = branches.find(b => b.BRANCHID === selectedBranchId) || branches[0];

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    setSelectedBranchId(id);
  };

  const showToast = (type: 'success' | 'error', title: string, text: string) => {
    setToastMessage({ type, title, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleExecuteEodClick = () => {
    if (!selectedBranch) return;
    setConfirmModalOpen(true);
  };

  const executeEndOfDay = () => {
    setConfirmModalOpen(false);
    setLoading(true);

    // Simulate authentic Vanguard closing sequence & API response
    setTimeout(() => {
      setLoading(false);
      
      // Advance date to next business day
      const today = new Date();
      const nextDateStr = today.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      
      setBranches(prev => prev.map(b => {
        if (b.BRANCHID === selectedBranchId) {
          return {
            ...b,
            end_of_day: nextDateStr,
            status: 'Closed'
          };
        }
        return b;
      }));

      showToast('success', 'Success', 'End of day done successfully!');
      setZReportModalOpen(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-16">
      <style jsx global>{`
        /* Authentic Vanguard End of Day Styles */
        .end-of-day-card {
          background: #fff;
          border: 1px solid #dfe5ef;
          border-radius: 18px;
          box-shadow: 0 12px 30px rgba(22, 34, 57, 0.08);
          padding: 1.25rem;
        }
        .end-of-day-note {
          color: #6c7a92;
          font-size: 0.95rem;
          margin: 0;
        }
        .end-of-day-loader {
          padding: 1rem 0 0.25rem;
          text-align: center;
        }
        @media (max-width: 767.98px) {
          .end-of-day-card {
            border-radius: 16px;
            padding: 1rem;
          }
        }
        .vanguard-table th {
          background-color: #3e3e3e;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          padding: 7px 10px;
          border: 1px solid #555;
          text-align: left;
        }
        .vanguard-table td {
          font-size: 12px;
          padding: 7px 10px;
          border: 1px solid #e2e8f0;
        }
      `}</style>

      {/* Toastr notification matching Vanguard toastr */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-bounce transition-all">
          <div className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl text-white min-w-[320px] ${toastMessage.type === 'success' ? 'bg-emerald-700 border border-emerald-400' : 'bg-destructive border border-red-400'}`}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-sm">{toastMessage.title}</div>
              <div className="text-xs text-white/90 mt-0.5">{toastMessage.text}</div>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumb & Header matching Vanguard EndOfDayView */}
      <div className="px-4 lg:px-6 pt-5 pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('End of Day', 'End of Day')}</h1>
            <ul className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <li>
                <Link href="/backoffice" className="hover:text-blue-600 transition">{t('Home', 'Home')}</Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/dashboard/sales" className="hover:text-blue-600 transition">{t('Sales', 'Sales')}</Link>
              </li>
              <li>/</li>
              <li className="text-slate-800 font-semibold">{t('End of Day', 'End of Day')}</li>
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition"
              title={t('View Branches Last EOD Matrix', 'View Branches Last EOD Matrix')}
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{t('Branches Status Matrix', 'Branches Status Matrix')}</span>
            </button>

            <Link
              href="/dashboard/sales"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition"
            >
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>{t('Sales Dashboard', 'Sales Dashboard')}</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs to explore the full matrix / connection */}
        <div className="flex items-center gap-2 mt-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('closing')}
            className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 ${activeTab === 'closing' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {t('Daily Register Closing', 'Daily Register Closing')}
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 ${activeTab === 'matrix' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {t('Branches EOD Status Matrix', 'Branches EOD Status Matrix')}
          </button>
          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 ${activeTab === 'reconciliation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {t('Sales & Drawer Reconciliation Connection', 'Sales & Drawer Reconciliation Connection')}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {t('Historical Z-Reports Log', 'Historical Z-Reports Log')}
          </button>
        </div>
      </div>

      <div className="px-4 lg:px-6 mt-4 max-w-7xl">
        {/* TAB 1: EXACT VANGUARD END OF DAY VIEW */}
        {activeTab === 'closing' && (
          <div className="space-y-6">
            {/* VANGUARD AUTHENTIC END OF DAY CARD */}
            <div className="end-of-day-card">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* Branch Selection Field */}
                <div className="md:col-span-5 lg:col-span-5">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('Branch', 'Branch')}</label>
                  <select
                    value={selectedBranchId}
                    onChange={handleBranchChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  >
                    {branches.map(b => (
                      <option key={b.BRANCHID} value={b.BRANCHID}>
                        {t(b.BARANCHNAME, b.BARANCHNAME)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Last End of Day Input (Disabled) */}
                <div className="md:col-span-4 lg:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('Last End of Day', 'Last End of Day')}</label>
                  <input
                    type="text"
                    disabled
                    value={selectedBranch?.end_of_day || t('No branch selected', 'No branch selected')}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 cursor-not-allowed shadow-inner"
                    placeholder={t('No branch selected', 'No branch selected')}
                  />
                </div>

                {/* Execute End of Day Button */}
                <div className="md:col-span-3 lg:col-span-3 flex justify-end">
                  <button
                    type="button"
                    disabled={loading || !selectedBranch}
                    onClick={handleExecuteEodClick}
                    className={`w-full md:w-auto px-6 py-2 rounded-lg font-bold text-xs text-white shadow-md transition-all flex items-center justify-center gap-2 ${loading ? 'bg-blue-400 cursor-wait' : 'bg-primary hover:bg-blue-700 active:scale-95'}`}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t('Processing...', 'Processing...')}</span>
                      </>
                    ) : (
                      <span>{t('End Of Day', 'End Of Day')}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Informational note */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <p className="end-of-day-note">
                  {t('Select a branch to review its latest end-of-day status before running the process.', 'Select a branch to review its latest end-of-day status before running the process.')}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">{t('Current Status:', 'Current Status:')}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${selectedBranch.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {t(selectedBranch.status, selectedBranch.status)}
                  </span>
                </div>
              </div>

              {/* Animated loading bar if active */}
              {loading && (
                <div className="end-of-day-loader">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('Communicating with Vanguard POS Engine & Finalizing Register Ledger...', 'Communicating with Vanguard POS Engine & Finalizing Register Ledger...')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* QUICK HIGHLIGHT MATRIX CARDS FOR THE SELECTED BRANCH */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>{t('Invoices Processed', 'Invoices Processed')}</span>
                  <Receipt className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-slate-900 mt-2 font-mono">
                  {selectedBranch.invoicesCount} {t('Invoices', 'Invoices')}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {t('Cashier:', 'Cashier:')} <span className="font-semibold text-slate-700">{selectedBranch.cashier}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>{t('Gross Sales', 'Gross Sales')}</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-bold text-slate-900 mt-2 font-mono">
                  ${selectedBranch.grossSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                  {t('Net:', 'Net:')} ${selectedBranch.netSales.toLocaleString('en-US', { minimumFractionDigits: 2 })} {t('(excl. VAT)', '(excl. VAT)')}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>{t('Cash Collections', 'Cash Collections')}</span>
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xl font-bold text-slate-900 mt-2 font-mono">
                  ${selectedBranch.cashUsd.toLocaleString()} + {selectedBranch.cashLbp.toLocaleString()} LBP
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {t('Cards:', 'Cards:')} ${selectedBranch.cardPayments.toFixed(2)} | {t('Online:', 'Online:')} ${selectedBranch.omnichannel.toFixed(2)}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>{t('Audit & Voids', 'Audit & Voids')}</span>
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-xl font-bold text-slate-900 mt-2 font-mono">
                  {selectedBranch.voidsCount} {t('Voids', 'Voids')} (${selectedBranch.discounts.toFixed(2)} {t('Disc', 'Disc')})
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {t('VAT 11%:', 'VAT 11%:')} ${selectedBranch.taxVat.toFixed(2)} {t('Reconciled', 'Reconciled')}
                </div>
              </div>
            </div>

            {/* DIRECT ACTION PANEL: VIEW LAST Z-REPORT */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t('Official Fiscal Z-Report Summary Available', 'Official Fiscal Z-Report Summary Available')}</h4>
                  <p className="text-[11px] text-slate-500">{t('Last closed batch reference for', 'Last closed batch reference for')} {t(selectedBranch.BARANCHNAME, selectedBranch.BARANCHNAME)} {t('as of', 'as of')} {selectedBranch.end_of_day}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setZReportModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-sm transition flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('View Full Z-Report Matrix', 'View Full Z-Report Matrix')}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: BRANCHES EOD STATUS MATRIX TABLE */}
        {activeTab === 'matrix' && (
          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t('Branches End of Day Status Matrix', 'Branches End of Day Status Matrix')}</h3>
                <p className="text-xs text-slate-500">{t('Live synchronization with Vanguard POS API', 'Live synchronization with Vanguard POS API')} (`getBranchesLastEodate`)</p>
              </div>
              <button
                onClick={() => setStatusModalOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm cursor-pointer"
              >
                {t('Open Vanguard Status Matrix', 'Open Vanguard Status Matrix')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full vanguard-table">
                <thead>
                  <tr>
                    <th>{t('Branch ID', 'Branch ID')}</th>
                    <th>{t('Branch Name', 'Branch Name')}</th>
                    <th>{t('Customer ID', 'Customer ID')}</th>
                    <th>{t('Last EOD Date', 'Last EOD Date')}</th>
                    <th>{t('Status', 'Status')}</th>
                    <th>{t('Assigned Cashier', 'Assigned Cashier')}</th>
                    <th>{t('Invoices', 'Invoices')}</th>
                    <th>{t('Gross Volume', 'Gross Volume')}</th>
                    <th>{t('Action', 'Action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((b, idx) => (
                    <tr key={b.BRANCHID} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="font-mono font-bold text-blue-700">{b.BRANCHID}</td>
                      <td className="font-semibold text-slate-900">{b.BARANCHNAME}</td>
                      <td className="font-mono text-slate-600">{b.OMEGA_CUSTID}</td>
                      <td className="font-semibold font-mono text-slate-700">{b.end_of_day}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${b.status === 'Closed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                          {b.status === 'Closed' ? t('Closed', 'Closed') : t('Pending', 'Pending')}
                        </span>
                      </td>
                      <td className="text-slate-600">{b.cashier}</td>
                      <td className="font-mono text-right">{b.invoicesCount}</td>
                      <td className="font-mono font-bold text-right text-emerald-800">
                        ${b.grossSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBranchId(b.BRANCHID);
                            setActiveTab('closing');
                          }}
                          className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[11px] font-bold transition"
                        >
                          {t('Select & Close', 'Select & Close')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SALES & RECONCILIATION CONNECTION MATRIX */}
        {activeTab === 'reconciliation' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Financial Ledger Breakdown */}
            <div className="lg:col-span-6 bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
              <div className="p-3.5 bg-primary text-white font-bold text-xs flex items-center justify-between">
                <span>{t('Fiscal Sales Reconciliation Matrix', '1. Fiscal Sales Reconciliation Matrix')}</span>
                <span className="text-[11px] text-slate-300 font-mono">SO-Z-BATCH-9482</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">{t('Gross Product Sales', 'Gross Product Sales')}</span>
                  <span className="font-mono font-bold text-slate-900">${selectedBranch.grossSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">{t('Line Discounts & Promotions', 'Line Discounts & Promotions')}</span>
                  <span className="font-mono font-semibold text-red-600">-${selectedBranch.discounts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">{t('Returns & Approved Refunds', 'Returns & Approved Refunds')}</span>
                  <span className="font-mono font-semibold text-red-600">-$0.00</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs font-bold bg-slate-50 px-2 rounded">
                  <span className="text-slate-900">{t('Net Sales Volume (Excl. Tax)', 'Net Sales Volume (Excl. Tax)')}</span>
                  <span className="font-mono text-blue-700">${selectedBranch.netSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">{t('VAT / Sales Tax (11.0%)', 'VAT / Sales Tax (11.0%)')}</span>
                  <span className="font-mono font-bold text-emerald-700">+${selectedBranch.taxVat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-emerald-50 border border-emerald-200 px-3 rounded-lg text-xs font-black text-emerald-900">
                  <span>{t('TOTAL REGISTER SETTLEMENT', 'TOTAL REGISTER SETTLEMENT')}</span>
                  <span className="font-mono text-sm">${selectedBranch.grossSales.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Right: Drawer Payment Reconciliation Matrix */}
            <div className="lg:col-span-6 bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
              <div className="p-3.5 bg-primary text-white font-bold text-xs flex items-center justify-between">
                <span>{t('Cash Drawer & Settlement Methods Matrix', '2. Cash Drawer & Settlement Methods Matrix')}</span>
                <span className="text-[11px] text-slate-300 font-mono">{t('4 Currencies/Methods', '4 Currencies/Methods')}</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">{t('Cash Drawer USD ($)', 'Cash Drawer USD ($)')}</span>
                  <span className="font-mono font-bold text-slate-900">${selectedBranch.cashUsd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">{t('Cash Drawer LBP (Local Currency)', 'Cash Drawer LBP (Local Currency)')}</span>
                  <span className="font-mono font-bold text-slate-900">{selectedBranch.cashLbp.toLocaleString()} LBP</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">{t('Credit / Debit Card Terminals', 'Credit / Debit Card Terminals')}</span>
                  <span className="font-mono font-bold text-slate-900">${selectedBranch.cardPayments.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">{t('Omnichannel & Digital (OMT / Whish)', 'Omnichannel & Digital (OMT / Whish)')}</span>
                  <span className="font-mono font-bold text-slate-900">${selectedBranch.omnichannel.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium">{t('Drawer Over / Short Variance', 'Drawer Over / Short Variance')}</span>
                  <span className="font-mono font-bold text-emerald-600">$0.00 ({t('Balanced', 'Balanced')})</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-blue-50 border border-blue-200 px-3 rounded-lg text-xs font-bold text-blue-900">
                  <span>{t('Drawer Reconciliation Audit', 'Drawer Reconciliation Audit')}</span>
                  <span className="font-mono text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t('DRAWER VERIFIED', 'DRAWER VERIFIED')}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HISTORICAL Z-REPORTS */}
        {activeTab === 'history' && (
          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t('Historical End-of-Day Z-Reports Archive', 'Historical End-of-Day Z-Reports Archive')}</h3>
                <p className="text-xs text-slate-500">{t('Archived daily registers, tax audit trails, and signed closing slips', 'Archived daily registers, tax audit trails, and signed closing slips')}</p>
              </div>
              <button
                onClick={() => setZReportModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
              >
                {t('Print Current Batch', 'Print Current Batch')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full vanguard-table">
                <thead>
                  <tr>
                    <th>{t('Z-Report #', 'Z-Report #')}</th>
                    <th>{t('Date Closed', 'Date Closed')}</th>
                    <th>{t('Branch', 'Branch')}</th>
                    <th>{t('Closed By', 'Closed By')}</th>
                    <th>{t('Total Invoices', 'Total Invoices')}</th>
                    <th>{t('Total Net ($)', 'Total Net ($)')}</th>
                    <th>{t('VAT 11% ($)', 'VAT 11% ($)')}</th>
                    <th>{t('Gross Settled ($)', 'Gross Settled ($)')}</th>
                    <th>{t('Status', 'Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="font-mono font-bold text-blue-700">Z-2026-0904-01</td>
                    <td className="font-mono">2026-09-04 23:45</td>
                    <td className="font-semibold">Southern Olive Oil Products S.A.R.L</td>
                    <td>Hiba Aloulou</td>
                    <td className="font-mono text-right">142</td>
                    <td className="font-mono text-right font-semibold">$4,765.77</td>
                    <td className="font-mono text-right text-emerald-700">$524.23</td>
                    <td className="font-mono text-right font-black text-slate-900">$5,290.00</td>
                    <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{t('Finalized', 'Finalized')}</span></td>
                  </tr>
                  <tr className="bg-slate-50/70">
                    <td className="font-mono font-bold text-blue-700">Z-2026-0903-01</td>
                    <td className="font-mono">2026-09-03 23:40</td>
                    <td className="font-semibold">Southern Olive Oil Products S.A.R.L</td>
                    <td>Hiba Aloulou</td>
                    <td className="font-mono text-right">138</td>
                    <td className="font-mono text-right font-semibold">$4,612.61</td>
                    <td className="font-mono text-right text-emerald-700">$507.39</td>
                    <td className="font-mono text-right font-black text-slate-900">$5,120.00</td>
                    <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{t('Finalized', 'Finalized')}</span></td>
                  </tr>
                  <tr className="bg-white">
                    <td className="font-mono font-bold text-blue-700">Z-2026-0902-01</td>
                    <td className="font-mono">2026-09-02 23:35</td>
                    <td className="font-semibold">Southern Olive Oil Products S.A.R.L</td>
                    <td>Hiba Aloulou</td>
                    <td className="font-mono text-right">129</td>
                    <td className="font-mono text-right font-semibold">$4,324.32</td>
                    <td className="font-mono text-right text-emerald-700">$475.68</td>
                    <td className="font-mono text-right font-black text-slate-900">$4,800.00</td>
                    <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{t('Finalized', 'Finalized')}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. AUTHENTIC VANGUARD CONFIRMATION POPUP (BOOTBOX CONFIRM)                   */}
      {/* ========================================================================= */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-xl max-w-md w-full p-6 text-slate-800 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t('Are you sure you want to execute end of day?', 'Are you sure you want to execute end of day?')}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {t('Executing End of Day for', 'Executing End of Day for')} <span className="font-bold text-slate-800">{selectedBranch.BARANCHNAME}</span> {t('will lock daily transactions, balance cash drawers, generate the Z-Report audit sequence, and advance the register to the next operating business day.', 'will lock daily transactions, balance cash drawers, generate the Z-Report audit sequence, and advance the register to the next operating business day.')}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('Current EOD Date:', 'Current EOD Date:')}</span>
                <span className="font-mono font-bold text-slate-800">{selectedBranch.end_of_day}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('Invoices to Finalize:', 'Invoices to Finalize:')}</span>
                <span className="font-mono font-bold text-slate-800">{selectedBranch.invoicesCount} {t('Invoices', 'Invoices')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('Total Settlement:', 'Total Settlement:')}</span>
                <span className="font-mono font-bold text-emerald-700">${selectedBranch.grossSales.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
              >
                {t('Cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={executeEndOfDay}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-xs font-bold text-white shadow-md transition"
              >
                {t('OK', 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. AUTHENTIC VANGUARD EOD STATUS MATRIX MODAL (`getBranchesLastEodate`)     */}
      {/* ========================================================================= */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-lg max-w-lg w-full p-4 text-slate-800 shadow-2xl">
            {/* Authentic Vanguard Status Table layout matching BackofficeDashboardController.js */}
            <div style={{ padding: '4px', background: '#ffffff', borderRadius: '6px' }}>
              <table className="w-full" style={{ marginBottom: 0, color: '#0f172a', background: '#ffffff', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #d7dee8' }}>
                    <th colSpan={2} style={{ textAlign: 'center', color: '#dc2626', fontSize: '16px', padding: '8px', fontWeight: 800 }}>
                      {t('End of Day Status', 'End of Day Status')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((b, idx) => {
                    const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
                    return (
                      <tr key={b.BRANCHID}>
                        <th style={{ borderTop: 0, borderBottom: '1px solid #e5e7eb', fontSize: '12px', fontWeight: 'normal', color: '#1f2937', background: rowBg, padding: '10px 12px', textAlign: 'left' }}>
                          {b.BARANCHNAME} :
                        </th>
                        <td style={{ borderTop: 0, borderBottom: '1px solid #e5e7eb', fontSize: '12px', textAlign: 'center', color: '#475569', background: rowBg, padding: '10px 12px', fontWeight: 600 }}>
                          {b.end_of_day}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">{t('Synchronized with Vanguard Sales Control Core', 'Synchronized with Vanguard Sales Control Core')}</span>
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
              >
                {t('OK', 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FISCAL Z-REPORT DETAIL POPUP                                           */}
      {/* ========================================================================= */}
      {zReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-xl max-w-xl w-full p-6 text-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">{t('Fiscal Z-Report Slip & Reconciliation', 'Fiscal Z-Report Slip & Reconciliation')}</h3>
              </div>
              <button onClick={() => setZReportModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thermal Register Slip Preview */}
            <div className="mt-4 p-5 bg-card border border-dashed border-slate-300 rounded-lg font-mono text-xs text-slate-800 space-y-2">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <div className="font-black text-sm">{selectedBranch.BARANCHNAME}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">SOUTHERN OLIVE OIL PRODUCTS S.A.R.L - POS REG #1</div>
                <div className="text-[10px] text-slate-400">TAX MOF: 7489201 | CR: 104928-LB</div>
                <div className="font-bold text-xs mt-1.5">*** {t('FISCAL END OF DAY (Z-REPORT)', '*** FISCAL END OF DAY (Z-REPORT) ***')} ***</div>
                <div className="text-[10.5px] text-slate-600">{t('Z-Report Reference:', 'Z-Report Reference:')} #Z-20260904-001</div>
                <div className="text-[10.5px] text-slate-600">{t('Closing Timestamp:', 'Closing Timestamp:')} {new Date().toLocaleString()}</div>
              </div>

              <div className="pt-2 space-y-1.5">
                <div className="flex justify-between">
                  <span>{t('TRANSACTION COUNT:', 'TRANSACTION COUNT:')}</span>
                  <span className="font-bold">{selectedBranch.invoicesCount} {t('Invoices', 'Invoices')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('GROSS REGISTER SALES:', 'GROSS REGISTER SALES:')}</span>
                  <span className="font-bold">${selectedBranch.grossSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('TOTAL DISCOUNTS APPLIED:', 'TOTAL DISCOUNTS APPLIED:')}</span>
                  <span>-${selectedBranch.discounts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('TOTAL VOIDED TICKETS', 'TOTAL VOIDED TICKETS')} ({selectedBranch.voidsCount}):</span>
                  <span>-$0.00</span>
                </div>
                <div className="flex justify-between font-bold text-blue-700 pt-1 border-t border-dashed border-slate-300">
                  <span>{t('NET TAXABLE SALES:', 'NET TAXABLE SALES:')}</span>
                  <span>${selectedBranch.netSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>{t('TOTAL VAT COLLECTED (11%):', 'TOTAL VAT COLLECTED (11%):')}</span>
                  <span>+${selectedBranch.taxVat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-dashed border-slate-300 text-[13px]">
                  <span>{t('FINAL NET RECONCILED:', 'FINAL NET RECONCILED:')}</span>
                  <span>${selectedBranch.grossSales.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-300 space-y-1">
                <div className="font-bold text-[11px] text-slate-700">{t('PAYMENT TENDER BREAKDOWN:', 'PAYMENT TENDER BREAKDOWN:')}</div>
                <div className="flex justify-between text-[11px]">
                  <span>{t('• CASH USD:', '• CASH USD:')}</span>
                  <span>${selectedBranch.cashUsd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>{t('• CASH LBP:', '• CASH LBP:')}</span>
                  <span>{selectedBranch.cashLbp.toLocaleString()} LBP</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>{t('• CREDIT CARDS (VISA/MC):', '• CREDIT CARDS (VISA/MC):')}</span>
                  <span>${selectedBranch.cardPayments.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>{t('• OMNICHANNEL (OMT/WHISH):', '• OMNICHANNEL (OMT/WHISH):')}</span>
                  <span>${selectedBranch.omnichannel.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10.5px] text-slate-500">
                <div>{t('Cashier Signature:', 'Cashier Signature:')} ______________________</div>
                <div className="mt-1">{t('Manager Signature:', 'Manager Signature:')} ______________________</div>
                <div className="mt-1 font-semibold text-emerald-700">{t('BATCH BALANCED & AUDITED WITH 0 VARIANCE', 'BATCH BALANCED & AUDITED WITH 0 VARIANCE')}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('Print Z-Slip', 'Print Z-Slip')}</span>
              </button>
              <button
                type="button"
                onClick={() => setZReportModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition"
              >
                {t('Done', 'Done')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
