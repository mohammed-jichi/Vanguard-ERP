import React from 'react';
import { ReportMetadata, ReportColumn, ReportSection, GrandTotal, PaperSize } from '@/types/reports';

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
  // Auto-detect landscape if 8 or more columns or explicitly requested
  const isLandscape = orientation === 'landscape' || (orientation === 'auto' && columns.length >= 8);

  const getSectionTitleColor = (type?: string) => {
    if (type === 'revenue') return 'text-[var(--report-color-section-revenue,#1a629b)]';
    if (type === 'cogs') return 'text-[var(--report-color-section-cogs,#7a1c1c)]';
    return 'text-slate-800';
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'right') return 'text-right';
    if (align === 'center') return 'text-center';
    return 'text-left';
  };

  return (
    <div
      className={`report-sheet print:block bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-7 mx-auto font-sans transition-all duration-150 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-full ${
        isLandscape ? 'max-w-[1440px] w-full' : 'max-w-5xl'
      } ${className}`}
    >
      {/* Print Page Orientation & Margin Rule */}
      <style>{`
        @media print {
          @page {
            size: ${isLandscape ? 'landscape' : 'portrait'};
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

      {/* 1. Header Section */}
      <div className="text-center mb-5">
        <h1 className="text-[var(--report-color-company-title,#1d4ed8)] text-base sm:text-lg font-bold tracking-wide uppercase">
          {meta.companyName}
        </h1>
        {meta.subtitle && (
          <p className="text-slate-500 text-xs font-normal mt-0.5">{meta.subtitle}</p>
        )}
        <h2 className="text-[var(--report-color-report-title,#0f172a)] text-sm sm:text-base font-extrabold mt-2.5 tracking-tight">
          {meta.reportTitle}
        </h2>
      </div>

      {/* 2. Audit Meta Bar */}
      <div className="flex justify-between items-center text-slate-700 text-xs font-medium py-1 border-b border-slate-300 mb-1">
        <span>{meta.generatedDate}</span>
        <span>Period: {meta.dateRange}</span>
        <span>Page {meta.pageNumber || 1} of {meta.totalPages || 1}</span>
      </div>
      <div className="flex flex-wrap justify-between items-center text-slate-500 text-[11px] pb-2.5 mb-3 gap-y-1">
        <span>
          Branch: {meta.branch}
          {meta.filterSummary && (
            <span className="ml-2 pl-2 border-l border-slate-300 text-slate-600 font-medium">
              {meta.filterSummary}
            </span>
          )}
        </span>
        <span>System Source: {meta.systemSource}</span>
      </div>

      {/* 3. Document Table Canvas with Horizontal Overflow Protection */}
      <div className="w-full overflow-x-auto print:overflow-visible">
        <table className="w-full text-[11px] sm:text-xs border-collapse">
          <thead>
            <tr className="border-y-2 border-slate-900 border-y-[var(--report-border-master-width,2px)] border-[var(--report-border-master-color,#0f172a)] bg-slate-50/70">
              {columns.map((col, idx) => (
                <th
                  key={String(col.key) || idx}
                  style={col.width ? { width: col.width } : undefined}
                  className={`py-2 px-1.5 sm:px-2 font-bold text-slate-900 tracking-tight whitespace-nowrap ${getAlignClass(col.align)}`}
                >
                  {col.label}
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
                      {section.title}
                    </td>
                  </tr>

                  {/* Section Data Rows */}
                  {section.rows.map((row: any, rIdx: number) => (
                    <tr key={`sec-${sIdx}-row-${rIdx}`} className="hover:bg-slate-50/50 transition-colors">
                      {columns.map((col, cIdx) => (
                        <td
                          key={`sec-${sIdx}-col-${cIdx}`}
                          className={`py-1.5 px-1.5 sm:px-2 ${
                            col.isMonospace ? 'font-mono tabular-nums text-slate-700' : 'text-slate-800'
                          } ${getAlignClass(col.align)}`}
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
                        {section.subtotal.label}
                      </td>
                      <td
                        className={`py-1.5 px-1.5 sm:px-2 text-right font-mono tabular-nums ${
                          section.subtotal.isNegative
                            ? 'text-[var(--report-color-negative,#be123c)]'
                            : 'text-[var(--report-color-company-title,#1d4ed8)]'
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
                        col.isMonospace ? 'font-mono tabular-nums text-slate-700' : 'text-slate-800'
                      } ${getAlignClass(col.align)}`}
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
                      No matching records found for the applied filter criteria.
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Try adjusting or clearing your active filter parameters.
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>


          {/* 4. Grand Total Row */}
          {grandTotal && (
            <tfoot>
              <tr className="border-t border-slate-400 border-b-4 border-double border-b-slate-900 font-bold bg-slate-50/40">
                <td colSpan={columns.length - 1} className="py-2 px-1.5 sm:px-2 text-slate-900 text-xs sm:text-sm">
                  {grandTotal.label}
                </td>
                <td
                  className={`py-2 px-1.5 sm:px-2 text-right font-mono tabular-nums text-xs sm:text-sm ${
                    grandTotal.isNegative
                      ? 'text-[var(--report-color-negative-total,#9f1239)]'
                      : 'text-slate-900'
                  }`}
                >
                  {grandTotal.value}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* 5. Document Footer */}
      <div className="border-t border-slate-300 mt-6 pt-2.5 flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <span>{meta.code}</span>
        <span>Copyright © 2026 Vanguard ERP. All Rights Reserved.</span>
      </div>
    </div>
  );
}

export default MasterReportDocument;

