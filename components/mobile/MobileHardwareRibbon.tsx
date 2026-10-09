import React from 'react';
import { Wifi, WifiOff, Printer, Scale, RefreshCw, Lock, UserCircle2 } from 'lucide-react';
import { Cashier } from './MobileAuthModal';

export interface MobileHardwareRibbonProps {
  currentCashier: Cashier | null;
  onSignInClick: () => void;
  onSignOutClick: () => void;
}

export function MobileHardwareRibbon({ currentCashier, onSignInClick, onSignOutClick }: MobileHardwareRibbonProps) {
  // Mock data for UI scaffolding
  const isScaleConnected = true;
  const isPrinterReady = true;
  const syncQueue = 0;
  const exchangeRate = 89500;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-slate-900 text-white pt-[env(safe-area-inset-top)] flex items-center justify-between px-3 h-8 text-[10px] font-semibold tracking-wide shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 ${isScaleConnected ? 'text-emerald-400' : 'text-slate-400'}`}>
          <Scale size={12} strokeWidth={2.5} />
          <span>{isScaleConnected ? 'STABLE' : 'STANDBY'}</span>
        </div>
        <div className={`flex items-center gap-1.5 ${isPrinterReady ? 'text-emerald-400' : 'text-rose-400'}`}>
          <Printer size={12} strokeWidth={2.5} />
          <span>{isPrinterReady ? 'READY' : 'OFFLINE'}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-300 mr-2">
          <RefreshCw size={11} strokeWidth={2.5} className={syncQueue > 0 ? 'animate-spin text-amber-400' : ''} />
          <span>{syncQueue > 0 ? `${syncQueue} PENDING` : 'SYNCED'}</span>
        </div>
        
        {/* Cashier/Operator indicator capsule */}
        {currentCashier ? (
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 pl-2 pr-1 py-0.5 rounded-md">
            <span className="text-slate-200">{currentCashier.name}</span>
            <span className="text-slate-400 font-mono">#{currentCashier.id}</span>
            <button 
              onClick={onSignOutClick}
              className="ml-1 text-slate-400 hover:text-white transition-colors p-0.5 rounded"
            >
              <Lock size={12} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button 
            onClick={onSignInClick}
            className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold hover:bg-emerald-100 transition-colors"
          >
            <UserCircle2 size={12} strokeWidth={2.5} />
            SIGN IN
          </button>
        )}
      </div>
    </div>
  );
}
