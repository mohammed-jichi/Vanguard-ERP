'use client';

import React, { Suspense } from 'react';
import ItemAssemblyView from '@/components/ItemAssemblyView';

export default function ItemAssemblyPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500 font-mono">
          Loading Item Assembly...
        </div>
      }
    >
      <ItemAssemblyView />
    </Suspense>
  );
}
