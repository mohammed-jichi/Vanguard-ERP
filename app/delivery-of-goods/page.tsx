'use client';

import React, { Suspense } from 'react';
import MasterBackofficeLayout from '@/app/backoffice/layout';
import DeliveryOfGoodsView from '@/components/DeliveryOfGoodsView';

export default function StandaloneDeliveryOfGoodsPage() {
  return (
    <MasterBackofficeLayout>
      <Suspense fallback={<div className="p-8 text-center text-slate-500 font-sans">Loading Delivery of Goods...</div>}>
        <DeliveryOfGoodsView />
      </Suspense>
    </MasterBackofficeLayout>
  );
}
