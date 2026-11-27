'use client';

import React, { useMemo } from 'react';
import MasterReportDocument from '@/components/reports/MasterReportDocument';
import { ReportMetadata, ReportColumn, GrandTotal } from '@/types/reports';
import { applyGlobalReportFilters, resolveActiveCurrencyFromFilters, getDynamicCurrencyColumnHeader } from '@/lib/reportFilterEngine';
import { convertCurrency, formatCurrencyAmount } from '@/lib/currencyEngine';
import { useLivePostedInvoices, aggregateItems, LiveInvoice } from '@/lib/liveSalesReportsData';

export interface SalesItemRecord {
  code: string;
  desc: string;
  bar: string;
  id: string;
  qty: string;
  price: string;
  total: string;
  branch?: string;
  category?: string;
}

export interface SummaryOfSalesByItemsTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  branch?: string;
  showRate?: boolean;
  groupByDate?: boolean;
  useUnitCost?: boolean;
  topN?: number;
  filterValues?: Record<string, any>;
  /** Posted invoices already filtered to the active period/branch. Falls back to all live posted invoices. */
  invoices?: LiveInvoice[];
}


/**
 * ============================================================================
 * SUMMARY OF SALES BY ITEMS TEMPLATE (REP_S_00251)
 * Enforces Vanguard ERP MasterReportDocument Accounting Standard
 * ============================================================================
 */
