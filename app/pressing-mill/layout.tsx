'use client';

/**
 * Vanguard ERP - Pressing Mill Module Root Layout
 * Wraps in MasterBackofficeLayout for persistent sidebar & global header,
 * and mounts the clean enterprise sub-navigation tabs.
 */

import React from 'react';
import MasterBackofficeLayout from '@/app/backoffice/layout';
import PressingMillNavigationTabs from '@/components/modules/pressing/PressingMillNavigationTabs';

export default function PressingMillLayout({ children }: { children: React.ReactNode }) {
  return (
    <MasterBackofficeLayout>
      <div className="flex-1 bg-slate-50 min-h-screen p-4 md:p-6 text-slate-800 font-sans">
        <PressingMillNavigationTabs />
        {children}
      </div>
    </MasterBackofficeLayout>
  );
}
