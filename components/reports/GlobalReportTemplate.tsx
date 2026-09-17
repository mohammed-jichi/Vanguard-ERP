'use client';

import React from 'react';
import {
  ReportMetadata,
  ReportColumn,
  ReportSection,
  GrandTotal,
  PaperSize,
} from '@/types/reportEngine';
import { getPaperSizeClasses } from '@/components/reports/UnifiedPrintableReportSheet';
import { Printer, Download, ZoomIn, ZoomOut } from 'lucide-react';

export interface GlobalReportTemplateProps<T = any> {
  metadata: ReportMetadata;
  columns?: ReportColumn<T>[];
  sections?: ReportSection<T>[];
  rows?: T[];
  grandTotal?: GrandTotal;
  grandTotals?: GrandTotal[];
  paperSize?: PaperSize;
  orientation?: 'portrait' | 'landscape' | 'auto';
  zoomLevel?: number;
  setZoomLevel?: (val: number | ((prev: number) => number)) => void;
  hideToolbar?: boolean;
  onPrint?: () => void;
  onExportCSV?: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * ============================================================================
 * GLOBAL REPORT TEMPLATE ENGINE (VANGUARD ERP)
 * Standardized across:
 * - Sales Control
 * - Operations & Inventory
 * - Loyalty Management
 * - Accounting & Financial Statements
 * - Supersonic Fleet & Logistics
 * - Social Media CRM
 * ============================================================================
 */
export default function GlobalReportTemplate<T = any>({
  metadata,
  columns = [],
  sections,
  rows = [],
  grandTotal,
  grandTotals,
  paperSize = 'A4',
  orientation = 'auto',
  zoomLevel = 1,
  setZoomLevel,
  hideToolbar = true, // Default to true because top header already has export buttons per UX rule
  onPrint,
  onExportCSV,
  actions,
  children,
  className = '',
}: GlobalReportTemplateProps<T>) {
  const isLandscape = orientation === 'landscape' || (orientation === 'auto' && columns.length >= 8);
  const paperClasses = getPaperSizeClasses(paperSize, isLandscape ? 'landscape' : 'portrait');

  const handlePrint = () => {
    if (onPrint) onPrint();
    else window.print();
  };

  const totalsList = grandTotals || (grandTotal ? [grandTotal] : []);

  return (
    <div className={`w-full font-sans text-slate-800 text-left select-none bg-[#f4f6f9] py-2 print:p-0 print:bg-white ${className}`}>
      {/* 1. OPTIONAL ACTION TOOLBAR (SCREEN ONLY) */}
      {!hideToolbar && (
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 mb-4 shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Report Code:</span>
            <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              {metadata.code}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {setZoomLevel && (
              <>
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 1.4))}
                  className="p-1.5 rounded-md bg-[#1b5e20] hover:bg-[#144717] text-white cursor-pointer transition-colors shadow-2xs"
                  title="Zoom in"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.7))}
                  className="p-1.5 rounded-md bg-[#1b5e20] hover:bg-[#144717] text-white cursor-pointer transition-colors shadow-2xs"
                  title="Zoom out"
                >
                  <ZoomOut size={14} />
                </button>
              </>
            )}

            {onExportCSV && (
              <button
                type="button"
                onClick={onExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2d3748] hover:bg-[#1a202c] text-white rounded-md text-xs font-medium cursor-pointer transition-colors shadow-2xs"
                title="Export Flat CSV"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2d3748] hover:bg-[#1a202c] text-white rounded-md text-xs font-medium cursor-pointer transition-colors shadow-2xs"
              title="Print Document"
            >
              <Printer size={13} />
              <span>Print Report</span>
            </button>

            {actions}
          </div>
        </div>
      )}

      {/* Print Page Orientation & Margin Rule */}
      <style>{`
        @media print {
          @page {
            size: ${isLandscape ? 'landscape' : 'auto'};
            margin: ${isLandscape ? '8mm 6mm' : '12mm 10mm'};
          }
          .report-sheet {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* 2. AUTHENTIC DOCUMENT SHEET (PIXEL-PERFECT A4/FLEXIBLE CONTAINER) */}
      <div
        className={`report-sheet print:block w-full mx-auto bg-white border border-slate-200 rounded-xl shadow-sm min-h-[640px] flex flex-col justify-between transition-all duration-200 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-full ${paperClasses}`}
        style={zoomLevel !== 1 ? { transform: `scale(${zoomLevel})`, transformOrigin: 'top center' } : undefined}
      >
        <div>
          {/* ================================================================= */}
          {/* A. AUTHENTIC CORPORATE TOPPER (CENTERED BLUE)                     */}
          {/* ================================================================= */}
          <div className="text-center">
            <h1 className="font-bold text-report-company text-blue-700 text-[15px] tracking-wide uppercase font-sans">
              {metadata.companyName || 'Zeit w zaytoun ljanoub'}
            </h1>
            {metadata.subtitle && (
              <div className="text-[11px] font-semibold text-slate-600 tracking-normal mt-0.5 font-sans">
                {metadata.subtitle}
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* B. REPORT TITLE (CENTERED BOLD)                                   */}
          {/* ================================================================= */}
          <div className="text-center font-extrabold text-report-title text-slate-900 text-[13.5px] mt-2.5 mb-1.5 font-sans">
            {metadata.reportTitle}
          </div>

          {/* ================================================================= */}
          {/* C. EXECUTION SUBHEADER (DATE, PERIOD, PAGE)                       */}
          {/* ================================================================= */}
          <div className="flex items-center justify-between text-report-meta text-[11px] text-slate-800 font-mono mt-3 mb-1">
            <span className="font-medium">{metadata.generatedDate}</span>
            <span className="font-bold text-center flex-1">
              {metadata.dateRange || 'Current Active Period'}
            </span>
            <span className="font-medium">
              Page {metadata.pageNumber || 1} of {metadata.totalPages || 1}
            </span>
          </div>

          {/* ================================================================= */}
          {/* D. TOP SOLID DIVIDING RULE                                        */}
          {/* ================================================================= */}
          <div className="border-b-report-master border-b-2 border-report-borderMaster border-slate-900 mb-2"></div>

          {/* Branch Subtitle & System Ledger Source */}
          <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate-700 mb-2 font-sans">
            <span>Branch: {metadata.branch || 'Zeit w zaytoun ljanoub'}</span>
            <span className="font-mono text-slate-500">
              System Source: {metadata.systemSource || 'Vanguard ERP Live Ledger'}
            </span>
          </div>

          {/* ================================================================= */}
          {/* E. REPORT CONTENT: DATA-DRIVEN TABLE OR FREE-FORM CHILDREN        */}
          {/* ================================================================= */}
          <div className="w-full mt-1 overflow-x-auto print:overflow-visible">
            {children ? (
              children
            ) : (
              <table className="w-full text-left border-collapse text-[11px]">
                {/* Column Headers */}
                {columns.length > 0 && (
                  <thead>
                    <tr className="border-b-report-master border-b-2 border-slate-900 font-bold text-black leading-tight bg-slate-50/70">
                      {columns.map((col, idx) => (
                        <th
                          key={`${String(col.key)}-${idx}`}
                          className={`py-2 px-1.5 sm:px-2 normal-case font-sans whitespace-nowrap ${
                            col.align === 'right'
                              ? 'text-right'
                              : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                          }`}
                          style={col.width ? { width: col.width } : undefined}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}

                {/* Table Body */}
                <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
                  {/* Mode 1: Sectioned Table (Accounting / Ledger layout) */}
                  {sections && sections.length > 0 ? (
                    sections.map((section, sIdx) => {
                      const sectionColor =
                        section.type === 'revenue'
                          ? 'text-report-sectionRevenue text-[#1a629b]'
                          : section.type === 'cogs'
                          ? 'text-report-sectionCogs text-[#7a1c1c]'
                          : 'text-slate-800';

                      return (
                        <React.Fragment key={`section-${sIdx}`}>
                          {/* Section Super-Header */}
                          <tr className="bg-slate-100/70 font-bold">
                            <td
                              colSpan={columns.length || 1}
                              className={`py-1.5 px-2 uppercase text-[11px] font-sans tracking-wider ${sectionColor}`}
                            >
                              {section.title}
                            </td>
                          </tr>

                          {/* Section Data Rows */}
                          {section.rows.map((row: any, rIdx: number) => (
                            <tr
                              key={`sec-${sIdx}-row-${rIdx}`}
                              className="even:bg-slate-50/40 hover:bg-blue-50/30 transition-colors"
                            >
                              {columns.map((col, cIdx) => {
                                const rawVal = col.render ? col.render(row) : row[col.key];
                                const strVal = String(rawVal ?? '');
                                const isNegative =
                                  strVal.startsWith('(') ||
                                  strVal.startsWith('-') ||
                                  (typeof rawVal === 'number' && rawVal < 0);

                                return (
                                  <td
                                    key={`col-${cIdx}`}
                                    className={`py-1.5 px-1.5 sm:px-2 ${
                                      col.isMonospace ? 'font-mono tabular-nums' : 'font-sans'
                                    } ${
                                      col.align === 'right'
                                        ? 'text-right'
                                        : col.align === 'center'
                                        ? 'text-center'
                                        : 'text-left'
                                    } ${isNegative ? 'text-report-negative text-rose-700 font-bold' : 'text-slate-800'}`}
                                  >
                                    {rawVal ?? '-'}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}

                          {/* Section Subtotal (if provided) */}
                          {section.subtotal && (
                            <tr className="border-t border-slate-300 font-bold bg-slate-50/70">
                              <td
                                colSpan={Math.max(1, columns.length - 1)}
                                className="py-1.5 px-2.5 pl-4 text-slate-700 font-sans"
                              >
                                {section.subtotal.label}
                              </td>
                              <td
                                className={`py-1.5 px-2.5 text-right font-mono font-bold ${
                                  section.subtotal.isNegative
                                    ? 'text-report-negative text-rose-800'
                                    : 'text-report-positive text-emerald-900'
                                }`}
                              >
                                {section.subtotal.value}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    /* Mode 2: Flat Table Rows */
                    rows.map((row: any, rIdx: number) => (
                      <tr
                        key={`row-${rIdx}`}
                        className="even:bg-slate-50/40 hover:bg-blue-50/30 transition-colors"
                      >
                        {columns.map((col, cIdx) => (
                          <td
                            key={`col-${cIdx}`}
                            className={`py-1.5 px-1.5 sm:px-2 ${
                              col.isMonospace ? 'font-mono tabular-nums' : 'font-sans'
                            } ${
                              col.align === 'right'
                                ? 'text-right'
                                : col.align === 'center'
                                ? 'text-center'
                                : 'text-left'
                            }`}
                          >
                            {col.render ? col.render(row) : (row[col.key] ?? '-')}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>

                {/* Grand Totals Footer */}
                {totalsList.length > 0 && (
                  <tfoot>
                    {totalsList.map((tot, idx) => (
                      <tr
                        key={`grand-total-${idx}`}
                        className="border-t-report-master border-t-2 border-slate-900 font-bold bg-slate-100 text-[12px]"
                      >
                        <td
                          colSpan={Math.max(1, columns.length - 1)}
                          className="py-2.5 px-2.5 font-sans uppercase text-slate-900"
                        >
                          {tot.label}
                        </td>
                        <td
                          className={`py-2.5 px-2.5 text-right font-mono font-black text-[13px] ${
                            tot.isNegative
                              ? 'text-report-negative text-rose-800'
                              : 'text-report-positive text-emerald-800'
                          }`}
                        >
                          {tot.value}
                        </td>
                      </tr>
                    ))}
                  </tfoot>
                )}
              </table>
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* F. AUTHENTIC CORPORATE FOOTER WITH REPORT CODE, COPYRIGHT & LINK    */}
        {/* =================================================================== */}
        <div className="pt-16 mt-8 print:pt-6">
          {/* Bottom Solid Dividing Rule */}
          <div className="border-b-report-master border-b-2 border-report-borderMaster border-slate-900 mb-1.5"></div>

          <div className="flex items-center justify-between text-[10px] text-slate-800 font-sans">
            <span className="font-mono font-bold tracking-wider text-slate-900">
              {metadata.code}
            </span>
            <span className="text-slate-700 font-medium text-center flex-1">
              Copyright © 2026 Vanguard ERP. All Rights Reserved.
            </span>
            <div className="text-right">
              <a
                href="https://www.vanguarderp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:underline font-mono text-[10px] cursor-pointer"
              >
                &quot;www.vanguarderp.com&quot;
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
