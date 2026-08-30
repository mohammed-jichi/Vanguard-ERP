'use client';

import React, { useState } from 'react';
import ReportCategoriesSidebar, { ReportItem } from '@/components/modules/reports/ReportCategoriesSidebar';
import DynamicMasterReportViewer from '@/components/modules/reports/DynamicMasterReportViewer';

export default function DynamicReportViewPageRoute() {
  const [showCatalog, setShowCatalog] = useState(true);
  const [activeReport, setActiveReport] = useState<ReportItem>({
    id: 'ic_01',
    code: 'REP_IC_001',
    title: 'Summary of Voids',
    category: 'Internal Control',
  });

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800 text-left select-none">
      
      {/* Top Bar */}
      <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCatalog(!showCatalog)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer"
          >
            {showCatalog ? '◀ Hide Catalog' : '▶ Show Report Categories'}
          </button>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Active Report:</span>
            <span className="font-bold text-[#1a629b] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              [{activeReport.code}] {activeReport.title}
            </span>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-500">Southern Olive Oil Products S.A.R.L</span>
      </div>

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {showCatalog && (
          <div className="w-[280px] h-[calc(100vh-48px)] bg-white border-r border-slate-300 print:hidden shrink-0">
            <ReportCategoriesSidebar
              activeReportId={activeReport.id}
              onSelectReport={(rep) => setActiveReport(rep)}
            />
          </div>
        )}
        <div className="flex-1 h-[calc(100vh-48px)] overflow-y-auto p-4 md:p-6 bg-[#f1f5f9] custom-scrollbar">
          <DynamicMasterReportViewer
            key={`${activeReport.id}-${activeReport.code}`}
            reportCode={activeReport.code}
            reportTitle={activeReport.title}
            category={activeReport.category}
          />
        </div>
      </div>
    </div>
  );
}
