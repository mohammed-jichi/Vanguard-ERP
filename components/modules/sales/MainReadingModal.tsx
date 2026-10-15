'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Printer,
  FileText,
  DollarSign,
  Banknote,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  UserCheck,
  Layers,
  Sparkles,
  TrendingUp,
  Percent,
  RefreshCw,
  Lock
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { printElementById } from '@/lib/utils/printDocument';
import { peekNextDocNumber, commitNextDocNumber, cleanDocumentNumber } from '@/lib/utils/documentSequence';
import {
  PosShift,
  CashMovement,
  getActiveShift,
  saveActiveShift,
  getCashMovements,
  closeShiftSession,
  computeMainReadingSummary,
  formatMovementDisplay,
  MainReadingSummary,
  POS_EXCHANGE_RATE_LBP,
  SHIFT_UPDATED_EVENT,
  CASH_MOVEMENTS_UPDATED_EVENT
} from '@/lib/posShiftService';

interface MainReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: any[];
  paidInOutList: any[];
  customerReceipts: any[];
  workingDate?: string;
  branchName?: string;
  cashierName?: string;
  tenantId?: string;
  printerType?: 'a4' | 'thermal' | 'a5' | 'dot_matrix';
  onShiftClosed?: (closedShift: PosShift, newShift: PosShift, closedInvoiceIds: string[]) => void;
}

