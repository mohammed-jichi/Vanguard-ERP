'use client';

import React, { Suspense } from 'react';
import MasterBackofficeLayout from '@/app/backoffice/layout';
import QuotationWorkstation from '@/components/QuotationWorkstation';

export default function StandaloneQuotationsPage() {
  return (
    <MasterBackofficeLayout>
      <Suspense fallback={<div className="p-8 text-center text-slate-500 font-sans">Loading Quotations...</div>}>
        <QuotationWorkstation />
      </Suspense>
    </MasterBackofficeLayout>
  );
}
