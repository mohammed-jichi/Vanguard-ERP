'use client';

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

export default function CostCentersPage() {
  const { t, dir } = useLanguage();

  return (
    <div dir={dir} className="p-6 space-y-4 text-left rtl:text-right">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">{t('branches_cost_centers_title', 'Branches & Factory Cost Centers')}</h1>
        <p className="text-xs text-slate-600 font-medium">
          {t('branches_cost_centers_desc', 'Choueifat Pressing Plant, Beirut Distribution, and Fleet Operations cost allocation')}
        </p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
        <span className="text-3xl block mb-2">🏢</span>
        <h2 className="text-sm font-bold text-slate-800">{t('cost_center_allocation_active', 'Cost Center Allocation Active')}</h2>
        <p className="text-xs text-slate-500 mt-1">{t('multi_branch_attribution_desc', 'Multi-branch expense and revenue attribution')}</p>
      </div>
    </div>
  );
}
