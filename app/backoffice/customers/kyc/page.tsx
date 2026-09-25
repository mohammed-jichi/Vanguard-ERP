'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export default function EnterpriseKYCPage() {
  const { t, dir } = useLanguage();
  return (
    <div dir={dir} className="p-6 space-y-4 text-left rtl:text-right">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">{t('enterprise_kyc_compliance_title', 'Enterprise KYC Onboarding & Compliance')}</h1>
        <p className="text-xs text-slate-600 font-medium">{t('commercial_reg_pdf_tax_records', 'Commercial register PDF verification, tax identification, and corporate signatory records')}</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
        <span className="text-3xl block mb-2">📑</span>
        <h2 className="text-sm font-bold text-slate-800">{t('enterprise_kyc_module', 'Enterprise KYC Onboarding Module')}</h2>
        <p className="text-xs text-slate-500 mt-1">{t('upload_verify_commercial_reg', 'Upload and verify Lebanese Commercial Register & Signatory IDs')}</p>
        <div className="pt-2">
          <Link href="/backoffice/customers?section=customers" className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-xs inline-block">
            {t('manage_customer_kyc', 'Manage Customer KYC')}
          </Link>
        </div>
      </div>
    </div>
  );
}
