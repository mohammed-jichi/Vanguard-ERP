'use client';

import React, { useMemo } from 'react';
import MasterReportDocument from '@/components/reports/MasterReportDocument';
import { ReportMetadata, ReportColumn, GrandTotal } from '@/types/reports';
import { applyGlobalReportFilters, resolveActiveCurrencyFromFilters, getDynamicCurrencyColumnHeader } from '@/lib/reportFilterEngine';
import { convertCurrency, formatCurrencyAmount } from '@/lib/currencyEngine';

export interface RefundRecord {
  branch: string;
  eodDate: string;
  date: string;
  invoiceNumber: string;
  customer: string;
  qty: string;
  description: string;
  tender: string;
  payment_method: string;
  channel: string;
  reason: string;
  subTotal: string;
  discount: string;
  tax: string;
  grandTotal: string;
}

export interface SummaryOfRefundsTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  branch?: string;
  fromDate?: string;
  toDate?: string;
  reportTitle?: string;
  filterValues?: Record<string, any>;
}

const DEFAULT_REFUNDS: RefundRecord[] = [
  {
    branch: 'Main Branch (Choueifat Main Facility)',
    eodDate: '11-08-2026',
    date: '2026-08-11',
    invoiceNumber: '103098',
    customer: 'Direct Retail Customer',
    qty: '-0.90',
    description: 'Fine Coriander Bulk Kg',
    tender: 'CASH',
    payment_method: 'CASH',
    channel: 'POS',
    reason: 'Wrong Item Scanned',
    subTotal: '-630,000.00',
    discount: '0.00',
    tax: '0.00',
    grandTotal: '-630,000.00',
  },
  {
    branch: 'Main Branch (Choueifat Main Facility)',
    eodDate: '14-08-2026',
    date: '2026-08-14',
    invoiceNumber: '103142',
    customer: 'Al-Hajj Grocery S.A.R.L',
    qty: '-1.00',
    description: 'Extra Virgin Olive Oil 1L (Bottle Seal Defect)',
    tender: 'STORE CREDIT',
    payment_method: 'STORE CREDIT',
    channel: 'Local',
    reason: 'Packaging Defect',
    subTotal: '-360,000.00',
    discount: '0.00',
    tax: '0.00',
    grandTotal: '-360,000.00',
  },
  {
    branch: 'Beirut Depot',
    eodDate: '18-08-2026',
    date: '2026-08-18',
    invoiceNumber: '103189',
    customer: 'Cedars Gourmet Market',
    qty: '-2.00',
    description: 'Pomegranate Molasses 500ml',
    tender: 'WHISH PAY',
    payment_method: 'WHISH',
    channel: 'Online',
    reason: 'Quality Dissatisfaction',
    subTotal: '-520,000.00',
    discount: '0.00',
    tax: '0.00',
    grandTotal: '-520,000.00',
  },
  {
    branch: 'Main Branch (Choueifat Main Facility)',
    eodDate: '20-08-2026',
    date: '2026-08-20',
    invoiceNumber: '103215',
    customer: 'Mina Delicacies S.A.L',
    qty: '-1.50',
    description: 'Pressed Green Olives 1.5Kg Vacuum Pack',
    tender: 'CARD',
    payment_method: 'CARD',
    channel: 'POS',
    reason: 'Customer Return',
    subTotal: '-480,000.00',
    discount: '0.00',
    tax: '0.00',
    grandTotal: '-480,000.00',
  },
  {
    branch: 'Sidon Hub',
    eodDate: '22-08-2026',
    date: '2026-08-22',
    invoiceNumber: '103248',
    customer: 'South Wholesale Traders Co.',
    qty: '-5.00',
    description: 'Crushed Chilli Seasoning 250g Jar',
    tender: 'CASH',
    payment_method: 'CASH',
    channel: 'Local',
    reason: 'Damaged Goods',
    subTotal: '-750,000.00',
    discount: '0.00',
    tax: '0.00',
    grandTotal: '-750,000.00',
  },
  {
    branch: 'Beirut Depot',
    eodDate: '25-08-2026',
    date: '2026-08-25',
    invoiceNumber: '103280',
    customer: 'Verdun Bistro & Kitchen',
    qty: '-3.00',
    description: 'Traditional Apple Vinegar 1L Glass Bottle',
    tender: 'STORE CREDIT',
    payment_method: 'STORE CREDIT',
    channel: 'Wholesale',
    reason: 'Expired Stock',
    subTotal: '-810,000.00',
    discount: '0.00',
    tax: '0.00',
    grandTotal: '-810,000.00',
  },
  {
    branch: 'Main Branch (Choueifat Main Facility)',
    eodDate: '26-08-2026',
    date: '2026-08-26',
    invoiceNumber: '103295',
    customer: 'Online Store Customer #8412',
    qty: '-1.00',
    description: 'Organic Wild Honey 500g Jar',
    tender: 'WHISH PAY',
    payment_method: 'WHISH',
    channel: 'Online',
    reason: 'Wrong Item Scanned',
    subTotal: '-950,000.00',
    discount: '0.00',
    tax: '0.00',
    grandTotal: '-950,000.00',
  },
  {
    branch: 'Sidon Hub',
    eodDate: '27-08-2026',
    date: '2026-08-27',
    invoiceNumber: '103310',
    customer: 'Al-Bahr Beach Resort',
    qty: '-2.00',
    description: 'Extra Virgin Olive Oil 5L Tin Can',
    tender: 'CARD',
    payment_method: 'CARD',
    channel: 'POS',
    reason: 'Quality Dissatisfaction',
    subTotal: '-2,400,000.00',
    discount: '0.00',
    tax: '0.00',
    grandTotal: '-2,400,000.00',
  },
];


