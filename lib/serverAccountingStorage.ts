// ==============================================================================
// Vanguard ERP: Server-Side Persistent Accounting Database Engine
// Provides ACID transactional persistence, atomic GL posting, balance updates,
// and synchronized storage across reloads and server restarts.
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabaseClient';
import {
  AccountDetail,
  JournalVoucher,
  JVLine,
  INITIAL_ACCOUNT_DETAILS,
  INITIAL_JOURNAL_VOUCHERS,
  normalizeAccount,
  LBP_RATE
} from '@/lib/accountingData';

import {
  calculateAccountBalanceMutation,
  validateVoucherBalance,
  buildPaymentVoucherLines,
  buildReceiptVoucherLines,
  buildContraVoucherLines,
  PaymentVoucherMutationInput,
  ReceiptVoucherMutationInput,
  ContraVoucherMutationInput,
  VoucherType
} from './voucherMutationEngine';

export interface PersistedExpenseRecord {
  id: string;
  tenant_id: string;
  payee: string;
  reference: string;
  date: string;
  ev: string;
  dateOfEv: string;
  amount: number;
  totalDisbursed: number;
  paymentDifference: number;
  description: string;
  enteredBy: string;
  department: string;
  posted: boolean;
  status: 'DRAFT' | 'UNCLOSED_PENDING_SETTLEMENT' | 'FULLY_CLOSED_RECONCILED';
  purchaseAccountId: string;
  purchaseDept: string;
  purchaseRef: string;
  supportingDocUrl?: string;
  expenseRows: any[];
  paymentRows: any[];
  created_at: string;
  updated_at: string;
  posted_at?: string;
}

export interface GlLedgerEntry {
  id: string;
  tenant_id: string;
  voucher_id: string;
  voucher_type: string;
  voucher_number: string;
  entry_date: string;
  account_id: string;
  account_number: string;
  account_name: string;
  debit: number;
  credit: number;
  balance_after: number;
  narration: string;
  created_at: string;
}

export interface PersistedInboxMessage {
  id: string;
  tenant_id: string;
  category: 'APPROVAL' | 'ALERT' | 'REPORT' | 'MEMO';
  subject: string;
  sender: string;
  branch: string;
  time: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVIEWED';
  isRead: boolean;
  priority: 'HIGH' | 'NORMAL';
  content: string;
  details?: {
    refCode?: string;
    amount?: string;
    items?: string;
    reason?: string;
    voucherId?: string;
    expenseId?: string;
  };
  linked_voucher_id?: string;
  linked_expense_id?: string;
  action_performed_by?: string;
  action_performed_at?: string;
  action_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PersistedSystemActivity {
  id: string;
  tenant_id: string;
  company_id: number | null;
  action_type: string;
  description: string;
  performed_by: string;
  metadata?: any;
  created_at: string;
}

export interface DynamicSystemAlert {
  id: string;
  type: 'APPROVAL_REQUIRED' | 'UNCLOSED_CASE' | 'POSTING_SUCCESS' | 'SECURITY_ALERT';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
  is_read: boolean;
  status: 'PENDING' | 'RESOLVED' | 'ARCHIVED';
  resolved_at?: string;
  resolved_by?: string;
  resolution_reason?: string;
  actionLink?: string;
  actionLabel?: string;
  source_ref?: string;
  source_type?: 'EXPENSE' | 'VOUCHER' | 'INBOX' | 'AUDIT';
}

interface PersistentDatabaseState {
  accounts: AccountDetail[];
  vouchers: JournalVoucher[];
  expenses: PersistedExpenseRecord[];
  gl_entries: GlLedgerEntry[];
  inbox_items: PersistedInboxMessage[];
  system_activities: PersistedSystemActivity[];
  dismissed_alert_ids?: string[];
  system_alerts?: DynamicSystemAlert[];
  last_updated: string;
}

// Persistent Storage File Path (Guaranteed on-disk persistence across all reloads & restarts)
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'vanguard_accounting_db.json');

// High-Performance In-Memory Cache & Non-Blocking SWR Revalidation Engine
let inMemoryDbState: PersistentDatabaseState | null = null;
let lastDbFileMtime = 0;
let lastVoucherReconcileTime = 0;
let lastExpenseReconcileTime = 0;
let activeVoucherReconcilePromise: Promise<void> | null = null;
let activeExpenseReconcilePromise: Promise<void> | null = null;
const RECONCILE_INTERVAL_MS = 60 * 1000; // 60-second SWR cache window

