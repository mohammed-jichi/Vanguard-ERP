'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function InventoryRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    const section = searchParams.get('section');
    if (tab === 'purchases' || section === 'purchases') {
      router.replace('/purchases');
    } else {
      router.replace('/backoffice/operations');
    }
  }, [router, searchParams]);

  return (
    <div className="w-full h-screen bg-[#1e232d] flex items-center justify-center text-white">
      <div className="flex items-center gap-3">
        <span className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-sm font-bold font-mono">Redirecting to Operations Center &amp; Inventory Suite...</span>
      </div>
    </div>
  );
}

export default function InventoryRedirectPage() {
  return (
    <Suspense fallback={null}>
      <InventoryRedirectContent />
    </Suspense>
  );
}
