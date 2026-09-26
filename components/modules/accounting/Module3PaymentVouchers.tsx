'use client';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Vanguard ERP - Module 3: Accounting Payment (PV)
 * Exact Omega ERP Functional Parity:
 * A. Header & Three-Column Layout (Card 1 Accounts with live balance, Card 2 Notes, Card 3 Execution Details)
 * B. Payment Structure & Metrics (One vs Multiple, Currency, Badges, Save & Post)
 * C. Preview Payment Modal
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus,
  Eye,
  Upload,
  Check,
  RotateCcw,
  Search,
  X,
  Wallet,
  CheckCircle2,
  Building2,
  FileText
} from 'lucide-react';
import {
  AccountDetail,
  LBP_RATE,
  isTradeSupplierAccount,
  isTreasuryDisbursingAccount,
  JournalVoucher
} from '@/lib/accountingData';
import {
  apiSavePaymentVoucher,
  apiFetchVouchersByType,
  subscribeToAccountingSync
} from '@/lib/accountingPersistenceService';
import { SupportingDocModal } from './ModalsShared';
import QuickAddAccountModal, { QuickAddPreset } from './QuickAddAccountModal';

interface Module3PaymentVouchersProps {
  accounts: AccountDetail[];
  onShowToast: (msg: string, isError?: boolean) => void;
  prefillPayToAccount?: string;
}

