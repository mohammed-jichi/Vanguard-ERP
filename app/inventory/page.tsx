'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InventoryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/backoffice/operations');
  }, [router]);

  return (
    <div className="w-full h-screen bg-[#1e232d] flex items-center justify-center text-white">
      <div className="flex items-center gap-3">
        <span className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-sm font-bold font-mono">Redirecting to Operations Center &amp; Inventory Suite...</span>
      </div>
    </div>
  );
}
