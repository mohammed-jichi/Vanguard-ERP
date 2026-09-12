'use client';

import React, { Suspense } from 'react';
import PurchaseOrderView from '@/components/PurchaseOrderView';

export default function PurchaseOrdersStandalonePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-sans">Loading Purchase Orders...</div>}>
      <PurchaseOrderView />
    </Suspense>
  );
}
