'use client';

/**
 * Configurable Company Settlement Accounts Store
 * Southern Olive and Oil Products S.A.R.L.
 * 
 * Manages receiving bank accounts (for Card merchant settlements, Bank Transfers, and Checks)
 * and digital wallet accounts (Whish Money) with persistent localStorage synchronization,
 * strict currency awareness (USD vs LBP), free-text flexibility, and bidirectional General Ledger (GL) mapping.
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
  glAccountCode: string; // e.g., '51410', '51411', '1030'
  isDefault?: boolean;
}

export const COMPANY_BANK_ACCOUNTS_KEY = 'vanguard_company_bank_accounts';
export const COMPANY_WHISH_ACCOUNTS_KEY = 'vanguard_company_whish_accounts';
export const SETTLEMENT_ACCOUNTS_UPDATED_EVENT = 'vanguard_settlement_accounts_updated';

export const DEFAULT_COMPANY_BANK_ACCOUNTS: CompanyBankAccount[] = [
  {
    id: 'blom_usd',
    bankName: 'BLOM Bank S.A.L.',
    accountName: 'BLOM Bank S.A.L.',
    accountNumber: 'LB12 0014 0000 0000 5122 0002 01',
    currency: 'USD',
    glAccountCode: '51220',
    isDefault: true
  },
  {
    id: 'audi_usd',
    bankName: 'Bank Audi S.A.L.',
    accountName: 'Bank Audi S.A.L.',
    accountNumber: 'LB28 0002 0000 0000 5123 0003 01',
    currency: 'USD',
    glAccountCode: '51230'
  },
  {
    id: 'bob_lbp',
    bankName: 'Bank of Beirut (BOB)',
    accountName: 'Bank of Beirut (BOB)',
    accountNumber: 'LB44 0075 0000 0000 5121 0001 01',
    currency: 'LBP',
    glAccountCode: '51210',
    isDefault: true
  },
  {
    id: 'byblos_usd',
    bankName: 'Byblos Bank S.A.L.',
    accountName: 'Byblos Bank S.A.L.',
    accountNumber: 'LB59 0048 0000 0000 5124 0004 01',
    currency: 'USD',
    glAccountCode: '51240'
  },
  {
    id: 'blom_lbp',
    bankName: 'BLOM Bank S.A.L.',
    accountName: 'BLOM Bank S.A.L.',
    accountNumber: 'LB12 0014 0000 0000 5121 0002 02',
    currency: 'LBP',
    glAccountCode: '51210'
  }
];

export const DEFAULT_COMPANY_WHISH_ACCOUNTS: CompanyWhishAccount[] = [
  {
    id: 'whish_usd',
    walletName: 'Whish Money Merchant Wallet',
    accountNumber: '70 569 641',
    currency: 'USD',
    glAccountCode: '51410',
    isDefault: true
  },
  {
    id: 'whish_lbp',
    walletName: 'Whish Money Operations Wallet',
    accountNumber: '71 892 410',
    currency: 'LBP',
    glAccountCode: '51411',
    isDefault: true
  }
];

/**
 * Strips legacy or accidental (USD) / (LBP) tags to ensure clean labels that never mismatch
 */
export function cleanAccountLabel(label?: string): string {
  if (!label) return '';
  return label
    .replace(/\s*[-–—/]?\s*\((USD|LBP|LL|L\.L\.|US\$|\$)\)/gi, '')
    .replace(/\s*[-–—/]?\s*(USD|LBP|LL|L\.L\.|US\$)$/gi, '')
    .trim();
}

/**
 * Retrieves company bank accounts from persistent storage, strictly filtered by active currency.
 * Automatically cleans any legacy currency tags so USD labels never show in LBP mode or vice versa.
 */
