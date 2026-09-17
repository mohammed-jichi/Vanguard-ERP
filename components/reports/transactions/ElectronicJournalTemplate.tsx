'use client';

import React, { useMemo } from 'react';
import MasterReportDocument from '@/components/reports/MasterReportDocument';
import { ReportMetadata, ReportColumn, GrandTotal } from '@/types/reports';
import { applyGlobalReportFilters } from '@/lib/reportFilterEngine';

export interface ElectronicJournalRecord {
  time: string;
  date: string;
  eventType: string;
  operator: string;
  terminal: string;
  ref: string;
  details: string;
  amount: string;
  branch: string;
  payment_method: string;
  channel: string;
}

export interface ElectronicJournalTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  branch?: string;
  filterValues?: Record<string, any>;
}

const DEFAULT_JOURNAL_DATA: ElectronicJournalRecord[] = [
  {
    time: '08:00:12 AM',
    date: '2026-08-11',
    eventType: 'SYSTEM',
    operator: 'Mohammed',
    terminal: 'POS-01',
    ref: 'SYS-IN',
    details: 'Operator Login Successful',
    amount: '-',
    branch: 'Main Branch (Choueifat Main Facility)',
    payment_method: 'CASH',
    channel: 'POS',
  },
  {
    time: '08:05:00 AM',
    date: '2026-08-11',
    eventType: 'CASH MANAGEMENT',
    operator: 'Mohammed',
    terminal: 'POS-01',
    ref: 'FLOAT',
    details: 'Starting Cash Float Declared: 5,000,000 LBP',
    amount: '5,000,000',
    branch: 'Main Branch (Choueifat Main Facility)',
    payment_method: 'CASH',
    channel: 'POS',
  },
  {
    time: '09:15:33 AM',
    date: '2026-08-11',
    eventType: 'SALE',
    operator: 'Mohammed',
    terminal: 'POS-01',
    ref: 'INV-104420',
    details: '1x Extra Virgin Olive Oil 1000ml @ 990,000 | 2x Oak Charcoal @ 450,000',
    amount: '1,890,000',
    branch: 'Main Branch (Choueifat Main Facility)',
    payment_method: 'CASH',
    channel: 'POS',
  },
  {
    time: '09:16:01 AM',
    date: '2026-08-11',
    eventType: 'PAYMENT',
    operator: 'Mohammed',
    terminal: 'POS-01',
    ref: 'INV-104420',
    details: 'Tendered: CASH | Change: 110,000',
    amount: '2,000,000',
    branch: 'Main Branch (Choueifat Main Facility)',
    payment_method: 'CASH',
    channel: 'POS',
  },
  {
    time: '10:30:14 AM',
    date: '2026-08-14',
    eventType: 'SALE',
    operator: 'Hiba Aloulou',
    terminal: 'POS-02',
    ref: 'INV-104421',
    details: '3x Stuffed Vine Leaves with Labneh @ 350,000',
    amount: '1,050,000',
    branch: 'Main Branch (Choueifat Main Facility)',
    payment_method: 'CARD',
    channel: 'POS',
  },
  {
    time: '10:32:45 AM',
    date: '2026-08-14',
    eventType: 'VOID ITEM',
    operator: 'Hiba Aloulou',
    terminal: 'POS-02',
    ref: 'INV-104421',
    details: 'ITEM VOID: 1x Stuffed Vine Leaves with Labneh (Customer Changed Mind)',
    amount: '(350,000)',
    branch: 'Main Branch (Choueifat Main Facility)',
    payment_method: 'CARD',
    channel: 'POS',
  },
  {
    time: '10:35:10 AM',
    date: '2026-08-14',
    eventType: 'PAYMENT',
    operator: 'Hiba Aloulou',
    terminal: 'POS-02',
    ref: 'INV-104421',
    details: 'Tendered: VISA (Tap Payments) | Auth: 88412',
    amount: '700,000',
    branch: 'Main Branch (Choueifat Main Facility)',
    payment_method: 'CARD',
    channel: 'POS',
  },
  {
    time: '11:45:00 AM',
    date: '2026-08-18',
    eventType: 'NO SALE',
    operator: 'Ahmad K.',
    terminal: 'POS-01',
    ref: 'NS-01',
    details: 'Cash Drawer Opened manually (Making Change)',
    amount: '-',
    branch: 'Beirut Depot',
    payment_method: 'CASH',
    channel: 'Local',
  },
  {
    time: '12:20:15 PM',
    date: '2026-08-18',
    eventType: 'DISPATCH RECEIPT',
    operator: 'Walid S.',
    terminal: 'POS-DSP',
    ref: 'SUP-AWB-109',
    details: 'COD Received from Supersonic Driver (Ali)',
    amount: '4,500,000',
    branch: 'Beirut Depot',
    payment_method: 'WHISH',
    channel: 'Online',
  },
  {
    time: '01:10:00 PM',
    date: '2026-08-22',
    eventType: 'SALE',
    operator: 'Ahmad K.',
    terminal: 'POS-02',
    ref: 'INV-104435',
    details: '2x Pressed Green Olives 1.5Kg @ 450,000',
    amount: '900,000',
    branch: 'Sidon Hub',
    payment_method: 'STORE CREDIT',
    channel: 'Wholesale',
  },
  {
    time: '02:00:00 PM',
    date: '2026-08-25',
    eventType: 'SYSTEM',
    operator: 'Mohammed',
    terminal: 'POS-01',
    ref: 'SYS-OUT',
    details: 'Operator Logout (Shift 1 Completed)',
    amount: '-',
    branch: 'Main Branch (Choueifat Main Facility)',
    payment_method: 'CASH',
    channel: 'POS',
  },
];

