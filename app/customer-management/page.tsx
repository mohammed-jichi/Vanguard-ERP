'use client';

import React, { Suspense } from 'react';
import { CustomerManagementView } from '@/components/modules/customers/CustomerManagementView';

export default function CustomerManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500 font-mono">
          Loading Customer Management...
        </div>
      }
    >
      <CustomerManagementView />
    </Suspense>
  );
}
