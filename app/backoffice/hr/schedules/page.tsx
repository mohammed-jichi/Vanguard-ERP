'use client';

import React, { Suspense } from 'react';
import HrScheduleManager from '@/components/modules/hr/HrScheduleManager';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-500">Loading schedules...</div>}>
      <HrScheduleManager />
    </Suspense>
  );
}
