'use client';

import React, { Suspense } from 'react';
import PurchaseOrderView from '@/components/PurchaseOrderView';
import { useTenant } from '@/lib/TenantContext';
import ModuleNotLicensedScreen from '@/components/ModuleNotLicensedScreen';

export default function PurchaseOrdersStandalonePage() {
  const { isModuleEnabled } = useTenant();

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-sans">Loading Purchase Orders...</div>}>
      {isModuleEnabled('purchasing') ? (
        <PurchaseOrderView />
      ) : (
        <div className="min-h-screen bg-slate-50 py-8">
          <ModuleNotLicensedScreen moduleKey="purchasing" />
        </div>
      )}
    </Suspense>
  );
}
