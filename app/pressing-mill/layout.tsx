'use client';

/**
 * Vanguard ERP - Pressing Mill Module Root Layout
 * Wraps in MasterBackofficeLayout for persistent sidebar & global header.
 * Navigation is exclusively handled by the root Sidebar accordion menu.
 */

import React from 'react';
import MasterBackofficeLayout from '@/app/backoffice/layout';

export default function PressingMillLayout({ children }: { children: React.ReactNode }) {
  return (
    <MasterBackofficeLayout>
      <div className="flex-1 bg-slate-50 min-h-screen p-4 md:p-6 text-slate-800 font-sans">
        {children}
      </div>
    </MasterBackofficeLayout>
  );
}
