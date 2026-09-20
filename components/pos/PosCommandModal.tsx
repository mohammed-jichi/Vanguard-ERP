'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  Unlock,
  Printer,
  FileSpreadsheet,
  Calculator,
  History,
  ShieldCheck,
  Search,
  LogOut,
  SlidersHorizontal,
  DollarSign,
  AlertCircle,
  LayoutDashboard,
} from 'lucide-react';
import { PosUser } from '@/lib/pos/posStateEngine';

interface PosCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: PosUser | null;
  onNoSale: () => void;
  onReprintReceipt: () => void;
  onShowShiftSummary: () => void;
  onOpenGlobalReport: () => void;
  onOpenCashierReport: () => void;
  onOpenOlderSales: () => void;
}

export default function PosCommandModal({
  isOpen,
  onClose,
  currentUser,
  onNoSale,
  onReprintReceipt,
  onShowShiftSummary,
  onOpenGlobalReport,
  onOpenCashierReport,
  onOpenOlderSales,
}: PosCommandModalProps) {
  const router = useRouter();

  // Keyboard shortcut listener for CMD Matrix
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey combinations matching Omega POS standards
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.ctrlKey && e.key === 'F4') {
        e.preventDefault();
        onClose();
        onOpenGlobalReport();
      } else if (e.ctrlKey && e.key === 'F5') {
        e.preventDefault();
        onClose();
        onOpenCashierReport();
      } else if (e.ctrlKey && e.key === 'F6') {
        e.preventDefault();
        onClose();
        onOpenOlderSales();
      } else if (e.ctrlKey && e.key === 'F8') {
        e.preventDefault();
        router.push('/backoffice');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onOpenGlobalReport, onOpenCashierReport, onOpenOlderSales, router]);

  if (!isOpen) return null;

  const cmdCardClass =
    'p-4 sm:p-5 rounded-xl border text-left flex flex-col justify-between transition-all select-none cursor-pointer active:translate-y-0.5 shadow-md group relative overflow-hidden';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 font-sans">
      <div className="bg-[#141822] border border-slate-700 rounded-2xl w-full max-w-3xl text-slate-100 overflow-hidden shadow-2xl flex flex-col select-none">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#1b212c] border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500 text-slate-950 shadow">
              <SlidersHorizontal className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-mono font-black text-amber-400 uppercase tracking-wide">
                  COMMAND CENTER (CMD)
                </h2>
                <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-600/60 text-[10px] font-mono text-amber-300 font-bold">
                  OMEGA MATRIX
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Workstation Operations & Supervisor Commands • Active Cashier: {currentUser?.name || 'Maya Khoury'}
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

        {/* Command Tiles Grid */}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* 1. Global Daily Sales Report (Ctrl+F4) */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenGlobalReport();
            }}
            className={`${cmdCardClass} bg-[#1b2230] hover:bg-[#232c3e] border-slate-700 hover:border-amber-400`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2.5 rounded-lg bg-amber-950/70 text-amber-400 border border-amber-800/70">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-amber-300 font-bold">
                Ctrl+F4
              </span>
            </div>
            <div>
              <span className="text-sm font-bold block text-slate-100 group-hover:text-amber-300">
                Global Report
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Aggregated daily sales & tender distribution
              </span>
            </div>
          </button>

          {/* 2. Cashier Report (Ctrl+F5) */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCashierReport();
            }}
            className={`${cmdCardClass} bg-[#1b2230] hover:bg-[#232c3e] border-slate-700 hover:border-emerald-400`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2.5 rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-800/70">
                <Calculator className="w-5 h-5" />
              </div>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-emerald-300 font-bold">
                Ctrl+F5
              </span>
            </div>
            <div>
              <span className="text-sm font-bold block text-slate-100 group-hover:text-emerald-300">
                Cashier Report
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Active drawer reconciliation & X-Reading
              </span>
            </div>
          </button>

          {/* 3. Preview Older Sales (Ctrl+F6) */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenOlderSales();
            }}
            className={`${cmdCardClass} bg-[#1b2230] hover:bg-[#232c3e] border-slate-700 hover:border-purple-400`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2.5 rounded-lg bg-purple-950/70 text-purple-400 border border-purple-800/70">
                <History className="w-5 h-5" />
              </div>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-purple-300 font-bold">
                Ctrl+F6
              </span>
            </div>
            <div>
              <span className="text-sm font-bold block text-slate-100 group-hover:text-purple-300">
                Preview Older Sales
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Search invoices & reprint duplicate vouchers
              </span>
            </div>
          </button>

          {/* 4. Open Cash Drawer / No Sale */}
          <button
            type="button"
            onClick={() => {
              onNoSale();
              onClose();
            }}
            className={`${cmdCardClass} bg-[#1b2230] hover:bg-[#232c3e] border-slate-700 hover:border-amber-500`}
          >
            <div className="p-2.5 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/60 w-fit mb-3">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold block text-slate-100 group-hover:text-amber-300">
                Kick Drawer (No Sale)
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Open till & log event in register audit
              </span>
            </div>
          </button>

          {/* 5. Reprint Last Receipt */}
          <button
            type="button"
            onClick={() => {
              onReprintReceipt();
              onClose();
            }}
            className={`${cmdCardClass} bg-[#1b2230] hover:bg-[#232c3e] border-slate-700 hover:border-sky-500`}
          >
            <div className="p-2.5 rounded-lg bg-sky-950/60 text-sky-400 border border-sky-800/60 w-fit mb-3">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold block text-slate-100 group-hover:text-sky-300">
                Reprint Last Receipt
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Fast duplicate print of previous checkout
              </span>
            </div>
          </button>

          {/* 6. Back Office Navigation (Ctrl+F8) */}
          <Link
            href="/backoffice"
            className={`${cmdCardClass} bg-[#151922] hover:bg-slate-800 border-slate-700 hover:border-slate-500`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 font-bold">
                Ctrl+F8
              </span>
            </div>
            <div>
              <span className="text-sm font-bold block text-slate-100">
                Back Office (Ctrl+F8)
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Return to Vanguard ERP administration
              </span>
            </div>
          </Link>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#11141b] border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono">ESC</kbd> to return to register</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold font-mono transition-colors"
          >
            Esc - Back
          </button>
        </div>
      </div>
    </div>
  );
}
