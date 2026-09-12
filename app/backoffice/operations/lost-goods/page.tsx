'use client';

import React, { Suspense } from 'react';
import LostGoodsView from '@/components/LostGoodsView';

export default function LostGoodsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500 font-mono">
          Loading Lost Goods...
        </div>
      }
    >
      <LostGoodsView />
    </Suspense>
  );
}
