'use client';

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

export default function ChartOfAccountsPage() {
  const { t, dir } = useLanguage();

  return (
    <div dir={dir} className="p-6 space-y-4 text-left rtl:text-right">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">{t('chart_of_accounts_title', 'Chart of Accounts (COA)')}</h1>
        <p className="text-xs text-slate-600 font-medium">
          {t('chart_of_accounts_desc', 'Assets, Liabilities, Equity, Revenue, Cost of Sales, and Operating Expenses')}
        </p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
        <span className="text-3xl block mb-2">📊</span>
        <h2 className="text-sm font-bold text-slate-800">{t('coa_structure_active', 'COA Structure Active')}</h2>
        <p className="text-xs text-slate-500 mt-1">{t('multi_currency_coa_desc', 'Multi-currency Chart of Accounts (USD & LBP)')}</p>
      </div>
    </div>
  );
}
