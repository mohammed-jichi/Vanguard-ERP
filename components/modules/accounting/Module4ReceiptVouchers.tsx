'use client';

/**
 * Vanguard ERP - Module 4: Accounting Receipt (RV)
 * Exact Omega ERP Functional Parity:
 * A. Two-Column Split Entry View (Left Card Financial Entries, Right Card Classification & Trigger with strict validation on `Add`)
 * B. Multi-line allocation grid, bottom badges (Total Balance $, Total Balance LBP, Total Payment), Save & Post (Green) and Save (Orange)
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Eye,
  Video,
  Plus,
  Trash2,
  Check,
  Landmark,
  CheckCircle2,
  X,
  Search
} from 'lucide-react';
import {
  AccountDetail,
  LBP_RATE,
  isCustomerAccount,
  isTreasuryDisbursingAccount,
  JournalVoucher
} from '@/lib/accountingData';
import {
  apiSaveReceiptVoucher,
  apiFetchVouchersByType,
  subscribeToAccountingSync
} from '@/lib/accountingPersistenceService';
import QuickAddAccountModal from './QuickAddAccountModal';

interface ReceiptLine {
  id: string;
  fromAccountId: string;
  fromAccountName: string;
  toAccountId: string;
  toAccountName: string;
  amount: number;
  currency: 'USD' | 'LBP';
  checkNumber?: string;
  description: string;
  department: string;
}

interface Module4ReceiptVouchersProps {
  accounts: AccountDetail[];
  onShowToast: (msg: string, isError?: boolean) => void;
  prefillFromAccount?: string;
  prefillMemo?: string;
}

export function Module4ReceiptVouchers({
  accounts,
  onShowToast,
  prefillFromAccount,
  prefillMemo
}: Module4ReceiptVouchersProps) {
  // Account groupings (Strict Lebanese PCG standard)
  const clientAccounts = useMemo(
    () =>
      accounts.filter(
        (a) =>
          a.type === 'Customer' ||
          a.account_sub_type === 'CUSTOMER' ||
          isCustomerAccount(a)
      ),
    [accounts]
  );
  const bankAndVaultAccounts = useMemo(
    () => {
      const list = accounts.filter(isTreasuryDisbursingAccount);
      return list.length > 0 ? list : accounts.filter((a) => a.account_number.startsWith('5'));
    },
    [accounts]
  );

  // Left Card: Financial Entries
  const [fromAccountId, setFromAccountId] = useState(
    prefillFromAccount || clientAccounts[0]?.id || accounts[0]?.id || ''
  );
  const [toAccountId, setToAccountId] = useState(
    bankAndVaultAccounts.find((a) => a.account_number === '53000' || a.account_number === '51210')?.id ||
      bankAndVaultAccounts[0]?.id ||
      accounts[0]?.id ||
      ''
  );
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<'USD' | 'LBP'>('USD');

  // Quick Add Modal state
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);

  const handleQuickAddSuccess = (newAccount: AccountDetail) => {
    setToAccountId(newAccount.id);
  };
  const [checkNumber, setCheckNumber] = useState('');
  const [description, setDescription] = useState(prefillMemo || '');

  // Right Card: Classification & Trigger
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState('Commercial Sales & Retail');
  const [payByInvoices, setPayByInvoices] = useState(false);
  const [enterTaxDetails, setEnterTaxDetails] = useState(false);

  // Multi-line allocation grid
  const [receiptLines, setReceiptLines] = useState<ReceiptLine[]>([]);

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSearch, setPreviewSearch] = useState('');
  const [isSavingRv, setIsSavingRv] = useState(false);

  // Persistent RV Records from Database (Zero Mock State)
  const [rvRecords, setRvRecords] = useState<
    Array<{
      id: string;
      date: string;
      fromAccount: string;
      rv: string;
      dateOfRv: string;
      amount: number;
      description: string;
      enteredBy: string;
      department: string;
      posted: boolean;
    }>
  >([]);
  const [isLoadingRvs, setIsLoadingRvs] = useState(false);

  const formatVouchersToRvRecords = useCallback((vouchers: JournalVoucher[]) => {
    return vouchers.map((v) => {
      const creditLine = v.lines?.find((l) => (Number(l.amount_credit) || 0) > 0);
      return {
        id: v.id,
        date: v.date_of_jv,
        fromAccount:
          v.payee_or_recipient ||
          creditLine?.account_name ||
          'Customer Account',
        rv: v.jv_number,
        dateOfRv: v.date_of_jv,
        amount: Number(v.total_debit) || Number(v.lines?.[0]?.amount_debit) || 0,
        description: v.description,
        enteredBy: v.created_by || 'Super Admin',
        department: v.department || 'Commercial Sales & Retail',
        posted: Boolean(v.is_posted)
      };
    });
  }, []);

  const loadPersistentRvs = useCallback(async () => {
    setIsLoadingRvs(true);
    try {
      const vList = await apiFetchVouchersByType('RV');
      setRvRecords(formatVouchersToRvRecords(vList));
    } catch (err) {
      console.warn('[Module4ReceiptVouchers] Error loading RVs from database:', err);
    } finally {
      setIsLoadingRvs(false);
    }
  }, [formatVouchersToRvRecords]);

  useEffect(() => {
    loadPersistentRvs();
    return subscribeToAccountingSync((e) => {
      if (e.detail?.type === 'VOUCHER_SAVED' || e.detail?.type === 'VOUCHER_DELETED') {
        loadPersistentRvs();
      }
    });
  }, [loadPersistentRvs]);

  // Selected From Account balance
  const selectedClient = accounts.find((a) => a.id === fromAccountId);
  const liveClientBalance = selectedClient?.balance_first_cur || 0;

  // Multi-line Totals
  const totalPayment = receiptLines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
  const totalBalanceUSD = liveClientBalance;
  const totalBalanceLBP = liveClientBalance * LBP_RATE;

  // Strict Validation: Clicking `Add` with an empty `From Accounts *` or empty `Amount` MUST immediately throw validation alert: "Choose From Account".
  const handleAddLine = () => {
    if (!fromAccountId || !amount || Number(amount) <= 0) {
      onShowToast('Choose From Account (Please select a customer and valid collection amount).', true);
      return;
    }

    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    const toAcc = accounts.find((a) => a.id === toAccountId);

    const newLine: ReceiptLine = {
      id: `rvl-${Date.now()}`,
      fromAccountId,
      fromAccountName: fromAcc?.account_name || 'Customer Account',
      toAccountId,
      toAccountName: toAcc?.account_name || 'Bank/Vault',
      amount: Number(amount),
      currency,
      checkNumber,
      description: description || `Collection from ${fromAcc?.account_name}`,
      department
    };

    setReceiptLines((prev) => [newLine, ...prev]);
    onShowToast(`Transferred collection item of $${amount.toFixed(2)} to receipt allocation grid.`);

    // Reset input fields
    setAmount(0);
    setCheckNumber('');
    setDescription('');
  };

  const handleDeleteLine = (id: string) => {
    setReceiptLines((prev) => prev.filter((l) => l.id !== id));
  };

  // Modular Save / Save & Post with atomic GL posting to real database
  const handleSave = async (postImmediately = false) => {
    if (receiptLines.length === 0) {
      onShowToast('Receipt grid is empty. Click "Add" to transfer entries before saving.', true);
      return;
    }

    const totalAmt = receiptLines.reduce((sum, l) => sum + l.amount, 0);

    try {
      setIsSavingRv(true);

      // Execute modular receipt voucher mutation directly into real database
      const res = await apiSaveReceiptVoucher({
        items: receiptLines.map((l) => ({
          fromAccountId: l.fromAccountId,
          toAccountId: l.toAccountId,
          amount: l.amount,
          currency: l.currency,
          description: l.description,
          checkNumber: l.checkNumber,
          department: l.department
        })),
        currency,
        date,
        description: `Customer collection receipts total $${totalAmt.toFixed(2)}`,
        department,
        postImmediately,
        user: 'Super Admin'
      });

      onShowToast(
        `Receipt Voucher ${res.voucher.jv_number} ${
          postImmediately
            ? 'persisted & posted to GL ledger!'
            : 'saved as draft to database.'
        } [DB ID: ${res.voucher.id.slice(0, 8)}...]`
      );

      await loadPersistentRvs();
      setReceiptLines([]);
      setAmount(0);
      setDescription('');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to persist receipt voucher', true);
    } finally {
      setIsSavingRv(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Controls: Preview button, Watch Tutorial link */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Landmark className="w-4 h-4 text-primary" />
            <span>Accounting Receipt (RV Workstation)</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Collect receivables from clients, allocate bank/cash vaults, and issue certified official receipts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Preview</span>
          </button>

          <a
            href="#watch-tutorial"
            onClick={(e) => {
              e.preventDefault();
              onShowToast('Tutorial: Processing client collections and multi-invoice receipts.');
            }}
            className="text-primary hover:underline text-xs font-semibold flex items-center gap-1 px-2 py-1.5"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Watch Tutorial</span>
          </a>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* A. TWO-COLUMN SPLIT ENTRY VIEW                                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT CARD (FINANCIAL ENTRIES) */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3.5 text-xs font-medium">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <span>Financial Entries</span>
            </h4>
            <span className="text-[10px] font-mono text-muted-foreground">Debtor &amp; Collection</span>
          </div>

          {/* From Accounts * (Searchable dropdown/picker) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-foreground font-semibold">From Accounts *</label>
              <span className="text-[10px] font-mono text-muted-foreground">
                Balance: ${liveClientBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-mono"
            >
              <option value="">-- Choose From Account --</option>
              {clientAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.account_number} - {a.account_name}
                </option>
              ))}
            </select>
          </div>

          {/* To Account * (Vault/Bank account - Class 5) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-foreground font-semibold">To Account *</label>
              <button
                type="button"
                onClick={() => setShowQuickAddModal(true)}
                className="text-[10px] text-emerald-700 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                title="Quick-Add New Cash Vault or Bank (#53xxx / #51xxx)"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>New Vault/Bank</span>
              </button>
            </div>
            <div className="flex items-center gap-1">
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-mono"
              >
                {bankAndVaultAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.account_number} - {a.account_name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowQuickAddModal(true)}
                className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Quick-Add New Cash Vault or Bank Account (+) [Class 5]"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-foreground mb-1 block font-semibold">Amount *</label>
              <input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                placeholder="0.00"
                step="0.01"
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono font-bold text-right focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
            </div>

            <div>
              <label className="text-foreground mb-1 block font-semibold">Currency *</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-bold"
              >
                <option value="USD">USD ($) - Base Currency</option>
                <option value="LBP">LBP (L.L) - Lebanese Pound</option>
              </select>
            </div>
          </div>

          {/* Check # */}
          <div>
            <label className="text-muted-foreground mb-1 block font-medium">Check #</label>
            <input
              type="text"
              value={checkNumber}
              onChange={(e) => setCheckNumber(e.target.value)}
              placeholder="e.g. CHQ-BLOM-88410 (optional for check collections)"
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            />
          </div>

          {/* Description* */}
          <div>
            <label className="text-foreground mb-1 block font-semibold">Description *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Formatted receipt memo (e.g., Settlement for invoice #9941 wholesale oil)..."
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            />
          </div>
        </div>

        {/* RIGHT CARD (CLASSIFICATION & TRIGGER) */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4 text-xs font-medium flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h4 className="font-bold text-foreground">Classification &amp; Trigger</h4>
              <span className="text-[10px] font-mono text-muted-foreground">Allocation Engine</span>
            </div>

            {/* Date */}
            <div>
              <label className="text-foreground mb-1 block font-semibold">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
            </div>

            {/* Department * */}
            <div>
              <label className="text-foreground mb-1 block font-semibold">Department *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              >
                <option value="Commercial Sales & Retail">Commercial Sales &amp; Retail</option>
                <option value="Executive & Administration">Executive &amp; Administration</option>
                <option value="Mill Operations">Mill Operations</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 font-semibold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={payByInvoices}
                  onChange={(e) => setPayByInvoices(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <span>Pay by invoices</span>
              </label>

              <label className="flex items-center gap-2 font-semibold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enterTaxDetails}
                  onChange={(e) => setEnterTaxDetails(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <span>Enter tax details (Compute Output VAT 11%)</span>
              </label>
            </div>
          </div>

          {/* Add Button: Transfers current record to multi-line allocation grid */}
          <div className="pt-3 border-t border-border">
            <button
              type="button"
              onClick={handleAddLine}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Allocation Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* MULTI-LINE ALLOCATION GRID */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3.5">
        <h4 className="font-bold text-sm text-foreground">Receipt Allocation Grid ({receiptLines.length})</h4>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted border-b border-border text-foreground font-semibold">
              <tr>
                <th className="p-2.5">From Account (Client)</th>
                <th className="p-2.5">To Account (Deposit)</th>
                <th className="p-2.5 text-right">Amount ($)</th>
                <th className="p-2.5">Check #</th>
                <th className="p-2.5 min-w-[200px]">Description</th>
                <th className="p-2.5">Department</th>
                <th className="p-2.5 text-center w-14">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {receiptLines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground text-xs">
                    No receipt lines added yet. Fill the form above and click &quot;Add&quot;.
                  </td>
                </tr>
              ) : (
                receiptLines.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-2.5 font-semibold text-foreground">{l.fromAccountName}</td>
                    <td className="p-2.5 text-muted-foreground font-mono">{l.toAccountName}</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-700 text-right">
                      ${l.amount.toFixed(2)}
                    </td>
                    <td className="p-2.5 font-mono text-muted-foreground">{l.checkNumber || '-'}</td>
                    <td className="p-2.5 text-foreground max-w-xs truncate">{l.description}</td>
                    <td className="p-2.5 text-muted-foreground">{l.department}</td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteLine(l.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* BOTTOM SUMMARY & BUTTONS */}
        <div className="bg-muted p-4 rounded-xl border border-border flex flex-wrap items-center justify-between gap-4">
          {/* Badges: Total Balance $ | Total Balance LBP | Total Payment */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="bg-card px-3.5 py-1.5 rounded-lg border border-border shadow-2xs">
              <span className="text-muted-foreground block text-[11px]">Total Balance $:</span>
              <span className="font-mono text-foreground text-sm font-bold">
                ${totalBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-card px-3.5 py-1.5 rounded-lg border border-border shadow-2xs">
              <span className="text-muted-foreground block text-[11px]">Total Balance LBP:</span>
              <span className="font-mono text-foreground text-sm font-bold">
                {totalBalanceLBP.toLocaleString()} LBP
              </span>
            </div>

            <div className="bg-card px-3.5 py-1.5 rounded-lg border border-border shadow-2xs">
              <span className="text-muted-foreground block text-[11px]">Total Payment:</span>
              <span className="font-mono text-emerald-700 text-sm font-bold">
                ${totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action Buttons: Save & Post (Green) and Save (Orange) */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSavingRv}
              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              {isSavingRv ? 'Saving...' : 'Save'}
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isSavingRv}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSavingRv ? 'Posting...' : 'Save & Post'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span>Preview Receipt Vouchers</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-64 text-xs">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={previewSearch}
                onChange={(e) => setPreviewSearch(e.target.value)}
                placeholder="Search by customer..."
                className="w-full bg-card border border-input rounded-lg pl-8 pr-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
            </div>

            <div className="overflow-y-auto rounded-lg border border-border flex-1 max-h-[50vh]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-muted border-b border-border text-foreground font-semibold">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">From Account</th>
                    <th className="p-2.5">RV #</th>
                    <th className="p-2.5 text-right">Amount ($)</th>
                    <th className="p-2.5 min-w-[180px]">Description</th>
                    <th className="p-2.5 text-center">Posted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {rvRecords
                    .filter(
                      (r) =>
                        r.fromAccount.toLowerCase().includes(previewSearch.toLowerCase()) ||
                        r.rv.toLowerCase().includes(previewSearch.toLowerCase()) ||
                        r.description.toLowerCase().includes(previewSearch.toLowerCase())
                    )
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                        <td className="p-2.5 font-mono text-muted-foreground">{r.date}</td>
                        <td className="p-2.5 font-semibold text-foreground">{r.fromAccount}</td>
                        <td className="p-2.5 font-mono font-bold text-primary">{r.rv}</td>
                        <td className="p-2.5 font-mono font-bold text-emerald-700 text-right">
                          ${r.amount.toFixed(2)}
                        </td>
                        <td className="p-2.5 text-foreground max-w-xs truncate">{r.description}</td>
                        <td className="p-2.5 text-center">
                          {r.posted ? (
                            <span className="bg-card text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Yes
                            </span>
                          ) : (
                            <span className="bg-card text-amber-700 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs">
                              Draft
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  {rvRecords.filter(
                    (r) =>
                      r.fromAccount.toLowerCase().includes(previewSearch.toLowerCase()) ||
                      r.rv.toLowerCase().includes(previewSearch.toLowerCase()) ||
                      r.description.toLowerCase().includes(previewSearch.toLowerCase())
                  ).length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">
                        {isLoadingRvs
                          ? 'Loading receipt vouchers from database...'
                          : 'No Receipt Vouchers found in database.'}
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      <QuickAddAccountModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        presetType="DISBURSING"
        existingAccounts={accounts}
        onSuccess={handleQuickAddSuccess}
        onShowToast={onShowToast}
      />
    </div>
  );
}
