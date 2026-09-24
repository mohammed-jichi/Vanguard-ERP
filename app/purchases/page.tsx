'use client';

import React, { Suspense } from 'react';
import MasterBackofficeLayout from '@/app/backoffice/layout';
import PurchasesView from '@/components/PurchasesView';

export default function PurchasesPage() {
  return (
    <MasterBackofficeLayout>
      <Suspense fallback={<div className="p-8 text-center text-slate-500 font-sans">Loading Purchases...</div>}>
        <PurchasesView />
      </Suspense>
    </MasterBackofficeLayout>
  );
}
