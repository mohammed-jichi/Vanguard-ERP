'use client';

import React from 'react';

export interface MasterReportContainerProps {
  reportTitle?: string;
  reportCode?: string;
  reportId?: string;
  companyName?: string;
  dateDisplay?: string;
  totalPages?: number;
  currentPage?: number;
  filtersComponent?: React.ReactNode;
  children: React.ReactNode;
}

export default function MasterReportContainer({
  reportTitle,
  reportCode,
  reportId,
  companyName = 'Southern Olive Oil Products S.A.R.L',
  dateDisplay,
  totalPages,
  currentPage,
  filtersComponent,
  children,
}: MasterReportContainerProps) {
  const displayCode = reportCode || reportId;

  return (
    <div className="w-full min-h-screen bg-slate-100/70 p-4 md:p-6 font-sans text-slate-800 text-left">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Module Header (Print Hidden) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-200 print:hidden gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1a629b]"></span>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                {reportTitle || 'Master Report Viewer'}
              </h1>
              {displayCode && (
                <span className="px-2 py-0.5 bg-blue-50 text-[#1a629b] border border-blue-200 rounded font-mono text-[10.5px] font-bold">
                  {displayCode}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {companyName} - Unified Reporting System
            </p>
          </div>

          {(dateDisplay || (totalPages !== undefined && currentPage !== undefined)) && (
            <div className="text-right text-xs font-mono text-slate-600">
              {dateDisplay && <div>{dateDisplay}</div>}
              {totalPages !== undefined && currentPage !== undefined && (
                <div>Page {currentPage} of {totalPages}</div>
              )}
            </div>
          )}
        </div>

        {/* Filter component if provided */}
        {filtersComponent && (
          <div className="bg-[#f1f5f9] p-3 rounded-lg border border-slate-300 print:hidden">
            {filtersComponent}
          </div>
        )}

        {/* Content Body */}
        {children}
      </div>
    </div>
  );
}
