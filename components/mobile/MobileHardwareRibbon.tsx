import React from 'react';
import { Wifi, WifiOff, Printer, Scale, RefreshCw } from 'lucide-react';

export function MobileHardwareRibbon() {
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
        <div className="flex items-center gap-1.5 text-slate-300">
          <RefreshCw size={11} strokeWidth={2.5} className={syncQueue > 0 ? 'animate-spin text-amber-400' : ''} />
          <span>{syncQueue > 0 ? `${syncQueue} PENDING` : 'SYNCED'}</span>
        </div>
        <div className="text-amber-400 font-mono tabular-nums bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
          USD/LBP: {exchangeRate.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
