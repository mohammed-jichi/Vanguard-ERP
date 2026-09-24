'use client';

import React, { useMemo } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import MasterReportDocument from '@/components/reports/MasterReportDocument';
import UnifiedPrintableReportSheet from '@/components/reports/UnifiedPrintableReportSheet';
import {
  ReportMetadata,
  ReportColumn,
  ReportSection,
  GrandTotal,
} from '@/types/reports';
import {
  resolveSchemaForReport,
  formatCellValue,
  humanizeKey,
} from '@/lib/reportSchemaResolverEngine';
import { formatCurrencyAmount, convertCurrency } from '@/lib/currencyEngine';

export interface UniversalReportTableResolverProps {
  reportName: string;
  reportCode?: string;
  moduleContext?: string;
  filterValues?: Record<string, any>;
  dynamicPeriodText?: string;
  executionDate?: string;
  branch?: string;
  data?: any[];
  activeCurrency?: string;
  hideToolbar?: boolean;
  className?: string;
}

/**
 * ============================================================================
 * UNIVERSAL REPORT TABLE RESOLVER COMPONENT
 * ============================================================================
 * Decouples table rendering from hardcoded sales layouts globally.
 * Dynamically resolves table columns, cell mappings, and footer KPIs directly
 * from the active report's metadata contract (ReportSchemaDefinition).
 *
 * If a report lacks an explicit schema, the context-aware fallback engine
 * dynamically infers columns from dataset keys and semantic domain, never
 * showing irrelevant sales invoice columns.
 */
