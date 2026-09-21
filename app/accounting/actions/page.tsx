'use client';

/**
 * Vanguard ERP - Accounting Module Actions Console
 * Full 8-Module Omega ERP Blueprint:
 * 1. Module 1: Journal Vouchers (JV)
 * 2. Module 2: Accounting Purchase & Expenses
 * 3. Module 3: Accounting Payment (PV)
 * 4. Module 4: Accounting Receipt (RV)
 * 5. Module 5: Accounts Receivables (AR Aging & CRM Station)
 * 6. Module 6: Accounts Payables (AP Aging & Supplier Station)
 * 7. Module 7: Bank Reconciliation Workstation
 * 8. Module 8: VAT Closing & Chart of Accounts Hierarchy
 *
 * Strictly adheres to Vanguard's clean Light Enterprise Theme tokens:
 * bg-background, bg-card, border-border, text-foreground, text-muted-foreground, primary.
 */

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  getLocalJVs,
  saveLocalJVs,
  getLocalAccounts,
  saveLocalAccounts,
  INITIAL_JOURNAL_VOUCHERS,
  INITIAL_ACCOUNT_DETAILS,
  JournalVoucher,
  AccountDetail
} from '@/lib/accountingData';
import {
  apiFetchVouchers,
  apiFetchAccounts,
  apiSaveVoucher,
  subscribeToAccountingSync
} from '@/lib/accountingPersistenceService';

import dynamic from 'next/dynamic';

const ModuleSkeleton = ({ label }: { label: string }) => (
  <div className="p-8 border border-border/60 bg-card rounded-2xl flex flex-col items-center justify-center space-y-3 shadow-xs animate-pulse min-h-[300px]">
    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    <span className="text-xs font-semibold text-muted-foreground">Loading {label} Workstation...</span>
  </div>
);

// Modular 8 Workstations (Code-Split via next/dynamic for instant < 100ms INP)
const Module1JournalVouchers = dynamic(
  () => import('@/components/modules/accounting/Module1JournalVouchers').then((m) => m.Module1JournalVouchers),
  { loading: () => <ModuleSkeleton label="Journal Vouchers" /> }
);
const Module2PurchasesExpenses = dynamic(
  () => import('@/components/modules/accounting/Module2PurchasesExpenses').then((m) => m.Module2PurchasesExpenses),
  { loading: () => <ModuleSkeleton label="Purchases & Expenses" /> }
);
const Module3PaymentVouchers = dynamic(
  () => import('@/components/modules/accounting/Module3PaymentVouchers').then((m) => m.Module3PaymentVouchers),
  { loading: () => <ModuleSkeleton label="Payment Vouchers" /> }
);
const Module4ReceiptVouchers = dynamic(
  () => import('@/components/modules/accounting/Module4ReceiptVouchers').then((m) => m.Module4ReceiptVouchers),
  { loading: () => <ModuleSkeleton label="Receipt Vouchers" /> }
);
const Module5AccountsReceivables = dynamic(
  () => import('@/components/modules/accounting/Module5AccountsReceivables').then((m) => m.Module5AccountsReceivables),
  { loading: () => <ModuleSkeleton label="Accounts Receivables" /> }
);
const Module6AccountsPayables = dynamic(
  () => import('@/components/modules/accounting/Module6AccountsPayables').then((m) => m.Module6AccountsPayables),
  { loading: () => <ModuleSkeleton label="Accounts Payables" /> }
);
const Module7BankReconciliation = dynamic(
  () => import('@/components/modules/accounting/Module7BankReconciliation').then((m) => m.Module7BankReconciliation),
  { loading: () => <ModuleSkeleton label="Bank Reconciliation" /> }
);
const Module8VatClosing = dynamic(
  () => import('@/components/modules/accounting/Module8VatClosing').then((m) => m.Module8VatClosing),
  { loading: () => <ModuleSkeleton label="VAT Period Closing" /> }
);

