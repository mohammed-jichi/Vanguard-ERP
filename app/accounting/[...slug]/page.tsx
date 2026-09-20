'use client';

/**
 * Vanguard ERP - Accounting Dynamic Section Router
 * Handles arbitrary sub-routes like:
 * - /accounting/actions/journal-voucher
 * - /accounting/actions/purchase
 * - /accounting/actions/payments
 * - /accounting/actions/receipts
 * - /accounting/setup/auxiliaries/classes
 * - /accounting/setup/auxiliaries/header-1
 * - /accounting/setup/currencies
 * - /accounting/reports/income-statement
 */

import React, { useMemo, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import AccountingDashboardPage from '../page';
import AccountingActionsPage from '../actions/page';
import AccountingReportsPage from '../reports/page';
import AccountingSetupPage from '../setup/page';
import StandardUnderDevelopmentPlaceholder from '@/components/StandardUnderDevelopmentPlaceholder';

function DynamicAccountingRouterContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  // Extract slug array e.g. ['actions', 'purchase']
  const slug = useMemo(() => {
    const raw = params?.slug;
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
  }, [params]);

  const querySection = searchParams.get('section')?.toLowerCase();

  const activeSection = useMemo(() => {
    if (querySection) return querySection;

    const fullPath = slug.join('/').toLowerCase();
    const lastSegment = slug[slug.length - 1]?.toLowerCase() || '';

    if (fullPath.includes('purchase')) return 'purchase';
    if (fullPath.includes('payment')) return 'payments';
    if (fullPath.includes('receipt')) return 'receipts';
    if (fullPath.includes('journal') || fullPath.includes('jv')) return 'jv';
    if (fullPath.includes('receivable') || fullPath.includes('ar')) return 'ar';
    if (fullPath.includes('payable') || fullPath.includes('ap')) return 'ap';
    if (fullPath.includes('recon')) return 'bank_recon';
    if (fullPath.includes('vat')) return 'vat_closing';

    if (fullPath.includes('classes')) return 'aux_classes';
    if (fullPath.includes('header-1') || fullPath.includes('header1')) return 'aux_header1';
    if (fullPath.includes('header-2') || fullPath.includes('header2')) return 'aux_header2';
    if (fullPath.includes('header-3') || fullPath.includes('header3')) return 'aux_header3';
    if (fullPath.includes('group')) return 'aux_group';
    if (fullPath.includes('jv-desc') || fullPath.includes('description')) return 'aux_jv_desc';
    if (fullPath.includes('jv-type')) return 'aux_jv_types';
    if (fullPath.includes('currency') || fullPath.includes('rates')) return 'aux_currency';
    if (fullPath.includes('department') || fullPath.includes('dept')) return 'department';
    if (fullPath.includes('cash-flow')) return 'cash_flow_setup';
    if (fullPath.includes('account') || fullPath.includes('coa')) return 'accounts';

    if (fullPath.includes('report')) return 'reports';
    if (fullPath.includes('action')) return 'jv';
    if (fullPath.includes('setup')) return 'accounts';

    return lastSegment || 'dashboard';
  }, [slug, querySection]);

  return (
    <div key={activeSection} className="w-full">
      {/* 1. DASHBOARD */}
      {activeSection === 'dashboard' && <AccountingDashboardPage />}

      {/* 2. REPORTS */}
      {activeSection === 'reports' && <AccountingReportsPage />}

      {/* 3. ACTIONS */}
      {activeSection === 'jv' && <AccountingActionsPage initialTab="JV" />}
      {activeSection === 'purchase' && <AccountingActionsPage initialTab="PURCHASE" />}
      {activeSection === 'payments' && <AccountingActionsPage initialTab="PAYMENT" />}
      {activeSection === 'receipts' && <AccountingActionsPage initialTab="RECEIPT" />}
      {activeSection === 'ar' && <AccountingActionsPage initialTab="AR" />}
      {activeSection === 'ap' && <AccountingActionsPage initialTab="AP" />}
      {activeSection === 'bank_recon' && <AccountingActionsPage initialTab="RECON" />}
      {activeSection === 'vat_closing' && <AccountingActionsPage initialTab="VAT" />}

      {/* 4. SETUP */}
      {activeSection === 'accounts' && <AccountingSetupPage initialTab="COA" />}
      {activeSection === 'aux_classes' && <AccountingSetupPage initialTab="AUX" initialAuxSubTab="CLASSES" />}
      {activeSection === 'aux_header1' && <AccountingSetupPage initialTab="AUX" initialAuxSubTab="H1" />}
      {activeSection === 'aux_header2' && <AccountingSetupPage initialTab="AUX" initialAuxSubTab="H2" />}
      {activeSection === 'aux_header3' && <AccountingSetupPage initialTab="AUX" initialAuxSubTab="H3" />}
      {activeSection === 'aux_group' && <AccountingSetupPage initialTab="AUX" initialAuxSubTab="H4" />}
      {['aux_jv_desc', 'aux_jv_types'].includes(activeSection) && <AccountingSetupPage initialTab="JV_SETUP" />}
      {['aux_currency', 'aux_currency_rates'].includes(activeSection) && <AccountingSetupPage initialTab="CURRENCIES" />}
      {['dept_groups', 'department', 'cash_flow_setup', 'sub_dept'].includes(activeSection) && <AccountingSetupPage initialTab="DEPTS" />}

      {/* 5. UNHANDLED / UNFINISHED ACCOUNTING SUB-SECTION */}
      {![
        'dashboard', 'reports', 'jv', 'purchase', 'payments', 'receipts', 'ar', 'ap',
        'bank_recon', 'vat_closing', 'accounts', 'aux_classes', 'aux_header1', 'aux_header2',
        'aux_header3', 'aux_group', 'aux_jv_desc', 'aux_jv_types', 'aux_currency',
        'aux_currency_rates', 'dept_groups', 'department', 'cash_flow_setup', 'sub_dept'
      ].includes(activeSection) && (
        <StandardUnderDevelopmentPlaceholder
          moduleTitle={`Accounting: ${activeSection}`}
          moduleCategory="FINANCIALS & ACCOUNTING"
          description={`The sub-view or workstation "${activeSection}" is currently being prepared for release. All general ledger balances and vouchers are accessible via the primary inquiry console.`}
          backUrl="/backoffice"
          backLabel="Back to Enterprise Hub"
        />
      )}
    </div>
  );
}

export default function DynamicAccountingRouterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground text-sm">Loading requested view...</div>}>
      <DynamicAccountingRouterContent />
    </Suspense>
  );
}
