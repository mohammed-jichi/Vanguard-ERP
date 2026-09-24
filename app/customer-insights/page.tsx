'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MasterBackofficeLayout from '@/app/backoffice/layout';
import CustomerInsightsView from '@/components/CustomerInsightsView';

function CustomerInsightsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (tabParam === 'team') {
      window.location.replace('/sales-manager-dashboard');
    }
  }, [tabParam]);

  return <CustomerInsightsView />;
}

export default function CustomerInsightsPage() {
  return (
    <MasterBackofficeLayout>
      <Suspense fallback={<div className="p-8 text-center text-slate-500 font-sans">Loading Customer Insights...</div>}>
        <CustomerInsightsContent />
      </Suspense>
    </MasterBackofficeLayout>
  );
}
