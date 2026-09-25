'use client';

import React, { Suspense } from 'react';
import MasterBackofficeLayout from '@/app/backoffice/layout';
import PurchaseOrderView from '@/components/PurchaseOrderView';
import { useLanguage } from '@/lib/LanguageContext';

function Fallback() {
  const { t } = useLanguage();
  return <div className="p-8 text-center text-slate-500 font-sans">{t('loading_purchase_order', 'Loading Purchase Order...')}</div>;
}

export default function OmegaPurchaseOrderRoute() {
  return (
    <MasterBackofficeLayout>
      <Suspense fallback={<Fallback />}>
        <PurchaseOrderView />
      </Suspense>
    </MasterBackofficeLayout>
  );
}
