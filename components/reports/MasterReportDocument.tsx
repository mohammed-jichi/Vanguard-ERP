import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { ReportMetadata, ReportColumn, ReportSection, GrandTotal, PaperSize } from '@/types/reports';
import { StandardReportHeader, StandardReportFooter } from './UnifiedPrintableReportSheet';

export interface MasterReportDocumentProps<T = any> {
  meta: ReportMetadata;
  columns: ReportColumn<T>[];
  sections?: ReportSection<T>[];
  flatRows?: T[];
  grandTotal?: GrandTotal;
  orientation?: 'portrait' | 'landscape' | 'auto';
  paperSize?: PaperSize;
  className?: string;
}

export function MasterReportDocument<T = any>({
  meta,
  columns,
  sections,
  flatRows,
  grandTotal,
  orientation = 'auto',
  paperSize = 'A4',
  className = '',
}: MasterReportDocumentProps<T>) {
  const { t, dir } = useLanguage();

  // Auto-detect landscape if 8 or more columns or explicitly requested
  const isLandscape = orientation === 'landscape' || (orientation === 'auto' && columns.length >= 8);

  const getSectionTitleColor = (type?: string) => {
    if (type === 'revenue') return 'text-foreground font-semibold';
    if (type === 'cogs') return 'text-foreground font-semibold';
    return 'text-slate-800 font-semibold';
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'right') return 'text-right';
    if (align === 'center') return 'text-center';
    return 'text-left';
  };

  return (
    <div
      className={`report-sheet printable-sheet print:block bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-7 mx-auto font-sans transition-all duration-150 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-full ${
        isLandscape ? 'max-w-[1440px] w-full' : 'max-w-5xl'
      } ${className}`}
    >
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

      {/* 1. Standardized 3-Zone Corporate Header */}
      <StandardReportHeader
        companyName="Southern Olive Oil S.A.R.L."
        hqAddress="Choueifat Central Highway, Lebanon"
        companyWebsite="www.southernolive-lb.com"
        hqPhone="Tel / Support: +961 05 430 000"
        printDate={meta.generatedDate}
        reportTitle={meta.reportTitle}
        periodText={meta.dateRange}
        facilityName={meta.branch}
        facilityAddress="Industrial Zone, Old Saida Rd"
        facilityDirect="Dispatch / Cell: +961 70 000000"
        pageInfo={`Page ${meta.pageNumber || 1} of ${meta.totalPages || 1}`}
      />

      {meta.filterSummary && (
        <div className="text-[10.5px] font-mono text-slate-600 mb-2 px-2 py-1 bg-slate-50 border border-slate-200 rounded">
          <span className="font-semibold text-slate-700">Filter Applied:</span> {meta.filterSummary}
        </div>
      )}

      {/* 3. Document Table Canvas with Horizontal Overflow Protection */}
      <div className="report-table-container w-full overflow-x-auto print:overflow-visible">
        <table className="w-full text-[11px] sm:text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75">
              {columns.map((col, idx) => (
                <th
                  key={String(col.key) || idx}
                  style={col.width ? { width: col.width } : undefined}
                  className={`py-2.5 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider ${col.isMonospace || col.align === 'right' ? 'nowrap-cell' : 'print:whitespace-normal'} ${getAlignClass(col.align)}`}
                >
                  {t(col.label, col.label)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sections && sections.some((s) => s.rows && s.rows.length > 0) ? (
              sections.map((section, sIdx) => (
                <React.Fragment key={`sec-${sIdx}`}>
                  {/* Section Header */}
                  <tr>
                    <td
                      colSpan={columns.length}
                      className={`pt-3.5 pb-1 px-1.5 sm:px-2 font-bold uppercase text-[10.5px] ${getSectionTitleColor(section.type)}`}
                    >
                      {t(section.title, section.title)}
                    </td>
                  </tr>

                  {/* Section Data Rows */}
                  {section.rows.map((row: any, rIdx: number) => (
                    <tr key={`sec-${sIdx}-row-${rIdx}`} className="hover:bg-slate-50/50 transition-colors">
                      {columns.map((col, cIdx) => (
                        <td
                          key={`sec-${sIdx}-col-${cIdx}`}
                          className={`py-1.5 px-1.5 sm:px-2 ${
                            col.isMonospace ? 'font-mono tabular-nums text-slate-700 numeric-cell' : 'text-slate-800'
                          } ${col.align === 'right' ? 'numeric-cell' : ''} ${getAlignClass(col.align)}`}
                        >
                          {col.render ? col.render(row) : row[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Section Subtotal */}
                  {section.subtotal && (
                    <tr className="border-t border-slate-300 border-b border-slate-200 font-bold bg-slate-50/20">
                      <td colSpan={columns.length - 1} className="py-1.5 px-1.5 sm:px-2 text-slate-900">
                        {t(section.subtotal.label, section.subtotal.label)}
                      </td>
                      <td
                        className={`py-1.5 px-1.5 sm:px-2 text-right font-mono tabular-nums numeric-cell nowrap-cell ${
                          section.subtotal.isNegative
                            ? 'text-destructive font-bold'
                            : 'text-foreground font-bold'
                        }`}
                      >
                        {section.subtotal.value}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : flatRows && flatRows.length > 0 ? (
              flatRows.map((row: any, rIdx: number) => (
                <tr key={`flat-${rIdx}`} className="hover:bg-slate-50/50">
                  {columns.map((col, cIdx) => (
                    <td
                      key={`flat-${rIdx}-col-${cIdx}`}
                      className={`py-1.5 px-1.5 sm:px-2 ${
                        col.isMonospace ? 'font-mono tabular-nums text-slate-700 numeric-cell' : 'text-slate-800'
                      } ${col.align === 'right' ? 'numeric-cell' : ''} ${getAlignClass(col.align)}`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 px-4 text-center text-slate-500 bg-slate-50/40 font-sans"
                >
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-700">
                      {t('No matching records found for the applied filter criteria.', 'No matching records found for the applied filter criteria.')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {t('Try adjusting or clearing your active filter parameters.', 'Try adjusting or clearing your active filter parameters.')}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>


          {/* 4. Grand Total Row */}
          {grandTotal && (
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-900">
                <td colSpan={columns.length - 1} className="py-3 px-3 text-slate-900 text-xs align-top">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-slate-900 tracking-tight">
                      {t(grandTotal.label, grandTotal.label)}
                    </span>
                    {grandTotal.breakdownText && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono font-medium text-slate-600">
                        <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
                          {t('Breakdown', 'Breakdown')}
                        </span>
                        <span>{grandTotal.breakdownText}</span>
                      </div>
                    )}
                    {grandTotal.convertedSubtext && (
                      <span className="text-[10.5px] text-slate-400 font-normal italic">
                        {grandTotal.convertedSubtext}
                      </span>
                    )}
                  </div>
                </td>
                <td
                  className={`py-3 px-3 text-right font-mono tabular-nums text-xs align-top numeric-cell nowrap-cell ${
                    grandTotal.isNegative
                      ? 'text-rose-600 font-semibold'
                      : 'text-slate-900 font-semibold'
                  }`}
                >
                  <div className="text-xs font-semibold">{grandTotal.value}</div>
                  {grandTotal.targetCurrency && (
                    <div className="text-[10px] font-sans font-medium uppercase tracking-wider text-slate-400 mt-0.5">
                      {t('Consolidated', 'Consolidated')} ({grandTotal.targetCurrency})
                    </div>
                  )}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* 5. Standardized Corporate Printable Footer */}
      <StandardReportFooter
        reportCode={meta.code}
        copyrightNotice="Copyright © 2026 Vanguard ERP. All Rights Reserved."
        websiteUrl="www.vanguard-erp.net"
      />
    </div>
  );
}

export default MasterReportDocument;

