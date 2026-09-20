// ==============================================================================
// Vanguard ERP: Client-Side Accounting Persistence Service
// Connects React UI modules to real asynchronous database mutations,
// provides optimistic updates, event-based revalidation, and persistent sync.
// Supports generic and modular mutations for Journal, Payment, Receipt, and Contra Vouchers.
// ==============================================================================

import {
  AccountDetail,
  JournalVoucher,
  JVLine,
  getLocalAccounts,
  saveLocalAccounts,
  getLocalJVs,
  saveLocalJVs,
  normalizeAccount,
  VoucherType
} from './accountingData';
import { PersistedExpenseRecord } from './serverAccountingStorage';
import {
  PaymentVoucherMutationInput,
  ReceiptVoucherMutationInput,
  ContraVoucherMutationInput,
  GenericVoucherInput
} from './voucherMutationEngine';

export const ACCOUNTING_SYNC_EVENT = 'vanguard_accounting_sync';

export function notifyAccountingSync(payload?: {
  type: 'VOUCHER_SAVED' | 'ACCOUNT_SAVED' | 'EXPENSE_SAVED' | 'VOUCHER_DELETED';
  data?: any;
}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(ACCOUNTING_SYNC_EVENT, { detail: payload })
    );
  }
}

export function subscribeToAccountingSync(callback: (event: CustomEvent) => void) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => callback(e as CustomEvent);
  window.addEventListener(ACCOUNTING_SYNC_EVENT, handler);
  return () => window.removeEventListener(ACCOUNTING_SYNC_EVENT, handler);
}

function syncVoucherToLocalCache(
  savedVoucher: JournalVoucher,
  updatedAccounts?: AccountDetail[]
) {
  // 1. Update local JVs cache
  const currentJvs = getLocalJVs();
  const existingIdx = currentJvs.findIndex(
    (v) => v.id === savedVoucher.id || v.jv_number === savedVoucher.jv_number
  );
  let updatedJvs: JournalVoucher[];
  if (existingIdx >= 0) {
    updatedJvs = [...currentJvs];
    updatedJvs[existingIdx] = savedVoucher;
  } else {
    updatedJvs = [savedVoucher, ...currentJvs];
  }
  saveLocalJVs(updatedJvs);

  // 2. If accounts were updated by GL entries, update local accounts cache
  if (updatedAccounts && Array.isArray(updatedAccounts)) {
    const currentAccounts = getLocalAccounts();
    const accountsMap = new Map(currentAccounts.map((a) => [a.id, a]));
    for (const updatedAcc of updatedAccounts) {
      accountsMap.set(updatedAcc.id, normalizeAccount(updatedAcc));
    }
    saveLocalAccounts(Array.from(accountsMap.values()));
  }
}

// =============================================================================
// 1. ACCOUNTS PERSISTENCE
// =============================================================================
export async function apiFetchAccounts(type?: string): Promise<AccountDetail[]> {
  try {
    const url = type
      ? `/api/accounting/accounts?type=${encodeURIComponent(type)}`
      : '/api/accounting/accounts';
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const normalized = json.data.map(normalizeAccount);
      saveLocalAccounts(normalized);
      return normalized;
    }
  } catch (err) {
    console.warn('[apiFetchAccounts] Falling back to local cache:', err);
  }
  return getLocalAccounts();
}

export async function apiCreateAccount(
  account: Partial<AccountDetail> & { account_number: string; account_name: string }
): Promise<{ success: boolean; account: AccountDetail; error?: string }> {
  try {
    const res = await fetch('/api/accounting/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to save account');
    }

    const saved = normalizeAccount(json.data);

    // Update local cache
    const current = getLocalAccounts();
    const idx = current.findIndex((a) => a.account_number === saved.account_number);
    let updated: AccountDetail[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = saved;
    } else {
      updated = [saved, ...current];
    }
    saveLocalAccounts(updated);

    notifyAccountingSync({ type: 'ACCOUNT_SAVED', data: saved });

    return { success: true, account: saved };
  } catch (err: any) {
    console.error('[apiCreateAccount] Persistence failed:', err);
    // Optimistic fallback
    const fallback = normalizeAccount({
      id: account.id || `acc-${Date.now()}`,
      tenant_id: '00000000-0000-0000-0000-000000000001',
      account_number: account.account_number,
      account_name: account.account_name,
      account_name_ar: account.account_name_ar,
      description: account.description,
      class_id: account.class_id || 1,
      sub_class4_id: account.sub_class4_id || 1000,
      account_type: account.account_type || 'ASSET',
      account_sub_type: account.account_sub_type || 'OTHERS',
      type: account.type || 'Other',
      class_type: account.class_type || 'Assets',
      currency_id: account.currency_id || 'USD',
      balance_first_cur: account.balance_first_cur || 0,
      balance_sec_cur: account.balance_sec_cur || 0,
      checking_account: account.checking_account || false,
      is_active: account.is_active !== undefined ? account.is_active : true
    });
    const current = getLocalAccounts();
    saveLocalAccounts([fallback, ...current]);
    return { success: true, account: fallback };
  }
}