export function getCompanyBankAccounts(currencyFilter?: 'USD' | 'LBP' | string): CompanyBankAccount[] {
  let list: CompanyBankAccount[] = DEFAULT_COMPANY_BANK_ACCOUNTS;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(COMPANY_BANK_ACCOUNTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading company bank accounts:', e);
    }
  }

  // Clean labels to avoid static currency pollution
  const cleaned = list.map((acc) => ({
    ...acc,
    bankName: cleanAccountLabel(acc.bankName || acc.accountName),
    accountName: cleanAccountLabel(acc.accountName || acc.bankName)
  }));

  if (!currencyFilter) return cleaned;

  const targetCurr = (currencyFilter || 'USD').toUpperCase() === 'LBP' ? 'LBP' : 'USD';
  // Strict currency isolation: Never allow USD bank to show when LBP is active, and vice versa
  const filtered = cleaned.filter((b) => b.currency === targetCurr);
  if (filtered.length > 0) return filtered;

  // Fallback defaults strictly for the requested currency
  return DEFAULT_COMPANY_BANK_ACCOUNTS
    .filter((b) => b.currency === targetCurr)
    .map((acc) => ({
      ...acc,
      bankName: cleanAccountLabel(acc.bankName || acc.accountName),
      accountName: cleanAccountLabel(acc.accountName || acc.bankName)
    }));
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
export function updateCompanyBankAccountNumber(idOrName: string, newNumber: string, currency?: 'USD' | 'LBP' | string): CompanyBankAccount[] {
  const current = getCompanyBankAccounts();
  const normCurr = currency ? (currency.toUpperCase() === 'LBP' ? 'LBP' : 'USD') : undefined;
  const cleanNum = newNumber.trim();
  const updated = current.map((acc) => {
    if (acc.id === idOrName || cleanAccountLabel(acc.accountName).toLowerCase() === cleanAccountLabel(idOrName).toLowerCase()) {
      if (!normCurr || acc.currency === normCurr) {
        return { ...acc, accountNumber: cleanNum };
      }
    }
    return acc;
  });
  saveCompanyBankAccounts(updated);
  return updated;
}

/**
 * Retrieves company Whish accounts from persistent storage, strictly filtered by active currency.
 */
export function getCompanyWhishAccounts(currencyFilter?: 'USD' | 'LBP' | string): CompanyWhishAccount[] {
  let list: CompanyWhishAccount[] = DEFAULT_COMPANY_WHISH_ACCOUNTS;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(COMPANY_WHISH_ACCOUNTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading company Whish accounts:', e);
    }
  }

  const cleaned = list.map((acc) => ({
    ...acc,
    walletName: cleanAccountLabel(acc.walletName)
  }));

  if (!currencyFilter) return cleaned;

  const targetCurr = (currencyFilter || 'USD').toUpperCase() === 'LBP' ? 'LBP' : 'USD';
  const filtered = cleaned.filter((w) => w.currency === targetCurr);
  if (filtered.length > 0) return filtered;

  return DEFAULT_COMPANY_WHISH_ACCOUNTS
    .filter((w) => w.currency === targetCurr)
    .map((acc) => ({
      ...acc,
      walletName: cleanAccountLabel(acc.walletName)
    }));
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
export function updateCompanyWhishAccountNumber(idOrName: string, newNumber: string, currency?: 'USD' | 'LBP' | string): CompanyWhishAccount[] {
  const current = getCompanyWhishAccounts();
  const normCurr = currency ? (currency.toUpperCase() === 'LBP' ? 'LBP' : 'USD') : undefined;
  const cleanNum = newNumber.trim();
  const updated = current.map((acc) => {
    if (acc.id === idOrName || cleanAccountLabel(acc.walletName).toLowerCase() === cleanAccountLabel(idOrName).toLowerCase()) {
      if (!normCurr || acc.currency === normCurr) {
        return { ...acc, accountNumber: cleanNum };
      }
    }
    return acc;
  });
  saveCompanyWhishAccounts(updated);
  return updated;
}

/**
 * Retrieves the user's last saved/default account for an active currency (USD vs LBP).
 * Guaranteed to never display a mismatched currency tag or leak USD banks into LBP.
 */
