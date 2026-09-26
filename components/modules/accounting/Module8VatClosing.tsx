'use client';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Vanguard ERP - Module 8: VAT Closing & Chart of Accounts Hierarchy
 * Exact Omega ERP Functional Parity:
 * A. VAT Closing Preparation: Checklist Box, Year (2026), VAT Period (Quarterly),
 *    Select Quarter (Q1 -> 31-Mar-2026, Q2 -> 30-Jun-2026, Q3 -> current date, Q4 -> 31-Dec-2026),
 *    VAT Payable Account (4411100000), VAT Receivable Account (4426900000), Notes, Preview button
 * B. Triggers for Search Accounts, Account Ledger Statement, and Cascading COA Hierarchy Modals
 */

import React, { useState, useEffect } from 'react';
import {
  Percent,
  CheckSquare,
  Square,
  Eye,
  BookOpen,
  Plus,
  Building,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Calendar,
  X
} from 'lucide-react';
import {
  AccountDetail,
  AccountHeader3,
  AccountGroup4,
  OMEGA_SUB_CLASSES_3,
  OMEGA_SUB_CLASSES_4,
  LBP_RATE
} from '@/lib/accountingData';
import {
  SearchAccountsModal,
  StatementModal,
  AddAccountModal,
  AddSubClass4Modal,
  AddSubClass3Modal
} from './ModalsShared';

interface Module8VatClosingProps {
  accounts: AccountDetail[];
  onSaveAccounts: (accounts: AccountDetail[]) => void;
  onShowToast: (msg: string, isError?: boolean) => void;
  onPostVatClosingJv?: (jv: any) => void;
}

