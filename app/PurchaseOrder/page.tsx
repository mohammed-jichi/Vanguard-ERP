'use client';

import React, { Suspense } from 'react';
import PurchaseOrderView from '@/components/PurchaseOrderView';

export default function OmegaPurchaseOrderRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-sans">Loading Purchase Order...</div>}>
      <PurchaseOrderView />
    </Suspense>
  );
}
