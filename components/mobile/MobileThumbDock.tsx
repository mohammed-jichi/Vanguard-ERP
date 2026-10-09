import React from 'react';
import { ScanLine, Calculator, PauseCircle, CreditCard } from 'lucide-react';

export interface MobileThumbDockProps {
  onChargeClick?: () => void;
}

export function MobileThumbDock({ onChargeClick }: MobileThumbDockProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] touch-manipulation">
      <div className="flex items-center justify-between px-2 py-2 gap-2">
        <button className="flex-1 flex flex-col items-center justify-center min-h-[52px] bg-slate-100 active:bg-slate-200 text-slate-700 rounded-xl transition-colors select-none">
          <ScanLine size={22} className="mb-0.5 stroke-[2.5px]" />
          <span className="text-[10px] font-bold tracking-tight">SCAN</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center min-h-[52px] bg-slate-100 active:bg-slate-200 text-slate-700 rounded-xl transition-colors select-none">
          <Calculator size={22} className="mb-0.5 stroke-[2.5px]" />
          <span className="text-[10px] font-bold tracking-tight">KEYPAD</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center min-h-[52px] bg-amber-100 active:bg-amber-200 text-amber-800 rounded-xl transition-colors select-none">
          <PauseCircle size={22} className="mb-0.5 stroke-[2.5px]" />
          <span className="text-[10px] font-bold tracking-tight">PARK</span>
        </button>
        <button 
          onClick={onChargeClick}
          className="flex-[1.4] flex flex-col items-center justify-center min-h-[52px] bg-emerald-600 active:bg-emerald-700 text-white rounded-xl shadow-md transition-colors select-none border border-emerald-500"
        >
          <CreditCard size={22} className="mb-0.5 stroke-[2.5px]" />
          <span className="text-[11px] font-black uppercase tracking-wider">Charge</span>
        </button>
      </div>
    </div>
  );
}