export function Module8VatClosing({
  accounts,
  onSaveAccounts,
  onShowToast,
  onPostVatClosingJv
}: Module8VatClosingProps) {
  const { t } = useLanguage();
  // Checklist Box State
  const [salesTransferred, setSalesTransferred] = useState(false);
  const [purchasesRecorded, setPurchasesRecorded] = useState(false);

  // Configuration
  const [year] = useState('2026');
  const [vatPeriod] = useState('Quarterly');
  const [quarter, setQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q3');
  const [vatClosingDate, setVatClosingDate] = useState('2026-09-19');

  // Automated date bindings per quarter
  useEffect(() => {
    if (quarter === 'Q1') setVatClosingDate('2026-03-31');
    else if (quarter === 'Q2') setVatClosingDate('2026-06-30');
    else if (quarter === 'Q3') {
      const today = new Date().toISOString().split('T')[0];
      setVatClosingDate(today); // Current date if incomplete
    } else if (quarter === 'Q4') setVatClosingDate('2026-12-31');
  }, [quarter]);

  // Dynamic functional VAT account lookups (Multi-Country / IFRS & PCA compliant)
  const defaultVatPayable =
    accounts.find(
      (a) =>
        a.account_name.toLowerCase().includes('vat payable') ||
        a.account_name.toLowerCase().includes('tax payable') ||
        a.account_name.toLowerCase().includes('vat collect')
    ) ||
    accounts.find(
      (a) =>
        (a.class_type === 'Liabilities' || a.account_type === 'LIABILITY') &&
        a.account_name.toLowerCase().includes('vat')
    ) ||
    accounts[0];

  const defaultVatReceivable =
    accounts.find(
      (a) =>
        a.account_name.toLowerCase().includes('vat deductible') ||
        a.account_name.toLowerCase().includes('vat receivable') ||
        a.account_name.toLowerCase().includes('tax recoverable') ||
        a.account_name.toLowerCase().includes('input vat')
    ) ||
    accounts.find(
      (a) =>
        (a.class_type === 'Assets' || a.account_type === 'ASSET') &&
        a.account_name.toLowerCase().includes('vat')
    ) ||
    accounts[1] ||
    accounts[0];

  const [vatPayableAccountId, setVatPayableAccountId] = useState(defaultVatPayable?.id || '');
  const [vatReceivableAccountId, setVatReceivableAccountId] = useState(defaultVatReceivable?.id || '');
  const [notes, setNotes] = useState(
    'Quarterly statutory VAT return reconciliation prepared in accordance with applicable tax regulations.'
  );

  // Tax metrics
  const outputVatAccount = defaultVatPayable;
  const inputVatAccount = defaultVatReceivable;
  const outputVatAmount = 53350.00;
  const inputVatAmount = 34650.00;
  const netVatPayable = outputVatAmount - inputVatAmount;

  // Preview Dialog
  const [showVatPreview, setShowVatPreview] = useState(false);

  // Modals state
  const [searchAccountsOpen, setSearchAccountsOpen] = useState(false);
  const [statementAccount, setStatementAccount] = useState<AccountDetail | null>(null);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [addSubClass4Open, setAddSubClass4Open] = useState(false);
  const [addSubClass3Open, setAddSubClass3Open] = useState(false);

  // Subclasses catalogs
  const [subClasses3, setSubClasses3] = useState<AccountHeader3[]>(() => OMEGA_SUB_CLASSES_3);
  const [subClasses4, setSubClasses4] = useState<AccountGroup4[]>(() => OMEGA_SUB_CLASSES_4);

  const handleGenerateClosingEntry = () => {
    if (!salesTransferred || !purchasesRecorded) {
      onShowToast('Please confirm both prerequisite audit checklist items before closing.', true);
      return;
    }

    const newJv = {
      id: `vat-jv-${Date.now()}`,
      jv_number: `JV-VAT-${quarter}-${year}`,
      date_of_jv: vatClosingDate,
      jv_type: 'CLOSING',
      description: `Statutory VAT Closing Entry for ${quarter} ${year} - Ministry of Finance Settlement`,
      total_debit: outputVatAmount,
      total_credit: outputVatAmount,
      is_posted: true
    };

    if (onPostVatClosingJv) {
      onPostVatClosingJv(newJv);
    }

    setShowVatPreview(false);
    onShowToast(`Quarterly VAT settlement entry for ${quarter} ${year} generated and posted to General Ledger!`);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* ========================================================================= */}
      {/* A. VAT CLOSING PREPARATION                                                */}
      {/* ========================================================================= */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Percent className="w-4 h-4 text-primary" />
                <span>VAT Period Closing &amp; Chart of Accounts Hierarchy</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-border">
                {t('omega_parity', 'Omega Parity')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('reconcile_inputoutput_vat_balances', 'Reconcile input/output VAT balances, verify audit preconditions, and compute quarterly tax liability')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Top Action: Preview */}
            <button
              type="button"
              onClick={() => setShowVatPreview(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t('preview_vat_closing', 'Preview VAT Closing')}</span>
            </button>

            {/* Quick Access to Search Accounts Modal */}
            <button
              type="button"
              onClick={() => setSearchAccountsOpen(true)}
              className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>Search Accounts ({accounts.length})</span>
            </button>

            {/* Cascading Add Account */}
            <button
              type="button"
              onClick={() => setAddAccountOpen(true)}
              className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>{t('add_account_subclass', 'Add Account / Subclass')}</span>
            </button>
          </div>
        </div>

        {/* 1. CHECKLIST BOX */}
        <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-3 text-xs">
          <span className="font-bold text-foreground block">
            Prerequisite Verification Checklist (Statutory Compliance):
          </span>
          <div className="space-y-2 font-medium">
            <label className="flex items-start gap-2 text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={salesTransferred}
                onChange={(e) => setSalesTransferred(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4 mt-0.5"
              />
              <span>{t('all_sales_related_to_the_selected_cycle', 'All sales related to the selected cycle have been fully transferred to accounting.')}</span>
            </label>

            <label className="flex items-start gap-2 text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={purchasesRecorded}
                onChange={(e) => setPurchasesRecorded(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4 mt-0.5"
              />
              <span>{t('all_purchases_and_payments_related_to', 'All purchases and payments related to the selected cycle have been completely recorded in accounting.')}</span>
            </label>
          </div>
        </div>

        {/* 2. CONFIGURATION FORM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium">
          {/* Year: Fixed fiscal year 2026 */}
          <div>
            <label className="text-muted-foreground mb-1 block">{t('fiscal_year', 'Fiscal Year')}</label>
            <input
              type="text"
              readOnly
              value={year}
              className="w-full bg-muted border border-input rounded-lg p-2 text-foreground font-mono font-bold shadow-2xs cursor-not-allowed"
            />
          </div>

          {/* VAT Period: Quarterly */}
          <div>
            <label className="text-muted-foreground mb-1 block">{t('vat_period', 'VAT Period')}</label>
            <input
              type="text"
              readOnly
              value={vatPeriod}
              className="w-full bg-muted border border-input rounded-lg p-2 text-foreground font-medium shadow-2xs cursor-not-allowed"
            />
          </div>

          {/* Select Quarter: Dropdown (Q1, Q2, Q3, Q4) */}
          <div>
            <label className="text-foreground mb-1 block font-semibold">{t('select_quarter', 'Select Quarter')}</label>
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value as any)}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-bold"
            >
              <option value="Q1">Q1 (Ends 31-Mar-2026)</option>
              <option value="Q2">Q2 (Ends 30-Jun-2026)</option>
              <option value="Q3">Q3 (Current / Incomplete)</option>
              <option value="Q4">Q4 (Ends 31-Dec-2026)</option>
            </select>
          </div>

          {/* VAT Closing Date */}
          <div>
            <label className="text-foreground mb-1 block font-semibold">{t('vat_closing_date', 'VAT Closing Date')}</label>
            <input
              type="date"
              value={vatClosingDate}
              onChange={(e) => setVatClosingDate(e.target.value)}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono shadow-2xs"
            />
          </div>

          {/* VAT Payable Account: Lookup (e.g., 4411100000 - Vat Payables*) */}
          <div className="sm:col-span-2">
            <label className="text-foreground mb-1 block font-semibold">
              VAT Payable Account (Output Tax / MoF)
            </label>
            <select
              value={vatPayableAccountId}
              onChange={(e) => setVatPayableAccountId(e.target.value)}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono shadow-2xs"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.account_number} - {a.account_name}
                </option>
              ))}
            </select>
          </div>

          {/* VAT Receivable Account: Lookup (e.g., 4426900000 - Vat Deductible*) */}
          <div className="sm:col-span-2">
            <label className="text-foreground mb-1 block font-semibold">
              VAT Receivable Account (Input Tax / Deductible)
            </label>
            <select
              value={vatReceivableAccountId}
              onChange={(e) => setVatReceivableAccountId(e.target.value)}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono shadow-2xs"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.account_number} - {a.account_name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes: Textarea */}
          <div className="sm:col-span-2 md:col-span-4">
            <label className="text-foreground mb-1 block font-semibold">{t('notes', 'Notes')}</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('enter_audit_reconciliation_notes', 'Enter audit reconciliation notes...')}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs text-xs"
            />
          </div>
        </div>

        {/* 3. TAX METRICS KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
          <div className="bg-muted p-4 rounded-xl border border-border space-y-1">
            <span className="text-muted-foreground text-[11px] block">
              Output VAT Collected on Sales (11%)
            </span>
            <div className="text-xl font-bold font-mono text-destructive">
              ${outputVatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <small className="text-muted-foreground font-mono text-[10px]">
              {t('account_44270000_customer_vat', 'Account: #44270000 - Customer Vat*')}
            </small>
          </div>

          <div className="bg-muted p-4 rounded-xl border border-border space-y-1">
            <span className="text-muted-foreground text-[11px] block">
              Input VAT Paid on Purchases (11%)
            </span>
            <div className="text-xl font-bold font-mono text-emerald-700">
              ${inputVatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <small className="text-muted-foreground font-mono text-[10px]">
              {t('account_4426900000_vat_deductible', 'Account: #4426900000 - Vat Deductible*')}
            </small>
          </div>

          <div className="bg-muted p-4 rounded-xl border border-border space-y-1">
            <span className="text-muted-foreground text-[11px] block">
              Net Tax Settlement (Ministry of Finance)
            </span>
            <div className="text-xl font-bold font-mono text-foreground">
              ${netVatPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <small className="text-muted-foreground font-mono text-[10px]">
              {t('account_4411100000_vat_payables', 'Account: #4411100000 - Vat Payables*')}
            </small>
          </div>
        </div>
      </div>

      {/* VAT PREVIEW MODAL */}
      {showVatPreview && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Percent className="w-4 h-4 text-primary" />
                <span>VAT Period Closing Audit Summary ({quarter} {year})</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowVatPreview(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-muted p-3.5 rounded-xl border border-border space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Output Sales VAT (Credit 4427):</span>
                <span className="font-bold text-destructive">${outputVatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Input Purchases VAT (Debit 4426):</span>
                <span className="font-bold text-emerald-700">${inputVatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 text-sm font-bold text-foreground">
                <span>{t('net_payable_to_mof', 'Net Payable to MoF:')}</span>
                <span>${netVatPayable.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Posting will generate a balanced compound journal voucher debiting Customer VAT and crediting VAT Deductible &amp; VAT Payables liabilities.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowVatPreview(false)}
                className="bg-card hover:bg-muted text-muted-foreground px-4 py-1.5 rounded-lg text-xs font-semibold border border-border cursor-pointer"
              >
                {t('close', 'Close')}
              </button>
              <button
                type="button"
                onClick={handleGenerateClosingEntry}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                {t('generate_tax_closing_entry', 'Generate Tax Closing Entry')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* B. SEARCH ACCOUNTS & STATEMENT MODALS                                      */}
      {/* ========================================================================= */}
      <SearchAccountsModal
        isOpen={searchAccountsOpen}
        onClose={() => setSearchAccountsOpen(false)}
        accounts={accounts}
        onSelectAccount={(acc) => {
          setSearchAccountsOpen(false);
          setStatementAccount(acc);
        }}
        onOpenAddAccount={() => {
          setSearchAccountsOpen(false);
          setAddAccountOpen(true);
        }}
        onOpenStatement={(acc) => setStatementAccount(acc)}
      />

      <StatementModal
        isOpen={!!statementAccount}
        onClose={() => setStatementAccount(null)}
        account={statementAccount}
      />

      {/* ========================================================================= */}
      {/* C. CASCADING ACCOUNT HIERARCHY MODALS                                      */}
      {/* ========================================================================= */}
      <AddAccountModal
        isOpen={addAccountOpen}
        onClose={() => setAddAccountOpen(false)}
        onSave={(newAcc) => {
          const updated = [newAcc, ...accounts];
          onSaveAccounts(updated);
          onShowToast(`Added account #${newAcc.account_number} (${newAcc.account_name}).`);
        }}
        subClasses4={subClasses4}
        onOpenAddSubClass4={() => setAddSubClass4Open(true)}
      />

      <AddSubClass4Modal
        isOpen={addSubClass4Open}
        onClose={() => setAddSubClass4Open(false)}
        onSave={(newGrp) => {
          setSubClasses4((prev) => [newGrp, ...prev]);
          onShowToast(`Created Sub Class 4 header: #${newGrp.account_number_ref} - ${newGrp.account_name}`);
        }}
        subClasses3={subClasses3}
        onOpenAddSubClass3={() => setAddSubClass3Open(true)}
      />

      <AddSubClass3Modal
        isOpen={addSubClass3Open}
        onClose={() => setAddSubClass3Open(false)}
        onSave={(newHdr) => {
          setSubClasses3((prev) => [newHdr, ...prev]);
          onShowToast(`Created Sub Class 3 header: #${newHdr.account_number_ref} - ${newHdr.account_name}`);
        }}
      />
    </div>
  );
}
