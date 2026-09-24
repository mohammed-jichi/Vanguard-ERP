'use client';

import React, { Suspense } from 'react';
import MasterBackofficeLayout from '@/app/backoffice/layout';
import ProductInsightsView from '@/components/ProductInsightsView';

export default function ProductInsightsPage() {
  return (
    <MasterBackofficeLayout>
      <Suspense fallback={<div className="p-8 text-center text-slate-500 font-sans">Loading Product Insights...</div>}>
        <div className="w-full py-6 px-4 sm:px-6 lg:px-8 transition-all duration-300">
          <ProductInsightsView />
        </div>
      </Suspense>
    </MasterBackofficeLayout>
  );
}
