'use client';

import React, { Suspense } from 'react';
import UnifiedHRConsole from '@/components/modules/hr/UnifiedHRConsole';
import { useLanguage } from '@/lib/LanguageContext';
import { Users } from 'lucide-react';

function EmployeesDirectoryContent() {
  const { t, dir } = useLanguage();

  return (
    <div className="p-4 md:p-6 space-y-4 font-sans bg-background min-h-screen text-slate-800" dir={dir}>
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <span>{t('employees_directory_title', 'Employees & Personnel Master Directory')}</span>
        </h1>
        <p className="text-xs text-slate-600 font-medium mt-0.5">
          {t('employees_directory_subtitle', 'Staff records, National IDs, department tags, basic salaries, hire dates, and contract statuses')}
        </p>
      </div>

      <UnifiedHRConsole initialTab="employees" />
    </div>
  );
}

export default function EmployeesDirectoryPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs font-mono text-slate-500">Loading Employees Directory...</div>}>
      <EmployeesDirectoryContent />
    </Suspense>
  );
}