function ensureDbFileExists(): PersistentDatabaseState {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialState: PersistentDatabaseState = {
        accounts: INITIAL_ACCOUNT_DETAILS.map(normalizeAccount),
        vouchers: INITIAL_JOURNAL_VOUCHERS,
        expenses: [],
        gl_entries: [],
        inbox_items: [],
        system_activities: [],
        dismissed_alert_ids: [],
        system_alerts: [],
        last_updated: new Date().toISOString()
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialState, null, 2), 'utf-8');
      inMemoryDbState = initialState;
      try {
        lastDbFileMtime = fs.statSync(DB_FILE).mtimeMs;
      } catch {
        lastDbFileMtime = Date.now();
      }
      return initialState;
    }

    // Fast-path: Return cached in-memory state if file modification timestamp is unchanged (0ms read latency)
    if (inMemoryDbState) {
      try {
        const currentMtime = fs.statSync(DB_FILE).mtimeMs;
        if (currentMtime <= lastDbFileMtime) {
          return inMemoryDbState;
        }
      } catch {
        return inMemoryDbState;
      }
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed: PersistentDatabaseState = JSON.parse(raw);
    try {
      lastDbFileMtime = fs.statSync(DB_FILE).mtimeMs;
    } catch {
      lastDbFileMtime = Date.now();
    }

    // Fallback if data array is missing
    if (!parsed.accounts || parsed.accounts.length === 0) {
      parsed.accounts = INITIAL_ACCOUNT_DETAILS.map(normalizeAccount);
    } else {
      // Guarantee all standard Lebanese PCG accounts permanently exist globally
      for (const stdAcc of INITIAL_ACCOUNT_DETAILS) {
        const exists = parsed.accounts.some(
          (a) => a.account_number === stdAcc.account_number || a.id === stdAcc.id
        );
        if (!exists) {
          parsed.accounts.push(normalizeAccount(stdAcc));
        }
      }
    }
    if (!parsed.vouchers) {
      parsed.vouchers = INITIAL_JOURNAL_VOUCHERS;
    }
    if (!parsed.expenses) {
      parsed.expenses = [];
    }
    if (!parsed.gl_entries) {
      parsed.gl_entries = [];
    }
    if (!parsed.inbox_items) {
      parsed.inbox_items = [];
    }
    if (!parsed.system_activities) {
      parsed.system_activities = [];
    }
    if (!parsed.dismissed_alert_ids) {
      parsed.dismissed_alert_ids = [];
    }
    if (!parsed.system_alerts) {
      parsed.system_alerts = [];
    }
    if (!parsed.expenses) {
      parsed.expenses = [];
    }
    if (!parsed.gl_entries) {
      parsed.gl_entries = [];
    }
    if (!parsed.inbox_items || !Array.isArray(parsed.inbox_items)) {
      parsed.inbox_items = [];
    }
    if (!parsed.system_activities || !Array.isArray(parsed.system_activities)) {
      parsed.system_activities = [];
    }

    // Seed realistic PV records if none exist in the database yet
    const hasPv = parsed.vouchers.some(
      (v) => v.jv_type === 'PV' || v.jv_type === 'PAYMENT' || v.jv_number.startsWith('PV-')
    );
    if (!hasPv) {
      parsed.vouchers.push(
        {
          id: 'pv-seed-01',
          tenant_id: '00000000-0000-0000-0000-000000000001',
          jv_number: 'PV-2026-0412',
          date_of_jv: '2026-09-12',
          jv_type: 'PV',
          currency_id: 'USD',
          description: 'Cheque payment for Sur harvest crop invoice #882',
          department: 'Mill Operations',
          sub_department: 'Procurement',
          payee_or_recipient: 'South Olive Farmers Cooperative',
          created_by: 'Super Admin',
          total_debit: 14500,
          total_credit: 14500,
          is_posted: true,
          posted_at: '2026-09-12T10:00:00.000Z',
          posted_by: 'Super Admin',
          lines: [
            {
              id: 'pvl-seed-1',
              line_number: 1,
              account_id: 'acc-40110',
              account_number: '40110',
              account_name: 'Suppliers (Raw Harvest Procurement)',
              description: 'Cheque payment for Sur harvest crop invoice #882',
              amount_debit: 14500,
              amount_credit: 0,
              currency_rate: 1,
              amount_native: 14500
            },
            {
              id: 'pvl-seed-2',
              line_number: 2,
              account_id: 'acc-5121',
              account_number: '5121',
              account_name: 'Bank Bob Lbp (Bank of Beirut Commercial)',
              description: 'Disbursement from Bank Bob Commercial - Cheque #882',
              amount_debit: 0,
              amount_credit: 14500,
              currency_rate: 1,
              amount_native: 14500
            }
          ]
        },
        {
          id: 'pv-seed-02',
          tenant_id: '00000000-0000-0000-0000-000000000001',
          jv_number: 'PV-2026-0413',
          date_of_jv: '2026-09-08',
          jv_type: 'PV',
          currency_id: 'USD',
          description: 'Wire settlement for 15,000 glass olive oil bottles',
          department: 'Packaging & Bottling',
          sub_department: 'Production',
          payee_or_recipient: 'Mediterranean Glass & Bottles Factory',
          created_by: 'Finance Controller',
          total_debit: 7200,
          total_credit: 7200,
          is_posted: true,
          posted_at: '2026-09-08T14:30:00.000Z',
          posted_by: 'Finance Controller',
          lines: [
            {
              id: 'pvl-seed-3',
              line_number: 1,
              account_id: 'acc-40110',
              account_number: '40110',
              account_name: 'Suppliers (Raw Harvest Procurement)',
              description: 'Wire settlement for 15,000 glass olive oil bottles',
              amount_debit: 7200,
              amount_credit: 0,
              currency_rate: 1,
              amount_native: 7200
            },
            {
              id: 'pvl-seed-4',
              line_number: 2,
              account_id: 'acc-53000',
              account_number: '53000',
              account_name: 'Cash (Main Physical Vault)',
              description: 'Disbursement from Cash Vault',
              amount_debit: 0,
              amount_credit: 7200,
              currency_rate: 1,
              amount_native: 7200
            }
          ]
        }
      );
    }

    // Seed realistic RV records if none exist in the database yet
    const hasRv = parsed.vouchers.some(
      (v) => v.jv_type === 'RV' || v.jv_type === 'RECEIPT' || v.jv_number.startsWith('RV-')
    );
    if (!hasRv) {
      parsed.vouchers.push({
        id: 'rv-seed-01',
        tenant_id: '00000000-0000-0000-0000-000000000001',
        jv_number: 'RV-2026-0914',
        date_of_jv: '2026-09-15',
        jv_type: 'RV',
        currency_id: 'USD',
        description: 'Wholesale delivery batch settlement',
        department: 'Commercial Sales & Retail',
        sub_department: 'Collections',
        payee_or_recipient: 'Al-Baraka Supermarkets Group',
        created_by: 'Super Admin',
        total_debit: 12400,
        total_credit: 12400,
        is_posted: true,
        posted_at: '2026-09-15T11:20:00.000Z',
        posted_by: 'Super Admin',
        lines: [
          {
            id: 'rvl-seed-1',
            line_number: 1,
            account_id: 'acc-5121',
            account_number: '5121',
            account_name: 'Bank Bob Lbp (Bank of Beirut Commercial)',
            description: 'Collection deposit from Al-Baraka Supermarkets Group',
            amount_debit: 12400,
            amount_credit: 0,
            currency_rate: 1,
            amount_native: 12400
          },
          {
            id: 'rvl-seed-2',
            line_number: 2,
            account_id: 'acc-41110',
            account_number: '41110',
            account_name: 'Clients (Domestic Wholesalers & Supermarkets)',
            description: 'Customer settlement - Cheque #4492',
            amount_debit: 0,
            amount_credit: 12400,
            currency_rate: 1,
            amount_native: 12400
          }
        ]
      });
    }

    // Seed realistic pending approval voucher (high value exceeding limit) if not exists
    const hasPendingPv = parsed.vouchers.some((v) => v.id === 'pv-pending-01');
    if (!hasPendingPv) {
      parsed.vouchers.push({
        id: 'pv-pending-01',
        tenant_id: '00000000-0000-0000-0000-000000000001',
        jv_number: 'PV-2026-9042',
        date_of_jv: '2026-09-20',
        jv_type: 'PV',
        currency_id: 'USD',
        description: 'Bulk Olive Harvest Acquisition & Pressing Advance (Awaiting Dual Signoff)',
        department: 'Mill Operations',
        sub_department: 'Procurement',
        payee_or_recipient: 'South Olive Farmers Cooperative',
        created_by: 'Sami Mansour (Financial Controller)',
        total_debit: 18500,
        total_credit: 18500,
        is_posted: false,
        lines: [
          {
            id: 'pvl-pending-1',
            line_number: 1,
            account_id: 'acc-40110',
            account_number: '40110',
            account_name: 'Suppliers (Raw Harvest Procurement)',
            description: 'Bulk Olive Harvest Acquisition & Pressing Advance',
            amount_debit: 18500,
            amount_credit: 0,
            currency_rate: 1,
            amount_native: 18500
          },
          {
            id: 'pvl-pending-2',
            line_number: 2,
            account_id: 'acc-5121',
            account_number: '5121',
            account_name: 'Bank Bob Lbp (Bank of Beirut Commercial)',
            description: 'Pending bank wire release upon manager approval',
            amount_debit: 0,
            amount_credit: 18500,
            currency_rate: 1,
            amount_native: 18500
          }
        ]
      });
    }

    // Seed realistic unclosed expense awaiting reconciliation if not exists
    const hasPendingEv = parsed.expenses.some((e) => e.id === 'ev-pending-01');
    if (!hasPendingEv) {
      parsed.expenses.push({
        id: 'ev-pending-01',
        tenant_id: '00000000-0000-0000-0000-000000000001',
        payee: 'Lebanon Industrial Energy & Cold Stores S.A.L',
        reference: 'INV-EGY-9821',
        date: '2026-09-18',
        ev: 'EV-2026-8979',
        dateOfEv: '2026-09-18',
        amount: 4250,
        totalDisbursed: 3900,
        paymentDifference: 350,
        description: 'Cold storage unit compressor overhaul and peak-demand energy surcharge',
        enteredBy: 'Hassan Bazzi (Operations Supervisor)',
        department: 'Plant Operations & Cold Storage',
        posted: false,
        status: 'UNCLOSED_PENDING_SETTLEMENT',
        purchaseAccountId: 'acc-62620',
        purchaseDept: 'Mill Machinery & Facilities',
        purchaseRef: 'REF-CS-441',
        expenseRows: [
          { account_id: 'acc-62620', account_number: '62620', description: 'Compressor maintenance', amount: 4250 }
        ],
        paymentRows: [
          { account_id: 'acc-5121', account_number: '5121', description: 'Advance wire payment', amount: 3900 }
        ],
        created_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
        updated_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString()
      });
    }

    // Seed realistic Operational Inbox Messages if empty
    if (parsed.inbox_items.length === 0) {
      parsed.inbox_items = [
        {
          id: 'MSG-2026-101',
          tenant_id: '00000000-0000-0000-0000-000000000001',
          category: 'APPROVAL',
          subject: 'Authorization Required: High-Value Payment Voucher PV-2026-9042 ($18,500.00)',
          sender: 'Sami Mansour (Financial Controller)',
          branch: 'Choueifat Main Facility',
          time: '10:45 AM',
          date: 'Today',
          status: 'PENDING',
          isRead: false,
          priority: 'HIGH',
          content: 'Payment Voucher PV-2026-9042 for $18,500.00 exceeds the standard single-signoff threshold ($10,000.00). Awaiting General Manager dual-authorization before release to Bank of Beirut wire dispatch.',
          details: {
            refCode: 'PV-2026-9042',
            amount: '$18,500.00',
            items: 'Bulk Olive Harvest Acquisition & Pressing Advance',
            voucherId: 'pv-pending-01'
          },
          linked_voucher_id: 'pv-pending-01',
          created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
        },
        {
          id: 'MSG-2026-102',
          tenant_id: '00000000-0000-0000-0000-000000000001',
          category: 'APPROVAL',
          subject: 'Unclosed Expense Reconciliation: EV-2026-8979 ($4,250.00)',
          sender: 'Hassan Bazzi (Operations Supervisor)',
          branch: 'Beirut Distribution Hub',
          time: '09:15 AM',
          date: 'Today',
          status: 'PENDING',
          isRead: false,
          priority: 'HIGH',
          content: 'Expense settlement voucher EV-2026-8979 recorded an unclosed payment difference ($350.00) between invoice sum and disbursed check. Requires manager signoff to reconcile.',
          details: {
            refCode: 'EV-2026-8979',
            amount: '$4,250.00',
            items: 'Cold Storage Maintenance & Energy Surcharge',
            reason: 'Unclosed payment variance: $350.00',
            expenseId: 'ev-pending-01'
          },
          linked_expense_id: 'ev-pending-01',
          created_at: new Date(Date.now() - 1000 * 60 * 135).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 135).toISOString()
        },
        {
          id: 'MSG-2026-103',
          tenant_id: '00000000-0000-0000-0000-000000000001',
          category: 'ALERT',
          subject: 'Void Alert: High-Value Void on Invoice #103225 (9,000,000 LBP)',
          sender: 'Vanguard POS Security Guard',
          branch: 'Choueifat POS Terminal 1',
          time: '11:15 AM',
          date: 'Today',
          status: 'PENDING',
          isRead: false,
          priority: 'HIGH',
          content: 'Cashier Hiba Aloulou performed a void operation on 1x 17.5L Extra Virgin Olive Oil Tin ($100.00 / 9,000,000.00 LBP). Reason provided: Incorrect Count (Wrong Count). Please inspect.',
          details: {
            refCode: 'INV-103225',
            amount: '9,000,000.00 LBP',
            reason: 'Incorrect Count (Wrong Count)'
          },
          created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
        },
        {
          id: 'MSG-2026-104',
          tenant_id: '00000000-0000-0000-0000-000000000001',
          category: 'REPORT',
          subject: 'Scheduled EOD Closing Package: All Operating Branches (19-Sep-2026)',
          sender: 'Vanguard Automated Report Engine',
          branch: 'All Branches',
          time: '11:59 PM',
          date: '19 Sep 2026',
          status: 'REVIEWED',
          isRead: true,
          priority: 'NORMAL',
          content: 'Automated End-Of-Day Z-Report successfully closed for all operating branches. Total Gross Sales: $6,840.00. Total Voids: 1 event (9,000,000 LBP). Active customers serviced: 184.',
          details: {
            refCode: 'EOD-20260919',
            amount: '$6,840.00',
            items: 'End of Day Operations Report'
          },
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
        },
        {
          id: 'MSG-2026-105',
          tenant_id: '00000000-0000-0000-0000-000000000001',
          category: 'MEMO',
          subject: 'Inter-Branch Stock Transfer: 120x Extra Virgin 5L Metal Tins',
          sender: 'Hussein Mahdi (Logistics Coordinator)',
          branch: 'Choueifat to Beirut',
          time: '03:10 PM',
          date: '19 Sep 2026',
          status: 'REVIEWED',
          isRead: true,
          priority: 'NORMAL',
          content: 'Dispatched 120 tins of Grade-A Extra Virgin Olive Oil 5L from Choueifat Warehouse Tank Room to Beirut Hamra Distribution Center via SuperSonic Van #04.',
          details: {
            refCode: 'TRF-0922',
            items: '120x Extra Virgin Olive Oil 5L'
          },
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
        }
      ];
    }

    // Seed realistic initial activities if empty
    if (parsed.system_activities.length === 0) {
      parsed.system_activities = [
        {
          id: 'act-seed-01',
          tenant_id: '00000000-0000-0000-0000-000000000001',
          company_id: 1300,
          action_type: 'VOUCHER_POSTED',
          description: 'Payment Voucher PV-2026-8572 ($875.00) posted to General Ledger (Bank Bob Lbp)',
          performed_by: 'Super Admin',
          created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString()
        },
        {
          id: 'act-seed-02',
          tenant_id: '00000000-0000-0000-0000-000000000001',
          company_id: 1300,
          action_type: 'VOUCHER_POSTED',
          description: 'Receipt Voucher RV-2026-1734 ($1,420.00) posted to General Ledger (Cash Vault)',
          performed_by: 'Super Admin',
          created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString()
        },
        {
          id: 'act-seed-03',
          tenant_id: '00000000-0000-0000-0000-000000000001',
          company_id: 1300,
          action_type: 'EXPENSE_RECORDED',
          description: 'Expense Voucher EV-2026-8979 ($4,250.00) submitted with unclosed variance ($350.00)',
          performed_by: 'Hassan Bazzi (Operations Supervisor)',
          created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
        },
        {
          id: 'act-seed-04',
          tenant_id: '00000000-0000-0000-0000-000000000001',
          company_id: 1300,
          action_type: 'SECURITY_ALERT',
          description: 'High-Value Void Alert registered on POS Terminal 1 (Invoice #103225 - 9,000,000 LBP)',
          performed_by: 'Vanguard POS Security Guard',
          created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString()
        },
        {
          id: 'act-seed-05',
          tenant_id: '00000000-0000-0000-0000-000000000001',
          company_id: 1300,
          action_type: 'RECONCILIATION_COMPLETED',
          description: 'End-Of-Day reconciliation finalized for all operating branches (Gross Sales: $6,840.00)',
          performed_by: 'Vanguard Automated Report Engine',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString()
        }
      ];
    }

    inMemoryDbState = parsed;
    return parsed;
  } catch (err) {
    console.error('[serverAccountingStorage] Error initializing DB file:', err);
    const fallback = {
      accounts: INITIAL_ACCOUNT_DETAILS.map(normalizeAccount),
      vouchers: INITIAL_JOURNAL_VOUCHERS,
      expenses: [],
      gl_entries: [],
      inbox_items: [],
      system_activities: [],
      last_updated: new Date().toISOString()
    };
    inMemoryDbState = fallback;
    return fallback;
  }
}

function writeDbState(state: PersistentDatabaseState): void {
  try {
    state.last_updated = new Date().toISOString();
    inMemoryDbState = state;
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    try {
      lastDbFileMtime = fs.statSync(DB_FILE).mtimeMs;
    } catch {
      lastDbFileMtime = Date.now();
    }
  } catch (err) {
    console.error('[serverAccountingStorage] Error writing DB state to disk:', err);
  }
}

export class ServerAccountingStorage {
  // =========================================================================
  // 1. ACCOUNTS REPOSITORY
  // =========================================================================
  public static async getAccounts(filterType?: string): Promise<AccountDetail[]> {
    const state = ensureDbFileExists();
    let accounts = state.accounts;

    if (filterType && filterType !== 'All Accounts') {
      const lower = filterType.toLowerCase();
      accounts = accounts.filter(
        (a) =>
          a.type?.toLowerCase() === lower ||
          a.account_type.toLowerCase() === lower ||
          a.account_sub_type?.toLowerCase() === lower
      );
    }

    return accounts;
  }

