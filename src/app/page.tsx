'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootEntryPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/backoffice/dashboard');
  }, [router]);

  return (
    <div className="w-full h-screen bg-[#1e232d] flex items-center justify-center text-white">
      <div className="flex items-center gap-3">
        <span className="w-4 h-4 rounded-full bg-amber-500 animate-pulse"></span>
        <span className="text-sm font-bold font-mono">Launching Vanguard ERP System...</span>
      </div>
    </div>
  );
}
