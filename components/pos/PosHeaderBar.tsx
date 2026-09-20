'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PosUser } from '@/lib/pos/posStateEngine';
import { Lock, LogOut, Maximize, Minimize, Wifi, ShieldAlert } from 'lucide-react';

interface PosHeaderBarProps {
  currentUser?: PosUser | null;
  onLock: () => void;
  onLogout: () => void;
  workstationMode?: string;
}

export default function PosHeaderBar({
  currentUser,
  onLock,
  onLogout,
  workstationMode = 'RETAIL POS / SALES CONTROL',
}: PosHeaderBarProps) {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateStr(
        now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="h-12 sm:h-14 bg-background text-slate-100 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between select-none font-sans text-xs">
      {/* Left: System branding & Workstation */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
          <span className="font-mono font-black text-amber-400 tracking-wider text-sm">
            VANGUARD<span className="text-white font-light">POS</span>
          </span>
          <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
            v2.6.4-OMEGA
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-700 text-slate-300">
          <span className="font-semibold">{currentUser?.branch || 'Choueifat Main Facility'}</span>
          <span className="font-mono text-amber-400 font-bold px-1.5 py-0.5 bg-amber-950/60 border border-amber-800/60 rounded">
            {currentUser?.workstation || 'W#: 1'}
          </span>
        </div>
      </div>

      {/* Center: Mode Indicator & Cashier */}
      <div className="flex items-center gap-3">
        <span className="px-2.5 py-1 rounded bg-slate-800/90 text-slate-200 border border-slate-700 font-bold uppercase tracking-wider text-[11px] hidden sm:inline-block">
          {workstationMode}
        </span>
        <div className="flex items-center gap-1.5 text-slate-200 bg-card px-2.5 py-1 rounded border border-slate-700/80">
          <span className="text-slate-400 text-[11px]">User:</span>
          <span className="font-bold text-amber-300">{currentUser?.name || 'Cashier (101)'}</span>
          <span className="text-[10px] text-slate-400 font-mono">({currentUser?.role || 'Cashier'})</span>
        </div>
      </div>

      {/* Right: Clock & Action controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:flex flex-col text-right font-mono leading-tight">
          <span className="text-amber-400 font-bold text-[13px]">{timeStr}</span>
          <span className="text-slate-400 text-[10px]">{dateStr}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onLock}
            className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/80 rounded flex items-center gap-1 font-bold text-[11px] transition-colors"
            title="Lock Terminal"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lock</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 rounded flex items-center gap-1 font-bold text-[11px] transition-colors"
            title="Log Off"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Off</span>
          </button>
        </div>
      </div>
    </header>
  );
}
