'use client';

import React, { useMemo } from 'react';
import MasterReportDocument from '@/components/reports/MasterReportDocument';
import { ReportMetadata, ReportColumn, GrandTotal } from '@/types/reports';

export interface SalesItemRecord {
  code: string;
  desc: string;
  bar: string;
  id: string;
  qty: string;
  price: string;
  total: string;
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
}

const DEFAULT_SALES_ITEMS: SalesItemRecord[] = [
  { code: 'Fixed Offer', desc: 'Fixed Offer', bar: '62810012', id: '1289.0', qty: '24.00', price: '10,350,000.0', total: '248,400,000.00' },
  { code: 'RICEBM1KG', desc: 'Rice Basmati Rice Manas', bar: '52820019', id: '1062.0', qty: '3.50', price: '150,000.0', total: '525,000.00' },
  { code: 'P Blue Gallon 10', desc: 'P Blue Gallon 10 Liters', bar: '52820025', id: '1260.0', qty: '24.00', price: '0.0', total: '0.00' },
  { code: 'P Blue Gallon 20', desc: 'P Blue Gallon 20 Liters', bar: '52820026', id: '1259.0', qty: '46.00', price: '0.0', total: '0.00' },
  { code: 'Rice Standard 1Kg', desc: 'Rice Standard Product 1Kg', bar: '52820030', id: '661.0', qty: '2.00', price: '90,000.0', total: '180,000.00' },
  { code: 'Rice Basmati Al-Bustan', desc: 'Rice Basmati Al-Bustan 720g', bar: '52820031', id: '720.0', qty: '1.00', price: '120,000.0', total: '120,000.00' },
  { code: 'EVOO1000MLDE', desc: 'Tin Olive Oil Haseer Local 1000 ml', bar: '52820040', id: '1017.0', qty: '5.00', price: '990,000.0', total: '4,950,000.00' },
  { code: 'VOO17.5L16KGR', desc: 'Extra Virgin Olive Oil Tin 17.5L (16 Bulk Kg)', bar: '52820045', id: '11.0', qty: '45.00', price: '9,000,000.0', total: '405,000,000.00' },
  { code: 'Special Promo Offer', desc: 'Special Promo Offer - EVO Oil', bar: '52820050', id: '793.0', qty: '32.00', price: '9,000,000.0', total: '288,000,000.00' },
  { code: 'SEP1000GJAR510', desc: 'Jar Makdous 1000g', bar: '52820060', id: '24.0', qty: '1.00', price: '450,000.0', total: '450,000.00' },
  { code: 'SEP650GJAR509', desc: 'Jar Makdous 650g', bar: '52820061', id: '23.0', qty: '2.00', price: '270,000.0', total: '540,000.00' },
  { code: 'FVL350GJAR509', desc: 'Jar French Grape Leaves 350g', bar: '52820070', id: '33.0', qty: '2.00', price: '190,000.0', total: '380,000.00' },
  { code: 'Dried Mint Bulk Kg', desc: 'Dried Mint Bulk Kg', bar: '52820080', id: '393.0', qty: '1.01', price: '450,000.0', total: '454,500.00' },
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
}) => {
  const cleanPeriod = useMemo(() => {
    if (!dynamicPeriodText) return '01-Aug-2026 to 31-Aug-2026';
    return dynamicPeriodText
      .replace(/^Fiscal Cycle:\s*/i, '')
      .replace(/^Period:\s*/i, '')
      .replace(/^Date:\s*/i, '');
  }, [dynamicPeriodText]);

  const meta: ReportMetadata = useMemo(() => ({
    companyName: 'Zeit w zaytoun ljanoub',
    subtitle: 'Southern Olive Oil Products S.A.R.L - Item Sales Velocity & Margin Register',
    reportTitle: 'Summary of Sales by Items',
    code: 'REP_S_00251',
    dateRange: cleanPeriod,
    generatedDate: executionDate,
    branch: branch.startsWith('Branch:') ? branch : `Branch: ${branch}`,
    systemSource: 'Vanguard ERP Commercial Inventory Kernel',
    pageNumber: 1,
    totalPages: 1,
  }), [cleanPeriod, executionDate, branch]);

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
      label: 'Unit Price (L.L.)',
      align: 'right',
      width: '13%',
      isMonospace: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-700 font-medium">
          {row.price}
        </span>
      ),
    },
    {
      key: 'total',
      label: 'Total (L.L.)',
      align: 'right',
      width: '15%',
      isMonospace: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          {row.total}
        </span>
      ),
    },
  ], []);

  const grandTotal: GrandTotal = useMemo(() => ({
    label: 'Total By Branch (13 Items - 186.51 Units Sold):',
    value: '948,974,500.00 LBP ($10,603.07)',
  }), []);

  return (
    <div className="w-full space-y-4 font-sans">
      <MasterReportDocument
        meta={meta}
        columns={columns}
        flatRows={DEFAULT_SALES_ITEMS}
        grandTotal={grandTotal}
      />
    </div>
  );
};

export default SummaryOfSalesByItemsTemplate;
