'use client';

import React, { Suspense } from 'react';
import MasterBackofficeLayout from '@/app/backoffice/layout';
import PurchaseOrderView from '@/components/PurchaseOrderView';

export default function OmegaPurchaseOrderRoute() {
  return (
    <MasterBackofficeLayout>
      <Suspense fallback={<div className="p-8 text-center text-slate-500 font-sans">Loading Purchase Order...</div>}>
        <PurchaseOrderView />
      </Suspense>
    </MasterBackofficeLayout>
  );
}