export function Module3PaymentVouchers({
  accounts,
  onShowToast,
  prefillPayToAccount
}: Module3PaymentVouchersProps) {
  const { t } = useLanguage();
  // Card 1: Accounts (Strict Lebanese PCG standard)
  const supplierAccounts = useMemo(
    () => {
      const list = accounts.filter(isTradeSupplierAccount);
      return list.length > 0 ? list : accounts.filter((a) => a.account_number.startsWith('40'));
    },
    [accounts]
  );
  const bankAndCashAccounts = useMemo(
    () => {
      const list = accounts.filter(isTreasuryDisbursingAccount);
      return list.length > 0 ? list : accounts.filter((a) => a.account_number.startsWith('5'));
    },
    [accounts]
  );

  const [payToAccountId, setPayToAccountId] = useState(
    prefillPayToAccount ||
      supplierAccounts.find((a) => a.account_number === '40110')?.id ||
      supplierAccounts[0]?.id ||
      accounts[0]?.id ||
      ''
  );
  const [fromAccountId, setFromAccountId] = useState(
    bankAndCashAccounts.find((a) => a.account_number === '53000' || a.account_number === '51210')?.id ||
      bankAndCashAccounts[0]?.id ||
      accounts[0]?.id ||
      ''
  );

  // Quick Add Modal state
  const [quickAddModal, setQuickAddModal] = useState<{
    isOpen: boolean;
    presetType: QuickAddPreset;
    targetField?: 'PAY_TO' | 'DISBURSING';
  }>({
    isOpen: false,
    presetType: 'SUPPLIER'
  });

  const handleQuickAddSuccess = (newAccount: AccountDetail) => {
    if (quickAddModal.targetField === 'PAY_TO') {
      setPayToAccountId(newAccount.id);
    } else if (quickAddModal.targetField === 'DISBURSING') {
      setFromAccountId(newAccount.id);
    }
  };

  // Card 2: Notes
  const [jvDescription, setJvDescription] = useState('');
  const [internalNote, setInternalNote] = useState('');

  // Card 3: Execution Details
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState('Executive & Administration');
  const [payByInvoices, setPayByInvoices] = useState(false);

  // Payment Structure & Metrics
  const [paymentMode, setPaymentMode] = useState<'ONE' | 'MULTIPLE'>('ONE');
  const [currency, setCurrency] = useState<'USD' | 'LBP'>('USD');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [referenceNumber, setReferenceNumber] = useState('');

  // Modals state
  const [showDocModal, setShowDocModal] = useState(false);
  const [docUrl, setDocUrl] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSearch, setPreviewSearch] = useState('');
  const [isSavingPv, setIsSavingPv] = useState(false);

  // Selected Pay To Account live balance
  const selectedPayTo = accounts.find((a) => a.id === payToAccountId);
  const selectedPayFrom = accounts.find((a) => a.id === fromAccountId);
  const liveBalanceUSD = selectedPayTo?.balance_first_cur || 0;
  const liveBalanceFormatted =
    currency === 'USD'
      ? `$${liveBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      : `${(liveBalanceUSD * LBP_RATE).toLocaleString()} LBP`;

  const totalPaymentFormatted =
    currency === 'USD'
      ? `$${amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      : `${amountPaid.toLocaleString()} LBP`;

  // Persistent PV Records from Database (Zero Mock State)
  const [pvRecords, setPvRecords] = useState<
    Array<{
      id: string;
      date: string;
      toAccount: string;
      pv: string;
      dateOfPv: string;
      amount: number;
      description: string;
      enteredBy: string;
      department: string;
      posted: boolean;
    }>
  >([]);
  const [isLoadingPvs, setIsLoadingPvs] = useState(false);

  const formatVouchersToPvRecords = useCallback((vouchers: JournalVoucher[]) => {
    return vouchers.map((v) => {
      const debitLine = v.lines?.find((l) => (Number(l.amount_debit) || 0) > 0);
      return {
        id: v.id,
        date: v.date_of_jv,
        toAccount:
          v.payee_or_recipient ||
          debitLine?.account_name ||
          'Supplier Account',
        pv: v.jv_number,
        dateOfPv: v.date_of_jv,
        amount: Number(v.total_debit) || Number(v.lines?.[0]?.amount_debit) || 0,
        description: v.description,
        enteredBy: v.created_by || 'Super Admin',
        department: v.department || 'Executive & Administration',
        posted: Boolean(v.is_posted)
      };
    });
  }, []);

  const loadPersistentPvs = useCallback(async () => {
    setIsLoadingPvs(true);
    try {
      const vList = await apiFetchVouchersByType('PV');
      setPvRecords(formatVouchersToPvRecords(vList));
    } catch (err) {
      console.warn('[Module3PaymentVouchers] Error loading PVs from database:', err);
    } finally {
      setIsLoadingPvs(false);
    }
  }, [formatVouchersToPvRecords]);

  useEffect(() => {
    loadPersistentPvs();
    return subscribeToAccountingSync((e) => {
      if (e.detail?.type === 'VOUCHER_SAVED' || e.detail?.type === 'VOUCHER_DELETED') {
        loadPersistentPvs();
      }
    });
  }, [loadPersistentPvs]);

  // Full Blank Reset (+ New)
  const handleReset = () => {
    setJvDescription('');
    setInternalNote('');
    setAmountPaid(0);
    setReferenceNumber('');
    setPayByInvoices(false);
    setDocUrl('');
    onShowToast('Payment Voucher form reset to clean state.');
  };

  // Modular Save / Save & Post with atomic GL posting to real database
  const handleSave = async (postImmediately = false) => {
    if (!jvDescription.trim()) {
      onShowToast('Please enter JV Description* before saving.', true);
      return;
    }
    if (amountPaid <= 0) {
      onShowToast('Please enter an Amount Paid greater than zero.', true);
      return;
    }

    const payToAcc = selectedPayTo || supplierAccounts[0] || accounts[0];
    const payFromAcc = selectedPayFrom || bankAndCashAccounts[0] || accounts[1];

    if (!payToAcc || !payFromAcc) {
      onShowToast('Valid Pay-To and Disbursing accounts are required.', true);
      return;
    }

    try {
      setIsSavingPv(true);

      // Execute modular payment voucher mutation directly into real database
      const res = await apiSavePaymentVoucher({
        payToAccountId: payToAcc.id,
        fromAccountId: payFromAcc.id,
        amount: amountPaid,
        currency,
        date: paymentDate,
        description: jvDescription,
        internalNote,
        referenceNumber,
        department,
        supportingDocUrl: docUrl,
        postImmediately,
        user: 'Super Admin'
      });

      onShowToast(
        `Payment Voucher ${res.voucher.jv_number} ${
          postImmediately
            ? 'persisted & posted to GL ledger!'
            : 'saved as draft to database.'
        } [DB ID: ${res.voucher.id.slice(0, 8)}...]`
      );

      await loadPersistentPvs();
      handleReset();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to persist payment voucher', true);
    } finally {
      setIsSavingPv(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* ========================================================================= */}
      {/* A. HEADER & THREE-COLUMN LAYOUT                                           */}
      {/* ========================================================================= */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-5">
        {/* Top Header Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span>Accounting Payment (PV Workstation)</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('issue_supplier_disbursements_and_credit', 'Issue supplier disbursements and credit payments with live balance synchronization')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* + New (full blank reset) */}
            <button
              type="button"
              onClick={handleReset}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New</span>
            </button>

            {/* Preview */}
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{t('preview', 'Preview')}</span>
            </button>

            {/* Supporting Document */}
            <button
              type="button"
              onClick={() => setShowDocModal(true)}
              className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span>{t('supporting_document', 'Supporting Document')}</span>
            </button>
          </div>
        </div>

        {/* THREE-COLUMN CARDS LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CARD 1 (ACCOUNTS) */}
          <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3.5 text-xs font-medium">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-bold text-foreground">{t('card_1_accounts', 'Card 1: Accounts')}</span>
              <span className="text-[10px] font-mono text-muted-foreground">Beneficiary &amp; Vault</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-foreground font-semibold">{t('pay_to', 'Pay To *')}</label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickAddModal({ isOpen: true, presetType: 'SUPPLIER', targetField: 'PAY_TO' })}
                    className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                    title="Quick-Add New Supplier Account (#40110...)"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>{t('new_supplier', 'New Supplier')}</span>
                  </button>
                  {/* Live balance badge */}
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-border">
                    Balance: {liveBalanceFormatted}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <select
                  value={payToAccountId}
                  onChange={(e) => setPayToAccountId(e.target.value)}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-mono"
                >
                  {supplierAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      #{a.account_number} - {a.account_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setQuickAddModal({ isOpen: true, presetType: 'SUPPLIER', targetField: 'PAY_TO' })}
                  className="p-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Quick-Add New Supplier (+) [Class 40]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-foreground block font-semibold">{t('from_account', 'From Account *')}</label>
                <button
                  type="button"
                  onClick={() => setQuickAddModal({ isOpen: true, presetType: 'DISBURSING', targetField: 'DISBURSING' })}
                  className="text-[10px] text-emerald-700 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                  title="Quick-Add New Cash Vault or Bank (#53xxx / #51xxx)"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>{t('new_vaultbank', 'New Vault/Bank')}</span>
                </button>
              </div>
              <div className="flex items-center gap-1">
                <select
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-mono"
                >
                  {bankAndCashAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      #{a.account_number} - {a.account_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setQuickAddModal({ isOpen: true, presetType: 'DISBURSING', targetField: 'DISBURSING' })}
                  className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Quick-Add New Cash Vault or Bank Account (+) [Class 5]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* CARD 2 (NOTES) */}
          <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3.5 text-xs font-medium">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-bold text-foreground">{t('card_2_notes', 'Card 2: Notes')}</span>
              <span className="text-[10px] font-mono text-muted-foreground">Description &amp; Memo</span>
            </div>

            <div>
              <label className="text-foreground mb-1 block font-semibold">{t('jv_description', 'JV Description *')}</label>
              <textarea
                rows={2}
                value={jvDescription}
                onChange={(e) => setJvDescription(e.target.value)}
                placeholder={t('payment_memo_for_bank_ledger_and', 'Payment memo for bank ledger and supplier receipt...')}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs text-xs"
              />
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block font-medium">{t('internal_note', 'Internal Note')}</label>
              <textarea
                rows={2}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder={t('private_remarks_approval_log', 'Private remarks, approval log...')}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs text-xs"
              />
            </div>
          </div>

          {/* CARD 3 (EXECUTION DETAILS) */}
          <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3.5 text-xs font-medium">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-bold text-foreground">{t('card_3_execution_details', 'Card 3: Execution Details')}</span>
              <span className="text-[10px] font-mono text-muted-foreground">Date &amp; Dept</span>
            </div>

            <div>
              <label className="text-foreground mb-1 block font-semibold">{t('payment_date', 'Payment Date')}</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
            </div>

            <div>
              <label className="text-foreground mb-1 block font-semibold">{t('for_department', 'For Department *')}</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              >
                <option value="Executive & Administration">Executive &amp; Administration</option>
                <option value="Mill & Production">Mill &amp; Production</option>
                <option value="Commercial Sales">{t('commercial_sales', 'Commercial Sales')}</option>
                <option value="Packaging & Bottling">Packaging &amp; Bottling</option>
              </select>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 font-semibold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={payByInvoices}
                  onChange={(e) => setPayByInvoices(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <span>{t('pay_by_invoices', 'Pay by invoices')}</span>
              </label>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* B. PAYMENT STRUCTURE & METRICS                                            */}
        {/* ========================================================================= */}
        <div className="border-t border-border pt-4 space-y-4">
          {/* Payment Mode Radios */}
          <div className="flex items-center gap-6 text-xs font-semibold">
            <span className="text-muted-foreground">{t('payment_mode', 'Payment Mode:')}</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="paymentMode"
                value="ONE"
                checked={paymentMode === 'ONE'}
                onChange={() => setPaymentMode('ONE')}
                className="text-primary focus:ring-primary"
              />
              <span>(o) One Payment</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="paymentMode"
                value="MULTIPLE"
                checked={paymentMode === 'MULTIPLE'}
                onChange={() => setPaymentMode('MULTIPLE')}
                className="text-primary focus:ring-primary"
              />
              <span>( ) Multiple Payment</span>
            </label>
          </div>

          {/* Payment Values Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs font-medium">
            <div>
              <label className="text-foreground mb-1 block font-semibold">{t('currency', 'Currency *')}</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-bold"
              >
                <option value="USD">USD ($) - Base Currency</option>
                <option value="LBP">LBP (L.L) - Lebanese Pound</option>
              </select>
            </div>

            <div>
              <label className="text-foreground mb-1 block font-semibold">{t('amount_paid', 'Amount Paid')}</label>
              <input
                type="number"
                value={amountPaid || ''}
                onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                placeholder="0.00"
                step="0.01"
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono font-bold text-right focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
            </div>

            <div>
              <label className="text-foreground mb-1 block font-semibold">{t('reference', 'Reference #')}</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder={t('eg_chq991204_wire88', 'e.g. CHQ-991204 / WIRE-88')}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
            </div>
          </div>

          {/* Summary Read-Only Badges & Action Buttons */}
          <div className="bg-muted p-4 rounded-xl border border-border flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold">
              <div className="bg-card px-3.5 py-1.5 rounded-lg border border-border shadow-2xs">
                <span className="text-muted-foreground block text-[11px]">Total Balance [{currency}]:</span>
                <span className="font-mono text-foreground text-sm font-bold">{liveBalanceFormatted}</span>
              </div>

              <div className="bg-card px-3.5 py-1.5 rounded-lg border border-border shadow-2xs">
                <span className="text-muted-foreground block text-[11px]">{t('total_payment', 'Total Payment:')}</span>
                <span className="font-mono text-emerald-700 text-sm font-bold">{totalPaymentFormatted}</span>
              </div>
            </div>

            {/* Bottom Actions: Save (Orange) and Save & Post (Green) */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isSavingPv}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                {isSavingPv ? 'Saving...' : 'Save'}
              </button>

              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSavingPv}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isSavingPv ? 'Posting...' : 'Save & Post'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* C. PREVIEW PAYMENT MODAL                                                  */}
      {/* ========================================================================= */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span>{t('preview_payment_vouchers', 'Preview Payment Vouchers')}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter: Search by account name */}
            <div className="relative w-72 text-xs">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={previewSearch}
                onChange={(e) => setPreviewSearch(e.target.value)}
                placeholder={t('search_by_account_name', 'Search by account name...')}
                className="w-full bg-card border border-input rounded-lg pl-8 pr-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
            </div>

            {/* Columns: Date | To Account | PV | Date Of PV | Amount | Description | Entered By | Department | Posted */}
            <div className="overflow-y-auto rounded-lg border border-border flex-1 max-h-[50vh]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-muted border-b border-border text-foreground font-semibold">
                  <tr>
                    <th className="p-2.5">{t('date', 'Date')}</th>
                    <th className="p-2.5">{t('to_account', 'To Account')}</th>
                    <th className="p-2.5">{t('pv', 'PV')}</th>
                    <th className="p-2.5">{t('date_of_pv', 'Date Of PV')}</th>
                    <th className="p-2.5 text-right">Amount ($)</th>
                    <th className="p-2.5 min-w-[180px]">{t('description', 'Description')}</th>
                    <th className="p-2.5">{t('entered_by', 'Entered By')}</th>
                    <th className="p-2.5">{t('department', 'Department')}</th>
                    <th className="p-2.5 text-center">{t('posted', 'Posted')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {pvRecords
                    .filter((r) => r.toAccount.toLowerCase().includes(previewSearch.toLowerCase()))
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                        <td className="p-2.5 font-mono text-muted-foreground">{r.date}</td>
                        <td className="p-2.5 font-semibold text-foreground">{r.toAccount}</td>
                        <td className="p-2.5 font-mono font-bold text-primary">{r.pv}</td>
                        <td className="p-2.5 font-mono text-muted-foreground">{r.dateOfPv}</td>
                        <td className="p-2.5 font-mono font-bold text-emerald-700 text-right">
                          ${r.amount.toFixed(2)}
                        </td>
                        <td className="p-2.5 text-foreground max-w-xs truncate">{r.description}</td>
                        <td className="p-2.5 text-muted-foreground">{r.enteredBy}</td>
                        <td className="p-2.5 text-muted-foreground">{r.department}</td>
                        <td className="p-2.5 text-center">
                          {r.posted ? (
                            <span className="bg-card text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {t('yes', 'Yes')}
                            </span>
                          ) : (
                            <span className="bg-card text-amber-700 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs">
                              {t('draft', 'Draft')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  {pvRecords.filter((r) => r.toAccount.toLowerCase().includes(previewSearch.toLowerCase())).length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground text-xs">
                        {isLoadingPvs ? 'Loading vouchers from database...' : 'No Payment Vouchers found in database.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="bg-card hover:bg-muted text-foreground border border-border px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {t('close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supporting Document Modal */}
      <SupportingDocModal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
        initialUrl={docUrl}
        onSave={(url) => {
          setDocUrl(url);
          onShowToast('Supporting document link saved to payment voucher.');
        }}
      />

      {/* QUICK ADD ACCOUNT MODAL (LEBANESE PCG STANDARD) */}
      <QuickAddAccountModal
        isOpen={quickAddModal.isOpen}
        onClose={() => setQuickAddModal((prev) => ({ ...prev, isOpen: false }))}
        presetType={quickAddModal.presetType}
        existingAccounts={accounts}
        onSuccess={handleQuickAddSuccess}
        onShowToast={onShowToast}
      />
    </div>
  );
}
