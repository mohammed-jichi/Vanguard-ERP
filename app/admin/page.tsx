'use client';

import React from 'react';
import { TenantProvider } from '@/lib/TenantContext';
import SuperSonicFleetManager from '@/components/SuperSonicFleetManager';

export default function AdminDashboardPage() {
  return (
    <TenantProvider>
      <main className="min-h-screen bg-[#0a1209] p-4 md:p-8">
        <SuperSonicFleetManager />
      </main>
    </TenantProvider>
  );
}