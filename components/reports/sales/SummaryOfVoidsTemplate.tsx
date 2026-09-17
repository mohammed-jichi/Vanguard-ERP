'use client';

import React, { useMemo } from 'react';
import MasterReportDocument from '@/components/reports/MasterReportDocument';
import { ReportMetadata, ReportColumn, GrandTotal } from '@/types/reports';
import { applyGlobalReportFilters } from '@/lib/reportFilterEngine';

export interface VoidRecord {
  id: string;
  date: string;
  orderDate: string;
  server: string;
  invoice: string;
  description: string;
  qty: number;
  valueLbp: number;
  reason: string;
  authorizer: string;
  branch: string;
  payment_method: string;
  channel: string;
}

export interface SummaryOfVoidsTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  branch?: string;
  fromDate?: string;
  toDate?: string;
  filterValues?: Record<string, any>;
}

const VOID_RECORDS: VoidRecord[] = [
  {
    id: '1',
    date: '22-Aug-2026 5:31 PM',
    orderDate: '2026-08-22',
    server: 'Hiba Aloulou',
    invoice: '103225',
    description: 'Special Promo - Extra Virgin Olive Oil 17.5L',
    qty: 1.0,
    valueLbp: 9000000.0,
    reason: 'Count Error',
    authorizer: 'Ziad Chehab (Mgr)',
    branch: 'Main Branch (Choueifat Main Facility)',
    payment_method: 'CASH',
    channel: 'POS',
  },
  {
    id: '2',
    date: '13-Aug-2026 6:58 PM',
    orderDate: '2026-08-13',
    server: 'Hiba Aloulou',
    invoice: '103125',
    description: 'Local Olive Oil 1000ml Bottle',
    qty: 1.0,
    valueLbp: 990000.0,
    reason: 'Count Error',
    authorizer: 'Rania Eid (Sup)',
    branch: 'Main Branch (Choueifat Main Facility)',
    payment_method: 'CARD',
    channel: 'POS',
  },
  {
    id: '3',
    date: '13-Aug-2026 6:58 PM',
    orderDate: '2026-08-13',
    server: 'Hiba Aloulou',
    invoice: '103125',
    description: 'Local Bee Pollen 360g',
    qty: 1.0,
    valueLbp: 900000.0,
    reason: 'Count Error',
    authorizer: 'Rania Eid (Sup)',
    branch: 'Main Branch (Choueifat Main Facility)',
    payment_method: 'WHISH',
    channel: 'Local',
  },
  {
    id: '4',
    date: '15-Aug-2026 2:10 PM',
    orderDate: '2026-08-15',
    server: 'Ahmad K.',
    invoice: '103140',
    description: 'Pressed Green Olives 1 Kg',
    qty: 1.0,
    valueLbp: 450000.0,
    reason: 'Item Exchange',
    authorizer: 'Ahmad Al-Hajj (Lead)',
    branch: 'Main Branch (Choueifat Main Facility)',
    payment_method: 'CASH',
    channel: 'POS',
  },
  {
    id: '5',
    date: '14-Aug-2026 11:20 AM',
    orderDate: '2026-08-14',
    server: 'Samer R.',
    invoice: '103110',
    description: 'Apple Cider Vinegar 5L',
    qty: 2.0,
    valueLbp: 2722500.0,
    reason: 'Barcode Error',
    authorizer: 'Ziad Chehab (Mgr)',
    branch: 'Beirut Depot',
    payment_method: 'CARD',
    channel: 'Online',
  },
  {
    id: '6',
    date: '16-Aug-2026 3:45 PM',
    orderDate: '2026-08-16',
    server: 'Nour M.',
    invoice: '103165',
    description: 'Dry Oregano Jar 200g',
    qty: 1.0,
    valueLbp: 320000.0,
    reason: 'Customer Request',
    authorizer: 'Rania Eid (Sup)',
    branch: 'Beirut Depot',
    payment_method: 'WHISH',
    channel: 'POS',
  },
  {
    id: '7',
    date: '19-Aug-2026 1:15 PM',
    orderDate: '2026-08-19',
    server: 'Ahmad K.',
    invoice: '103198',
    description: 'Pomegranate Molasses 500ml',
    qty: 3.0,
    valueLbp: 780000.0,
    reason: 'Manager Discretion',
    authorizer: 'Ziad Chehab (Mgr)',
    branch: 'Sidon Hub',
    payment_method: 'STORE CREDIT',
    channel: 'Wholesale',
  },
  {
    id: '8',
    date: '21-Aug-2026 4:30 PM',
    orderDate: '2026-08-21',
    server: 'Samer R.',
    invoice: '103212',
    description: 'Garlic Stuffed Green Olives 500g',
    qty: 2.0,
    valueLbp: 560000.0,
    reason: 'Pricing Error',
    authorizer: 'Ahmad Al-Hajj (Lead)',
    branch: 'Sidon Hub',
    payment_method: 'CASH',
    channel: 'Local',
  },
];