/**
 * ============================================================================
 * SUMMARY / DETAILS OF REFUNDS TEMPLATE (REP_S_00185 / REP_S_00274)
 * Enforces Vanguard ERP MasterReportDocument Accounting Standard
 * ============================================================================
 */
export const SummaryOfRefundsTemplate: React.FC<SummaryOfRefundsTemplateProps> = ({
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  branch = 'Main Branch (Choueifat Main Facility)',
  fromDate = '01-Aug-2026',
  toDate = '27-Aug-2026',
  reportTitle = 'Summary of refunds',
  filterValues = {},
}) => {
  const isDetails = reportTitle.toLowerCase().includes('detail');

  const cleanPeriod = useMemo(() => {
    if (dynamicPeriodText) {
      return dynamicPeriodText
        .replace(/^Reimbursement Window:\s*/i, '')
        .replace(/^Period:\s*/i, '')
        .replace(/^Date:\s*/i, '');
    }
    return `${fromDate} to ${toDate}`;
  }, [dynamicPeriodText, fromDate, toDate]);

  const activeCurrency = useMemo(() => {
    return resolveActiveCurrencyFromFilters(filterValues, 'LBP');
  }, [filterValues]);

  // Dynamic filter summary
  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (filterValues.branch && filterValues.branch !== 'ALL') parts.push(`Branch: ${filterValues.branch}`);
    if (filterValues.workstation && filterValues.workstation !== 'ALL') parts.push(`WS: ${filterValues.workstation}`);
    if (filterValues.paymentType && filterValues.paymentType !== 'ALL') parts.push(`Tender: ${filterValues.paymentType}`);
    if (filterValues.refundReason && filterValues.refundReason !== 'ALL') parts.push(`Reason: ${filterValues.refundReason}`);
    if (filterValues.supervisor && filterValues.supervisor !== 'ALL') parts.push(`Supervisor: ${filterValues.supervisor}`);
    if (filterValues.channel && filterValues.channel !== 'ALL') parts.push(`Channel: ${filterValues.channel}`);
    if (filterValues.customerSearch) parts.push(`Customer: ${filterValues.customerSearch}`);
    if (filterValues.currency && filterValues.currency !== 'ALL') parts.push(`Cur: ${filterValues.currency}`);
    return parts.length > 0 ? parts.join(' | ') : undefined;
  }, [filterValues]);

  // Wire unified filter engine
  const filteredRefunds = useMemo(() => {
    return applyGlobalReportFilters(DEFAULT_REFUNDS, filterValues);
  }, [filterValues]);

  // Dynamically calculate total refund amount
  const totalLbpNum = useMemo(() => {
    return filteredRefunds.reduce((sum, r) => {
      const val = parseFloat(r.grandTotal.replace(/[^0-9.-]+/g, ''));
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [filteredRefunds]);

  const meta: ReportMetadata = useMemo(() => ({
    companyName: 'Zeit w zaytoun ljanoub',
    subtitle: isDetails
      ? 'Southern Olive Oil Products S.A.R.L - Granular Customer Refund & Credit Notes Audit'
      : 'Southern Olive Oil Products S.A.R.L - Reimbursed Returns & Credit Notes Register',
    reportTitle: isDetails ? 'Details of Refunds' : 'Summary of Refunds',
    code: isDetails ? 'REP_S_00274' : 'REP_S_00185',
    dateRange: cleanPeriod,
    generatedDate: executionDate,
    branch: branch.startsWith('Branch:') ? branch : `Branch: ${branch}`,
    filterSummary,
    systemSource: 'Vanguard ERP Fiscal Reimbursement & AR Subsystem',
    pageNumber: 1,
    totalPages: 1,
  }), [isDetails, cleanPeriod, executionDate, branch, filterSummary]);

  const columns: ReportColumn<RefundRecord>[] = useMemo(() => [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      align: 'center',
      width: '11%',
      isMonospace: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          #{row.invoiceNumber}
        </span>
      ),
    },
    {
      key: 'eodDate',
      label: 'EOD Date',
      align: 'left',
      width: '11%',
      isMonospace: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-600">
          {row.eodDate}
        </span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer Account',
      align: 'left',
      width: '18%',
      render: (row) => (
        <span className="font-sans text-xs text-slate-900 font-medium">
          {row.customer}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Returned Product Description',
      align: 'left',
      width: '24%',
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
        <span className="font-mono text-xs font-bold text-red-700">
          {row.qty}
        </span>
      ),
    },
    {
      key: 'tender',
      label: 'Tender',
      align: 'center',
      width: '11%',
      render: (row) => (
        <span className="inline-block px-1.5 py-0.5 rounded text-[10.5px] font-semibold bg-slate-100 text-slate-800 border border-slate-300">
          {row.tender}
        </span>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      align: 'left',
      width: '14%',
      render: (row) => (
        <span className="inline-block px-2 py-0.5 rounded text-[10.5px] font-medium bg-red-50 text-red-800 border border-red-200">
          {row.reason}
        </span>
      ),
    },
    {
      key: 'grandTotal',
      label: getDynamicCurrencyColumnHeader('Refund Total (LBP)', activeCurrency),
      align: 'right',
      width: '14%',
      isMonospace: true,
      render: (row) => {
        const valLbp = parseFloat(row.grandTotal.replace(/[^0-9.-]+/g, '')) || 0;
        const converted = convertCurrency(valLbp, 'LBP', activeCurrency);
        return (
          <span className="font-mono text-xs font-bold text-red-700">
            {formatCurrencyAmount(converted, activeCurrency, false)}
          </span>
        );
      },
    },
  ], [activeCurrency]);

  const grandTotal: GrandTotal = useMemo(() => {
    const convertedTotal = convertCurrency(totalLbpNum, 'LBP', activeCurrency);
    const usdEquiv = (Math.abs(totalLbpNum) / 89500).toFixed(2);
    const primaryStr = formatCurrencyAmount(convertedTotal, activeCurrency, true);
    const secondaryLbpStr = `${totalLbpNum.toLocaleString('en-US', { minimumFractionDigits: 2 })} LBP`;

    return {
      label: `Net Refund Total (${filteredRefunds.length} Customer Credit Notes Issued):`,
      value: primaryStr,
      isNegative: true,
      targetCurrency: activeCurrency,
      breakdownText: activeCurrency === 'USD'
        ? `USD: ${primaryStr}  |  LBP: ${secondaryLbpStr}`
        : `LBP: ${primaryStr}  |  USD: -$${usdEquiv}`,
      convertedSubtext: `Normalized to ${activeCurrency} @ 89,500 LBP/USD`,
    };
  }, [filteredRefunds.length, totalLbpNum, activeCurrency]);

  return (
    <div className="w-full space-y-4 font-sans">
      <MasterReportDocument
        meta={meta}
        columns={columns}
        flatRows={filteredRefunds}
        grandTotal={grandTotal}
      />
    </div>
  );
};

export default SummaryOfRefundsTemplate;