export function getSavedSettlementAccount(
  type: 'BANK' | 'WHISH',
  currency: 'USD' | 'LBP' | string = 'USD'
): { name: string; accountNumber: string; id?: string; glAccountCode?: string } {
  const normCurr = (currency || 'USD').toUpperCase() === 'LBP' ? 'LBP' : 'USD';
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`vanguard_last_used_settlement_${type.toLowerCase()}_${normCurr}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.name || parsed.accountNumber)) {
          return {
            id: parsed.id,
            name: cleanAccountLabel(parsed.name),
            accountNumber: parsed.accountNumber || '',
            glAccountCode: parsed.glAccountCode
          };
        }
      }
    } catch {}
  }

  if (type === 'WHISH') {
    const whishList = getCompanyWhishAccounts(normCurr);
    const def = whishList.find((w) => w.isDefault && w.currency === normCurr) || whishList[0];
    if (def) {
      return {
        id: def.id,
        name: cleanAccountLabel(def.walletName),
        accountNumber: def.accountNumber,
        glAccountCode: def.glAccountCode
      };
    }
    return {
      id: normCurr === 'LBP' ? 'whish_lbp' : 'whish_usd',
      name: normCurr === 'LBP' ? 'Whish Money Operations Wallet' : 'Whish Money Merchant Wallet',
      accountNumber: normCurr === 'LBP' ? '71 892 410' : '70 569 641',
      glAccountCode: normCurr === 'LBP' ? '51411' : '51410'
    };
  }

  // BANK (for Card, Check, or Bank Transfer)
  const bankList = getCompanyBankAccounts(normCurr);
  const def = bankList.find((b) => b.isDefault && b.currency === normCurr) || bankList[0];
  if (def) {
    return {
      id: def.id,
      name: cleanAccountLabel(def.bankName || def.accountName),
      accountNumber: def.accountNumber,
      glAccountCode: def.glAccountCode
    };
  }

  return normCurr === 'LBP'
    ? {
        id: 'bob_lbp',
        name: 'Bank of Beirut (BOB)',
        accountNumber: 'LB44 0075 0000 0000 5121 0001 01',
        glAccountCode: '51210'
      }
    : {
        id: 'blom_usd',
        name: 'BLOM Bank S.A.L.',
        accountNumber: 'LB12 0014 0000 0000 5122 0002 01',
        glAccountCode: '51220'
      };
}

/**
 * Persists a user-typed account name and IBAN / account # into persistent memory for that currency,
 * adding/updating it in the suggestion list and marking it as the active default for that currency.
 */
export function saveOrUpdateSettlementAccount(params: {
  type: 'BANK' | 'WHISH';
  name: string;
  accountNumber: string;
  currency: 'USD' | 'LBP' | string;
  id?: string;
  glAccountCode?: string;
}): void {
  if (typeof window === 'undefined') return;
  const normCurr = (params.currency || 'USD').toUpperCase() === 'LBP' ? 'LBP' : 'USD';
  const cleanName = cleanAccountLabel(params.name);
  const cleanAccNo = (params.accountNumber || '').trim();
  if (!cleanName && !cleanAccNo) return;

  try {
    const glCode =
      params.glAccountCode ||
      (params.type === 'WHISH'
        ? normCurr === 'LBP'
          ? '51411'
          : '51410'
        : normCurr === 'LBP'
        ? '51210'
        : '51220');

    // 1. Save as last used for this currency
    const key = `vanguard_last_used_settlement_${params.type.toLowerCase()}_${normCurr}`;
    localStorage.setItem(
      key,
      JSON.stringify({
        id: params.id || `${params.type.toLowerCase()}_${Date.now()}`,
        name: cleanName,
        accountNumber: cleanAccNo,
        currency: normCurr,
        glAccountCode: glCode
      })
    );

    // 2. Persist in suggestion list so datalist remembers it strictly under this currency
    if (params.type === 'WHISH') {
      const current = getCompanyWhishAccounts();
      const existingIdx = current.findIndex(
        (w) =>
          cleanAccountLabel(w.walletName).toLowerCase() === cleanName.toLowerCase() &&
          w.currency === normCurr
      );
      if (existingIdx >= 0) {
        if (cleanAccNo) current[existingIdx].accountNumber = cleanAccNo;
        current[existingIdx].walletName = cleanName;
        current[existingIdx].currency = normCurr;
        current.forEach((w) => {
          if (w.currency === normCurr) w.isDefault = false;
        });
        current[existingIdx].isDefault = true;
      } else {
        current.forEach((w) => {
          if (w.currency === normCurr) w.isDefault = false;
        });
        current.unshift({
          id: params.id || `whish_custom_${Date.now()}`,
          walletName: cleanName,
          accountNumber: cleanAccNo,
          currency: normCurr,
          glAccountCode: glCode,
          isDefault: true
        });
      }
      saveCompanyWhishAccounts(current);
    } else {
      const current = getCompanyBankAccounts();
      const existingIdx = current.findIndex(
        (b) =>
          (cleanAccountLabel(b.bankName).toLowerCase() === cleanName.toLowerCase() ||
            cleanAccountLabel(b.accountName).toLowerCase() === cleanName.toLowerCase()) &&
          b.currency === normCurr
      );
      if (existingIdx >= 0) {
        if (cleanAccNo) current[existingIdx].accountNumber = cleanAccNo;
        current[existingIdx].bankName = cleanName;
        current[existingIdx].accountName = cleanName;
        current[existingIdx].currency = normCurr;
        current.forEach((b) => {
          if (b.currency === normCurr) b.isDefault = false;
        });
        current[existingIdx].isDefault = true;
      } else {
        current.forEach((b) => {
          if (b.currency === normCurr) b.isDefault = false;
        });
        current.unshift({
          id: params.id || `bank_custom_${Date.now()}`,
          bankName: cleanName,
          accountName: cleanName,
          accountNumber: cleanAccNo,
          currency: normCurr,
          glAccountCode: glCode,
          isDefault: true
        });
      }
      saveCompanyBankAccounts(current);
    }
  } catch (e) {
    console.warn('Error saving settlement account:', e);
  }
}

/**
 * Resolves the General Ledger (GL) account code and account name based on payment method,
 * target company account, custom free-text name, and active transaction currency.
 */
export function resolveSettlementGlAccount(
  paymentMethod: string,
  companyAccountId?: string,
  customAccountName?: string,
  currency?: 'USD' | 'LBP' | string
): { code: string; name: string } {
  const methodUpper = String(paymentMethod || '').toUpperCase();
  const currUpper = String(currency || (methodUpper.includes('LBP') ? 'LBP' : 'USD')).toUpperCase();
  const isLbp = currUpper === 'LBP';

  if (methodUpper.includes('WHISH') || methodUpper.includes('OMT')) {
    const whishAccounts = getCompanyWhishAccounts(isLbp ? 'LBP' : 'USD');
    const cleanCustom = cleanAccountLabel(customAccountName || '');
    const found = companyAccountId
      ? whishAccounts.find((w) => w.id === companyAccountId)
      : cleanCustom
      ? whishAccounts.find((w) => cleanAccountLabel(w.walletName).toLowerCase() === cleanCustom.toLowerCase())
      : undefined;
    const defaultGl = isLbp ? '51411' : '51410';
    const defaultName = isLbp ? 'Whish Money Settlement (LBP) / محفظة ويش موني' : 'Whish Money Settlement (USD) / محفظة ويش موني';
    return {
      code: found?.glAccountCode || defaultGl,
      name: cleanCustom || found?.walletName || defaultName
    };
  }

  if (
    methodUpper.includes('CARD') ||
    methodUpper.includes('VISA') ||
    methodUpper.includes('MASTER') ||
    methodUpper.includes('BANK') ||
    methodUpper.includes('TRANSFER') ||
    methodUpper.includes('CHECK') ||
    methodUpper.includes('CHEQUE')
  ) {
    const bankAccounts = getCompanyBankAccounts(isLbp ? 'LBP' : 'USD');
    const cleanCustom = cleanAccountLabel(customAccountName || '');
    const found = companyAccountId
      ? bankAccounts.find((b) => b.id === companyAccountId)
      : cleanCustom
      ? bankAccounts.find((b) => cleanAccountLabel(b.accountName).toLowerCase() === cleanCustom.toLowerCase() || cleanAccountLabel(b.bankName).toLowerCase() === cleanCustom.toLowerCase())
      : undefined;
    const defaultGl = isLbp ? '51210' : '51220';
    const defaultName = isLbp ? 'Commercial Bank Accounts (LBP)' : 'Commercial Bank Accounts (USD)';
    return {
      code: found?.glAccountCode || defaultGl,
      name: cleanCustom || found?.accountName || found?.bankName || defaultName
    };
  }

  // Default Cash Drawer
  return {
    code: isLbp ? '53110' : '53100',
    name: isLbp ? 'POS Cash Drawer - LBP / صندوق الكاشير ل.ل' : 'POS Cash Drawer - Branch Main / صندوق الكاشير الفرعي'
  };
}