// =============================================================================
// 2. VOUCHER QUERIES (GENERIC & MODULAR)
// =============================================================================
export async function apiFetchVouchers(filters?: {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  jvType?: string;
  type?: string;
}): Promise<JournalVoucher[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.set('dateTo', filters.dateTo);
    const typeParam = filters?.type || filters?.jvType;
    if (typeParam) params.set('type', typeParam);

    const res = await fetch(`/api/accounting/vouchers?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      saveLocalJVs(json.data);
      return json.data;
    }
  } catch (err) {
    console.warn('[apiFetchVouchers] Falling back to local cache:', err);
  }
  return getLocalJVs();
}

export async function apiFetchVouchersByType(
  type: VoucherType,
  filters?: { search?: string; status?: string; dateFrom?: string; dateTo?: string }
): Promise<JournalVoucher[]> {
  return apiFetchVouchers({ ...filters, type });
}

// =============================================================================
// 3. GENERIC & MODULAR VOUCHER MUTATIONS
// =============================================================================

// Standard Generic Voucher Mutation (Journal Vouchers, Multi-line Adjustments, etc.)
export async function apiSaveVoucher(args: {
  voucher: Partial<JournalVoucher>;
  lines: JVLine[];
  postImmediately: boolean;
  user?: string;
}): Promise<{
  success: boolean;
  voucher: JournalVoucher;
  updatedAccounts?: AccountDetail[];
  message: string;
}> {
  const res = await fetch('/api/accounting/vouchers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args)
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to persist journal voucher');
  }

  const savedVoucher: JournalVoucher = json.data;
  syncVoucherToLocalCache(savedVoucher, json.updatedAccounts);
  notifyAccountingSync({ type: 'VOUCHER_SAVED', data: savedVoucher });

  return {
    success: true,
    voucher: savedVoucher,
    updatedAccounts: json.updatedAccounts,
    message: json.message
  };
}

export const apiSaveGenericVoucher = apiSaveVoucher;

// Modular Payment Voucher (PV) Mutation
export async function apiSavePaymentVoucher(
  payload: PaymentVoucherMutationInput
): Promise<{
  success: boolean;
  voucher: JournalVoucher;
  updatedAccounts?: AccountDetail[];
  message: string;
}> {
  const res = await fetch('/api/accounting/vouchers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'SAVE_PAYMENT',
      payload
    })
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to persist payment voucher');
  }

  const savedVoucher: JournalVoucher = json.data;
  syncVoucherToLocalCache(savedVoucher, json.updatedAccounts);
  notifyAccountingSync({ type: 'VOUCHER_SAVED', data: savedVoucher });

  return {
    success: true,
    voucher: savedVoucher,
    updatedAccounts: json.updatedAccounts,
    message: json.message
  };
}

// Modular Receipt Voucher (RV) Mutation
export async function apiSaveReceiptVoucher(
  payload: ReceiptVoucherMutationInput
): Promise<{
  success: boolean;
  voucher: JournalVoucher;
  updatedAccounts?: AccountDetail[];
  message: string;
}> {
  const res = await fetch('/api/accounting/vouchers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'SAVE_RECEIPT',
      payload
    })
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to persist receipt voucher');
  }

  const savedVoucher: JournalVoucher = json.data;
  syncVoucherToLocalCache(savedVoucher, json.updatedAccounts);
  notifyAccountingSync({ type: 'VOUCHER_SAVED', data: savedVoucher });

  return {
    success: true,
    voucher: savedVoucher,
    updatedAccounts: json.updatedAccounts,
    message: json.message
  };
}

// Modular Contra Voucher (CV) Mutation
export async function apiSaveContraVoucher(
  payload: ContraVoucherMutationInput
): Promise<{
  success: boolean;
  voucher: JournalVoucher;
  updatedAccounts?: AccountDetail[];
  message: string;
}> {
  const res = await fetch('/api/accounting/vouchers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'SAVE_CONTRA',
      payload
    })
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to persist contra voucher');
  }

  const savedVoucher: JournalVoucher = json.data;
  syncVoucherToLocalCache(savedVoucher, json.updatedAccounts);
  notifyAccountingSync({ type: 'VOUCHER_SAVED', data: savedVoucher });

  return {
    success: true,
    voucher: savedVoucher,
    updatedAccounts: json.updatedAccounts,
    message: json.message
  };
}

export async function apiDeleteVoucher(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/accounting/vouchers?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (json.success) {
      const current = getLocalJVs().filter((v) => v.id !== id);
      saveLocalJVs(current);
      notifyAccountingSync({ type: 'VOUCHER_DELETED', data: { id } });
      return true;
    }
  } catch (err) {
    console.error('[apiDeleteVoucher] Error:', err);
  }
  return false;
}

// =============================================================================
// 4. EXPENSES REPOSITORY (Module 2 Lifecycle)
// =============================================================================
export async function apiFetchExpenses(): Promise<PersistedExpenseRecord[]> {
  try {
    const res = await fetch('/api/accounting/expenses', {
      method: 'GET',
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn('[apiFetchExpenses] Error:', err);
  }
  return [];
}

export async function apiSaveExpense(
  expense: Partial<PersistedExpenseRecord> & { description: string; amount: number }
): Promise<{ success: boolean; data: PersistedExpenseRecord; message: string }> {
  const res = await fetch('/api/accounting/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense)
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to persist expense voucher');
  }

  notifyAccountingSync({ type: 'EXPENSE_SAVED', data: json.data });

  return {
    success: true,
    data: json.data,
    message: json.message
  };
}
