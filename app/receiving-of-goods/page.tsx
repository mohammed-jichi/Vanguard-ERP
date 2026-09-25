'use client';

import React, { Suspense } from 'react';
import MasterBackofficeLayout from '@/app/backoffice/layout';
import ReceivingOfGoodsView from '@/components/ReceivingOfGoodsView';
import { useLanguage } from '@/lib/LanguageContext';

function Fallback() {
  const { t } = useLanguage();
  return <div className="p-8 text-center text-slate-500 font-sans">{t('loading_goods_receiving', 'Loading Goods Receiving...')}</div>;
}

export default function ReceivingOfGoodsStandalonePage() {
  return (
    <MasterBackofficeLayout>
      <Suspense fallback={<Fallback />}>
        <ReceivingOfGoodsView />
      </Suspense>
    </MasterBackofficeLayout>
  );
}
