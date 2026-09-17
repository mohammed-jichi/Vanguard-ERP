'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  UserCheck,
  Banknote,
  Calculator,
  AlertCircle,
  CheckCircle2,
  Clock,
  LogOut,
} from 'lucide-react';
import { PosUser, POS_EXCHANGE_RATE } from '@/lib/pos/posStateEngine';

interface PosCashierReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: PosUser | null;
  onPrint?: () => void;
  onCloseShift?: () => void;
}

export default function PosCashierReportModal({
  isOpen,
  onClose,
  currentUser,
  onPrint,
  onCloseShift,
}: PosCashierReportModalProps) {
  const [notification, setNotification] = useState<string | null>(null);

  // Cashier Shift Data Mock
  const shiftData = {
    workstationId: 'W#: 1',
    shiftId: 'SH-20260917-01',
    cashierName: currentUser?.name || 'Maya Khoury',
    cashierRole: currentUser?.role || 'Cashier',
    shiftStartTime: '08:30:00 AM',
    shiftDuration: '4h 45m',
    openingFloatUsd: 200.0,
    openingFloatLbp: 17900000,
    cashSalesUsd: 1450.0,
    cashSalesLbp: 45000000,
    cardSalesUsd: 480.0,
    cardSalesLbp: 12000000,
    onAccountUsd: 110.0,
    payoutsDropsUsd: 50.0,
    payoutsDropsLbp: 0,
    voidCount: 1,
    noSaleDrawerKicks: 3,
    totalTransactions: 28,
  };

  // Expected in drawer
  const expectedCashUsd = shiftData.openingFloatUsd + shiftData.cashSalesUsd - shiftData.payoutsDropsUsd; // $1,600.00
  const expectedCashLbp = shiftData.openingFloatLbp + shiftData.cashSalesLbp - shiftData.payoutsDropsLbp; // 62,900,000 LBP

  const [countedUsd, setCountedUsd] = useState<string>('1600.00');
  const [countedLbp, setCountedLbp] = useState<string>('62900000');

  const diffUsd = (parseFloat(countedUsd) || 0) - expectedCashUsd;
  const diffLbp = (parseFloat(countedLbp) || 0) - expectedCashLbp;

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'F1') {
        e.preventDefault();
        notify('Printing X-Reading Voucher to Cashier Receipt Printer...');
        onPrint?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrint]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in select-none">
      <div className="bg-[#141822] border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] text-slate-100 overflow-hidden shadow-2xl flex flex-col font-sans">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1b2230] border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 shadow-md">
              <Calculator className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-mono font-black text-emerald-400 tracking-wide uppercase">
                  CASHIER SHIFT X-READING AUDIT
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/70 text-[10px] font-mono text-emerald-300 font-bold">
                  CTRL + F5
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{shiftData.cashierName} ({shiftData.cashierRole})</span>
                <span>•</span>
                <span>{shiftData.workstationId}</span>
                <span>•</span>
                <span>Shift Started: {shiftData.shiftStartTime}</span>
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
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 font-mono text-xs">
          {/* Cash Balance Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* USD Drawer Balance */}
            <div className="bg-[#19202d] border border-slate-700 rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  USD Drawer Balance
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-bold">
                  CURRENCY: USD
                </span>
              </div>

              <div className="space-y-1.5 text-slate-300 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Opening Cash Float:</span>
                  <span className="font-bold text-slate-100">${shiftData.openingFloatUsd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">(+) Cash Collected:</span>
                  <span className="font-bold text-emerald-400">+${shiftData.cashSalesUsd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">(-) Drawer Payouts/Drops:</span>
                  <span className="font-bold text-rose-400">-${shiftData.payoutsDropsUsd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700 text-sm font-black">
                  <span className="text-amber-400">Expected in Drawer:</span>
                  <span className="text-amber-400">${expectedCashUsd.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700/80">
                <label className="text-[11px] text-slate-400 block mb-1">
                  Cashier Physical Counted ($ USD):
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={countedUsd}
                    onChange={(e) => setCountedUsd(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0e1219] border border-slate-600 rounded-lg text-slate-100 font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-[11px]">
                  <span className="text-slate-400">Drawer Discrepancy:</span>
                  <span
                    className={`font-black ${
                      Math.abs(diffUsd) < 0.01
                        ? 'text-emerald-400'
                        : diffUsd > 0
                        ? 'text-sky-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {diffUsd >= 0 ? `+${diffUsd.toFixed(2)}` : diffUsd.toFixed(2)} USD
                    {Math.abs(diffUsd) < 0.01 && ' (BALANCED)'}
                  </span>
                </div>
              </div>
            </div>

            {/* LBP Drawer Balance */}
            <div className="bg-[#19202d] border border-slate-700 rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-amber-400" />
                  LBP Drawer Balance
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 font-bold">
                  RATE: 89,500 LBP
                </span>
              </div>

              <div className="space-y-1.5 text-slate-300 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Opening Float:</span>
                  <span className="font-bold text-slate-100">{shiftData.openingFloatLbp.toLocaleString()} LBP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">(+) Cash Collected:</span>
                  <span className="font-bold text-emerald-400">+{shiftData.cashSalesLbp.toLocaleString()} LBP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">(-) Drawer Payouts:</span>
                  <span className="font-bold text-rose-400">0 LBP</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700 text-sm font-black">
                  <span className="text-amber-400">Expected in Drawer:</span>
                  <span className="text-amber-400">{expectedCashLbp.toLocaleString()} LBP</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700/80">
                <label className="text-[11px] text-slate-400 block mb-1">
                  Cashier Physical Counted (LBP):
                </label>
                <input
                  type="number"
                  step="500"
                  value={countedLbp}
                  onChange={(e) => setCountedLbp(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0e1219] border border-slate-600 rounded-lg text-slate-100 font-bold focus:border-amber-400 focus:outline-none"
                />
                <div className="flex justify-between items-center mt-2 text-[11px]">
                  <span className="text-slate-400">Drawer Discrepancy:</span>
                  <span
                    className={`font-black ${
                      Math.abs(diffLbp) < 500
                        ? 'text-emerald-400'
                        : diffLbp > 0
                        ? 'text-sky-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {diffLbp >= 0 ? `+${diffLbp.toLocaleString()}` : diffLbp.toLocaleString()} LBP
                    {Math.abs(diffLbp) < 500 && ' (BALANCED)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-[#171d29] border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 block uppercase">Credit Card USD</span>
              <span className="text-sm font-bold text-sky-400 mt-0.5 block">${shiftData.cardSalesUsd.toFixed(2)}</span>
            </div>
            <div className="p-3 bg-[#171d29] border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 block uppercase">Credit Card LBP</span>
              <span className="text-sm font-bold text-sky-400 mt-0.5 block">{shiftData.cardSalesLbp.toLocaleString()} LBP</span>
            </div>
            <div className="p-3 bg-[#171d29] border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 block uppercase">No Sale Kicks</span>
              <span className="text-sm font-bold text-slate-200 mt-0.5 block">{shiftData.noSaleDrawerKicks} Openings</span>
            </div>
            <div className="p-3 bg-[#171d29] border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 block uppercase">Void Count</span>
              <span className="text-sm font-bold text-rose-400 mt-0.5 block">{shiftData.voidCount} Void Lines</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#11141b] border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">F1</kbd> Print X-Reading
            </span>
            <span className="mx-2">•</span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">ESC</kbd> Close
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                notify('Printing Cashier X-Reading Voucher...');
                onPrint?.();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-mono text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Print X-Reading (F1)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Close active shift for ${shiftData.cashierName}? This will lock the drawer and produce the final Z-reading voucher.`)) {
                  notify('Shift closed and drawer locked.');
                  onCloseShift?.();
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600 text-rose-200 font-mono text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Close Shift</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 font-mono text-xs font-bold transition-all active:scale-95"
            >
              Dismiss (Esc)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
