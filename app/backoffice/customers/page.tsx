'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import UnifiedModuleReportsHub, { ReportCategory } from '@/components/reports/UnifiedModuleReportsHub';
import UnifiedPrintableReportSheet from '@/components/reports/UnifiedPrintableReportSheet';
import { CustomerListStandardTemplate } from '@/components/reports/sales/CustomerListStandardTemplate';

const customerReportMenuData: ReportCategory[] = [
  {
    category: 'Customer Balances & AR',
    type: 'flat',
    items: [
      'Customer List Standard & AR Aging Summary',
      'Customer Credit Limit & Exposure Risk Statement',
      'Detailed Statement of Account (SOA)',
    ],
  },
  {
    category: 'Wholesale & Key Accounts',
    type: 'flat',
    items: [
      'Wholesale Distributors Volume & Turnover Report',
      'Key Commercial Accounts Ledger',
    ],
  },
  {
    category: 'Inactivity & Collections',
    type: 'flat',
    items: [
      'Dormant Accounts (>90 Days Inactive)',
      'Suspended & Blacklisted Debtors Audit',
    ],
  },
];

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState<'directory' | 'report'>('report');
  const [selectedReport, setSelectedReport] = useState<string>(
    'Customer List Standard & AR Aging Summary'
  );
  const [period, setPeriod] = useState<string>('This Month');
  const [branch, setBranch] = useState<string>('Main Branch');
  const [groupFilter, setGroupFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  return (
    <div className="p-4 md:p-6 space-y-4 font-sans bg-[#f4f6f9] min-h-screen text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900">3. Customer Management &amp; AR (Accounts Receivable)</h1>
          <p className="text-xs text-slate-600 font-medium">Master customers directory, enterprise KYC onboarding, and accounts receivable reconciliation</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'directory' ? 'bg-[#334155] text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Directory View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'report' ? 'bg-[#334155] text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Standard Report Sheet</span>
            <span className="text-[9.5px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-bold">REP_CRM_001</span>
          </button>
        </div>
      </div>

      {activeTab === 'directory' ? (
        <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-500 shadow-sm">
          <span className="text-3xl block mb-2">👥</span>
          <h2 className="text-sm font-bold text-slate-800">Customer &amp; Wholesale Directory</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">Manage customer credit terms and invoicing</p>
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className="px-4 py-2 bg-[#334155] hover:bg-[#1e293b] text-white font-medium text-xs rounded-md shadow-xs cursor-pointer"
          >
            View REP_CRM_001 Standard Printable Report Sheet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <UnifiedModuleReportsHub
            moduleTitle="Customer Management & AR Reports"
            reportMenuData={customerReportMenuData}
            selectedReport={selectedReport}
            onSelectReport={(r) => setSelectedReport(r)}
            period={period}
            setPeriod={setPeriod}
            branch={branch}
            setBranch={setBranch}
            filterControls={
              <>
                <select
                  className="border border-slate-400 rounded p-1.5 text-[13px] w-48 !text-black !font-bold !bg-white focus:outline-none focus:border-blue-600 shadow-xs cursor-pointer"
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                >
                  <option value="ALL">All Customer Groups</option>
                  <option value="Wholesales">Wholesales / Clients</option>
                  <option value="Key Accounts">Key Commercial Accounts</option>
                  <option value="Retail Outlets">Retail Outlets</option>
                </select>

                <select
                  className="border border-slate-400 rounded p-1.5 text-[13px] w-44 !text-black !font-bold !bg-white focus:outline-none focus:border-blue-600 shadow-xs cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Account Statuses</option>
                  <option value="Active">Active Accounts Only</option>
                  <option value="New">New Registrations</option>
                  <option value="Blacklist">Blacklist / Suspended</option>
                </select>
              </>
            }
          >
            {/* Standard AR Report */}
            {(!selectedReport || selectedReport.includes('Standard') || selectedReport.includes('Aging') || selectedReport.includes('Dormant') || selectedReport.includes('Blacklist')) && (
              <CustomerListStandardTemplate
                hideToolbar={true}
                reportTitle={selectedReport || "Customer List Standard & AR Aging Summary"}
                executionDate="29-Aug-2026"
                dynamicPeriodText="Grouping: Wholesales / Clients / Key Accounts"
              />
            )}

            {/* Credit Limit & Risk Report */}
            {selectedReport.includes('Credit') && (
              <UnifiedPrintableReportSheet
                reportTitle="Customer Credit Limit & Exposure Risk Statement"
                reportCode="REP_CRM_002"
                executionDate="29-Aug-2026"
                periodText="Credit Audit Cycle: August 2026"
                pageInfo="Page 1 of 1"
                branchInfo="Branch: Credit Risk & Compliance Division"
                hideToolbar={true}
              >
                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b-2 border-slate-900 font-bold text-black leading-tight bg-slate-50">
                      <th className="py-2 px-2 normal-case w-[24%] font-sans">Customer / Entity</th>
                      <th className="py-2 px-2 normal-case w-[14%] font-sans text-center">Risk Grade</th>
                      <th className="py-2 px-2 normal-case w-[16%] font-sans text-right">Credit Limit ($)</th>
                      <th className="py-2 px-2 normal-case w-[16%] font-sans text-right">Current AR ($)</th>
                      <th className="py-2 px-2 normal-case w-[15%] font-sans text-right">Available ($)</th>
                      <th className="py-2 px-2 normal-case w-[15%] font-sans text-center">Exposure Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-bold text-slate-900 font-sans">Al-Baraka Supermarket S.A.R.L</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-emerald-800">CLASS A (Low)</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-800">$25,000.00</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-blue-900">$8,240.00</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-emerald-800">$16,760.00</td>
                      <td className="py-2 px-2 text-center"><span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-800">NORMAL (33%)</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-bold text-slate-900 font-sans">Karem Assaf Grocery</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-blue-800">CLASS B (Med)</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-800">$5,000.00</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-amber-900">$3,820.00</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-amber-800">$1,180.00</td>
                      <td className="py-2 px-2 text-center"><span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 text-amber-900">WARNING (76%)</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-bold text-slate-900 font-sans">Ziad Al-Rifai Trading</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-red-800">CLASS D (Default)</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-800">$10,000.00</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-red-900">$12,450.00</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-red-800">-$2,450.00</td>
                      <td className="py-2 px-2 text-center"><span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-red-100 text-red-900">BREACH (124%)</span></td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-900 font-bold bg-slate-50 text-[11px]">
                      <td colSpan={2} className="py-2 px-2 text-center font-sans">Total Authorized Exposure:</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">$40,000.00</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-blue-900">$24,510.00</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-emerald-800">$15,490.00</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-slate-800">61.2% Utilized</td>
                    </tr>
                  </tfoot>
                </table>
              </UnifiedPrintableReportSheet>
            )}

            {/* Statement of Account (SOA) */}
            {(selectedReport.includes('Statement of Account') || selectedReport.includes('Ledger') || selectedReport.includes('Turnover')) && (
              <UnifiedPrintableReportSheet
                reportTitle={selectedReport}
                reportCode="REP_CRM_003"
                executionDate="29-Aug-2026"
                periodText="Statement Period: 01-Aug-2026 to 29-Aug-2026"
                pageInfo="Page 1 of 1"
                branchInfo="Branch: Wholesale & Key Commercial Accounts Ledger"
                hideToolbar={true}
              >
                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b-2 border-slate-900 font-bold text-black leading-tight bg-slate-50">
                      <th className="py-2 px-2 normal-case w-[14%] font-sans">Date</th>
                      <th className="py-2 px-2 normal-case w-[14%] font-sans">Reference #</th>
                      <th className="py-2 px-2 normal-case w-[28%] font-sans">Transaction Description</th>
                      <th className="py-2 px-2 normal-case w-[14%] font-sans text-right">Debit ($)</th>
                      <th className="py-2 px-2 normal-case w-[14%] font-sans text-right">Credit ($)</th>
                      <th className="py-2 px-2 normal-case w-[16%] font-sans text-right">Running Balance ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
                    <tr className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 font-mono text-slate-600">01-Aug-2026</td>
                      <td className="py-1.5 px-2 font-mono text-slate-600">OP-BAL</td>
                      <td className="py-1.5 px-2 text-slate-800 font-sans">Opening Fiscal Balance Forward</td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">$5,400.00</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 font-mono text-slate-600">08-Aug-2026</td>
                      <td className="py-1.5 px-2 font-mono font-bold text-blue-900">INV-2026-0814</td>
                      <td className="py-1.5 px-2 text-slate-800 font-sans">Delivery: 50 Tins (17.5L) Extra Virgin Olive Oil</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">$5,500.00</td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">$10,900.00</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 font-mono text-slate-600">18-Aug-2026</td>
                      <td className="py-1.5 px-2 font-mono font-bold text-emerald-900">RCT-WHISH-990</td>
                      <td className="py-1.5 px-2 text-slate-800 font-sans">Payment via Whish Digital Transfer (Ref: W-99021)</td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-400">-</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-800">$2,660.00</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-blue-900">$8,240.00</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-900 font-bold bg-slate-50 text-[11px]">
                      <td colSpan={3} className="py-2 px-2 text-center font-sans">Current Closing Balance Due:</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">$5,500.00</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-emerald-800">$2,660.00</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-blue-900">$8,240.00</td>
                    </tr>
                  </tfoot>
                </table>
              </UnifiedPrintableReportSheet>
            )}
          </UnifiedModuleReportsHub>
        </div>
      )}
    </div>
  );
}
