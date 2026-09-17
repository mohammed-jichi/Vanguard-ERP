'use client';

import React, { useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ReportPageLayout, {
  ReportHeader,
  ExportButtons,
  ReportFilters,
  ReportSelectFilter,
  ReportTableWrapper,
  ReportCategoryGroup,
  DynamicReportFilterRenderer,
} from '@/components/reports/ReportPageLayout';
import UnifiedPrintableReportSheet from '@/components/reports/UnifiedPrintableReportSheet';
import {
  ACCOUNTING_OMEGA_TREE,
  getAccountingReportMeta,
} from '@/components/reports/accountingReportsTree';
import { SharedReportViewer, isSharedReport } from '@/components/reports/registry';

// ============================================================================
// 1. MOCK DATASETS FOR ACCOUNTING & FINANCE
// ============================================================================

// Mock AR Aging Data
const AR_AGING_DATA = [
  { accountCode: '1120-01', customerName: 'Al-Baraka Supermarket S.A.R.L', current: '$12,400.00', days30: '$4,200.00', days60: '$0.00', days90Plus: '$0.00', totalDebt: '$16,600.00', limit: '$25,000', risk: 'LOW' },
  { accountCode: '1120-02', customerName: 'Marwan Chehab Store', current: '$3,300.00', days30: '$2,100.00', days60: '$1,400.00', days90Plus: '$0.00', totalDebt: '$6,800.00', limit: '$10,000', risk: 'MEDIUM' },
  { accountCode: '1120-03', customerName: 'Cedar Hospitality Group', current: '$18,900.00', days30: '$0.00', days60: '$0.00', days90Plus: '$0.00', totalDebt: '$18,900.00', limit: '$50,000', risk: 'LOW' },
  { accountCode: '1120-04', customerName: 'Phoenicia Gourmet Chain', current: '$8,500.00', days30: '$5,400.00', days60: '$3,200.00', days90Plus: '$1,800.00', totalDebt: '$18,900.00', limit: '$20,000', risk: 'HIGH' },
  { accountCode: '1120-05', customerName: 'Southern Heritage Bistro', current: '$1,200.00', days30: '$800.00', days60: '$0.00', days90Plus: '$0.00', totalDebt: '$2,000.00', limit: '$5,000', risk: 'LOW' },
];

// Mock AP Aging Data
const AP_AGING_DATA = [
  { vendorCode: '2110-01', supplierName: 'South Lebanon Olive Farmers Co-op', current: '$32,000.00', days30: '$14,500.00', days60: '$0.00', totalOwed: '$46,500.00', terms: 'Net 30', status: 'DUE_SOON' },
  { vendorCode: '2110-02', supplierName: 'Mediterranean Bottle & Glass Works', current: '$11,200.00', days30: '$0.00', days60: '$0.00', totalOwed: '$11,200.00', terms: 'Net 15', status: 'CURRENT' },
  { vendorCode: '2110-03', supplierName: 'Al-Hilal Tin Containers & Drums', current: '$6,500.00', days30: '$0.00', days60: '$0.00', totalOwed: '$6,500.00', terms: 'Net 30', status: 'CURRENT' },
  { vendorCode: '2110-04', supplierName: 'Beirut Logistics & Fleet Services', current: '$4,800.00', days30: '$0.00', days60: '$0.00', totalOwed: '$4,800.00', terms: 'Net 30', status: 'CURRENT' },
];

// Mock Chart of Accounts Data
const CHART_OF_ACCOUNTS_DATA = [
  { code: '1110-01', name: 'Cash Vault Physical Drawer', type: 'Current Asset', currency: 'USD / LBP', normal: 'Debit', balance: '$42,000.00', status: 'ACTIVE' },
  { code: '1110-02', name: 'BLOM Bank Corporate Commercial Checking', type: 'Current Asset', currency: 'USD', normal: 'Debit', balance: '$142,200.00', status: 'ACTIVE' },
  { code: '1120-00', name: 'Trade Accounts Receivable (Control)', type: 'Current Asset', currency: 'USD', normal: 'Debit', balance: '$24,510.00', status: 'ACTIVE' },
  { code: '1130-00', name: 'Finished Olive Oil Stock Inventory', type: 'Current Asset', currency: 'USD', normal: 'Debit', balance: '$340,000.00', status: 'ACTIVE' },
  { code: '1210-00', name: 'Choueifat Plant Facilities & Press Machinery', type: 'Fixed Asset', currency: 'USD', normal: 'Debit', balance: '$780,000.00', status: 'ACTIVE' },
  { code: '2110-00', name: 'Trade Accounts Payable (Control)', type: 'Current Liability', currency: 'USD', normal: 'Credit', balance: '$64,200.00', status: 'ACTIVE' },
  { code: '2120-00', name: 'Accrued Wages & Social Security (NSSF)', type: 'Current Liability', currency: 'USD', normal: 'Credit', balance: '$18,400.00', status: 'ACTIVE' },
  { code: '3110-00', name: 'Paid-Up Share Capital & Retained Reserves', type: 'Equity', currency: 'USD', normal: 'Credit', balance: '$1,254,375.00', status: 'ACTIVE' },
  { code: '4110-01', name: 'Olive Oil Bottle Sales (Wholesale & Retail)', type: 'Operating Revenue', currency: 'USD', normal: 'Credit', balance: '$294,000.00', status: 'ACTIVE' },
  { code: '5110-00', name: 'Raw Olive Crop Procurement Cost (COGS)', type: 'Direct Expense', currency: 'USD', normal: 'Debit', balance: '$168,000.00', status: 'ACTIVE' },
  { code: '6110-00', name: 'Administrative Staff Salaries & Overhead', type: 'Operating Expense', currency: 'USD', normal: 'Debit', balance: '$36,000.00', status: 'ACTIVE' },
];

// Mock Budget Overview Data
const BUDGET_OVERVIEW_DATA = [
  { code: 'CC-REV-01', name: 'Operating Revenue (Olive Oil Sales)', annualBudget: '$1,800,000.00', ytdActual: '$1,260,000.00', varianceUsd: '+$60,000.00', variancePct: '+5.0%', status: 'ON_TRACK' },
  { code: 'CC-COG-01', name: 'Direct Agricultural Procurement (Olives)', annualBudget: '$720,000.00', ytdActual: '$504,000.00', varianceUsd: '-$24,000.00', variancePct: '-4.5%', status: 'FAVORABLE' },
  { code: 'CC-PKG-02', name: 'Glass Bottles & Food-Grade Tins', annualBudget: '$140,000.00', ytdActual: '$102,000.00', varianceUsd: '+$7,000.00', variancePct: '+7.3%', status: 'OVER_BUDGET' },
  { code: 'CC-LOG-03', name: 'SuperSonic Fleet Fuel & Transport', annualBudget: '$65,000.00', ytdActual: '$43,500.00', varianceUsd: '-$5,250.00', variancePct: '-10.7%', status: 'FAVORABLE' },
  { code: 'CC-UTL-04', name: 'Press Power, Generator Fuel & Water', annualBudget: '$90,000.00', ytdActual: '$68,000.00', varianceUsd: '+$4,000.00', variancePct: '+6.2%', status: 'OVER_BUDGET' },
  { code: 'CC-MKT-05', name: 'Brand Marketing & Loyalty Rewards', annualBudget: '$45,000.00', ytdActual: '$28,400.00', varianceUsd: '-$5,350.00', variancePct: '-15.8%', status: 'ON_TRACK' },
];

// Mock Payments & Receipts Data
const PAYMENTS_RECEIPTS_DATA = [
  { voucher: 'PMT-2026-0812', date: '2026-09-14', entity: 'South Lebanon Olive Farmers Co-op', type: 'PAYMENT', method: 'BLOM Bank Wire', ref: 'WT-994201', amount: '$32,000.00', status: 'SETTLED' },
  { voucher: 'RCP-2026-1044', date: '2026-09-14', entity: 'Al-Baraka Supermarket S.A.R.L', type: 'RECEIPT', method: 'Customer Cheque #4412', ref: 'CHQ-4412', amount: '$12,400.00', status: 'CLEARED' },
  { voucher: 'RCP-2026-1045', date: '2026-09-13', entity: 'Cedar Hospitality Group', type: 'RECEIPT', method: 'Bank Transfer (Whish Money)', ref: 'WSH-88129', amount: '$8,500.00', status: 'CLEARED' },
  { voucher: 'PMT-2026-0813', date: '2026-09-12', entity: 'Mediterranean Bottle & Glass Works', type: 'PAYMENT', method: 'BLOM Corporate Cheque', ref: 'CHQ-8902', amount: '$11,200.00', status: 'SETTLED' },
  { voucher: 'RCP-2026-1046', date: '2026-09-11', entity: 'Phoenicia Bakery Chain', type: 'RECEIPT', method: 'Cash Drawer Remittance', ref: 'CSH-1029', amount: '$5,400.00', status: 'CLEARED' },
  { voucher: 'PMT-2026-0814', date: '2026-09-10', entity: 'EDL / Choueifat Power Utility', type: 'PAYMENT', method: 'Direct Debit', ref: 'DD-00214', amount: '$3,850.00', status: 'SETTLED' },
];

// Mock Journal Transaction Details Data
const JOURNAL_ENTRIES_DATA = [
  { jrnId: 'JRN-2026-4410', date: '2026-09-14', accountCode: '1110-02', accountName: 'BLOM Bank Checking', desc: 'Customer invoice settlement #INV-9921', debit: '$12,400.00', credit: '-', balance: '$142,200.00' },
  { jrnId: 'JRN-2026-4410', date: '2026-09-14', accountCode: '1120-00', accountName: 'Trade Accounts Receivable', desc: 'Customer invoice settlement #INV-9921', debit: '-', credit: '$12,400.00', balance: '$24,510.00' },
  { jrnId: 'JRN-2026-4411', date: '2026-09-13', accountCode: '5110-00', accountName: 'Raw Olive Crop Procurement', desc: 'Intake batch harvest receipt #GR-8812', debit: '$18,500.00', credit: '-', balance: '$168,000.00' },
  { jrnId: 'JRN-2026-4411', date: '2026-09-13', accountCode: '2110-00', accountName: 'Trade Accounts Payable', desc: 'Intake batch harvest receipt #GR-8812', debit: '-', credit: '$18,500.00', balance: '$64,200.00' },
  { jrnId: 'JRN-2026-4412', date: '2026-09-12', accountCode: '6120-00', accountName: 'SuperSonic Fleet Fuel Expenses', desc: 'Fleet refueling voucher #FL-3109', debit: '$1,450.00', credit: '-', balance: '$14,500.00' },
  { jrnId: 'JRN-2026-4412', date: '2026-09-12', accountCode: '1110-01', accountName: 'Cash Vault Physical Drawer', desc: 'Fleet refueling voucher #FL-3109', debit: '-', credit: '$1,450.00', balance: '$42,000.00' },
];

function AccountingReportsContent() {
  const [selectedReport, setSelectedReport] = useState<string>('Income Statement');
  const [period, setPeriod] = useState<string>('This Quarter');
  const [branch, setBranch] = useState<string>('Consolidated Operations');
  const [accountClassFilter, setAccountClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [accFilterValues, setAccFilterValues] = useState<Record<string, any>>({});

  const activeMeta = useMemo(() => getAccountingReportMeta(selectedReport), [selectedReport]);

  const handleSelectReport = (reportName: string) => {
    setSelectedReport(reportName);
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('vanguard_recent_reports_accounting');
        const prev = stored ? JSON.parse(stored) : [];
        if (Array.isArray(prev)) {
          const updated = [reportName, ...prev.filter((r: string) => r !== reportName)].slice(0, 5);
          localStorage.setItem('vanguard_recent_reports_accounting', JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.warn('[handleSelectReport] accounting error:', err);
    }
  };

  // View mode determinations
  const isArApView =
    selectedReport === 'Receivables' ||
    selectedReport === 'Payables' ||
    selectedReport.includes('Receivable') ||
    selectedReport.includes('Payable');

  const isBalanceSheetView = selectedReport === 'Balance Sheet';

  const isTrialBalanceOrLedger =
    selectedReport === 'Trial Balance' ||
    selectedReport === 'General Ledger' ||
    selectedReport === 'Cash Flow';

  const isJournalOrStatementView =
    selectedReport === 'Transaction Details' ||
    selectedReport === 'Statement of Account';

  const isPaymentReceiptsView =
    selectedReport === 'Payment Reports' ||
    selectedReport === 'Receipts Reports';

  const isChartOfAccountsView = selectedReport === 'Chart Of Accounts';

  const isBudgetOverviewView = selectedReport === 'Budget Overview';

  const isTaxReportView = selectedReport === 'Tax Report';

  const filteredCOA = useMemo(() => {
    return CHART_OF_ACCOUNTS_DATA.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass =
        accountClassFilter === 'ALL' ||
        (accountClassFilter === 'REVENUE' && a.type.includes('Revenue')) ||
        (accountClassFilter === 'COGS' && a.type.includes('Direct')) ||
        (accountClassFilter === 'OPEX' && a.type.includes('Operating')) ||
        (accountClassFilter === 'TAX' && a.type.includes('Expense'));
      return matchesSearch && matchesClass;
    });
  }, [searchQuery, accountClassFilter]);

  const filteredBudget = useMemo(() => {
    return BUDGET_OVERVIEW_DATA.filter((b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredPayments = useMemo(() => {
    return PAYMENTS_RECEIPTS_DATA.filter((p) => {
      const matchesSearch =
        p.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.voucher.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        selectedReport === 'Payment Reports'
          ? p.type === 'PAYMENT'
          : selectedReport === 'Receipts Reports'
          ? p.type === 'RECEIPT'
          : true;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, selectedReport]);

  const filteredJournals = useMemo(() => {
    return JOURNAL_ENTRIES_DATA.filter((j) =>
      j.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.jrnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <ReportPageLayout
      moduleTitle="Accounting"
      moduleKey="accounting"
      storageKeyOverride="vanguard_recent_reports_accounting"
      categories={ACCOUNTING_OMEGA_TREE}
      selectedReport={selectedReport}
      onSelectReport={handleSelectReport}
      header={
        <ReportHeader
          title={activeMeta.name}
          subtitle="General Ledger, Chart of Accounts, Journal Entries, and Audited Financial Statements"
          breadcrumbs={[
            { label: 'Home', href: '/backoffice/dashboard' },
            { label: '4. Accounting', href: '/accounting/reports' },
            { label: activeMeta.category },
            { label: activeMeta.name },
          ]}
          reportCode={activeMeta.code}
          badgeText="AUDITED FINANCIAL"
          badgeVariant="primary"
          actions={
            <ExportButtons
              onPrint={() => window.print()}
              onExportPdf={() => window.print()}
              onExportExcel={() => alert(`Exporting ${activeMeta.name} to Excel (.xlsx)...`)}
              onExportCsv={() => alert(`Exporting ${activeMeta.name} to CSV...`)}
            />
          }
        />
      }
      // 3. Dynamic Filter Engine
      filters={
        <DynamicReportFilterRenderer
          activeReportKey={selectedReport}
          module="accounting"
          values={{
            period,
            fiscalPeriod: period,
            branch,
            accountClass: accountClassFilter,
            searchQuery,
            ...accFilterValues,
          }}
          onValuesChange={(newVals) => {
            if (newVals.period !== undefined) setPeriod(newVals.period);
            if (newVals.fiscalPeriod !== undefined) setPeriod(newVals.fiscalPeriod);
            if (newVals.branch !== undefined) setBranch(newVals.branch);
            if (newVals.accountClass !== undefined) setAccountClassFilter(newVals.accountClass);
            if (newVals.searchQuery !== undefined) setSearchQuery(newVals.searchQuery);
            setAccFilterValues(newVals);
          }}
          onApplyFilters={(vals) => alert(`Filters applied for: ${activeMeta.name}`)}
          onResetFilters={() => {
            setSearchQuery('');
            setPeriod('This Quarter');
            setBranch('Consolidated Operations');
            setAccountClassFilter('ALL');
            setAccFilterValues({});
          }}
        />
      }
      table={
        <div className="space-y-4">
          {/* A. SHARED REPORT REUSE (DRY Principle): Top Customers, Top Suppliers, User Log */}
          {isSharedReport(selectedReport) && (
            <SharedReportViewer
              reportName={selectedReport}
              moduleContext="accounting"
              searchQuery={searchQuery}
            />
          )}

          {/* B. RECEIVABLES & PAYABLES VIEW */}
          {!isSharedReport(selectedReport) && isArApView && (
            <ReportTableWrapper
              title={`${selectedReport} Register`}
              subtitle={`Audited balances for ${branch} • Commercial trade terms & aging brackets`}
              totalRecordsCount={selectedReport.includes('Payables') ? AP_AGING_DATA.length : AR_AGING_DATA.length}
            >
              <div className="overflow-x-auto">
                {selectedReport.includes('Payables') ? (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Vendor #</th>
                        <th className="py-3 px-4">Supplier / Farmer Account</th>
                        <th className="py-3 px-4 text-right">Current (0-30 Days)</th>
                        <th className="py-3 px-4 text-right">31-60 Days</th>
                        <th className="py-3 px-4 text-right">61+ Days</th>
                        <th className="py-3 px-4 text-right">Total Owed</th>
                        <th className="py-3 px-4 text-center">Payment Terms</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {AP_AGING_DATA.map((row) => (
                        <tr key={row.vendorCode} className="hover:bg-blue-50/30 transition">
                          <td className="py-3 px-4 font-bold text-blue-900">{row.vendorCode}</td>
                          <td className="py-3 px-4 font-sans font-semibold text-slate-900">{row.supplierName}</td>
                          <td className="py-3 px-4 text-right">{row.current}</td>
                          <td className="py-3 px-4 text-right text-amber-600">{row.days30}</td>
                          <td className="py-3 px-4 text-right text-rose-600">{row.days60}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">{row.totalOwed}</td>
                          <td className="py-3 px-4 text-center font-sans">{row.terms}</td>
                          <td className="py-3 px-4 text-center font-sans">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Account #</th>
                        <th className="py-3 px-4">Client / Account Name</th>
                        <th className="py-3 px-4 text-right">Current (0-30 Days)</th>
                        <th className="py-3 px-4 text-right">31-60 Days</th>
                        <th className="py-3 px-4 text-right">61-90 Days</th>
                        <th className="py-3 px-4 text-right">90+ Days</th>
                        <th className="py-3 px-4 text-right">Total Outstanding</th>
                        <th className="py-3 px-4 text-center">Credit Limit</th>
                        <th className="py-3 px-4 text-center">Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {AR_AGING_DATA.map((row) => (
                        <tr key={row.accountCode} className="hover:bg-blue-50/30 transition">
                          <td className="py-3 px-4 font-bold text-blue-900">{row.accountCode}</td>
                          <td className="py-3 px-4 font-sans font-semibold text-slate-900">{row.customerName}</td>
                          <td className="py-3 px-4 text-right font-medium">{row.current}</td>
                          <td className="py-3 px-4 text-right text-amber-600">{row.days30}</td>
                          <td className="py-3 px-4 text-right text-rose-600">{row.days60}</td>
                          <td className="py-3 px-4 text-right text-rose-700 font-bold">{row.days90Plus}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">{row.totalDebt}</td>
                          <td className="py-3 px-4 text-center text-slate-600">{row.limit}</td>
                          <td className="py-3 px-4 text-center font-sans">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.risk === 'LOW'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : row.risk === 'MEDIUM'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {row.risk}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </ReportTableWrapper>
          )}

          {/* C. BALANCE SHEET VIEW */}
          {!isSharedReport(selectedReport) && isBalanceSheetView && (
            <UnifiedPrintableReportSheet
              reportTitle="Balance Sheet Statement"
              reportCode="REP_ACC_002"
              executionDate="29-Aug-2026"
              periodText="As of: 29-Aug-2026 (Fiscal Q3 Close)"
              pageInfo="Page 1 of 1"
              branchInfo={`Branch: ${branch} (Southern Olive Oil Products S.A.R.L)`}
              hideToolbar={true}
            >
              <table className="w-full text-left border-collapse text-[11px] table-fixed">
                <thead>
                  <tr className="border-b-2 border-slate-900 font-bold text-black leading-tight bg-slate-50">
                    <th className="py-2 px-2 normal-case font-sans w-[50%]">Asset / Liability / Equity Heading</th>
                    <th className="py-2 px-2 normal-case font-sans w-[20%] text-center">Account Group</th>
                    <th className="py-2 px-2 normal-case font-sans w-[15%] text-right">Subtotal ($)</th>
                    <th className="py-2 px-2 normal-case font-sans w-[15%] text-right">Total Net ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
                  <tr className="bg-slate-100/70 font-bold">
                    <td colSpan={4} className="py-1.5 px-2 text-[#1a629b] uppercase text-[11px]">1. Current Assets</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 pl-4 text-slate-800">Cash in Vault &amp; BLOM Bank Commercial Checking</td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-500">1110</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-700">$184,200.00</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 pl-4 text-slate-800">Accounts Receivable (Customer Ledger Balance)</td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-500">1120</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-700">$24,510.00</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 pl-4 text-slate-800">Finished Goods &amp; Bulk Olive Oil Inventory</td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-500">1130</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-700">$340,000.00</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">$548,710.00</td>
                  </tr>
                  <tr className="bg-slate-100/70 font-bold">
                    <td colSpan={4} className="py-1.5 px-2 text-[#1a629b] uppercase text-[11px]">2. Property, Plant &amp; Equipment (PPE)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 pl-4 text-slate-800">Choueifat Pressing Facility &amp; Machinery (Net of Depr)</td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-500">1210</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-700">$780,000.00</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 pl-4 text-slate-800">SuperSonic Delivery Vans &amp; Fleet Vehicles</td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-500">1220</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-700">$95,000.00</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">$875,000.00</td>
                  </tr>
                  <tr className="border-t-2 border-slate-800 font-bold bg-blue-50/60">
                    <td colSpan={3} className="py-2 px-2 uppercase text-[11px]">Total Enterprise Assets:</td>
                    <td className="py-2 px-2 text-right font-mono font-black text-blue-900 text-[12px]">$1,423,710.00</td>
                  </tr>
                  <tr className="bg-slate-100/70 font-bold">
                    <td colSpan={4} className="py-1.5 px-2 text-[#7a1c1c] uppercase text-[11px]">3. Current Liabilities &amp; Payables</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 pl-4 text-slate-800">Trade Accounts Payable (Supplier Ledger)</td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-500">2110</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-700">$64,200.00</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 pl-4 text-slate-800">Accrued Payroll &amp; Biometric Wages Due</td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-500">2120</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-700">$18,400.00</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-rose-800">$82,600.00</td>
                  </tr>
                  <tr className="bg-slate-100/70 font-bold">
                    <td colSpan={4} className="py-1.5 px-2 text-emerald-800 uppercase text-[11px]">4. Shareholders' Equity</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 pl-4 text-slate-800">Paid-up Share Capital &amp; Retained Earnings</td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-500">3110</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-700">$1,254,375.00</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 pl-4 text-slate-800">Current Period Net Profit (P&amp;L)</td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-500">3210</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-700">$86,735.00</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-800">$1,341,110.00</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-bold bg-slate-100 text-[12px]">
                    <td colSpan={3} className="py-2.5 px-2 font-sans uppercase">Total Liabilities &amp; Equity:</td>
                    <td className="py-2.5 px-2 text-right font-mono font-black text-blue-900 text-[13px]">$1,423,710.00</td>
                  </tr>
                </tfoot>
              </table>
            </UnifiedPrintableReportSheet>
          )}

          {/* D. TRIAL BALANCE, GENERAL LEDGER & CASH FLOW */}
          {!isSharedReport(selectedReport) && isTrialBalanceOrLedger && (
            <UnifiedPrintableReportSheet
              reportTitle={selectedReport}
              reportCode={activeMeta.code}
              executionDate="29-Aug-2026"
              periodText={`${selectedReport} Run: 29-Aug-2026 (${period})`}
              pageInfo="Page 1 of 1"
              branchInfo={`Branch: ${branch} (General Ledger Audit)`}
              hideToolbar={true}
            >
              <table className="w-full text-left border-collapse text-[11px] table-fixed">
                <thead>
                  <tr className="border-b-2 border-slate-900 font-bold text-black leading-tight bg-slate-50">
                    <th className="py-2 px-2 normal-case font-sans w-[20%] text-center">Account #</th>
                    <th className="py-2 px-2 normal-case font-sans w-[45%]">Account Title</th>
                    <th className="py-2 px-2 normal-case font-sans w-[17.5%] text-right">Debit Balance ($)</th>
                    <th className="py-2 px-2 normal-case font-sans w-[17.5%] text-right">Credit Balance ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
                  <tr className="hover:bg-slate-50">
                    <td className="py-1.5 px-2 text-center font-mono text-slate-700">1110-01</td>
                    <td className="py-1.5 px-2 font-bold text-slate-900">BLOM Bank Corporate Account</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-blue-900">$142,200.00</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-1.5 px-2 text-center font-mono text-slate-700">1110-02</td>
                    <td className="py-1.5 px-2 font-bold text-slate-900">Cash Vault Physical Drawer</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-blue-900">$42,000.00</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-1.5 px-2 text-center font-mono text-slate-700">1120-00</td>
                    <td className="py-1.5 px-2 font-bold text-slate-900">Accounts Receivable Control</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-blue-900">$24,510.00</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-1.5 px-2 text-center font-mono text-slate-700">2110-00</td>
                    <td className="py-1.5 px-2 font-bold text-slate-900">Accounts Payable Control</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-rose-800">$64,200.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-1.5 px-2 text-center font-mono text-slate-700">4110-00</td>
                    <td className="py-1.5 px-2 font-bold text-slate-900">Commercial Olive Oil Sales</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-800">$420,000.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-1.5 px-2 text-center font-mono text-slate-700">5110-00</td>
                    <td className="py-1.5 px-2 font-bold text-slate-900">Cost of Goods Sold (COGS)</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-blue-900">$243,000.00</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-1.5 px-2 text-center font-mono text-slate-700">6110-00</td>
                    <td className="py-1.5 px-2 font-bold text-slate-900">Operating Expenses (OPEX)</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-blue-900">$65,000.00</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-1.5 px-2 text-center font-mono text-slate-700">3110-00</td>
                    <td className="py-1.5 px-2 font-bold text-slate-900">Shareholders Equity &amp; Retained</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">$32,510.00</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-bold bg-slate-100 text-[12px]">
                    <td colSpan={2} className="py-2.5 px-2 font-sans uppercase">Balanced Verification (Debits = Credits):</td>
                    <td className="py-2.5 px-2 text-right font-mono font-black text-blue-900 text-[13px]">$516,710.00</td>
                    <td className="py-2.5 px-2 text-right font-mono font-black text-emerald-800 text-[13px]">$516,710.00</td>
                  </tr>
                </tfoot>
              </table>
            </UnifiedPrintableReportSheet>
          )}

          {/* E. TRANSACTION DETAILS & STATEMENT OF ACCOUNT */}
          {!isSharedReport(selectedReport) && isJournalOrStatementView && (
            <ReportTableWrapper
              title={`${selectedReport} Register`}
              subtitle={`Ledger transaction audit journal for ${branch} • Chronological debit/credit postings`}
              totalRecordsCount={filteredJournals.length}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Journal Voucher #</th>
                      <th className="py-3 px-4">Posting Date</th>
                      <th className="py-3 px-4">Account Code</th>
                      <th className="py-3 px-4">Account Name</th>
                      <th className="py-3 px-4">Transaction Reference / Description</th>
                      <th className="py-3 px-4 text-right">Debit ($)</th>
                      <th className="py-3 px-4 text-right">Credit ($)</th>
                      <th className="py-3 px-4 text-right">Account Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {filteredJournals.map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/30 transition">
                        <td className="py-3 px-4 font-bold text-blue-900">{row.jrnId}</td>
                        <td className="py-3 px-4 font-sans text-slate-600">{row.date}</td>
                        <td className="py-3 px-4 text-slate-700">{row.accountCode}</td>
                        <td className="py-3 px-4 font-sans font-semibold text-slate-900">{row.accountName}</td>
                        <td className="py-3 px-4 font-sans text-slate-700">{row.desc}</td>
                        <td className="py-3 px-4 text-right font-bold text-blue-900">{row.debit}</td>
                        <td className="py-3 px-4 text-right font-bold text-rose-800">{row.credit}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">{row.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportTableWrapper>
          )}

          {/* F. PAYMENT REPORTS & RECEIPTS REPORTS */}
          {!isSharedReport(selectedReport) && isPaymentReceiptsView && (
            <ReportTableWrapper
              title={`${selectedReport} Register`}
              subtitle={`Audited cash, banking, and customer remittance transaction records for ${branch}`}
              totalRecordsCount={filteredPayments.length}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Voucher #</th>
                      <th className="py-3 px-4">Execution Date</th>
                      <th className="py-3 px-4">Payee / Payer Entity</th>
                      <th className="py-3 px-4 text-center">Tender Method</th>
                      <th className="py-3 px-4">Instrument / Ref #</th>
                      <th className="py-3 px-4 text-right">Amount ($)</th>
                      <th className="py-3 px-4 text-center">Clearing Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {filteredPayments.map((row) => (
                      <tr key={row.voucher} className="hover:bg-blue-50/30 transition">
                        <td className="py-3 px-4 font-bold text-blue-900">{row.voucher}</td>
                        <td className="py-3 px-4 font-sans text-slate-600">{row.date}</td>
                        <td className="py-3 px-4 font-sans font-semibold text-slate-900">{row.entity}</td>
                        <td className="py-3 px-4 text-center font-sans">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {row.method}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{row.ref}</td>
                        <td className={`py-3 px-4 text-right font-bold ${row.type === 'RECEIPT' ? 'text-emerald-700' : 'text-slate-900'}`}>
                          {row.amount}
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportTableWrapper>
          )}

          {/* G. CHART OF ACCOUNTS */}
          {!isSharedReport(selectedReport) && isChartOfAccountsView && (
            <ReportTableWrapper
              title="Standard Chart of Accounts (COA)"
              subtitle="Full master ledger classification, normal account balances, and currencies"
              totalRecordsCount={filteredCOA.length}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Account Code</th>
                      <th className="py-3 px-4">Account Name &amp; Description</th>
                      <th className="py-3 px-4">Account Classification</th>
                      <th className="py-3 px-4 text-center">Currency</th>
                      <th className="py-3 px-4 text-center">Normal Balance</th>
                      <th className="py-3 px-4 text-right">Current Balance</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {filteredCOA.map((row) => (
                      <tr key={row.code} className="hover:bg-blue-50/30 transition">
                        <td className="py-3 px-4 font-bold text-blue-900">{row.code}</td>
                        <td className="py-3 px-4 font-sans font-semibold text-slate-900">{row.name}</td>
                        <td className="py-3 px-4 font-sans text-slate-700">{row.type}</td>
                        <td className="py-3 px-4 text-center font-sans text-slate-600">{row.currency}</td>
                        <td className="py-3 px-4 text-center font-sans font-medium text-slate-800">{row.normal}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">{row.balance}</td>
                        <td className="py-3 px-4 text-center font-sans">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportTableWrapper>
          )}

          {/* H. BUDGET OVERVIEW */}
          {!isSharedReport(selectedReport) && isBudgetOverviewView && (
            <ReportTableWrapper
              title="Operational Budget vs Actual Overview"
              subtitle="Fiscal year budget adherence, department variance analysis, and performance tracking"
              totalRecordsCount={filteredBudget.length}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Cost Center Code</th>
                      <th className="py-3 px-4">Line Item / Expense Category</th>
                      <th className="py-3 px-4 text-right">Annual Budget ($)</th>
                      <th className="py-3 px-4 text-right">YTD Actual ($)</th>
                      <th className="py-3 px-4 text-right">Variance ($)</th>
                      <th className="py-3 px-4 text-right">Variance (%)</th>
                      <th className="py-3 px-4 text-center">Adherence Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {filteredBudget.map((row) => (
                      <tr key={row.code} className="hover:bg-blue-50/30 transition">
                        <td className="py-3 px-4 font-bold text-blue-900">{row.code}</td>
                        <td className="py-3 px-4 font-sans font-semibold text-slate-900">{row.name}</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-700">{row.annualBudget}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">{row.ytdActual}</td>
                        <td className={`py-3 px-4 text-right font-bold ${row.varianceUsd.startsWith('+') ? 'text-emerald-700' : 'text-slate-600'}`}>
                          {row.varianceUsd}
                        </td>
                        <td className={`py-3 px-4 text-right font-bold ${row.variancePct.startsWith('+') ? 'text-emerald-700' : 'text-slate-600'}`}>
                          {row.variancePct}
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.status === 'ON_TRACK' || row.status === 'FAVORABLE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportTableWrapper>
          )}

          {/* I. TAX REPORT (VAT PERIOD CLOSING) */}
          {!isSharedReport(selectedReport) && isTaxReportView && (
            <UnifiedPrintableReportSheet
              reportTitle="Tax & VAT Period Closing Statement"
              reportCode="REP_ACC_009"
              executionDate="29-Aug-2026"
              periodText={`Fiscal Period: Q3 2026 (${period})`}
              pageInfo="Page 1 of 1"
              branchInfo={`Branch: ${branch} (Ministry of Finance Form 1-B)`}
              hideToolbar={true}
            >
              <table className="w-full text-left border-collapse text-[11px] table-fixed">
                <thead>
                  <tr className="border-b-2 border-slate-900 font-bold text-black leading-tight bg-slate-50">
                    <th className="py-2 px-2 normal-case font-sans w-[50%]">Tax Classification &amp; Description</th>
                    <th className="py-2 px-2 normal-case font-sans w-[15%] text-center">Tax Rate</th>
                    <th className="py-2 px-2 normal-case font-sans w-[17.5%] text-right">Taxable Base ($)</th>
                    <th className="py-2 px-2 normal-case font-sans w-[17.5%] text-right">Tax Amount ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
                  <tr className="bg-slate-100/70 font-bold">
                    <td colSpan={4} className="py-1.5 px-2 text-[#1a629b] uppercase text-[11px]">1. Output VAT (Commercial Sales)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 pl-4 text-slate-800">Standard Rate Commercial Goods (11% VAT)</td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-600">11.0%</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-700">$380,000.00</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-800">$41,800.00</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 pl-4 text-slate-800">Direct Agricultural &amp; Crop Exports (Exempt / 0%)</td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-600">0.0%</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-700">$40,000.00</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-400">$0.00</td>
                  </tr>
                  <tr className="border-t border-slate-300 font-bold bg-slate-50">
                    <td colSpan={3} className="py-1.5 px-2 pl-4 text-slate-900">Total Output VAT Collected:</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-900">$41,800.00</td>
                  </tr>
                  <tr className="bg-slate-100/70 font-bold">
                    <td colSpan={4} className="py-1.5 px-2 text-[#7a1c1c] uppercase text-[11px]">2. Input VAT Deductions (Purchases &amp; Expenses)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 pl-4 text-slate-800">Packaging Materials, Glass &amp; Tin Purchases</td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-600">11.0%</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-700">$33,000.00</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-rose-700">($3,630.00)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 pl-4 text-slate-800">Operational Consumables &amp; Press Maintenance Utilities</td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-600">11.0%</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-700">$18,000.00</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-rose-700">($1,980.00)</td>
                  </tr>
                  <tr className="border-t border-slate-300 font-bold bg-slate-50">
                    <td colSpan={3} className="py-1.5 px-2 pl-4 text-slate-900">Total Input VAT Deductible:</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-rose-800">($5,610.00)</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-bold bg-slate-100 text-[12px]">
                    <td colSpan={3} className="py-2.5 px-2 font-sans uppercase">
                      Net VAT Payable to Lebanese MoF (Quarter Q3):
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-black text-blue-900 text-[13px]">
                      $36,190.00
                    </td>
                  </tr>
                </tfoot>
              </table>
            </UnifiedPrintableReportSheet>
          )}

          {/* J. DEFAULT VIEW: STATEMENT OF PROFIT & LOSS (INCOME STATEMENT) */}
          {!isSharedReport(selectedReport) &&
            !isArApView &&
            !isBalanceSheetView &&
            !isTrialBalanceOrLedger &&
            !isJournalOrStatementView &&
            !isPaymentReceiptsView &&
            !isChartOfAccountsView &&
            !isBudgetOverviewView &&
            !isTaxReportView && (
              <UnifiedPrintableReportSheet
                reportTitle={selectedReport}
                reportCode={activeMeta.code}
                executionDate="29-Aug-2026"
                periodText={`Fiscal Quarter: Q3 2026 (${period})`}
                pageInfo="Page 1 of 1"
                branchInfo={`Branch: ${branch} (Southern Olive Oil Products S.A.R.L)`}
                hideToolbar={true}
              >
                <table className="w-full text-left border-collapse text-[11px] table-fixed">
                  <thead>
                    <tr className="border-b-2 border-slate-900 font-bold text-black leading-tight bg-slate-50">
                      <th className="py-2 px-2 normal-case font-sans w-[50%]">Account Description &amp; Line Item</th>
                      <th className="py-2 px-2 normal-case font-sans w-[20%] text-center">Account Code</th>
                      <th className="py-2 px-2 normal-case font-sans w-[15%] text-right">Debit ($)</th>
                      <th className="py-2 px-2 normal-case font-sans w-[15%] text-right">Credit / Net ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
                    {(accountClassFilter === 'ALL' || accountClassFilter === 'REVENUE') && (
                      <>
                        <tr className="bg-slate-100/70 font-bold">
                          <td colSpan={4} className="py-1.5 px-2 text-[#1a629b] uppercase text-[11px]">1. Operating Revenues</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 pl-4 text-slate-800 font-bold">Commercial Olive Oil Bottle Sales (500ml / 1L / 4L)</td>
                          <td className="py-1.5 px-2 text-center font-mono text-slate-500">4110-01</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-800">$294,000.00</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 pl-4 text-slate-800 font-bold">Bulk Tanker Lot Transfers &amp; Wholesale Contracts</td>
                          <td className="py-1.5 px-2 text-center font-mono text-slate-500">4110-02</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-800">$126,000.00</td>
                        </tr>
                        <tr className="border-t border-slate-300 font-bold bg-slate-50/70">
                          <td colSpan={3} className="py-1 px-2 pl-4 text-slate-700">Gross Operating Revenue:</td>
                          <td className="py-1 px-2 text-right font-mono text-emerald-900 font-black">$420,000.00</td>
                        </tr>
                      </>
                    )}
                    {(accountClassFilter === 'ALL' || accountClassFilter === 'COGS') && (
                      <>
                        <tr className="bg-slate-100/70 font-bold">
                          <td colSpan={4} className="py-1.5 px-2 text-[#7a1c1c] uppercase text-[11px]">2. Cost of Goods Sold (COGS)</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 pl-4 text-slate-800 font-bold">Raw Olive Crop Intake &amp; Grower Procurement</td>
                          <td className="py-1.5 px-2 text-center font-mono text-slate-500">5110-01</td>
                          <td className="py-1.5 px-2 text-right font-mono text-rose-700 font-bold">($168,000.00)</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 pl-4 text-slate-800 font-bold">Direct Pressing Utilities, Power &amp; Milling Consumables</td>
                          <td className="py-1.5 px-2 text-center font-mono text-slate-500">5120-01</td>
                          <td className="py-1.5 px-2 text-right font-mono text-rose-700 font-bold">($42,000.00)</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 pl-4 text-slate-800 font-bold">Glass Bottles, Tinplate Gallons &amp; Foil Seals</td>
                          <td className="py-1.5 px-2 text-center font-mono text-slate-500">5130-01</td>
                          <td className="py-1.5 px-2 text-right font-mono text-rose-700 font-bold">($33,000.00)</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                        </tr>
                        <tr className="border-t border-slate-400 font-bold bg-slate-50">
                          <td colSpan={3} className="py-1.5 px-2 pl-4 text-slate-900">Total Cost of Goods Sold:</td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold text-rose-800">($243,000.00)</td>
                        </tr>
                        <tr className="border-t-2 border-slate-900 font-black bg-blue-50/80">
                          <td colSpan={3} className="py-2 px-2 text-blue-950 uppercase text-[11px]">Gross Margin (42.14%):</td>
                          <td className="py-2 px-2 text-right font-mono text-blue-900 text-[12px] font-black">$177,000.00</td>
                        </tr>
                      </>
                    )}
                    {(accountClassFilter === 'ALL' || accountClassFilter === 'OPEX') && (
                      <>
                        <tr className="bg-slate-100/70 font-bold">
                          <td colSpan={4} className="py-1.5 px-2 text-slate-800 uppercase text-[11px]">3. Operating &amp; General Administrative Expenses (OPEX)</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 pl-4 text-slate-800 font-bold">Operational Staff Salaries &amp; Production Wages</td>
                          <td className="py-1.5 px-2 text-center font-mono text-slate-500">6110-01</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-700">($36,000.00)</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 pl-4 text-slate-800 font-bold">SuperSonic Fleet Fuel, Maintenance &amp; Carrier Dispatch</td>
                          <td className="py-1.5 px-2 text-center font-mono text-slate-500">6120-01</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-700">($14,500.00)</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 pl-4 text-slate-800 font-bold">Facility Lease, Warehousing &amp; Silo Maintenance</td>
                          <td className="py-1.5 px-2 text-center font-mono text-slate-500">6130-01</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-700">($14,500.00)</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                        </tr>
                        <tr className="border-t border-slate-300 font-bold bg-slate-50/70">
                          <td colSpan={3} className="py-1 px-2 pl-4 text-slate-700">Total Operating Expenses:</td>
                          <td className="py-1 px-2 text-right font-mono text-slate-900 font-bold">($65,000.00)</td>
                        </tr>
                      </>
                    )}
                    {(accountClassFilter === 'ALL' || accountClassFilter === 'TAX') && (
                      <>
                        <tr className="border-t border-slate-400 font-bold bg-slate-50">
                          <td colSpan={3} className="py-1.5 px-2 pl-4 text-slate-900">Net Operating Income (EBITDA):</td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">$112,000.00</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 pl-4 text-slate-700">Depreciation &amp; Asset Amortization</td>
                          <td className="py-1.5 px-2 text-center font-mono text-slate-500">7110-01</td>
                          <td className="py-1.5 px-2 text-right font-mono text-rose-700">($7,500.00)</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 pl-4 text-slate-700">Income Tax Provision (17% Corporate)</td>
                          <td className="py-1.5 px-2 text-center font-mono text-slate-500">8110-01</td>
                          <td className="py-1.5 px-2 text-right font-mono text-rose-700">($17,765.00)</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-900 font-bold bg-slate-100 text-[12px]">
                      <td colSpan={3} className="py-2.5 px-2 font-sans uppercase">
                        Net Profit After Tax (LBP 7,762,782,500 @ 89,500 rate):
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-black text-emerald-800 text-[13px]">
                        $86,735.00
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </UnifiedPrintableReportSheet>
            )}
        </div>
      }
    />
  );
}

export default function AccountingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Accounting Reports Hub...</div>}>
      <AccountingReportsContent />
    </Suspense>
  );
}
