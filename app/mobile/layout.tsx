import React from 'react';
import { VanguardMobileShell } from '@/components/mobile/VanguardMobileShell';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <VanguardMobileShell>
      {children}
    </VanguardMobileShell>
  );
}
