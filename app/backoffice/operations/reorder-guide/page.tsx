'use client';

import React, { Suspense } from 'react';
import ReorderGuideView from '@/components/ReorderGuideView';

export default function ReorderGuidePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500 font-mono">
          Loading Reorder Guide...
        </div>
      }
    >
      <ReorderGuideView />
    </Suspense>
  );
}