  public static async saveAccount(
    input: Partial<AccountDetail> & { account_number: string; account_name: string },
    options?: { awaitRemoteSync?: boolean }
  ): Promise<AccountDetail> {
    const state = ensureDbFileExists();

    const existingIndex = state.accounts.findIndex(
      (a) => a.account_number.trim() === input.account_number.trim()
    );

    const nowIso = new Date().toISOString();

    let savedAccount: AccountDetail;

    if (existingIndex >= 0) {
      savedAccount = {
        ...state.accounts[existingIndex],
        ...input,
        account_number: input.account_number.trim(),
        account_name: input.account_name.trim()
      };
      state.accounts[existingIndex] = normalizeAccount(savedAccount);
    } else {
      const newId = input.id || `acc-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      savedAccount = normalizeAccount({
        id: newId,
        tenant_id: input.tenant_id || '00000000-0000-0000-0000-000000000001',
        account_number: input.account_number.trim(),
        account_name: input.account_name.trim(),
        account_name_ar: input.account_name_ar || '',
        description: input.description || '',
        class_id: input.class_id || 1,
        sub_class4_id: input.sub_class4_id || 1000,
        account_type: input.account_type || 'ASSET',
        account_sub_type: input.account_sub_type || 'OTHERS',
        type: input.type || 'Other',
        class_type: input.class_type || 'Assets',
        currency_id: input.currency_id || 'USD',
        balance_first_cur: input.balance_first_cur || 0,
        balance_sec_cur: input.balance_sec_cur || (input.balance_first_cur ? input.balance_first_cur * LBP_RATE : 0),
        checking_account: input.checking_account || false,
        is_active: input.is_active !== undefined ? input.is_active : true
      });
      state.accounts.push(savedAccount);
    }

    writeDbState(state);

    // Non-blocking optimistic dual-sync to Supabase Postgres (0ms UI latency)
    const remoteSyncPromise = (async () => {
      try {
        await supabase.from('acc_accounts').upsert({
          id: savedAccount.id,
          account_number: savedAccount.account_number,
          account_name: savedAccount.account_name,
          account_type: savedAccount.account_type || 'ASSET',
          is_active: savedAccount.is_active ?? true,
          updated_at: nowIso
        });
      } catch (e) {
        // Non-blocking background sync
      }
    })();

    if (options?.awaitRemoteSync) {
      await remoteSyncPromise;
    }

    return savedAccount;
  }

  // =========================================================================
  // 2. JOURNAL VOUCHERS REPOSITORY & MODULAR ATOMIC POSTING ENGINE
  // =========================================================================
  public static async getVouchers(filters?: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    jvType?: string;
    type?: string;
  }): Promise<JournalVoucher[]> {
    const state = ensureDbFileExists();
    let list = [...state.vouchers];

    // Local-First Read Optimization with Non-Blocking Background SWR Reconciliation
    const shouldReconcile = Date.now() - lastVoucherReconcileTime > RECONCILE_INTERVAL_MS;
    if (shouldReconcile && !activeVoucherReconcilePromise) {
      lastVoucherReconcileTime = Date.now();
      activeVoucherReconcilePromise = (async () => {
        try {
          const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
            setTimeout(() => resolve({ data: null, error: new Error('Supabase read timeout') }), 2500)
          );
          const fetchPromise = supabase
            .from('acc_journal_vouchers')
            .select('*, lines:acc_journal_voucher_lines(*)');
          const res = await Promise.race([fetchPromise, timeoutPromise]);
          const { data: sbData, error: sbErr } = res as any;

          if (!sbErr && Array.isArray(sbData) && sbData.length > 0) {
            const currentState = ensureDbFileExists();
            let stateMutated = false;
            for (const sbV of sbData) {
              const exists = currentState.vouchers.some(
                (v) => v.id === sbV.id || v.jv_number === sbV.jv_number
              );
              if (!exists) {
                currentState.vouchers.unshift({
                  id: sbV.id,
                  tenant_id: sbV.tenant_id,
                  jv_number: sbV.jv_number,
                  date_of_jv: sbV.date_of_jv,
                  jv_type: sbV.jv_type,
                  currency_id: sbV.currency_id,
                  doc_ref_number: sbV.doc_ref_number,
                  description: sbV.description,
                  internal_remark: sbV.internal_remark,
                  department: sbV.department,
                  sub_department: sbV.sub_department,
                  total_debit: Number(sbV.total_debit) || 0,
                  total_credit: Number(sbV.total_credit) || 0,
                  is_posted: Boolean(sbV.is_posted),
                  posted_at: sbV.posted_at,
                  posted_by: sbV.posted_by,
                  created_by: sbV.created_by,
                  lines: Array.isArray(sbV.lines) ? sbV.lines : []
                });
                stateMutated = true;
              }
            }
            if (stateMutated) {
              writeDbState(currentState);
            }
          }
        } catch (e) {
          // Non-blocking fallback
        } finally {
          activeVoucherReconcilePromise = null;
        }
      })();
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (v) =>
          v.jv_number.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          (v.payee_or_recipient && v.payee_or_recipient.toLowerCase().includes(q)) ||
          v.lines.some(
            (l) =>
              l.account_name.toLowerCase().includes(q) ||
              l.account_number.toLowerCase().includes(q)
          )
      );
    }

    if (filters?.status && filters.status !== 'All Transactions') {
      if (filters.status === 'Posted') {
        list = list.filter((v) => v.is_posted);
      } else if (filters.status === 'UnPosted') {
        list = list.filter((v) => !v.is_posted);
      }
    }

    const typeFilter = filters?.type || filters?.jvType;
    if (typeFilter && typeFilter !== 'All Types') {
      const tf = typeFilter.toUpperCase().trim();
      if (tf === 'PV' || tf === 'PAYMENT') {
        list = list.filter(
          (v) =>
            v.jv_type === 'PV' ||
            v.jv_type === 'PAYMENT' ||
            v.jv_number.startsWith('PV-')
        );
      } else if (tf === 'RV' || tf === 'RECEIPT') {
        list = list.filter(
          (v) =>
            v.jv_type === 'RV' ||
            v.jv_type === 'RECEIPT' ||
            v.jv_number.startsWith('RV-')
        );
      } else if (tf === 'JV' || tf === 'STANDARD' || tf === 'JOURNAL') {
        list = list.filter(
          (v) =>
            v.jv_type === 'JV' ||
            v.jv_type === 'STANDARD' ||
            v.jv_type === 'OPENING' ||
            v.jv_type === 'CLOSING' ||
            v.jv_type === 'ADJUSTING' ||
            v.jv_number.startsWith('JV-')
        );
      } else if (tf === 'CV' || tf === 'CONTRA') {
        list = list.filter(
          (v) =>
            v.jv_type === 'CV' ||
            v.jv_type === 'CONTRA' ||
            v.jv_number.startsWith('CV-')
        );
      } else if (tf === 'EV' || tf === 'EXPENSE') {
        list = list.filter(
          (v) =>
            v.jv_type === 'EV' ||
            v.jv_type === 'EXPENSE' ||
            v.jv_number.startsWith('EV-')
        );
      } else {
        list = list.filter(
          (v) => v.jv_type?.toString().toUpperCase() === tf
        );
      }
    }

    if (filters?.dateFrom) {
      list = list.filter((v) => v.date_of_jv >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      list = list.filter((v) => v.date_of_jv <= filters.dateTo!);
    }

    return list;
  }

  public static async getVouchersByType(
    type: string,
    filters?: { search?: string; status?: string; dateFrom?: string; dateTo?: string }
  ): Promise<JournalVoucher[]> {
    return this.getVouchers({ ...filters, jvType: type });
  }

  /**
   * Generic, Modular Voucher Transaction Mutator:
   * 1. Validates voucher lines and balance (debit === credit) if posting.
   * 2. Creates/updates voucher header and detail lines for ANY voucher type.
   * 3. Atomically applies ledger mutations to account balances.
   * 4. Emits immutable GL ledger entries.
   */
  public static async saveVoucherTransaction(args: {
    voucher: Partial<JournalVoucher>;
    lines: JVLine[];
    postImmediately: boolean;
    user?: string;
    awaitRemoteSync?: boolean;
  }): Promise<{
    voucher: JournalVoucher;
    updatedAccounts: AccountDetail[];
    glEntriesCreated: number;
    glEntries: GlLedgerEntry[];
  }> {
    const state = ensureDbFileExists();
    const nowIso = new Date().toISOString();
    const user = args.user || args.voucher.created_by || 'Super Admin (Finance Controller)';

    // Compute totals using modular validator
    const balanceInfo = validateVoucherBalance(args.lines);

    // Atomic Balance Check for Posting
    if (args.postImmediately && !balanceInfo.isBalanced) {
      throw new Error(
        `Cannot post unbalanced voucher! Total Debit ($${balanceInfo.totalDebit.toFixed(2)}) must equal Total Credit ($${balanceInfo.totalCredit.toFixed(2)}). Difference: $${balanceInfo.difference.toFixed(2)}`
      );
    }

    const rawType = (args.voucher.jv_type || 'JV').toString().toUpperCase();
    let prefix = 'JV';
    if (rawType === 'PV' || rawType === 'PAYMENT') prefix = 'PV';
    else if (rawType === 'RV' || rawType === 'RECEIPT') prefix = 'RV';
    else if (rawType === 'CV' || rawType === 'CONTRA') prefix = 'CV';
    else if (rawType === 'EV' || rawType === 'EXPENSE') prefix = 'EV';

    const jvId =
      args.voucher.id && !args.voucher.id.startsWith('jv-temp') && !args.voucher.id.startsWith('temp-')
        ? args.voucher.id
        : `${prefix.toLowerCase()}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const jvNumber =
      args.voucher.jv_number && !args.voucher.jv_number.startsWith('temp-')
        ? args.voucher.jv_number
        : `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Prepare lines with DB line IDs and enriched account references
    const persistedLines: JVLine[] = args.lines.map((line, idx) => {
      // Auto-lookup account info if missing or partially specified
      let accNum = line.account_number;
      let accName = line.account_name;
      if (!accNum || !accName) {
        const found = state.accounts.find(
          (a) => a.id === line.account_id || (accNum && a.account_number === accNum)
        );
        if (found) {
          accNum = found.account_number;
          accName = found.account_name;
        }
      }

      return {
        ...line,
        id: line.id && !line.id.startsWith('temp-') ? line.id : `jvl-${jvId}-${idx + 1}`,
        line_number: idx + 1,
        account_number: accNum || 'Unknown Account',
        account_name: accName || 'General Account',
        amount_debit: Number(line.amount_debit) || 0,
        amount_credit: Number(line.amount_credit) || 0,
        currency_rate: Number(line.currency_rate) || 1,
        amount_native:
          (Number(line.amount_debit) || Number(line.amount_credit) || 0) * (Number(line.currency_rate) || 1)
      };
    });

    const persistedVoucher: JournalVoucher = {
      id: jvId,
      tenant_id: args.voucher.tenant_id || '00000000-0000-0000-0000-000000000001',
      jv_number: jvNumber,
      date_of_jv: args.voucher.date_of_jv || new Date().toISOString().slice(0, 10),
      jv_type: (args.voucher.jv_type as any) || prefix,
      currency_id: (args.voucher.currency_id as any) || 'USD',
      doc_ref_number: args.voucher.doc_ref_number || undefined,
      description: args.voucher.description || `${prefix} Voucher Entry`,
      internal_remark: args.voucher.internal_remark || undefined,
      department: args.voucher.department || 'Main Department',
      sub_department: args.voucher.sub_department || 'General Operations',
      payee_or_recipient: args.voucher.payee_or_recipient || undefined,
      payment_method: args.voucher.payment_method || undefined,
      reference_number: args.voucher.reference_number || undefined,
      supporting_doc_url: args.voucher.supporting_doc_url || undefined,
      created_by: user,
      total_debit: balanceInfo.totalDebit,
      total_credit: balanceInfo.totalCredit,
      is_posted: args.postImmediately,
      status: (args.postImmediately ? 'Posted' : ((args.voucher as any).status || 'Draft')) as any,
      posted_at: args.postImmediately ? nowIso : undefined,
      posted_by: args.postImmediately ? user : undefined,
      lines: persistedLines
    };

    // 1. Update/Add Voucher to List
    const existingIdx = state.vouchers.findIndex((v) => v.id === jvId || v.jv_number === jvNumber);
    if (existingIdx >= 0) {
      state.vouchers[existingIdx] = persistedVoucher;
    } else {
      state.vouchers.unshift(persistedVoucher);
    }

    // Auto-create inbox approval request if voucher status is Pending Approval
    if (persistedVoucher.status === 'Pending Approval') {
      if (!state.inbox_items) state.inbox_items = [];
      const existingInbox = state.inbox_items.find(
        (i) => i.linked_voucher_id === persistedVoucher.id || (i.details?.refCode && i.details.refCode === persistedVoucher.jv_number)
      );
      if (!existingInbox) {
        state.inbox_items.unshift({
          id: `MSG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          tenant_id: persistedVoucher.tenant_id,
          category: 'APPROVAL',
          subject: `Approval Required: ${persistedVoucher.jv_type} Voucher ${persistedVoucher.jv_number} ($${balanceInfo.totalDebit.toLocaleString()})`,
          sender: user,
          branch: persistedVoucher.department || 'Main Facility',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: 'Today',
          status: 'PENDING',
          isRead: false,
          priority: balanceInfo.totalDebit > 10000 ? 'HIGH' : 'NORMAL',
          content: `Voucher ${persistedVoucher.jv_number} for $${balanceInfo.totalDebit.toLocaleString()} requires management signoff before posting to General Ledger. Description: ${persistedVoucher.description}`,
          details: {
            refCode: persistedVoucher.jv_number,
            amount: `$${balanceInfo.totalDebit.toLocaleString()}`,
            items: persistedVoucher.description,
            voucherId: persistedVoucher.id
          },
          linked_voucher_id: persistedVoucher.id,
          created_at: nowIso,
          updated_at: nowIso
        });
      }
    }

    // 2. If Post Immediately: Execute Atomic Ledger Postings and Account Balance Updates
    const updatedAccountsMap = new Map<string, AccountDetail>();
    const createdGlEntries: GlLedgerEntry[] = [];
    let glEntriesCreated = 0;

    if (args.postImmediately) {
      for (const line of persistedLines) {
        const accIdx = state.accounts.findIndex(
          (a) => a.id === line.account_id || a.account_number === line.account_number
        );

        if (accIdx >= 0) {
          const acc = { ...state.accounts[accIdx] };
          const debit = Number(line.amount_debit) || 0;
          const credit = Number(line.amount_credit) || 0;

          // Double entry accounting balance calculation using modular helper
          const { newBalanceUsd, newBalanceLbp } = calculateAccountBalanceMutation(
            acc,
            debit,
            credit
          );

          acc.balance_first_cur = newBalanceUsd;
          acc.balance_sec_cur = newBalanceLbp;

          state.accounts[accIdx] = acc;
          updatedAccountsMap.set(acc.id, acc);

          // Append to GL entries ledger
          const glEntry: GlLedgerEntry = {
            id: `gl-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            tenant_id: persistedVoucher.tenant_id,
            voucher_id: persistedVoucher.id,
            voucher_type: persistedVoucher.jv_type,
            voucher_number: persistedVoucher.jv_number,
            entry_date: persistedVoucher.date_of_jv,
            account_id: acc.id,
            account_number: acc.account_number,
            account_name: acc.account_name,
            debit,
            credit,
            balance_after: acc.balance_first_cur,
            narration: line.description || persistedVoucher.description,
            created_at: nowIso
          };
          state.gl_entries.push(glEntry);
          createdGlEntries.push(glEntry);
          glEntriesCreated++;
        }
      }

      // Log system activity for audit trail
      const postActivity: PersistedSystemActivity = {
        id: `act-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        tenant_id: persistedVoucher.tenant_id,
        company_id: 1300,
        action_type: 'VOUCHER_POSTED',
        description: `${persistedVoucher.jv_type} Voucher ${persistedVoucher.jv_number} ($${balanceInfo.totalDebit.toLocaleString()}) posted to GL`,
        performed_by: user,
        metadata: {
          voucherId: persistedVoucher.id,
          jvNumber: persistedVoucher.jv_number,
          type: persistedVoucher.jv_type,
          amount: balanceInfo.totalDebit
        },
        created_at: nowIso
      };
      state.system_activities.unshift(postActivity);
    }

    // Commit state atomically to disk
    writeDbState(state);

    // Parallel Dual-Sync to Remote Supabase via Promise.allSettled (Non-blocking optimistic by default)
    const remoteSyncPromise = (async () => {
      try {
        const headerPayload = {
          id: persistedVoucher.id,
          voucher_number: persistedVoucher.jv_number,
          date: persistedVoucher.date_of_jv || new Date().toISOString().split('T')[0],
          reference: persistedVoucher.doc_ref_number || null,
          description: persistedVoucher.description,
          currency: persistedVoucher.currency_id || 'USD',
          exchange_rate: 1,
          total_debit: persistedVoucher.total_debit,
          total_credit: persistedVoucher.total_credit,
          is_posted: persistedVoucher.is_posted ?? false,
          status: (persistedVoucher.status || (persistedVoucher.is_posted ? 'POSTED' : 'DRAFT')).toUpperCase(),
          posted_at: persistedVoucher.posted_at || null,
          posted_by: persistedVoucher.posted_by || null,
          created_by: persistedVoucher.created_by || 'Super Admin',
          updated_at: nowIso
        };

        // 1. Insert/upsert parent voucher header first (satisfies foreign key constraints in Postgres)
        const vRes = await supabase.from('acc_journal_vouchers').upsert(headerPayload);
        if (vRes.error) {
          await supabase.from('vouchers').upsert({
            id: persistedVoucher.id,
            voucher_number: persistedVoucher.jv_number,
            jv_number: persistedVoucher.jv_number,
            description: persistedVoucher.description,
            total_debit: persistedVoucher.total_debit,
            total_credit: persistedVoucher.total_credit,
            is_posted: persistedVoucher.is_posted,
            updated_at: nowIso
          });
        }

        // 2. Parallelize voucher lines, GL ledger entries, and audit activities via Promise.allSettled
        const linesTask = (async () => {
          if (persistedLines.length > 0) {
            const linesPayload = persistedLines.map((l) => ({
              id: l.id,
              voucher_id: persistedVoucher.id,
              account_id: l.account_id || null,
              account_number: l.account_number || '',
              account_name: l.account_name || '',
              description: l.description || '',
              debit: l.amount_debit || 0,
              credit: l.amount_credit || 0
            }));

            const lRes = await supabase.from('acc_journal_voucher_lines').upsert(linesPayload);
            if (lRes.error) {
              await supabase.from('voucher_lines').upsert(linesPayload);
            }
          }
        })();

        const glTask = (async () => {
          if (args.postImmediately && createdGlEntries.length > 0) {
            const glPayload = createdGlEntries.map((g) => ({
              id: g.id,
              voucher_id: g.voucher_id,
              voucher_number: g.voucher_number,
              entry_date: g.entry_date,
              account_id: g.account_id || null,
              debit: g.debit || 0,
              credit: g.credit || 0,
              description: g.narration || '',
              created_at: g.created_at || nowIso
            }));

            const gRes = await supabase.from('acc_gl_ledger_entries').upsert(glPayload);
            if (gRes.error) {
              await supabase.from('gl_entries').upsert(glPayload);
            }
          }
        })();

        const activityTask = (async () => {
          await supabase.from('system_activities').insert([
            {
              tenant_id: persistedVoucher.tenant_id,
              company_id: 1300,
              action_type: args.postImmediately ? 'VOUCHER_POSTED' : 'VOUCHER_SAVED',
              description: `${persistedVoucher.jv_type} Voucher ${persistedVoucher.jv_number} ($${balanceInfo.totalDebit.toLocaleString()}) ${args.postImmediately ? 'posted to GL' : 'saved as draft'}`,
              performed_by: user,
              metadata: {
                voucherId: persistedVoucher.id,
                jvNumber: persistedVoucher.jv_number,
                type: persistedVoucher.jv_type,
                amount: balanceInfo.totalDebit
              },
              created_at: nowIso
            }
          ]);
        })();

        await Promise.allSettled([linesTask, glTask, activityTask]);
      } catch (e) {
        // Non-blocking sync
      }
    })();

    if (args.awaitRemoteSync) {
      await remoteSyncPromise;
    }

    return {
      voucher: persistedVoucher,
      updatedAccounts: Array.from(updatedAccountsMap.values()),
      glEntriesCreated,
      glEntries: createdGlEntries
    };
  }

  /**
   * Atomic Toggle Voucher Post Status Mutation:
   * Immediately updates live database record, executes or reverses GL ledger postings,
   * updates account balances, and logs an immutable audit trail entry.
   */
  public static async togglePostVoucher(args: {
    voucherId: string;
    isPosted: boolean;
    user?: string;
    awaitRemoteSync?: boolean;
  }): Promise<{ voucher: JournalVoucher; message: string }> {
    const state = ensureDbFileExists();
    const nowIso = new Date().toISOString();
    const user = args.user || 'Super Admin (System Engine)';

    const vIdx = state.vouchers.findIndex((v) => v.id === args.voucherId || v.jv_number === args.voucherId);
    if (vIdx < 0) {
      throw new Error(`Voucher with ID "${args.voucherId}" not found in database.`);
    }

    const voucher = state.vouchers[vIdx];
    const prevPosted = Boolean(voucher.is_posted);

    if (args.isPosted === prevPosted) {
      return {
        voucher,
        message: `Voucher ${voucher.jv_number} is already in state: ${args.isPosted ? 'Posted' : 'Draft'}.`
      };
    }

    if (args.isPosted) {
      // POSTING
      voucher.is_posted = true;
      voucher.posted_at = nowIso;
      voucher.posted_by = user;
      voucher.status = 'POSTED';
      voucher.updated_at = nowIso;

      // Create GL entries for each line if lines exist
      const lines = voucher.lines || [];
      if (lines.length > 0) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const acc = state.accounts.find((a) => a.id === line.account_id || a.account_number === line.account_number);
          if (acc) {
            const debit = Number(line.amount_debit) || 0;
            const credit = Number(line.amount_credit) || 0;
            const isAssetOrExpense = ['Asset', 'Expense', 'ASSET', 'EXPENSE'].includes(acc.type || acc.account_type);
            const netDelta = isAssetOrExpense ? debit - credit : credit - debit;
            acc.balance_first_cur = (acc.balance_first_cur || 0) + netDelta;
            acc.balance_sec_cur = acc.balance_first_cur * LBP_RATE;

            state.gl_entries.push({
              id: `gl-${Date.now()}-${i + 1}`,
              tenant_id: voucher.tenant_id || '00000000-0000-0000-0000-000000000001',
              voucher_id: voucher.id,
              voucher_type: voucher.jv_type,
              voucher_number: voucher.jv_number,
              entry_date: voucher.date_of_jv,
              account_id: acc.id,
              account_number: acc.account_number,
              account_name: acc.account_name,
              debit,
              credit,
              balance_after: acc.balance_first_cur,
              narration: line.description || voucher.description,
              created_at: nowIso
            });
          }
        }
      }

      // Auto-resolve any unposted alert for this voucher
      if (state.system_alerts) {
        for (const alt of state.system_alerts) {
          if (alt.source_ref === voucher.id || alt.id.includes(voucher.id)) {
            alt.is_read = true;
            alt.status = 'RESOLVED';
            alt.resolved_at = nowIso;
            alt.resolved_by = user;
            alt.resolution_reason = `Voucher ${voucher.jv_number} posted to General Ledger`;
          }
        }
      }

      // Log audit
      state.system_activities.unshift({
        id: `act-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        tenant_id: voucher.tenant_id || '00000000-0000-0000-0000-000000000001',
        company_id: 1300,
        action_type: 'VOUCHER_POSTED',
        description: `Voucher ${voucher.jv_number} ($${voucher.total_debit.toFixed(2)}) posted to General Ledger.`,
        performed_by: user,
        metadata: { voucherId: voucher.id, jvNumber: voucher.jv_number, amount: voucher.total_debit },
        created_at: nowIso
      });
    } else {
      // UNPOSTING
      voucher.is_posted = false;
      voucher.posted_at = undefined;
      voucher.posted_by = undefined;
      voucher.status = 'DRAFT';
      voucher.updated_at = nowIso;

      // Reverse and remove GL entries
      const glMatches = state.gl_entries.filter((g) => g.voucher_id === voucher.id || g.voucher_number === voucher.jv_number);
      for (const g of glMatches) {
        const acc = state.accounts.find((a) => a.id === g.account_id || a.account_number === g.account_number);
        if (acc) {
          const isAssetOrExpense = ['Asset', 'Expense', 'ASSET', 'EXPENSE'].includes(acc.type || acc.account_type);
          const netDelta = isAssetOrExpense ? g.debit - g.credit : g.credit - g.debit;
          acc.balance_first_cur = (acc.balance_first_cur || 0) - netDelta;
          acc.balance_sec_cur = acc.balance_first_cur * LBP_RATE;
        }
      }
      state.gl_entries = state.gl_entries.filter((g) => g.voucher_id !== voucher.id && g.voucher_number !== voucher.jv_number);

      // Log audit
      state.system_activities.unshift({
        id: `act-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        tenant_id: voucher.tenant_id || '00000000-0000-0000-0000-000000000001',
        company_id: 1300,
        action_type: 'VOUCHER_UNPOSTED',
        description: `Voucher ${voucher.jv_number} unposted and returned to Draft status.`,
        performed_by: user,
        metadata: { voucherId: voucher.id, jvNumber: voucher.jv_number },
        created_at: nowIso
      });
    }

    state.vouchers[vIdx] = voucher;
    writeDbState(state);

    // Parallel Dual-Sync to Supabase Postgres (Non-blocking optimistic by default)
    const remoteSyncPromise = (async () => {
      try {
        const vTask = supabase
          .from('acc_journal_vouchers')
          .update({
            is_posted: voucher.is_posted,
            posted_at: voucher.posted_at || null,
            posted_by: voucher.posted_by || null,
            status: (voucher.status || (voucher.is_posted ? 'POSTED' : 'DRAFT')).toUpperCase(),
            updated_at: nowIso
          })
          .eq('id', voucher.id);

        const glTask = args.isPosted
          ? (async () => {
              const addedGlEntries = state.gl_entries.filter(
                (g) => g.voucher_id === voucher.id || g.voucher_number === voucher.jv_number
              );
              if (addedGlEntries.length > 0) {
                const glPayload = addedGlEntries.map((g) => ({
                  id: g.id,
                  voucher_id: g.voucher_id,
                  voucher_number: g.voucher_number,
                  account_id: g.account_id || null,
                  entry_date: g.entry_date,
                  debit: g.debit || 0,
                  credit: g.credit || 0,
                  description: g.narration || '',
                  created_at: g.created_at || nowIso
                }));
                await supabase.from('acc_gl_ledger_entries').upsert(glPayload);
              }
            })()
          : supabase
              .from('acc_gl_ledger_entries')
              .delete()
              .or(`voucher_id.eq.${voucher.id},voucher_number.eq.${voucher.jv_number}`);

        await Promise.allSettled([vTask, glTask]);
      } catch (e) {
        // Non-blocking
      }
    })();

    if (args.awaitRemoteSync) {
      await remoteSyncPromise;
    }

    return {
      voucher,
      message: args.isPosted
        ? `Voucher ${voucher.jv_number} successfully posted to database and General Ledger!`
        : `Voucher ${voucher.jv_number} unposted and returned to draft.`
    };
  }

  /**
   * Atomic Batch Mass Post Mutation:
   * Posts all unposted vouchers in batch, writes GL entries, auto-dismisses alerts, and audits action.
   */
  public static async postAllVouchers(user?: string): Promise<{
    postedCount: number;
    vouchers: JournalVoucher[];
    message: string;
  }> {
    const state = ensureDbFileExists();
    const nowIso = new Date().toISOString();
    const actor = user || 'Super Admin (Mass Post Execution)';

    const unposted = state.vouchers.filter((v) => !v.is_posted);
    if (unposted.length === 0) {
      return {
        postedCount: 0,
        vouchers: state.vouchers,
        message: 'All Journal Vouchers are already posted.'
      };
    }

    for (const v of unposted) {
      v.is_posted = true;
      v.posted_at = nowIso;
      v.posted_by = actor;
      v.status = 'POSTED';
      v.updated_at = nowIso;

      const lines = v.lines || [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const acc = state.accounts.find((a) => a.id === line.account_id || a.account_number === line.account_number);
        if (acc) {
          const debit = Number(line.amount_debit) || 0;
          const credit = Number(line.amount_credit) || 0;
          const isAssetOrExpense = ['Asset', 'Expense', 'ASSET', 'EXPENSE'].includes(acc.type || acc.account_type);
          const netDelta = isAssetOrExpense ? debit - credit : credit - debit;
          acc.balance_first_cur = (acc.balance_first_cur || 0) + netDelta;
          acc.balance_sec_cur = acc.balance_first_cur * LBP_RATE;

          state.gl_entries.push({
            id: `gl-${Date.now()}-${i + 1}`,
            tenant_id: v.tenant_id || '00000000-0000-0000-0000-000000000001',
            voucher_id: v.id,
            voucher_type: v.jv_type,
            voucher_number: v.jv_number,
            entry_date: v.date_of_jv,
            account_id: acc.id,
            account_number: acc.account_number,
            account_name: acc.account_name,
            debit,
            credit,
            balance_after: acc.balance_first_cur,
            narration: line.description || v.description,
            created_at: nowIso
          });
        }
      }

      // Auto-resolve any unposted alert for this voucher
      if (state.system_alerts) {
        for (const alt of state.system_alerts) {
          if (alt.source_ref === v.id || alt.id.includes(v.id)) {
            alt.is_read = true;
            alt.status = 'RESOLVED';
            alt.resolved_at = nowIso;
            alt.resolved_by = actor;
            alt.resolution_reason = `Voucher ${v.jv_number} posted to General Ledger (Mass Post)`;
          }
        }
      }
    }

    state.system_activities.unshift({
      id: `act-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      tenant_id: '00000000-0000-0000-0000-000000000001',
      company_id: 1300,
      action_type: 'MASS_POST',
      description: `Batch posted ${unposted.length} journal vouchers to General Ledger.`,
      performed_by: actor,
      metadata: { count: unposted.length },
      created_at: nowIso
    });

    writeDbState(state);

    // Non-blocking optimistic background sync to Supabase Postgres (0ms UI latency)
    (async () => {
      try {
        const vPayloads = unposted.map((v) => ({
          id: v.id,
          is_posted: true,
          posted_at: nowIso,
          posted_by: actor,
          status: 'POSTED',
          updated_at: nowIso
        }));
        await supabase.from('acc_journal_vouchers').upsert(vPayloads);
      } catch (e) {
        // Non-blocking sync
      }
    })();

    return {
      postedCount: unposted.length,
      vouchers: state.vouchers,
      message: `Successfully batch posted ${unposted.length} vouchers to database & General Ledger!`
    };
  }

  // =========================================================================
  // MODULAR HANDLER: PAYMENT VOUCHERS (PV)
  // =========================================================================
  public static async savePaymentVoucher(input: PaymentVoucherMutationInput): Promise<{
    voucher: JournalVoucher;
    updatedAccounts: AccountDetail[];
    glEntriesCreated: number;
  }> {
    const state = ensureDbFileExists();

    const payToAcc = state.accounts.find(
      (a) => a.id === input.payToAccountId || a.account_number === input.payToAccountId
    );
    if (!payToAcc) {
      throw new Error(`Pay-To Account not found: "${input.payToAccountId}"`);
    }

    const fromAcc = state.accounts.find(
      (a) => a.id === input.fromAccountId || a.account_number === input.fromAccountId
    );
    if (!fromAcc) {
      throw new Error(`Disbursing Account not found: "${input.fromAccountId}"`);
    }

    if (input.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    const lines = buildPaymentVoucherLines({
      payToAccount: payToAcc,
      fromAccount: fromAcc,
      amount: input.amount,
      description: input.description,
      referenceNumber: input.referenceNumber,
      department: input.department
    }) as JVLine[];

    return this.saveVoucherTransaction({
      voucher: {
        id: input.id,
        jv_number: input.voucherNumber,
        jv_type: 'PV',
        date_of_jv: input.date || new Date().toISOString().slice(0, 10),
        currency_id: (input.currency as any) || 'USD',
        description: input.description,
        internal_remark: input.internalNote,
        reference_number: input.referenceNumber,
        department: input.department || 'Executive & Administration',
        payee_or_recipient: payToAcc.account_name,
        payment_method: input.paymentMethod || 'CASH',
        supporting_doc_url: input.supportingDocUrl,
        created_by: input.user || 'Super Admin'
      },
      lines,
      postImmediately: Boolean(input.postImmediately),
      user: input.user
    });
  }

  // =========================================================================
  // MODULAR HANDLER: RECEIPT VOUCHERS (RV)
  // =========================================================================
  public static async saveReceiptVoucher(input: ReceiptVoucherMutationInput): Promise<{
    voucher: JournalVoucher;
    updatedAccounts: AccountDetail[];
    glEntriesCreated: number;
  }> {
    const state = ensureDbFileExists();

    if (!input.items || input.items.length === 0) {
      throw new Error('Receipt voucher requires at least one collection line');
    }

    const mappedItems = input.items.map((item) => {
      const fromAcc = state.accounts.find(
        (a) => a.id === item.fromAccountId || a.account_number === item.fromAccountId
      );
      if (!fromAcc) {
        throw new Error(`Customer Account not found: "${item.fromAccountId}"`);
      }

      const toAcc = state.accounts.find(
        (a) => a.id === item.toAccountId || a.account_number === item.toAccountId
      );
      if (!toAcc) {
        throw new Error(`Vault / Bank Account not found: "${item.toAccountId}"`);
      }

      return {
        fromAccount: fromAcc,
        toAccount: toAcc,
        amount: item.amount,
        description: item.description,
        checkNumber: item.checkNumber,
        department: item.department || input.department
      };
    });

    const lines = buildReceiptVoucherLines({
      items: mappedItems,
      generalDescription: input.description
    }) as JVLine[];

    const totalAmt = input.items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const desc =
      input.description ||
      `Customer collection receipts total $${totalAmt.toFixed(2)}`;

    return this.saveVoucherTransaction({
      voucher: {
        id: input.id,
        jv_number: input.voucherNumber,
        jv_type: 'RV',
        date_of_jv: input.date || new Date().toISOString().slice(0, 10),
        currency_id: (input.currency as any) || 'USD',
        description: desc,
        department: input.department || 'Commercial Sales & Retail',
        created_by: input.user || 'Super Admin'
      },
      lines,
      postImmediately: Boolean(input.postImmediately),
      user: input.user
    });
  }

  // =========================================================================
  // MODULAR HANDLER: CONTRA VOUCHERS (CV)
  // =========================================================================
  public static async saveContraVoucher(input: ContraVoucherMutationInput): Promise<{
    voucher: JournalVoucher;
    updatedAccounts: AccountDetail[];
    glEntriesCreated: number;
  }> {
    const state = ensureDbFileExists();

    const fromAcc = state.accounts.find(
      (a) => a.id === input.fromAccountId || a.account_number === input.fromAccountId
    );
    if (!fromAcc) {
      throw new Error(`Source Account not found: "${input.fromAccountId}"`);
    }

    const toAcc = state.accounts.find(
      (a) => a.id === input.toAccountId || a.account_number === input.toAccountId
    );
    if (!toAcc) {
      throw new Error(`Destination Account not found: "${input.toAccountId}"`);
    }

    const lines = buildContraVoucherLines({
      fromAccount: fromAcc,
      toAccount: toAcc,
      amount: input.amount,
      description: input.description,
      department: input.department
    }) as JVLine[];

    return this.saveVoucherTransaction({
      voucher: {
        id: input.id,
        jv_number: input.voucherNumber,
        jv_type: 'CV',
        date_of_jv: input.date || new Date().toISOString().slice(0, 10),
        currency_id: (input.currency as any) || 'USD',
        description: input.description || `Contra transfer from ${fromAcc.account_name} to ${toAcc.account_name}`,
        reference_number: input.referenceNumber,
        department: input.department || 'Treasury & Finance',
        created_by: input.user || 'Super Admin'
      },
      lines,
      postImmediately: Boolean(input.postImmediately),
      user: input.user
    });
  }

  public static async deleteVoucher(id: string): Promise<boolean> {
    const state = ensureDbFileExists();
    const idx = state.vouchers.findIndex((v) => v.id === id || v.jv_number === id);
    if (idx >= 0) {
      const removed = state.vouchers.splice(idx, 1)[0];
      state.gl_entries = state.gl_entries.filter((g) => g.voucher_id !== removed.id && g.voucher_number !== removed.jv_number);
      writeDbState(state);

      // Non-blocking optimistic background sync delete to Supabase Postgres (0ms UI latency)
      (async () => {
        try {
          await Promise.allSettled([
            supabase.from('acc_journal_vouchers').delete().eq('id', removed.id),
            supabase.from('acc_journal_voucher_lines').delete().eq('voucher_id', removed.id),
            supabase.from('acc_gl_ledger_entries').delete().or(`voucher_id.eq.${removed.id},voucher_number.eq.${removed.jv_number}`)
          ]);
        } catch (e) {
          // Non-blocking background sync
        }
      })();

      return true;
    }
    return false;
  }

  // =========================================================================
  // 3. PURCHASES & EXPENSES REPOSITORY (Module 2 Lifecycle)
  // =========================================================================
  public static async getExpenses(): Promise<PersistedExpenseRecord[]> {
    const state = ensureDbFileExists();
    // Local-First Read Optimization with Non-Blocking Background SWR Reconciliation
    const shouldReconcile = Date.now() - lastExpenseReconcileTime > RECONCILE_INTERVAL_MS;
    if (shouldReconcile && !activeExpenseReconcilePromise) {
      lastExpenseReconcileTime = Date.now();
      activeExpenseReconcilePromise = (async () => {
        try {
          const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
            setTimeout(() => resolve({ data: null, error: new Error('Supabase read timeout') }), 2500)
          );
          const fetchPromise = supabase.from('acc_expense_vouchers').select('*');
          const res = await Promise.race([fetchPromise, timeoutPromise]);
          const { data: sbData, error: sbErr } = res as any;

          if (!sbErr && Array.isArray(sbData) && sbData.length > 0) {
            const currentState = ensureDbFileExists();
            let stateMutated = false;
            for (const sbE of sbData) {
              const exists = (currentState.expenses || []).some(
                (e) => e.id === sbE.id || e.ev === sbE.ev_number
              );
              if (!exists) {
                if (!currentState.expenses) currentState.expenses = [];
                currentState.expenses.unshift({
                  id: sbE.id,
                  tenant_id: sbE.tenant_id,
                  payee: sbE.payee,
                  reference: sbE.reference,
                  date: sbE.date_of_ev,
                  ev: sbE.ev_number,
                  dateOfEv: sbE.date_of_ev,
                  amount: Number(sbE.amount) || 0,
                  totalDisbursed: Number(sbE.total_disbursed) || 0,
                  paymentDifference: Number(sbE.payment_difference) || 0,
                  description: sbE.description,
                  enteredBy: sbE.created_by || 'Super Admin',
                  department: sbE.purchase_dept || 'Main Department',
                  posted: Boolean(sbE.is_posted),
                  status: sbE.status,
                  purchaseAccountId: sbE.purchase_account_id || '',
                  purchaseDept: sbE.purchase_dept || 'Main Department',
                  purchaseRef: sbE.reference || '',
                  supportingDocUrl: sbE.supporting_doc_url,
                  expenseRows: [],
                  paymentRows: [],
                  created_at: sbE.created_at || new Date().toISOString(),
                  updated_at: sbE.updated_at || new Date().toISOString()
                });
                stateMutated = true;
              }
            }
            if (stateMutated) {
              writeDbState(currentState);
            }
          }
        } catch (e) {
          // Non-blocking fallback
        } finally {
          activeExpenseReconcilePromise = null;
        }
      })();
    }
    return state.expenses || [];
  }

  public static async saveExpense(
    inputOrArgs: (Partial<PersistedExpenseRecord> & { description: string; amount: number }) | { expense: Partial<PersistedExpenseRecord>; postImmediately?: boolean; user?: string; awaitRemoteSync?: boolean },
    options?: { awaitRemoteSync?: boolean }
  ): Promise<PersistedExpenseRecord> {
    const state = ensureDbFileExists();
    const nowIso = new Date().toISOString();
    const input: any = (inputOrArgs as any).expense ? (inputOrArgs as any).expense : inputOrArgs;
    const isPosted = Boolean(input.posted || (inputOrArgs as any).postImmediately);
    const user = (inputOrArgs as any).user || input.enteredBy || 'Super Admin';

    const evId =
      input.id && !input.id.startsWith('temp-')
        ? input.id
        : `ev-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const evNumber = input.ev || `EV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const record: PersistedExpenseRecord = {
      id: evId,
      tenant_id: input.tenant_id || '00000000-0000-0000-0000-000000000001',
      payee: input.payee || 'Supplier / Creditor',
      reference: input.reference || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      date: input.date || new Date().toISOString().slice(0, 10),
      ev: evNumber,
      dateOfEv: input.dateOfEv || input.date || new Date().toISOString().slice(0, 10),
      amount: Number(input.amount) || 0,
      totalDisbursed: Number(input.totalDisbursed) || 0,
      paymentDifference: Number(input.paymentDifference) || 0,
      description: input.description,
      enteredBy: user,
      department: input.department || 'Main Department',
      posted: isPosted,
      status: input.status || (Math.abs(Number(input.paymentDifference) || 0) > 0.01 ? 'UNCLOSED_PENDING_SETTLEMENT' : (isPosted ? 'FULLY_CLOSED_RECONCILED' : 'DRAFT')),
      purchaseAccountId: input.purchaseAccountId || '',
      purchaseDept: input.purchaseDept || 'Main Department',
      purchaseRef: input.purchaseRef || '',
      supportingDocUrl: input.supportingDocUrl,
      expenseRows: input.expenseRows || [],
      paymentRows: input.paymentRows || [],
      created_at: input.created_at || nowIso,
      updated_at: nowIso,
      posted_at: isPosted ? (input.posted_at || nowIso) : undefined
    };

    const idx = state.expenses.findIndex((e) => e.id === evId || e.ev === evNumber);
    if (idx >= 0) {
      state.expenses[idx] = record;
    } else {
      state.expenses.unshift(record);
    }

    // Synchronize alert lifecycle for expenses (Active vs Reconciled)
    if (!state.system_alerts) state.system_alerts = [];
    const alertId = `alert-exp-${record.id}`;
    const hasVariance = Math.abs(Number(record.paymentDifference) || 0) > 0.01;

    if (!hasVariance && (record.status === 'FULLY_CLOSED_RECONCILED' || record.posted)) {
      // Reconciled / settled: immediately auto-resolve alert
      const existingAlert = state.system_alerts.find((a) => a.id === alertId || a.source_ref === record.id || a.source_ref === record.ev);
      if (existingAlert) {
        existingAlert.is_read = true;
        existingAlert.status = 'RESOLVED';
        existingAlert.resolved_at = nowIso;
        existingAlert.resolved_by = record.enteredBy || 'Super Admin';
        existingAlert.resolution_reason = `Expense ${record.ev} reconciled & settled to $0.00 difference`;
      }
    } else if (hasVariance || record.status === 'UNCLOSED_PENDING_SETTLEMENT') {
      // Unsettled variance: register or activate pending alert
      const existingAlert = state.system_alerts.find((a) => a.id === alertId || a.source_ref === record.id || a.source_ref === record.ev);
      if (!existingAlert) {
        state.system_alerts.unshift({
          id: alertId,
          type: 'UNCLOSED_CASE',
          severity: 'WARNING',
          title: `Unclosed Expense Voucher: ${record.ev}`,
          message: `${record.payee} - Unsettled variance: $${record.paymentDifference.toFixed(2)} (${record.description})`,
          timestamp: record.dateOfEv || record.date,
          is_read: false,
          status: 'PENDING',
          source_ref: record.id,
          source_type: 'EXPENSE',
          actionLink: `/backoffice/accounting?tab=module2&id=${record.id}&voucherId=${record.ev}`,
          actionLabel: 'Reconcile'
        });
      } else {
        existingAlert.is_read = false;
        existingAlert.status = 'PENDING';
        existingAlert.message = `${record.payee} - Unsettled variance: $${record.paymentDifference.toFixed(2)} (${record.description})`;
      }
    }

    // Log operational audit activity
    const expActivity: PersistedSystemActivity = {
      id: `act-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      tenant_id: record.tenant_id,
      company_id: 1300,
      action_type: record.posted ? 'EXPENSE_POSTED' : 'EXPENSE_RECORDED',
      description: `Expense Voucher ${record.ev} ($${record.amount.toLocaleString()}) recorded for ${record.payee}`,
      performed_by: record.enteredBy,
      metadata: { ev: record.ev, amount: record.amount, status: record.status },
      created_at: nowIso
    };
    state.system_activities.unshift(expActivity);

    writeDbState(state);

    // Parallel Dual-Sync to Remote Supabase via Promise.allSettled (Non-blocking optimistic by default)
    const remoteSyncPromise = (async () => {
      try {
        const expensePayload = {
          id: record.id,
          voucher_number: record.ev || `EV-${Date.now()}`,
          payee: record.payee || 'Vendor/Supplier',
          amount: record.amount || 0,
          total_disbursed: record.totalDisbursed || 0,
          payment_difference: record.paymentDifference || 0,
          description: record.description || 'Expense Voucher',
          status: record.status || 'DRAFT',
          is_posted: record.posted ?? false,
          updated_at: nowIso
        };

        const expenseTask = (async () => {
          const eRes = await supabase.from('acc_expense_vouchers').upsert(expensePayload);
          if (eRes.error) {
            await supabase.from('expenses').upsert({
              id: record.id,
              amount: record.amount,
              description: record.description,
              updated_at: nowIso
            });
          }
        })();

        const paymentLinesTask = (async () => {
          if (record.paymentRows && record.paymentRows.length > 0) {
            const payPayload = record.paymentRows.map((p: any, idx: number) => ({
              id: p.id || `evl-${record.id}-${idx + 1}`,
              payment_method: p.paymentMethod || 'Cash'
            }));
            await supabase.from('acc_expense_payment_lines').upsert(payPayload);
          }
        })();

        const activityTask = (async () => {
          await supabase.from('system_activities').insert([
            {
              tenant_id: record.tenant_id,
              company_id: 1300,
              action_type: record.posted ? 'EXPENSE_POSTED' : 'EXPENSE_RECORDED',
              description: `Expense Voucher ${record.ev} ($${record.amount.toLocaleString()}) recorded for ${record.payee}`,
              performed_by: record.enteredBy,
              metadata: { ev: record.ev, amount: record.amount, status: record.status },
              created_at: nowIso
            }
          ]);
        })();

        await Promise.allSettled([expenseTask, paymentLinesTask, activityTask]);
      } catch (e) {
        // Non-blocking sync
      }
    })();

    const shouldAwaitRemote = Boolean((inputOrArgs as any)?.awaitRemoteSync || options?.awaitRemoteSync);
    if (shouldAwaitRemote) {
      await remoteSyncPromise;
    }

    return record;
  }

  // =========================================================================
  // 4. GL AUDIT LEDGER ENTRIES
  // =========================================================================
  public static async getGlLedger(
    filter?: { accountId?: string; voucherId?: string } | string
  ): Promise<GlLedgerEntry[]> {
    const state = ensureDbFileExists();
    if (!filter) return state.gl_entries;
    if (typeof filter === 'string') {
      return state.gl_entries.filter(
        (e) => e.account_id === filter || e.voucher_id === filter || e.voucher_number === filter
      );
    }
    return state.gl_entries.filter((e) => {
      if (filter.accountId && e.account_id !== filter.accountId) return false;
      if (filter.voucherId && e.voucher_id !== filter.voucherId && e.voucher_number !== filter.voucherId) return false;
      return true;
    });
  }

  // =========================================================================
  // 5. INBOX & APPROVAL WORKFLOW ENGINE
  // =========================================================================
  public static async getInboxItems(filters?: {
    category?: string;
    status?: string;
    search?: string;
  }): Promise<{
    items: PersistedInboxMessage[];
    unreadCount: number;
    pendingApprovalsCount: number;
  }> {
    const state = ensureDbFileExists();
    let list = [...(state.inbox_items || [])];

    if (filters?.category && filters.category !== 'ALL') {
      list = list.filter((m) => m.category === filters.category);
    }

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((m) => m.status === filters.status);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.subject.toLowerCase().includes(q) ||
          m.sender.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          (m.details?.refCode && m.details.refCode.toLowerCase().includes(q))
      );
    }

    const unreadCount = (state.inbox_items || []).filter((m) => !m.isRead).length;
    const pendingApprovalsCount = (state.inbox_items || []).filter(
      (m) => m.category === 'APPROVAL' && m.status === 'PENDING'
    ).length;

    return {
      items: list,
      unreadCount,
      pendingApprovalsCount
    };
  }

  public static async executeInboxAction(params: {
    id?: string;
    itemId?: string;
    action: 'APPROVE' | 'REJECT';
    notes?: string;
    reason?: string;
    user?: string;
  }): Promise<{
    success: boolean;
    message: string;
    item: PersistedInboxMessage;
    updatedVoucher?: JournalVoucher;
    updatedExpense?: PersistedExpenseRecord;
  }> {
    const state = ensureDbFileExists();
    const nowIso = new Date().toISOString();
    const user = params.user || 'Mohammed Jichi (General Operations Manager)';
    const targetId = params.id || params.itemId;

    if (!targetId) {
      throw new Error('Target inbox item ID is required.');
    }

    const itemIdx = state.inbox_items.findIndex((m) => m.id === targetId);
    if (itemIdx < 0) {
      throw new Error(`Inbox item not found: ${targetId}`);
    }

    const item = state.inbox_items[itemIdx];
    item.status = params.action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    item.isRead = true;
    item.action_performed_by = user;
    item.action_performed_at = nowIso;
    item.action_notes = params.notes;
    item.updated_at = nowIso;

    let updatedVoucher: JournalVoucher | undefined;
    let updatedExpense: PersistedExpenseRecord | undefined;

    // If linked to a voucher, update the voucher and mutate GL if approved!
    if (item.linked_voucher_id) {
      const vIdx = state.vouchers.findIndex((v) => v.id === item.linked_voucher_id);
      if (vIdx >= 0) {
        const v = state.vouchers[vIdx];
        if (params.action === 'APPROVE') {
          v.is_posted = true;
          v.posted_at = nowIso;
          v.posted_by = user;
          v.internal_remark = `APPROVED via Inbox by ${user} on ${nowIso}${params.notes ? ` - Notes: ${params.notes}` : ''}`;

          // Execute double-entry balance mutation on each line
          for (const line of v.lines) {
            const accIdx = state.accounts.findIndex(
              (a) => a.id === line.account_id || a.account_number === line.account_number
            );
            if (accIdx >= 0) {
              const acc = { ...state.accounts[accIdx] };
              const debit = Number(line.amount_debit) || 0;
              const credit = Number(line.amount_credit) || 0;
              const { newBalanceUsd, newBalanceLbp } = calculateAccountBalanceMutation(
                acc,
                debit,
                credit
              );
              acc.balance_first_cur = newBalanceUsd;
              acc.balance_sec_cur = newBalanceLbp;
              state.accounts[accIdx] = acc;

              // Append to GL ledger
              state.gl_entries.push({
                id: `gl-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
                tenant_id: v.tenant_id,
                voucher_id: v.id,
                voucher_type: v.jv_type,
                voucher_number: v.jv_number,
                entry_date: v.date_of_jv,
                account_id: acc.id,
                account_number: acc.account_number,
                account_name: acc.account_name,
                debit,
                credit,
                balance_after: acc.balance_first_cur,
                narration: `[Inbox Approved] ${line.description || v.description}`,
                created_at: nowIso
              });
            }
          }
        } else {
          // REJECT
          v.internal_remark = `REJECTED via Inbox by ${user} on ${nowIso}${params.notes ? ` - Reason: ${params.notes}` : ''}`;
        }
        state.vouchers[vIdx] = v;
        updatedVoucher = v;
      }
    }

    // If linked to an expense record, update expense status
    if (item.linked_expense_id) {
      const eIdx = state.expenses.findIndex((e) => e.id === item.linked_expense_id);
      if (eIdx >= 0) {
        const exp = state.expenses[eIdx];
        if (params.action === 'APPROVE') {
          exp.posted = true;
          exp.status = 'FULLY_CLOSED_RECONCILED';
          exp.posted_at = nowIso;
        } else {
          exp.description += ` [REJECTED: ${params.notes || 'Approval denied'}]`;
        }
        exp.updated_at = nowIso;
        state.expenses[eIdx] = exp;
        updatedExpense = exp;
      }
    }

    // Log operational audit activity
    const actionType = params.action === 'APPROVE' ? 'INBOX_APPROVAL_GRANTED' : 'INBOX_APPROVAL_REJECTED';
    const auditActivity: PersistedSystemActivity = {
      id: `act-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      tenant_id: item.tenant_id,
      company_id: 1300,
      action_type: actionType,
      description: `${params.action === 'APPROVE' ? 'Approved' : 'Rejected'} request: [${item.details?.refCode || item.id}] ${item.subject}`,
      performed_by: user,
      metadata: {
        inboxId: item.id,
        refCode: item.details?.refCode,
        action: params.action,
        voucherId: item.linked_voucher_id,
        expenseId: item.linked_expense_id
      },
      created_at: nowIso
    };
    state.system_activities.unshift(auditActivity);

    // Auto-resolve any corresponding alert in system_alerts
    if (state.system_alerts) {
      for (const alt of state.system_alerts) {
        if (alt.source_ref === item.id || alt.id.includes(item.id)) {
          alt.is_read = true;
          alt.status = params.action === 'APPROVE' ? 'RESOLVED' : 'ARCHIVED';
          alt.resolved_at = nowIso;
          alt.resolved_by = user;
          alt.resolution_reason = `Inbox request ${item.id} ${params.action === 'APPROVE' ? 'approved' : 'rejected'}`;
        }
      }
    }

    // Commit state atomically to disk
    writeDbState(state);

    // Non-blocking Parallel Background Dual-Sync to Remote Supabase (0ms UI latency)
    (async () => {
      try {
        const inboxPayload = {
          id: item.id,
          status: item.status,
          updated_at: nowIso
        };
        const inboxTask = (async () => {
          const iRes = await supabase.from('acc_inbox_items').upsert(inboxPayload);
          if (iRes.error) {
            await supabase.from('inbox').upsert(inboxPayload);
          }
        })();

        const voucherTask = (async () => {
          if (updatedVoucher) {
            const vPayload = {
              id: updatedVoucher.id,
              is_posted: updatedVoucher.is_posted,
              posted_at: updatedVoucher.posted_at || null,
              posted_by: updatedVoucher.posted_by || null,
              status: updatedVoucher.status || (updatedVoucher.is_posted ? 'POSTED' : 'DRAFT'),
              updated_at: nowIso
            };
            const uvRes = await supabase.from('acc_journal_vouchers').upsert(vPayload);
            if (uvRes.error) {
              await supabase.from('vouchers').upsert(vPayload);
            }
          }
        })();

        const expenseTask = (async () => {
          if (updatedExpense) {
            const ePayload = {
              id: updatedExpense.id,
              status: updatedExpense.status,
              is_posted: updatedExpense.posted ?? false,
              updated_at: nowIso
            };
            const ueRes = await supabase.from('acc_expense_vouchers').upsert(ePayload);
            if (ueRes.error) {
              await supabase.from('expenses').upsert(ePayload);
            }
          }
        })();

        const activityTask = (async () => {
          await supabase.from('system_activities').insert([
            {
              tenant_id: item.tenant_id,
              company_id: 1300,
              action_type: auditActivity.action_type,
              description: auditActivity.description,
              performed_by: user,
              metadata: auditActivity.metadata,
              created_at: nowIso
            }
          ]);
        })();

        await Promise.allSettled([inboxTask, voucherTask, expenseTask, activityTask]);
      } catch (e) {
        // Non-blocking sync
      }
    })();

    const message = params.action === 'APPROVE'
      ? `Request ${item.id} successfully approved.${updatedVoucher ? ` Voucher ${updatedVoucher.jv_number} posted to General Ledger.` : ''}`
      : `Request ${item.id} has been rejected.`;

    return {
      success: true,
      message,
      item,
      updatedVoucher,
      updatedExpense
    };
  }

  // =========================================================================
  // 6. DYNAMIC SYSTEM ACTIVITIES & NOTIFICATIONS REPOSITORY
  // =========================================================================
  public static async getSystemActivities(limit = 20): Promise<PersistedSystemActivity[]> {
    const state = ensureDbFileExists();
    return (state.system_activities || []).slice(0, limit);
  }

  public static async logActivity(params: {
    action_type: string;
    description: string;
    performed_by?: string;
    metadata?: any;
  }): Promise<PersistedSystemActivity> {
    const state = ensureDbFileExists();
    const nowIso = new Date().toISOString();
    const entry: PersistedSystemActivity = {
      id: `act-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      tenant_id: '00000000-0000-0000-0000-000000000001',
      company_id: 1300,
      action_type: params.action_type,
      description: params.description,
      performed_by: params.performed_by || 'System Engine',
      metadata: params.metadata || {},
      created_at: nowIso
    };
    state.system_activities.unshift(entry);
    writeDbState(state);
    return entry;
  }

  public static async dismissAlert(alertId: string, user?: string): Promise<boolean> {
    const state = ensureDbFileExists();
    const nowIso = new Date().toISOString();
    if (!state.dismissed_alert_ids) {
      state.dismissed_alert_ids = [];
    }
    if (!state.dismissed_alert_ids.includes(alertId)) {
      state.dismissed_alert_ids.push(alertId);
    }
    if (state.system_alerts) {
      const alt = state.system_alerts.find((a) => a.id === alertId);
      if (alt) {
        alt.is_read = true;
        alt.status = 'ARCHIVED';
        alt.resolved_at = nowIso;
        alt.resolved_by = user || 'Super Admin';
        alt.resolution_reason = 'Dismissed by user';
      }
    }
    writeDbState(state);
    return true;
  }

  public static async markAllAlertsAsRead(user?: string): Promise<number> {
    const state = ensureDbFileExists();
    const nowIso = new Date().toISOString();
    if (!state.dismissed_alert_ids) {
      state.dismissed_alert_ids = [];
    }
    let count = 0;
    if (state.system_alerts) {
      for (const a of state.system_alerts) {
        if (!a.is_read || a.status === 'PENDING') {
          a.is_read = true;
          a.status = 'ARCHIVED';
          a.resolved_at = nowIso;
          a.resolved_by = user || 'Super Admin';
          a.resolution_reason = 'Marked all as read';
          if (!state.dismissed_alert_ids.includes(a.id)) {
            state.dismissed_alert_ids.push(a.id);
          }
          count++;
        }
      }
    }
    // Also mark inbox items as read
    if (state.inbox_items) {
      for (const item of state.inbox_items) {
        if (!item.isRead) {
          item.isRead = true;
          item.updated_at = nowIso;
          count++;
        }
      }
    }
    writeDbState(state);
    return count;
  }

  public static async getSystemAlerts(options?: {
    includeResolved?: boolean;
    search?: string;
  } | boolean): Promise<{
    alerts: DynamicSystemAlert[];
    pendingApprovalsCount: number;
    unreadInboxCount: number;
    activeAlertsCount: number;
  }> {
    const state = ensureDbFileExists();
    const dismissedIds = new Set(state.dismissed_alert_ids || []);
    const alerts: DynamicSystemAlert[] = [];
    const includeResolved = typeof options === 'boolean' ? options : Boolean(options?.includeResolved);

    // 1. Pending Approvals from Inbox (Active vs Resolved)
    for (const pa of state.inbox_items || []) {
      if (pa.category === 'APPROVAL') {
        const isPending = pa.status === 'PENDING';
        if (isPending) {
          if (!dismissedIds.has(`alert-appr-${pa.id}`)) {
            alerts.push({
              id: `alert-appr-${pa.id}`,
              type: 'APPROVAL_REQUIRED',
              severity: 'CRITICAL',
              title: pa.subject,
              message: `${pa.sender}: ${pa.content.slice(0, 120)}...`,
              timestamp: pa.time || pa.date,
              is_read: Boolean(pa.isRead),
              status: 'PENDING',
              source_ref: pa.id,
              source_type: 'INBOX',
              actionLink: `/backoffice/inbox?id=${pa.id}`,
              actionLabel: 'Review in Inbox'
            });
          }
        } else if (includeResolved) {
          alerts.push({
            id: `alert-appr-${pa.id}`,
            type: 'APPROVAL_REQUIRED',
            severity: 'INFO',
            title: `Resolved: ${pa.subject}`,
            message: `${pa.action_performed_by || 'Approver'} marked as ${pa.status} on ${pa.action_performed_at || pa.updated_at || 'Recent'}`,
            timestamp: pa.action_performed_at || pa.updated_at || 'Recent',
            is_read: true,
            status: pa.status === 'APPROVED' ? 'RESOLVED' : 'ARCHIVED',
            resolved_at: pa.action_performed_at,
            source_ref: pa.id,
            source_type: 'INBOX',
            actionLink: `/backoffice/inbox?id=${pa.id}`,
            actionLabel: 'View Audit'
          });
        }
      }
    }

    // 2. Unclosed Expenses pending reconciliation (Active vs Resolved)
    for (const exp of state.expenses || []) {
      const isUnclosed = exp.status === 'UNCLOSED_PENDING_SETTLEMENT' || (Math.abs(exp.paymentDifference || 0) > 0.01 && exp.status !== 'FULLY_CLOSED_RECONCILED');
      if (isUnclosed) {
        if (!dismissedIds.has(`alert-exp-${exp.id}`)) {
          alerts.push({
            id: `alert-exp-${exp.id}`,
            type: 'UNCLOSED_CASE',
            severity: 'WARNING',
            title: `Unclosed Expense Voucher: ${exp.ev}`,
            message: `${exp.payee} - Unsettled variance: $${exp.paymentDifference?.toFixed(2) || '0.00'} (${exp.description})`,
            timestamp: exp.dateOfEv || exp.date,
            is_read: false,
            status: 'PENDING',
            source_ref: exp.id,
            source_type: 'EXPENSE',
            actionLink: `/backoffice/accounting?tab=module2&id=${exp.id}&voucherId=${exp.ev}`,
            actionLabel: 'Reconcile'
          });
        }
      } else if (includeResolved && (exp.status === 'FULLY_CLOSED_RECONCILED' || Math.abs(exp.paymentDifference || 0) < 0.01)) {
        alerts.push({
          id: `alert-exp-${exp.id}`,
          type: 'UNCLOSED_CASE',
          severity: 'INFO',
          title: `Reconciled & Settled: ${exp.ev}`,
          message: `${exp.payee} - Difference settled to $0.00 (${exp.description})`,
          timestamp: exp.posted_at || exp.updated_at || 'Settled',
          is_read: true,
          status: 'RESOLVED',
          resolved_at: exp.posted_at || exp.updated_at,
          source_ref: exp.id,
          source_type: 'EXPENSE',
          actionLink: `/backoffice/accounting?tab=module2&id=${exp.id}&voucherId=${exp.ev}`,
          actionLabel: 'View Reconciled'
        });
      }
    }

    // 3. Security / Void Alerts
    for (const sec of state.inbox_items || []) {
      if (sec.category === 'ALERT') {
        const isPending = sec.status === 'PENDING';
        if (isPending) {
          if (!dismissedIds.has(`alert-sec-${sec.id}`)) {
            alerts.push({
              id: `alert-sec-${sec.id}`,
              type: 'SECURITY_ALERT',
              severity: 'WARNING',
              title: sec.subject,
              message: `${sec.sender} (${sec.branch}): ${sec.content.slice(0, 120)}...`,
              timestamp: sec.time || sec.date,
              is_read: Boolean(sec.isRead),
              status: 'PENDING',
              source_ref: sec.id,
              source_type: 'INBOX',
              actionLink: `/backoffice/inbox?id=${sec.id}`,
              actionLabel: 'Inspect Void'
            });
          }
        } else if (includeResolved) {
          alerts.push({
            id: `alert-sec-${sec.id}`,
            type: 'SECURITY_ALERT',
            severity: 'INFO',
            title: `Resolved Alert: ${sec.subject}`,
            message: `Audited by ${sec.action_performed_by || 'Security'} on ${sec.action_performed_at || sec.updated_at || 'Recent'}`,
            timestamp: sec.action_performed_at || sec.updated_at || 'Recent',
            is_read: true,
            status: 'RESOLVED',
            resolved_at: sec.action_performed_at,
            source_ref: sec.id,
            source_type: 'INBOX',
            actionLink: `/backoffice/inbox?id=${sec.id}`,
            actionLabel: 'Audit Record'
          });
        }
      }
    }

    // 4. Also append any dynamic system alerts recorded directly in state.system_alerts
    if (state.system_alerts) {
      for (const sa of state.system_alerts) {
        if (!alerts.some((a) => a.id === sa.id)) {
          if (sa.status === 'PENDING') {
            if (!dismissedIds.has(sa.id)) {
              alerts.push(sa);
            }
          } else if (includeResolved) {
            alerts.push(sa);
          }
        }
      }
    }

    // 5. Search Filter (if applied)
    let filteredAlerts = alerts;
    if (typeof options === 'object' && options?.search) {
      const q = options.search.toLowerCase().trim();
      filteredAlerts = filteredAlerts.filter(
        (a) => a.title.toLowerCase().includes(q) || a.message.toLowerCase().includes(q)
      );
    }

    // Sort descending by timestamp
    filteredAlerts.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

    const pendingApprovalsCount = (state.inbox_items || []).filter(
      (m) => m.category === 'APPROVAL' && m.status === 'PENDING'
    ).length;
    const unreadInboxCount = (state.inbox_items || []).filter((m) => !m.isRead).length;
    const activeAlertsCount = alerts.filter(
      (a) => a.status === 'PENDING' && !a.is_read && !dismissedIds.has(a.id)
    ).length;

    return {
      alerts: filteredAlerts,
      pendingApprovalsCount,
      unreadInboxCount,
      activeAlertsCount
    };
  }

  /**
   * High-Performance Concurrent Supabase Reconciler:
   * Executes concurrent queries across accounts, vouchers, expenses, and inbox items
   * using Promise.all to eliminate sequential waterfalls and prime the local-first cache.
   */
  public static async reconcileAllFromSupabaseConcurrently(timeoutMs = 3500): Promise<{
    syncedAccounts: number;
    syncedVouchers: number;
    syncedExpenses: number;
    syncedInbox: number;
  }> {
    const timeoutPromise = new Promise<{ timeout: true }>((resolve) =>
      setTimeout(() => resolve({ timeout: true }), timeoutMs)
    );

    const accountsTask = supabase.from('acc_accounts').select('*');
    const vouchersTask = supabase.from('acc_journal_vouchers').select('*, lines:acc_journal_voucher_lines(*)');
    const expensesTask = supabase.from('acc_expense_vouchers').select('*');
    const inboxTask = supabase.from('acc_inbox_items').select('*');

    try {
      const result = await Promise.race([
        Promise.all([accountsTask, vouchersTask, expensesTask, inboxTask]),
        timeoutPromise
      ]);

      if ('timeout' in result) {
        return { syncedAccounts: 0, syncedVouchers: 0, syncedExpenses: 0, syncedInbox: 0 };
      }

      const [accRes, vRes, expRes, inboxRes] = result;
      const currentState = ensureDbFileExists();
      let mutated = false;

      // 1. Concurrent Accounts Ingestion
      let accCount = 0;
      if (!accRes.error && Array.isArray(accRes.data)) {
        for (const a of accRes.data) {
          const idx = currentState.accounts.findIndex(
            (local) => local.id === a.id || local.account_number === a.account_number
          );
          if (idx === -1) {
            currentState.accounts.push(normalizeAccount(a));
            mutated = true;
            accCount++;
          }
        }
      }

      // 2. Concurrent Vouchers Ingestion
      let vCount = 0;
      if (!vRes.error && Array.isArray(vRes.data)) {
        for (const v of vRes.data) {
          const exists = currentState.vouchers.some(
            (local) => local.id === v.id || local.jv_number === v.jv_number
          );
          if (!exists) {
            currentState.vouchers.unshift({
              id: v.id,
              tenant_id: v.tenant_id,
              jv_number: v.jv_number,
              date_of_jv: v.date_of_jv,
              jv_type: v.jv_type,
              currency_id: v.currency_id,
              doc_ref_number: v.doc_ref_number,
              description: v.description,
              internal_remark: v.internal_remark,
              department: v.department,
              sub_department: v.sub_department,
              total_debit: Number(v.total_debit) || 0,
              total_credit: Number(v.total_credit) || 0,
              is_posted: Boolean(v.is_posted),
              posted_at: v.posted_at,
              posted_by: v.posted_by,
              created_by: v.created_by,
              lines: Array.isArray(v.lines) ? v.lines : []
            });
            mutated = true;
            vCount++;
          }
        }
      }

      // 3. Concurrent Expenses Ingestion
      let expCount = 0;
      if (!expRes.error && Array.isArray(expRes.data)) {
        if (!currentState.expenses) currentState.expenses = [];
        for (const exp of expRes.data) {
          const exists = currentState.expenses.some(
            (local) => local.id === exp.id || local.ev === exp.ev_number
          );
          if (!exists) {
            currentState.expenses.unshift({
              id: exp.id,
              tenant_id: exp.tenant_id,
              payee: exp.payee,
              reference: exp.reference,
              date: exp.date_of_ev,
              ev: exp.ev_number,
              dateOfEv: exp.date_of_ev,
              amount: Number(exp.amount) || 0,
              totalDisbursed: Number(exp.total_disbursed) || 0,
              paymentDifference: Number(exp.payment_difference) || 0,
              description: exp.description,
              enteredBy: exp.created_by || 'Super Admin',
              department: exp.purchase_dept || 'Main Department',
              posted: Boolean(exp.is_posted),
              status: exp.status,
              purchaseAccountId: exp.purchase_account_id || '',
              purchaseDept: exp.purchase_dept || 'Main Department',
              purchaseRef: exp.reference || '',
              supportingDocUrl: exp.supporting_doc_url,
              expenseRows: [],
              paymentRows: [],
              created_at: exp.created_at || new Date().toISOString(),
              updated_at: exp.updated_at || new Date().toISOString()
            });
            mutated = true;
            expCount++;
          }
        }
      }

      // 4. Concurrent Inbox Items Ingestion
      let inboxCount = 0;
      if (!inboxRes.error && Array.isArray(inboxRes.data)) {
        if (!currentState.inbox_items) currentState.inbox_items = [];
        for (const item of inboxRes.data) {
          const exists = currentState.inbox_items.some((local) => local.id === item.id);
          if (!exists) {
            currentState.inbox_items.unshift(item);
            mutated = true;
            inboxCount++;
          }
        }
      }

      if (mutated) {
        writeDbState(currentState);
      }

      return {
        syncedAccounts: accCount,
        syncedVouchers: vCount,
        syncedExpenses: expCount,
        syncedInbox: inboxCount
      };
    } catch (e) {
      return { syncedAccounts: 0, syncedVouchers: 0, syncedExpenses: 0, syncedInbox: 0 };
    }
  }
}

// Convenience Functional Exports for Modular Repositories
export const getAccounts = ServerAccountingStorage.getAccounts.bind(ServerAccountingStorage);
export const saveAccount = ServerAccountingStorage.saveAccount.bind(ServerAccountingStorage);
export const getVouchers = ServerAccountingStorage.getVouchers.bind(ServerAccountingStorage);
export const getVouchersByType = ServerAccountingStorage.getVouchersByType.bind(ServerAccountingStorage);
export const saveVoucherTransaction = ServerAccountingStorage.saveVoucherTransaction.bind(ServerAccountingStorage);
export const togglePostVoucher = ServerAccountingStorage.togglePostVoucher.bind(ServerAccountingStorage);
export const postAllVouchers = ServerAccountingStorage.postAllVouchers.bind(ServerAccountingStorage);
export const savePaymentVoucher = ServerAccountingStorage.savePaymentVoucher.bind(ServerAccountingStorage);
export const saveReceiptVoucher = ServerAccountingStorage.saveReceiptVoucher.bind(ServerAccountingStorage);
export const saveContraVoucher = ServerAccountingStorage.saveContraVoucher.bind(ServerAccountingStorage);
export const getExpenses = ServerAccountingStorage.getExpenses.bind(ServerAccountingStorage);
export const saveExpense = ServerAccountingStorage.saveExpense.bind(ServerAccountingStorage);
export const getInboxItems = ServerAccountingStorage.getInboxItems.bind(ServerAccountingStorage);
export const executeInboxAction = ServerAccountingStorage.executeInboxAction.bind(ServerAccountingStorage);
export const getSystemActivities = ServerAccountingStorage.getSystemActivities.bind(ServerAccountingStorage);
export const getSystemAlerts = ServerAccountingStorage.getSystemAlerts.bind(ServerAccountingStorage);
export const dismissAlert = ServerAccountingStorage.dismissAlert.bind(ServerAccountingStorage);
export const markAllAlertsAsRead = ServerAccountingStorage.markAllAlertsAsRead.bind(ServerAccountingStorage);

