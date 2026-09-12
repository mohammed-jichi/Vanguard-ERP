'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import VanguardGlobalHeader from '@/components/VanguardGlobalHeader';
import Sidebar from '@/components/Sidebar';
import CustomerInsightsView from '@/components/CustomerInsightsView';

function CustomerInsightsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (tabParam === 'team') {
      window.location.replace('/sales-manager-dashboard');
    }
  }, [tabParam]);

  const [activeScreen, setActiveScreen] = useState<string>('cust-insights');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-x-hidden m-0 p-0">
      {/* 1. GLOBAL HEADER */}
      <VanguardGlobalHeader activeScreen={activeScreen} onSelectScreen={setActiveScreen} />

      {/* 2. MASTER CONTAINER WITH SIDEBAR & CONTENT */}
      <div className="flex flex-row flex-1 min-w-0 w-full relative min-h-[calc(100vh-96px)] bg-slate-50 mt-8">
        <Sidebar
          activeScreen={activeScreen}
          onSelectScreen={(screen) => setActiveScreen(screen)}
          isOpen={isSidebarOpen}
          onToggleOpen={(open) => setIsSidebarOpen(open)}
        />

        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto">
          <CustomerInsightsView />
        </div>
      </div>
    </div>
  );
}

export default function CustomerInsightsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-bold text-sm">
        Loading Customer & Sales Team Insights...
      </div>
    }>
      <CustomerInsightsContent />
    </Suspense>
  );
}
