'use client';

import React, { Suspense } from 'react';
import UnifiedHRConsole from '@/components/modules/hr/UnifiedHRConsole';
import { useLanguage } from '@/lib/LanguageContext';
import { DollarSign } from 'lucide-react';

function PayrollRunsContent() {
  const { t, dir } = useLanguage();

  return (
    <div className="p-4 md:p-6 space-y-4 font-sans bg-background min-h-screen text-slate-800" dir={dir}>
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <span>{t('payroll_runs_page_title', 'Payroll Runs, Net Payslips & BLOM ACH Transfer')}</span>
        </h1>
        <p className="text-xs text-slate-600 font-medium mt-0.5">
          {t('payroll_runs_page_subtitle', 'Salary computation matrix, CNSS deductions, allowances, bonuses, and A4/thermal payslip issuance')}
        </p>
      </div>

      <UnifiedHRConsole initialTab="payroll" />
    </div>
  );
}

export default function PayrollRunsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs font-mono text-slate-500">Loading Payroll Runs...</div>}>
      <PayrollRunsContent />
    </Suspense>
  );
}
