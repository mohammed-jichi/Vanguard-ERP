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
    <div className="w-full min-h-screen bg-background p-4 md:p-6 font-sans text-foreground text-left">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Module Header (Print Hidden) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-border print:hidden gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <h1 className="text-base font-bold text-foreground tracking-tight">
                {reportTitle || 'Master Report Viewer'}
              </h1>
              {displayCode && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded font-mono text-[10.5px] font-bold">
                  {displayCode}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {companyName} - Unified Reporting System
            </p>
          </div>

          {(dateDisplay || (totalPages !== undefined && currentPage !== undefined)) && (
            <div className="text-right text-xs font-mono text-muted-foreground">
              {dateDisplay && <div>{dateDisplay}</div>}
              {totalPages !== undefined && currentPage !== undefined && (
                <div>Page {currentPage} of {totalPages}</div>
              )}
            </div>
          )}
        </div>

        {/* Filter component if provided */}
        {filtersComponent && (
          <div className="bg-muted/40 p-3 rounded-xl border border-border print:hidden">
            {filtersComponent}
          </div>
        )}

        {/* Content Body */}
        {children}
      </div>
    </div>
  );
}
