'use client';

import React from 'react';
import ReportsMasterDetail from '@/components/ReportsMasterDetail';

export default function SalesReportPage() {
  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 md:p-6 print:min-h-0 print:h-auto print:bg-white print:p-0">
      <ReportsMasterDetail />
    </div>
  );
}
