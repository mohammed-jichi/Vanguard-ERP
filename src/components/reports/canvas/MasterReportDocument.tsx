import React from 'react';
import { ReportMetadata, ReportColumn, ReportSection, GrandTotal } from '@/types/reports';

export interface MasterReportDocumentProps<T = any> {
  meta: ReportMetadata;
  columns: ReportColumn<T>[];
  sections?: ReportSection<T>[];
  flatRows?: T[];
  grandTotal?: GrandTotal;
}

export function MasterReportDocument<T = any>({
  meta,
  columns,
  sections,
  flatRows,
  grandTotal,
}: MasterReportDocumentProps<T>) {
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
    <div className="report-sheet print:block bg-white border border-slate-200 rounded-xl shadow-sm p-8 max-w-5xl mx-auto font-sans print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-full">
      {/* 1. Header Section */}
      <div className="text-center mb-6">
        <h1 className="text-[var(--report-color-company-title,#1d4ed8)] text-base sm:text-lg font-bold tracking-wide uppercase">
          {meta.companyName}
        </h1>
        {meta.subtitle && (
          <p className="text-slate-500 text-xs font-normal mt-0.5">{meta.subtitle}</p>
        )}
        <h2 className="text-[var(--report-color-report-title,#0f172a)] text-sm sm:text-base font-extrabold mt-3 tracking-tight">
          {meta.reportTitle}
        </h2>
      </div>

      {/* 2. Audit Meta Bar */}
      <div className="flex justify-between items-center text-slate-700 text-xs font-medium py-1 border-b border-slate-300 mb-1">
        <span>{meta.generatedDate}</span>
        <span>Period: {meta.dateRange}</span>
        <span>Page {meta.pageNumber || 1} of {meta.totalPages || 1}</span>
      </div>
      <div className="flex justify-between items-center text-slate-500 text-[11px] pb-3 mb-4">
        <span>Branch: {meta.branch}</span>
        <span>System Source: {meta.systemSource}</span>
      </div>

      {/* 3. Document Table Canvas */}
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-y-[var(--report-border-master-width,2px)] border-[var(--report-border-master-color,#0f172a)]">
            {columns.map((col, idx) => (
              <th
                key={String(col.key) || idx}
                style={{ width: col.width }}
                className={`py-2 px-3 font-bold text-slate-900 tracking-tight ${getAlignClass(col.align)}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sections ? (
            sections.map((section, sIdx) => (
              <React.Fragment key={`sec-${sIdx}`}>
                {/* Section Header */}
                <tr>
                  <td
                    colSpan={columns.length}
                    className={`pt-4 pb-1 px-3 font-bold uppercase text-[11px] ${getSectionTitleColor(section.type)}`}
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
                        className={`py-1.5 px-3 ${
                          col.isMonospace ? 'font-mono text-slate-500' : 'text-slate-800'
                        } ${getAlignClass(col.align)}`}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Section Subtotal */}
                {section.subtotal && (
                  <tr className="border-t border-slate-300 font-bold">
                    <td colSpan={columns.length - 1} className="py-2 px-3 text-slate-900">
                      {section.subtotal.label}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-mono tabular-nums ${
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
          ) : (
            flatRows?.map((row: any, rIdx: number) => (
              <tr key={`flat-${rIdx}`} className="hover:bg-slate-50/50">
                {columns.map((col, cIdx) => (
                  <td
                    key={`flat-${rIdx}-col-${cIdx}`}
                    className={`py-1.5 px-3 ${
                      col.isMonospace ? 'font-mono text-slate-500' : 'text-slate-800'
                    } ${getAlignClass(col.align)}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>

        {/* 4. Grand Total Row */}
        {grandTotal && (
          <tfoot>
            <tr className="border-t border-slate-400 border-b-[var(--report-border-master-width,2px)] border-b-[var(--report-border-master-color,#0f172a)] font-bold">
              <td colSpan={columns.length - 1} className="py-2.5 px-3 text-slate-900 text-xs sm:text-sm">
                {grandTotal.label}
              </td>
              <td
                className={`py-2.5 px-3 text-right font-mono tabular-nums text-xs sm:text-sm ${
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

      {/* 5. Document Footer */}
      <div className="border-t border-slate-300 mt-8 pt-3 flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <span>{meta.code}</span>
        <span>Copyright © 2026 Vanguard ERP. All Rights Reserved.</span>
      </div>
    </div>
  );
}

export default MasterReportDocument;
