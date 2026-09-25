'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export default function CustomersDirectoryPage() {
  const { t, dir } = useLanguage();
  return (
    <div dir={dir} className="p-6 space-y-4 text-left rtl:text-right">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">{t('master_customers_stores_dir', 'Master Customers & Stores Directory')}</h1>
        <p className="text-xs text-slate-600 font-medium">{t('commercial_stores_distributors_sub', 'Commercial stores, distributors, supermarkets, and wholesale accounts')}</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
        <span className="text-3xl block mb-2">🏬</span>
        <h2 className="text-sm font-bold text-slate-800">{t('master_directory_active', 'Master Directory Active')}</h2>
        <p className="text-xs text-slate-500 mt-1">{t('unified_accounts_lebanon', '104,850 unified accounts across Lebanon')}</p>
        <div className="pt-2">
          <Link href="/backoffice/customers?section=customers" className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-xs inline-block">
            {t('open_customer_console', 'Open Customer Console')}
          </Link>
        </div>
      </div>
    </div>
  );
}
