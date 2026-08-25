'use client';

import React from 'react';
import MainTileDashboard from '@/components/MainTileDashboard';
import TenantSettingsModal from '@/components/TenantSettingsModal';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen">
      <MainTileDashboard />
      <TenantSettingsModal isOpen={true} onClose={() => router.push('/')} />
    </div>
  );
}
