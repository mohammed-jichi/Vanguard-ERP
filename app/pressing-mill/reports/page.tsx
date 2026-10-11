'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { DynamicReportView } from '@/components/reports/DynamicReportView';
import {
  Wheat,
  Scale,
  Activity,
  Layers,
  FileSpreadsheet,
  Calendar,
  Filter,
  RefreshCw,
  Printer
} from 'lucide-react';
import Link from 'next/link';

const PRESSING_REPORTS = [
  {
    id: 'REP_MILL_001',
    title: 'Olive Intake & Weighbridge Log',
    icon: Scale,
    description: 'Detailed gross, tare, and net olive intake register by grower and cultivar.'
  },
  {
    id: 'REP_MILL_002',
    title: 'Pressing Batches & Extraction Yield',
    icon: Activity,
    description: 'Decanter line extractions, oil yield percentages, and acidity grading.'
  },
  {
    id: 'REP_MILL_003',
    title: 'Storage Tank Levels & Oil Quality',
    icon: Layers,
    description: 'Real-time capacity, ullage, fill percentages, and storage sanitization logs.'
  },
  {
    id: 'REP_MILL_004',
    title: 'Farmer Settlement Balances',
    icon: FileSpreadsheet,
    description: 'Grower processing fee balances, oil custody shares, and payout schedules.'
  }
];

export default function PressingMillReportsPage() {
  const { t } = useLanguage();
  const [selectedReportId, setSelectedReportId] = useState<string>('REP_MILL_001');
  const [fromDate, setFromDate] = useState<string>('2026-09-01');
  const [toDate, setToDate] = useState<string>('2026-09-30');
  const [branch, setBranch] = useState<string>('Southern Olive and Oil Products - Main');

  const activeReport = PRESSING_REPORTS.find((r) => r.id === selectedReportId) || PRESSING_REPORTS[0];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Wheat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {t('pressing_mill_reports', 'Pressing Mill Operational Reports')}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                LIVE KERNEL
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {t('pressing_mill_reports_sub', 'Live audit records for olive intake, decanter pressing yields, tank inventory, and grower settlements.')}
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="flex items-center gap-2">
          <Link prefetch={false}
            href="/pressing-mill/dashboard"
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            ← {t('back_to_mill', 'Mill Dashboard')}
          </Link>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('print', 'Print Report')}</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESSING_REPORTS.map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReportId === rep.id;
          return (
            <button
              key={rep.id}
              type="button"
              onClick={() => setSelectedReportId(rep.id)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50/80 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-[10px] font-bold text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {rep.id}
                </span>
                <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
              </div>
              <div>
                <h3 className={`text-xs font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-900'}`}>
                  {rep.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                  {rep.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter Parameters Ribbon */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('filter_window', 'Audit Window:')}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">{t('from', 'From:')}</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs text-slate-800 font-mono shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">{t('to', 'To:')}</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs text-slate-800 font-mono shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">{t('facility', 'Facility:')}</span>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs text-slate-800 font-medium shadow-2xs"
            >
              <option value="Southern Olive and Oil Products - Main">Main Pressing Plant (Choueifat)</option>
              <option value="Koura High Mill Facility">Koura High Mill Facility</option>
              <option value="Hasbaya Extraction Center">Hasbaya Extraction Center</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setFromDate('2026-09-01');
              setToDate('2026-09-30');
            }}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            {t('reset_filters', 'Reset')}
          </button>
        </div>
      </div>

      {/* Dynamic Report View Mounted by Selected ID */}
      <DynamicReportView
        key={selectedReportId}
        reportId={selectedReportId}
        reportTitle={activeReport.title}
        fromDate={fromDate}
        toDate={toDate}
        branch={branch}
        hideToolbar={false}
      />
    </div>
  );
}
