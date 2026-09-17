'use client';

import React from 'react';
import {
  Search,
  Percent,
  DollarSign,
  Tag,
  DollarSign as PriceIcon,
  Unlock,
  Users,
  ShoppingBag,
  RotateCcw,
  CreditCard,
  Banknote,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';

interface PosActionRailProps {
  onEnterAmount: () => void;
  onPayCash: () => void;
  onOtherPayments: () => void;
  onSearchProducts: () => void;
  onApplyBillDiscountPercent: () => void;
  onApplyBillDiscountDollar: () => void;
  onApplyItemDiscount: () => void;
  onSetPrice: () => void;
  onNoSale: () => void;
  onOpenCustomers: () => void;
  onOpenOrders: () => void;
  onClearDiscountPay: () => void;
  onOpenCmd: () => void;
  disabled?: boolean;
}

export default function PosActionRail({
  onEnterAmount,
  onPayCash,
  onOtherPayments,
  onSearchProducts,
  onApplyBillDiscountPercent,
  onApplyBillDiscountDollar,
  onApplyItemDiscount,
  onSetPrice,
  onNoSale,
  onOpenCustomers,
  onOpenOrders,
  onClearDiscountPay,
  onOpenCmd,
  disabled = false,
}: PosActionRailProps) {
  const tenderBtnClass =
    'h-14 sm:h-16 rounded-xl border text-sm sm:text-base font-bold font-mono tracking-wider flex items-center justify-center gap-2 transition-all select-none active:translate-y-0.5 cursor-pointer shadow-md';

  const actionBtnClass =
    'h-11 sm:h-12 rounded-lg border text-[11px] sm:text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all select-none active:translate-y-0.5 cursor-pointer shadow-sm';

  return (
    <div className="w-64 sm:w-72 bg-[#12151c] flex flex-col justify-between p-2.5 sm:p-3 border-l border-slate-800 select-none overflow-y-auto">
      {/* 1. Fast Tender Buttons (Top) */}
      <div className="flex flex-col gap-2">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest px-1 font-bold">
          FAST TENDER ACTIONS
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={onEnterAmount}
          className={`${tenderBtnClass} bg-[#252b37] hover:bg-[#303746] text-amber-400 border-amber-500/40 hover:border-amber-400`}
        >
          <DollarSign className="w-5 h-5 text-amber-400" />
          <span>Enter Amount</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onPayCash}
          className={`${tenderBtnClass} bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white border-emerald-500 shadow-emerald-950/40`}
        >
          <Banknote className="w-5 h-5 text-emerald-300" />
          <span>Cash (LBP/USD)</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onOtherPayments}
          className={`${tenderBtnClass} bg-[#232936] hover:bg-[#2c3445] text-sky-300 border-sky-600/40 hover:border-sky-500`}
        >
          <CreditCard className="w-5 h-5 text-sky-400" />
          <span>Other Payments</span>
        </button>
      </div>

      {/* 2. Commercial Action Rail (Middle Grid) */}
      <div className="flex flex-col gap-1.5 my-3">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest px-1 font-bold">
          FUNCTIONS & DISCOUNTS
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onSearchProducts}
            className={`${actionBtnClass} bg-[#1f242e] hover:bg-[#2a303d] text-slate-200 border-slate-700`}
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>Search</span>
          </button>

          <button
            type="button"
            onClick={onApplyBillDiscountPercent}
            className={`${actionBtnClass} bg-[#1f242e] hover:bg-[#2a303d] text-slate-200 border-slate-700`}
          >
            <Percent className="w-3.5 h-3.5 text-amber-400" />
            <span>Disc. %</span>
          </button>

          <button
            type="button"
            onClick={onApplyBillDiscountDollar}
            className={`${actionBtnClass} bg-[#1f242e] hover:bg-[#2a303d] text-slate-200 border-slate-700`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Disc. $</span>
          </button>

          <button
            type="button"
            onClick={onApplyItemDiscount}
            className={`${actionBtnClass} bg-[#1f242e] hover:bg-[#2a303d] text-slate-200 border-slate-700`}
          >
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>Item Disc. %</span>
          </button>

          <button
            type="button"
            onClick={onSetPrice}
            className={`${actionBtnClass} bg-[#1f242e] hover:bg-[#2a303d] text-slate-200 border-slate-700`}
          >
            <PriceIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>Set Price</span>
          </button>

          <button
            type="button"
            onClick={onNoSale}
            className={`${actionBtnClass} bg-[#1f242e] hover:bg-[#2a303d] text-amber-300 border-slate-700`}
          >
            <Unlock className="w-3.5 h-3.5 text-amber-400" />
            <span>No Sale</span>
          </button>

          <button
            type="button"
            onClick={onOpenCustomers}
            className={`${actionBtnClass} bg-[#1f242e] hover:bg-[#2a303d] text-slate-200 border-slate-700`}
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Customers</span>
          </button>

          <button
            type="button"
            onClick={onOpenOrders}
            className={`${actionBtnClass} bg-[#1f242e] hover:bg-[#2a303d] text-slate-200 border-slate-700`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
            <span>Orders</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClearDiscountPay}
          className={`${actionBtnClass} w-full bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/60 mt-1`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Pay-Disc.</span>
        </button>
      </div>

      {/* 3. Prominent CMD (Command Center) Button at Bottom-Right */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onOpenCmd}
          className="w-full h-16 sm:h-20 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black tracking-widest text-xl sm:text-2xl border-2 border-amber-300 flex items-center justify-center gap-2.5 shadow-lg shadow-amber-950/60 transition-all active:translate-y-0.5 cursor-pointer uppercase select-none"
        >
          <SlidersHorizontal className="w-6 h-6 stroke-[3]" />
          <span>CMD</span>
        </button>
      </div>
    </div>
  );
}
