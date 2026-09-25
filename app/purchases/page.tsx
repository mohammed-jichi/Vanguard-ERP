'use client';

import React, { Suspense } from 'react';
import MasterBackofficeLayout from '@/app/backoffice/layout';
import PurchasesView from '@/components/PurchasesView';
import { useLanguage } from '@/lib/LanguageContext';

function Fallback() {
  const { t } = useLanguage();
  return <div className="p-8 text-center text-slate-500 font-sans">{t('loading_purchases', 'Loading Purchases...')}</div>;
}

export default function PurchasesPage() {
  return (
    <MasterBackofficeLayout>
      <Suspense fallback={<Fallback />}>
        <PurchasesView />
      </Suspense>
    </MasterBackofficeLayout>
  );
}
