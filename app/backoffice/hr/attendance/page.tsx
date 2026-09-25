'use client';

import React, { Suspense } from 'react';
import UnifiedHRConsole from '@/components/modules/hr/UnifiedHRConsole';
import { useLanguage } from '@/lib/LanguageContext';
import { Clock } from 'lucide-react';

function AttendanceLogsContent() {
  const { t, dir } = useLanguage();

  return (
    <div className="p-4 md:p-6 space-y-4 font-sans bg-background min-h-screen text-slate-800" dir={dir}>
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <span>{t('attendance_shifts_page_title', 'Attendance, Shifts & Biometric Timeclock')}</span>
        </h1>
        <p className="text-xs text-slate-600 font-medium mt-0.5">
          {t('attendance_shifts_page_subtitle', 'Live ZKTeco biometric logs, overtime counters, absence deductions, and plant holiday schedules')}
        </p>
      </div>

      <UnifiedHRConsole initialTab="attendance" />
    </div>
  );
}

export default function AttendanceLogsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs font-mono text-slate-500">Loading Attendance Logs...</div>}>
      <AttendanceLogsContent />
    </Suspense>
  );
}
