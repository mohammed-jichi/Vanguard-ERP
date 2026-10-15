'use client';

/**
 * Configurable Company Settlement Accounts Store
 * Southern Olive and Oil Products S.A.R.L.
 * 
 * Manages receiving bank accounts (for Card merchant settlements, Bank Transfers, and Checks)
 * and digital wallet accounts (Whish Money) with persistent localStorage synchronization and
 * bidirectional General Ledger (GL) account code mapping.
 */

export interface CompanyBankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string; // IBAN or Account Number, editable by user at any time
  currency: 'USD' | 'LBP' | 'ANY';
  glAccountCode: string; // e.g., '51210', '51220', '1010'
  isDefault?: boolean;
}

export interface CompanyWhishAccount {
  id: string;
  walletName: string;
  accountNumber: string; // Whish wallet number / phone, editable by user at any time
  currency: 'USD' | 'LBP' | 'ANY';
  glAccountCode: string; // e.g., '51410', '1030'
  isDefault?: boolean;
}

export const COMPANY_BANK_ACCOUNTS_KEY = 'vanguard_company_bank_accounts';
export const COMPANY_WHISH_ACCOUNTS_KEY = 'vanguard_company_whish_accounts';
export const SETTLEMENT_ACCOUNTS_UPDATED_EVENT = 'vanguard_settlement_accounts_updated';

export const DEFAULT_COMPANY_BANK_ACCOUNTS: CompanyBankAccount[] = [
  {
    id: 'blom_usd',
    bankName: 'BLOM Bank S.A.L.',
    accountName: 'BLOM Bank S.A.L. - Commercial (USD)',
    accountNumber: 'LB12 0014 0000 0000 5122 0002 01',
    currency: 'USD',
    glAccountCode: '51220',
    isDefault: true
  },
  {
    id: 'audi_usd',
    bankName: 'Bank Audi S.A.L.',
    accountName: 'Bank Audi S.A.L. - Corporate Settlement (USD)',
    accountNumber: 'LB28 0002 0000 0000 5123 0003 01',
    currency: 'USD',
    glAccountCode: '51230'
  },
  {
    id: 'bob_lbp',
    bankName: 'Bank of Beirut (BOB)',
    accountName: 'Bank of Beirut - Operations (LBP)',
    accountNumber: 'LB44 0075 0000 0000 5121 0001 01',
    currency: 'LBP',
    glAccountCode: '51210'
  },
  {
    id: 'byblos_usd',
    bankName: 'Byblos Bank S.A.L.',
    accountName: 'Byblos Bank S.A.L. - Trade & Merchant (USD)',
    accountNumber: 'LB59 0048 0000 0000 5124 0004 01',
    currency: 'USD',
    glAccountCode: '51240'
  }
];

export const DEFAULT_COMPANY_WHISH_ACCOUNTS: CompanyWhishAccount[] = [
  {
    id: 'whish_primary',
    walletName: 'Whish Money — Main Merchant Wallet (USD)',
    accountNumber: '70 569 641',
    currency: 'USD',
    glAccountCode: '51410',
    isDefault: true
  },
  {
    id: 'whish_lbp',
    walletName: 'Whish Money — Operations Wallet (LBP)',
    accountNumber: '71 892 410',
    currency: 'LBP',
    glAccountCode: '51411'
  }
];

/**
 * Retrieves all company bank accounts from persistent storage or returns Lebanese defaults.
 */
export function getCompanyBankAccounts(): CompanyBankAccount[] {
  if (typeof window === 'undefined') return DEFAULT_COMPANY_BANK_ACCOUNTS;
  try {
    const raw = localStorage.getItem(COMPANY_BANK_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading company bank accounts:', e);
  }
  return DEFAULT_COMPANY_BANK_ACCOUNTS;
}

/**
 * Persists company bank accounts and dispatches broadcast update event.
 */
export function saveCompanyBankAccounts(accounts: CompanyBankAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COMPANY_BANK_ACCOUNTS_KEY, JSON.stringify(accounts));
    window.dispatchEvent(new CustomEvent(SETTLEMENT_ACCOUNTS_UPDATED_EVENT, { detail: { type: 'BANK', accounts } }));
  } catch (e) {
    console.warn('Error saving company bank accounts:', e);
  }
}

/**
 * Updates a specific bank account's IBAN or account number globally.
 */
export function updateCompanyBankAccountNumber(id: string, newNumber: string): CompanyBankAccount[] {
  const current = getCompanyBankAccounts();
  const updated = current.map((acc) => {
    if (acc.id === id) {
      return { ...acc, accountNumber: newNumber.trim() };
    }
    return acc;
  });
  saveCompanyBankAccounts(updated);
  return updated;
}

/**
 * Retrieves all company Whish accounts from persistent storage or returns defaults.
 */
export function getCompanyWhishAccounts(): CompanyWhishAccount[] {
  if (typeof window === 'undefined') return DEFAULT_COMPANY_WHISH_ACCOUNTS;
  try {
    const raw = localStorage.getItem(COMPANY_WHISH_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading company Whish accounts:', e);
  }
  return DEFAULT_COMPANY_WHISH_ACCOUNTS;
}

/**
 * Persists company Whish accounts and dispatches broadcast update event.
 */
export function saveCompanyWhishAccounts(accounts: CompanyWhishAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COMPANY_WHISH_ACCOUNTS_KEY, JSON.stringify(accounts));
    window.dispatchEvent(new CustomEvent(SETTLEMENT_ACCOUNTS_UPDATED_EVENT, { detail: { type: 'WHISH', accounts } }));
  } catch (e) {
    console.warn('Error saving company Whish accounts:', e);
  }
}

/**
 * Updates a specific Whish wallet phone/number globally.
 */
export function updateCompanyWhishAccountNumber(id: string, newNumber: string): CompanyWhishAccount[] {
  const current = getCompanyWhishAccounts();
  const updated = current.map((acc) => {
    if (acc.id === id) {
      return { ...acc, accountNumber: newNumber.trim() };
    }
    return acc;
  });
  saveCompanyWhishAccounts(updated);
  return updated;
}

/**
 * Resolves the General Ledger (GL) account code and account name based on payment method and target company account.
 */
export function resolveSettlementGlAccount(
  paymentMethod: string,
  companyAccountId?: string
): { code: string; name: string } {
  const methodUpper = String(paymentMethod || '').toUpperCase();

  if (methodUpper.includes('WHISH')) {
    const whishAccounts = getCompanyWhishAccounts();
    const found = companyAccountId ? whishAccounts.find((w) => w.id === companyAccountId) : whishAccounts[0];
    return {
      code: found?.glAccountCode || '51410',
      name: found?.walletName || 'Whish Money Settlement / محفظة ويش موني'
    };
  }

  if (
    methodUpper.includes('CARD') ||
    methodUpper.includes('VISA') ||
    methodUpper.includes('MASTER') ||
    methodUpper.includes('BANK') ||
    methodUpper.includes('TRANSFER') ||
    methodUpper.includes('CHECK')
  ) {
    const bankAccounts = getCompanyBankAccounts();
    const found = companyAccountId ? bankAccounts.find((b) => b.id === companyAccountId) : bankAccounts[0];
    return {
      code: found?.glAccountCode || '51210',
      name: found?.accountName || 'Commercial Bank Accounts (BLOM/Audi/BOB)'
    };
  }

  // Default Cash Drawer
  return {
    code: '53100',
    name: 'POS Cash Drawer - Branch Main / صندوق الكاشير الفرعي'
  };
}