/**
 * ============================================================================
 * ELECTRONIC JOURNAL REPORT TEMPLATE (REP_S_00248)
 * Conforms strictly to Vanguard ERP Corporate MasterReportDocument standard:
 * - Dynamic filtering with applyGlobalReportFilters
 * - Live recalculation of terminal session reconciliation
 * ============================================================================
 */
export const ElectronicJournalTemplate: React.FC<ElectronicJournalTemplateProps> = ({
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  branch = 'Main Branch (Choueifat Main Facility)',
  filterValues = {},
}) => {
  // Normalize Period text
  const cleanPeriod = useMemo(() => {
    if (!dynamicPeriodText) return '28-Jul-2026 to 28-Aug-2026';
    return dynamicPeriodText.replace(/^Period:\s*/i, '').replace(/^Date:\s*/i, '').replace(/^Journal Cycle:\s*/i, '');
  }, [dynamicPeriodText]);

  // Dynamic filter summary
  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (filterValues.serverCashier && filterValues.serverCashier !== 'ALL') parts.push(`Cashier: ${filterValues.serverCashier}`);
    if (filterValues.paymentType && filterValues.paymentType !== 'ALL') parts.push(`Tender: ${filterValues.paymentType}`);
    if (filterValues.channel && filterValues.channel !== 'ALL') parts.push(`Channel: ${filterValues.channel}`);
    if (filterValues.workstation && filterValues.workstation !== 'ALL') parts.push(`Terminal: ${filterValues.workstation}`);
    return parts.length > 0 ? parts.join(' | ') : undefined;
  }, [filterValues]);

  // Wire central filter pipeline
  const filteredRecords = useMemo(() => {
    return applyGlobalReportFilters(DEFAULT_JOURNAL_DATA, filterValues);
  }, [filterValues]);

  // Dynamic Financial Totals & Session Reconciliation
  const sessionSummary = useMemo(() => {
    let grossSales = 0;
    let totalVoids = 0;
    let cardPayments = 0;
    let codCollected = 0;
    let startingFloat = 5000000;

    filteredRecords.forEach((r) => {
      const numericVal = parseFloat(r.amount.replace(/[^0-9.-]+/g, '')) || 0;
      if (r.eventType === 'SALE') grossSales += numericVal;
      if (r.eventType === 'VOID ITEM') totalVoids += numericVal;
      if (r.eventType === 'PAYMENT' && r.payment_method === 'CARD') cardPayments += numericVal;
      if (r.eventType === 'DISPATCH RECEIPT') codCollected += numericVal;
    });

    const netSales = grossSales - totalVoids;
    const expectedDrawerCash = startingFloat + netSales - cardPayments + codCollected;

    return {
      grossSales,
      totalVoids,
      netSales,
      cardPayments,
      codCollected,
      startingFloat,
      expectedDrawerCash,
    };
  }, [filteredRecords]);

  // Report Metadata
  const meta: ReportMetadata = useMemo(() => ({
    companyName: 'Zeit w zaytoun ljanoub',
    subtitle: 'Southern Olive Oil Products S.A.R.L - Terminal Electronic Journal Audit',
    reportTitle: 'Electronic Journal',
    code: 'REP_S_00248',
    dateRange: cleanPeriod,
    generatedDate: executionDate,
    branch: branch.startsWith('Branch:') ? branch : `Branch: ${branch}`,
    filterSummary,
    systemSource: 'Vanguard ERP POS Security & Fiscal Kernel',
    pageNumber: 1,
    totalPages: 1,
  }), [cleanPeriod, executionDate, branch, filterSummary]);

  // Columns definition
  const columns: ReportColumn<ElectronicJournalRecord>[] = useMemo(() => [
    {
      key: 'time',
      label: 'Time',
      align: 'left',
      isMonospace: true,
      width: '12%',
      render: (row) => (
        <span className="font-mono text-xs text-slate-700 font-semibold">
          {row.time}
        </span>
      ),
    },
    {
      key: 'eventType',
      label: 'Event Type',
      align: 'left',
      width: '14%',
      render: (row) => {
        let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
        if (row.eventType === 'VOID ITEM') {
          badgeStyle = 'bg-red-50 text-red-700 border-red-200';
        } else if (row.eventType === 'SALE') {
          badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        } else if (row.eventType === 'PAYMENT') {
          badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
        } else if (row.eventType === 'CASH MANAGEMENT') {
          badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
        } else if (row.eventType === 'NO SALE') {
          badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200';
        } else if (row.eventType === 'DISPATCH RECEIPT') {
          badgeStyle = 'bg-teal-50 text-teal-700 border-teal-200';
        }

        return (
          <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold border font-mono uppercase tracking-tight inline-block ${badgeStyle}`}>
            {row.eventType}
          </span>
        );
      },
    },
    {
      key: 'operator',
      label: 'Operator',
      align: 'left',
      width: '11%',
      render: (row) => (
        <span className="font-medium text-slate-800">
          {row.operator}
        </span>
      ),
    },
    {
      key: 'terminal',
      label: 'Term',
      align: 'center',
      isMonospace: true,
      width: '8%',
      render: (row) => (
        <span className="font-mono text-slate-600 font-medium">
          {row.terminal}
        </span>
      ),
    },
    {
      key: 'ref',
      label: 'Reference #',
      align: 'left',
      isMonospace: true,
      width: '12%',
      render: (row) => (
        <span className="font-mono font-bold text-slate-900">
          {row.ref}
        </span>
      ),
    },
    {
      key: 'details',
      label: 'Event Details',
      align: 'left',
      width: '31%',
      render: (row) => (
        <span className="text-slate-800 text-xs leading-normal">
          {row.details}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount (LBP)',
      align: 'right',
      isMonospace: true,
      width: '12%',
      render: (row) => {
        const isNegative = row.amount.startsWith('(');
        const isMuted = row.amount === '-';
        return (
          <span
            className={`font-mono font-bold tabular-nums text-xs ${
              isNegative ? 'text-red-600' : isMuted ? 'text-slate-400 font-normal' : 'text-slate-900'
            }`}
          >
            {row.amount}
          </span>
        );
      },
    },
  ], []);

  const grandTotal: GrandTotal = useMemo(() => ({
    label: `Expected Net Cash Drawer Balance (${filteredRecords.length} Journal Entries):`,
    value: `${sessionSummary.expectedDrawerCash.toLocaleString('en-US')} LBP`,
  }), [filteredRecords.length, sessionSummary.expectedDrawerCash]);

  return (
    <div className="w-full space-y-6">
      <MasterReportDocument<ElectronicJournalRecord>
        meta={meta}
        columns={columns}
        flatRows={filteredRecords}
        grandTotal={grandTotal}
      />

      {/* Terminal Session Summary Reconciliation Box */}
      <div className="max-w-5xl mx-auto flex justify-end print:block">
        <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-2xs text-xs space-y-2 font-sans">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-200 text-center">
            Terminal Session Summary
          </h4>
          <div className="flex justify-between text-slate-600">
            <span>Gross Sales:</span>
            <span className="font-mono font-medium text-slate-900">
              {sessionSummary.grossSales.toLocaleString('en-US')} LBP
            </span>
          </div>
          <div className="flex justify-between text-red-600">
            <span className="font-medium">Total Voids:</span>
            <span className="font-mono font-bold">
              ({sessionSummary.totalVoids.toLocaleString('en-US')}) LBP
            </span>
          </div>
          <div className="flex justify-between text-slate-800 font-bold border-t border-slate-200 pt-1">
            <span>Net Sales:</span>
            <span className="font-mono text-emerald-700">
              {sessionSummary.netSales.toLocaleString('en-US')} LBP
            </span>
          </div>
          <div className="flex justify-between text-slate-600 pt-1">
            <span>POS Card / Digital Payments:</span>
            <span className="font-mono font-medium text-slate-900">
              {sessionSummary.cardPayments.toLocaleString('en-US')} LBP
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Dispatch COD Collected:</span>
            <span className="font-mono font-medium text-slate-900">
              {sessionSummary.codCollected.toLocaleString('en-US')} LBP
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Starting Float:</span>
            <span className="font-mono font-medium text-slate-900">
              {sessionSummary.startingFloat.toLocaleString('en-US')} LBP
            </span>
          </div>
          <div className="flex justify-between items-center border-t-2 border-slate-900 pt-2 font-bold text-slate-900 text-[13px]">
            <span>Expected Drawer Cash:</span>
            <span className="font-mono text-slate-900">
              {sessionSummary.expectedDrawerCash.toLocaleString('en-US')} LBP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectronicJournalTemplate;
