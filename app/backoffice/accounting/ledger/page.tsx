'use client';

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

export default function GeneralLedgerPage() {
  const { t, dir } = useLanguage();

  return (
    <div dir={dir} className="p-6 space-y-4 text-left rtl:text-right">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">{t('general_ledger_trial_balance_title', 'General Ledger & Trial Balance')}</h1>
        <p className="text-xs text-slate-600 font-medium">
          {t('general_ledger_trial_balance_desc', 'Real-time ledger audit trail, balance sheet, and income statement generation')}
        </p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
        <span className="text-3xl block mb-2">📈</span>
        <h2 className="text-sm font-bold text-slate-800">{t('financial_reports_trial_balance', 'Financial Reports & Trial Balance')}</h2>
        <p className="text-xs text-slate-500 mt-1">{t('exportable_balance_sheet_pnl', 'Exportable balance sheet and P&L statements')}</p>
      </div>
    </div>
  );
}
