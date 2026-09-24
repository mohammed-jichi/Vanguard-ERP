'use client';

import React, { Suspense } from 'react';
import MasterBackofficeLayout from '@/app/backoffice/layout';
import ReceivingOfGoodsView from '@/components/ReceivingOfGoodsView';

export default function ReceivingOfGoodsStandalonePage() {
  return (
    <MasterBackofficeLayout>
      <Suspense fallback={<div className="p-8 text-center text-slate-500 font-sans">Loading Goods Receiving...</div>}>
        <ReceivingOfGoodsView />
      </Suspense>
    </MasterBackofficeLayout>
  );
}