export default function MainReadingModal({
  isOpen,
  onClose,
  invoices,
  paidInOutList,
  customerReceipts,
  workingDate,
  branchName = 'Southern Olive and Oil Products S.A.R.L.',
  cashierName = 'Active Cashier',
  tenantId,
  printerType = 'a4',
  onShiftClosed
}: MainReadingModalProps) {
  const [readingType, setReadingType] = useState<'X' | 'Z'>('X');
  const [activeShift, setActiveShift] = useState<PosShift>(getActiveShift());
  const [openingFloatInputUsd, setOpeningFloatInputUsd] = useState<string>('0.00');
  const [openingFloatInputLbp, setOpeningFloatInputLbp] = useState<string>('0');
  const [countedCashInputUsd, setCountedCashInputUsd] = useState<string>('');
  const [countedCashInputLbp, setCountedCashInputLbp] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'tenders' | 'cashflow' | 'divisions' | 'printPreview'>('overview');
  const [isClosingShift, setIsClosingShift] = useState(false);
  const [liveMovements, setLiveMovements] = useState<CashMovement[]>([]);
  const readingSlipNumber = useMemo(() => peekNextDocNumber('MAIN_READING'), [isOpen, readingType, activeShift]);

  // Sync shift state on mount and update
  useEffect(() => {
    if (isOpen) {
      const shift = getActiveShift();
      setActiveShift(shift);
      setOpeningFloatInputUsd(shift.openingCashUsd !== undefined ? shift.openingCashUsd.toFixed(2) : '0.00');
      setOpeningFloatInputLbp(shift.openingCashLbp !== undefined ? shift.openingCashLbp.toString() : '0');
      setLiveMovements(getCashMovements());
    }
  }, [isOpen]);

  // Listen to external shift events and cash movement updates
  useEffect(() => {
    const handleShiftUpdated = (e: any) => {
      if (e.detail) {
        setActiveShift(e.detail);
      }
    };
    const handleCashMovementsUpdated = () => {
      setLiveMovements(getCashMovements());
    };
    window.addEventListener(SHIFT_UPDATED_EVENT, handleShiftUpdated);
    window.addEventListener(CASH_MOVEMENTS_UPDATED_EVENT, handleCashMovementsUpdated);
    window.addEventListener('storage', handleCashMovementsUpdated);
    return () => {
      window.removeEventListener(SHIFT_UPDATED_EVENT, handleShiftUpdated);
      window.removeEventListener(CASH_MOVEMENTS_UPDATED_EVENT, handleCashMovementsUpdated);
      window.removeEventListener('storage', handleCashMovementsUpdated);
    };
  }, []);

  // Compute live numbers
  const summary: MainReadingSummary = useMemo(() => {
    const openingUsd = parseFloat(openingFloatInputUsd) || 0;
    const openingLbp = parseFloat(openingFloatInputLbp) || 0;
    const hasCountedUsd = countedCashInputUsd.trim() !== '';
    const hasCountedLbp = countedCashInputLbp.trim() !== '';
    const countedUsd = hasCountedUsd ? parseFloat(countedCashInputUsd) : undefined;
    const countedLbp = hasCountedLbp ? parseFloat(countedCashInputLbp) : undefined;

    const effectiveCashMovements = liveMovements.length > 0
      ? liveMovements
      : (paidInOutList && paidInOutList.length > 0 ? paidInOutList : getCashMovements());

    return computeMainReadingSummary({
      readingType,
      shift: {
        ...activeShift,
        branch: branchName || activeShift.branch,
        cashierName: cashierName || activeShift.cashierName
      },
      invoices,
      paidInOutList: effectiveCashMovements,
      customerReceipts,
      openingFloatUsd: openingUsd,
      openingFloatLbp: openingLbp,
      actualCountedUsd: countedUsd,
      actualCountedLbp: countedLbp,
      exchangeRate: POS_EXCHANGE_RATE_LBP,
      workingDate
    });
  }, [
    readingType,
    activeShift,
    invoices,
    paidInOutList,
    liveMovements,
    customerReceipts,
    openingFloatInputUsd,
    openingFloatInputLbp,
    countedCashInputUsd,
    countedCashInputLbp,
    branchName,
    cashierName,
    workingDate
  ]);

  const handlePrint = () => {
    commitNextDocNumber('MAIN_READING', readingSlipNumber, tenantId);
    const title =
      readingType === 'X'
        ? `Vanguard X-Reading Slip #${readingSlipNumber} Shift #${activeShift.shiftNumber}`
        : `Vanguard Z-Reading Slip #${readingSlipNumber} End-of-Day Shift #${activeShift.shiftNumber}`;
    printElementById('printable-main-reading', title);
    toast.success(
      readingType === 'X'
        ? `Mid-shift X-Reading #${readingSlipNumber} sent to printer`
        : `Z-Reading #${readingSlipNumber} End-of-Day report sent to printer`
    );
  };

  const handleCloseShift = async () => {
    const countedUsd = parseFloat(countedCashInputUsd) || 0;
    const countedLbp = parseFloat(countedCashInputLbp) || 0;

    if (
      !window.confirm(
        `Are you sure you want to CLOSE Shift #${activeShift.shiftNumber} (Z-Report)?\n\n` +
          `Expected Drawer: $${summary.expectedCashUsd.toFixed(2)} USD\n` +
          `Counted Cash: $${countedUsd.toFixed(2)} USD\n` +
          `Variance: $${summary.varianceUsd >= 0 ? '+' : ''}${summary.varianceUsd.toFixed(2)} USD\n\n` +
          `This will archive daily totals and open Shift #${activeShift.shiftNumber + 1}.`
      )
    ) {
      return;
    }

    setIsClosingShift(true);
    try {
      const result = await closeShiftSession(
        activeShift,
        countedUsd,
        countedLbp,
        summary,
        tenantId,
        invoices,
        summary.paidInOutList,
        customerReceipts
      );

      toast.success(
        `Shift #${activeShift.shiftNumber} CLOSED successfully! New Shift #${result.newShift.shiftNumber} started.`
      );

      // Trigger automatic print of the Z-Reading
      setTimeout(() => {
        handlePrint();
      }, 500);

      if (onShiftClosed) {
        onShiftClosed(result.closedShift, result.newShift, result.closedInvoiceIds);
      }

      onClose();
    } catch (err: any) {
      toast.error('Failed to close shift: ' + (err.message || 'Unknown error'));
    } finally {
      setIsClosingShift(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden text-slate-800 font-sans">
        {/* ========================================================================= */}
        {/* MODAL HEADER                                                              */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Vanguard Main Reading (قراءة الصندوق العامة)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-amber-400 text-slate-950">
                  {readingType === 'X' ? 'X-Reading (Audit)' : 'Z-Reading (Closing)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Southern Olive and Oil Products S.A.R.L. • Shift #{activeShift.shiftNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODE SELECTOR & SUB-NAVIGATION                                            */}
        {/* ========================================================================= */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* X / Z Reading Toggle */}
          <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setReadingType('X')}
              className={`px-3.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                readingType === 'X'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              X-Reading (Mid-Shift Audit)
            </button>
            <button
              type="button"
              onClick={() => setReadingType('Z')}
              className={`px-3.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                readingType === 'Z'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Z-Reading (End of Shift Final)
            </button>
          </div>

          {/* Section View Tabs */}
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-2.5 py-1 rounded font-semibold cursor-pointer transition-colors ${
                activeTab === 'overview'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Overview & Sales
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tenders')}
              className={`px-2.5 py-1 rounded font-semibold cursor-pointer transition-colors ${
                activeTab === 'tenders'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tenders & Collections
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cashflow')}
              className={`px-2.5 py-1 rounded font-semibold cursor-pointer transition-colors ${
                activeTab === 'cashflow'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Drawer & Cash Flow
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('divisions')}
              className={`px-2.5 py-1 rounded font-semibold cursor-pointer transition-colors ${
                activeTab === 'divisions'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Divisions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('printPreview')}
              className={`px-2.5 py-1 rounded font-semibold cursor-pointer transition-colors ${
                activeTab === 'printPreview'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Print Preview
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL BODY (SCROLLABLE)                                                   */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Active Shift Header Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Company & Facility</span>
              <p className="font-bold text-slate-900 truncate">Southern Olive & Oil S.A.R.L.</p>
              <p className="text-[11px] text-slate-600 truncate">{branchName}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Workstation & Cashier</span>
              <p className="font-bold text-slate-900">{activeShift.workstation}</p>
              <p className="text-[11px] text-slate-600">{cashierName}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Shift Information</span>
              <p className="font-bold text-slate-900">Shift #{activeShift.shiftNumber}</p>
              <p className="text-[11px] text-slate-600 font-mono">
                {new Date(activeShift.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Active
              </p>
            </div>
            <div className="text-right sm:text-left">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Exchange Rate</span>
              <p className="font-bold text-emerald-700 font-mono">
                1 USD = {POS_EXCHANGE_RATE_LBP.toLocaleString()} LBP
              </p>
              <p className="text-[10px] text-slate-500">Official POS Reference</p>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* TAB 1: OVERVIEW & SALES                                              */}
          {/* ===================================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              {/* Primary KPI Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-[10px] font-bold text-blue-700 uppercase block">Gross Invoiced Sales</span>
                  <div className="text-lg font-black text-blue-950 font-mono mt-0.5">
                    ${summary.grossSalesUsd.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-blue-600 font-medium block truncate">
                    {summary.invoiceRangeText}
                  </span>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <span className="text-[10px] font-bold text-red-700 uppercase block">Discounts & Returns</span>
                  <div className="text-lg font-black text-red-700 font-mono mt-0.5">
                    -${(summary.discountsUsd + summary.returnsCreditNotesUsd).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-red-600 font-medium">
                    {summary.creditNoteCount} credit note(s)
                  </span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Net Sales Turnover</span>
                  <div className="text-lg font-black text-emerald-800 font-mono mt-0.5">
                    ${summary.finalTurnoverUsd.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">Net commercial revenue</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <span className="text-[10px] font-bold text-amber-700 uppercase block">Expected Cash Drawer</span>
                  <div className="text-lg font-black text-amber-900 font-mono mt-0.5">
                    ${summary.expectedCashUsd.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-amber-700 font-medium font-mono">
                    ≈ {(summary.expectedCashLbp / 1_000_000).toFixed(1)}M LBP
                  </span>
                </div>
              </div>

              {/* Financial Turnover Detailed Breakdown */}
              <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-2xs space-y-3">
                <h5 className="font-bold text-slate-800 border-b border-slate-200 pb-1.5 uppercase text-[11px] tracking-wider text-slate-500 flex items-center justify-between">
                  <span>Sales & Turnover Detailed Breakdown</span>
                  <span className="text-slate-400 font-normal lowercase">calculated from live pos transactions</span>
                </h5>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2 flex justify-between text-slate-700">
                    <span>Gross Sales (Invoiced Items Subtotal):</span>
                    <span className="font-mono font-bold">${summary.grossSalesUsd.toFixed(2)} USD</span>
                  </div>
                  <div className="py-2 flex justify-between text-slate-700">
                    <span>Discounts Allowed:</span>
                    <span className="font-mono text-red-600">-${summary.discountsUsd.toFixed(2)} USD</span>
                  </div>
                  <div className="py-2 flex justify-between text-slate-700">
                    <span>Sales Tax (11% VAT / ضريبة القيمة المضافة):</span>
                    <span className="font-mono text-slate-700">+${summary.taxUsd.toFixed(2)} USD</span>
                  </div>
                  <div className="py-2 flex justify-between text-slate-700">
                    <span>Returns & Credit Notes (مردودات المبيعات):</span>
                    <span className="font-mono text-red-600">-${summary.returnsCreditNotesUsd.toFixed(2)} USD</span>
                  </div>
                  <div className="py-2.5 flex justify-between font-bold text-slate-900 bg-slate-50 px-2 rounded-md">
                    <span className="text-sm">Final Net Turnover (صافي الدخل التجاري):</span>
                    <span className="font-mono text-base text-emerald-700">${summary.finalTurnoverUsd.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

              {/* Sales by Transaction Type */}
              <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-2xs space-y-3">
                <h5 className="font-bold text-slate-800 border-b border-slate-200 pb-1.5 uppercase text-[11px] tracking-wider text-slate-500">
                  Sales by Transaction Channel / Type
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-slate-500 text-[11px] font-semibold">Local Direct Sales</div>
                    <div className="text-base font-bold font-mono text-slate-900 mt-1">
                      ${summary.salesByTransactionType.localUsd.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-slate-500 text-[11px] font-semibold">International / Export Sales</div>
                    <div className="text-base font-bold font-mono text-slate-900 mt-1">
                      ${summary.salesByTransactionType.internationalUsd.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-slate-500 text-[11px] font-semibold">Online & Direct Dispatch</div>
                    <div className="text-base font-bold font-mono text-slate-900 mt-1">
                      ${summary.salesByTransactionType.onlineUsd.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: TENDERS & COLLECTIONS                                         */}
          {/* ===================================================================== */}
          {activeTab === 'tenders' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              {/* Tender Breakdown Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                  <h5 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
                    Collections by Payment Method (تفصيل المقبوضات حسب وسيلة الدفع)
                  </h5>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Total: ${summary.collectionsByTender.reduce((s, t) => s + t.usd, 0).toFixed(2)} USD
                  </span>
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Tender / Method</th>
                      <th className="py-2 px-3 text-center">Tx Count</th>
                      <th className="py-2 px-3 text-right">Amount (USD)</th>
                      <th className="py-2 px-3 text-right">Amount (LBP Equivalent)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.collectionsByTender.map((tender, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-slate-500" />
                          <span>{tender.label}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-600">{tender.count}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          ${tender.usd.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          {tender.lbp.toLocaleString()} LBP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Customer Account Debt Receipts (سندات القبض) */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs space-y-2">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
                      Customer Debt Receipts Collected Today (سندات القبض وحسابات الزبائن)
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Settlements received today reducing customer outstanding ledger balances
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      ${summary.customerReceiptsTotalUsd.toFixed(2)} USD
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono">
                      {summary.customerReceiptsTotalLbp.toLocaleString()} LBP
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  {summary.customerReceiptsList.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-500">
                      No customer debt receipts recorded during this active shift session.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="text-[11px] text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-1 px-2">Receipt #</th>
                          <th className="py-1 px-2">Customer</th>
                          <th className="py-1 px-2">Method</th>
                          <th className="py-1 px-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {summary.customerReceiptsList.map((rct, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-1.5 px-2 font-mono text-slate-700">{rct.id}</td>
                            <td className="py-1.5 px-2 font-medium text-slate-900">{rct.customerName}</td>
                            <td className="py-1.5 px-2 text-slate-600">{rct.method}</td>
                            <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-700">
                              ${rct.amountUsd.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: DRAWER & CASH FLOW                                            */}
          {/* ===================================================================== */}
          {activeTab === 'cashflow' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              {/* Expected Drawer Balance Formula Explanation Card */}
              <div className="border border-amber-200 bg-amber-50/60 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-amber-700" />
                    <h5 className="font-bold text-amber-950 uppercase text-[11px] tracking-wider">
                      Expected Drawer Balance Formula (معادلة رصيد الصندوق المتوقع)
                    </h5>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-200/80 text-amber-900">
                    Dual Currency
                  </span>
                </div>
                <p className="text-[11px] text-amber-900">
                  <code className="font-mono bg-amber-100/80 px-1 py-0.5 rounded text-amber-950">
                    Expected Cash = Opening Float + Cash Sales + Cash Customer Receipts + Paid In - Cash Refunds - Paid Out
                  </code>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* USD Calculation */}
                  <div className="bg-white rounded-md p-3 border border-amber-200 text-xs space-y-1.5 shadow-2xs">
                    <div className="font-bold text-slate-800 text-[11px] uppercase border-b border-slate-100 pb-1">
                      USD Cash Drawer Formula
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>(+) Opening Float:</span>
                      <span className="font-mono font-semibold">${summary.openingFloatUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>(+) Cash Invoiced Sales:</span>
                      <span className="font-mono font-semibold">${summary.cashSalesUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>(+) Cash Customer Receipts:</span>
                      <span className="font-mono font-semibold">${summary.cashCustomerReceiptsUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>(+) Paid In (Petty Cash Added):</span>
                      <span className="font-mono font-semibold">${summary.paidInTotalUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>(-) Cash Refunds (Credit Notes):</span>
                      <span className="font-mono text-red-600">-${summary.cashRefundsUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>(-) Paid Out (Expenses):</span>
                      <span className="font-mono text-red-600">-${summary.paidOutTotalUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1.5 bg-slate-50 p-1.5 rounded">
                      <span>Expected Cash in Drawer:</span>
                      <span className="font-mono text-emerald-700">${summary.expectedCashUsd.toFixed(2)} USD</span>
                    </div>
                  </div>

                  {/* LBP Calculation */}
                  <div className="bg-white rounded-md p-3 border border-amber-200 text-xs space-y-1.5 shadow-2xs">
                    <div className="font-bold text-slate-800 text-[11px] uppercase border-b border-slate-100 pb-1">
                      LBP Cash Drawer Formula (العملة المحلية)
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>(+) Opening Float:</span>
                      <span className="font-mono">{summary.openingFloatLbp.toLocaleString()} LBP</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>(+) Cash Invoiced Sales:</span>
                      <span className="font-mono">{summary.cashSalesLbp.toLocaleString()} LBP</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>(+) Cash Customer Receipts:</span>
                      <span className="font-mono">{summary.cashCustomerReceiptsLbp.toLocaleString()} LBP</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>(+) Paid In:</span>
                      <span className="font-mono">{summary.paidInTotalLbp.toLocaleString()} LBP</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>(-) Cash Refunds (Credit Notes):</span>
                      <span className="font-mono text-red-600">
                        -{summary.cashRefundsLbp.toLocaleString()} LBP
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>(-) Paid Out (Expenses):</span>
                      <span className="font-mono text-red-600">
                        -{summary.paidOutTotalLbp.toLocaleString()} LBP
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1.5 bg-slate-50 p-1.5 rounded">
                      <span>Expected Cash in Drawer:</span>
                      <span className="font-mono text-emerald-700">{summary.expectedCashLbp.toLocaleString()} LBP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cash Reconciliation Interactive Inputs (Overage / Shortage) */}
              <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-2xs space-y-3">
                <h5 className="font-bold text-slate-800 border-b border-slate-200 pb-1.5 uppercase text-[11px] tracking-wider text-slate-500">
                  Cash Reconciliation & Physical Count (مطابقة الصندوق الفعلي مع الدفتري)
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Inputs */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Opening Float Balance (الرصيد الافتتاحي للصندوق)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={openingFloatInputUsd}
                            onChange={(e) => setOpeningFloatInputUsd(e.target.value)}
                            placeholder="USD Float"
                            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 pl-6 text-xs text-slate-800 font-mono shadow-2xs"
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={openingFloatInputLbp}
                            onChange={(e) => setOpeningFloatInputLbp(e.target.value)}
                            placeholder="LBP Float"
                            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-mono shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Actual Counted Cash in Drawer (المبلغ الفعلي المقبوض بالصندوق)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={countedCashInputUsd}
                            onChange={(e) => setCountedCashInputUsd(e.target.value)}
                            placeholder="Counted USD"
                            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 pl-6 text-xs text-slate-800 font-mono shadow-2xs focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={countedCashInputLbp}
                            onChange={(e) => setCountedCashInputLbp(e.target.value)}
                            placeholder="Counted LBP"
                            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-mono shadow-2xs focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Variance Status Card */}
                  <div
                    className={`rounded-lg p-3.5 border flex flex-col justify-between transition-all ${
                      summary.reconciliationStatus === 'PENDING'
                        ? 'bg-amber-50/80 border-amber-300'
                        : summary.reconciliationStatus === 'BALANCED'
                        ? 'bg-blue-50/80 border-blue-200'
                        : summary.reconciliationStatus === 'OVERAGE'
                        ? 'bg-emerald-50/80 border-emerald-300'
                        : 'bg-red-50/80 border-red-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">
                          Reconciliation Status
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            summary.reconciliationStatus === 'PENDING'
                              ? 'bg-amber-200 text-amber-900 border border-amber-300'
                              : summary.reconciliationStatus === 'BALANCED'
                              ? 'bg-blue-200 text-blue-900'
                              : summary.reconciliationStatus === 'OVERAGE'
                              ? 'bg-emerald-200 text-emerald-950'
                              : 'bg-red-200 text-red-950'
                          }`}
                        >
                          {summary.reconciliationStatus === 'PENDING' && 'Pending Physical Count'}
                          {summary.reconciliationStatus === 'BALANCED' && 'Exact Match / متطابق'}
                          {summary.reconciliationStatus === 'OVERAGE' && 'Overage / زيادة (+) '}
                          {summary.reconciliationStatus === 'SHORTAGE' && 'Shortage / عجز (-) '}
                        </span>
                      </div>

                      {summary.reconciliationStatus === 'PENDING' ? (
                        <div className="mt-2.5 space-y-1">
                          <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Pending Physical Count — Enter Counted Cash in Drawer to reconcile</span>
                          </div>
                          <p className="text-[11px] text-amber-700">
                            Enter the actual physical cash counted in your cash drawer above to calculate variance.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="text-xl font-black font-mono mt-2 text-slate-900">
                            {summary.varianceUsd >= 0 ? '+' : ''}
                            ${summary.varianceUsd.toFixed(2)} USD
                          </div>
                          <div className="text-xs font-mono text-slate-600 mt-0.5">
                            {summary.varianceLbp >= 0 ? '+' : ''}
                            {summary.varianceLbp.toLocaleString()} LBP
                          </div>
                        </>
                      )}
                    </div>

                    {summary.reconciliationStatus !== 'PENDING' && (
                      <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200/60">
                        {summary.reconciliationStatus === 'BALANCED' &&
                          'Physical counted drawer cash matches expected ledger balance exactly.'}
                        {summary.reconciliationStatus === 'OVERAGE' &&
                          'There is surplus cash in drawer compared to system recorded sales and movements.'}
                        {summary.reconciliationStatus === 'SHORTAGE' &&
                          'Attention required: cash drawer is short compared to expected system receipts.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Paid In / Paid Out Itemized Log */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                  <h5 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
                    Paid In / Paid Out Itemized Movements (حركات المصاريف والإيداعات بالصندوق)
                  </h5>
                  <div className="text-xs space-x-3 font-mono">
                    <span className="text-emerald-700 font-bold">
                      In: +${summary.paidInTotalUsd.toFixed(2)} USD {summary.paidInTotalLbp > 0 ? `(${summary.paidInTotalLbp.toLocaleString()} LBP)` : ''}
                    </span>
                    <span className="text-red-600 font-bold">
                      Out: -${summary.paidOutTotalUsd.toFixed(2)} USD {summary.paidOutTotalLbp > 0 ? `(${summary.paidOutTotalLbp.toLocaleString()} LBP)` : ''}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  {summary.paidInOutList.length === 0 ? (
                    <div className="text-center py-3 text-xs text-slate-500">
                      No petty cash or paid in/out records for this shift session.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="text-[11px] text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-1 px-2">Time</th>
                          <th className="py-1 px-2">Type</th>
                          <th className="py-1 px-2">By</th>
                          <th className="py-1 px-2">Paid To</th>
                          <th className="py-1 px-2">Payment Type</th>
                          <th className="py-1 px-2">Description</th>
                          <th className="py-1 px-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {summary.paidInOutList.map((m, idx) => {
                          const disp = formatMovementDisplay(m);
                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-1.5 px-2 font-mono text-slate-500">{disp.time}</td>
                              <td className="py-1.5 px-2">
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    disp.isPaidIn
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {disp.typeDisplay} {disp.isPaidIn ? '(+)' : '(-)'}
                                </span>
                              </td>
                              <td className="py-1.5 px-2 text-slate-700">{disp.by}</td>
                              <td className="py-1.5 px-2 text-slate-700">{disp.paidTo}</td>
                              <td className="py-1.5 px-2 font-medium text-slate-700">{disp.paymentType}</td>
                              <td className="py-1.5 px-2 text-slate-600 truncate max-w-[200px]">{disp.description}</td>
                              <td
                                className={`py-1.5 px-2 text-right font-mono font-bold ${
                                  disp.isPaidIn ? 'text-emerald-700' : 'text-red-600'
                                }`}
                              >
                                {disp.amountStr}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: DIVISIONS & CATEGORIES                                        */}
          {/* ===================================================================== */}
          {activeTab === 'divisions' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                  <h5 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
                    Sales Turnover by Product Division / Department (مبيعات الأقسام)
                  </h5>
                  <span className="text-[11px] text-slate-500">Top commercial segments</span>
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Division</th>
                      <th className="py-2 px-3 text-center">Items Sold</th>
                      <th className="py-2 px-3 text-right">Revenue (USD)</th>
                      <th className="py-2 px-3 text-right">Share (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.divisionBreakdown.map((div, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-slate-400" />
                          <span>{div.division}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{div.itemCount}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          ${div.amountUsd.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-mono text-slate-700 font-medium">{div.percentage}%</span>
                            <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className="bg-primary h-full rounded-full"
                                style={{ width: `${Math.min(100, div.percentage)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 5: PRINT PREVIEW & PRINTABLE CONTAINER CONTAINER                 */}
          {/* ===================================================================== */}
          <div className={activeTab === 'printPreview' ? 'block' : 'hidden'}>
            <div className="border border-slate-300 rounded-lg p-4 bg-slate-50 flex justify-center">
              {/* Isolated Printable Container (#printable-main-reading) */}
              <div
                id="printable-main-reading"
                className={`bg-white border border-slate-300 shadow-sm p-6 text-slate-900 font-sans space-y-4 ${
                  printerType === 'thermal' ? 'w-[320px] text-[10px]' : 'w-full max-w-[750px] text-xs'
                }`}
              >
                {/* Header */}
                <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
                  <h2 className="font-black text-sm uppercase tracking-wider text-slate-950">
                    Southern Olive and Oil Products S.A.R.L.
                  </h2>
                  <p className="text-[11px] font-semibold text-slate-700">
                    منتوجات زيت وزيتون الجنوب ش.م.م
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                    Facility: [1300-01] Main • Vanguard ERP Commercial System
                  </p>
                  <div className="pt-2">
                    <span className="inline-block px-3 py-1 font-black text-xs uppercase border border-slate-900 bg-slate-100 rounded">
                      {readingType === 'X' ? 'MID-SHIFT X-READING AUDIT REPORT' : 'END-OF-DAY Z-READING CLOSING REPORT'}
                    </span>
                  </div>
                </div>

                {/* Shift Details Box */}
                <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-slate-300 pb-3">
                  <div>
                    <p>Facility: <strong className="font-bold">[1300-01] Main</strong></p>
                    <p>Branch: <strong className="font-bold">{summary.branch}</strong></p>
                    <p>Terminal: <strong className="font-bold">{summary.workstation}</strong></p>
                    <p>Cashier / User: <strong className="font-bold">{summary.cashierName}</strong></p>
                  </div>
                  <div className="text-right">
                    <p>Reading Slip #: <strong className="font-mono font-bold text-slate-900">{readingSlipNumber}</strong></p>
                    <p>Shift #: <strong className="font-mono font-bold">{summary.shiftNumber}</strong></p>
                    <p>Working Date: <strong className="font-mono font-bold">{workingDate || summary.workingDate || new Date().toISOString().split('T')[0]}</strong></p>
                    <p>Printed: <span className="font-mono">{summary.generatedAt}</span></p>
                  </div>
                </div>

                {/* Section 1 — Sales Totals (ملخص المبيعات) */}
                <div className="space-y-1 text-xs">
                  <div className="font-bold uppercase text-[10px] tracking-wider text-slate-800 border-b border-slate-200 pb-1 flex justify-between items-center">
                    <span>1. Sales Totals (ملخص المبيعات)</span>
                    <span className="font-mono font-semibold text-slate-600">{summary.invoiceRangeText}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gross Sales:</span>
                    <span className="font-mono font-bold">${summary.grossSalesUsd.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-red-700">
                    <span>(-) Total Discounts:</span>
                    <span className="font-mono">-${summary.discountsUsd.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-red-700">
                    <span>(-) Credit Notes / Returns:</span>
                    <span className="font-mono">-${summary.returnsCreditNotesUsd.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>(+) Tax / VAT:</span>
                    <span className="font-mono">+${summary.taxUsd.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-400 pt-1 text-sm text-slate-950">
                    <span>= Net Sales (صافي المبيعات الفعلية):</span>
                    <span className="font-mono">${summary.finalTurnoverUsd.toFixed(2)} USD</span>
                  </div>
                </div>

                {/* Section 2 — Sales Breakdown by Type, Division & Payment Mode */}
                <div className="space-y-1.5 text-xs pt-2">
                  <div className="font-bold uppercase text-[10px] tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                    2. Sales Breakdown by Type, Division & Settlement Mode
                  </div>
                  {/* By Transaction Type */}
                  <div className="bg-slate-50 p-2 rounded text-[11px] space-y-0.5">
                    <div className="font-semibold text-slate-700 text-[10px] uppercase">By Transaction Type:</div>
                    <div className="flex justify-between">
                      <span>Local Sales:</span>
                      <span className="font-mono font-bold">${summary.salesByTransactionType.localUsd.toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>International / Export:</span>
                      <span className="font-mono font-bold">${summary.salesByTransactionType.internationalUsd.toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Online / Delivery:</span>
                      <span className="font-mono font-bold">${summary.salesByTransactionType.onlineUsd.toFixed(2)} USD</span>
                    </div>
                  </div>

                  {/* By Division */}
                  <div className="bg-slate-50 p-2 rounded text-[11px] space-y-0.5">
                    <div className="font-semibold text-slate-700 text-[10px] uppercase">By Division:</div>
                    {summary.divisionBreakdown.map((div, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{div.division} ({div.itemCount} items):</span>
                        <span className="font-mono font-bold">${div.amountUsd.toFixed(2)} USD ({div.percentage}%)</span>
                      </div>
                    ))}
                  </div>

                  {/* By Settlement Mode */}
                  <div className="bg-slate-50 p-2 rounded text-[11px] space-y-0.5">
                    <div className="font-semibold text-slate-700 text-[10px] uppercase">By Settlement Mode:</div>
                    <div className="flex justify-between">
                      <span>Cash Sales:</span>
                      <span className="font-mono font-bold">${summary.settlementMode.cashSalesUsd.toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Credit / On Account Sales (ذمم):</span>
                      <span className="font-mono font-bold">${summary.settlementMode.creditSalesUsd.toFixed(2)} USD</span>
                    </div>
                    {summary.settlementMode.cardSalesUsd > 0 && (
                      <div className="flex justify-between">
                        <span>Credit Card Sales:</span>
                        <span className="font-mono font-bold">${summary.settlementMode.cardSalesUsd.toFixed(2)} USD</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3 — Collections by Payment Method (تفصيل طرق الدفع) */}
                <div className="space-y-1 text-xs pt-2">
                  <div className="font-bold uppercase text-[10px] tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                    3. Collections by Payment Method (تفصيل طرق الدفع)
                  </div>
                  {summary.collectionsByTender.map((t, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span>{t.label} ({t.count}):</span>
                      <span className="font-mono font-bold">${t.usd.toFixed(2)} USD</span>
                    </div>
                  ))}
                </div>

                {/* Section 4 — Non-Sales Drawer Movements (حركات الصندوق النثرية) */}
                <div className="space-y-1 text-xs pt-2">
                  <div className="font-bold uppercase text-[10px] tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                    4. Non-Sales Drawer Movements (حركات الصندوق النثرية)
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>(+) Opening Float:</span>
                    <span className="font-mono font-bold">
                      +${summary.openingFloatUsd.toFixed(2)} USD {summary.openingFloatLbp > 0 ? `(${summary.openingFloatLbp.toLocaleString()} LBP)` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>(+) Paid In:</span>
                    <span className="font-mono font-bold">
                      +${summary.paidInTotalUsd.toFixed(2)} USD {summary.paidInTotalLbp > 0 ? `(${summary.paidInTotalLbp.toLocaleString()} LBP)` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>(+) Customer Receipts (مقبوضات تسديد ذمم سابقة):</span>
                    <span className="font-mono font-bold">
                      +${summary.customerReceiptsTotalUsd.toFixed(2)} USD {summary.customerReceiptsTotalLbp > 0 ? `(${summary.customerReceiptsTotalLbp.toLocaleString()} LBP)` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-red-700">
                    <span>(-) Paid Out:</span>
                    <span className="font-mono font-bold">
                      -${summary.paidOutTotalUsd.toFixed(2)} USD {summary.paidOutTotalLbp > 0 ? `(${summary.paidOutTotalLbp.toLocaleString()} LBP)` : ''}
                    </span>
                  </div>
                </div>

                {/* Section 5 — Final Net Cash in Drawer (الرصيد الفعلي المطلوب بالصندوق) */}
                <div className="space-y-1.5 text-xs pt-2 border-t-2 border-slate-900">
                  <div className="font-bold uppercase text-[10px] tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    5. Final Net Cash in Drawer (الرصيد الفعلي المطلوب بالصندوق)
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1 text-[11px]">
                    <div className="text-[10px] text-slate-500 font-mono">
                      Formula: (Opening + Cash Sales + Cash Receipts + Paid In) - (Cash Returns + Paid Out)
                    </div>
                    <div className="flex justify-between font-bold text-slate-950 text-xs">
                      <span>Net Cash USD in Drawer:</span>
                      <span className="font-mono text-sm">${summary.expectedCashUsd.toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-950 text-xs">
                      <span>Net Cash LBP in Drawer:</span>
                      <span className="font-mono text-sm">{summary.expectedCashLbp.toLocaleString()} LBP</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1 text-slate-700">
                      <span>Actual Counted Cash:</span>
                      <span className="font-mono">
                        {summary.reconciliationStatus === 'PENDING'
                          ? 'Pending Physical Count'
                          : `$${summary.actualCountedUsd.toFixed(2)} USD (${summary.actualCountedLbp.toLocaleString()} LBP)`}
                      </span>
                    </div>
                    <div className="flex justify-between font-black border-t border-slate-300 pt-1 text-slate-950">
                      <span>Variance (Short / Over):</span>
                      <span className="font-mono">
                        {summary.reconciliationStatus === 'PENDING'
                          ? 'Pending Reconciliation'
                          : `${summary.varianceUsd >= 0 ? '+' : ''}$${summary.varianceUsd.toFixed(2)} USD (${summary.varianceLbp >= 0 ? '+' : ''}${summary.varianceLbp.toLocaleString()} LBP)`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-6 grid grid-cols-2 gap-6 text-[10px] border-t border-slate-300 text-center">
                  <div>
                    <div className="h-8 border-b border-dashed border-slate-400"></div>
                    <span className="mt-1 block font-semibold">Cashier Signature</span>
                  </div>
                  <div>
                    <div className="h-8 border-b border-dashed border-slate-400"></div>
                    <span className="mt-1 block font-semibold">Store Manager / Auditor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL FOOTER ACTIONS                                                      */}
        {/* ========================================================================= */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              {readingType === 'X'
                ? 'X-Reading mode: Read-only live audit snapshot (counters preserved)'
                : 'Z-Reading mode: Finalizes shift, archives counters, and resets drawer session'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-200 rounded-md text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>{readingType === 'X' ? 'Print X-Reading Audit' : 'Print Z-Reading Slip'}</span>
            </button>

            {/* Close Shift / Z-Report Action Button */}
            {readingType === 'Z' && (
              <button
                type="button"
                disabled={isClosingShift}
                onClick={handleCloseShift}
                className="bg-red-700 hover:bg-red-800 text-white px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5 text-red-200" />
                <span>{isClosingShift ? 'Closing Shift...' : 'Close Shift / Z-Report (إقفال اليومية)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
