'use client';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Vanguard ERP - Module 1: Journal Vouchers (JV)
 * 100% Functional, Layout, and Behavioral Parity with Omega ERP:
 * 1. Main List View:
 *    - Top Header: + New, Recurring Vouchers, Actions Dropdown (Account Inquiry, Show Deleted Transactions, Show Lately Updated), Watch Tutorial.
 *    - 2-Row Filter Grid: Row 1 (Search, From Date, To Date, Filter Button); Row 2 (5 Distinct Dropdowns with embedded Search).
 *    - Table with Post All confirmation dialog ("YES"), sortable columns, and row actions.
 * 2. Modals:
 *    - Recurring Vouchers Modal ("Use Recurring") with frequency filter and direct template loading.
 *    - Bank Movements Modal ("Show Deleted Transactions").
 *    - Lately Updated Modal with audit trails.
 *    - Cascading Modals Hierarchy: Search Accounts -> Add Account -> Add Account Sub Classes 4 -> Add Account Sub Classes 3.
 * 3. Journal Voucher Add / Entry Screen:
 *    - Header Action Bar: Preview (Back to List), Green Supporting Document button (URL modal).
 *    - Top Voucher Info: Date, Type, Journal Voucher Label with "Copy JVs description to all details" navy icon, Internal Note.
 *    - Multi-Line Entry Grid ("Details"): Columns #, Account, Currency, Debit, Credit, Description, Department, Invoice #, Date, Actions.
 *    - Dynamic quick-add entry row with validations ("Select an account", "Enter amount") and manual Rate button.
 *    - Live balancing engine with Draft and Post & Finalize execution.
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  RotateCcw,
  Check,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Eye,
  Search,
  ExternalLink,
  ChevronDown,
  Trash2,
  Video,
  ArrowUpDown,
  Info,
  Edit,
  Filter,
  X,
  Link as LinkIcon,
  Copy,
  DollarSign,
  Calendar,
  Layers,
  ArrowLeft,
  Building,
  UserCheck
} from 'lucide-react';
import {
  JournalVoucher,
  JVLine,
  AccountDetail,
  LBP_RATE
} from '@/lib/accountingData';
import {
  apiSaveVoucher,
  apiCreateAccount,
  subscribeToAccountingSync
} from '@/lib/accountingPersistenceService';
import {
  LEBANESE_SUB_CLASSES_4,
  LEBANESE_SUB_CLASSES_3,
  CoaAccountHeader
} from '@/lib/lebaneseCoaMaster';
import {
  SearchableFilterDropdown,
  DropdownOption
} from './SearchableFilterDropdown';

// Omega ERP Journal Voucher Types Catalog
export const OMEGA_JV_TYPES = [
  { value: 'All Types', label: 'All Types' },
  { value: 'CN', label: 'CN - CREDIT NOTES' },
  { value: 'DN', label: 'DN - DEBIT NOTES' },
  { value: 'DP', label: 'DP - DEPRECIATION' },
  { value: 'EV', label: 'EV - Expense Voucher' },
  { value: 'JV', label: 'JV - JOURNAL VOUCHER' },
  { value: 'PU', label: 'PU - PURCHASE VOUCHER' },
  { value: 'PV', label: 'PV - PAYMENT VOUCHER' },
  { value: 'RG', label: 'RG - Return of Goods' },
  { value: 'RV', label: 'RV - RECEIPT VOUCHER' },
  { value: 'SL', label: 'SL - SALES VOUCHER' },
  { value: 'SV', label: 'SV - Expense Payment Voucher' }
];

// Recurring Voucher Template Interface
export interface RecurringVoucherTemplate {
  id: string;
  description: string;
  user: string;
  date_entered: string;
  frequency: 'Daily' | 'Weekly' | '2 Weeks' | 'Monthly' | 'Quarter' | '6 Months' | 'Yearly' | 'One Time';
  jv_type: string;
  lines: JVLine[];
}

// Deleted Transaction (Bank Movements) Interface
export interface DeletedTransaction {
  id: string;
  date: string;
  date_of_jv: string;
  reference: string;
  amount: number;
  currency: string;
  remark: string;
  created_by: string;
  department: string;
}

// Lately Updated Audit Item Interface
export interface LatelyUpdatedAudit {
  id: string;
  date: string;
  jv_number: string;
  user: string;
  action_type: 'Created' | 'Modified' | 'Posted' | 'Unposted' | 'Lines Reallocated';
  timestamp: string;
  remark: string;
}

interface Module1JournalVouchersProps {
  jvs: JournalVoucher[];
  onSaveJVs: (jvs: JournalVoucher[]) => void;
  accounts: AccountDetail[];
  onShowToast: (msg: string, isError?: boolean) => void;
  onOpenStatement?: (account: AccountDetail) => void;
  initialScreenMode?: 'LIST' | 'ENTRY';
}

