'use client';

/**
 * Vanguard ERP - Module 2: Accounting Purchases & Expenses Console
 * 100% Parity with Omega ERP & Vanguard Modern Corporate Theme
 * Featuring Advance Settlement & Reconciliation Lifecycle:
 * 1. Top Header & Voucher Controls:
 *    - Title: "Accounting Purchase & Expenses Console"
 *    - Subtitle: "Record supplier purchase bills, operational expenditures, and recurring payment orders"
 *    - Top Right: + New, Preview, Actions Dropdown (Recall Recurring), Supporting Document
 *    - Inputs: Date*, Currency*, Type*, Enter Payment Details checkbox, Description*, Internal Remark
 * 2. Inline Payment Execution & Lifecycle (Multi-Disbursement):
 *    - Multi-line payment support with columns:
 *      # | Payment Method | Disbursing Account | Amount Paid | Cheque / Wire Ref # | Payment Date | Department | Action (+ / Delete)
 *    - Advance Settlement / Reconciliation Lifecycle:
 *      * Scenario: Employee advance ($1500) vs actual bills ($1560) -> Difference $60 underpaid.
 *      * Unclosed Case (Pending Settlement): When posted with underpaid difference, expense rows & advance row are locked.
 *      * In-Voucher Settlement: User clicks +, selects Cash & Cash Vault, enters 60.
 *      * Status automatically transitions to "Fully Closed & Reconciled" and entire voucher is sealed.
 * 3. Purchase & Expense Allocation Grid:
 *    - A. Fixed Purchase Row ("Purchase From: (Supplier / Creditor Control Account)")
 *    - B. Dynamic Expense Allocation Rows ("Expense Account Breakdown:") with strict validation on `+`:
 *         Checks Account & Amount; if empty, highlights red border and triggers: "Choose From Account".
 * 4. Footer Controls & Totals:
 *    - Left: Total Voucher Value: "Total: 0.00 $   0 LBP"
 *    - Right: Clear (Red outline), Store As Recurring (Blue), Save (Orange), Save & Post (Green)
 * 5. Associated Modals:
 *    - Preview Expense Modal (search, filter by status, ledger preview, load/reconcile item)
 *    - Expense Recurring Modal (stored recurring templates)
 *    - Supporting Document Modal ("Enter the link to your supporting document...")
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  RotateCcw,
  Eye,
  FileText,
  ChevronDown,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Check,
  Link as LinkIcon,
  CreditCard,
  Building,
  Lock,
  ArrowRight,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import {
  AccountDetail,
  ExpenseRecurringTemplate,
  INITIAL_RECURRING_EXPENSES,
  LBP_RATE,
  isCashAccount,
  isBankAccount,
  isDisbursingAccount,
  isSupplierAccount,
  isExpenseAccount,
  isTreasuryDisbursingAccount,
  isTradeSupplierAccount,
  isPurchaseExpenseOrAssetAccount
} from '@/lib/accountingData';
import {
  apiSaveExpense,
  apiFetchExpenses,
  subscribeToAccountingSync
} from '@/lib/accountingPersistenceService';
import QuickAddAccountModal, { QuickAddPreset } from './QuickAddAccountModal';

export type VoucherLifecycleStatus =
  | 'NEW'
  | 'DRAFT'
  | 'UNCLOSED_PENDING_SETTLEMENT'
  | 'FULLY_CLOSED_RECONCILED';

export interface ExpenseAllocationRow {
  id: string;
  accountId: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  department: string;
  description: string;
  refInvoice: string;
  hasError?: boolean;
}

export interface PaymentExecutionRow {
  id: string;
  paymentMethod: 'Cash' | 'Commercial Bank Check' | 'Wire Transfer' | 'Credit Card';
  disbursingAccount: string;
  amountPaid: number;
  refNumber: string;
  paymentDate: string;
  department: string;
  isLocked?: boolean;
}

export interface PreviewExpenseRecord {
  id: string;
  payee: string;
  reference: string;
  date: string;
  ev: string;
  dateOfEv: string;
  amount: number;
  totalDisbursed: number;
  description: string;
  enteredBy: string;
  department: string;
  posted: boolean;
  status: VoucherLifecycleStatus;
  purchaseAccountId?: string;
  purchaseDept?: string;
  purchaseRef?: string;
  expenseRows?: ExpenseAllocationRow[];
  paymentRows?: PaymentExecutionRow[];
  supportingDocUrl?: string;
}

interface Module2PurchasesExpensesProps {
  accounts: AccountDetail[];
  onShowToast: (msg: string, isError?: boolean) => void;
  onPostVoucherToJv?: (jv: any) => void;
}

export function Module2PurchasesExpenses({
  accounts,
  onShowToast,
  onPostVoucherToJv
}: Module2PurchasesExpensesProps) {
  // Current date helper
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filtered account groups for lookups (Strict Lebanese PCG standard)
  const supplierAccounts = useMemo(() => {
    const list = accounts.filter(isTradeSupplierAccount);
    return list.length > 0 ? list : accounts.filter((a) => a.account_number.startsWith('40'));
  }, [accounts]);

  const disbursingAccounts = useMemo(() => {
    const list = accounts.filter(isTreasuryDisbursingAccount);
    return list.length > 0 ? list : accounts.filter((a) => a.account_number.startsWith('5'));
  }, [accounts]);

  const expenseAccounts = useMemo(() => {
    const list = accounts.filter(isPurchaseExpenseOrAssetAccount);
    return list.length > 0
      ? list
      : accounts.filter((a) => a.account_number.startsWith('6') || a.account_number.startsWith('2'));
  }, [accounts]);

  // Quick Add Account Modal State
  const [quickAddModal, setQuickAddModal] = useState<{
    isOpen: boolean;
    presetType: QuickAddPreset;
    targetIndex?: number;
  }>({
    isOpen: false,
    presetType: 'SUPPLIER'
  });

  const handleQuickAddSuccess = (newAccount: AccountDetail) => {
    if (quickAddModal.presetType === 'SUPPLIER') {
      setPurchaseAccountId(newAccount.id);
    } else if (quickAddModal.presetType === 'DISBURSING') {
      if (typeof quickAddModal.targetIndex === 'number') {
        handleUpdatePaymentRow(quickAddModal.targetIndex, 'disbursingAccount', newAccount.id);
      }
    } else if (quickAddModal.presetType === 'EXPENSE_OR_ASSET') {
      if (typeof quickAddModal.targetIndex === 'number') {
        handleUpdateExpenseRow(quickAddModal.targetIndex, 'accountId', newAccount.id);
      }
    }
  };

  // =========================================================================
  // VOUCHER LIFECYCLE & ACTIVE VOUCHER STATE
  // =========================================================================
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [activeEvNumber, setActiveEvNumber] = useState<string>('EV-2026-101');
  const [voucherStatus, setVoucherStatus] = useState<VoucherLifecycleStatus>('NEW');

  // Lock status helpers
  const isExpenseLocked =
    voucherStatus === 'UNCLOSED_PENDING_SETTLEMENT' ||
    voucherStatus === 'FULLY_CLOSED_RECONCILED';
  const isPaymentLocked = voucherStatus === 'FULLY_CLOSED_RECONCILED';

  // =========================================================================
  // 1. TOP HEADER & VOUCHER INFORMATION STATE
  // =========================================================================
  const [date, setDate] = useState<string>(todayStr);
  const [currency, setCurrency] = useState<'USD' | 'LBP' | 'EUR' | 'GBP'>('USD');
  const [type, setType] = useState<string>('Expense Voucher');
  const [enterPaymentDetails, setEnterPaymentDetails] = useState<boolean>(true);
  const [description, setDescription] = useState<string>('');
  const [internalRemark, setInternalRemark] = useState<string>('');

  // Actions dropdown
  const [showActionsDropdown, setShowActionsDropdown] = useState<boolean>(false);

  // =========================================================================
  // 2. INLINE PAYMENT EXECUTION STATE (MULTI-LINE)
  // =========================================================================
  const [paymentRows, setPaymentRows] = useState<PaymentExecutionRow[]>([
    {
      id: 'pay-row-1',
      paymentMethod: 'Cash',
      disbursingAccount:
        disbursingAccounts.find(
          (a) =>
            a.account_number === '53000' ||
            a.account_number === '53200' ||
            a.account_sub_type === 'CASH'
        )?.id ||
        disbursingAccounts[0]?.id ||
        '',
      amountPaid: 0,
      refNumber: 'ADV-01',
      paymentDate: todayStr,
      department: 'Main Department'
    }
  ]);

  // =========================================================================
  // 3. PURCHASE & EXPENSE ALLOCATION GRID STATE
  // =========================================================================
  // A. Fixed Purchase Row ("Purchase From:")
  const [purchaseAccountId, setPurchaseAccountId] = useState<string>(
    supplierAccounts.find((a) => a.account_number === '40110')?.id ||
    supplierAccounts[0]?.id ||
    accounts[0]?.id ||
    ''
  );
  const [purchaseAmount, setPurchaseAmount] = useState<number>(0);
  const [purchaseDept, setPurchaseDept] = useState<string>('Main Department');
  const [purchaseDesc, setPurchaseDesc] = useState<string>('');
  const [purchaseRef, setPurchaseRef] = useState<string>('');

  // B. Dynamic Expense Allocation Rows ("Expense Account Breakdown:")
  const [expenseRows, setExpenseRows] = useState<ExpenseAllocationRow[]>([
    {
      id: 'exp-row-1',
      accountId: expenseAccounts[0]?.id || accounts[0]?.id || '',
      accountNumber: expenseAccounts[0]?.account_number || '61110',
      accountName: expenseAccounts[0]?.account_name || 'Purchase Of Raw Materials',
      amount: 0,
      department: 'Main Department',
      description: '',
      refInvoice: ''
    }
  ]);

  // =========================================================================
  // 4. TOTALS & RECONCILIATION DIFFERENCE CALCULATIONS
  // =========================================================================
  const totalExpenseUSD = expenseRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const totalUSD = purchaseAmount > 0 ? purchaseAmount : totalExpenseUSD;
  const totalLBP = totalUSD * LBP_RATE;

  const totalPaymentsUSD = paymentRows.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
  const paymentDifference = totalUSD - totalPaymentsUSD; // > 0 means underpaid/pending; < 0 means overpaid; 0 means balanced

  // Automatically check if an unclosed voucher became fully reconciled
  useEffect(() => {
    if (
      voucherStatus === 'UNCLOSED_PENDING_SETTLEMENT' &&
      Math.abs(paymentDifference) < 0.001 &&
      totalUSD > 0
    ) {
      setVoucherStatus('FULLY_CLOSED_RECONCILED');
      onShowToast(
        `Disbursement balanced! Voucher ${activeEvNumber} transitioned to Fully Closed & Reconciled.`
      );

      // Update in preview records
      if (activeRecordId) {
        setPreviewRecords((prev) =>
          prev.map((r) =>
            r.id === activeRecordId
              ? {
                  ...r,
                  status: 'FULLY_CLOSED_RECONCILED',
                  totalDisbursed: totalPaymentsUSD,
                  paymentRows: paymentRows.map((p) => ({ ...p, isLocked: true }))
                }
              : r
          )
        );
      }
    }
  }, [paymentDifference, totalUSD, voucherStatus, activeEvNumber, activeRecordId, totalPaymentsUSD, paymentRows, onShowToast]);

  // =========================================================================
  // PAYMENT ROWS ACTIONS
  // =========================================================================
  const handleAddPaymentRow = () => {
    if (isPaymentLocked) {
      onShowToast('Voucher is Fully Closed & Reconciled. Payments are locked.', true);
      return;
    }

    // Default to Cash Vault if coming from an advance reconciliation
    const defaultCashVault =
      disbursingAccounts.find(
        (a) => a.type === 'Cash' || a.account_sub_type === 'CASH' || isCashAccount(a)
      ) || disbursingAccounts[0];

    const nextId = `pay-row-${Date.now()}-${paymentRows.length + 1}`;
    // Pre-populate remaining amount if underpaid
    const suggestedAmount = paymentDifference > 0 ? paymentDifference : 0;

    setPaymentRows((prev) => [
      ...prev,
      {
        id: nextId,
        paymentMethod: 'Cash',
        disbursingAccount: defaultCashVault?.id || '',
        amountPaid: suggestedAmount,
        refNumber: '',
        paymentDate: date || todayStr,
        department: purchaseDept || 'Main Department',
        isLocked: false
      }
    ]);
  };

  const handleDeletePaymentRow = (index: number) => {
    if (isPaymentLocked) {
      onShowToast('Voucher is Fully Closed & Reconciled. Payments are locked.', true);
      return;
    }
    const target = paymentRows[index];
    if (target?.isLocked) {
      onShowToast('Original advance disbursement is locked against deletion.', true);
      return;
    }
    if (paymentRows.length <= 1) {
      setPaymentRows([
        {
          id: `pay-row-${Date.now()}`,
          paymentMethod: 'Cash',
          disbursingAccount: disbursingAccounts[0]?.id || '',
          amountPaid: 0,
          refNumber: '',
          paymentDate: date || todayStr,
          department: 'Main Department'
        }
      ]);
      return;
    }
    setPaymentRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdatePaymentRow = (index: number, field: keyof PaymentExecutionRow, value: any) => {
    if (isPaymentLocked) return;
    const target = paymentRows[index];
    if (target?.isLocked) {
      onShowToast('This advance disbursement row is locked for reconciliation audit.', true);
      return;
    }
    setPaymentRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // =========================================================================
  // EXPENSE ROWS ACTIONS WITH STRICT VALIDATION
  // =========================================================================
  const handleAddExpenseRow = (rowIndex: number) => {
    if (isExpenseLocked) {
      onShowToast('Expense allocation rows are sealed for reconciliation audit.', true);
      return;
    }

    const activeRow = expenseRows[rowIndex];
    if (!activeRow.accountId || !activeRow.amount || Number(activeRow.amount) <= 0) {
      setExpenseRows((prev) =>
        prev.map((r, i) => (i === rowIndex ? { ...r, hasError: true } : r))
      );
      onShowToast('Choose From Account', true);
      return;
    }

    const defaultAcc = expenseAccounts[0] || accounts[0];
    setExpenseRows((prev) => [
      ...prev.map((r, i) => (i === rowIndex ? { ...r, hasError: false } : r)),
      {
        id: `exp-row-${Date.now()}-${prev.length + 1}`,
        accountId: defaultAcc?.id || '',
        accountNumber: defaultAcc?.account_number || '',
        accountName: defaultAcc?.account_name || '',
        amount: 0,
        department: purchaseDept || 'Main Department',
        description: '',
        refInvoice: ''
      }
    ]);
  };

  const handleDeleteExpenseRow = (rowIndex: number) => {
    if (isExpenseLocked) {
      onShowToast('Expense allocation rows are sealed for reconciliation audit.', true);
      return;
    }
    if (expenseRows.length === 1) {
      onShowToast('At least one expense line is required.', true);
      return;
    }
    setExpenseRows((prev) => prev.filter((_, i) => i !== rowIndex));
  };

  const handleUpdateExpenseRow = (index: number, field: keyof ExpenseAllocationRow, val: any) => {
    if (isExpenseLocked) return;
    setExpenseRows((prev) => {
      const copy = [...prev];
      const target = { ...copy[index] };

      if (field === 'accountId') {
        const acc = accounts.find((a) => a.id === val);
        if (acc) {
          target.accountId = acc.id;
          target.accountNumber = acc.account_number;
          target.accountName = acc.account_name;
        }
      } else if (field === 'amount') {
        target.amount = Number(val) || 0;
      } else {
        (target as any)[field] = val;
      }
      target.hasError = false;
      copy[index] = target;
      return copy;
    });
  };

  // =========================================================================
  // 5. MODALS STATE & SEED DATA (INCLUDING ADVANCE SETTLEMENT SCENARIO)
  // =========================================================================
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewSearch, setPreviewSearch] = useState<string>('');
  const [previewFilter, setPreviewFilter] = useState<'Show All' | 'Posted' | 'Unposted' | 'Pending Settlement'>('Show All');

  // Realistic scenario pre-seeded in Preview Records
  const [previewRecords, setPreviewRecords] = useState<PreviewExpenseRecord[]>([
    {
      id: 'ev-reconcile-01',
      payee: 'Ahmad M. (Plant Maintenance Engineer)',
      reference: 'ADV-SETTLE-091',
      date: '2026-09-18',
      ev: 'EV-2026-091',
      dateOfEv: '2026-09-18',
      amount: 1560.0,
      totalDisbursed: 1500.0,
      description: 'Emergency press repairs, replacement bearings, and hydraulic seals',
      enteredBy: 'Super Admin',
      department: 'Mill Operations',
      posted: true,
      status: 'UNCLOSED_PENDING_SETTLEMENT',
      purchaseAccountId:
        accounts.find(
          (a) =>
            a.type === 'Employee' ||
            a.account_sub_type === 'EMPLOYEE' ||
            a.account_name.toLowerCase().includes('advance')
        )?.id || accounts[0]?.id,
      purchaseDept: 'Mill Operations',
      purchaseRef: 'BILLS-1560',
      expenseRows: [
        {
          id: 'exp-s-1',
          accountId:
            accounts.find(
              (a) =>
                a.account_name.toLowerCase().includes('repair') ||
                a.account_name.toLowerCase().includes('maintenance')
            )?.id ||
            accounts.find((a) => a.type === 'Expense' || a.account_sub_type === 'EXPENSE')?.id ||
            accounts[0]?.id,
          accountNumber: '62620',
          accountName: 'Repairs & Maintenance (Mill Press Bearings)',
          amount: 1100,
          department: 'Mill Operations',
          description: 'High-torque press bearing replacement',
          refInvoice: 'INV-IND-882'
        },
        {
          id: 'exp-s-2',
          accountId:
            accounts.find(
              (a) =>
                a.account_name.toLowerCase().includes('consumable') ||
                a.account_name.toLowerCase().includes('packaging')
            )?.id ||
            accounts.find((a) => a.type === 'Expense' || a.account_sub_type === 'EXPENSE')?.id ||
            accounts[0]?.id,
          accountNumber: '61120',
          accountName: 'Consumables & Industrial Seals',
          amount: 460,
          department: 'Mill Operations',
          description: 'Hydraulic synthetic oil & sealant pack',
          refInvoice: 'INV-IND-883'
        }
      ],
      paymentRows: [
        {
          id: 'pay-s-1',
          paymentMethod: 'Cash',
          disbursingAccount:
            accounts.find(
              (a) =>
                a.type === 'Employee' ||
                a.account_sub_type === 'EMPLOYEE' ||
                a.account_name.toLowerCase().includes('advance')
            )?.id || accounts[0]?.id,
          amountPaid: 1500,
          refNumber: 'ADV-SEP-15',
          paymentDate: '2026-09-15',
          department: 'Mill Operations',
          isLocked: true
        }
      ]
    },
    {
      id: 'ev-01',
      payee: 'South Olive Farmers Cooperative',
      reference: 'INV-COOP-8821',
      date: '2026-09-14',
      ev: 'EV-2026-081',
      dateOfEv: '2026-09-14',
      amount: 18500.0,
      totalDisbursed: 18500.0,
      description: 'Raw olive harvest batch delivery 45T',
      enteredBy: 'Super Admin',
      department: 'Mill Operations',
      posted: true,
      status: 'FULLY_CLOSED_RECONCILED'
    },
    {
      id: 'ev-02',
      payee: 'Electricite Du Liban & Generator Corp',
      reference: 'EDL-SEP-01',
      date: '2026-09-12',
      ev: 'EV-2026-082',
      dateOfEv: '2026-09-12',
      amount: 4600.0,
      totalDisbursed: 0.0,
      description: 'Monthly electricity bill & generator fuel',
      enteredBy: 'Ziad Khoury',
      department: 'Utilities & Power',
      posted: false,
      status: 'DRAFT'
    }
  ]);

  // Fetch persisted expenses from database on mount & sync
  useEffect(() => {
    let mounted = true;
    apiFetchExpenses().then((data) => {
      if (mounted && data && data.length > 0) {
        setPreviewRecords((prev) => {
          const remoteIds = new Set(data.map((d) => d.id));
          const filteredPrev = prev.filter((p) => !remoteIds.has(p.id));
          return [...(data as any), ...filteredPrev];
        });
      }
    });

    const unsubscribe = subscribeToAccountingSync((e) => {
      if (e.detail?.type === 'EXPENSE_SAVED' && e.detail.data) {
        setPreviewRecords((prev) => {
          const rec = e.detail.data;
          const idx = prev.findIndex((r) => r.id === rec.id || r.ev === rec.ev);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = rec;
            return next;
          }
          return [rec, ...prev];
        });
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Recurring Templates state
  const [showRecurringModal, setShowRecurringModal] = useState<boolean>(false);
  const [recurringTemplates, setRecurringTemplates] = useState<ExpenseRecurringTemplate[]>(
    () => INITIAL_RECURRING_EXPENSES
  );

  // Supporting Document modal
  const [showSupportingDocModal, setShowSupportingDocModal] = useState<boolean>(false);
  const [supportingDocUrl, setSupportingDocUrl] = useState<string>('');

  // =========================================================================
  // RESET / CLEAR FORM
  // =========================================================================
  const handleClearForm = () => {
    setActiveRecordId(null);
    setActiveEvNumber(`EV-2026-${Math.floor(100 + Math.random() * 900)}`);
    setVoucherStatus('NEW');
    setDate(todayStr);
    setCurrency('USD');
    setType('Expense Voucher');
    setEnterPaymentDetails(true);
    setDescription('');
    setInternalRemark('');
    setPurchaseAmount(0);
    setPurchaseDesc('');
    setPurchaseRef('');
    setPurchaseDept('Main Department');

    const defaultExp = expenseAccounts[0] || accounts[0];
    setExpenseRows([
      {
        id: `exp-row-${Date.now()}`,
        accountId: defaultExp?.id || '',
        accountNumber: defaultExp?.account_number || '61110',
        accountName: defaultExp?.account_name || 'Purchase Of Raw Materials',
        amount: 0,
        department: 'Main Department',
        description: '',
        refInvoice: ''
      }
    ]);

    setPaymentRows([
      {
        id: `pay-row-${Date.now()}`,
        paymentMethod: 'Cash',
        disbursingAccount: disbursingAccounts[0]?.id || '',
        amountPaid: 0,
        refNumber: '',
        paymentDate: todayStr,
        department: 'Main Department',
        isLocked: false
      }
    ]);

    setSupportingDocUrl('');
    onShowToast('Console cleared and reset to fresh voucher.');
  };

  // =========================================================================
  // LOAD EXISTING VOUCHER (FOR ADVANCE RECONCILIATION)
  // =========================================================================
  const handleLoadVoucherForReconciliation = (record: PreviewExpenseRecord) => {
    setActiveRecordId(record.id);
    setActiveEvNumber(record.ev);
    setVoucherStatus(record.status);
    setDate(record.date);
    setDescription(record.description);
    setPurchaseDept(record.department);
    if (record.purchaseRef) setPurchaseRef(record.purchaseRef);
    if (record.purchaseAccountId) setPurchaseAccountId(record.purchaseAccountId);

    if (record.expenseRows && record.expenseRows.length > 0) {
      setExpenseRows(record.expenseRows);
      setPurchaseAmount(0);
    } else {
      setPurchaseAmount(record.amount);
    }

    if (record.paymentRows && record.paymentRows.length > 0) {
      setPaymentRows(record.paymentRows);
      setEnterPaymentDetails(true);
    }

    setShowPreviewModal(false);
    onShowToast(`Loaded ${record.ev} for Advance Settlement / Reconciliation.`);
  };

  // Deep-Link & URL Query Parameters Listener (e.g., ?id=model.2 or ?voucherId=EV-2026-091)
  const searchParams = useSearchParams();
  const deepLinkedVoucherId = searchParams?.get('voucherId') || searchParams?.get('id') || searchParams?.get('ev');
  const [hasHandledDeepLink, setHasHandledDeepLink] = useState(false);

  useEffect(() => {
    if (!deepLinkedVoucherId || hasHandledDeepLink) return;

    const cleanId = deepLinkedVoucherId.trim();

    // Check if matching record exists in previewRecords
    const matched = previewRecords.find(
      (r) =>
        r.id.toLowerCase() === cleanId.toLowerCase() ||
        r.ev.toLowerCase() === cleanId.toLowerCase() ||
        (cleanId === 'model.2' && r.status === 'UNCLOSED_PENDING_SETTLEMENT')
    );

    if (matched) {
      handleLoadVoucherForReconciliation(matched);
      onShowToast(`Reconciliation Console: Preloaded voucher ${matched.ev} (${matched.payee}) from deep link.`);
      setHasHandledDeepLink(true);
    } else if (previewRecords.length > 0) {
      // Graceful Fallback: If target action modal or voucher is not found or not yet fully implemented,
      // prevent dead ends: show a clear informative toast and open the general Voucher Inquiry table filtered by that ID.
      onShowToast(`Notice: Target voucher "${cleanId}" not found or already settled. Opening Voucher Inquiry table.`, false);
      setPreviewSearch(cleanId === 'model.2' ? '' : cleanId);
      setShowPreviewModal(true);
      setHasHandledDeepLink(true);
    }
  }, [deepLinkedVoucherId, previewRecords, hasHandledDeepLink]);

  // =========================================================================
  // SAVE / SAVE & POST WITH RECONCILIATION LIFECYCLE
  // =========================================================================
  const handleSave = async (postImmediately = false) => {
    if (isPaymentLocked) {
      onShowToast('Voucher is already Fully Closed & Reconciled.', true);
      return;
    }
    if (!description.trim()) {
      onShowToast('Description* is required before saving.', true);
      return;
    }
    if (totalUSD <= 0) {
      onShowToast('Total Voucher Value must be greater than zero.', true);
      return;
    }

    const payeeName =
      accounts.find((a) => a.id === purchaseAccountId)?.account_name ||
      'Supplier / Staff Advance Account';

    let determinedStatus: VoucherLifecycleStatus = 'DRAFT';

    if (postImmediately) {
      if (enterPaymentDetails && paymentDifference > 0.001) {
        // Underpaid case: Advance ($1500) < Bills ($1560) -> Difference $60 pending
        determinedStatus = 'UNCLOSED_PENDING_SETTLEMENT';
      } else {
        determinedStatus = 'FULLY_CLOSED_RECONCILED';
      }
    }

    setVoucherStatus(determinedStatus);

    const updatedRecord: PreviewExpenseRecord = {
      id: activeRecordId || `ev-${Date.now()}`,
      payee: payeeName,
      reference: purchaseRef || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      date,
      ev: activeEvNumber,
      dateOfEv: date,
      amount: totalUSD,
      totalDisbursed: enterPaymentDetails ? totalPaymentsUSD : totalUSD,
      description,
      enteredBy: 'Super Admin',
      department: purchaseDept,
      posted: postImmediately,
      status: determinedStatus,
      purchaseAccountId,
      purchaseDept,
      purchaseRef,
      supportingDocUrl: supportingDocUrl || undefined,
      expenseRows,
      paymentRows: paymentRows.map((p) => ({
        ...p,
        isLocked: determinedStatus === 'UNCLOSED_PENDING_SETTLEMENT' || determinedStatus === 'FULLY_CLOSED_RECONCILED' ? true : p.isLocked
      }))
    };

    try {
      setIsSavingExpense(true);
      const res = await apiSaveExpense({
        ...updatedRecord,
        posted: postImmediately,
        status: determinedStatus
      });

      const persisted = res.data;
      setPreviewRecords((prev) => {
        const exists = prev.some((r) => r.id === persisted.id || r.ev === persisted.ev);
        if (exists) {
          return prev.map((r) => (r.id === persisted.id || r.ev === persisted.ev ? (persisted as any) : r));
        }
        return [(persisted as any), ...prev];
      });

      if (determinedStatus === 'UNCLOSED_PENDING_SETTLEMENT') {
        onShowToast(
          `Voucher ${activeEvNumber} persisted: Unclosed Case (Pending Settlement). $${paymentDifference.toFixed(2)} pending. [DB ID: ${persisted.id.slice(0, 8)}...]`
        );
      } else if (determinedStatus === 'FULLY_CLOSED_RECONCILED') {
        onShowToast(
          `Voucher ${activeEvNumber} persisted to database and Fully Closed & Reconciled! [DB ID: ${persisted.id.slice(0, 8)}...]`
        );
      } else {
        onShowToast(`Voucher ${activeEvNumber} saved as draft to database. [DB ID: ${persisted.id.slice(0, 8)}...]`);
      }

      if (onPostVoucherToJv && postImmediately) {
        onPostVoucherToJv(persisted);
      }
    } catch (err: any) {
      onShowToast(err.message || 'Failed to persist expense voucher', true);
    } finally {
      setIsSavingExpense(false);
    }
  };

  // Store As Recurring
  const handleStoreAsRecurring = () => {
    if (!description.trim()) {
      onShowToast('Please enter Description* to name recurring template.', true);
      return;
    }
    const newTemplate: ExpenseRecurringTemplate = {
      id: `rec-${Date.now()}`,
      description,
      purchaseAccount: purchaseAccountId,
      expenseAccount: expenseRows[0]?.accountNumber || '61110',
      amount: totalUSD,
      currency,
      department: purchaseDept,
      refInvoice: purchaseRef,
      internalRemark
    };
    setRecurringTemplates((prev) => [newTemplate, ...prev]);
    onShowToast(`Stored template "${description}" in Recurring Vouchers.`);
  };

  // Recall Recurring Template
  const handleRecallTemplate = (tpl: ExpenseRecurringTemplate) => {
    handleClearForm();
    setDescription(tpl.description);
    if (tpl.purchaseAccount) setPurchaseAccountId(tpl.purchaseAccount);
    setPurchaseAmount(tpl.amount);
    setCurrency(tpl.currency);
    setPurchaseDept(tpl.department || 'Main Department');
    if (tpl.refInvoice) setPurchaseRef(tpl.refInvoice);
    if (tpl.internalRemark) setInternalRemark(tpl.internalRemark);

    const matchAcc =
      accounts.find((a) => a.account_number === tpl.expenseAccount) ||
      accounts.find((a) => a.type === 'Expense' || a.account_sub_type === 'EXPENSE') ||
      accounts[0];
    setExpenseRows([
      {
        id: `exp-row-${Date.now()}`,
        accountId: matchAcc?.id || '',
        accountNumber: matchAcc?.account_number || '',
        accountName: matchAcc?.account_name || '',
        amount: tpl.amount,
        department: tpl.department || 'Main Department',
        description: tpl.description,
        refInvoice: tpl.refInvoice || ''
      }
    ]);

    setShowRecurringModal(false);
    onShowToast(`Recalled template: "${tpl.description}". Form populated.`);
  };

  return (
    <div className="space-y-5">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & VOUCHER CONTROLS                                          */}
      {/* ========================================================================= */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
        {/* Title, Subtitle, Status Badge & Top Right Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>Accounting Purchase &amp; Expenses Console</span>
              </h3>

              {/* Dynamic Lifecycle Status Badge */}
              {voucherStatus === 'UNCLOSED_PENDING_SETTLEMENT' && (
                <span className="bg-amber-500/15 text-amber-800 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  <span>Unclosed Case (Pending Settlement)</span>
                </span>
              )}
              {voucherStatus === 'FULLY_CLOSED_RECONCILED' && (
                <span className="bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Fully Closed &amp; Reconciled</span>
                </span>
              )}
              {voucherStatus === 'DRAFT' && (
                <span className="bg-muted text-muted-foreground border border-border text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Draft
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Record supplier purchase bills, operational expenditures, and recurring payment orders
            </p>
          </div>

          {/* Action Buttons: + New, Preview, Actions (Recall Recurring), Supporting Document */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleClearForm}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Preview</span>
            </button>

            {/* Actions Dropdown: Recall Recurring */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowActionsDropdown((prev) => !prev)}
                className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <span>Actions</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${
                    showActionsDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showActionsDropdown && (
                <div className="absolute right-0 mt-1 w-52 bg-card border border-border rounded-xl shadow-xl p-1.5 z-30 text-xs animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => {
                      setShowActionsDropdown(false);
                      setShowRecurringModal(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted font-medium text-foreground transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Recall Recurring</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowSupportingDocModal(true)}
              className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <LinkIcon className="w-3.5 h-3.5 text-primary" />
              <span>Supporting Document</span>
            </button>
          </div>
        </div>

        {/* Header Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 text-xs font-medium">
          {/* Date* */}
          <div>
            <label className="text-foreground mb-1 block font-semibold">Date *</label>
            <input
              type="date"
              value={date}
              disabled={isExpenseLocked}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs disabled:bg-muted disabled:cursor-not-allowed"
            />
          </div>

          {/* Currency* */}
          <div>
            <label className="text-foreground mb-1 block font-semibold">Currency *</label>
            <select
              value={currency}
              disabled={isExpenseLocked}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-semibold disabled:bg-muted disabled:cursor-not-allowed"
            >
              <option value="USD">USD ($) - Base Currency</option>
              <option value="LBP">LBP (L.L) - Lebanese Pound</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>

          {/* Type* */}
          <div>
            <label className="text-foreground mb-1 block font-semibold">Type *</label>
            <select
              value={type}
              disabled={isExpenseLocked}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs disabled:bg-muted disabled:cursor-not-allowed"
            >
              <option value="Expense Voucher">Expense Voucher</option>
              <option value="Purchase Voucher">Purchase Voucher</option>
              <option value="Raw Materials Procurement">Raw Materials Procurement</option>
              <option value="Operating Overhead">Operating Overhead</option>
            </select>
          </div>

          {/* Enter Payment Details Checkbox */}
          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 font-semibold text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enterPaymentDetails}
                disabled={isPaymentLocked}
                onChange={(e) => setEnterPaymentDetails(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4 disabled:cursor-not-allowed"
              />
              <span>Enter Payment Details</span>
            </label>
          </div>

          {/* Description* */}
          <div className="sm:col-span-2 md:col-span-2">
            <label className="text-foreground mb-1 block font-semibold">Description *</label>
            <textarea
              rows={2}
              value={description}
              disabled={isExpenseLocked}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Multi-line purchase description, delivery notes, or supplier memo..."
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs text-xs disabled:bg-muted disabled:cursor-not-allowed"
            />
          </div>

          {/* Internal Remark */}
          <div className="sm:col-span-2 md:col-span-2">
            <label className="text-muted-foreground mb-1 block font-medium">Internal Remark</label>
            <textarea
              rows={2}
              value={internalRemark}
              disabled={isExpenseLocked}
              onChange={(e) => setInternalRemark(e.target.value)}
              placeholder="Internal audit notes, budget code, or approval tracking..."
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs text-xs disabled:bg-muted disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 2. INLINE PAYMENT EXECUTION & LIFECYCLE (MULTI-DISBURSEMENT)            */}
        {/* ======================================================================= */}
        {enterPaymentDetails && (
          <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-3 animate-fadeIn">
            {/* Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Inline Payment Execution</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  Multi-Disbursement
                </span>
              </div>

              {/* Live Metrics: Total Disbursed & Status Difference Indicator */}
              <div className="flex items-center gap-3 text-xs font-medium">
                <div>
                  <span className="text-muted-foreground text-[11px]">Total Disbursed: </span>
                  <span className="font-mono font-bold text-foreground">${totalPaymentsUSD.toFixed(2)}</span>
                </div>

                {Math.abs(paymentDifference) < 0.001 && totalUSD > 0 ? (
                  <span className="bg-card text-emerald-700 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Fully Closed &amp; Reconciled
                  </span>
                ) : paymentDifference > 0 ? (
                  <span className="bg-card text-amber-700 border border-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>Underpaid / Pending: ${paymentDifference.toFixed(2)}</span>
                  </span>
                ) : (
                  <span className="bg-card text-destructive border border-destructive/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-2xs">
                    Overpaid: ${Math.abs(paymentDifference).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Reconciliation State Banners */}
            {voucherStatus === 'UNCLOSED_PENDING_SETTLEMENT' && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">Unclosed Case (Pending Settlement)</span>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Expense bills (${totalUSD.toFixed(2)}) exceed advance disbursement (${totalPaymentsUSD.toFixed(2)}).
                      Difference of <strong className="font-mono font-bold">${paymentDifference.toFixed(2)}</strong> is pending cash settlement.
                      Original advance line is sealed. Click <strong className="font-bold text-amber-950">+</strong> on row controls to disburse remaining amount.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddPaymentRow}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Settle Difference ($60)</span>
                </button>
              </div>
            )}

            {voucherStatus === 'FULLY_CLOSED_RECONCILED' && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between gap-2 text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Fully Closed &amp; Reconciled</span>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Advance and cash settlements match total bills (${totalUSD.toFixed(2)}) exactly. All rows are permanently locked against alterations.
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-900 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Audit Sealed
                </span>
              </div>
            )}

            {/* Payment Rows Table (8 Columns: # | Payment Method | Disbursing Account | Amount Paid | Cheque / Wire Ref # | Payment Date | Department | Action) */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-muted text-foreground font-semibold border-b border-border">
                    <th className="p-2.5 w-10 text-center">#</th>
                    <th className="p-2.5 w-44">Payment Method</th>
                    <th className="p-2.5 min-w-[240px]">Disbursing Account</th>
                    <th className="p-2.5 w-32 text-right">Amount Paid</th>
                    <th className="p-2.5 w-36">Cheque / Wire Ref #</th>
                    <th className="p-2.5 w-32">Payment Date</th>
                    <th className="p-2.5 w-36">Department</th>
                    <th className="p-2.5 w-16 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {paymentRows.map((pRow, pIdx) => {
                    const rowIsLocked = pRow.isLocked || isPaymentLocked;
                    return (
                      <tr
                        key={pRow.id}
                        className={`transition-colors ${
                          rowIsLocked ? 'bg-muted/40' : 'hover:bg-muted/30'
                        }`}
                      >
                        <td className="p-2 text-center font-mono text-muted-foreground">
                          {rowIsLocked ? (
                            <Lock className="w-3 h-3 text-muted-foreground mx-auto" />
                          ) : (
                            pIdx + 1
                          )}
                        </td>

                        {/* 1. Payment Method Dropdown */}
                        <td className="p-2">
                          <select
                            value={pRow.paymentMethod}
                            disabled={rowIsLocked}
                            onChange={(e) =>
                              handleUpdatePaymentRow(pIdx, 'paymentMethod', e.target.value)
                            }
                            className="w-full bg-card border border-input rounded-md p-1.5 text-foreground text-xs shadow-2xs disabled:bg-muted disabled:cursor-not-allowed"
                          >
                            <option value="Cash">Cash</option>
                            <option value="Wire Transfer">Wire Transfer</option>
                            <option value="Commercial Bank Check">Commercial Bank Check</option>
                            <option value="Credit Card">Credit Card</option>
                          </select>
                        </td>

                        {/* 2. Disbursing Account (Class 5: Cash Vault, Petty Cash, or Bank) */}
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <select
                              value={pRow.disbursingAccount}
                              disabled={rowIsLocked}
                              onChange={(e) =>
                                handleUpdatePaymentRow(pIdx, 'disbursingAccount', e.target.value)
                              }
                              className="w-full bg-card border border-input rounded-md p-1.5 text-foreground text-xs shadow-2xs font-mono disabled:bg-muted disabled:cursor-not-allowed"
                            >
                              {disbursingAccounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                  #{acc.account_number} - {acc.account_name} ({acc.account_sub_type || acc.account_type})
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setQuickAddModal({ isOpen: true, presetType: 'DISBURSING', targetIndex: pIdx })}
                              disabled={rowIsLocked}
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 rounded-md transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                              title="Quick-Add New Cash Vault or Bank Account (+) [Class 5]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* 3. Amount Paid */}
                        <td className="p-2">
                          <input
                            type="number"
                            value={pRow.amountPaid || ''}
                            disabled={rowIsLocked}
                            onChange={(e) =>
                              handleUpdatePaymentRow(
                                pIdx,
                                'amountPaid',
                                Number(e.target.value) || 0
                              )
                            }
                            placeholder="0.00"
                            step="0.01"
                            className="w-full bg-card border border-input rounded-md p-1.5 text-foreground font-mono font-bold text-right text-xs shadow-2xs disabled:bg-muted disabled:cursor-not-allowed"
                          />
                        </td>

                        {/* 4. Cheque / Wire Ref # (Optional) */}
                        <td className="p-2">
                          <input
                            type="text"
                            value={pRow.refNumber}
                            disabled={rowIsLocked}
                            onChange={(e) =>
                              handleUpdatePaymentRow(pIdx, 'refNumber', e.target.value)
                            }
                            placeholder="Optional ref..."
                            className="w-full bg-card border border-input rounded-md p-1.5 text-foreground text-xs shadow-2xs disabled:bg-muted disabled:cursor-not-allowed"
                          />
                        </td>

                        {/* 5. Payment Date */}
                        <td className="p-2">
                          <input
                            type="date"
                            value={pRow.paymentDate}
                            disabled={rowIsLocked}
                            onChange={(e) =>
                              handleUpdatePaymentRow(pIdx, 'paymentDate', e.target.value)
                            }
                            className="w-full bg-card border border-input rounded-md p-1.5 text-foreground font-mono text-xs shadow-2xs disabled:bg-muted disabled:cursor-not-allowed"
                          />
                        </td>

                        {/* 6. Department */}
                        <td className="p-2">
                          <select
                            value={pRow.department}
                            disabled={rowIsLocked}
                            onChange={(e) =>
                              handleUpdatePaymentRow(pIdx, 'department', e.target.value)
                            }
                            className="w-full bg-card border border-input rounded-md p-1.5 text-foreground text-xs shadow-2xs disabled:bg-muted disabled:cursor-not-allowed"
                          >
                            <option value="Main Department">Main Department</option>
                            <option value="Mill Operations">Mill Operations</option>
                            <option value="Administration">Administration</option>
                            <option value="Commercial Sales">Commercial Sales</option>
                            <option value="Utilities & Power">Utilities &amp; Power</option>
                          </select>
                        </td>

                        {/* 7. Action: + to add row, trash icon to remove */}
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={handleAddPaymentRow}
                              disabled={isPaymentLocked}
                              title="Append Payment Row"
                              className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground p-1 rounded transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePaymentRow(pIdx)}
                              disabled={rowIsLocked}
                              title="Delete Payment Row"
                              className="text-muted-foreground hover:text-destructive disabled:opacity-40 p-1 rounded transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. PURCHASE & EXPENSE ALLOCATION GRID                                     */}
      {/* ========================================================================= */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <span>Purchase &amp; Expense Allocation Grid</span>
            {isExpenseLocked && (
              <span className="bg-muted text-muted-foreground border border-border text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Locked For Audit</span>
              </span>
            )}
          </h4>
        </div>

        {/* A. FIXED PURCHASE / SUPPLIER ROW ("Purchase From:") */}
        <div className="bg-muted/40 border border-border rounded-lg p-3 space-y-2">
          <div className="text-xs font-bold text-primary flex items-center gap-1.5">
            <span>Purchase From:</span>
            <span className="text-[11px] font-normal text-muted-foreground">
              (Supplier / Creditor Control Account)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs font-medium">
            {/* Account */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-muted-foreground block text-[11px]">Account (Supplier / Creditor)</label>
                <button
                  type="button"
                  onClick={() => setQuickAddModal({ isOpen: true, presetType: 'SUPPLIER' })}
                  disabled={isExpenseLocked}
                  className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                  title="Quick-Add New Supplier Account (#40110...)"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>New Supplier</span>
                </button>
              </div>
              <div className="flex items-center gap-1">
                <select
                  value={purchaseAccountId}
                  disabled={isExpenseLocked}
                  onChange={(e) => setPurchaseAccountId(e.target.value)}
                  className="w-full bg-card border border-input rounded-md p-1.5 text-foreground text-xs shadow-2xs font-mono disabled:bg-muted disabled:cursor-not-allowed"
                >
                  {supplierAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      #{a.account_number} - {a.account_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setQuickAddModal({ isOpen: true, presetType: 'SUPPLIER' })}
                  disabled={isExpenseLocked}
                  className="p-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-md transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                  title="Quick-Add New Supplier (+) [Class 40]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Amount (Currency) */}
            <div>
              <label className="text-muted-foreground mb-0.5 block text-[11px]">
                Amount ({currency})
              </label>
              <input
                type="number"
                value={purchaseAmount || ''}
                disabled={isExpenseLocked}
                onChange={(e) => setPurchaseAmount(Number(e.target.value) || 0)}
                placeholder="0.00"
                step="0.01"
                className="w-full bg-card border border-input rounded-md p-1.5 text-foreground font-mono font-bold text-right shadow-2xs disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>

            {/* Department */}
            <div>
              <label className="text-muted-foreground mb-0.5 block text-[11px]">Department</label>
              <select
                value={purchaseDept}
                disabled={isExpenseLocked}
                onChange={(e) => setPurchaseDept(e.target.value)}
                className="w-full bg-card border border-input rounded-md p-1.5 text-foreground shadow-2xs disabled:bg-muted disabled:cursor-not-allowed"
              >
                <option value="Main Department">Main Department</option>
                <option value="Mill Operations">Mill Operations</option>
                <option value="Administration">Administration</option>
                <option value="Commercial Sales">Commercial Sales</option>
                <option value="Utilities & Power">Utilities &amp; Power</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-muted-foreground mb-0.5 block text-[11px]">Description</label>
              <input
                type="text"
                value={purchaseDesc}
                disabled={isExpenseLocked}
                onChange={(e) => setPurchaseDesc(e.target.value)}
                placeholder="Purchase details..."
                className="w-full bg-card border border-input rounded-md p-1.5 text-foreground shadow-2xs disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>

            {/* Ref / Invoice # */}
            <div>
              <label className="text-muted-foreground mb-0.5 block text-[11px]">Ref / Invoice #</label>
              <input
                type="text"
                value={purchaseRef}
                disabled={isExpenseLocked}
                onChange={(e) => setPurchaseRef(e.target.value)}
                placeholder="e.g. BILL-9921"
                className="w-full bg-card border border-input rounded-md p-1.5 text-foreground shadow-2xs disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* B. DYNAMIC EXPENSE ALLOCATION ROWS ("Expense Account Breakdown:") */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-foreground flex items-center justify-between">
            <span>Expense Account Breakdown:</span>
            {isExpenseLocked && (
              <span className="text-[11px] text-muted-foreground font-normal">
                Receipts recorded and sealed against modifications
              </span>
            )}
          </div>

          {expenseRows.map((row, idx) => (
            <div
              key={row.id}
              className={`p-3 rounded-lg border transition-all ${
                row.hasError
                  ? 'border-destructive bg-destructive/5'
                  : isExpenseLocked
                  ? 'border-border bg-muted/30'
                  : 'border-border bg-card hover:bg-muted/30'
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2 text-xs font-medium items-end">
                {/* Expense / Asset Account */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-muted-foreground block text-[11px]">
                      Expense / Asset Account:
                    </label>
                    <button
                      type="button"
                      onClick={() => setQuickAddModal({ isOpen: true, presetType: 'EXPENSE_OR_ASSET', targetIndex: idx })}
                      disabled={isExpenseLocked}
                      className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                      title="Quick-Add Expense or Asset Account"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>New Account</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <select
                      value={row.accountId}
                      disabled={isExpenseLocked}
                      onChange={(e) => handleUpdateExpenseRow(idx, 'accountId', e.target.value)}
                      className={`w-full bg-card border rounded-md p-1.5 text-foreground text-xs shadow-2xs font-mono disabled:bg-muted disabled:cursor-not-allowed ${
                        row.hasError ? 'border-destructive ring-1 ring-destructive' : 'border-input'
                      }`}
                    >
                      <option value="">-- Select Expense or Asset Account --</option>
                      {expenseAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          #{a.account_number} - {a.account_name} ({a.account_type})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setQuickAddModal({ isOpen: true, presetType: 'EXPENSE_OR_ASSET', targetIndex: idx })}
                      disabled={isExpenseLocked}
                      className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 border border-blue-500/30 rounded-md transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                      title="Quick-Add Expense or Capitalized Asset (+) [Class 6 / Class 2]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="text-muted-foreground mb-0.5 block text-[11px]">Amount</label>
                  <input
                    type="number"
                    value={row.amount || ''}
                    disabled={isExpenseLocked}
                    onChange={(e) => handleUpdateExpenseRow(idx, 'amount', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    className={`w-full bg-card border rounded-md p-1.5 text-foreground font-mono font-semibold text-right shadow-2xs disabled:bg-muted disabled:cursor-not-allowed ${
                      row.hasError ? 'border-destructive ring-1 ring-destructive' : 'border-input'
                    }`}
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="text-muted-foreground mb-0.5 block text-[11px]">Department</label>
                  <select
                    value={row.department}
                    disabled={isExpenseLocked}
                    onChange={(e) => handleUpdateExpenseRow(idx, 'department', e.target.value)}
                    className="w-full bg-card border border-input rounded-md p-1.5 text-foreground shadow-2xs disabled:bg-muted disabled:cursor-not-allowed"
                  >
                    <option value="Main Department">Main Department</option>
                    <option value="Mill Operations">Mill Operations</option>
                    <option value="Administration">Administration</option>
                    <option value="Commercial Sales">Commercial Sales</option>
                    <option value="Utilities & Power">Utilities &amp; Power</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="text-muted-foreground mb-0.5 block text-[11px]">Description</label>
                  <input
                    type="text"
                    value={row.description}
                    disabled={isExpenseLocked}
                    onChange={(e) => handleUpdateExpenseRow(idx, 'description', e.target.value)}
                    placeholder="Expense line note..."
                    className="w-full bg-card border border-input rounded-md p-1.5 text-foreground shadow-2xs disabled:bg-muted disabled:cursor-not-allowed"
                  />
                </div>

                {/* Ref# and Row Actions: + and Trash */}
                <div className="flex items-center gap-1.5 justify-end">
                  <input
                    type="text"
                    value={row.refInvoice}
                    disabled={isExpenseLocked}
                    onChange={(e) => handleUpdateExpenseRow(idx, 'refInvoice', e.target.value)}
                    placeholder="Ref#"
                    className="w-20 bg-card border border-input rounded-md p-1.5 text-foreground shadow-2xs text-xs disabled:bg-muted disabled:cursor-not-allowed"
                  />

                  {/* Validation '+' Button:
                      Clicking `+` requires that `Expense Account` and `Amount` are populated;
                      otherwise, display red border and trigger alert: "Choose From Account". */}
                  <button
                    type="button"
                    onClick={() => handleAddExpenseRow(idx)}
                    disabled={isExpenseLocked}
                    title="Add Next Row (Checks Account and Amount)"
                    className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground p-1.5 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteExpenseRow(idx)}
                    disabled={isExpenseLocked}
                    title="Delete Row"
                    className="text-muted-foreground hover:text-destructive disabled:opacity-40 p-1.5 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ======================================================================= */}
        {/* 4. FOOTER CONTROLS & TOTALS                                             */}
        {/* ======================================================================= */}
        <div className="bg-muted p-4 rounded-xl border border-border flex flex-wrap items-center justify-between gap-4">
          {/* Left Side: Total Voucher Value */}
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Total Voucher Value:</span>
            <div className="text-base font-bold font-mono text-foreground flex items-center gap-4">
              <span className="text-emerald-700">Total: {totalUSD.toFixed(2)} $</span>
              <span className="text-muted-foreground text-xs">{totalLBP.toLocaleString()} LBP</span>
            </div>
          </div>

          {/* Right Side: Clear, Store As Recurring, Save, Save & Post */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Clear: Resets inputs */}
            <button
              type="button"
              onClick={handleClearForm}
              className="bg-card hover:bg-destructive/10 text-destructive border border-destructive/40 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Clear
            </button>

            {/* Store As Recurring: Saves template */}
            <button
              type="button"
              onClick={handleStoreAsRecurring}
              className="bg-sky-700 hover:bg-sky-800 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Store As Recurring
            </button>

            {/* Save: Saves as draft */}
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isPaymentLocked || isSavingExpense}
              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
            >
              {isSavingExpense ? 'Saving...' : 'Save'}
            </button>

            {/* Save & Post: Validates balances and posts accounting entries */}
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isPaymentLocked || isSavingExpense}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>
                {isSavingExpense
                  ? 'Posting...'
                  : voucherStatus === 'UNCLOSED_PENDING_SETTLEMENT' && Math.abs(paymentDifference) < 0.001
                  ? 'Finalize Settlement'
                  : 'Save & Post'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. AUXILIARY MODALS                                                       */}
      {/* ========================================================================= */}

      {/* 1. Preview Expense Modal (with direct reconciliation loader) */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span>Preview Expense</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Bar: Search + Status filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="relative w-72">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={previewSearch}
                  onChange={(e) => setPreviewSearch(e.target.value)}
                  placeholder="Search payee, reference, description..."
                  className="w-full bg-card border border-input rounded-lg pl-8 pr-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                />
              </div>

              <select
                value={previewFilter}
                onChange={(e) => setPreviewFilter(e.target.value as any)}
                className="bg-card border border-input rounded-lg p-1.5 text-foreground shadow-2xs"
              >
                <option value="Show All">Show All</option>
                <option value="Pending Settlement">Pending Settlement</option>
                <option value="Posted">Posted</option>
                <option value="Unposted">Unposted</option>
              </select>
            </div>

            {/* Table Columns: Payee | Reference | Date | EV | Date Of EV | Amount | Description | Entered By | Department | Posted / Status | Action */}
            <div className="overflow-y-auto rounded-lg border border-border flex-1 max-h-[50vh]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-muted border-b border-border text-foreground font-semibold">
                  <tr>
                    <th className="p-2.5">Payee</th>
                    <th className="p-2.5">Reference</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">EV</th>
                    <th className="p-2.5">Date Of EV</th>
                    <th className="p-2.5 text-right">Amount ($)</th>
                    <th className="p-2.5 min-w-[170px]">Description</th>
                    <th className="p-2.5">Entered By</th>
                    <th className="p-2.5">Department</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {previewRecords
                    .filter((r) => {
                      if (previewFilter === 'Pending Settlement')
                        return r.status === 'UNCLOSED_PENDING_SETTLEMENT';
                      if (previewFilter === 'Posted') return r.posted;
                      if (previewFilter === 'Unposted') return !r.posted;
                      return true;
                    })
                    .filter(
                      (r) =>
                        r.payee.toLowerCase().includes(previewSearch.toLowerCase()) ||
                        r.reference.toLowerCase().includes(previewSearch.toLowerCase()) ||
                        r.description.toLowerCase().includes(previewSearch.toLowerCase())
                    )
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                        <td className="p-2.5 font-semibold text-foreground">{r.payee}</td>
                        <td className="p-2.5 font-mono text-muted-foreground">{r.reference}</td>
                        <td className="p-2.5 font-mono text-muted-foreground">{r.date}</td>
                        <td className="p-2.5 font-mono font-bold text-primary">{r.ev}</td>
                        <td className="p-2.5 font-mono text-muted-foreground">{r.dateOfEv}</td>
                        <td className="p-2.5 font-mono font-bold text-emerald-700 text-right">
                          ${r.amount.toFixed(2)}
                        </td>
                        <td className="p-2.5 text-foreground max-w-xs truncate">{r.description}</td>
                        <td className="p-2.5 text-muted-foreground">{r.enteredBy}</td>
                        <td className="p-2.5 text-muted-foreground">{r.department}</td>
                        <td className="p-2.5 text-center">
                          {r.status === 'UNCLOSED_PENDING_SETTLEMENT' ? (
                            <span className="bg-amber-500/15 text-amber-800 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs">
                              <AlertCircle className="w-3 h-3 text-amber-600" /> Pending
                            </span>
                          ) : r.status === 'FULLY_CLOSED_RECONCILED' ? (
                            <span className="bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Reconciled
                            </span>
                          ) : (
                            <span className="bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full text-[10px] font-bold">
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleLoadVoucherForReconciliation(r)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 ml-auto transition-colors cursor-pointer shadow-xs"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
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

      {/* 2. Expense Recurring Modal */}
      {showRecurringModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-primary" />
                <span>Expense Recurring</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowRecurringModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Select a stored recurring purchase/expense template to automatically populate the console grid.
            </p>

            <div className="overflow-y-auto rounded-lg border border-border max-h-64">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted border-b border-border text-foreground font-semibold sticky top-0">
                  <tr>
                    <th className="p-2.5">Description</th>
                    <th className="p-2.5 text-right w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recurringTemplates.map((tpl) => (
                    <tr
                      key={tpl.id}
                      onClick={() => handleRecallTemplate(tpl)}
                      className="hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <td className="p-3 font-medium text-foreground">
                        <div>{tpl.description}</div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          Amount: ${tpl.amount.toFixed(2)} | Dept: {tpl.department}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRecallTemplate(tpl)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
                        >
                          Load
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowRecurringModal(false)}
                className="bg-card hover:bg-muted text-foreground border border-border px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Supporting Document Modal */}
      {showSupportingDocModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-primary" />
                <span>Supporting Document</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowSupportingDocModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Enter the link to your supporting document... (You can copy the link from your Google Drive, Dropbox, or company intranet)
            </p>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Document Url</label>
              <input
                type="url"
                value={supportingDocUrl}
                onChange={(e) => setSupportingDocUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full bg-card border border-input rounded-lg p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowSupportingDocModal(false)}
                className="bg-card hover:bg-muted text-foreground px-4 py-2 rounded-lg text-xs font-semibold border border-border transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSupportingDocModal(false);
                  onShowToast('Supporting document link attached.');
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

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
