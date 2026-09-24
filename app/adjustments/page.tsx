'use client';

import React, { Suspense } from 'react';
import MasterBackofficeLayout from '@/app/backoffice/layout';
import AdjustmentsView from '@/components/AdjustmentsView';

export default function AdjustmentsPage() {
  return (
    <MasterBackofficeLayout>
      <Suspense fallback={<div className="p-8 text-center text-slate-500 font-sans">Loading Inventory Adjustments...</div>}>
        <AdjustmentsView />
      </Suspense>
    </MasterBackofficeLayout>
  );
}
