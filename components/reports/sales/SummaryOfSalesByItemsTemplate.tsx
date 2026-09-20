'use client';

import React, { useMemo } from 'react';
import MasterReportDocument from '@/components/reports/MasterReportDocument';
import { ReportMetadata, ReportColumn, GrandTotal } from '@/types/reports';
import { applyGlobalReportFilters, resolveActiveCurrencyFromFilters, getDynamicCurrencyColumnHeader } from '@/lib/reportFilterEngine';
import { convertCurrency, formatCurrencyAmount } from '@/lib/currencyEngine';

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
}

const DEFAULT_SALES_ITEMS: (SalesItemRecord & { branch: string; category: string })[] = [
  { code: 'Fixed Offer', desc: 'Fixed Offer', bar: '62810012', id: '1289.0', qty: '24.00', price: '10,350,000.0', total: '248,400,000.00', branch: 'Main Branch (Choueifat Main Facility)', category: 'Promotions' },
  { code: 'RICEBM1KG', desc: 'Rice Basmati Rice Manas', bar: '52820019', id: '1062.0', qty: '3.50', price: '150,000.0', total: '525,000.00', branch: 'Main Branch (Choueifat Main Facility)', category: 'Grains & Pantry' },
  { code: 'P Blue Gallon 10', desc: 'P Blue Gallon 10 Liters', bar: '52820025', id: '1260.0', qty: '24.00', price: '0.0', total: '0.00', branch: 'Main Branch (Choueifat Main Facility)', category: 'Packaging' },
  { code: 'P Blue Gallon 20', desc: 'P Blue Gallon 20 Liters', bar: '52820026', id: '1259.0', qty: '46.00', price: '0.0', total: '0.00', branch: 'Main Branch (Choueifat Main Facility)', category: 'Packaging' },
  { code: 'Rice Standard 1Kg', desc: 'Rice Standard Product 1Kg', bar: '52820030', id: '661.0', qty: '2.00', price: '90,000.0', total: '180,000.00', branch: 'Main Branch (Choueifat Main Facility)', category: 'Grains & Pantry' },
  { code: 'Rice Basmati Al-Bustan', desc: 'Rice Basmati Al-Bustan 720g', bar: '52820031', id: '720.0', qty: '1.00', price: '120,000.0', total: '120,000.00', branch: 'Main Branch (Choueifat Main Facility)', category: 'Grains & Pantry' },
  { code: 'EVOO1000MLDE', desc: 'Tin Olive Oil Haseer Local 1000 ml', bar: '52820040', id: '1017.0', qty: '5.00', price: '990,000.0', total: '4,950,000.00', branch: 'Main Branch (Choueifat Main Facility)', category: 'Olive Oils' },
  { code: 'VOO17.5L16KGR', desc: 'Extra Virgin Olive Oil Tin 17.5L (16 Bulk Kg)', bar: '52820045', id: '11.0', qty: '45.00', price: '9,000,000.0', total: '405,000,000.00', branch: 'Main Branch (Choueifat Main Facility)', category: 'Olive Oils' },
  { code: 'Special Promo Offer', desc: 'Special Promo Offer - EVO Oil', bar: '52820050', id: '793.0', qty: '32.00', price: '9,000,000.0', total: '288,000,000.00', branch: 'Main Branch (Choueifat Main Facility)', category: 'Promotions' },
  { code: 'SEP1000GJAR510', desc: 'Jar Makdous 1000g', bar: '52820060', id: '24.0', qty: '1.00', price: '450,000.0', total: '450,000.00', branch: 'Main Branch (Choueifat Main Facility)', category: 'Preserves' },
  { code: 'SEP650GJAR509', desc: 'Jar Makdous 650g', bar: '52820061', id: '23.0', qty: '2.00', price: '270,000.0', total: '540,000.00', branch: 'Main Branch (Choueifat Main Facility)', category: 'Preserves' },
  { code: 'FVL350GJAR509', desc: 'Jar French Grape Leaves 350g', bar: '52820070', id: '33.0', qty: '2.00', price: '190,000.0', total: '380,000.00', branch: 'Main Branch (Choueifat Main Facility)', category: 'Preserves' },
  { code: 'Dried Mint Bulk Kg', desc: 'Dried Mint Bulk Kg', bar: '52820080', id: '393.0', qty: '1.01', price: '450,000.0', total: '454,500.00', branch: 'Main Branch (Choueifat Main Facility)', category: 'Herbs & Spices' },
];

/**
 * ============================================================================
 * SUMMARY OF SALES BY ITEMS TEMPLATE (REP_S_00251)
 * Enforces Vanguard ERP MasterReportDocument Accounting Standard
 * ============================================================================
 */
export const SummaryOfSalesByItemsTemplate: React.FC<SummaryOfSalesByItemsTemplateProps> = ({
  dynamicPeriodText,
  executionDate = '29-Aug-2026',
  branch = 'Main Branch (Choueifat Main Facility)',
  topN,
  filterValues = {},
}) => {
  const cleanPeriod = useMemo(() => {
    if (!dynamicPeriodText) return '01-Aug-2026 to 31-Aug-2026';
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
    let rows = applyGlobalReportFilters(DEFAULT_SALES_ITEMS, filterValues);
    if (topN && topN > 0) {
      rows = rows.slice(0, topN);
    }
    return rows;
  }, [filterValues, topN]);

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
    companyName: 'Zeit w zaytoun ljanoub',
    subtitle: 'Southern Olive Oil Products S.A.R.L - Item Sales Velocity & Margin Register',
    reportTitle: 'Summary of Sales by Items',
    code: 'REP_S_00251',
    dateRange: cleanPeriod,
    generatedDate: executionDate,
    branch: branch.startsWith('Branch:') ? branch : `Branch: ${branch}`,
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

