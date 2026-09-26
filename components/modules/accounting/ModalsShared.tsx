'use client';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Vanguard ERP - Accounting Shared Modals
 * Parity with Omega ERP:
 * 1. Supporting Document URL Modal
 * 2. Search Accounts Modal (with Type filters & 'Show All' counter toggle)
 * 3. Statement Modal (Account Ledger Preview with totals & Print)
 * 4. Cascading Account Hierarchy Modals (Add Account, Add Sub Class 4, Add Sub Class 3)
 * 5. New Payment Term Modal
 * Strictly adheres to Vanguard's clean Light Enterprise Theme tokens.
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Plus,
  BookOpen,
  Printer,
  Calendar,
  ExternalLink,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  AccountDetail,
  AccountHeader3,
  AccountGroup4,
  OMEGA_SUB_CLASSES_3,
  OMEGA_SUB_CLASSES_4,
  LBP_RATE
} from '@/lib/accountingData';

// ----------------------------------------------------------------------
// 1. SUPPORTING DOCUMENT URL MODAL
// ----------------------------------------------------------------------
interface SupportingDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
  initialUrl?: string;
}

export function SupportingDocModal({ isOpen, onClose, onSave, initialUrl = '' }: SupportingDocModalProps) {
  const { t } = useLanguage();
  const [docUrl, setDocUrl] = useState(initialUrl);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-primary" />
            <span>{t('supporting_document', 'Supporting Document')}</span>
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Enter the link to your supporting document. (You can copy the link from your Google Drive or any other online drive you are using)
        </p>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">{t('document_url', 'Document Url')}</label>
          <input
            type="url"
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/..."
            className="w-full bg-card border border-input rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="bg-card hover:bg-muted text-muted-foreground px-4 py-2 rounded-lg text-xs font-semibold border border-border transition-colors cursor-pointer"
          >
            {t('cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(docUrl);
              onClose();
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            {t('save_ok', 'Save / Ok')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. SEARCH ACCOUNTS MODAL (WITH 'SHOW ALL' COUNTER TOGGLE)
// ----------------------------------------------------------------------
interface SearchAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountDetail[];
  onSelectAccount: (account: AccountDetail) => void;
  onOpenAddAccount: () => void;
  onOpenStatement: (account: AccountDetail) => void;
}

export function SearchAccountsModal({
  isOpen,
  onClose,
  accounts,
  onSelectAccount,
  onOpenAddAccount,
  onOpenStatement
}: SearchAccountsModalProps) {
  const { t } = useLanguage();
  const [typeFilter, setTypeFilter] = useState<string>('All Accounts');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAll, setShowAll] = useState<boolean>(true);

  if (!isOpen) return null;

  const totalCount = accounts.length;

  const filteredAccounts = showAll
    ? accounts.filter((acc) => {
        const matchesQuery =
          acc.account_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          acc.account_name.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesQuery) return false;

        if (typeFilter === 'All Accounts') return true;
        if (typeFilter === 'Bank') return acc.account_sub_type === 'BANK';
        if (typeFilter === 'Cash') return acc.account_sub_type === 'CASH';
        if (typeFilter === 'Customer') return acc.account_sub_type === 'CUSTOMER';
        if (typeFilter === 'Supplier') return acc.account_sub_type === 'SUPPLIER';
        if (typeFilter === 'Employee') return acc.account_sub_type === 'EMPLOYEE';
        if (typeFilter === 'Expense') return acc.account_sub_type === 'EXPENSE';
        if (typeFilter === 'Others') return acc.account_sub_type === 'OTHERS';
        return true;
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col p-5 space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <h4 className="font-bold text-sm text-foreground">Search Accounts &amp; Ledgers</h4>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-foreground border border-border">
              {filteredAccounts.length} / {totalCount}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <label className="text-muted-foreground font-semibold">{t('type', 'Type *')}</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-card border border-input rounded-lg p-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              >
                <option value="All Accounts">{t('all_accounts', 'All Accounts')}</option>
                <option value="Bank">{t('bank', 'Bank')}</option>
                <option value="Cash">{t('cash', 'Cash')}</option>
                <option value="Customer">{t('customer', 'Customer')}</option>
                <option value="Employee">{t('employee', 'Employee')}</option>
                <option value="Expense">{t('expense', 'Expense')}</option>
                <option value="Others">{t('others', 'Others')}</option>
                <option value="Supplier">{t('supplier', 'Supplier')}</option>
              </select>
            </div>

            {/* Show All Toggle with live counter */}
            <label className="flex items-center gap-1.5 font-semibold text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span>Show All ({showAll ? `${filteredAccounts.length} / ${totalCount}` : `0 / ${totalCount}`})</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search', 'Search...')}
                className="w-full bg-card border border-input rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
            </div>

            <button
              type="button"
              onClick={onOpenAddAccount}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-y-auto rounded-lg border border-border flex-1 max-h-[50vh]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-muted border-b border-border text-foreground font-semibold">
              <tr>
                <th className="p-2.5 w-32">{t('account_number', 'Account Number')}</th>
                <th className="p-2.5">{t('account_name', 'Account Name')}</th>
                <th className="p-2.5 w-28 text-right">{t('balance', 'Balance $')}</th>
                <th className="p-2.5 w-36 text-right">{t('balance_lbp', 'Balance LBP')}</th>
                <th className="p-2.5 w-16 text-center">{t('ledger', 'Ledger')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs font-medium">
                    {t('no_accounts_found', 'No Accounts Found!')}
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr
                    key={acc.id}
                    onClick={() => onSelectAccount(acc)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <td className="p-2.5 font-mono font-bold text-primary">#{acc.account_number}</td>
                    <td className="p-2.5 font-medium text-foreground">
                      <div>{acc.account_name}</div>
                      {acc.account_name_ar && (
                        <div className="text-[11px] text-muted-foreground">{acc.account_name_ar}</div>
                      )}
                    </td>
                    <td className="p-2.5 font-mono font-bold text-foreground text-right">
                      ${acc.balance_first_cur.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 font-mono text-muted-foreground text-right text-[11px]">
                      {acc.balance_sec_cur.toLocaleString()} LBP
                    </td>
                    <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onOpenStatement(acc)}
                        title={t('view_statement_of_account', 'View Statement of Account')}
                        className="text-muted-foreground hover:text-primary p-1 rounded transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="bg-card hover:bg-muted text-foreground border border-border px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            {t('close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. STATEMENT MODAL (ACCOUNT LEDGER PREVIEW)
// ----------------------------------------------------------------------
interface StatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountDetail | null;
}

export function StatementModal({ isOpen, onClose, account }: StatementModalProps) {
  const { t } = useLanguage();
  const [showAllDates, setShowAllDates] = useState<boolean>(true);
  const [fromDate, setFromDate] = useState<string>('2026-01-01');
  const [toDate, setToDate] = useState<string>('2026-12-31');
  const [query, setQuery] = useState<string>('');

  if (!isOpen || !account) return null;

  // Sample ledger transactions for preview
  const sampleTransactions = [
    {
      id: 'tx-1',
      date: '2026-09-01',
      dateOfJv: '2026-09-01',
      reference: 'OB-2026-01',
      debit: account.account_type === 'ASSET' || account.account_type === 'EXPENSE' ? account.balance_first_cur * 0.8 : 0,
      credit: account.account_type === 'LIABILITY' || account.account_type === 'REVENUE' || account.account_type === 'EQUITY' ? account.balance_first_cur * 0.8 : 0,
      remark: 'Fiscal Period Opening Balance',
      createdBy: 'Super Admin',
      department: 'Finance'
    },
    {
      id: 'tx-2',
      date: '2026-09-15',
      dateOfJv: '2026-09-15',
      reference: 'JV-2026-1984',
      debit: account.account_type === 'ASSET' ? account.balance_first_cur * 0.2 : 0,
      credit: account.account_type === 'LIABILITY' ? account.balance_first_cur * 0.2 : 0,
      remark: 'Settlement batch allocation',
      createdBy: 'Finance Controller',
      department: 'Treasury'
    }
  ];

  const totalDebit = sampleTransactions.reduce((acc, t) => acc + t.debit, 0);
  const totalCredit = sampleTransactions.reduce((acc, t) => acc + t.credit, 0);
  const netUSD = Math.abs(totalDebit - totalCredit);
  const netLBP = netUSD * LBP_RATE;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col p-5 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-foreground">
                {account.account_name} (#{account.account_number})
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-border">
                {account.account_type}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Account Balance:{' '}
              <strong className="text-foreground font-mono">
                ${account.balance_first_cur.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </strong>{' '}
              /{' '}
              <span className="font-mono">{account.balance_sec_cur.toLocaleString()} LBP</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date Filter & Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 font-semibold text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showAllDates}
                onChange={(e) => setShowAllDates(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span>{t('show_all', 'Show All')}</span>
            </label>

            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">{t('from', 'From:')}</span>
              <input
                type="date"
                value={fromDate}
                disabled={showAllDates}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-card border border-input rounded-lg p-1 text-xs text-foreground disabled:opacity-50 shadow-2xs font-mono"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">{t('to', 'To:')}</span>
              <input
                type="date"
                value={toDate}
                disabled={showAllDates}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-card border border-input rounded-lg p-1 text-xs text-foreground disabled:opacity-50 shadow-2xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-40">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search', 'Search..')}
                className="w-full bg-card border border-input rounded-lg pl-8 pr-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
            </div>

            <button
              type="button"
              onClick={() => {}}
              className="bg-card hover:bg-muted text-foreground border border-border px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              {t('preview', 'Preview')}
            </button>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.print();
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('print', 'Print')}</span>
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-y-auto rounded-lg border border-border flex-1 max-h-[45vh]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-muted border-b border-border text-foreground font-semibold">
              <tr>
                <th className="p-2.5">{t('date', 'Date')}</th>
                <th className="p-2.5">{t('date_of_jv', 'Date Of JV')}</th>
                <th className="p-2.5">{t('reference', 'Reference')}</th>
                <th className="p-2.5 text-right">Debit ($)</th>
                <th className="p-2.5 text-right">Credit ($)</th>
                <th className="p-2.5">{t('remark', 'Remark')}</th>
                <th className="p-2.5">{t('created_by', 'Created by')}</th>
                <th className="p-2.5">{t('department', 'Department')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sampleTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/40 transition-colors">
                  <td className="p-2.5 font-mono text-muted-foreground">{tx.date}</td>
                  <td className="p-2.5 font-mono text-muted-foreground">{tx.dateOfJv}</td>
                  <td className="p-2.5 font-mono font-bold text-primary">{tx.reference}</td>
                  <td className="p-2.5 font-mono font-semibold text-emerald-700 text-right">
                    {tx.debit > 0 ? `$${tx.debit.toFixed(2)}` : '-'}
                  </td>
                  <td className="p-2.5 font-mono font-semibold text-destructive text-right">
                    {tx.credit > 0 ? `$${tx.credit.toFixed(2)}` : '-'}
                  </td>
                  <td className="p-2.5 text-foreground max-w-xs truncate">{tx.remark}</td>
                  <td className="p-2.5 text-muted-foreground">{tx.createdBy}</td>
                  <td className="p-2.5 text-muted-foreground">{tx.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Calculation Bar */}
        <div className="bg-muted p-3 rounded-lg border border-border flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-muted-foreground block text-[11px]">{t('total_in', 'Total in $:')}</span>
              <span className="font-mono text-foreground font-bold">${netUSD.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">{t('total_in_lbp', 'Total in LBP:')}</span>
              <span className="font-mono text-foreground font-bold">{netLBP.toLocaleString()} LBP</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-card hover:bg-muted text-foreground border border-border px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            {t('close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. CASCADING ACCOUNT HIERARCHY MODALS (MODULE 8.C)
// ----------------------------------------------------------------------

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: AccountDetail) => void;
  subClasses4: AccountGroup4[];
  onOpenAddSubClass4: () => void;
}

export function AddAccountModal({
  isOpen,
  onClose,
  onSave,
  subClasses4,
  onOpenAddSubClass4
}: AddAccountModalProps) {
  const { t } = useLanguage();
  const [accountName, setAccountName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AccountDetail['account_type']>('ASSET');
  const [subType, setSubType] = useState<AccountDetail['account_sub_type']>('OTHERS');
  const [headerId, setHeaderId] = useState<number>(subClasses4[0]?.id || 5300);
  const [accountNumber, setAccountNumber] = useState(
    `${subClasses4[0]?.account_number_ref || '53000'}${Math.floor(10 + Math.random() * 90)}`
  );

  if (!isOpen) return null;

  const handleHeaderChange = (val: number) => {
    setHeaderId(val);
    const found = subClasses4.find((s) => s.id === val);
    if (found) {
      setAccountNumber(`${found.account_number_ref}${Math.floor(10 + Math.random() * 90)}`);
    }
  };

  const handleSave = () => {
    if (!accountName.trim()) {
      alert('Please fill Account Name*');
      return;
    }
    const typeLabel =
      subType === 'CASH'
        ? 'Cash'
        : subType === 'BANK'
        ? 'Bank'
        : subType === 'CUSTOMER'
        ? 'Customer'
        : subType === 'SUPPLIER'
        ? 'Supplier'
        : subType === 'EMPLOYEE'
        ? 'Employee'
        : subType === 'EXPENSE'
        ? 'Expense'
        : 'Other';

    const classLabel =
      type === 'ASSET'
        ? 'Assets'
        : type === 'LIABILITY'
        ? 'Liabilities'
        : type === 'EQUITY'
        ? 'Equity'
        : type === 'REVENUE'
        ? 'Revenue'
        : 'Expense';

    const newAcc: AccountDetail = {
      id: `acc-${Date.now()}`,
      tenant_id: '00000000-0000-0000-0000-000000000001',
      account_number: accountNumber,
      account_name: accountName,
      description,
      class_id: type === 'ASSET' ? 2 : type === 'LIABILITY' ? 4 : type === 'EQUITY' ? 1 : type === 'REVENUE' ? 7 : 6,
      sub_class4_id: headerId,
      account_type: type,
      account_sub_type: subType,
      type: typeLabel,
      class_type: classLabel,
      currency_id: 'USD',
      balance_first_cur: 0,
      balance_sec_cur: 0,
      checking_account: subType === 'BANK' || subType === 'CASH',
      is_active: true
    };
    onSave(newAcc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            <span>{t('add_account', 'Add Account')}</span>
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs font-medium">
          <div>
            <label className="text-foreground mb-1 block font-semibold">{t('account_name', 'Account Name *')}</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder={t('eg_special_extra_virgin_reserve', 'e.g. Special Extra Virgin Reserve')}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block">{t('description', 'Description')}</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('enter_functional_accounting_notes', 'Enter functional accounting notes...')}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-foreground mb-1 block font-semibold">{t('type', 'Type *')}</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              >
                <option value="ASSET">{t('assets', 'Assets')}</option>
                <option value="LIABILITY">{t('liabilities', 'Liabilities')}</option>
                <option value="EQUITY">{t('equity', 'Equity')}</option>
                <option value="REVENUE">{t('revenue', 'Revenue')}</option>
                <option value="EXPENSE">{t('expense', 'Expense')}</option>
              </select>
            </div>

            <div>
              <label className="text-foreground mb-1 block font-semibold">{t('sub_type', 'Sub Type')}</label>
              <select
                value={subType}
                onChange={(e) => setSubType(e.target.value as any)}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              >
                <option value="OTHERS">{t('others', 'Others')}</option>
                <option value="BANK">{t('bank', 'Bank')}</option>
                <option value="CASH">{t('cash', 'Cash')}</option>
                <option value="CUSTOMER">{t('customer', 'Customer')}</option>
                <option value="SUPPLIER">{t('supplier', 'Supplier')}</option>
                <option value="EMPLOYEE">{t('employee', 'Employee')}</option>
                <option value="EXPENSE">{t('expense', 'Expense')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-foreground mb-1 block font-semibold flex items-center justify-between">
              <span>{t('account_header', 'Account Header *')}</span>
              <button
                type="button"
                onClick={onOpenAddSubClass4}
                className="text-primary hover:underline text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Header</span>
              </button>
            </label>
            <select
              value={headerId}
              onChange={(e) => handleHeaderChange(Number(e.target.value))}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-mono"
            >
              {subClasses4.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.account_number_ref} - {s.account_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground mb-1 block font-medium">{t('class', 'Class')}</label>
              <input
                type="text"
                readOnly
                value={`Class ${type === 'ASSET' ? '2 & 3' : type === 'LIABILITY' ? '4' : type === 'EQUITY' ? '1' : type === 'REVENUE' ? '7' : '6'}`}
                className="w-full bg-muted border border-input rounded-lg p-2 text-muted-foreground font-mono shadow-2xs"
              />
            </div>
            <div>
              <label className="text-foreground mb-1 block font-semibold">{t('account_number', 'Account Number')}</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="bg-card hover:bg-muted text-muted-foreground px-4 py-2 rounded-lg text-xs font-semibold border border-border transition-colors cursor-pointer"
          >
            {t('cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            {t('save_account', 'Save Account')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// ADD SUB CLASSES 4 MODAL
// ----------------------------------------------------------------------
interface AddSubClass4ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: AccountGroup4) => void;
  subClasses3: AccountHeader3[];
  onOpenAddSubClass3: () => void;
}

export function AddSubClass4Modal({
  isOpen,
  onClose,
  onSave,
  subClasses3,
  onOpenAddSubClass3
}: AddSubClass4ModalProps) {
  const { t } = useLanguage();
  const [accountName, setAccountName] = useState('');
  const [headerNumber, setHeaderNumber] = useState(
    `${subClasses3[0]?.account_number_ref || '5300'}0`
  );
  const [subClass3Id, setSubClass3Id] = useState<number>(subClasses3[0]?.id || 530);
  const [classType, setClassType] = useState<'Assets' | 'Expense' | 'Liabilities' | 'Equity' | 'Revenue'>('Assets');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!accountName.trim() || !headerNumber.trim()) {
      alert('Please fill all required fields marked with *');
      return;
    }
    const newGroup: AccountGroup4 = {
      id: Date.now(),
      sub_class3_id: subClass3Id,
      account_number_ref: Number(headerNumber) || 53000,
      account_name: accountName,
      depreciation_interval: 'NONE'
    };
    onSave(newGroup);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            <span>{t('add_account_sub_classes_4', 'Add Account Sub Classes 4')}</span>
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs font-medium">
          <div>
            <label className="text-foreground mb-1 block font-semibold">{t('account_name', 'Account Name *')}</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder={t('eg_vault_cash_reserves', 'e.g. Vault Cash Reserves')}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            />
          </div>

          <div>
            <label className="text-foreground mb-1 block font-semibold">{t('account_header_number', 'Account Header Number *')}</label>
            <input
              type="text"
              value={headerNumber}
              onChange={(e) => setHeaderNumber(e.target.value)}
              placeholder={t('eg_53000', 'e.g. 53000')}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            />
          </div>

          <div>
            <label className="text-foreground mb-1 block font-semibold flex items-center justify-between">
              <span>{t('account_sub_class_3', 'Account Sub Class 3 *')}</span>
              <button
                type="button"
                onClick={onOpenAddSubClass3}
                className="text-primary hover:underline text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Sub Class 3</span>
              </button>
            </label>
            <select
              value={subClass3Id}
              onChange={(e) => setSubClass3Id(Number(e.target.value))}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-mono"
            >
              {subClasses3.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.account_number_ref} - {s.account_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-foreground mb-1 block font-semibold">{t('account_class_type', 'Account Class Type *')}</label>
            <select
              value={classType}
              onChange={(e) => setClassType(e.target.value as any)}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            >
              <option value="Assets">{t('assets', 'Assets')}</option>
              <option value="Expense">{t('expense', 'Expense')}</option>
              <option value="Liabilities">{t('liabilities', 'Liabilities')}</option>
              <option value="Equity">{t('equity', 'Equity')}</option>
              <option value="Revenue">{t('revenue', 'Revenue')}</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="bg-card hover:bg-muted text-muted-foreground px-4 py-2 rounded-lg text-xs font-semibold border border-border transition-colors cursor-pointer"
          >
            {t('cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            {t('save', 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// ADD SUB CLASSES 3 MODAL
// ----------------------------------------------------------------------
interface AddSubClass3ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (header: AccountHeader3) => void;
}

export function AddSubClass3Modal({ isOpen, onClose, onSave }: AddSubClass3ModalProps) {
  const { t } = useLanguage();
  const [accountName, setAccountName] = useState('');
  const [headerNumber, setHeaderNumber] = useState('');
  const [subClass2, setSubClass2] = useState('53 - Vaults & Cash');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!accountName.trim() || !headerNumber.trim()) {
      alert('Please fill all required fields marked with *');
      return;
    }
    const newHeader: AccountHeader3 = {
      id: Date.now(),
      sub_class2_id: 53,
      account_number_ref: Number(headerNumber) || 5300,
      account_name: accountName
    };
    onSave(newHeader);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            <span>{t('add_account_sub_classes_3', 'Add Account Sub Classes 3')}</span>
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs font-medium">
          <div>
            <label className="text-foreground mb-1 block font-semibold">{t('account_name', 'Account Name *')}</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder={t('eg_cash_vaults_petty_cash', 'e.g. Cash Vaults & Petty Cash')}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            />
          </div>

          <div>
            <label className="text-foreground mb-1 block font-semibold">{t('account_header_number', 'Account Header Number *')}</label>
            <input
              type="text"
              value={headerNumber}
              onChange={(e) => setHeaderNumber(e.target.value)}
              placeholder={t('eg_5300', 'e.g. 5300')}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            />
          </div>

          <div>
            <label className="text-foreground mb-1 block font-semibold">{t('account_sub_class_2', 'Account Sub Class 2 *')}</label>
            <select
              value={subClass2}
              onChange={(e) => setSubClass2(e.target.value)}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            >
              <option value="53 - Vaults & Cash">53 - Vaults &amp; Cash</option>
              <option value="51 - Financial Institutions">51 - Financial Institutions</option>
              <option value="40 - Suppliers & Payables">40 - Suppliers &amp; Payables</option>
              <option value="41 - Customers & Receivables">41 - Customers &amp; Receivables</option>
              <option value="61 - External Services">61 - External Services</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="bg-card hover:bg-muted text-muted-foreground px-4 py-2 rounded-lg text-xs font-semibold border border-border transition-colors cursor-pointer"
          >
            {t('cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            {t('save', 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// NEW PAYMENT TERM MODAL (FROM MODULE 6.B)
// ----------------------------------------------------------------------
interface NewPaymentTermModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (term: { description: string; days: number }) => void;
}

export function NewPaymentTermModal({ isOpen, onClose, onSave }: NewPaymentTermModalProps) {
  const { t } = useLanguage();
  const [description, setDescription] = useState('');
  const [days, setDays] = useState(30);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h4 className="font-bold text-sm text-foreground">{t('new_payment_term', 'New Payment Term')}</h4>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs font-medium">
          <div>
            <label className="text-foreground mb-1 block font-semibold">{t('description', 'Description *')}</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('eg_net_45_days', 'e.g. Net 45 Days')}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            />
          </div>

          <div>
            <label className="text-foreground mb-1 block font-semibold">{t('nb_of_days', 'Nb. Of Days *')}</label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              min={0}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="bg-card hover:bg-muted text-muted-foreground px-4 py-1.5 rounded-lg text-xs font-semibold border border-border transition-colors cursor-pointer"
          >
            {t('cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!description.trim()) {
                alert('Please enter description');
                return;
              }
              onSave({ description, days });
              onClose();
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            {t('save', 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
}
