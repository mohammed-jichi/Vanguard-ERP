'use client';

import React, { useState } from 'react';
import VanguardGlobalHeader from '@/components/VanguardGlobalHeader';
import Sidebar from '@/components/Sidebar';
import ProductInsightsView from '@/components/ProductInsightsView';

export default function ProductInsightViewPage() {
  const [activeScreen, setActiveScreen] = useState<string>('sales-dash');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-x-hidden m-0 p-0">
      {/* 1. GLOBAL TOP HEADER */}
      <VanguardGlobalHeader activeScreen={activeScreen} onSelectScreen={setActiveScreen} />

      {/* 2. MASTER CONTAINER WITH SIDEBAR & CONTENT COLUMN WITH 3CM GAP (PHASE 64) */}
      <div className="flex flex-row flex-1 min-w-0 w-full relative min-h-[calc(100vh-96px)] bg-slate-50 mt-8">
        
        {/* PERSISTENT SIDEBAR */}
        <Sidebar
          activeScreen={activeScreen}
          onSelectScreen={(screen) => setActiveScreen(screen)}
          isOpen={isSidebarOpen}
          onToggleOpen={(open) => setIsSidebarOpen(open)}
        />

        {/* MAIN CONTENT AREA WITH DYNAMIC MARGINS & RESPONSIVE SPACING */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto">
          <div
            className={`w-full max-w-screen-2xl mx-auto py-6 transition-all duration-300 ${
              isSidebarOpen ? 'px-6 lg:px-8 xl:px-10' : 'px-12 lg:px-16 xl:px-24'
            }`}
          >
            <ProductInsightsView />
          </div>
        </div>

      </div>
    </div>
  );
}
