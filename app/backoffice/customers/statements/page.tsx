'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export default function CustomerStatementsPage() {
  const { t, dir } = useLanguage();
  return (
    <div dir={dir} className="p-6 space-y-4 text-left rtl:text-right">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">{t('statements_of_account_soa_a4', 'Statements of Account (SOA A4)')}</h1>
        <p className="text-xs text-slate-600 font-medium">{t('generate_printable_a4_soa_desc', 'Generate printable A4 statements of account for commercial clients and stores')}</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
        <span className="text-3xl block mb-2">📑</span>
        <h2 className="text-sm font-bold text-slate-800">{t('customer_soa_engine', 'Customer SOA Engine')}</h2>
        <p className="text-xs text-slate-500 mt-1">{t('export_a4_soa_debits_credits', 'Export A4 statement of accounts with invoice debits and payment credits')}</p>
        <div className="pt-2">
          <Link href="/backoffice/customers?section=customers" className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-xs inline-block">
            {t('open_customer_soa_tool', 'Open Customer SOA Tool')}
          </Link>
        </div>
      </div>
    </div>
  );
}
