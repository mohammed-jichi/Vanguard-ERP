'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import MasterReportDocument from './MasterReportDocument';
import UnifiedPrintableReportSheet from './UnifiedPrintableReportSheet';
import {
  getReportDefinition,
  ReportDefinition,
  UNIVERSAL_REPORT_REGISTRY,
} from '@/lib/reports/reportSchemaRegistry';
import { ReportColumn, ReportMetadata, GrandTotal } from '@/types/reports';
import { formatCurrencyAmount } from '@/lib/currencyEngine';
import { Loader2 } from 'lucide-react';
import { executeReportQuery, UniversalFilterPayload } from '@/lib/reports/reportQueryEngine';

export interface DynamicReportViewProps {
  reportId: string;
  reportTitle?: string;
  filterValues?: Record<string, any>;
  fromDate?: string;
  toDate?: string;
  branch?: string;
  currency?: string;
  hideToolbar?: boolean;
  className?: string;
}

export function DynamicReportView({
  reportId,
  reportTitle,
  filterValues = {},
  fromDate = '01-Sep-2026',
  toDate = '30-Sep-2026',
  branch = 'Southern Olive and Oil Products - Main',
  currency = 'USD',
  hideToolbar = false,
  className = '',
}: DynamicReportViewProps) {
  const { t } = useLanguage();

  // 1. Resolve Registered Definition
  const reportDef: ReportDefinition = useMemo(() => {
    const found = getReportDefinition(reportId) || (reportTitle ? getReportDefinition(reportTitle) : null);
    if (found) return found;

    // Fallback definition if unlisted ID
    return {
      id: reportId || 'REP_CUSTOM',
      title: reportTitle || reportId || 'Universal Document Report',
      endpoint: `/api/reports/engine?reportKey=${encodeURIComponent(reportId)}`,
      columns: [
        { key: 'reference', label: 'Reference #', align: 'left', format: 'text' },
        { key: 'date', label: 'Transaction Date', align: 'left', format: 'date' },
        { key: 'description', label: 'Account / Item Description', align: 'left', format: 'text' },
        { key: 'status', label: 'Status', align: 'center', format: 'badge' },
        { key: 'amount', label: 'Amount ($)', align: 'right', format: 'currency' },
      ],
      defaultOrientation: 'portrait',
    };
  }, [reportId, reportTitle]);

  // 2. State for live data
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 3. Dynamic Live Data Fetching
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setFetchError(null);

    async function loadReport() {
      try {
        const payload: UniversalFilterPayload = {
          reportId: reportDef.id || reportId,
          dateFrom: fromDate || '2026-09-01',
          dateTo: toDate || '2026-09-30',
          facilityId: branch !== 'ALL' ? branch : filterValues?.branch || 'all',
          departmentId: filterValues?.department || filterValues?.departmentCostCenter || filterValues?.dept || 'all',
          terminalId: filterValues?.terminal || filterValues?.biometricTerminal || 'all',
          status: filterValues?.status,
          currency: currency || 'USD',
          customParams: filterValues,
        };

        const result = await executeReportQuery(payload);
        if (isCancelled) return;

        if (result && Array.isArray(result.rows) && result.rows.length > 0) {
          setData(result.rows);
          setIsLoading(false);
          return;
        }

        // Fallback to HTTP endpoint if engine returned 0 rows
        const params = new URLSearchParams();
        if (fromDate) params.set('fromDate', fromDate);
        if (toDate) params.set('toDate', toDate);
        if (branch && branch !== 'ALL') params.set('branch', branch);
        if (currency) params.set('currency', currency);

        Object.entries(filterValues).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== 'ALL' && v !== '') {
            params.set(k, String(v));
          }
        });

        const separator = reportDef.endpoint.includes('?') ? '&' : '?';
        const requestUrl = `${reportDef.endpoint}${separator}${params.toString()}`;

        const res = await fetch(requestUrl);
        if (!res.ok) {
          if (isCancelled) return;
          setData(result.rows || []);
          setIsLoading(false);
          return;
        }
        const json = await res.json();
        if (isCancelled) return;
        const rows = Array.isArray(json) ? json : (json?.data || json?.records || json?.items || []);
        setData(Array.isArray(rows) && rows.length > 0 ? rows : (result.rows || []));
        setIsLoading(false);
      } catch (err: any) {
        if (isCancelled) return;
        console.warn(`[DynamicReportView] Failed loading live endpoint for ${reportDef.id}:`, err);
        setFetchError(err.message);
        setData([]);
        setIsLoading(false);
      }
    }

    loadReport();

    return () => {
      isCancelled = true;
    };
  }, [reportDef.id, reportDef.endpoint, fromDate, toDate, branch, currency, filterValues]);

  // 4. Map columns to MasterReportDocument format
  const columns: ReportColumn<any>[] = useMemo(() => {
    return reportDef.columns.map((col) => ({
      key: col.key,
      label: col.label,
      align: col.align || 'left',
      width: undefined,
      isMonospace: col.format === 'currency' || col.format === 'date',
      render: (row: any) => {
        const val = row[col.key];
        if (val === null || val === undefined) return '-';

        if (col.format === 'currency') {
          const num = Number(val) || 0;
          const isLbp = col.label.toLowerCase().includes('lbp') || col.key.toLowerCase().includes('lbp');
          if (isLbp) {
            return `${Math.round(num).toLocaleString()} LBP`;
          }
          return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        if (col.format === 'badge') {
          const s = String(val);
          const isPositive = /active|paid|settled|cleared|delivered|verified|approved|success/i.test(s);
          const isWarning = /pending|in[- ]?progress|held|review/i.test(s);
          const colorClass = isPositive
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : isWarning
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-slate-100 text-slate-700 border-slate-200';

          return (
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${colorClass}`}>
              {s}
            </span>
          );
        }

        return String(val);
      },
    }));
  }, [reportDef.columns]);

  // 5. Compute Grand Total if currency columns exist
  const grandTotal: GrandTotal | undefined = useMemo(() => {
    if (!data || data.length === 0) return undefined;
    const currencyCol = reportDef.columns.find((c) => c.format === 'currency');
    if (!currencyCol) return undefined;

    const sum = data.reduce((acc, row) => acc + (Number(row[currencyCol.key]) || 0), 0);
    return {
      label: `Total ${currencyCol.label}`,
      value: formatCurrencyAmount(sum, currency, true),
      targetCurrency: currency,
    };
  }, [data, reportDef.columns, currency]);

  // 6. Report Metadata
  const meta: ReportMetadata = useMemo(() => {
    return {
      companyName: 'Southern Olive Oil S.A.R.L.',
      subtitle: 'Southern Olive Oil S.A.R.L. - Universal Operations Register',
      reportTitle: reportDef.title,
      code: reportDef.id,
      dateRange: `${fromDate} to ${toDate}`,
      generatedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      branch: branch,
      systemSource: `Vanguard ERP Live Engine [${reportDef.id}]`,
      pageNumber: 1,
      totalPages: 1,
    };
  }, [reportDef, fromDate, toDate, branch]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center gap-3 text-slate-500 shadow-sm mx-auto max-w-5xl">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="text-xs font-semibold text-slate-700">
          {t('loading_report_data', 'Querying live ERP database records...')}
        </span>
        <span className="text-[11px] text-slate-400 font-mono">
          {reportDef.id} • {reportDef.endpoint}
        </span>
      </div>
    );
  }

  const documentContent = (
    <MasterReportDocument
      key={reportDef.id}
      meta={meta}
      columns={columns}
      flatRows={data}
      grandTotal={grandTotal}
      orientation={reportDef.defaultOrientation || (columns.length >= 7 ? 'landscape' : 'auto')}
      className={className}
    />
  );

  if (hideToolbar) {
    return <div className="report-table-container w-full">{documentContent}</div>;
  }

  return (
    <UnifiedPrintableReportSheet
      reportTitle={reportDef.title}
      reportCode={reportDef.id}
      executionDate={meta.generatedDate}
      periodText={meta.dateRange}
      branchInfo={branch}
      onPrint={() => window.print()}
      orientation={reportDef.defaultOrientation === 'landscape' ? 'landscape' : 'portrait'}
    >
      {documentContent}
    </UnifiedPrintableReportSheet>
  );
}

export default DynamicReportView;