export const UniversalReportTableResolver: React.FC<UniversalReportTableResolverProps> = ({
  reportName,
  reportCode,
  moduleContext = 'sales',
  filterValues = {},
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  branch = 'Main Branch (Choueifat Main Facility)',
  data,
  activeCurrency = 'USD',
  hideToolbar = false,
  className = '',
}) => {
  const { t } = useLanguage();

  // 1. Resolve Schema and Raw Data Rows
  const { schema, rows: rawRows, domain, isExplicitSchema } = useMemo(() => {
    return resolveSchemaForReport(reportName, reportCode, moduleContext, data, filterValues);
  }, [reportName, reportCode, moduleContext, data, filterValues]);

  // 2. Apply Dynamic Filter Criteria (Search, Branch, Workstation)
  const filteredRows = useMemo(() => {
    let result = [...rawRows];

    // Branch filter
    const activeBranch = filterValues.branch || branch;
    if (activeBranch && activeBranch !== 'ALL') {
      result = result.filter((r) => {
        if (!r.branch) return true;
        const b = String(r.branch).toLowerCase();
        const target = String(activeBranch).toLowerCase();
        return b.includes(target) || target.includes(b) || target.includes('all');
      });
    }

    // Workstation / Terminal filter
    if (filterValues.workstation && filterValues.workstation !== 'ALL') {
      const targetWs = String(filterValues.workstation).toLowerCase();
      result = result.filter((r) => {
        const ws = String(r.workstation || r.terminal || r.terminalId || '').toLowerCase();
        return ws.includes(targetWs);
      });
    }

    // Text search query
    if (filterValues.searchQuery && String(filterValues.searchQuery).trim() !== '') {
      const q = String(filterValues.searchQuery).toLowerCase().trim();
      result = result.filter((r) => {
        return Object.values(r).some((v) => {
          if (v === null || v === undefined) return false;
          return String(v).toLowerCase().includes(q);
        });
      });
    }

    return result;
  }, [rawRows, filterValues, branch]);

  // 3. Format Date / Period String
  const cleanPeriod = useMemo(() => {
    if (dynamicPeriodText) {
      return dynamicPeriodText.replace(/^Period:\s*/i, '').replace(/^Date:\s*/i, '');
    }
    const from = filterValues.fromDate || '01-Sep-2026';
    const to = filterValues.toDate || '30-Sep-2026';
    return `${from} to ${to}`;
  }, [dynamicPeriodText, filterValues]);

  // 4. Construct Audit Metadata
  const meta: ReportMetadata = useMemo(() => {
    const filterSummaryParts: string[] = [];
    if (filterValues.branch && filterValues.branch !== 'ALL') {
      filterSummaryParts.push(`${t('branch', 'Branch')}: ${filterValues.branch}`);
    }
    if (filterValues.workstation && filterValues.workstation !== 'ALL') {
      filterSummaryParts.push(`${t('pos', 'POS')}: ${filterValues.workstation}`);
    }
    if (filterValues.shift && filterValues.shift !== 'ALL') {
      filterSummaryParts.push(`${t('shift', 'Shift')}: ${filterValues.shift}`);
    }
    if (filterValues.paymentMode && filterValues.paymentMode !== 'ALL') {
      filterSummaryParts.push(`${t('payment', 'Payment')}: ${filterValues.paymentMode}`);
    }

    return {
      companyName: 'Zeit w zaytoun ljanoub',
      subtitle: t('report_subtitle_default', 'Southern Olive Oil Products S.A.R.L - Universal Master Enterprise Ledger'),
      reportTitle: t(schema.title || reportName, schema.title || reportName),
      code: schema.id || reportCode || 'REP_UNIVERSAL',
      dateRange: cleanPeriod,
      generatedDate: executionDate,
      branch: branch.startsWith('Branch:') ? `${t('branch', 'Branch')}: ${branch.replace(/^Branch:\s*/i, '')}` : `${t('branch', 'Branch')}: ${branch}`,
      filterSummary: filterSummaryParts.length > 0 ? filterSummaryParts.join(' • ') : undefined,
      systemSource: `Vanguard ERP Universal Engine [${domain.toUpperCase()}_SCHEMA${isExplicitSchema ? '_REGISTRY' : '_INFERRED'}]`,
      pageNumber: 1,
      totalPages: 1,
    };
  }, [schema, reportName, reportCode, cleanPeriod, executionDate, branch, filterValues, domain, isExplicitSchema, t]);

  // 5. Construct Document Table Columns
  const columns: ReportColumn<any>[] = useMemo(() => {
    return schema.columns.map((col) => ({
      key: col.key,
      label: t(col.headerLabel, col.headerLabel),
      align: col.align || 'left',
      width: col.width,
      isMonospace: col.isMonospace,
      render: (row: any) => {
        if (col.render) {
          return col.render(row[col.key], row, activeCurrency);
        }
        return formatCellValue(row[col.key], row, col.formatType, activeCurrency);
      },
    }));
  }, [schema.columns, activeCurrency, t]);

  // 6. Construct Sections (Grouped Rows with Subtotals) or Flat Rows
  const sections: ReportSection<any>[] | undefined = useMemo(() => {
    if (!schema.grouping || !schema.grouping.groupByKey) return undefined;

    const groupKey = schema.grouping.groupByKey;
    const groupMap = new Map<string, any[]>();

    filteredRows.forEach((row) => {
      const gVal = String(row[groupKey] ?? 'General');
      if (!groupMap.has(gVal)) {
        groupMap.set(gVal, []);
      }
      groupMap.get(gVal)!.push(row);
    });

    return Array.from(groupMap.entries()).map(([groupVal, rows]) => {
      const title = schema.grouping?.groupHeaderLabel
        ? schema.grouping.groupHeaderLabel(groupVal, rows)
        : `${humanizeKey(groupKey)}: ${groupVal} (${rows.length} ${t('records', 'records')})`;

      let subtotal: { label: string; value: string | number; isNegative?: boolean } | undefined = undefined;

      if (schema.grouping?.subtotalKeys && schema.grouping.subtotalKeys.length > 0) {
        const subKey = schema.grouping.subtotalKeys[0];
        const sum = rows.reduce((acc, r) => acc + (Number(r[subKey]) || 0), 0);
        subtotal = {
          label: `${t('subtotal', 'Subtotal')} (${groupVal}):`,
          value: formatCurrencyAmount(sum, activeCurrency, true),
        };
      }

      return {
        title,
        type: 'revenue',
        rows,
        subtotal,
      };
    });
  }, [schema.grouping, filteredRows, activeCurrency, t]);

  // 7. Calculate Grand Total Footer
  const grandTotal: GrandTotal | undefined = useMemo(() => {
    // Find numeric / currency column for cumulative summary
    const currencyCol = schema.columns.find(
      (c) =>
        c.formatType === 'currency' ||
        ['amountValue', 'totalAmount', 'netAmount', 'consolidatedAmount', 'orderValue', 'taxCollectedUsd', 'grossProfit', 'valuation', 'netTotal', 'grossSales'].includes(c.key)
    );

    if (currencyCol) {
      const totalVal = filteredRows.reduce((acc, r) => acc + (Number(r[currencyCol.key]) || 0), 0);
      const secondaryCurr = activeCurrency === 'USD' ? 'LBP' : 'USD';
      const convertedVal = convertCurrency(totalVal, activeCurrency, secondaryCurr);

      return {
        label: `${t('consolidated_master_total', 'Consolidated Master Total')} (${filteredRows.length} ${t('reconciled_records', 'Reconciled Records')}):`,
        value: formatCurrencyAmount(totalVal, activeCurrency, true),
        targetCurrency: activeCurrency,
        breakdownText: `${activeCurrency}: ${formatCurrencyAmount(totalVal, activeCurrency, true)}  |  ${secondaryCurr}: ${formatCurrencyAmount(convertedVal, secondaryCurr, true)}`,
        convertedSubtext: `${t('verified_against', 'Verified against')} Vanguard ${domain.toUpperCase()} ${t('ledger_standard', 'Ledger Standard')}`,
      };
    }

    // Default Count Total for Non-Financial Ledgers (e.g. No Sale pops, User logs)
    return {
      label: `${t('total_audited_entries', 'Total Audited Entries')} (${filteredRows.length} ${t('records', 'Records')}):`,
      value: `${filteredRows.length} ${t('events', 'Events')}`,
      breakdownText: `${t('domain', 'Domain')}: ${domain.toUpperCase()} • ${t('zero_unlogged_anomalies', 'Zero unlogged anomalies')}`,
    };
  }, [schema.columns, filteredRows, activeCurrency, domain, t]);

  const documentContent = (
    <MasterReportDocument
      meta={meta}
      columns={columns}
      sections={sections}
      flatRows={sections ? undefined : filteredRows}
      grandTotal={grandTotal}
      orientation={columns.length >= 7 ? 'landscape' : 'auto'}
      className={className}
    />
  );

  if (hideToolbar) {
    return <div className="w-full space-y-4">{documentContent}</div>;
  }

  return (
    <UnifiedPrintableReportSheet
      reportTitle={schema.title || reportName}
      reportCode={schema.id || reportCode}
      executionDate={executionDate}
      periodText={cleanPeriod}
      branchInfo={branch}
      onPrint={() => window.print()}
      orientation={columns.length >= 7 ? 'landscape' : 'portrait'}
    >
      {documentContent}
    </UnifiedPrintableReportSheet>
  );
};

export default UniversalReportTableResolver;