export const SummaryOfSalesByItemsTemplate: React.FC<SummaryOfSalesByItemsTemplateProps> = ({
  dynamicPeriodText,
  executionDate = '29-Aug-2026',
  branch = 'Southern Olive and Oil Products - Main',
  topN,
  filterValues = {},
  invoices,
}) => {
  const live = useLivePostedInvoices();
  const sourceInvoices = invoices ?? live.invoices;
  const liveItems = useMemo(
    () =>
      aggregateItems(sourceInvoices).map((r) => ({
        code: r.code,
        desc: r.name,
        bar: '',
        id: r.code,
        qty: r.qty.toFixed(2),
        price: convertCurrency(r.avgUnitUsd, 'USD', 'LBP').toFixed(2),
        total: convertCurrency(r.totalUsd, 'USD', 'LBP').toFixed(2),
        branch: branch,
        category: r.category,
      })),
    [sourceInvoices, branch]
  );

  const cleanPeriod = useMemo(() => {
    if (!dynamicPeriodText) return 'All posted invoices';
    return dynamicPeriodText
      .replace(/^Fiscal Cycle:\s*/i, '')
      .replace(/^Period:\s*/i, '')
      .replace(/^Date:\s*/i, '');
  }, [dynamicPeriodText]);

  const activeCurrency = useMemo(() => {
    return resolveActiveCurrencyFromFilters(filterValues, 'LBP');
  }, [filterValues]);

  // Dynamic filter summary
  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (filterValues.branch && filterValues.branch !== 'ALL') parts.push(`Branch: ${filterValues.branch}`);
    if (filterValues.workstation && filterValues.workstation !== 'ALL') parts.push(`WS: ${filterValues.workstation}`);
    if (filterValues.category && filterValues.category !== 'ALL') parts.push(`Category: ${filterValues.category}`);
    if (filterValues.currency && filterValues.currency !== 'ALL') parts.push(`Cur: ${filterValues.currency}`);
    if (filterValues.customerSearch || filterValues.searchQuery) parts.push(`Search: ${filterValues.customerSearch || filterValues.searchQuery}`);
    return parts.length > 0 ? parts.join(' | ') : undefined;
  }, [filterValues]);

  // Apply unified filter pipeline
  const filteredRows = useMemo(() => {
    let rows = applyGlobalReportFilters(liveItems, filterValues);
    if (topN && topN > 0) {
      rows = rows.slice(0, topN);
    }
    return rows;
  }, [liveItems, filterValues, topN]);

  // Dynamic totals calculation
  const { totalQty, totalLbp } = useMemo(() => {
    return filteredRows.reduce(
      (acc, r) => {
        const q = parseFloat(r.qty) || 0;
        const t = parseFloat(r.total.replace(/,/g, '')) || 0;
        return { totalQty: acc.totalQty + q, totalLbp: acc.totalLbp + t };
      },
      { totalQty: 0, totalLbp: 0 }
    );
  }, [filteredRows]);

  const meta: ReportMetadata = useMemo(() => ({
    companyName: 'Southern Olive Oil S.A.R.L.',
    subtitle: 'Item Sales Velocity & Margin Register',
    reportTitle: 'Summary of Sales by Items',
    code: 'REP_S_00251',
    dateRange: cleanPeriod,
    generatedDate: executionDate,
    branch: branch,
    filterSummary,
    systemSource: 'Vanguard ERP Commercial Inventory Kernel',
    pageNumber: 1,
    totalPages: 1,
  }), [cleanPeriod, executionDate, branch, filterSummary]);

  const columns: ReportColumn<SalesItemRecord>[] = useMemo(() => [
    {
      key: 'code',
      label: 'Product Code',
      align: 'left',
      width: '14%',
      isMonospace: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          {row.code}
        </span>
      ),
    },
    {
      key: 'desc',
      label: 'Description',
      align: 'left',
      width: '28%',
      render: (row) => (
        <span className="font-sans text-xs text-slate-800 font-medium">
          {row.desc}
        </span>
      ),
    },
    {
      key: 'bar',
      label: 'Barcode',
      align: 'left',
      width: '12%',
      isMonospace: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-500">
          {row.bar}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Product ID',
      align: 'left',
      width: '10%',
      isMonospace: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-500">
          {row.id}
        </span>
      ),
    },
    {
      key: 'qty',
      label: 'Qty Sold',
      align: 'right',
      width: '8%',
      isMonospace: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          {row.qty}
        </span>
      ),
    },
    {
      key: 'price',
      label: getDynamicCurrencyColumnHeader('Unit Price (L.L.)', activeCurrency),
      align: 'right',
      width: '13%',
      isMonospace: true,
      render: (row) => {
        const numPrice = parseFloat(row.price.replace(/,/g, '')) || 0;
        const converted = convertCurrency(numPrice, 'LBP', activeCurrency);
        return (
          <span className="font-mono text-xs text-slate-700 font-medium">
            {formatCurrencyAmount(converted, activeCurrency, false)}
          </span>
        );
      },
    },
    {
      key: 'total',
      label: getDynamicCurrencyColumnHeader('Total (L.L.)', activeCurrency),
      align: 'right',
      width: '15%',
      isMonospace: true,
      render: (row) => {
        const numTotal = parseFloat(row.total.replace(/,/g, '')) || 0;
        const converted = convertCurrency(numTotal, 'LBP', activeCurrency);
        return (
          <span className="font-mono text-xs font-bold text-slate-900">
            {formatCurrencyAmount(converted, activeCurrency, false)}
          </span>
        );
      },
    },
  ], [activeCurrency]);

  const grandTotal: GrandTotal = useMemo(() => {
    const convertedTotal = convertCurrency(totalLbp, 'LBP', activeCurrency);
    const usdEquiv = (totalLbp / 89500).toFixed(2);
    const primaryStr = formatCurrencyAmount(convertedTotal, activeCurrency, true);
    const secondaryLbpStr = `${totalLbp.toLocaleString('en-US', { minimumFractionDigits: 2 })} LBP`;

    return {
      label: `Total By Branch (${filteredRows.length} Items - ${totalQty.toFixed(2)} Units Sold):`,
      value: primaryStr,
      targetCurrency: activeCurrency,
      breakdownText: activeCurrency === 'USD'
        ? `USD: ${primaryStr}  |  LBP: ${secondaryLbpStr}`
        : `LBP: ${primaryStr}  |  USD: $${usdEquiv}`,
      convertedSubtext: `Normalized to ${activeCurrency} @ 89,500 LBP/USD`,
    };
  }, [filteredRows.length, totalQty, totalLbp, activeCurrency]);

  return (
    <div className="w-full space-y-4 font-sans">
      <MasterReportDocument
        meta={meta}
        columns={columns}
        flatRows={filteredRows}
        grandTotal={grandTotal}
      />
    </div>
  );
};

export default SummaryOfSalesByItemsTemplate;

