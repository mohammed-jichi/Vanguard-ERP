'use client';

import React from 'react';
import { CustomerListStandardTemplate } from './sales/CustomerListStandardTemplate';
import { TransactionsByDateMasterDocument } from './transactions/TransactionsByDateMasterDocument';
import { ReportTableWrapper } from './ReportPageLayout';
import { getLoyaltyTierTextClass, getReportStatusTextClass } from './reportContrastTokens';

// ============================================================================
// 1. SHARED REPORT REGISTRY TYPES & CONTEXTS
// ============================================================================

export type ReportModuleContext = 'sales' | 'inventory' | 'operations' | 'loyalty' | 'accounting';

export interface SharedReportConfig {
  reportKey: string;
  aliases: string[];
  title: string;
  defaultModule: ReportModuleContext;
  description: string;
}

// Canonical Shared Reports List across Vanguard ERP
export const SHARED_REPORT_CONFIGS: SharedReportConfig[] = [
  {
    reportKey: 'BEST_CUSTOMERS',
    aliases: ['Best Customers', 'Top Customers', 'Top N Customers by Amount'],
    title: 'Best Customers & Top Revenue Accounts',
    defaultModule: 'sales',
    description: 'Consolidated customer accounts ranked by gross billing, transactional frequency, and loyalty score.',
  },
  {
    reportKey: 'CUSTOMER_TRANSACTIONS',
    aliases: ['Customer Transactions', 'Customer Transactions Summary', 'Transactions by Customer'],
    title: 'Customer Transactions & Settlement Ledger',
    defaultModule: 'sales',
    description: 'Cross-module audit trail of invoices, returns, loyalty redemptions, and receipt settlements.',
  },
  {
    reportKey: 'TOP_SUPPLIERS',
    aliases: ['Top Suppliers', 'Purchase Summary by supplier', 'List of Suppliers'],
    title: 'Top Suppliers & Vendor Volume Summary',
    defaultModule: 'operations',
    description: 'Procurement metrics, billing totals, and AP liabilities aggregated by supplier account.',
  },
  {
    reportKey: 'PAYMENTS_REGISTER',
    aliases: ['Payment Reports', 'Receipts Reports', 'Summary of Payment', 'Summary of Payments'],
    title: 'Financial Payments & Receipts Master Register',
    defaultModule: 'accounting',
    description: 'Consolidated cash, bank, credit card, and customer remittance transaction records.',
  },
  {
    reportKey: 'USER_LOG',
    aliases: ['User Log Report', 'User Log', 'Audit Log'],
    title: 'System Access & User Transaction Audit Log',
    defaultModule: 'sales',
    description: 'Audit log tracking terminal sign-ins, manager overrides, voids, and price adjustments.',
  },
];

// Mock Shared Data for Best Customers
const SHARED_BEST_CUSTOMERS_DATA = [
  { rank: 1, code: 'CUST-10024', name: 'Al-Baraka Supermarket S.A.R.L', tier: 'PLATINUM', totalSpend: '$48,200.00', ordersCount: 142, pointsBalance: 24500, status: 'Active' },
  { rank: 2, code: 'CUST-10021', name: 'Al-Bustan Restaurant Group', tier: 'PLATINUM', totalSpend: '$38,400.00', ordersCount: 96, pointsBalance: 14250, status: 'Active' },
  { rank: 3, code: 'CUST-10042', name: 'Cedar Hospitality LLC', tier: 'GOLD', totalSpend: '$21,800.00', ordersCount: 68, pointsBalance: 8920, status: 'Active' },
  { rank: 4, code: 'CUST-10043', name: 'Verdun Fine Foods S.A.L', tier: 'GOLD', totalSpend: '$16,500.00', ordersCount: 52, pointsBalance: 6410, status: 'Active' },
  { rank: 5, code: 'CUST-10047', name: 'Byblos Gourmet Deli', tier: 'SILVER', totalSpend: '$11,600.00', ordersCount: 38, pointsBalance: 4100, status: 'Active' },
  { rank: 6, code: 'CUST-10044', name: 'Mina Seaside Resort', tier: 'SILVER', totalSpend: '$9,200.00', ordersCount: 29, pointsBalance: 3820, status: 'Active' },
];

