'use client';

import React, { useState } from 'react';

export interface MasterReportContainerProps {
  reportId?: string;
  reportTitle: string;
  categoryName?: string;
  dateDisplay?: string;
  totalPages?: number;
  currentPage?: number;
  filtersComponent?: React.ReactNode;
  onFilterSubmit?: () => void;
  onFilterReset?: () => void;
  onExport?: () => void;
  children: React.ReactNode;
}

export default function MasterReportContainer({
  reportId = 'REP_S_00191',
  reportTitle,
  categoryName = 'Sales Reports',
  dateDisplay = '29-Aug-26',
  totalPages = 5,
  currentPage = 1,
  filtersComponent,
  onFilterSubmit,
  onFilterReset,
  onExport,
  children,
}: MasterReportContainerProps) {
  const [zoomScale, setZoomScale] = useState<number>(1);

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.1, 1.4));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.1, 0.7));

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <div className="w-full font-sans text-slate-800">
      
      {/* 1. SOLID, CRISP OMEGA FILTER CARD (NO GHOST / NO TRANSPARENCY) */}
      {filtersComponent && (
        <div className="bg-white rounded-xl border border-slate-300/80 shadow-2xs p-4 mb-4 print:hidden">
          
          <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
            <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Filters</div>
              <div className="text-[10.5px] text-[#1a629b] font-semibold">{reportTitle}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Filter Controls Slot */}
            <div className="md:col-span-9 space-y-2">
              {filtersComponent}
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-3 flex flex-col gap-2 justify-start pt-1">
              <button
                type="button"
                onClick={onFilterSubmit}
                className="w-full py-1.5 px-3 bg-[#2d3748] hover:bg-[#1a202c] text-white text-xs font-bold rounded shadow-2xs transition-colors"
              >
                Filter Report
              </button>
              <button
                type="button"
                onClick={onFilterReset}
                className="w-full py-1.5 px-3 bg-[#4a2626] hover:bg-[#341818] text-white text-xs font-bold rounded shadow-2xs transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 2. COMPACT TOOLBAR (ZOOM, PRINT, EXPORT) */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-t-xl px-4 py-2 print:hidden">
        <h3 className="text-xs font-bold text-slate-800">{reportTitle}</h3>
        
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-6 h-6 bg-[#2e6b38] hover:bg-[#22522a] text-white rounded flex items-center justify-center text-xs"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-6 h-6 bg-[#2e6b38] hover:bg-[#22522a] text-white rounded flex items-center justify-center text-xs"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-2.5 py-1 bg-[#2d3748] hover:bg-[#1a202c] text-white text-xs font-semibold rounded shadow-2xs"
          >
            Print Report
          </button>
          <button
            type="button"
            onClick={onExport}
            className="px-2.5 py-1 bg-[#2d3748] hover:bg-[#1a202c] text-white text-xs font-semibold rounded shadow-2xs"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* 3. STRICT OMEGA A4 PRINT SHEET (CONDENSED & AUTO-RENDERED) */}
      <div className="w-full overflow-x-auto flex justify-center bg-slate-200/60 p-4 md:p-6 rounded-b-xl">
        <div
          style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }}
          className="w-[794px] min-h-[1123px] page-break-after-always relative bg-white p-8 shadow-md text-[11px] font-['Arial','Helvetica',sans-serif] leading-none text-black select-none transition-transform duration-150"
        >
          
          {/* Header Metadata */}
          <div className="flex justify-between items-start mb-3 border-b border-slate-200 pb-2">
            <div>
              <div className="text-[#1a629b] font-bold text-[13px] tracking-tight">
                Southern Olive Oil Products S.A.R.L
              </div>
              <div className="text-[10px] text-slate-500 mt-1">{dateDisplay}</div>
            </div>

            <div className="text-center">
              <div className="font-bold text-xs">{reportTitle}</div>
              <div className="text-[10px] text-slate-600 mt-0.5">Year: 2026 - Month: 8</div>
            </div>

            <div className="text-right text-[10px] text-slate-500 font-mono">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          {/* Children Table Matrix Slot */}
          <div className="w-full mt-2">
            {children}
          </div>

          {/* Footer Branding */}
          <div className="absolute bottom-4 left-8 right-8 pt-2 border-t border-slate-300 flex justify-between items-center text-[9px] text-slate-500 font-sans">
            <span>{reportId}</span>
            <span>Copyright © 2026 Vanguard ERP. All Rights Reserved.</span>
            <span>www.vanguarderp.com</span>
          </div>

        </div>
      </div>

    </div>
  );
}
