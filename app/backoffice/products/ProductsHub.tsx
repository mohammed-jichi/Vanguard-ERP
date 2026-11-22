'use client';

import React, { Suspense, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import ProductInsightsView from '@/components/ProductInsightsView';
import AuthenticOmegaProductsServicesView from '@/app/backoffice/operations/AuthenticOmegaProductsServicesView';

type TabKey = 'catalog' | 'insights';

function ProductsHubContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab: TabKey = searchParams.get('view') === 'insights' ? 'insights' : 'catalog';

  const setTab = useCallback(
    (next: TabKey) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('view', next);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-xs font-bold rounded-t-md border-b-2 cursor-pointer transition-colors ${
      active
        ? 'border-emerald-600 text-emerald-700 bg-white'
        : 'border-transparent text-slate-500 hover:text-slate-800'
    }`;

  return (
    <div className="w-full py-4 px-4 sm:px-6 lg:px-8">
      <div className="flex gap-1 border-b border-slate-200 mb-4" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'catalog'}
          onClick={() => setTab('catalog')}
          className={tabClass(tab === 'catalog')}
        >
          Product Catalog / Item Master
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'insights'}
          onClick={() => setTab('insights')}
          className={tabClass(tab === 'insights')}
        >
          Product Insights
        </button>
      </div>
      {tab === 'catalog' ? <AuthenticOmegaProductsServicesView /> : <ProductInsightsView />}
    </div>
  );
}

export default function ProductsHub() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading products...</div>}>
      <ProductsHubContent />
    </Suspense>
  );
}
