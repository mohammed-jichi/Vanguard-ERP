'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Printer,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  AlertTriangle,
  FileText,
  Trash2,
  Receipt,
  Layers,
  Building2,
  UserCheck,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { printElementById } from '@/lib/utils/printDocument';
import {
  CashMovement,
  CashMovementType,
  REASON_CATEGORIES,
  ReasonCategoryConfig,
  getCashMovements,
  recordCashMovement,
  voidCashMovement,
  getActiveShift,
  POS_EXCHANGE_RATE_LBP,
  CASH_MOVEMENTS_UPDATED_EVENT,
  generateNextMovementNumber
} from '@/lib/posShiftService';

interface PaidInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDrawerBalance?: number;
  onDrawerBalanceChange?: (newBalance: number) => void;
  onMovementRecorded?: (movement: CashMovement) => void;
  branchName?: string;
  cashierName?: string;
  tenantId?: string;
  printerType?: 'a4' | 'thermal' | 'a5' | 'dot_matrix';
}

export default function PaidInOutModal({
  isOpen,
  onClose,
  currentDrawerBalance = 0,
  onDrawerBalanceChange,
  onMovementRecorded,
  branchName = 'Southern Olive and Oil Products S.A.R.L.',
  cashierName = 'Active Cashier',
  tenantId,
  printerType = 'thermal'
}: PaidInOutModalProps) {
  // Form State
  const [movementType, setMovementType] = useState<CashMovementType>('PAID_OUT');
  const [currencyCode, setCurrencyCode] = useState<'USD' | 'LBP' | 'EUR' | 'GBP'>('USD');
  const [amount, setAmount] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(POS_EXCHANGE_RATE_LBP);
  const [reasonCategory, setReasonCategory] = useState<string>('PETTY_EXPENSE');
  const [notes, setNotes] = useState<string>('');
  const [printOnSave, setPrintOnSave] = useState<boolean>(true);
  const [autoJournalEntry, setAutoJournalEntry] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // List and Search
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [printingVoucher, setPrintingVoucher] = useState<CashMovement | null>(null);

  // Load movements on open
  useEffect(() => {
    if (isOpen) {
      setMovements(getCashMovements());
    }
  }, [isOpen]);

  // Listen to updates from other tabs / components
  useEffect(() => {
    const handleMovementsUpdated = () => {
      setMovements(getCashMovements());
    };
    window.addEventListener(CASH_MOVEMENTS_UPDATED_EVENT, handleMovementsUpdated);
    window.addEventListener('storage', handleMovementsUpdated);
    return () => {
      window.removeEventListener(CASH_MOVEMENTS_UPDATED_EVENT, handleMovementsUpdated);
      window.removeEventListener('storage', handleMovementsUpdated);
    };
  }, []);

  // Update default category when movement type changes
  const handleTypeChange = (type: CashMovementType) => {
    setMovementType(type);
    if (type === 'PAID_IN') {
      setReasonCategory('OPENING_FLOAT');
    } else {
      setReasonCategory('PETTY_EXPENSE');
    }
  };

  const selectedCategoryConfig = useMemo(() => {
    return (
      REASON_CATEGORIES.find((c) => c.code === reasonCategory) ||
      REASON_CATEGORIES.find((c) => c.code === 'OTHER')!
    );
  }, [reasonCategory]);

  // Filtered categories according to current movement type (with ability to select all)
  const availableCategories = useMemo(() => {
    return REASON_CATEGORIES;
  }, []);

  // Equivalent calculation
  const numericAmount = parseFloat(amount) || 0;
  const calculatedEquivalents = useMemo(() => {
    if (currencyCode === 'USD') {
      const lbpEquivalent = Math.round(numericAmount * exchangeRate);
      return {
        usd: numericAmount,
        lbp: lbpEquivalent,
        displaySecondary: `≈ ${lbpEquivalent.toLocaleString()} LBP`
      };
    } else if (currencyCode === 'LBP') {
      const usdEquivalent = Number((numericAmount / exchangeRate).toFixed(2));
      return {
        usd: usdEquivalent,
        lbp: numericAmount,
        displaySecondary: `≈ $${usdEquivalent.toFixed(2)} USD`
      };
    } else {
      return {
        usd: numericAmount,
        lbp: Math.round(numericAmount * exchangeRate),
        displaySecondary: `Rate: ${exchangeRate}`
      };
    }
  }, [currencyCode, numericAmount, exchangeRate]);

  // Running totals for active shift
  const runningTotals = useMemo(() => {
    let totalInUsd = 0;
    let totalInLbp = 0;
    let totalOutUsd = 0;
    let totalOutLbp = 0;

    movements.forEach((m) => {
      if (m.isVoided) return;
      const amtUsd = m.amountUsd || 0;
      const amtLbp = m.amountLbp || amtUsd * exchangeRate;
      if (m.movementType === 'PAID_IN' || m.type === 'PAID_IN') {
        totalInUsd += amtUsd;
        totalInLbp += amtLbp;
      } else {
        totalOutUsd += amtUsd;
        totalOutLbp += amtLbp;
      }
    });

    const netUsd = totalInUsd - totalOutUsd;
    const netLbp = totalInLbp - totalOutLbp;

    return { totalInUsd, totalInLbp, totalOutUsd, totalOutLbp, netUsd, netLbp };
  }, [movements, exchangeRate]);

  // Filtered movements for table
  const filteredMovements = useMemo(() => {
    if (!searchQuery.trim()) return movements;
    const q = searchQuery.toLowerCase();
    return movements.filter(
      (m) =>
        (m.movementNo && m.movementNo.toLowerCase().includes(q)) ||
        (m.notes && m.notes.toLowerCase().includes(q)) ||
        (m.category && m.category.toLowerCase().includes(q)) ||
        (m.targetAccountName && m.targetAccountName.toLowerCase().includes(q)) ||
        (m.cashierName && m.cashierName.toLowerCase().includes(q))
    );
  }, [movements, searchQuery]);

  // Handle Record Movement
  const handleSubmitMovement = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (numericAmount <= 0) {
      toast.error('Please enter a valid amount greater than 0.');
      return;
    }
    if (!notes.trim()) {
      toast.error('Please enter a description / justification note (البيان).');
      return;
    }

    setIsSubmitting(true);
    try {
      const activeShift = getActiveShift();
      const newMovement = await recordCashMovement(
        {
          shiftId: activeShift.id,
          branchId: branchName,
          cashierName,
          movementType,
          currencyCode,
          amount: numericAmount,
          exchangeRate,
          reasonCategory,
          category: selectedCategoryConfig.labelEn,
          targetAccountId: selectedCategoryConfig.targetAccountId,
          targetAccountNumber: selectedCategoryConfig.targetAccountNumber,
          targetAccountName: selectedCategoryConfig.targetAccountName,
          notes: notes.trim()
        },
        tenantId
      );

      // Adjust drawer cash balance callback
      if (onDrawerBalanceChange) {
        const deltaUsd = newMovement.amountUsd;
        const nextBalance =
          movementType === 'PAID_IN'
            ? currentDrawerBalance + deltaUsd
            : Math.max(0, currentDrawerBalance - deltaUsd);
        onDrawerBalanceChange(nextBalance);
      }

      if (onMovementRecorded) {
        onMovementRecorded(newMovement);
      }

      toast.success(
        `Recorded ${movementType === 'PAID_IN' ? 'Paid In' : 'Paid Out'} voucher ${newMovement.movementNo} successfully!`
      );

      // Auto Print if requested
      if (printOnSave) {
        setPrintingVoucher(newMovement);
        setTimeout(() => {
          printElementById('printable-cash-voucher', `Cash Voucher ${newMovement.movementNo}`);
        }, 150);
      }

      // Reset form
      setAmount('');
      setNotes('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to record cash movement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Void
  const handleVoidMovement = async (movement: CashMovement) => {
    if (movement.isVoided) return;
    const confirm = window.confirm(
      `Are you sure you want to void voucher ${movement.movementNo} ($${movement.amountUsd.toFixed(2)})?\nThis will reverse its effect on Expected Drawer Balance and mark the linked accounting journal entry as Void.`
    );
    if (!confirm) return;

    const reason = window.prompt('Please enter a void justification reason:', 'Error in entry / cancelled');
    if (reason === null) return;

    try {
      await voidCashMovement(movement.id, reason, tenantId);
      toast.success(`Voucher ${movement.movementNo} voided successfully.`);

      // Adjust drawer balance if callback provided
      if (onDrawerBalanceChange) {
        const deltaUsd = movement.amountUsd;
        const nextBalance =
          movement.movementType === 'PAID_IN'
            ? Math.max(0, currentDrawerBalance - deltaUsd)
            : currentDrawerBalance + deltaUsd;
        onDrawerBalanceChange(nextBalance);
      }
    } catch (e: any) {
      toast.error('Failed to void cash movement.');
    }
  };

  // Handle Manual Print
  const handlePrintVoucher = (movement: CashMovement) => {
    setPrintingVoucher(movement);
    setTimeout(() => {
      printElementById('printable-cash-voucher', `Cash Voucher ${movement.movementNo}`);
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* ========================================================================= */}
        {/* 1. MODAL HEADER                                                           */}
        {/* ========================================================================= */}
        <div className="bg-primary text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight">
                  Paid In / Out — Cash Drawer Movements
                </h3>
                <span className="bg-white/15 text-white/90 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/20">
                  Vanguard ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-200">
                Southern Olive and Oil Products S.A.R.L. (منتوجات زيت وزيتون الجنوب ش.م.م) • Facility: [1300-01] Main
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. DRAWER CASH BANNER & RUNNING TOTALS                                    */}
        {/* ========================================================================= */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                Active Drawer Balance
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-mono font-extrabold text-emerald-700">
                  ${currentDrawerBalance.toFixed(2)} USD
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  ({Math.round(currentDrawerBalance * POS_EXCHANGE_RATE_LBP).toLocaleString()} LBP)
                </span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div className="hidden sm:block text-[11px] text-slate-600">
              <p><span className="text-slate-400">Cashier:</span> <span className="font-semibold">{cashierName}</span></p>
              <p><span className="text-slate-400">Station:</span> <span className="font-semibold">POS-01 • Shift #{getActiveShift().shiftNumber}</span></p>
            </div>
          </div>

          {/* Running Totals */}
          <div className="flex items-center gap-2 text-[11px]">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-md">
              <span className="text-[10px] block font-semibold text-emerald-600">(+) Total Paid In</span>
              <span className="font-mono font-bold">+${runningTotals.totalInUsd.toFixed(2)}</span>
            </div>
            <div className="bg-red-50 border border-red-200 text-red-800 px-2.5 py-1 rounded-md">
              <span className="text-[10px] block font-semibold text-red-600">(-) Total Paid Out</span>
              <span className="font-mono font-bold">-${runningTotals.totalOutUsd.toFixed(2)}</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 text-blue-900 px-2.5 py-1 rounded-md font-mono font-bold">
              <span className="text-[10px] block font-semibold text-blue-600 font-sans">Net Cashflow</span>
              <span>{runningTotals.netUsd >= 0 ? '+' : ''}${runningTotals.netUsd.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MODAL BODY (FORM + LIVE TABLE)                                         */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          
          {/* Movement Input Form */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-primary" />
                <span>New Cash Movement Entry (حركة نقدية جديدة)</span>
              </h4>
              <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Next: {generateNextMovementNumber(movementType)}
              </span>
            </div>

            {/* Mode Selector Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('PAID_OUT')}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-3 ${
                  movementType === 'PAID_OUT'
                    ? 'bg-red-50/70 border-red-500 ring-2 ring-red-500/20 text-red-950'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-md shrink-0 ${
                  movementType === 'PAID_OUT' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">Paid Out (سحب نقدي / مصاريف نثرية)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Disburses petty cash or transfers to safe; decreases drawer balance.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('PAID_IN')}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-3 ${
                  movementType === 'PAID_IN'
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-md shrink-0 ${
                  movementType === 'PAID_IN' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">Paid In (إيداع نقدي بالصندوق / فراطة)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Deposits float or miscellaneous funds; increases drawer balance.
                  </div>
                </div>
              </button>
            </div>

            {/* Inputs: Amount, Currency, Rate, Category */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Currency Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Currency (العملة)
                </label>
                <select
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  <option value="USD">USD ($) — Dollar</option>
                  <option value="LBP">LBP (ل.ل) — Lebanese Pound</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Amount (المبلغ) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border border-slate-300 rounded-md pl-2.5 pr-14 py-1.5 font-mono font-bold text-slate-900 bg-white focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 uppercase pointer-events-none">
                    {currencyCode}
                  </div>
                </div>
                {numericAmount > 0 && (
                  <span className="text-[10px] font-mono text-emerald-600 block mt-0.5">
                    {calculatedEquivalents.displaySecondary}
                  </span>
                )}
              </div>

              {/* Exchange Rate */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Exchange Rate (سعر الصرف)
                </label>
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(Number(e.target.value) || POS_EXCHANGE_RATE_LBP)}
                  className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 font-mono text-slate-800 bg-white focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Reason Category & GL Counter Account */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Category & Counter GL (التصنيف المحاسبي)
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat.code} value={cat.code}>
                      {cat.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mapped GL Account Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="font-semibold text-slate-500">Counter GL Account (حساب المقابل):</span>
                <span className="font-mono font-bold text-primary">[{selectedCategoryConfig.targetAccountNumber}]</span>
                <span className="font-medium text-slate-800">{selectedCategoryConfig.targetAccountName}</span>
              </div>
              <span className="text-[10px] text-slate-500 italic">
                {movementType === 'PAID_OUT' ? 'Debit (من ح/)' : 'Credit (إلى ح/)'}
              </span>
            </div>

            {/* Mandatory Notes / Description */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Description / Justification (البيان والسبب) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. شراء غالون مياه للمحل / Van #4 fuel receipt - Coral Station / فراطة أول النهار"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 bg-white focus:ring-1 focus:ring-primary focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitMovement();
                  }
                }}
              />
            </div>

            {/* Action Checkboxes & Submit Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-4 text-[11px] text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={printOnSave}
                    onChange={(e) => setPrintOnSave(e.target.checked)}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span>Print Cash Voucher on Save (طباعة السند فور الحفظ)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoJournalEntry}
                    onChange={(e) => setAutoJournalEntry(e.target.checked)}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span>Auto GL Double-Entry (قيد محاسبي آلي)</span>
                </label>
              </div>

              <button
                type="button"
                onClick={() => handleSubmitMovement()}
                disabled={isSubmitting}
                className={`px-5 py-2 rounded-md font-bold text-xs text-white cursor-pointer shadow-xs flex items-center gap-2 transition-all ${
                  movementType === 'PAID_OUT'
                    ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                    : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400'
                }`}
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>
                  Record {movementType === 'PAID_IN' ? 'Paid In' : 'Paid Out'} Voucher
                </span>
              </button>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* 4. LIVE SHIFT MOVEMENTS HISTORY TABLE                                   */}
          {/* ======================================================================= */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>Active Shift Cash Drawer Movements</span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {filteredMovements.length} Record{filteredMovements.length !== 1 ? 's' : ''}
                </span>
              </h5>

              {/* Search filter */}
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter vouchers, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-3">Voucher #</th>
                      <th className="py-2 px-2">Time</th>
                      <th className="py-2 px-2">Type</th>
                      <th className="py-2 px-2">Counter Account & Notes</th>
                      <th className="py-2 px-2 text-right">Amount</th>
                      <th className="py-2 px-2 text-center">GL Entry</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMovements.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">
                          No cash drawer movements recorded yet for this shift.
                        </td>
                      </tr>
                    ) : (
                      filteredMovements.map((item) => {
                        const isVoid = Boolean(item.isVoided);
                        const isPaidIn = item.movementType === 'PAID_IN' || item.type === 'PAID_IN' || item.type === 'in';
                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-slate-50 transition-colors ${
                              isVoid ? 'opacity-40 bg-slate-50/50 line-through' : ''
                            }`}
                          >
                            {/* Voucher # */}
                            <td className="py-2 px-3 font-mono font-bold text-slate-800">
                              {item.movementNo || item.id}
                            </td>

                            {/* Time */}
                            <td className="py-2 px-2 text-slate-500 font-mono">
                              {item.timestamp || item.createdAt?.slice(11, 16) || '—'}
                            </td>

                            {/* Type Badge */}
                            <td className="py-2 px-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                  isPaidIn
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {isPaidIn ? (
                                  <>
                                    <ArrowDownLeft className="w-2.5 h-2.5" />
                                    <span>Paid In</span>
                                  </>
                                ) : (
                                  <>
                                    <ArrowUpRight className="w-2.5 h-2.5" />
                                    <span>Paid Out</span>
                                  </>
                                )}
                              </span>
                            </td>

                            {/* Category & Notes */}
                            <td className="py-2 px-2 max-w-xs">
                              <p className="font-semibold text-slate-800 truncate">
                                {item.targetAccountName || item.category || 'General Cash'}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate" title={item.notes}>
                                {item.notes}
                              </p>
                              {isVoid && item.voidReason && (
                                <p className="text-[10px] text-red-600 italic">
                                  Void reason: {item.voidReason}
                                </p>
                              )}
                            </td>

                            {/* Amount */}
                            <td className="py-2 px-2 text-right font-mono font-bold">
                              <span
                                className={
                                  isPaidIn ? 'text-emerald-700' : 'text-red-600'
                                }
                              >
                                {isPaidIn ? '+' : '-'}${item.amountUsd.toFixed(2)}
                              </span>
                              <span className="block text-[10px] text-slate-400 font-normal">
                                {item.amountLbp.toLocaleString()} LBP
                              </span>
                            </td>

                            {/* GL Entry */}
                            <td className="py-2 px-2 text-center">
                              {item.journalEntryId ? (
                                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded">
                                  JV-{item.movementNo || 'AUTO'}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">—</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-2 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handlePrintVoucher(item)}
                                  className="p-1 rounded text-slate-600 hover:text-primary hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="Print Voucher (طباعة السند)"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                {!isVoid && (
                                  <button
                                    type="button"
                                    onClick={() => handleVoidMovement(item)}
                                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Void Movement (إلغاء الحركة)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. MODAL FOOTER                                                           */}
        {/* ========================================================================= */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            <span>Synchronized with Main Reading & General Ledger • </span>
            <span className="font-semibold text-slate-700">Vanguard ERP</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. ISOLATED PRINTABLE CASH VOUCHER CONTAINER (#printable-cash-voucher)    */}
      {/* ========================================================================= */}
      <div id="printable-cash-voucher" className="hidden">
        {printingVoucher && (
          <div
            style={{
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              color: '#000000',
              padding: printerType === 'thermal' ? '5mm' : '15mm',
              maxWidth: printerType === 'thermal' ? '76mm' : '210mm',
              margin: '0 auto',
              backgroundColor: '#ffffff'
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000000', paddingBottom: '8px', marginBottom: '12px' }}>
              <h2 style={{ margin: '0 0 2px 0', fontSize: printerType === 'thermal' ? '14px' : '18px', fontWeight: 'bold' }}>
                SOUTHERN OLIVE AND OIL PRODUCTS S.A.R.L.
              </h2>
              <h3 style={{ margin: '0 0 4px 0', fontSize: printerType === 'thermal' ? '12px' : '15px', fontWeight: 'bold' }}>
                شركة منتوجات زيت وزيتون الجنوب ش.م.م
              </h3>
              <p style={{ margin: '0', fontSize: printerType === 'thermal' ? '9px' : '11px', color: '#444' }}>
                Branch [1300-01] Main • Pressing & Commercial Operations Center
              </p>
            </div>

            {/* Voucher Title */}
            <div style={{ textAlign: 'center', margin: '10px 0', padding: '6px', border: '1px solid #000', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
              <h4 style={{ margin: 0, fontSize: printerType === 'thermal' ? '13px' : '16px', fontWeight: 'bold' }}>
                {printingVoucher.movementType === 'PAID_IN'
                  ? 'CASH PAID IN VOUCHER (سند قبض نقدي بالصندوق)'
                  : 'CASH PAID OUT VOUCHER (سند صرف نقدي من الصندوق)'}
              </h4>
            </div>

            {/* Meta Table */}
            <table style={{ width: '100%', fontSize: printerType === 'thermal' ? '10px' : '12px', borderCollapse: 'collapse', marginBottom: '12px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Voucher No / رقم السند:</td>
                  <td style={{ padding: '3px 0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {printingVoucher.movementNo}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Date & Time / التاريخ:</td>
                  <td style={{ padding: '3px 0', textAlign: 'right' }}>
                    {new Date(printingVoucher.createdAt).toLocaleDateString()} {printingVoucher.timestamp || ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Shift & Terminal / الوردية:</td>
                  <td style={{ padding: '3px 0', textAlign: 'right' }}>
                    {printingVoucher.shiftId} • POS-01
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Cashier / منظم السند:</td>
                  <td style={{ padding: '3px 0', textAlign: 'right' }}>
                    {printingVoucher.cashierName}
                  </td>
                </tr>
                {printingVoucher.journalEntryId && (
                  <tr>
                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Accounting JV # / رقم القيد:</td>
                    <td style={{ padding: '3px 0', textAlign: 'right', fontFamily: 'monospace' }}>
                      JV-{printingVoucher.movementNo}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Accounting GL Box */}
            <div style={{ border: '1px dashed #000', padding: '8px', borderRadius: '4px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: printerType === 'thermal' ? '10px' : '12px' }}>
                <span style={{ fontWeight: 'bold' }}>
                  {printingVoucher.movementType === 'PAID_IN' ? 'Debit (من ح/ - الصندوق):' : 'Debit (من ح/ - المصروف/الخزينة):'}
                </span>
                <span style={{ textAlign: 'right' }}>
                  {printingVoucher.movementType === 'PAID_IN'
                    ? '[53100] POS Cash Drawer'
                    : `[${printingVoucher.targetAccountNumber || '61500'}] ${printingVoucher.targetAccountName}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: printerType === 'thermal' ? '10px' : '12px' }}>
                <span style={{ fontWeight: 'bold' }}>
                  {printingVoucher.movementType === 'PAID_IN' ? 'Credit (إلى ح/ - الخزينة المقابلة):' : 'Credit (إلى ح/ - الصندوق):'}
                </span>
                <span style={{ textAlign: 'right' }}>
                  {printingVoucher.movementType === 'PAID_IN'
                    ? `[${printingVoucher.targetAccountNumber || '53000'}] ${printingVoucher.targetAccountName}`
                    : '[53100] POS Cash Drawer'}
                </span>
              </div>
            </div>

            {/* Amount Box */}
            <div style={{ border: '2px solid #000', padding: '10px', textAlign: 'center', marginBottom: '14px', borderRadius: '4px' }}>
              <span style={{ fontSize: printerType === 'thermal' ? '10px' : '11px', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Total Movement Amount / المبلغ الصافي
              </span>
              <div style={{ fontSize: printerType === 'thermal' ? '18px' : '24px', fontWeight: 'extrabold', fontFamily: 'monospace', margin: '4px 0' }}>
                ${printingVoucher.amountUsd.toFixed(2)} USD
              </div>
              <div style={{ fontSize: printerType === 'thermal' ? '11px' : '13px', fontFamily: 'monospace', color: '#333' }}>
                {printingVoucher.amountLbp.toLocaleString()} LBP (Rate: {printingVoucher.exchangeRate.toLocaleString()})
              </div>
            </div>

            {/* Reason / Notes */}
            <div style={{ border: '1px solid #ccc', padding: '8px', borderRadius: '4px', marginBottom: '20px', fontSize: printerType === 'thermal' ? '10px' : '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Description & Justification / البيان والسبب:</div>
              <div style={{ fontStyle: 'italic', color: '#222' }}>
                {printingVoucher.notes}
              </div>
            </div>

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '10px', borderTop: '1px solid #ddd', fontSize: printerType === 'thermal' ? '9px' : '11px' }}>
              <div style={{ textAlign: 'center', width: '45%' }}>
                <div style={{ height: '40px' }} />
                <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', fontWeight: 'bold' }}>
                  Cashier Signature
                  <br />
                  توقيع أمين الصندوق
                </div>
              </div>
              <div style={{ textAlign: 'center', width: '45%' }}>
                <div style={{ height: '40px' }} />
                <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', fontWeight: 'bold' }}>
                  Receiver / Manager Signature
                  <br />
                  توقيع المستلم أو المدير
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '8px', color: '#666', borderTop: '1px solid #eee', paddingTop: '6px' }}>
              Generated by Vanguard ERP • Southern Olive and Oil Products S.A.R.L.
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
