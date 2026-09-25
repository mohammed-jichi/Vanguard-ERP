'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export default function ARInvoicesPage() {
  const { t, dir } = useLanguage();
  return (
    <div dir={dir} className="p-6 space-y-4 text-left rtl:text-right">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">{t('ar_and_customer_invoices', 'Accounts Receivable & Customer Invoices')}</h1>
        <p className="text-xs text-slate-600 font-medium">{t('credit_invoices_aged_debt_analysis', 'Credit invoices, aged debt analysis, and credit limit control')}</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
        <span className="text-3xl block mb-2">🧾</span>
        <h2 className="text-sm font-bold text-slate-800">{t('ar_invoicing_ledger', 'AR Invoicing Ledger')}</h2>
        <p className="text-xs text-slate-500 mt-1">{t('realtime_ar_tracking_reports', 'Real-time accounts receivable tracking and aging reports')}</p>
        <div className="pt-2">
          <Link href="/backoffice/customers?section=aged" className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-xs inline-block">
            {t('view_aged_debtors', 'View Aged Debtors')}
          </Link>
        </div>
      </div>
    </div>
  );
}
