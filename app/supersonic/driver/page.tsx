'use client';

import React from 'react';
import SuperSonicFleetManager from '@/components/SuperSonicFleetManager';

export default function SupersonicDriverPage() {
  return (
    <main className="min-h-screen bg-[#070d08] text-white">
      <SuperSonicFleetManager currentUserRole="Driver" />
    </main>
  );
}