// Mock Shared Data for Top Suppliers
const SHARED_TOP_SUPPLIERS_DATA = [
  { rank: 1, code: 'VND-2001', name: 'South Lebanon Olive Farmers Co-op', category: 'Raw Olives', totalBilled: '$148,500.00', paidAmount: '$116,500.00', outstandingAp: '$32,000.00', ordersCount: 44, status: 'Active' },
  { rank: 2, code: 'VND-2002', name: 'Mediterranean Bottle & Glass Works', category: 'Packaging Glass', totalBilled: '$54,200.00', paidAmount: '$43,000.00', outstandingAp: '$11,200.00', ordersCount: 26, status: 'Active' },
  { rank: 3, code: 'VND-2003', name: 'Al-Hilal Tin Containers & Drums', category: 'Tins & Packaging', totalBilled: '$38,900.00', paidAmount: '$32,400.00', outstandingAp: '$6,500.00', ordersCount: 19, status: 'Active' },
  { rank: 4, code: 'VND-2004', name: 'Beirut Logistics & Fleet Services', category: 'Logistics', totalBilled: '$22,400.00', paidAmount: '$22,400.00', outstandingAp: '$0.00', ordersCount: 31, status: 'Active' },
];

// Mock Shared Data for User Logs
const SHARED_USER_LOG_DATA = [
  { timestamp: '2026-09-16 10:45:12', user: 'Mohammad Jichi (Admin)', terminal: 'WS-MAIN-01', action: 'EXPORT_REPORT', module: 'Accounting', detail: 'Exported Balance Sheet Statement to PDF' },
  { timestamp: '2026-09-16 10:22:45', user: 'Walid Sleiman', terminal: 'WS-DSP-02', action: 'DISPATCH_CONFIRM', module: 'Operations', detail: 'Confirmed dispatch DSP-2026-5510 to Verdun' },
  { timestamp: '2026-09-16 09:58:30', user: 'Ahmad Zein', terminal: 'WS-POS-01', action: 'MANAGER_OVERRIDE', module: 'Sales Control', detail: 'Approved line void on Invoice #102974 ($12.50)' },
  { timestamp: '2026-09-16 09:15:00', user: 'Jad El-Hajj', terminal: 'WS-BOT-01', action: 'BATCH_COMPLETE', module: 'Operations', detail: 'Finalized bottling run for WO-BOT-8822 (3,200 units)' },
  { timestamp: '2026-09-16 08:30:15', user: 'System Cron', terminal: 'SERVER-JOB', action: 'POINTS_ACCRUAL', module: 'Loyalty', detail: 'Processed harvest promotion auto-accrual for 142 members' },
];

// ============================================================================
// 2. SHARED REPORT VIEW RENDERER COMPONENT
// ============================================================================

export interface SharedReportViewerProps {
  reportName: string;
  moduleContext: ReportModuleContext;
  dateRangeText?: string;
  searchQuery?: string;
}