/**
 * ============================================================================
 * SUMMARY OF VOIDS REPORT TEMPLATE (REP_S_00184 / REP_SALES_003)
 * Enforces Vanguard ERP MasterReportDocument Accounting Standard
 * ============================================================================
 */
export const SummaryOfVoidsTemplate: React.FC<SummaryOfVoidsTemplateProps> = ({
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  branch = 'Main Branch (Choueifat Main Facility)',
  fromDate = '01-Aug-2026',
  toDate = '27-Aug-2026',
  filterValues = {},
}) => {
  const cleanPeriod = useMemo(() => {
    if (dynamicPeriodText) {
      return dynamicPeriodText
        .replace(/^Audit Window:\s*/i, '')
        .replace(/^Period:\s*/i, '')
        .replace(/^Date:\s*/i, '');
    }
    return `${fromDate} to ${toDate}`;
  }, [dynamicPeriodText, fromDate, toDate]);

  // Dynamic filter summary
  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (filterValues.serverCashier && filterValues.serverCashier !== 'ALL') parts.push(`Cashier: ${filterValues.serverCashier}`);
    if (filterValues.voidReason && filterValues.voidReason !== 'ALL') parts.push(`Reason: ${filterValues.voidReason}`);
    if (filterValues.supervisor && filterValues.supervisor !== 'ALL') parts.push(`Supervisor: ${filterValues.supervisor}`);
    if (filterValues.paymentType && filterValues.paymentType !== 'ALL') parts.push(`Tender: ${filterValues.paymentType}`);
    if (filterValues.channel && filterValues.channel !== 'ALL') parts.push(`Channel: ${filterValues.channel}`);
    return parts.length > 0 ? parts.join(' | ') : undefined;
  }, [filterValues]);

  // Wire unified filter engine
  const filteredRows = useMemo(() => {
    return applyGlobalReportFilters(VOID_RECORDS, filterValues);
  }, [filterValues]);

  // Compute dynamic totals based on visible filtered rows
  const { totalQty, totalVal } = useMemo(() => {
    return filteredRows.reduce(
      (acc, r) => ({
        totalQty: acc.totalQty + r.qty,
        totalVal: acc.totalVal + r.valueLbp,
      }),
      { totalQty: 0, totalVal: 0 }
    );
  }, [filteredRows]);

  const meta: ReportMetadata = useMemo(() => ({
    companyName: 'Zeit w zaytoun ljanoub',
    subtitle: 'Southern Olive Oil Products S.A.R.L - Cashier Void & Transaction Cancellation Audit',
    reportTitle: 'Summary of Voids',
    code: 'REP_S_00184',
    dateRange: cleanPeriod,
    generatedDate: executionDate,
    branch: branch.startsWith('Branch:') ? branch : `Branch: ${branch}`,
    filterSummary,
    systemSource: 'Vanguard ERP Fiscal Security Kernel',
    pageNumber: 1,
    totalPages: 1,
  }), [cleanPeriod, executionDate, branch, filterSummary]);

  const columns: ReportColumn<VoidRecord>[] = useMemo(() => [
    {
      key: 'date',
      label: 'Date & Time',
      align: 'left',
      width: '14%',
      isMonospace: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-700">
          {row.date}
        </span>
      ),
    },
    {
      key: 'server',
      label: 'Cashier / Server',
      align: 'left',
      width: '12%',
      render: (row) => (
        <span className="font-sans text-xs text-slate-800 font-medium">
          {row.server}
        </span>
      ),
    },
    {
      key: 'invoice',
      label: 'Invoice #',
      align: 'center',
      width: '10%',
      isMonospace: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          #{row.invoice}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      align: 'left',
      width: '22%',
      render: (row) => (
        <span className="font-sans text-xs text-slate-800">
          {row.description}
        </span>
      ),
    },
    {
      key: 'qty',
      label: 'Qty',
      align: 'center',
      width: '7%',
      isMonospace: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          {row.qty.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'reason',
      label: 'Void Reason',
      align: 'left',
      width: '11%',
      render: (row) => (
        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          {row.reason}
        </span>
      ),
    },
    {
      key: 'authorizer',
      label: 'Auth / Manager',
      align: 'left',
      width: '12%',
      render: (row) => (
        <span className="font-sans text-[11px] font-semibold text-slate-700">
          {row.authorizer}
        </span>
      ),
    },
    {
      key: 'valueLbp',
      label: 'Value (LBP)',
      align: 'right',
      width: '12%',
      isMonospace: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-red-700">
          {row.valueLbp.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
  ], []);

  const grandTotal: GrandTotal = useMemo(() => {
    const usdEquiv = (totalVal / 89500).toFixed(2);
    return {
      label: `Total Voids (${filteredRows.length} Transactions - ${totalQty.toFixed(2)} Units Voided):`,
      value: `${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2 })} LBP ($${usdEquiv})`,
      isNegative: true,
    };
  }, [filteredRows.length, totalQty, totalVal]);

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

export default SummaryOfVoidsTemplate;

