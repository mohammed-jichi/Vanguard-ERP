'use client';

import React from 'react';
import { TenantProvider } from '@/lib/TenantContext';
import SuperAdminWorkspaceManager from '@/components/SuperAdminWorkspaceManager';

export default function AdminDashboardPage() {
  return (
    <TenantProvider>
      <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
        <SuperAdminWorkspaceManager />
      </main>
    </TenantProvider>
  );
}