export type AccountingActionTab =
  | 'JV'
  | 'PURCHASE'
  | 'PAYMENT'
  | 'RECEIPT'
  | 'AR'
  | 'AP'
  | 'RECON'
  | 'VAT';

export interface AccountingActionsPageProps {
  initialTab?: AccountingActionTab;
  initialScreenMode?: 'LIST' | 'ENTRY';
}

function AccountingActionsContent({ initialTab, initialScreenMode }: AccountingActionsPageProps) {
  const searchParams = useSearchParams();
  const rawParam = (
    searchParams.get('tab') ||
    searchParams.get('section') ||
    searchParams.get('module') ||
    ''
  ).toLowerCase();

  const resolveTab = (): AccountingActionTab => {
    if (initialTab) return initialTab;
    if (!rawParam) return 'JV';
    if (['purchase', 'expenses', 'expense', 'module2'].includes(rawParam)) return 'PURCHASE';
    if (['payments', 'payment', 'pv', 'module3'].includes(rawParam)) return 'PAYMENT';
    if (['receipts', 'receipt', 'rv', 'module4'].includes(rawParam)) return 'RECEIPT';
    if (['ar', 'accounts-receivables', 'receivables', 'module5'].includes(rawParam)) return 'AR';
    if (['ap', 'accounts-payables', 'payables', 'module6'].includes(rawParam)) return 'AP';
    if (['bank_recon', 'recon', 'bank-reconciliation', 'module7'].includes(rawParam)) return 'RECON';
    if (['vat_closing', 'vat', 'vat-period-closing', 'module8'].includes(rawParam)) return 'VAT';
    if (['jv', 'journal-voucher', 'journal_voucher', 'module1'].includes(rawParam)) return 'JV';
    return 'JV';
  };

  const [activeTab, setActiveTab] = useState<AccountingActionTab>(resolveTab);
  const [isTabPending, startTabTransition] = React.useTransition();

  useEffect(() => {
    startTabTransition(() => {
      if (initialTab) {
        setActiveTab(initialTab);
      } else if (rawParam) {
        setActiveTab(resolveTab());
      }
    });
  }, [rawParam, initialTab]);

  useEffect(() => {
    const modalParam = searchParams.get('modal') || searchParams.get('dialog');
    if (modalParam) {
      showToast(`Notice: Modal "${modalParam}" is staged for the upcoming sprint. Showing main inquiry list.`, false);
    }
  }, [searchParams]);

  // Master Data State (Deterministic initial state to prevent SSR/client hydration mismatch)
  const [jvs, setJvs] = useState<JournalVoucher[]>(INITIAL_JOURNAL_VOUCHERS);
  const [accounts, setAccounts] = useState<AccountDetail[]>(INITIAL_ACCOUNT_DETAILS);

  useEffect(() => {
    setJvs(getLocalJVs());
    setAccounts(getLocalAccounts());

    apiFetchVouchers().then((persistedJvs) => {
      if (persistedJvs && persistedJvs.length > 0) {
        setJvs(persistedJvs);
      }
    });

    apiFetchAccounts().then((persistedAccs) => {
      if (persistedAccs && persistedAccs.length > 0) {
        setAccounts(persistedAccs);
      }
    });

    const unsubscribe = subscribeToAccountingSync((e) => {
      if (e.detail?.type === 'VOUCHER_SAVED' || e.detail?.type === 'VOUCHER_DELETED') {
        apiFetchVouchers().then(setJvs);
        apiFetchAccounts().then(setAccounts);
      } else if (e.detail?.type === 'ACCOUNT_SAVED') {
        apiFetchAccounts().then(setAccounts);
      }
    });

    return unsubscribe;
  }, []);

  // Cross-module prefill state
  const [prefilledCustomerForReceipt, setPrefilledCustomerForReceipt] = useState<{
    accountCode: string;
    customerName: string;
  } | null>(null);

  const [prefilledSupplierForPayment, setPrefilledSupplierForPayment] = useState<{
    vendorCode: string;
    supplierName: string;
  } | null>(null);

  // Toast Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIsError, setToastIsError] = useState(false);

  const showToast = (msg: string, isError = false) => {
    setToastMessage(msg);
    setToastIsError(isError);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // State Persistence handlers
  const handleSaveJVs = (updatedJvs: JournalVoucher[]) => {
    setJvs(updatedJvs);
    saveLocalJVs(updatedJvs);
  };

  const handleSaveAccounts = (updatedAccounts: AccountDetail[]) => {
    setAccounts(updatedAccounts);
    saveLocalAccounts(updatedAccounts);
  };

  // Cross-module trigger: Open RV with pre-filled customer
  const handleOpenReceiptWithCustomer = (accountCode: string, customerName: string) => {
    setPrefilledCustomerForReceipt({ accountCode, customerName });
    setActiveTab('RECEIPT');
    showToast(`Navigated to Receipt Voucher prefilled with ${customerName}.`);
  };

  // Cross-module trigger: Open PV with pre-filled supplier
  const handleOpenPaymentWithSupplier = (vendorCode: string, supplierName: string) => {
    setPrefilledSupplierForPayment({ vendorCode, supplierName });
    setActiveTab('PAYMENT');
    showToast(`Navigated to Payment Voucher prefilled with ${supplierName}.`);
  };

  // Automatic JV creation on posting from Purchase or VAT
  const handleAddPostedJv = async (newRecord: any) => {
    const nextNum = `JV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const amt = Number(newRecord.total_debit || newRecord.amount || 0);

    const firstExpenseAcc = accounts.find((a) => a.type === 'Expense' || a.account_type === 'EXPENSE') || accounts[0];
    const firstCashAcc = accounts.find((a) => a.type === 'Cash' || a.type === 'Bank') || accounts[1];

    const lines = [
      {
        id: `line-${Date.now()}-1`,
        line_number: 1,
        account_id: firstExpenseAcc.id,
        account_number: firstExpenseAcc.account_number,
        account_name: firstExpenseAcc.account_name,
        description: newRecord.description || 'Automated ledger expense',
        amount_debit: amt,
        amount_credit: 0,
        currency_rate: 1.0,
        amount_native: amt
      },
      {
        id: `line-${Date.now()}-2`,
        line_number: 2,
        account_id: firstCashAcc.id,
        account_number: firstCashAcc.account_number,
        account_name: firstCashAcc.account_name,
        description: newRecord.description || 'Automated ledger settlement',
        amount_debit: 0,
        amount_credit: amt,
        currency_rate: 1.0,
        amount_native: amt
      }
    ];

    try {
      const res = await apiSaveVoucher({
        voucher: {
          jv_number: nextNum,
          date_of_jv: newRecord.date_of_jv || newRecord.date || new Date().toISOString().split('T')[0],
          jv_type: newRecord.jv_type || 'STANDARD',
          currency_id: 'USD',
          description: newRecord.description || 'Automated posted ledger transaction',
          created_by: 'Super Admin (Accounting Engine)'
        },
        lines,
        postImmediately: true
      });

      handleSaveJVs([res.voucher, ...jvs]);
      showToast(`Automated Voucher ${res.voucher.jv_number} posted to database. [DB ID: ${res.voucher.id.slice(0, 8)}...]`);
    } catch (e: any) {
      showToast(e.message || 'Failed to auto-post voucher', true);
    }
  };

  return (
    <div className="space-y-5">
      {/* GLOBAL TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-8 z-50 px-5 py-3 rounded-xl font-semibold shadow-xl flex items-center gap-2.5 animate-fadeIn border ${
            toastIsError
              ? 'bg-destructive text-destructive-foreground border-destructive/40'
              : 'bg-primary text-primary-foreground border-primary/40'
          }`}
        >
          {toastIsError ? (
            <AlertCircle className="w-4 h-4 text-destructive-foreground" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span className="text-xs">{toastMessage}</span>
        </div>
      )}

      {/* TOP TAB NAVIGATOR (Instant Zero-Blocking Transitions < 100ms) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/60 text-xs scrollbar-none">
        {[
          { id: 'JV', label: 'Journal Vouchers (JV)' },
          { id: 'PURCHASE', label: 'Purchases & Expenses' },
          { id: 'PAYMENT', label: 'Payments (PV)' },
          { id: 'RECEIPT', label: 'Receipts (RV)' },
          { id: 'AR', label: 'Receivables (AR)' },
          { id: 'AP', label: 'Payables (AP)' },
          { id: 'RECON', label: 'Bank Reconciliation' },
          { id: 'VAT', label: 'VAT Period Closing' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              startTabTransition(() => {
                setActiveTab(tab.id as AccountingActionTab);
              });
            }}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MODULE 1: JOURNAL VOUCHERS (JV) */}
      {activeTab === 'JV' && (
        <Module1JournalVouchers
          jvs={jvs}
          onSaveJVs={handleSaveJVs}
          accounts={accounts}
          onShowToast={showToast}
          initialScreenMode={initialScreenMode}
        />
      )}

      {/* MODULE 2: ACCOUNTING PURCHASE & EXPENSES */}
      {activeTab === 'PURCHASE' && (
        <Module2PurchasesExpenses
          accounts={accounts}
          onShowToast={showToast}
          onPostVoucherToJv={handleAddPostedJv}
        />
      )}

      {/* MODULE 3: ACCOUNTING PAYMENT (PV) */}
      {activeTab === 'PAYMENT' && (
        <Module3PaymentVouchers
          accounts={accounts}
          onShowToast={showToast}
          prefillPayToAccount={
            prefilledSupplierForPayment
              ? accounts.find((a) => a.account_number.includes(prefilledSupplierForPayment.vendorCode))?.id
              : undefined
          }
        />
      )}

      {/* MODULE 4: ACCOUNTING RECEIPT (RV) */}
      {activeTab === 'RECEIPT' && (
        <Module4ReceiptVouchers
          accounts={accounts}
          onShowToast={showToast}
          prefillFromAccount={
            prefilledCustomerForReceipt
              ? accounts.find((a) => a.account_number.includes(prefilledCustomerForReceipt.accountCode))?.id
              : undefined
          }
          prefillMemo={
            prefilledCustomerForReceipt
              ? `Commercial collection settlement from ${prefilledCustomerForReceipt.customerName}`
              : undefined
          }
        />
      )}

      {/* MODULE 5: ACCOUNTS RECEIVABLES (AR AGING & CRM STATION) */}
      {activeTab === 'AR' && (
        <Module5AccountsReceivables
          onShowToast={showToast}
          onOpenReceiptWithCustomer={handleOpenReceiptWithCustomer}
        />
      )}

      {/* MODULE 6: ACCOUNTS PAYABLES (AP AGING & SUPPLIER STATION) */}
      {activeTab === 'AP' && (
        <Module6AccountsPayables
          onShowToast={showToast}
          onOpenPaymentWithSupplier={handleOpenPaymentWithSupplier}
        />
      )}

      {/* MODULE 7: BANK RECONCILIATION WORKSTATION */}
      {activeTab === 'RECON' && (
        <Module7BankReconciliation
          accounts={accounts}
          onShowToast={showToast}
        />
      )}

      {/* MODULE 8: VAT CLOSING & CHART OF ACCOUNTS HIERARCHY */}
      {activeTab === 'VAT' && (
        <Module8VatClosing
          accounts={accounts}
          onSaveAccounts={handleSaveAccounts}
          onShowToast={showToast}
          onPostVatClosingJv={handleAddPostedJv}
        />
      )}
    </div>
  );
}

export default function AccountingActionsPage(props: AccountingActionsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground text-sm font-medium">
          Loading Vanguard Accounting Actions Workstation...
        </div>
      }
    >
      <AccountingActionsContent {...props} />
    </Suspense>
  );
}
