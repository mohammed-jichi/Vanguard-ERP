'use client';

/**
 * Vanguard ERP - Accounting Module Root Layout
 * Wraps all accounting sub-routes in the global Vanguard App Shell Layout
 * preserving the persistent Left Sidebar, Top Header, and base layout shell.
 */

import React from 'react';
import MasterBackofficeLayout from '@/app/backoffice/layout';

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  return (
    <MasterBackofficeLayout>
      {children}
    </MasterBackofficeLayout>
  );
}