export function SharedReportViewer({
  reportName,
  moduleContext,
  dateRangeText = 'Period: 01-Aug-2026 to 31-Aug-2026',
  searchQuery = '',
}: SharedReportViewerProps) {
  const norm = reportName.trim().toLowerCase();

  // 1. Best Customers / Top Customers View
  if (
    norm.includes('best customer') ||
    norm.includes('top customer') ||
    norm.includes('top n customer')
  ) {
    const isLoyaltyContext = moduleContext === 'loyalty';
    return (
      <ReportTableWrapper
        title={`${reportName} ${isLoyaltyContext ? '(Loyalty Points & Tiers)' : '(Revenue Ledger)'}`}
        subtitle="Shared enterprise customer performance register across Sales, Loyalty, and Accounting"
        totalRecordsCount={SHARED_BEST_CUSTOMERS_DATA.length}
      >
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-y-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
              <th className="py-2 px-3 w-12 text-center">Rank</th>
              <th className="py-2 px-3">Customer Account</th>
              <th className="py-2 px-3 text-center">Membership Tier</th>
              <th className="py-2 px-3 text-right">Total Invoiced ($)</th>
              <th className="py-2 px-3 text-center">Orders</th>
              <th className="py-2 px-3 text-right">Points Balance</th>
              <th className="py-2 px-3 text-center">Account Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {SHARED_BEST_CUSTOMERS_DATA.map((c) => (
              <tr key={c.code} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">#{c.rank}</td>
                <td className="py-2 px-3">
                  <div className="font-medium text-slate-800">{c.name}</div>
                  <div className="font-mono text-xs text-slate-600 font-medium">{c.code}</div>
                </td>
                <td className="py-2 px-3 text-center">
                  <span className={getLoyaltyTierTextClass(c.tier)}>
                    {c.tier}
                  </span>
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{c.totalSpend}</td>
                <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">{c.ordersCount}</td>
                <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                  {c.pointsBalance.toLocaleString()} pts
                </td>
                <td className="py-2 px-3 text-center">
                  <span className={getReportStatusTextClass(c.status)}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportTableWrapper>
    );
  }

  // 2. Top Suppliers View
  if (norm.includes('top supplier') || norm.includes('list of supplier')) {
    return (
      <ReportTableWrapper
        title={`${reportName} Register`}
        subtitle="Shared procurement liability and volume register across Operations Center and Accounting"
        totalRecordsCount={SHARED_TOP_SUPPLIERS_DATA.length}
      >
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-y-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
              <th className="py-2 px-3 w-12 text-center">Rank</th>
              <th className="py-2 px-3">Vendor / Supplier Name</th>
              <th className="py-2 px-3">Supply Category</th>
              <th className="py-2 px-3 text-right">Total Billed ($)</th>
              <th className="py-2 px-3 text-right">Settled Amount</th>
              <th className="py-2 px-3 text-right">Outstanding AP</th>
              <th className="py-2 px-3 text-center">Shipments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {SHARED_TOP_SUPPLIERS_DATA.map((s) => (
              <tr key={s.code} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">#{s.rank}</td>
                <td className="py-2 px-3">
                  <div className="font-medium text-slate-800">{s.name}</div>
                  <div className="font-mono text-xs text-slate-600 font-medium">{s.code}</div>
                </td>
                <td className="py-2 px-3 font-medium text-slate-800 text-xs">{s.category}</td>
                <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{s.totalBilled}</td>
                <td className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">{s.paidAmount}</td>
                <td className="py-2 px-3 text-right font-mono text-rose-700 font-bold">{s.outstandingAp}</td>
                <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">{s.ordersCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportTableWrapper>
    );
  }

  // 3. User Log Report View
  if (norm.includes('user log')) {
    return (
      <ReportTableWrapper
        title="Enterprise System User Audit Trail"
        subtitle="Shared immutable log of security events, administrative overrides, and transactional postings"
        totalRecordsCount={SHARED_USER_LOG_DATA.length}
      >
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-y-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
              <th className="py-2 px-3 w-[18%]">Timestamp</th>
              <th className="py-2 px-3 w-[20%]">User & Role</th>
              <th className="py-2 px-3 w-[14%] text-center">Workstation</th>
              <th className="py-2 px-3 w-[14%] text-center">Module</th>
              <th className="py-2 px-3 w-[14%] text-center">Action Type</th>
              <th className="py-2 px-3">Audit Trail Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {SHARED_USER_LOG_DATA.map((log, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2 px-3 font-mono text-xs text-slate-600 font-medium">{log.timestamp}</td>
                <td className="py-2 px-3 font-medium text-slate-800">{log.user}</td>
                <td className="py-2 px-3 text-center font-mono text-xs text-slate-600 font-medium">{log.terminal}</td>
                <td className="py-2 px-3 text-center font-bold text-slate-800 text-xs">
                  {log.module}
                </td>
                <td className="py-2 px-3 text-center font-bold text-blue-700 text-xs">
                  {log.action}
                </td>
                <td className="py-2 px-3 text-xs text-slate-800 font-medium">{log.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportTableWrapper>
    );
  }

  // 4. Default to Transactions by Date template if customer transactions
  if (norm.includes('transaction')) {
    return (
      <TransactionsByDateMasterDocument
        dynamicPeriodText={dateRangeText}
        executionDate="06-Sep-2026"
        showRate={true}
        groupByDate={true}
      />
    );
  }

  // Fallback to Customer List Standard
  return (
    <CustomerListStandardTemplate
      hideToolbar={true}
      dynamicPeriodText={dateRangeText}
      executionDate="06-Sep-2026"
      reportTitle={reportName}
    />
  );
}

export function isSharedReport(reportName: string): boolean {
  const norm = reportName.trim().toLowerCase();
  return (
    norm.includes('best customer') ||
    norm.includes('top customer') ||
    norm.includes('top n customer') ||
    norm.includes('top supplier') ||
    norm.includes('list of supplier') ||
    norm.includes('customer transaction') ||
    norm.includes('user log')
  );
}

export default SharedReportViewer;

