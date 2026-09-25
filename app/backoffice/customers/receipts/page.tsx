'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export default function CustomerReceiptsPage() {
  const { t, dir } = useLanguage();
  return (
    <div dir={dir} className="p-6 space-y-4 text-left rtl:text-right">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">{t('payment_receipts_collections', 'Payment Receipts & Collections')}</h1>
        <p className="text-xs text-slate-600 font-medium">{t('payment_methods_receipts_desc', 'Cash, Whish Money, Cheques, and Bank Transfer receipts')}</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
        <span className="text-3xl block mb-2">💳</span>
        <h2 className="text-sm font-bold text-slate-800">{t('collections_receipts_log', 'Collections & Receipts Log')}</h2>
        <p className="text-xs text-slate-500 mt-1">{t('multichannel_payments_reconciliation', 'Multi-channel customer payments and voucher reconciliation')}</p>
        <div className="pt-2">
          <Link href="/backoffice/customers?section=receipts" className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-xs inline-block">
            {t('open_receipts_vouchers', 'Open Receipts & Vouchers')}
          </Link>
        </div>
      </div>
    </div>
  );
}
