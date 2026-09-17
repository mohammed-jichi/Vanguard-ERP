'use client';

import React from 'react';
import { PosCartItem, PosFinancialSummary } from '@/lib/pos/posStateEngine';
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  Trash2,
  Clock,
  RotateCcw,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';

interface PosCartTableProps {
  items: PosCartItem[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onQtyAdd: () => void;
  onQtyMinus: () => void;
  onVoidRow: () => void;
  onCleanCart: () => void;
  onHoldBill: () => void;
  onRecallBill: () => void;
  onToggleRefund: () => void;
  financialSummary: PosFinancialSummary;
  heldBillsCount?: number;
}

export default function PosCartTable({
  items,
  selectedIndex,
  onSelectIndex,
  onQtyAdd,
  onQtyMinus,
  onVoidRow,
  onCleanCart,
  onHoldBill,
  onRecallBill,
  onToggleRefund,
  financialSummary,
  heldBillsCount = 0,
}: PosCartTableProps) {
  const handleNavUp = () => {
    if (items.length === 0) return;
    onSelectIndex(Math.max(0, selectedIndex - 1));
  };

  const handleNavDown = () => {
    if (items.length === 0) return;
    onSelectIndex(Math.min(items.length - 1, selectedIndex + 1));
  };

  const touchActionBtnClass =
    'h-11 sm:h-12 px-2.5 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 transition-all select-none active:translate-y-0.5 cursor-pointer shadow-sm';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#12151c] border-r border-slate-800 text-slate-100 overflow-hidden select-none">
      {/* 1. Transaction Line Table Header */}
      <div className="bg-[#181d26] border-b border-slate-700 px-3 py-2 grid grid-cols-12 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
        <div className="col-span-2 text-center">Qty</div>
        <div className="col-span-5 text-left">Description</div>
        <div className="col-span-2 text-right">Price $</div>
        <div className="col-span-3 text-right">Total $</div>
      </div>

      {/* 2. Scrollable Transaction Line Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 p-1.5 space-y-1">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 p-6 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-700 stroke-[1.5]" />
            <span className="font-mono text-sm uppercase tracking-wide">NO ACTIVE BILL ITEMS</span>
            <span className="text-xs text-slate-600 max-w-xs">
              Scan barcodes, use tactile numpad, or trigger item lookup from function rail.
            </span>
          </div>
        ) : (
          items.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            const isRefund = item.totalUsd < 0;

            return (
              <div
                key={item.id + idx}
                onClick={() => onSelectIndex(idx)}
                className={`grid grid-cols-12 items-center px-3 py-2.5 rounded-md cursor-pointer transition-colors text-xs font-mono font-medium ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/60 shadow-sm'
                    : 'hover:bg-slate-800/60 text-slate-200 border border-transparent'
                } ${isRefund ? 'text-rose-400 bg-rose-950/20' : ''}`}
              >
                <div className="col-span-2 text-center font-bold text-amber-400">
                  {item.qty}
                </div>
                <div className="col-span-5 truncate text-left font-sans font-semibold text-slate-100">
                  {isRefund && <span className="text-rose-400 mr-1 font-bold">[REF]</span>}
                  {item.name}
                </div>
                <div className="col-span-2 text-right text-slate-400">
                  ${item.priceUsd.toFixed(2)}
                </div>
                <div className="col-span-3 text-right font-bold text-slate-100">
                  ${item.totalUsd.toFixed(2)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Touch Row Action Strip */}
      <div className="p-2 bg-[#171b23] border-t border-slate-800 grid grid-cols-4 sm:grid-cols-9 gap-1.5">
        <button
          type="button"
          onClick={handleNavUp}
          disabled={items.length === 0}
          className={`${touchActionBtnClass} bg-[#222733] hover:bg-[#2c3343] text-slate-200 border-slate-700`}
          title="Move Up"
        >
          <ChevronUp className="w-4 h-4" />
          <span>Up</span>
        </button>

        <button
          type="button"
          onClick={handleNavDown}
          disabled={items.length === 0}
          className={`${touchActionBtnClass} bg-[#222733] hover:bg-[#2c3343] text-slate-200 border-slate-700`}
          title="Move Down"
        >
          <ChevronDown className="w-4 h-4" />
          <span>Down</span>
        </button>

        <button
          type="button"
          onClick={onQtyAdd}
          disabled={items.length === 0}
          className={`${touchActionBtnClass} bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300 border-emerald-800/60`}
          title="Add Qty (+1)"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>

        <button
          type="button"
          onClick={onQtyMinus}
          disabled={items.length === 0}
          className={`${touchActionBtnClass} bg-amber-950/50 hover:bg-amber-900/70 text-amber-300 border-amber-800/60`}
          title="Less Qty (-1)"
        >
          <Minus className="w-4 h-4" />
          <span>Less</span>
        </button>

        <button
          type="button"
          onClick={onHoldBill}
          disabled={items.length === 0}
          className={`${touchActionBtnClass} bg-[#222733] hover:bg-[#2c3343] text-sky-300 border-slate-700`}
          title="Hold Bill"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Hold</span>
        </button>

        <button
          type="button"
          onClick={onRecallBill}
          className={`${touchActionBtnClass} bg-[#222733] hover:bg-[#2c3343] text-purple-300 border-slate-700 relative`}
          title="Recall Held Bill"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Recall</span>
          {heldBillsCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-purple-600 text-white font-mono text-[9px]">
              {heldBillsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onVoidRow}
          disabled={items.length === 0}
          className={`${touchActionBtnClass} bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border-rose-800/60`}
          title="Void Line"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Void</span>
        </button>

        <button
          type="button"
          onClick={onToggleRefund}
          disabled={items.length === 0}
          className={`${touchActionBtnClass} bg-orange-950/50 hover:bg-orange-900/70 text-orange-300 border-orange-800/60`}
          title="Refund"
        >
          <span>Refund</span>
        </button>

        <button
          type="button"
          onClick={onCleanCart}
          disabled={items.length === 0}
          className={`${touchActionBtnClass} bg-rose-950/80 hover:bg-rose-900 text-rose-200 border-rose-700`}
          title="Clean Entire Bill"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Clean</span>
        </button>
      </div>

      {/* 4. Dual-Currency Summary Panel (Bottom-Left) */}
      <div className="bg-[#141720] border-t-2 border-slate-700 p-3 sm:p-4 text-xs font-mono">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pb-2 border-b border-slate-800">
          <div className="flex justify-between text-slate-400">
            <span>NET (LBP):</span>
            <span className="text-slate-100 font-bold">
              {financialSummary.netLbp.toLocaleString()} LBP
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>NET $ (USD):</span>
            <span className="text-emerald-400 font-bold">
              ${financialSummary.netUsd.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Amount Paid:</span>
            <span className="text-slate-200">
              ${financialSummary.paidUsd.toFixed(2)} / {financialSummary.paidLbp.toLocaleString()} LBP
            </span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Amount Due LL:</span>
            <span className="text-amber-400 font-bold">
              {financialSummary.dueLbp.toLocaleString()} LBP
            </span>
          </div>
        </div>

        {/* Large Highlighted Amount Due in USD */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
            Amount $ Due:
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
            ${financialSummary.dueUsd.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
