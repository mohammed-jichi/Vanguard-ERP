'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import UnifiedModuleReportsHub, { ReportCategory } from '@/components/reports/UnifiedModuleReportsHub';
import UnifiedPrintableReportSheet from '@/components/reports/UnifiedPrintableReportSheet';
import { CustomerListStandardTemplate } from '@/components/reports/sales/CustomerListStandardTemplate';
import UnifiedCustomerManagementConsole from '@/components/modules/customers/UnifiedCustomerManagementConsole';

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

function CustomersPageContent() {
  const { t, dir } = useLanguage();
  const searchParams = useSearchParams();
  const section = searchParams.get('section');
  const [activeTab, setActiveTab] = useState<'directory' | 'report'>('directory');
  const [selectedReport, setSelectedReport] = useState<string>(
    'Customer List Standard & AR Aging Summary'
  );
  const [period, setPeriod] = useState<string>('This Month');
  const [branch, setBranch] = useState<string>('Main Branch');
  const [groupFilter, setGroupFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  return (
    <div dir={dir} className="p-4 md:p-6 space-y-4 font-sans bg-background min-h-screen text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('customer_management_ar_header', '4. Customer Management & AR (Accounts Receivable)')}</h1>
          <p className="text-xs text-muted-foreground font-medium">{t('customer_management_ar_sub', 'Master customers directory, enterprise KYC onboarding, and accounts receivable reconciliation')}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'directory' ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-card border border-border text-foreground hover:bg-muted/50'
            }`}
          >
            {t('management_console', 'Management Console')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'report' ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-card border border-border text-foreground hover:bg-muted/50'
            }`}
          >
            <span>{t('standard_report_sheet', 'Standard Report Sheet')}</span>
            <span className="text-[9.5px] bg-primary/10 text-primary border border-border px-1.5 py-0.5 rounded font-bold">REP_CRM_001</span>
          </button>
        </div>
      </div>

      {activeTab === 'directory' ? (
        <UnifiedCustomerManagementConsole />
      ) : (
        <div className="space-y-4">
          <UnifiedModuleReportsHub
            moduleTitle={t('customer_mgmt_ar_reports', 'Customer Management & AR Reports')}
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
                  <option value="ALL">{t('all_customer_groups', 'All Customer Groups')}</option>
                  <option value="Wholesales">{t('wholesales_clients', 'Wholesales / Clients')}</option>
                  <option value="Key Accounts">{t('key_commercial_accounts', 'Key Commercial Accounts')}</option>
                  <option value="Retail Outlets">{t('retail_outlets', 'Retail Outlets')}</option>
                </select>

                <select
                  className="border border-slate-400 rounded p-1.5 text-[13px] w-44 !text-black !font-bold !bg-white focus:outline-none focus:border-blue-600 shadow-xs cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">{t('all_account_statuses', 'All Account Statuses')}</option>
                  <option value="ACTIVE">{t('active_accounts', 'Active Accounts')}</option>
                  <option value="SUSPENDED">{t('suspended_risk_accounts', 'Suspended / Risk')}</option>
                </select>
              </>
            }
          >
            <UnifiedPrintableReportSheet
              reportCode="REP_CRM_001"
              reportTitle={selectedReport}
              topperTitle="Southern Olive Oil Products S.A.R.L - Choueifat"
              subtitle={t('sales_logistics_comm_dist', 'Sales, Logistics & Commercial Distribution')}
              periodText={period}
              branchInfo={branch}
            >
              <CustomerListStandardTemplate
                branch={branch}
                dynamicPeriodText={period}
              />
            </UnifiedPrintableReportSheet>
          </UnifiedModuleReportsHub>
        </div>
      )}
    </div>
  );
}

function Fallback() {
  const { t } = useLanguage();
  return <div className="p-8 text-center text-slate-400 font-semibold">{t('loading_customer_management', 'Loading Customer Management...')}</div>;
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <CustomersPageContent />
    </Suspense>
  );
}
