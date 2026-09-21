'use client';

import React from 'react';
import AccountingReportsPage from '@/app/accounting/reports/page';

export default function RootLedgerPage() {
  return <AccountingReportsPage initialReport="ACC_R_0011" />;
}