export function Module1JournalVouchers({
  jvs,
  onSaveJVs,
  accounts: initialAccounts,
  onShowToast,
  onOpenStatement,
  initialScreenMode = 'LIST'
}: Module1JournalVouchersProps) {
  const { t } = useLanguage();
  // Screen mode: 'LIST' or 'ENTRY' (Opened via `+ New`)
  const [screenMode, setScreenMode] = useState<'LIST' | 'ENTRY'>(initialScreenMode);

  // Master accounts state for new account creation
  const [accounts, setAccounts] = useState<AccountDetail[]>(initialAccounts);
  useEffect(() => {
    setAccounts(initialAccounts);
  }, [initialAccounts]);

  useEffect(() => {
    const unsubscribe = subscribeToAccountingSync((event) => {
      if (event.detail?.type === 'ACCOUNT_SAVED' && event.detail.data) {
        setAccounts((prev) => {
          const acc = event.detail.data;
          const idx = prev.findIndex((a) => a.account_number === acc.account_number);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = acc;
            return next;
          }
          return [acc, ...prev];
        });
      }
    });
    return unsubscribe;
  }, []);

  // Dynamic lists of sub classes for modals
  const [subClasses4List, setSubClasses4List] = useState<CoaAccountHeader[]>(LEBANESE_SUB_CLASSES_4);
  const [subClasses3List, setSubClasses3List] = useState<CoaAccountHeader[]>(LEBANESE_SUB_CLASSES_3);

  // =========================================================================
  // 1. LIST VIEW FILTER BAR STATE
  // =========================================================================
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-12-31');

  // Row 2 Distinct 5 Filter Dropdowns
  const [filterTransaction, setFilterTransaction] = useState('All Transactions'); // All Transactions | Posted | UnPosted
  const [filterType, setFilterType] = useState('All Types'); // Options from OMEGA_JV_TYPES
  const [filterDept, setFilterDept] = useState('All Departments');
  const [filterSubDept, setFilterSubDept] = useState('All Sub Departments');
  const [filterUser, setFilterUser] = useState('All Users');
  const [appliedFilters, setAppliedFilters] = useState(0);

  // Sorting State
  const [sortField, setSortField] = useState<'date' | 'dateOfJv' | 'amount'>('dateOfJv');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Actions Dropdown Menu state
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  // =========================================================================
  // 2. MODAL STATES
  // =========================================================================
  // A. Recurring Vouchers Modal
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [recurringSearch, setRecurringSearch] = useState('');
  const [recurringFrequency, setRecurringFrequency] = useState<string>('All');

  // B. Deleted Transactions (Bank Movements) Modal
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  const [deletedSearch, setDeletedSearch] = useState('');

  // C. Lately Updated Modal
  const [showLatelyUpdatedModal, setShowLatelyUpdatedModal] = useState(false);

  // D. Post All Confirmation Modal ("YES")
  const [showPostAllModal, setShowPostAllModal] = useState(false);
  const [postAllInputText, setPostAllInputText] = useState('');

  // E. View JV Detail Audit Modal
  const [viewingJv, setViewingJv] = useState<JournalVoucher | null>(null);

  // Deep-Link & URL Query Parameters Listener (e.g. ?voucherId=JV-2026-0001 or ?id=...)
  const searchParams = useSearchParams();
  const deepLinkedJvId = searchParams?.get('voucherId') || searchParams?.get('id') || searchParams?.get('jv');
  const [hasHandledJvDeepLink, setHasHandledJvDeepLink] = useState(false);

  useEffect(() => {
    if (!deepLinkedJvId || hasHandledJvDeepLink) return;

    const cleanId = deepLinkedJvId.trim();

    // Check if matching voucher exists in jvs
    const matched = jvs.find(
      (v) =>
        v.id.toLowerCase() === cleanId.toLowerCase() ||
        v.jv_number.toLowerCase() === cleanId.toLowerCase()
    );

    if (matched) {
      setViewingJv(matched);
      onShowToast?.(`Journal Voucher ${matched.jv_number} opened from deep link.`);
      setHasHandledJvDeepLink(true);
    } else if (jvs.length > 0) {
      // Graceful Fallback: If target voucher/modal is not found or not yet fully implemented,
      // prevent dead ends: show a clear informative toast and filter the general inquiry list.
      onShowToast?.(`Notice: Journal Voucher "${cleanId}" not found or archived. Displaying voucher inquiry list.`, false);
      setSearchQuery(cleanId);
      setHasHandledJvDeepLink(true);
    }
  }, [deepLinkedJvId, jvs, hasHandledJvDeepLink, onShowToast]);

  // F. Cascading Modals Hierarchy (Layered stack)
  // Step 1: Search Accounts Modal
  const [showSearchAccountsModal, setShowSearchAccountsModal] = useState(false);
  const [searchAccountsType, setSearchAccountsType] = useState<string>('All Accounts');
  const [searchAccountsQuery, setSearchAccountsQuery] = useState('');

  // Step 2: Add Account Modal
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountDesc, setNewAccountDesc] = useState('');
  const [newAccountType, setNewAccountType] = useState('Customer');
  const [newAccountHeader, setNewAccountHeader] = useState('Account Receivables (41110)');
  const [newAccountNumber, setNewAccountNumber] = useState('4111005');

  // Step 3: Add Account Sub Classes 4 Modal
  const [showAddSubClass4Modal, setShowAddSubClass4Modal] = useState(false);
  const [newSub4Name, setNewSub4Name] = useState('');
  const [newSub4HeaderNumber, setNewSub4HeaderNumber] = useState('');
  const [newSub4Sub3Ref, setNewSub4Sub3Ref] = useState('Sales Ledger ( Debtors From Sales), (411)');
  const [newSub4ClassType, setNewSub4ClassType] = useState('-Select One-');

  // Step 4: Add Account Sub Classes 3 Modal
  const [showAddSubClass3Modal, setShowAddSubClass3Modal] = useState(false);
  const [newSub3Name, setNewSub3Name] = useState('');
  const [newSub3HeaderNumber, setNewSub3HeaderNumber] = useState('');
  const [newSub3Sub2Ref, setNewSub3Sub2Ref] = useState('41 - Customers & Accounts Receivable');

  // =========================================================================
  // 3. JOURNAL VOUCHER ADD / ENTRY SCREEN STATE
  // =========================================================================
  const [isSavingVoucher, setIsSavingVoucher] = useState(false);
  const [voucherNumber, setVoucherNumber] = useState('JV-2026-1001');
  const [voucherDate, setVoucherDate] = useState('2026-09-19');
  const [voucherType, setVoucherType] = useState<string>('JV');
  const [voucherLabel, setVoucherLabel] = useState('Physical cash received for shipment & settlement');
  const [internalNote, setInternalNote] = useState('');

  // Supporting Document modal
  const [showSupportingDocModal, setShowSupportingDocModal] = useState(false);
  const [supportingDocUrl, setSupportingDocUrl] = useState('');

  // Manual Currency Exchange Rate modal
  const [showRateModal, setShowRateModal] = useState(false);
  const [customRateUsd, setCustomRateUsd] = useState('1.00');
  const [customRateLbp, setCustomRateLbp] = useState('89500');
  const [customRateEur, setCustomRateEur] = useState('1.08');

  // Multi-line ledger grid
  const [lines, setLines] = useState<JVLine[]>([
    {
      id: 'line-1',
      line_number: 1,
      account_id: accounts[0]?.id || 'acc-53000',
      account_number: accounts[0]?.account_number || '53000',
      account_name: accounts[0]?.account_name || 'Cash (Main Physical Vault)',
      description: 'Physical cash received for shipment',
      amount_debit: 5000,
      amount_credit: 0,
      currency_rate: 1.0,
      amount_native: 5000
    },
    {
      id: 'line-2',
      line_number: 2,
      account_id: accounts[1]?.id || 'acc-5121',
      account_number: accounts[1]?.account_number || '5121',
      account_name: accounts[1]?.account_name || 'Bank Bob Lbp (Bank of Beirut Commercial)',
      description: 'Customer settlement transfer',
      amount_debit: 0,
      amount_credit: 5000,
      currency_rate: 1.0,
      amount_native: 5000
    }
  ]);

  // Dynamic quick-entry row inputs (at bottom of grid)
  const [quickAccountId, setQuickAccountId] = useState('');
  const [quickCurrency, setQuickCurrency] = useState<'USD' | 'LBP' | 'EUR'>('USD');
  const [quickDebit, setQuickDebit] = useState<string>('');
  const [quickCredit, setQuickCredit] = useState<string>('');
  const [quickDescription, setQuickDescription] = useState('');
  const [quickDepartment, setQuickDepartment] = useState('Main Department');
  const [quickInvoiceNo, setQuickInvoiceNo] = useState('');
  const [quickDate, setQuickDate] = useState('2026-09-19');

  // =========================================================================
  // SEED DATA FOR AUDIT TRAILS & RECURRING TEMPLATES
  // =========================================================================
  const recurringTemplates: RecurringVoucherTemplate[] = useMemo(
    () => [
      {
        id: 'rec-001',
        description: 'Monthly HQ Office & Warehouse Lease Amortization',
        user: 'Super Admin',
        date_entered: '01-Jan-2026',
        frequency: 'Monthly',
        jv_type: 'JV',
        lines: [
          {
            id: 'rec-l-1',
            line_number: 1,
            account_id: accounts[0]?.id || '',
            account_number: '62630',
            account_name: 'Rent (Buildings)',
            description: 'Monthly HQ rent amortization',
            amount_debit: 3500,
            amount_credit: 0,
            currency_rate: 1.0,
            amount_native: 3500
          },
          {
            id: 'rec-l-2',
            line_number: 2,
            account_id: accounts[1]?.id || '',
            account_number: '40110',
            account_name: 'Billings / Landlord Payable',
            description: 'Monthly HQ rent amortization',
            amount_debit: 0,
            amount_credit: 3500,
            currency_rate: 1.0,
            amount_native: 3500
          }
        ]
      },
      {
        id: 'rec-002',
        description: 'Bi-Weekly Factory Maintenance & Utilities Allocation',
        user: 'Finance Controller',
        date_entered: '15-Jan-2026',
        frequency: '2 Weeks',
        jv_type: 'JV',
        lines: [
          {
            id: 'rec-l-3',
            line_number: 1,
            account_id: accounts[0]?.id || '',
            account_number: '61140',
            account_name: 'Electricity & Utilities',
            description: 'Bi-weekly plant electricity & power generator expense',
            amount_debit: 1800,
            amount_credit: 0,
            currency_rate: 1.0,
            amount_native: 1800
          },
          {
            id: 'rec-l-4',
            line_number: 2,
            account_id: accounts[1]?.id || '',
            account_number: '51210',
            account_name: 'Bank Operating Account',
            description: 'Bi-weekly plant electricity & power generator expense',
            amount_debit: 0,
            amount_credit: 1800,
            currency_rate: 1.0,
            amount_native: 1800
          }
        ]
      },
      {
        id: 'rec-003',
        description: 'Monthly Social Security NSSF Accruals & Staff Allocations',
        user: 'Ziad Khoury',
        date_entered: '01-Feb-2026',
        frequency: 'Monthly',
        jv_type: 'JV',
        lines: [
          {
            id: 'rec-l-5',
            line_number: 1,
            account_id: accounts[0]?.id || '',
            account_number: '63500',
            account_name: 'Social Security Charges',
            description: 'Monthly NSSF employer & employee contribution accrual',
            amount_debit: 4200,
            amount_credit: 0,
            currency_rate: 1.0,
            amount_native: 4200
          },
          {
            id: 'rec-l-6',
            line_number: 2,
            account_id: accounts[1]?.id || '',
            account_number: '43150',
            account_name: 'Bills Payable-Social Security Establishments',
            description: 'Monthly NSSF employer & employee contribution accrual',
            amount_debit: 0,
            amount_credit: 4200,
            currency_rate: 1.0,
            amount_native: 4200
          }
        ]
      },
      {
        id: 'rec-004',
        description: 'Quarterly Logistics Fleet & Press Depreciation',
        user: 'Super Admin',
        date_entered: '31-Mar-2026',
        frequency: 'Quarter',
        jv_type: 'DP',
        lines: [
          {
            id: 'rec-l-7',
            line_number: 1,
            account_id: accounts[0]?.id || '',
            account_number: '68120',
            account_name: 'Tangible Fixed Assets3 (Depreciation Charge)',
            description: 'Quarterly fleet depreciation',
            amount_debit: 6500,
            amount_credit: 0,
            currency_rate: 1.0,
            amount_native: 6500
          },
          {
            id: 'rec-l-8',
            line_number: 2,
            account_id: accounts[1]?.id || '',
            account_number: '28250',
            account_name: 'Transport-Vehicles (Accumulated Depreciation)',
            description: 'Quarterly fleet depreciation',
            amount_debit: 0,
            amount_credit: 6500,
            currency_rate: 1.0,
            amount_native: 6500
          }
        ]
      }
    ],
    [accounts]
  );

  const deletedTransactions: DeletedTransaction[] = useMemo(
    () => [
      {
        id: 'del-001',
        date: '12-Jan-2026',
        date_of_jv: '12-Jan-2026',
        reference: 'VOID-BANK-091',
        amount: 1450.0,
        currency: 'USD',
        remark: 'Reversed bank movement - duplicate Blom wire transfer',
        created_by: 'Super Admin',
        department: 'Main Dep.'
      },
      {
        id: 'del-002',
        date: '04-Feb-2026',
        date_of_jv: '04-Feb-2026',
        reference: 'CANCEL-FX-22',
        amount: 890.0,
        currency: 'USD',
        remark: 'Voided currency exchange rounding adjustment',
        created_by: 'Finance Controller',
        department: 'Main Dep.'
      },
      {
        id: 'del-003',
        date: '28-Feb-2026',
        date_of_jv: '28-Feb-2026',
        reference: 'RET-CHK-441',
        amount: 3200.0,
        currency: 'USD',
        remark: 'Bounced cheque movement canceled by treasury',
        created_by: 'Admin',
        department: 'Main Dep.'
      }
    ],
    []
  );

  const latelyUpdatedList: LatelyUpdatedAudit[] = useMemo(
    () => [
      {
        id: 'aud-01',
        date: '19-Sep-2026',
        jv_number: 'JV-2026-1001',
        user: 'Super Admin',
        action_type: 'Posted',
        timestamp: '18:42:10',
        remark: 'Posted dual-currency physical vault cash settlement'
      },
      {
        id: 'aud-02',
        date: '18-Sep-2026',
        jv_number: 'JV-2026-1003',
        user: 'Finance Controller',
        action_type: 'Lines Reallocated',
        timestamp: '15:20:04',
        remark: 'Allocated plant maintenance cost center from HQ to Mill'
      },
      {
        id: 'aud-03',
        date: '17-Sep-2026',
        jv_number: 'JV-2026-1002',
        user: 'Ziad Khoury',
        action_type: 'Modified',
        timestamp: '11:05:32',
        remark: 'Updated memo & reference doc invoice #BLOM-88'
      },
      {
        id: 'aud-04',
        date: '16-Sep-2026',
        jv_number: 'JV-2026-1004',
        user: 'Admin',
        action_type: 'Created',
        timestamp: '09:12:44',
        remark: 'Drafted opening balance voucher for fiscal period'
      }
    ],
    []
  );

  // =========================================================================
  // DYNAMIC FILTER LISTS FOR ROW 2
  // =========================================================================
  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    jvs.forEach((j) => {
      if (j.department) set.add(j.department);
    });
    set.add('Main Dep.');
    set.add('Main Department');
    set.add('Executive & Administration');
    set.add('Plant & Production Mill');
    set.add('Commercial Sales & Retail');
    return ['All Departments', ...Array.from(set)];
  }, [jvs]);

  const subDepartmentOptions = useMemo(() => {
    const set = new Set<string>();
    jvs.forEach((j) => {
      if (j.sub_department) set.add(j.sub_department);
    });
    set.add('Main Department');
    set.add('General Operations');
    set.add('Finance & Treasury');
    set.add('Mill Operations');
    set.add('Utilities & Power');
    return ['All Sub Departments', ...Array.from(set)];
  }, [jvs]);

  const userOptions = useMemo(() => {
    const set = new Set<string>();
    jvs.forEach((j) => {
      if (j.created_by) set.add(j.created_by);
    });
    set.add('Admin');
    set.add('Super Admin');
    set.add('Finance Controller');
    set.add('Ziad Khoury');
    return ['All Users', ...Array.from(set)];
  }, [jvs]);

  // =========================================================================
  // LIST FILTERING & SORTING LOGIC
  // =========================================================================
  const filteredJVs = useMemo(() => {
    let list = [...jvs];

    // Row 1: Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (j) =>
          j.jv_number.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          (j.doc_ref_number && j.doc_ref_number.toLowerCase().includes(q)) ||
          (j.created_by && j.created_by.toLowerCase().includes(q))
      );
    }

    // Row 1: Date Range
    if (dateFrom) {
      list = list.filter((j) => (j.date_of_jv >= dateFrom));
    }
    if (dateTo) {
      list = list.filter((j) => (j.date_of_jv <= dateTo));
    }

    // Row 2 Dropdown 1: All Transactions
    if (filterTransaction === 'Posted') {
      list = list.filter((j) => j.is_posted);
    } else if (filterTransaction === 'UnPosted') {
      list = list.filter((j) => !j.is_posted);
    }

    // Row 2 Dropdown 2: All Types
    if (filterType !== 'All Types') {
      list = list.filter((j) => j.jv_type === filterType);
    }

    // Row 2 Dropdown 3: All Departments
    if (filterDept !== 'All Departments') {
      list = list.filter((j) => j.department?.toLowerCase() === filterDept.toLowerCase());
    }

    // Row 2 Dropdown 4: All Sub Departments
    if (filterSubDept !== 'All Sub Departments') {
      list = list.filter((j) => j.sub_department?.toLowerCase() === filterSubDept.toLowerCase());
    }

    // Row 2 Dropdown 5: All Users
    if (filterUser !== 'All Users') {
      list = list.filter((j) => j.created_by?.toLowerCase() === filterUser.toLowerCase());
    }

    // Sort
    list.sort((a, b) => {
      if (sortField === 'amount') {
        return sortAsc ? a.total_debit - b.total_debit : b.total_debit - a.total_debit;
      }
      if (sortField === 'dateOfJv') {
        return sortAsc
          ? a.date_of_jv.localeCompare(b.date_of_jv)
          : b.date_of_jv.localeCompare(a.date_of_jv);
      }
      return sortAsc
        ? (a.posted_at || a.date_of_jv).localeCompare(b.posted_at || b.date_of_jv)
        : (b.posted_at || b.date_of_jv).localeCompare(a.posted_at || a.date_of_jv);
    });

    return list;
  }, [
    jvs,
    searchQuery,
    dateFrom,
    dateTo,
    filterTransaction,
    filterType,
    filterDept,
    filterSubDept,
    filterUser,
    sortField,
    sortAsc,
    appliedFilters
  ]);

  // =========================================================================
  // BATCH POST ALL WITH "YES" CONFIRMATION
  // =========================================================================
  const handleConfirmPostAll = () => {
    if (postAllInputText.trim() !== 'YES') {
      onShowToast('Please type YES to confirm mass posting.', true);
      return;
    }

    const unposted = jvs.filter((j) => !j.is_posted);
    if (unposted.length === 0) {
      onShowToast('All Journal Vouchers are already posted.');
      setShowPostAllModal(false);
      setPostAllInputText('');
      return;
    }

    const updated = jvs.map((j) => ({
      ...j,
      is_posted: true,
      posted_at: j.posted_at || new Date().toISOString(),
      posted_by: j.posted_by || 'Super Admin (Mass Post Execution)'
    }));

    onSaveJVs(updated);
    onShowToast(`Successfully posted ${unposted.length} unposted transactions in batch!`);
    setShowPostAllModal(false);
    setPostAllInputText('');
  };

  // Toggle single post
  const handleTogglePost = (jvId: string) => {
    const updated = jvs.map((j) => {
      if (j.id === jvId) {
        return {
          ...j,
          is_posted: !j.is_posted,
          posted_at: !j.is_posted ? new Date().toISOString() : undefined,
          posted_by: !j.is_posted ? 'Super Admin' : undefined
        };
      }
      return j;
    });
    onSaveJVs(updated);
    const target = updated.find((j) => j.id === jvId);
    onShowToast(`Voucher ${target?.jv_number} status set to: ${target?.is_posted ? 'Posted' : 'Draft'}`);
  };

  // =========================================================================
  // RECURRING VOUCHERS MODAL ACTIONS
  // =========================================================================
  const filteredRecurring = useMemo(() => {
    return recurringTemplates.filter((t) => {
      const matchSearch =
        !recurringSearch.trim() ||
        t.description.toLowerCase().includes(recurringSearch.toLowerCase()) ||
        t.user.toLowerCase().includes(recurringSearch.toLowerCase());
      const matchFreq = recurringFrequency === 'All' || t.frequency === recurringFrequency;
      return matchSearch && matchFreq;
    });
  }, [recurringTemplates, recurringSearch, recurringFrequency]);

  const handleSelectRecurringTemplate = (template: RecurringVoucherTemplate) => {
    setVoucherNumber(`JV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setVoucherLabel(template.description);
    setVoucherType(template.jv_type);
    setLines(template.lines);
    setShowRecurringModal(false);
    setScreenMode('ENTRY');
    onShowToast(`Loaded recurring voucher template: ${template.description}`);
  };

  // =========================================================================
  // CASCADING MODALS LOGIC (ACCOUNT INQUIRY HIERARCHY)
  // =========================================================================
  const filteredSearchAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchType =
        searchAccountsType === 'All Accounts' ||
        acc.account_sub_type?.toLowerCase() === searchAccountsType.toLowerCase() ||
        acc.account_type.toLowerCase() === searchAccountsType.toLowerCase();

      const matchQuery =
        !searchAccountsQuery.trim() ||
        acc.account_number.toLowerCase().includes(searchAccountsQuery.toLowerCase()) ||
        acc.account_name.toLowerCase().includes(searchAccountsQuery.toLowerCase());

      return matchType && matchQuery;
    });
  }, [accounts, searchAccountsType, searchAccountsQuery]);

  // Step 2 Save Account
  const handleSaveNewAccount = async () => {
    if (!newAccountName.trim()) {
      onShowToast('Account Name is required.', true);
      return;
    }
    if (!newAccountNumber.trim()) {
      onShowToast('Account Number is required.', true);
      return;
    }

    try {
      const res = await apiCreateAccount({
        account_number: newAccountNumber.trim(),
        account_name: newAccountName.trim(),
        description: newAccountDesc.trim() || undefined,
        class_id: 4,
        sub_class4_id: 41110,
        account_type: 'ASSET',
        account_sub_type: newAccountType.toUpperCase() as any,
        type: newAccountType,
        class_type: 'Assets'
      });

      setAccounts((prev) => [res.account, ...prev.filter((a) => a.account_number !== res.account.account_number)]);
      onShowToast(`Account #${res.account.account_number} - ${res.account.account_name} persisted to database! [ID: ${res.account.id.slice(0, 8)}...]`);
      setShowAddAccountModal(false);
      setNewAccountName('');
      setNewAccountDesc('');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to persist account', true);
    }
  };

  // Step 3 Save Sub Class 4
  const handleSaveSubClass4 = () => {
    if (!newSub4Name.trim() || !newSub4HeaderNumber.trim()) {
      onShowToast('Account Name and Header Number are required.', true);
      return;
    }
    const item: CoaAccountHeader = {
      account_name: newSub4Name.trim(),
      account_number: newSub4HeaderNumber.trim(),
      class_id: 4
    };
    setSubClasses4List((prev) => [item, ...prev]);
    setNewAccountHeader(`${item.account_name} (${item.account_number})`);
    onShowToast(`Sub Class 4 "${item.account_name} (${item.account_number})" added.`);
    setShowAddSubClass4Modal(false);
    setNewSub4Name('');
    setNewSub4HeaderNumber('');
  };

  // Step 4 Save Sub Class 3
  const handleSaveSubClass3 = () => {
    if (!newSub3Name.trim() || !newSub3HeaderNumber.trim()) {
      onShowToast('Account Name and Header Number are required.', true);
      return;
    }
    const item: CoaAccountHeader = {
      account_name: newSub3Name.trim(),
      account_number: newSub3HeaderNumber.trim(),
      class_id: 4
    };
    setSubClasses3List((prev) => [item, ...prev]);
    setNewSub4Sub3Ref(`${item.account_name}, (${item.account_number})`);
    onShowToast(`Sub Class 3 "${item.account_name} (${item.account_number})" added.`);
    setShowAddSubClass3Modal(false);
    setNewSub3Name('');
    setNewSub3HeaderNumber('');
  };

  // =========================================================================
  // 4. JOURNAL VOUCHER ADD / ENTRY SCREEN DUAL-ENTRY ENGINE
  // =========================================================================
  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.amount_debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.amount_credit) || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.001 && totalDebit > 0;

  // "Copy JVs description to all details" action
  const handleCopyDescriptionToAll = () => {
    if (!voucherLabel.trim()) {
      onShowToast('Please enter a Journal Voucher Label first.', true);
      return;
    }
    setLines((prev) =>
      prev.map((line) => ({
        ...line,
        description: voucherLabel
      }))
    );
    onShowToast('Copied voucher label to all detail row descriptions.');
  };

  // Add line via quick-add row controls with validations
  const handleAddQuickLine = () => {
    // Validation 1: Blank account
    if (!quickAccountId) {
      onShowToast('Select an account', true);
      return;
    }

    const debitVal = Number(quickDebit) || 0;
    const creditVal = Number(quickCredit) || 0;

    // Validation 2: If Debit AND Credit are empty or 0
    if (debitVal === 0 && creditVal === 0) {
      onShowToast('Enter amount', true);
      return;
    }

    const targetAcc = accounts.find((a) => a.id === quickAccountId);
    const nextLineNum = lines.length + 1;

    const newLine: JVLine = {
      id: `line-${Date.now()}-${nextLineNum}`,
      line_number: nextLineNum,
      account_id: targetAcc?.id || '',
      account_number: targetAcc?.account_number || '',
      account_name: targetAcc?.account_name || 'Selected Account',
      description: quickDescription.trim() || voucherLabel || '',
      amount_debit: debitVal,
      amount_credit: creditVal,
      currency_rate: quickCurrency === 'USD' ? 1.0 : quickCurrency === 'LBP' ? 1 / LBP_RATE : 1.08,
      amount_native: debitVal > 0 ? debitVal : creditVal,
      department_name: quickDepartment
    };

    setLines((prev) => [...prev, newLine]);

    // Reset quick inputs
    setQuickAccountId('');
    setQuickDebit('');
    setQuickCredit('');
    setQuickDescription('');
    setQuickInvoiceNo('');
    onShowToast(`Line added: #${newLine.account_number} - ${newLine.account_name}`);
  };

  const handleDeleteLine = (index: number) => {
    if (lines.length <= 1) {
      onShowToast('At least one line is required in the voucher.', true);
      return;
    }
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateLine = (index: number, field: keyof JVLine, value: any) => {
    setLines((prev) => {
      const copy = [...prev];
      const line = { ...copy[index] };

      if (field === 'account_id') {
        const acc = accounts.find((a) => a.id === value);
        if (acc) {
          line.account_id = acc.id;
          line.account_number = acc.account_number;
          line.account_name = acc.account_name;
        }
      } else if (field === 'amount_debit') {
        const val = Number(value) || 0;
        line.amount_debit = val;
        if (val > 0) line.amount_credit = 0;
      } else if (field === 'amount_credit') {
        const val = Number(value) || 0;
        line.amount_credit = val;
        if (val > 0) line.amount_debit = 0;
      } else {
        (line as any)[field] = value;
      }

      copy[index] = line;
      return copy;
    });
  };

  const handleSaveVoucher = async (postImmediately = true) => {
    if (!isBalanced) {
      onShowToast('Cannot save unbalanced voucher! Difference must be 0.00.', true);
      return;
    }
    if (!voucherLabel.trim()) {
      onShowToast('Journal voucher Label is required.', true);
      return;
    }

    try {
      setIsSavingVoucher(true);
      const res = await apiSaveVoucher({
        voucher: {
          jv_number: voucherNumber,
          date_of_jv: voucherDate,
          jv_type: (voucherType as any) || 'JV',
          currency_id: 'USD',
          doc_ref_number: supportingDocUrl || undefined,
          description: voucherLabel,
          internal_remark: internalNote || undefined,
          department: 'Main Department',
          sub_department: 'General Operations',
          created_by: 'Super Admin'
        },
        lines,
        postImmediately
      });

      const savedJv = res.voucher;
      const updated = [savedJv, ...jvs.filter((v) => v.id !== savedJv.id && v.jv_number !== savedJv.jv_number)];
      onSaveJVs(updated);

      onShowToast(
        `Journal Voucher ${savedJv.jv_number} ${postImmediately ? 'successfully posted & GL entries created!' : 'saved as draft.'} [DB ID: ${savedJv.id.slice(0, 12)}...]`
      );

      // Reset and return to List view
      setVoucherNumber(`JV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setVoucherLabel('');
      setInternalNote('');
      setSupportingDocUrl('');
      setScreenMode('LIST');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to persist journal voucher', true);
    } finally {
      setIsSavingVoucher(false);
    }
  };

  // Format date helper
  const formatDateDisplay = (d: string) => {
    if (!d) return '-';
    // If yyyy-mm-dd format, format as DD-MMM-YYYY
    const parts = d.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(parts[1], 10) - 1;
      return `${parts[2]}-${months[mIdx] || parts[1]}-${parts[0]}`;
    }
    return d;
  };

  return (
    <div className="space-y-5">
      {/* ========================================================================= */}
      {/* 1. MAIN LIST VIEW LAYOUT & INTERACTIONS                                   */}
      {/* ========================================================================= */}
      {screenMode === 'LIST' && (
        <div className="space-y-4">
          {/* A. TOP NAVIGATION HEADER */}
          <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            {/* Left side: + New & Recurring Vouchers */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setVoucherNumber(`JV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
                  setScreenMode('ENTRY');
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRecurringModal(true)}
                className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                {t('recurring_vouchers', 'Recurring Vouchers')}
              </button>
            </div>

            {/* Right side: Actions Dropdown & Watch Tutorial */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowActionsDropdown((prev) => !prev)}
                  className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <span>{t('actions', 'Actions')}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${showActionsDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showActionsDropdown && (
                  <div className="absolute right-0 mt-1 w-64 bg-card border border-border rounded-xl shadow-xl p-1.5 z-30 text-xs animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsDropdown(false);
                        setShowSearchAccountsModal(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted font-medium text-foreground transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{t('account_inquiry', 'Account Inquiry')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsDropdown(false);
                        setShowDeletedModal(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted font-medium text-foreground transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive shrink-0" />
                      <span>{t('show_deleted_transactions', 'Show Deleted Transactions')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsDropdown(false);
                        setShowLatelyUpdatedModal(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted font-medium text-foreground transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Edit className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{t('show_lately_updated', 'Show Lately Updated')}</span>
                    </button>
                  </div>
                )}
              </div>

              <a
                href="#watch-tutorial"
                onClick={(e) => {
                  e.preventDefault();
                  onShowToast('Tutorial: Double-entry JV balancing engine & cost center allocation.');
                }}
                className="text-primary hover:underline text-xs font-semibold flex items-center gap-1 px-2 py-2"
              >
                <Video className="w-3.5 h-3.5" />
                <span>{t('watch_tutorial', 'Watch Tutorial')}</span>
              </a>
            </div>
          </div>

          {/* B. 2-ROW FILTER GRID (EXACT OMEGA ERP PARITY) */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-3">
            {/* ROW 1: Search, From Date, To Date, Filter Button (No dropdowns in Row 1) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">
              {/* Search text field */}
              <div className="sm:col-span-2 md:col-span-5">
                <label className="text-muted-foreground mb-1 block text-xs font-medium">{t('search', 'Search...')}</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('search_voucher_reference_remark', 'Search voucher #, reference, remark...')}
                    className="w-full bg-card border border-input rounded-lg pl-8 pr-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs text-xs"
                  />
                </div>
              </div>

              {/* Date From (Default 01-Jan-2026) */}
              <div className="md:col-span-3">
                <label className="text-muted-foreground mb-1 block text-xs font-medium">{t('from', 'From')}</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-card border border-input rounded-lg p-1.5 text-foreground font-mono shadow-2xs text-xs"
                />
              </div>

              {/* Date To (Default 31-Dec-2026) */}
              <div className="md:col-span-3">
                <label className="text-muted-foreground mb-1 block text-xs font-medium">{t('to', 'To')}</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-card border border-input rounded-lg p-1.5 text-foreground font-mono shadow-2xs text-xs"
                />
              </div>

              {/* Explicit Filter Button at the end of Row 1 */}
              <div className="md:col-span-1">
                <button
                  type="button"
                  onClick={() => {
                    setAppliedFilters((c) => c + 1);
                    onShowToast(`Filter applied: ${filteredJVs.length} vouchers matched.`);
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>{t('filter', 'Filter')}</span>
                </button>
              </div>
            </div>

            {/* ROW 2: 5 Distinct Dropdowns with embedded Search... boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-medium pt-2 border-t border-border/50">
              {/* 1. All Transactions (All Transactions, Posted, UnPosted) */}
              <SearchableFilterDropdown
                label="Transactions"
                value={filterTransaction}
                onChange={setFilterTransaction}
                options={['All Transactions', 'Posted', 'UnPosted']}
                searchPlaceholder="Search transaction status..."
              />

              {/* 2. All Types (Omega catalog with internal search) */}
              <SearchableFilterDropdown
                label="Type"
                value={filterType}
                onChange={setFilterType}
                options={OMEGA_JV_TYPES}
                searchPlaceholder="Search voucher type..."
              />

              {/* 3. All Departments */}
              <SearchableFilterDropdown
                label="Department"
                value={filterDept}
                onChange={setFilterDept}
                options={departmentOptions}
                searchPlaceholder="Search department..."
              />

              {/* 4. All Sub Departments */}
              <SearchableFilterDropdown
                label="Sub Department"
                value={filterSubDept}
                onChange={setFilterSubDept}
                options={subDepartmentOptions}
                searchPlaceholder="Search sub department..."
              />

              {/* 5. All Users */}
              <SearchableFilterDropdown
                label="User"
                value={filterUser}
                onChange={setFilterUser}
                options={userOptions}
                searchPlaceholder="Search user..."
              />
            </div>
          </div>

          {/* C. TABLE & ACTIONS */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span suppressHydrationWarning className="font-bold text-xs text-foreground">
                  Showing {filteredJVs.length} of {jvs.length} Records
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  (Dual Currency: USD &amp; LBP @ {LBP_RATE.toLocaleString()})
                </span>
              </div>

              {/* Far Right: Green Post All button opening confirmation modal */}
              <button
                type="button"
                onClick={() => {
                  setPostAllInputText('');
                  setShowPostAllModal(true);
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t('post_all', 'Post All')}</span>
              </button>
            </div>

            {/* LIST TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-muted text-foreground font-semibold border-b border-border select-none">
                    <th
                      className="p-2.5 cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => {
                        setSortField('date');
                        setSortAsc((p) => !p);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>{t('date', 'Date')}</span>
                        <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </th>
                    <th
                      className="p-2.5 cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => {
                        setSortField('dateOfJv');
                        setSortAsc((p) => !p);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>{t('date_of_jv', 'Date Of JV')}</span>
                        <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </th>
                    <th className="p-2.5">{t('type', 'Type')}</th>
                    <th className="p-2.5">{t('reference', 'Reference')}</th>
                    <th
                      className="p-2.5 text-right cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => {
                        setSortField('amount');
                        setSortAsc((p) => !p);
                      }}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Amount ($ / LBP)</span>
                        <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </th>
                    <th className="p-2.5 min-w-[200px]">{t('remark', 'Remark')}</th>
                    <th className="p-2.5 text-center">{t('posted', 'Posted')}</th>
                    <th className="p-2.5">{t('created_by', 'Created by')}</th>
                    <th className="p-2.5">{t('sub_department', 'Sub Department')}</th>
                    <th className="p-2.5 text-right">{t('actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {filteredJVs.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-muted-foreground text-xs font-semibold">
                        {t('no_transactions_found', 'No Transactions Found!')}
                      </td>
                    </tr>
                  ) : (
                    filteredJVs.map((jv) => {
                      const amountLBP = jv.total_debit * LBP_RATE;
                      return (
                        <tr key={jv.id} className="hover:bg-muted/40 text-foreground transition-colors">
                          <td className="p-2.5 font-mono text-muted-foreground text-[11px]">
                            {formatDateDisplay(jv.posted_at ? jv.posted_at.split('T')[0] : jv.date_of_jv)}
                          </td>
                          <td className="p-2.5 font-mono font-bold text-foreground">
                            {formatDateDisplay(jv.date_of_jv)}
                            <div className="text-[10px] text-muted-foreground font-mono">{jv.jv_number}</div>
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-foreground border border-border">
                              {jv.jv_type}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-muted-foreground text-xs">
                            {jv.doc_ref_number || '-'}
                          </td>
                          <td className="p-2.5 text-right">
                            <div className="font-mono font-bold text-emerald-700">
                              ${jv.total_debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <div className="font-mono text-[10px] text-muted-foreground">
                              {amountLBP.toLocaleString()} LBP
                            </div>
                          </td>
                          <td className="p-2.5 max-w-xs truncate text-foreground">{jv.description}</td>
                          <td className="p-2.5 text-center">
                            {jv.is_posted ? (
                              <span className="bg-card text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {t('posted', 'Posted')}
                              </span>
                            ) : (
                              <span className="bg-card text-amber-700 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs">
                                {t('draft', 'Draft')}
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-xs text-muted-foreground">
                            {jv.created_by || 'Admin'}
                          </td>
                          <td className="p-2.5 text-xs text-muted-foreground">
                            {jv.sub_department || 'General Operations'}
                          </td>
                          <td className="p-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleTogglePost(jv.id)}
                                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer border ${
                                  jv.is_posted
                                    ? 'bg-card hover:bg-muted text-destructive border-border'
                                    : 'bg-primary hover:bg-primary/90 text-primary-foreground border-transparent'
                                }`}
                              >
                                {jv.is_posted ? 'Unpost' : 'Post'}
                              </button>

                              <button
                                type="button"
                                onClick={() => setViewingJv(jv)}
                                title={t('view_voucher_detail', 'View Voucher Detail')}
                                className="bg-card hover:bg-muted text-foreground border border-border p-1 rounded transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (typeof window !== 'undefined') window.print();
                                }}
                                title={t('print_voucher', 'Print Voucher')}
                                className="bg-card hover:bg-muted text-foreground border border-border p-1 rounded transition-colors cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. JOURNAL VOUCHER ADD / ENTRY SCREEN (JOURNAL VOUCHER ADD ROUTE)         */}
      {/* ========================================================================= */}
      {screenMode === 'ENTRY' && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-5 animate-fadeIn">
          {/* A. HEADER ACTION BAR */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-2">
              {/* Preview Button (navigates back to List View) */}
              <button
                type="button"
                onClick={() => setScreenMode('LIST')}
                className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('preview', 'Preview')}</span>
              </button>

              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 ml-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>{t('journal_voucher_entry', 'Journal Voucher Entry')}</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-border uppercase">
                {voucherNumber}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Green Supporting Document Button */}
              <button
                type="button"
                onClick={() => setShowSupportingDocModal(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{t('supporting_document', 'Supporting Document')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLines([
                    {
                      id: `line-${Date.now()}-1`,
                      line_number: 1,
                      account_id: accounts[0]?.id || '',
                      account_number: accounts[0]?.account_number || '',
                      account_name: accounts[0]?.account_name || '',
                      description: '',
                      amount_debit: 0,
                      amount_credit: 0,
                      currency_rate: 1.0,
                      amount_native: 0
                    },
                    {
                      id: `line-${Date.now()}-2`,
                      line_number: 2,
                      account_id: accounts[1]?.id || '',
                      account_number: accounts[1]?.account_number || '',
                      account_name: accounts[1]?.account_name || '',
                      description: '',
                      amount_debit: 0,
                      amount_credit: 0,
                      currency_rate: 1.0,
                      amount_native: 0
                    }
                  ]);
                  setVoucherLabel('');
                  setInternalNote('');
                  onShowToast('Grid reset to clean initial state');
                }}
                title={t('reset_form', 'Reset Form')}
                className="bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border p-1.5 rounded-lg text-xs transition-colors cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* B. TOP VOUCHER INFORMATION CARD ("Journal Voucher") */}
          <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>{t('journal_voucher', 'Journal Voucher')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-medium">
              {/* Date */}
              <div>
                <label className="text-foreground mb-1 block font-semibold">{t('date', 'Date')}</label>
                <input
                  type="date"
                  value={voucherDate}
                  onChange={(e) => setVoucherDate(e.target.value)}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                />
              </div>

              {/* Type (Defaults to JV - JOURNAL VOUCHER) */}
              <div>
                <label className="text-foreground mb-1 block font-semibold">{t('type', 'Type')}</label>
                <select
                  value={voucherType}
                  onChange={(e) => setVoucherType(e.target.value)}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                >
                  {OMEGA_JV_TYPES.filter((t) => t.value !== 'All Types').map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Journal voucher Label* with Copy Description Navy Button */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-foreground font-semibold">{t('journal_voucher_label', 'Journal voucher Label*')}</label>
                  {/* Right adjacent action button (Navy icon) */}
                  <button
                    type="button"
                    onClick={handleCopyDescriptionToAll}
                    title={t('copy_jvs_description_to_all_details', 'Copy JVs description to all details')}
                    className="text-xs font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{t('copy_to_all_details', 'Copy to all details')}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={voucherLabel}
                  onChange={(e) => setVoucherLabel(e.target.value)}
                  placeholder={t('enter_journal_voucher_label_description', 'Enter journal voucher label / description...')}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs text-xs"
                />
              </div>

              {/* Internal Note */}
              <div className="sm:col-span-2 md:col-span-4">
                <label className="text-foreground mb-1 block font-semibold">{t('internal_note', 'Internal Note')}</label>
                <textarea
                  rows={1}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder={t('internal_audit_remarks_or_notes', 'Internal audit remarks or notes...')}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs text-xs"
                />
              </div>
            </div>
          </div>

          {/* C. MULTI-LINE ENTRY GRID ("Details") */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>{t('details', 'Details')}</span>
              </h4>
              <span className="text-[11px] text-muted-foreground font-medium">
                {lines.length} Line(s) in Ledger
              </span>
            </div>

            {/* DYNAMIC ENTRY CONTROLS ROW (QUICK-ADD FORM) */}
            <div className="bg-muted/50 border border-border rounded-xl p-3 space-y-2">
              <div className="text-[11px] font-bold text-foreground flex items-center justify-between">
                <span>{t('quick_line_entry', 'Quick Line Entry')}</span>
                {/* Rate Button */}
                <button
                  type="button"
                  onClick={() => setShowRateModal(true)}
                  className="bg-card hover:bg-muted text-foreground border border-border px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <DollarSign className="w-3 h-3 text-emerald-700" />
                  <span>{t('rate', 'Rate')}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2 text-xs">
                {/* Account Number & Name */}
                <div className="md:col-span-3">
                  <label className="text-muted-foreground mb-1 block text-[11px]">Account Number &amp; Name</label>
                  <select
                    value={quickAccountId}
                    onChange={(e) => setQuickAccountId(e.target.value)}
                    className="w-full bg-card border border-input rounded-lg p-1.5 text-foreground text-xs shadow-2xs font-mono"
                  >
                    <option value="">-- Enter Account Nb. or Name --</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        #{a.account_number} - {a.account_name} ({a.account_sub_type || a.account_type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Currency */}
                <div className="md:col-span-1">
                  <label className="text-muted-foreground mb-1 block text-[11px]">{t('currency', 'Currency')}</label>
                  <select
                    value={quickCurrency}
                    onChange={(e) => setQuickCurrency(e.target.value as any)}
                    className="w-full bg-card border border-input rounded-lg p-1.5 text-foreground text-xs shadow-2xs font-mono"
                  >
                    <option value="USD">{t('usd', 'USD')}</option>
                    <option value="LBP">{t('lbp', 'LBP')}</option>
                    <option value="EUR">{t('eur', 'EUR')}</option>
                  </select>
                </div>

                {/* Debit */}
                <div className="md:col-span-1">
                  <label className="text-muted-foreground mb-1 block text-[11px]">{t('debit', 'Debit')}</label>
                  <input
                    type="number"
                    value={quickDebit}
                    onChange={(e) => {
                      setQuickDebit(e.target.value);
                      if (e.target.value) setQuickCredit('');
                    }}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full bg-card border border-input rounded-lg p-1.5 text-foreground text-right font-mono text-xs shadow-2xs"
                  />
                </div>

                {/* Credit */}
                <div className="md:col-span-1">
                  <label className="text-muted-foreground mb-1 block text-[11px]">{t('credit', 'Credit')}</label>
                  <input
                    type="number"
                    value={quickCredit}
                    onChange={(e) => {
                      setQuickCredit(e.target.value);
                      if (e.target.value) setQuickDebit('');
                    }}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full bg-card border border-input rounded-lg p-1.5 text-foreground text-right font-mono text-xs shadow-2xs"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="text-muted-foreground mb-1 block text-[11px]">{t('description', 'Description')}</label>
                  <input
                    type="text"
                    value={quickDescription}
                    onChange={(e) => setQuickDescription(e.target.value)}
                    placeholder={t('enter_description', 'Enter description...')}
                    className="w-full bg-card border border-input rounded-lg p-1.5 text-foreground text-xs shadow-2xs"
                  />
                </div>

                {/* Department */}
                <div className="md:col-span-1">
                  <label className="text-muted-foreground mb-1 block text-[11px]">{t('department', 'Department')}</label>
                  <select
                    value={quickDepartment}
                    onChange={(e) => setQuickDepartment(e.target.value)}
                    className="w-full bg-card border border-input rounded-lg p-1.5 text-foreground text-xs shadow-2xs"
                  >
                    <option value="Main Department">{t('main_department', 'Main Department')}</option>
                    <option value="Executive & Admin">Executive &amp; Admin</option>
                    <option value="Mill Operations">{t('mill_operations', 'Mill Operations')}</option>
                    <option value="Sales">{t('sales', 'Sales')}</option>
                  </select>
                </div>

                {/* Invoice # */}
                <div className="md:col-span-1">
                  <label className="text-muted-foreground mb-1 block text-[11px]">{t('invoice', 'Invoice #')}</label>
                  <input
                    type="text"
                    value={quickInvoiceNo}
                    onChange={(e) => setQuickInvoiceNo(e.target.value)}
                    placeholder={t('inv', 'INV...')}
                    className="w-full bg-card border border-input rounded-lg p-1.5 text-foreground text-xs shadow-2xs"
                  />
                </div>

                {/* Date */}
                <div className="md:col-span-1">
                  <label className="text-muted-foreground mb-1 block text-[11px]">{t('date', 'Date')}</label>
                  <input
                    type="date"
                    value={quickDate}
                    onChange={(e) => setQuickDate(e.target.value)}
                    className="w-full bg-card border border-input rounded-lg p-1.5 text-foreground font-mono text-xs shadow-2xs"
                  />
                </div>

                {/* + Button */}
                <div className="md:col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={handleAddQuickLine}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                    title={t('add_entry_line', 'Add Entry Line')}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('add', 'Add')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* DETAILS TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-muted text-foreground font-semibold border-b border-border">
                    <th className="p-2.5 w-10 text-center">#</th>
                    <th className="p-2.5 min-w-[240px]">Account Number &amp; Name</th>
                    <th className="p-2.5 w-24">{t('currency', 'Currency')}</th>
                    <th className="p-2.5 w-32 text-right">{t('debit', 'Debit')}</th>
                    <th className="p-2.5 w-32 text-right">{t('credit', 'Credit')}</th>
                    <th className="p-2.5 min-w-[200px]">{t('description', 'Description')}</th>
                    <th className="p-2.5 w-36">{t('department', 'Department')}</th>
                    <th className="p-2.5 w-28">{t('invoice', 'Invoice #')}</th>
                    <th className="p-2.5 w-28">{t('date', 'Date')}</th>
                    <th className="p-2.5 w-12 text-center">{t('actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {lines.map((line, idx) => (
                    <tr key={line.id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-2 text-center font-mono text-muted-foreground">{idx + 1}</td>

                      {/* Account Number & Name */}
                      <td className="p-2">
                        <select
                          value={line.account_id}
                          onChange={(e) => handleUpdateLine(idx, 'account_id', e.target.value)}
                          className="w-full bg-card border border-input rounded-md p-1 text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-mono"
                        >
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              #{acc.account_number} - {acc.account_name} ({acc.account_sub_type || acc.account_type})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Currency */}
                      <td className="p-2 font-mono text-muted-foreground">{t('usd', 'USD')}</td>

                      {/* Debit */}
                      <td className="p-2">
                        <input
                          type="number"
                          value={line.amount_debit || ''}
                          onChange={(e) => handleUpdateLine(idx, 'amount_debit', e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full bg-card border border-input rounded-md p-1 text-foreground font-mono font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs text-right"
                        />
                      </td>

                      {/* Credit */}
                      <td className="p-2">
                        <input
                          type="number"
                          value={line.amount_credit || ''}
                          onChange={(e) => handleUpdateLine(idx, 'amount_credit', e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full bg-card border border-input rounded-md p-1 text-foreground font-mono font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs text-right"
                        />
                      </td>

                      {/* Description */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => handleUpdateLine(idx, 'description', e.target.value)}
                          placeholder={t('description_note', 'Description note...')}
                          className="w-full bg-card border border-input rounded-md p-1 text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                        />
                      </td>

                      {/* Department */}
                      <td className="p-2 text-xs text-muted-foreground">
                        {line.department_name || 'Main Department'}
                      </td>

                      {/* Invoice # */}
                      <td className="p-2 text-xs font-mono text-muted-foreground">-</td>

                      {/* Date */}
                      <td className="p-2 text-xs font-mono text-muted-foreground">{voucherDate}</td>

                      {/* Action */}
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteLine(idx)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors cursor-pointer"
                          title={t('delete_line', 'Delete Line')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* LIVE BALANCE BAR & FOOTER ACTIONS */}
            <div className="bg-muted p-4 rounded-xl border border-border flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <span className="text-muted-foreground block text-[11px]">{t('total_debit', 'Total Debit:')}</span>
                  <span className="font-mono text-emerald-700 text-sm font-bold">
                    ${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">{t('total_credit', 'Total Credit:')}</span>
                  <span className="font-mono text-destructive text-sm font-bold">
                    ${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">{t('difference', 'Difference:')}</span>
                  <span className={`font-mono text-sm font-bold ${isBalanced ? 'text-emerald-700' : 'text-destructive'}`}>
                    ${difference.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isBalanced ? (
                  <span className="bg-card text-emerald-700 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Balanced (0.00 Difference)</span>
                  </span>
                ) : (
                  <span className="bg-card text-destructive border border-destructive/40 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-2xs">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span>Unbalanced Difference ({difference.toFixed(2)})</span>
                  </span>
                )}

                {/* Save Draft */}
                <button
                  type="button"
                  onClick={() => handleSaveVoucher(false)}
                  disabled={!isBalanced || isSavingVoucher}
                  className="bg-card hover:bg-muted disabled:opacity-40 text-foreground border border-border px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                >
                  {isSavingVoucher ? 'Saving...' : 'Save Draft'}
                </button>

                {/* Post & Finalize Voucher */}
                <button
                  type="button"
                  onClick={() => handleSaveVoucher(true)}
                  disabled={!isBalanced || isSavingVoucher}
                  className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingVoucher ? 'Posting to GL...' : 'Post & Finalize Voucher'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODALS & DIALOGS                                                       */}
      {/* ========================================================================= */}

      {/* A. RECURRING VOUCHERS MODAL ("Use Recurring") */}
      {showRecurringModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-primary" />
                <span>{t('use_recurring', 'Use Recurring')}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowRecurringModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Top Filters: Search.. and Select Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-muted-foreground mb-1 block font-medium">{t('search', 'Search..')}</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={recurringSearch}
                    onChange={(e) => setRecurringSearch(e.target.value)}
                    placeholder={t('search_description_or_user', 'Search description or user...')}
                    className="w-full bg-card border border-input rounded-lg pl-8 pr-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block font-medium">{t('select_frequency', 'Select Frequency')}</label>
                <select
                  value={recurringFrequency}
                  onChange={(e) => setRecurringFrequency(e.target.value)}
                  className="w-full bg-card border border-input rounded-lg p-1.5 text-foreground text-xs shadow-2xs"
                >
                  <option value="All">{t('all_frequencies', 'All Frequencies')}</option>
                  <option value="Daily">{t('daily', 'Daily')}</option>
                  <option value="Weekly">{t('weekly', 'Weekly')}</option>
                  <option value="2 Weeks">2 Weeks</option>
                  <option value="Monthly">{t('monthly', 'Monthly')}</option>
                  <option value="Quarter">{t('quarter', 'Quarter')}</option>
                  <option value="6 Months">6 Months</option>
                  <option value="Yearly">{t('yearly', 'Yearly')}</option>
                  <option value="One Time">{t('one_time', 'One Time')}</option>
                </select>
              </div>
            </div>

            {/* Grid Columns: Description | User | Date Entered | Frequency */}
            <div className="overflow-y-auto max-h-72 rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-foreground font-semibold border-b border-border sticky top-0">
                  <tr>
                    <th className="p-2.5">{t('description', 'Description')}</th>
                    <th className="p-2.5">{t('user', 'User')}</th>
                    <th className="p-2.5">{t('date_entered', 'Date Entered')}</th>
                    <th className="p-2.5">{t('frequency', 'Frequency')}</th>
                    <th className="p-2.5 text-right">{t('action', 'Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRecurring.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">
                        {t('no_recurring_templates_found', 'No recurring templates found.')}
                      </td>
                    </tr>
                  ) : (
                    filteredRecurring.map((tpl) => (
                      <tr key={tpl.id} className="hover:bg-muted/40 transition-colors">
                        <td className="p-2.5 font-medium text-foreground">{tpl.description}</td>
                        <td className="p-2.5 text-muted-foreground">{tpl.user}</td>
                        <td className="p-2.5 font-mono text-muted-foreground">{tpl.date_entered}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                            {tpl.frequency}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleSelectRecurringTemplate(tpl)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-2.5 py-1 rounded text-xs font-semibold cursor-pointer shadow-2xs"
                          >
                            {t('use_template', 'Use Template')}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowRecurringModal(false)}
                className="bg-card hover:bg-muted text-foreground border border-border px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {t('close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* B. SHOW DELETED TRANSACTIONS MODAL ("Bank Movements") */}
      {showDeletedModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                <span>{t('bank_movements', 'Bank Movements')}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowDeletedModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter: Search... input */}
            <div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={deletedSearch}
                  onChange={(e) => setDeletedSearch(e.target.value)}
                  placeholder={t('search_bank_movements_remarks_or', 'Search bank movements, remarks, or references...')}
                  className="w-full bg-card border border-input rounded-lg pl-8 pr-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs text-xs"
                />
              </div>
            </div>

            {/* Grid Columns: Date | Date Of JV | Reference | Amount | Remark | Created by | Departement */}
            <div className="overflow-y-auto max-h-72 rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-foreground font-semibold border-b border-border sticky top-0">
                  <tr>
                    <th className="p-2.5">{t('date', 'Date')}</th>
                    <th className="p-2.5">{t('date_of_jv', 'Date Of JV')}</th>
                    <th className="p-2.5">{t('reference', 'Reference')}</th>
                    <th className="p-2.5 text-right">{t('amount', 'Amount')}</th>
                    <th className="p-2.5">{t('remark', 'Remark')}</th>
                    <th className="p-2.5">{t('created_by', 'Created by')}</th>
                    <th className="p-2.5">{t('departement', 'Departement')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {deletedTransactions.filter(
                    (d) =>
                      !deletedSearch.trim() ||
                      d.remark.toLowerCase().includes(deletedSearch.toLowerCase()) ||
                      d.reference.toLowerCase().includes(deletedSearch.toLowerCase())
                  ).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-muted-foreground text-xs font-semibold">
                        {t('no_transactions_found', 'No Transactions Found!')}
                      </td>
                    </tr>
                  ) : (
                    deletedTransactions
                      .filter(
                        (d) =>
                          !deletedSearch.trim() ||
                          d.remark.toLowerCase().includes(deletedSearch.toLowerCase()) ||
                          d.reference.toLowerCase().includes(deletedSearch.toLowerCase())
                      )
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                          <td className="p-2.5 font-mono text-muted-foreground">{item.date}</td>
                          <td className="p-2.5 font-mono text-foreground font-semibold">{item.date_of_jv}</td>
                          <td className="p-2.5 font-mono text-muted-foreground">{item.reference}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-destructive">
                            ${item.amount.toFixed(2)}
                          </td>
                          <td className="p-2.5 max-w-xs truncate text-foreground">{item.remark}</td>
                          <td className="p-2.5 text-muted-foreground">{item.created_by}</td>
                          <td className="p-2.5 text-muted-foreground">{item.department}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowDeletedModal(false)}
                className="bg-card hover:bg-muted text-foreground border border-border px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {t('close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* C. SHOW LATELY UPDATED MODAL ("Lately Updated") */}
      {showLatelyUpdatedModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Edit className="w-4 h-4 text-primary" />
                <span>{t('lately_updated', 'Lately Updated')}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowLatelyUpdatedModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-72 rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-foreground font-semibold border-b border-border sticky top-0">
                  <tr>
                    <th className="p-2.5">{t('date', 'Date')}</th>
                    <th className="p-2.5">{t('voucher', 'Voucher #')}</th>
                    <th className="p-2.5">{t('user', 'User')}</th>
                    <th className="p-2.5">{t('action', 'Action')}</th>
                    <th className="p-2.5">{t('time', 'Time')}</th>
                    <th className="p-2.5">{t('remark', 'Remark')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {latelyUpdatedList.map((audit) => (
                    <tr key={audit.id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-2.5 font-mono text-muted-foreground">{audit.date}</td>
                      <td className="p-2.5 font-mono font-bold text-foreground">{audit.jv_number}</td>
                      <td className="p-2.5 text-muted-foreground">{audit.user}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          {audit.action_type}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-muted-foreground">{audit.timestamp}</td>
                      <td className="p-2.5 text-foreground truncate max-w-xs">{audit.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowLatelyUpdatedModal(false)}
                className="bg-card hover:bg-muted text-foreground border border-border px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {t('close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* D. POST ALL CONFIRMATION MODAL ("YES") */}
      {showPostAllModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>{t('post_all_unposted_transactions', 'Post All Unposted Transactions')}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowPostAllModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-foreground font-medium leading-relaxed">
              {t('are_you_sure_you_want_to_post_all', 'Are you sure you want to post all unposted transactions? if yes type')} <strong className="text-primary font-bold">{t('yes', 'YES')}</strong>
            </p>

            <input
              type="text"
              value={postAllInputText}
              onChange={(e) => setPostAllInputText(e.target.value)}
              placeholder={t('type_yes', 'Type YES')}
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-bold text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            />

            <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowPostAllModal(false)}
                className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>

              <button
                type="button"
                disabled={postAllInputText.trim() !== 'YES'}
                onClick={handleConfirmPostAll}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
              >
                {t('ok', 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CASCADING MODALS HIERARCHY (ACCOUNT INQUIRY STACK)                      */}
      {/* ========================================================================= */}

      {/* STEP 1: SEARCH ACCOUNTS MODAL */}
      {showSearchAccountsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" />
                  <span>{t('search_accounts', 'Search Accounts')}</span>
                </h4>
                {/* Live counter dynamically reflecting filtered/total count */}
                <span className="bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold px-2 py-0.5 rounded">
                  {filteredSearchAccounts.length} / {accounts.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSearchAccountsModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filters: Type * Dropdown, Search... input, + New button */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs items-end">
              {/* Type * Dropdown */}
              <div className="sm:col-span-4">
                <label className="text-muted-foreground mb-1 block font-semibold">{t('type', 'Type *')}</label>
                <select
                  value={searchAccountsType}
                  onChange={(e) => setSearchAccountsType(e.target.value)}
                  className="w-full bg-card border border-input rounded-lg p-1.5 text-foreground text-xs shadow-2xs"
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

              {/* Search... text field */}
              <div className="sm:col-span-6">
                <label className="text-muted-foreground mb-1 block font-semibold">{t('search', 'Search...')}</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchAccountsQuery}
                    onChange={(e) => setSearchAccountsQuery(e.target.value)}
                    placeholder={t('search_account_number_or_title', 'Search account number or title...')}
                    className="w-full bg-card border border-input rounded-lg pl-8 pr-2.5 py-1.5 text-foreground text-xs shadow-2xs"
                  />
                </div>
              </div>

              {/* + New button opening Add Account modal */}
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ New</span>
                </button>
              </div>
            </div>

            {/* Grid Columns: Account Number | Account Name | Balance $ | Balance LBP */}
            <div className="overflow-y-auto max-h-72 rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-foreground font-semibold border-b border-border sticky top-0">
                  <tr>
                    <th className="p-2.5">{t('account_number', 'Account Number')}</th>
                    <th className="p-2.5 min-w-[200px]">{t('account_name', 'Account Name')}</th>
                    <th className="p-2.5 text-right">{t('balance', 'Balance $')}</th>
                    <th className="p-2.5 text-right">{t('balance_lbp', 'Balance LBP')}</th>
                    <th className="p-2.5 text-center">{t('type', 'Type')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSearchAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">
                        {t('no_accounts_matching_criteria', 'No accounts matching criteria.')}
                      </td>
                    </tr>
                  ) : (
                    filteredSearchAccounts.map((acc) => (
                      <tr
                        key={acc.id}
                        className="hover:bg-muted/40 transition-colors cursor-pointer"
                        onClick={() => {
                          if (onOpenStatement) onOpenStatement(acc);
                        }}
                      >
                        <td className="p-2.5 font-mono font-bold text-foreground">#{acc.account_number}</td>
                        <td className="p-2.5 font-medium text-foreground">{acc.account_name}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                          ${acc.balance_first_cur.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-right font-mono text-muted-foreground">
                          {acc.balance_sec_cur.toLocaleString()} LBP
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted border border-border text-foreground">
                            {acc.account_sub_type || acc.account_type}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowSearchAccountsModal(false)}
                className="bg-card hover:bg-muted text-foreground border border-border px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {t('close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: ADD ACCOUNT MODAL (OPENS STACKED ABOVE SEARCH ACCOUNTS) */}
      {showAddAccountModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                <span>{t('add_account', 'Add Account')}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddAccountModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Account Name* */}
              <div>
                <label className="text-foreground mb-1 block font-semibold">{t('account_name', 'Account Name*')}</label>
                <input
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="e.g. Al-Arz Trading Co. (Domestic Customer)"
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground text-xs shadow-2xs focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-foreground mb-1 block font-semibold">{t('description', 'Description')}</label>
                <input
                  type="text"
                  value={newAccountDesc}
                  onChange={(e) => setNewAccountDesc(e.target.value)}
                  placeholder={t('auxiliary_notes_or_details', 'Auxiliary notes or details...')}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground text-xs shadow-2xs focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Type * */}
              <div>
                <label className="text-foreground mb-1 block font-semibold">{t('type', 'Type *')}</label>
                <select
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value)}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground text-xs shadow-2xs focus:ring-1 focus:ring-primary"
                >
                  <option value="Customer">{t('customer', 'Customer')}</option>
                  <option value="Bank">{t('bank', 'Bank')}</option>
                  <option value="Cash">{t('cash', 'Cash')}</option>
                  <option value="Employee">{t('employee', 'Employee')}</option>
                  <option value="Expense">{t('expense', 'Expense')}</option>
                  <option value="Others">{t('others', 'Others')}</option>
                  <option value="Supplier">{t('supplier', 'Supplier')}</option>
                </select>
              </div>

              {/* Account Header * (Searchable select) + `+` button to add Sub Class 4 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-foreground font-semibold">Account Header * (Sub Class 4)</label>
                  <button
                    type="button"
                    onClick={() => setShowAddSubClass4Modal(true)}
                    className="text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t('add_sub_class_4', 'Add Sub Class 4')}</span>
                  </button>
                </div>
                <select
                  value={newAccountHeader}
                  onChange={(e) => {
                    setNewAccountHeader(e.target.value);
                    const match = e.target.value.match(/\((\d+)\)/);
                    if (match && match[1]) {
                      setNewAccountNumber(`${match[1]}01`);
                    }
                  }}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground text-xs shadow-2xs focus:ring-1 focus:ring-primary font-mono"
                >
                  {subClasses4List.map((sc4) => (
                    <option key={`${sc4.account_number}-${sc4.account_name}`} value={`${sc4.account_name} (${sc4.account_number})`}>
                      {sc4.account_name} ({sc4.account_number})
                    </option>
                  ))}
                </select>
              </div>

              {/* Class (Read-only badge) & Account Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-foreground mb-1 block font-semibold">{t('class', 'Class')}</label>
                  <input
                    type="text"
                    readOnly
                    value="Class 4 - Accounts Payable & Receivable"
                    className="w-full bg-muted border border-input rounded-lg p-2 text-muted-foreground text-xs font-semibold cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-foreground mb-1 block font-semibold">{t('account_number', 'Account Number')}</label>
                  <input
                    type="text"
                    value={newAccountNumber}
                    onChange={(e) => setNewAccountNumber(e.target.value)}
                    className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono text-xs shadow-2xs focus:ring-1 focus:ring-primary font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAddAccountModal(false)}
                className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveNewAccount}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                {t('save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: ADD ACCOUNT SUB CLASSES 4 MODAL (OPENS DIRECTLY ABOVE ADD ACCOUNT) */}
      {showAddSubClass4Modal && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>{t('add_account_sub_classes_4', 'Add Account Sub Classes 4')}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddSubClass4Modal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Account Name * */}
              <div>
                <label className="text-foreground mb-1 block font-semibold">{t('account_name', 'Account Name *')}</label>
                <input
                  type="text"
                  value={newSub4Name}
                  onChange={(e) => setNewSub4Name(e.target.value)}
                  placeholder={t('eg_export_receivables_europe', 'e.g. Export Receivables Europe')}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground text-xs shadow-2xs"
                />
              </div>

              {/* Account Header Number * */}
              <div>
                <label className="text-foreground mb-1 block font-semibold">{t('account_header_number', 'Account Header Number *')}</label>
                <input
                  type="text"
                  value={newSub4HeaderNumber}
                  onChange={(e) => setNewSub4HeaderNumber(e.target.value)}
                  placeholder={t('eg_41112', 'e.g. 41112')}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono text-xs shadow-2xs font-bold"
                />
              </div>

              {/* Account Sub Class 3 * (Searchable select) + `+` button to add Sub Class 3 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-foreground font-semibold">{t('account_sub_class_3', 'Account Sub Class 3 *')}</label>
                  <button
                    type="button"
                    onClick={() => setShowAddSubClass3Modal(true)}
                    className="text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t('add_sub_class_3', 'Add Sub Class 3')}</span>
                  </button>
                </div>
                <select
                  value={newSub4Sub3Ref}
                  onChange={(e) => setNewSub4Sub3Ref(e.target.value)}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground text-xs shadow-2xs font-mono"
                >
                  {subClasses3List.map((sc3) => (
                    <option key={`${sc3.account_number}-${sc3.account_name}`} value={`${sc3.account_name}, (${sc3.account_number})`}>
                      {sc3.account_name}, ({sc3.account_number})
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Class Type * */}
              <div>
                <label className="text-foreground mb-1 block font-semibold">{t('account_class_type', 'Account Class Type *')}</label>
                <select
                  value={newSub4ClassType}
                  onChange={(e) => setNewSub4ClassType(e.target.value)}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground text-xs shadow-2xs"
                >
                  <option value="-Select One-">-Select One-</option>
                  <option value="Assets">{t('assets', 'Assets')}</option>
                  <option value="Expense">{t('expense', 'Expense')}</option>
                  <option value="Liabilities">{t('liabilities', 'Liabilities')}</option>
                  <option value="Equity">{t('equity', 'Equity')}</option>
                  <option value="Revenue">{t('revenue', 'Revenue')}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAddSubClass4Modal(false)}
                className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveSubClass4}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                {t('save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: ADD ACCOUNT SUB CLASSES 3 MODAL (OPENS DIRECTLY ABOVE SUB CLASSES 4) */}
      {showAddSubClass3Modal && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>{t('add_account_sub_classes_3', 'Add Account Sub Classes 3')}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddSubClass3Modal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Account Name * */}
              <div>
                <label className="text-foreground mb-1 block font-semibold">{t('account_name', 'Account Name *')}</label>
                <input
                  type="text"
                  value={newSub3Name}
                  onChange={(e) => setNewSub3Name(e.target.value)}
                  placeholder={t('eg_export_sales_receivables', 'e.g. Export Sales Receivables')}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground text-xs shadow-2xs"
                />
              </div>

              {/* Account Header Number * */}
              <div>
                <label className="text-foreground mb-1 block font-semibold">{t('account_header_number', 'Account Header Number *')}</label>
                <input
                  type="text"
                  value={newSub3HeaderNumber}
                  onChange={(e) => setNewSub3HeaderNumber(e.target.value)}
                  placeholder={t('eg_412', 'e.g. 412')}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono text-xs shadow-2xs font-bold"
                />
              </div>

              {/* Account Sub Class 2 * (Dropdown) */}
              <div>
                <label className="text-foreground mb-1 block font-semibold">{t('account_sub_class_2', 'Account Sub Class 2 *')}</label>
                <select
                  value={newSub3Sub2Ref}
                  onChange={(e) => setNewSub3Sub2Ref(e.target.value)}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground text-xs shadow-2xs"
                >
                  <option value="41 - Customers & Accounts Receivable">41 - Customers &amp; Accounts Receivable</option>
                  <option value="40 - Suppliers & Accounts Payable">40 - Suppliers &amp; Accounts Payable</option>
                  <option value="51 - Financial Institutions & Banks">51 - Financial Institutions &amp; Banks</option>
                  <option value="53 - Cash & Vault Accounts">53 - Cash &amp; Vault Accounts</option>
                  <option value="61 - External Services & Rents">61 - External Services &amp; Rents</option>
                  <option value="70 - Sales of Manufactured Goods">70 - Sales of Manufactured Goods</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAddSubClass3Modal(false)}
                className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveSubClass3}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                {t('save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORTING DOCUMENT URL MODAL */}
      {showSupportingDocModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-emerald-700" />
                <span>{t('supporting_document', 'Supporting Document')}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowSupportingDocModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-foreground">
              Enter the link to your supporting document (invoice, receipt, bank statement, or cloud file):
            </p>

            <input
              type="url"
              value={supportingDocUrl}
              onChange={(e) => setSupportingDocUrl(e.target.value)}
              placeholder="https://docs.vanguard.erp/invoices/2026-9912.pdf"
              className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono text-xs shadow-2xs focus:ring-1 focus:ring-primary"
            />

            <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowSupportingDocModal(false)}
                className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSupportingDocModal(false);
                  onShowToast('Supporting document link attached.');
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                {t('save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL RATE MODAL */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <span>{t('exchange_rates', 'Exchange Rates')}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowRateModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-amber-700 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 font-medium">
              {t('currency_rates_are_not_available', 'Currency rates are not available automatically. Enter manual exchange parity rates for conversion:')}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-foreground mb-1 block font-semibold">{t('usd_base_parity', 'USD Base Parity')}</label>
                <input
                  type="text"
                  readOnly
                  value="1.00 USD"
                  className="w-full bg-muted border border-input rounded-lg p-2 text-foreground font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-foreground mb-1 block font-semibold">{t('lbp_usd_rate', 'LBP / USD Rate')}</label>
                <input
                  type="number"
                  value={customRateLbp}
                  onChange={(e) => setCustomRateLbp(e.target.value)}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono text-xs shadow-2xs font-bold"
                />
              </div>

              <div>
                <label className="text-foreground mb-1 block font-semibold">{t('eur_usd_rate', 'EUR / USD Rate')}</label>
                <input
                  type="number"
                  step="0.001"
                  value={customRateEur}
                  onChange={(e) => setCustomRateEur(e.target.value)}
                  className="w-full bg-card border border-input rounded-lg p-2 text-foreground font-mono text-xs shadow-2xs font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowRateModal(false)}
                className="bg-card hover:bg-muted text-foreground border border-border px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRateModal(false);
                  onShowToast(`Applied custom rates: LBP @ ${Number(customRateLbp).toLocaleString()}, EUR @ ${customRateEur}`);
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                {t('apply', 'Apply')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW JV AUDIT REVIEW MODAL */}
      {viewingJv && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Voucher Audit Review: {viewingJv.jv_number}</span>
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Voucher Date: {formatDateDisplay(viewingJv.date_of_jv)} | Ref: {viewingJv.doc_ref_number || 'N/A'} | Status:{' '}
                  {viewingJv.is_posted ? 'Posted' : 'Draft'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingJv(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-foreground bg-muted p-2.5 rounded-lg border border-border">
              <strong>{t('description', 'Description:')}</strong> {viewingJv.description}
            </p>

            <div className="overflow-y-auto max-h-60 rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted border-b border-border font-semibold text-foreground">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">{t('account', 'Account')}</th>
                    <th className="p-2 text-right">Debit ($)</th>
                    <th className="p-2 text-right">Credit ($)</th>
                    <th className="p-2">{t('line_memo', 'Line Memo')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {viewingJv.lines.map((l, i) => (
                    <tr key={l.id} className="hover:bg-muted/40">
                      <td className="p-2 font-mono text-muted-foreground">{i + 1}</td>
                      <td className="p-2 font-mono font-medium">
                        #{l.account_number} - {l.account_name}
                      </td>
                      <td className="p-2 font-mono font-bold text-emerald-700 text-right">
                        {l.amount_debit > 0 ? `$${l.amount_debit.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-2 font-mono font-bold text-destructive text-right">
                        {l.amount_credit > 0 ? `$${l.amount_credit.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-2 text-muted-foreground">{l.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="text-xs font-semibold">
                Total Debit:{' '}
                <span className="font-mono text-emerald-700 font-bold">
                  ${viewingJv.total_debit.toFixed(2)}
                </span>{' '}
                | Total Credit:{' '}
                <span className="font-mono text-destructive font-bold">
                  ${viewingJv.total_credit.toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingJv(null)}
                className="bg-card hover:bg-muted text-foreground border border-border px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {t('close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
