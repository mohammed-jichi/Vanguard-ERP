'use client';

import React, { Suspense } from 'react';
import PersonnelMasterConsole from '@/components/modules/hr/PersonnelMasterConsole';

export default function PersonnelPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs font-mono text-slate-500">Loading Personnel...</div>}>
      <div className="p-4 md:p-6 bg-slate-50 min-h-screen text-slate-800">
        <PersonnelMasterConsole />
      </div>
    </Suspense>
  );
}
