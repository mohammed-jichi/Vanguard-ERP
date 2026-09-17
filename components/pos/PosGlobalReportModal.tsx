'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Printer,
  Download,
  Calendar,
  Layers,
  Banknote,
  CreditCard,
  Building2,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { POS_EXCHANGE_RATE } from '@/lib/pos/posStateEngine';

interface PosGlobalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint?: () => void;
  onEndOfDay?: () => void;
}

export default function PosGlobalReportModal({
  isOpen,
  onClose,
  onPrint,
  onEndOfDay,
}: PosGlobalReportModalProps) {
  const [notification, setNotification] = useState<string | null>(null);

  // Global Report Financial Snapshot
  const reportData = {
    businessDate: new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    generatedAt: new Date().toLocaleTimeString('en-US', { hour12: false }),
    facility: 'Choueifat Main Facility',
    grossSalesUsd: 4850.0,
    discountsUsd: 125.0,
    netSalesUsd: 4725.0,
    taxUsd: 519.75,
    totalSalesUsd: 5244.75,
    totalInvoices: 48,
    voidedCount: 2,
    refundsUsd: 45.0,
    tenders: [
      { method: 'Cash USD', usd: 2840.0, lbp: 2840.0 * POS_EXCHANGE_RATE, count: 24 },
      { method: 'Cash LBP', usd: 1150.0, lbp: 102925000, count: 14 },
      { method: 'Credit Card USD', usd: 744.75, lbp: 744.75 * POS_EXCHANGE_RATE, count: 6 },
      { method: 'Credit Card LBP', usd: 260.0, lbp: 23270000, count: 2 },
      { method: 'Customer Account', usd: 250.0, lbp: 250.0 * POS_EXCHANGE_RATE, count: 2 },
    ],
    workstations: [
      { id: 'W#: 1', cashier: 'Maya & Ahmad', transactions: 32, salesUsd: 3520.0 },
      { id: 'W#: 2', cashier: 'Hadi (Admin)', transactions: 16, salesUsd: 1724.75 },
    ],
  };

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'F1') {
        e.preventDefault();
        notify('Printing Global Report to Thermal Receipt Printer...');
        onPrint?.();
      } else if (e.key === 'F3') {
        e.preventDefault();
        notify('Global Report exported to CSV / Excel spreadsheet.');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrint]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in select-none">
      <div className="bg-[#141822] border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] text-slate-100 overflow-hidden shadow-2xl flex flex-col font-sans">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#1b2230] border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shadow-md">
              <FileSpreadsheet className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-mono font-black text-amber-400 tracking-wide uppercase">
                  GLOBAL DAILY SALES AUDIT REPORT
                </h2>
                <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/70 text-[10px] font-mono text-amber-300 font-bold">
                  CTRL + F4
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{reportData.facility}</span>
                <span>•</span>
                <span>Date: {reportData.businessDate}</span>
                <span>•</span>
                <span>Time: {reportData.generatedAt}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="bg-emerald-950/90 border-b border-emerald-500 px-6 py-2 text-xs font-mono text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* Scrollable Report Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* 1. Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-4 rounded-xl bg-[#1a202c] border border-slate-700">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Gross Sales</span>
              <span className="text-xl font-black text-slate-100 mt-1 block">
                ${reportData.grossSalesUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-amber-400 font-semibold block mt-0.5">
                {(reportData.grossSalesUsd * POS_EXCHANGE_RATE).toLocaleString()} LBP
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#1a202c] border border-slate-700">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Discounts & Returns</span>
              <span className="text-xl font-black text-rose-400 mt-1 block">
                -${(reportData.discountsUsd + reportData.refundsUsd).toFixed(2)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {reportData.voidedCount} Voids / Returns
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#1a202c] border border-slate-700">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Net VAT (11%)</span>
              <span className="text-xl font-black text-slate-100 mt-1 block">
                ${reportData.taxUsd.toFixed(2)}
              </span>
              <span className="text-[11px] text-amber-400 font-semibold block mt-0.5">
                {(reportData.taxUsd * POS_EXCHANGE_RATE).toLocaleString()} LBP
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/70 to-[#1a202c] border border-emerald-500/60 shadow-lg">
              <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider block">Total Net Revenue</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                ${reportData.totalSalesUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-amber-400 font-bold block mt-0.5">
                {(reportData.totalSalesUsd * POS_EXCHANGE_RATE).toLocaleString()} LBP
              </span>
            </div>
          </div>

          {/* 2. Tender Method Distribution */}
          <div className="bg-[#191f2c] border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
              <Banknote className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Payment Tender Method Distribution
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 pb-2">
                    <th className="pb-2">Tender Method</th>
                    <th className="pb-2 text-center">Trans Count</th>
                    <th className="pb-2 text-right">Amount (USD)</th>
                    <th className="pb-2 text-right">Equivalent (LBP @ 89,500)</th>
                    <th className="pb-2 text-right">Share %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {reportData.tenders.map((t) => {
                    const share = ((t.usd / reportData.totalSalesUsd) * 100).toFixed(1);
                    return (
                      <tr key={t.method} className="hover:bg-slate-800/40">
                        <td className="py-2.5 font-bold text-slate-100 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                          {t.method}
                        </td>
                        <td className="py-2.5 text-center text-slate-300">{t.count}</td>
                        <td className="py-2.5 text-right font-bold text-emerald-400">${t.usd.toFixed(2)}</td>
                        <td className="py-2.5 text-right text-amber-400 font-bold">{t.lbp.toLocaleString()} LBP</td>
                        <td className="py-2.5 text-right text-slate-400">{share}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Workstation Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reportData.workstations.map((w) => (
              <div key={w.id} className="bg-[#191f2c] border border-slate-700 rounded-xl p-4 font-mono">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-amber-400 font-black text-sm">{w.id}</span>
                  <span className="text-xs text-slate-400">{w.cashier}</span>
                </div>
                <div className="flex justify-between items-baseline mt-2">
                  <span className="text-xs text-slate-400">{w.transactions} Completed Trans</span>
                  <span className="text-base font-bold text-emerald-400">${w.salesUsd.toFixed(2)}</span>
                </div>
                <div className="text-right text-[11px] text-amber-400 font-semibold mt-0.5">
                  {(w.salesUsd * POS_EXCHANGE_RATE).toLocaleString()} LBP
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="px-6 py-4 bg-[#11141b] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">F1</kbd> Print
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">F3</kbd> Save CSV
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">ESC</kbd> Exit
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                notify('Generating thermal printout...');
                onPrint?.();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-mono text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Print (F1)</span>
            </button>

            <button
              type="button"
              onClick={() => notify('Audit report exported to CSV.')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-mono text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Save as (F3)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to perform End Of Day (Z-Report Close)? This will lock all open drawers.')) {
                  notify('End of Day (Z-Report) executed successfully. Drawers finalized.');
                  onEndOfDay?.();
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-600 text-rose-200 font-mono text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>End Of Day</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black transition-all active:scale-95"
            >
              Exit (Esc)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
