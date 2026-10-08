import React from 'react';
import { MobileHardwareRibbon } from './MobileHardwareRibbon';
import { MobileThumbDock } from './MobileThumbDock';

export interface VanguardMobileShellProps {
  children: React.ReactNode;
}

export function VanguardMobileShell({ children }: VanguardMobileShellProps) {
  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-slate-100 touch-manipulation select-none">
      <MobileHardwareRibbon />
      <main className="flex-1 overflow-y-auto w-full pt-8 pb-[calc(env(safe-area-inset-bottom)+76px)] touch-pan-y overscroll-none scroll-smooth">
        {children}
      </main>
      <MobileThumbDock />
    </div>
  );
}
