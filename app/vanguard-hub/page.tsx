'use client';

import React from 'react';
import { TenantProvider } from '@/lib/TenantContext';
import SuperAdminWorkspaceManager from '@/components/SuperAdminWorkspaceManager';

export default function VanguardHubPage() {
  return (
    <TenantProvider>
      <main className="min-h-screen bg-slate-950 p-4 md:p-8">
        <SuperAdminWorkspaceManager />
      </main>
    </TenantProvider>
  );
}
