'use client';

import React, { useState } from 'react';
import VanguardGlobalHeader from '@/components/VanguardGlobalHeader';
import Sidebar from '@/components/Sidebar';
import AdjustmentsView from '@/components/AdjustmentsView';

export default function AdjustmentsPage() {
  const [activeScreen, setActiveScreen] = useState<string>('adjustments');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-x-hidden m-0 p-0">
      {/* 1. GLOBAL TOP HEADER */}
      <VanguardGlobalHeader activeScreen={activeScreen} onSelectScreen={setActiveScreen} />

      {/* 2. MASTER CONTAINER WITH SIDEBAR & CONTENT */}
      <div className="flex flex-row flex-1 min-w-0 w-full relative min-h-[calc(100vh-96px)] bg-slate-50 mt-8">
        {/* PERSISTENT SIDEBAR */}
        <Sidebar
          activeScreen={activeScreen}
          onSelectScreen={(screen) => setActiveScreen(screen)}
          isOpen={isSidebarOpen}
          onToggleOpen={(open) => setIsSidebarOpen(open)}
        />

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto">
          <div className="w-full py-4 px-3 sm:px-6 lg:px-8 transition-all duration-300">
            <AdjustmentsView />
          </div>
        </div>
      </div>
    </div>
  );
}
