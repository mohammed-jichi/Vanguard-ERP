'use client';

import React from 'react';
import {
  ReportMetadata,
  ReportColumn,
  ReportSection,
  GrandTotal,
  PaperSize,
} from '@/types/reportEngine';
import { getPaperSizeClasses, StandardReportHeader, StandardReportFooter } from '@/components/reports/UnifiedPrintableReportSheet';
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
    <div className={`w-full font-sans text-slate-800 text-left select-none bg-background py-2 print:p-0 print:bg-white ${className}`}>
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
                  className="p-1.5 rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border cursor-pointer transition-colors shadow-2xs"
                  title="Zoom in"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.7))}
                  className="p-1.5 rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border cursor-pointer transition-colors shadow-2xs"
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-xs font-medium cursor-pointer transition-colors shadow-2xs"
                title="Export Flat CSV"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-xs font-medium cursor-pointer transition-colors shadow-2xs"
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
            size: ${orientation === 'auto' ? 'auto' : (isLandscape ? 'landscape' : 'portrait')};
            margin: 8mm;
          }
          html, body {
            width: 100% !important;
            height: auto !important;
          }
          .report-sheet, .printable-sheet {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }

          /* Prevent table from expanding wider than the sheet */
          table {
            width: 100% !important;
            max-width: 100% !important;
            table-layout: auto !important; /* or fixed where appropriate */
          }

          /* Auto-scale padding & typography for dense multi-column reports */
          th, td {
            padding: 4px 3px !important;
            font-size: 8.5pt !important;
            line-height: 1.15 !important;
            word-break: break-word;
          }

          /* Prevent numeric/date/code fields from wrapping awkwardly */
          .numeric-cell, .nowrap-cell {
            white-space: nowrap !important;
          }

          /* Container constraints */
          .printable-sheet, .report-table-container {
            width: 100% !important;
            max-width: 100% !important;
            overflow: visible !important;
          }
        }
      `}</style>

      {/* 2. AUTHENTIC DOCUMENT SHEET (PIXEL-PERFECT A4/FLEXIBLE CONTAINER) */}
      <div
        className={`report-sheet printable-sheet print:block w-full mx-auto bg-white border border-slate-200 rounded-xl shadow-sm min-h-[640px] flex flex-col justify-between transition-all duration-200 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-full ${paperClasses}`}
        style={zoomLevel !== 1 ? { transform: `scale(${zoomLevel})`, transformOrigin: 'top center' } : undefined}
      >
        <div>
          {/* ================================================================= */}
          {/* AUTHENTIC 3-ZONE HEADER ACROSS ALL VANGUARD REPORTS              */}
          {/* ================================================================= */}
          <StandardReportHeader
            companyName={metadata.companyName || 'Southern Olive Oil S.A.R.L.'}
            hqAddress="Choueifat Central Highway, Lebanon"
            companyWebsite="www.southernolive-lb.com"
            hqPhone="Tel / Support: +961 05 430 000"
            printDate={metadata.generatedDate}
            reportTitle={metadata.reportTitle}
            periodText={metadata.dateRange}
            facilityName={metadata.branch}
            facilityAddress="Industrial Zone, Old Saida Rd"
            facilityDirect="Dispatch / Cell: +961 70 000000"
            pageInfo={`Page ${metadata.pageNumber || 1} of ${metadata.totalPages || 1}`}
          />

          {/* ================================================================= */}
          {/* E. REPORT CONTENT: DATA-DRIVEN TABLE OR FREE-FORM CHILDREN        */}
          {/* ================================================================= */}
          <div className="report-table-container w-full mt-1 overflow-x-auto print:overflow-visible">
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
                          className={`py-2 px-1.5 sm:px-2 normal-case font-sans ${col.isMonospace || col.align === 'right' ? 'nowrap-cell' : 'print:whitespace-normal'} ${
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
                          ? 'text-foreground font-bold'
                          : section.type === 'cogs'
                          ? 'text-foreground font-bold'
                          : 'text-slate-800 font-bold';

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
                                      col.isMonospace ? 'font-mono tabular-nums numeric-cell' : 'font-sans'
                                    } ${col.align === 'right' ? 'numeric-cell' : ''} ${
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
        {/* STANDARDIZED CORPORATE FOOTER                                      */}
        {/* =================================================================== */}
        <StandardReportFooter
          reportCode={metadata.code}
          copyrightNotice="Copyright © 2026 Vanguard ERP. All Rights Reserved."
          websiteUrl="www.vanguard-erp.net"
        />
      </div>
    </div>
  );
}
