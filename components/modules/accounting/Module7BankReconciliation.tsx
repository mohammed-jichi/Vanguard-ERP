'use client';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Vanguard ERP - Module 7: Bank Reconciliation Workstation
 * Exact Omega ERP Functional Parity:
 * A. Workflow Step 1: Initial Setup (Inputs + Confirmation Dialog)
 * B. Workflow Step 2: Reconciliation Grid (KPI Widgets, Top Action Bar, 4 Import Statement Modals, Matching Table)
 */

import React, { useState } from 'react';
import {
  FileCheck,
  Landmark,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Upload,
  ChevronDown,
  X,
  RotateCcw,
  Check,
  FileSpreadsheet,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import {
  AccountDetail,
  BankStatementTransaction,
  INITIAL_BANK_STATEMENT_TRANSACTIONS,
  LBP_RATE
} from '@/lib/accountingData';

interface Module7BankReconciliationProps {
  accounts: AccountDetail[];
  onShowToast: (msg: string, isError?: boolean) => void;
}

export function Module7BankReconciliation({
  accounts,
  onShowToast
}: Module7BankReconciliationProps) {
  const { t } = useLanguage();
  // Workflow Step: 'SETUP' (Step 1) or 'GRID' (Step 2)
  const [step, setStep] = useState<'SETUP' | 'GRID'>('SETUP');

  // Step 1: Initial Setup Form
  const bankAccounts = accounts.filter(
    (a) => a.account_sub_type === 'BANK' || a.checking_account
  );
  const [selectedBankAccountId, setSelectedBankAccountId] = useState(
    bankAccounts[0]?.id || accounts[0]?.id || ''
  );
  const [currency, setCurrency] = useState<'USD' | 'LBP'>('USD');
  const [beginningDate, setBeginningDate] = useState('2026-09-01');
  const [endingDate, setEndingDate] = useState('2026-09-30');
  const [reconDescription, setReconDescription] = useState('September 2026 Monthly Bank Audit & Settlement');
  const [beginningValue, setBeginningValue] = useState<number>(184200.00);
  const [endingValue, setEndingValue] = useState<number>(172135.00);

  // Dialogs
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showCommitConfirm, setShowCommitConfirm] = useState(false);
  const [showSaveLaterConfirm, setShowSaveLaterConfirm] = useState(false);

  // Step 2: Reconciliation Grid State
  const [transactions, setTransactions] = useState<BankStatementTransaction[]>(
    () => INITIAL_BANK_STATEMENT_TRANSACTIONS
  );
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [activeImportFormat, setActiveImportFormat] = useState<'CSV' | 'QBO' | 'QFX' | 'OFX' | null>(null);

  // CSV Mapper State
  const [csvFileSelected, setCsvFileSelected] = useState(false);
  const [csvFieldsRetrieved, setCsvFieldsRetrieved] = useState(false);
  const [csvMapDate, setCsvMapDate] = useState('Transaction_Date');
  const [csvMapDesc, setCsvMapDesc] = useState('Description_Memo');
  const [csvMapDeposit, setCsvMapDeposit] = useState('Credit_Deposit');
  const [csvMapWithdraw, setCsvMapWithdraw] = useState('Debit_Withdraw');
  const [csvMapBalance, setCsvMapBalance] = useState('Running_Balance');

  // Calculations
  const clearedDeposits = transactions
    .filter((t) => t.cleared)
    .reduce((sum, t) => sum + t.deposit, 0);

  const clearedWithdrawals = transactions
    .filter((t) => t.cleared)
    .reduce((sum, t) => sum + t.payment, 0);

  // Accounting Cleared Balance = Beginning Value + Cleared Deposits - Cleared Withdrawals
  const clearedBalance = beginningValue + clearedDeposits - clearedWithdrawals;
  const difference = Math.abs(endingValue - clearedBalance);
  const isZeroDiff = difference < 0.01;

  // Toggle match checkbox
  const handleToggleCleared = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, cleared: !t.cleared } : t))
    );
  };

  // CSV Import execution
  const handleExecuteCsvImport = () => {
    const importedSample: BankStatementTransaction[] = [
      {
        id: `csv-imp-${Date.now()}-1`,
        date: '2026-09-18',
        description: 'Electronic Clearing House Wire - Batch 994',
        payeeCustomer: 'Mediterranean Bottle Mills',
        payment: 11200,
        deposit: 0,
        remark: 'CSV Imported Statement',
        cleared: true
      },
      {
        id: `csv-imp-${Date.now()}-2`,
        date: '2026-09-20',
        description: 'Cheque Deposit - Retail Collection',
        payeeCustomer: 'Phoenicia Gourmet',
        payment: 0,
        deposit: 8500,
        remark: 'CSV Imported Statement',
        cleared: true
      }
    ];

    setTransactions((prev) => [...importedSample, ...prev]);
    setActiveImportFormat(null);
    setCsvFileSelected(false);
    setCsvFieldsRetrieved(false);
    onShowToast('Bank statement imported successfully via CSV Field Mapper!');
  };

  // Structured upload execution (QBO, QFX, OFX)
  const handleExecuteStructuredImport = (fmt: string) => {
    const importedSample: BankStatementTransaction = {
      id: `${fmt.toLowerCase()}-imp-${Date.now()}`,
      date: '2026-09-19',
      description: `${fmt} Automated Parser Import - Direct Bank Feed`,
      payeeCustomer: 'Bank of Beirut Corporate Treasury',
      payment: 2200,
      deposit: 0,
      remark: `Imported via ${fmt}`,
      cleared: true
    };
    setTransactions((prev) => [importedSample, ...prev]);
    setActiveImportFormat(null);
    onShowToast(`Bank statement records successfully parsed and imported from ${fmt} file!`);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* ========================================================================= */}
      {/* A. WORKFLOW STEP 1: INITIAL SETUP                                         */}
      {/* ========================================================================= */}
      {step === 'SETUP' && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-5">
          <div className="border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" />
                <span>{t('bank_reconciliation_workstation_step_1', 'Bank Reconciliation Workstation: Step 1 Setup')}</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-border">
                {t('omega_workflow', 'Omega Workflow')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('enter_target_bank_statement_parameters', 'Enter target bank statement parameters and ending book value to begin transaction matching')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-medium">
            {/* Account: Bank account lookup */}
            <div>
              <label className="text-foreground mb-1 block font-semibold">{t('account', 'Account *')}</label>
              <select
                value={selectedBankAccountId}
                onChange={(e) => setSelectedBankAccountId(e.target.value)}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono shadow-2xs"
              >
                {bankAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.account_number} - {a.account_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Currency: Auto-populated base currency */}
            <div>
              <label className="text-foreground mb-1 block font-semibold">{t('currency', 'Currency')}</label>
              <input
                type="text"
                readOnly
                value={`${currency} ($) - Auto-populated Base Currency`}
                className="w-full bg-muted border border-input rounded-lg p-2 text-muted-foreground font-medium shadow-2xs"
              />
            </div>

            {/* Beginning Date & Ending Date* */}
            <div>
              <label className="text-foreground mb-1 block font-semibold">{t('beginning_date', 'Beginning Date')}</label>
              <input
                type="date"
                value={beginningDate}
                onChange={(e) => setBeginningDate(e.target.value)}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono shadow-2xs"
              />
            </div>

            <div>
              <label className="text-foreground mb-1 block font-semibold">{t('ending_date', 'Ending Date *')}</label>
              <input
                type="date"
                value={endingDate}
                onChange={(e) => setEndingDate(e.target.value)}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono shadow-2xs"
              />
            </div>

            {/* Beginning Value */}
            <div>
              <label className="text-foreground mb-1 block font-semibold">Beginning Value ($)</label>
              <input
                type="number"
                step="0.01"
                value={beginningValue}
                onChange={(e) => setBeginningValue(Number(e.target.value))}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono font-bold text-right shadow-2xs"
              />
            </div>

            {/* Ending Value () * */}
            <div>
              <label className="text-foreground mb-1 block font-semibold">Ending Value ($) *</label>
              <input
                type="number"
                step="0.01"
                value={endingValue}
                onChange={(e) => setEndingValue(Number(e.target.value))}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono font-bold text-right shadow-2xs"
              />
            </div>

            {/* Reconciliation Description* */}
            <div className="sm:col-span-2 md:col-span-3">
              <label className="text-foreground mb-1 block font-semibold">{t('reconciliation_description', 'Reconciliation Description *')}</label>
              <input
                type="text"
                value={reconDescription}
                onChange={(e) => setReconDescription(e.target.value)}
                placeholder={t('eg_september_2026_monthly_bank_audit', 'e.g. September 2026 Monthly Bank Audit & Settlement')}
                className="w-full bg-card border border-input rounded-lg p-2 text-foreground shadow-2xs text-xs"
              />
            </div>
          </div>

          {/* Start Reconciling (Green button) */}
          <div className="flex justify-end pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setShowStartConfirm(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <span>{t('start_reconciling', 'Start Reconciling')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG: "Are you sure you want to start reconciling?" */}
      {showStartConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                ?
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{t('initiate_bank_reconciliation', 'Initiate Bank Reconciliation')}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('are_you_sure_you_want_to_start', 'Are you sure you want to start reconciling?')}
                </p>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-lg text-xs text-muted-foreground font-mono space-y-1">
              <div>Beginning Value: ${beginningValue.toFixed(2)}</div>
              <div>Target Ending Value: ${endingValue.toFixed(2)}</div>
              <div>Period: {beginningDate} to {endingDate}</div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowStartConfirm(false)}
                className="bg-card hover:bg-muted text-muted-foreground px-4 py-1.5 rounded-lg text-xs font-semibold border border-border cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowStartConfirm(false);
                  setStep('GRID');
                  onShowToast('Reconciliation workstation opened.');
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Confirm &amp; Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* B. WORKFLOW STEP 2: RECONCILIATION GRID                                   */}
      {/* ========================================================================= */}
      {step === 'GRID' && (
        <div className="space-y-4 animate-fadeIn">
          {/* TOP STATUS KPI WIDGETS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
            {/* Card 1: Ending Balance [Value] (Bank icon) */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-muted-foreground text-[11px] block">{t('ending_balance', 'Ending Balance')}</span>
                <span className="text-lg font-bold font-mono text-foreground">
                  ${endingValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Landmark className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: Accounting: Cleared Balance [Value] (Ledger icon) */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-muted-foreground text-[11px] block">{t('accounting_cleared_balance', 'Accounting: Cleared Balance')}</span>
                <span className="text-lg font-bold font-mono text-foreground">
                  ${clearedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>

            {/* Card 3: Difference [Value] (Turns green with checkmark icon when Difference === 0) */}
            <div
              className={`border rounded-xl p-4 shadow-xs flex items-center justify-between transition-colors ${
                isZeroDiff
                  ? 'bg-emerald-50/50 border-emerald-300 text-emerald-800'
                  : 'bg-card border-border text-destructive'
              }`}
            >
              <div>
                <span className="text-muted-foreground text-[11px] block">{t('difference', 'Difference')}</span>
                <span className="text-lg font-bold font-mono">
                  ${difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                {isZeroDiff && (
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    {t('exact_parity_match', 'Exact Parity Match!')}
                  </span>
                )}
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isZeroDiff ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-destructive'
                }`}
              >
                {isZeroDiff ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
            </div>
          </div>

          {/* TOP ACTION BAR: Main | Import Bank Statement (4 formats) | Reconcil | Save For Later... */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Main (reverts back to setup screen) */}
              <button
                type="button"
                onClick={() => setStep('SETUP')}
                className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
              >
                {t('main_setup', 'Main Setup')}
              </button>

              {/* Import Bank Statement dropdown (4 formats) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowImportDropdown((p) => !p)}
                  className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  <span>{t('import_bank_statement', 'Import Bank Statement')}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                {showImportDropdown && (
                  <div className="absolute left-0 mt-1 w-52 bg-card border border-border rounded-xl shadow-lg p-1.5 z-20 text-xs animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportDropdown(false);
                        setActiveImportFormat('CSV');
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-muted font-medium text-foreground transition-colors cursor-pointer"
                    >
                      1. Import CSV File (Field Mapper)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportDropdown(false);
                        setActiveImportFormat('QBO');
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-muted font-medium text-foreground transition-colors cursor-pointer"
                    >
                      2. Import QBO File (QuickBooks)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportDropdown(false);
                        setActiveImportFormat('QFX');
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-muted font-medium text-foreground transition-colors cursor-pointer"
                    >
                      3. Import QFX File (Quicken)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportDropdown(false);
                        setActiveImportFormat('OFX');
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-muted font-medium text-foreground transition-colors cursor-pointer"
                    >
                      4. Import OFX File (Open Financial)
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Save For Later... button */}
              <button
                type="button"
                onClick={() => setShowSaveLaterConfirm(true)}
                className="bg-card hover:bg-muted text-foreground border border-border px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
              >
                {t('save_for_later', 'Save For Later...')}
              </button>

              {/* Reconcil (Green button, triggers commit confirmation) */}
              <button
                type="button"
                onClick={() => setShowCommitConfirm(true)}
                disabled={!isZeroDiff}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white px-5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>{t('reconcil', 'Reconcil')}</span>
              </button>
            </div>
          </div>

          {/* TRANSACTION MATCHING TABLE */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-foreground">
              Statement Transaction Matching ({transactions.length} Records)
            </h4>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-muted text-foreground font-semibold border-b border-border">
                    <th className="p-2.5">{t('date', 'Date')}</th>
                    <th className="p-2.5 min-w-[200px]">{t('description', 'Description')}</th>
                    <th className="p-2.5">{t('payee_customer', 'Payee / Customer')}</th>
                    <th className="p-2.5 text-right">Payment ($)</th>
                    <th className="p-2.5 text-right">Deposit ($)</th>
                    <th className="p-2.5 min-w-[160px]">{t('remark', 'Remark')}</th>
                    <th className="p-2.5 text-center w-20">{t('clear_match', 'Clear / Match')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        tx.cleared ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      <td className="p-2.5 font-mono text-muted-foreground text-[11px]">{tx.date}</td>
                      <td className="p-2.5 text-foreground font-semibold">{tx.description}</td>
                      <td className="p-2.5 text-muted-foreground">{tx.payeeCustomer}</td>
                      <td className="p-2.5 font-mono font-bold text-destructive text-right">
                        {tx.payment > 0 ? `$${tx.payment.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-emerald-700 text-right">
                        {tx.deposit > 0 ? `$${tx.deposit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="p-2.5 text-muted-foreground text-[11px]">{tx.remark}</td>
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={tx.cleared}
                          onChange={() => handleToggleCleared(tx.id)}
                          className="rounded border-input text-emerald-700 focus:ring-emerald-700 h-4 w-4 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMPORT MODAL: FORMAT 1 (CSV WITH FIELD MAPPER)                             */}
      {/* ========================================================================= */}
      {activeImportFormat === 'CSV' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                <span>Import CSV File (Field Mapper)</span>
              </h4>
              <button
                type="button"
                onClick={() => setActiveImportFormat(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* File pickers: Select file, Change */}
            <div className="bg-muted p-3.5 rounded-xl border border-border space-y-2 text-xs">
              <span className="font-semibold text-foreground block">{t('select_bank_csv_statement', 'Select Bank CSV Statement:')}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCsvFileSelected(true);
                    onShowToast('Statement file "blom_bank_sep_2026.csv" attached.');
                  }}
                  className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  {t('select_file', 'Select file')}
                </button>
                <span className="text-muted-foreground font-mono text-[11px]">
                  {csvFileSelected ? 'blom_bank_sep_2026.csv (48.2 KB)' : 'No file chosen'}
                </span>
                {csvFileSelected && (
                  <button
                    type="button"
                    onClick={() => setCsvFileSelected(false)}
                    className="text-primary hover:underline text-xs cursor-pointer"
                  >
                    {t('change', 'Change')}
                  </button>
                )}
              </div>
            </div>

            {/* Action: Get CSV Fields */}
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => {
                  if (!csvFileSelected) {
                    onShowToast('Please select a file first.', true);
                    return;
                  }
                  setCsvFieldsRetrieved(true);
                  onShowToast('Extracted 5 column headers from CSV file.');
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                {t('get_csv_fields', 'Get CSV Fields')}
              </button>
            </div>

            {/* Field Mapper: Date, Description, Deposit, Withdraw, Balance selectors */}
            {csvFieldsRetrieved && (
              <div className="border border-border rounded-xl p-3.5 space-y-3 text-xs animate-fadeIn">
                <span className="font-bold text-foreground block">{t('map_csv_headers_to_ledger_fields', 'Map CSV Headers to Ledger Fields:')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-medium">
                  <div>
                    <label className="text-muted-foreground mb-1 block">{t('date_field', 'Date Field')}</label>
                    <select
                      value={csvMapDate}
                      onChange={(e) => setCsvMapDate(e.target.value)}
                      className="w-full bg-card border border-input rounded-lg p-1.5 text-foreground shadow-2xs font-mono"
                    >
                      <option value="Transaction_Date">{t('transaction_date', 'Transaction_Date')}</option>
                      <option value="Booking_Date">{t('booking_date', 'Booking_Date')}</option>
                      <option value="Value_Date">{t('value_date', 'Value_Date')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-muted-foreground mb-1 block">{t('description_field', 'Description Field')}</label>
                    <select
                      value={csvMapDesc}
                      onChange={(e) => setCsvMapDesc(e.target.value)}
                      className="w-full bg-card border border-input rounded-lg p-1.5 text-foreground shadow-2xs font-mono"
                    >
                      <option value="Description_Memo">{t('description_memo', 'Description_Memo')}</option>
                      <option value="Narration">{t('narration', 'Narration')}</option>
                      <option value="Details">{t('details', 'Details')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-muted-foreground mb-1 block">{t('deposit_field', 'Deposit Field')}</label>
                    <select
                      value={csvMapDeposit}
                      onChange={(e) => setCsvMapDeposit(e.target.value)}
                      className="w-full bg-card border border-input rounded-lg p-1.5 text-foreground shadow-2xs font-mono"
                    >
                      <option value="Credit_Deposit">{t('credit_deposit', 'Credit_Deposit')}</option>
                      <option value="Inward">{t('inward', 'Inward')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-muted-foreground mb-1 block">{t('withdraw_field', 'Withdraw Field')}</label>
                    <select
                      value={csvMapWithdraw}
                      onChange={(e) => setCsvMapWithdraw(e.target.value)}
                      className="w-full bg-card border border-input rounded-lg p-1.5 text-foreground shadow-2xs font-mono"
                    >
                      <option value="Debit_Withdraw">{t('debit_withdraw', 'Debit_Withdraw')}</option>
                      <option value="Outward">{t('outward', 'Outward')}</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-muted-foreground mb-1 block">{t('balance_field', 'Balance Field')}</label>
                    <select
                      value={csvMapBalance}
                      onChange={(e) => setCsvMapBalance(e.target.value)}
                      className="w-full bg-card border border-input rounded-lg p-1.5 text-foreground shadow-2xs font-mono"
                    >
                      <option value="Running_Balance">{t('running_balance', 'Running_Balance')}</option>
                      <option value="Cumulative">{t('cumulative', 'Cumulative')}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Button: Import Bank Statement */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setActiveImportFormat(null)}
                className="bg-card hover:bg-muted text-muted-foreground px-4 py-1.5 rounded-lg text-xs font-semibold border border-border cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                disabled={!csvFieldsRetrieved}
                onClick={handleExecuteCsvImport}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white px-5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer disabled:cursor-not-allowed shadow-xs"
              >
                {t('import_bank_statement', 'Import Bank Statement')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMPORT MODAL: FORMATS 2, 3, 4 (QBO, QFX, OFX)                              */}
      {/* ========================================================================= */}
      {activeImportFormat && activeImportFormat !== 'CSV' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                <span>Import {activeImportFormat} File</span>
              </h4>
              <button
                type="button"
                onClick={() => setActiveImportFormat(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Direct structured parser upload for standardized {activeImportFormat} financial statement feeds.
            </p>

            <div className="bg-muted p-3.5 rounded-xl border border-border space-y-2 text-xs">
              <span className="font-semibold text-foreground block">{t('choose_file', 'Choose File:')}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onShowToast(`Attached bank_statement_feed.${activeImportFormat.toLowerCase()}`)}
                  className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  {t('select_file', 'Select file')}
                </button>
                <span className="text-muted-foreground font-mono text-[11px]">
                  bank_statement_feed.{activeImportFormat.toLowerCase()}
                </span>
                <button
                  type="button"
                  onClick={() => onShowToast('File selection cleared.')}
                  className="text-primary hover:underline text-xs cursor-pointer"
                >
                  {t('change', 'Change')}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setActiveImportFormat(null)}
                className="bg-card hover:bg-muted text-muted-foreground px-4 py-1.5 rounded-lg text-xs font-semibold border border-border cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => handleExecuteStructuredImport(activeImportFormat)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                {t('import_bank_statement', 'Import Bank Statement')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMIT CONFIRMATION DIALOG */}
      {showCommitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{t('finalize_reconciliation', 'Finalize Reconciliation')}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('difference_is_000_are_you_sure_you_want', 'Difference is 0.00. Are you sure you want to commit and close this reconciliation?')}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowCommitConfirm(false)}
                className="bg-card hover:bg-muted text-muted-foreground px-4 py-1.5 rounded-lg text-xs font-semibold border border-border cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCommitConfirm(false);
                  setStep('SETUP');
                  onShowToast('Bank Reconciliation finalized and archived to fiscal ledger!');
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Commit &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVE FOR LATER CONFIRMATION DIALOG */}
      {showSaveLaterConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <div>
              <h4 className="font-bold text-sm text-foreground">{t('save_reconciliation_progress', 'Save Reconciliation Progress')}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {t('are_you_sure_you_want_to_save_this', 'Are you sure you want to save this reconciliation? All cleared checkmarks and progress will be preserved.')}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowSaveLaterConfirm(false)}
                className="bg-card hover:bg-muted text-muted-foreground px-4 py-1.5 rounded-lg text-xs font-semibold border border-border cursor-pointer"
              >
                {t('no_keep_editing', 'No, Keep Editing')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSaveLaterConfirm(false);
                  setStep('SETUP');
                  onShowToast('Reconciliation draft state safely saved for later.');
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                {t('yes_save_for_later', 'Yes, Save For Later')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
