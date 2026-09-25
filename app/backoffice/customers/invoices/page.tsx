'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export default function CustomerInvoicesPage() {
  const { t, dir } = useLanguage();
  return (
    <div dir={dir} className="p-6 space-y-4 text-left rtl:text-right">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">{t('ar_aging_and_invoices', 'Accounts Receivable & Aging Invoices')}</h1>
        <p className="text-xs text-slate-600 font-medium">{t('aging_debt_analysis_outstanding_inv', 'Aging debt analysis, outstanding invoices, and customer credit ledger')}</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
        <span className="text-3xl block mb-2">🧾</span>
        <h2 className="text-sm font-bold text-slate-800">{t('ar_aging_invoices_ledger', 'AR Aging & Invoices Ledger')}</h2>
        <p className="text-xs text-slate-500 mt-1">{t('realtime_credit_invoices_tracking', 'Real-time credit invoices tracking across Lebanon')}</p>
        <div className="pt-2">
          <Link href="/backoffice/customers?section=aged" className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-xs inline-block">
            {t('open_aging_analysis', 'Open Aging Analysis')}
          </Link>
        </div>
      </div>
    </div>
  );
}
