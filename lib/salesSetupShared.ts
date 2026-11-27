'use client';

/**
 * Shared helpers for the Sales -> Setup screens (Payment Types, Discounts, Modes, Coupons, ...).
 * Owner: Sales Setup part 1. Other screens may import from here.
 */
import { useEffect, useMemo, useState } from 'react';
import { useTenant } from '@/lib/TenantContext';
import { useTenantFlag } from '@/lib/useTenantFlag';
import { apiFetchAccounts } from '@/lib/accountingPersistenceService';
import { OMEGA_ACCOUNTS, OMEGA_CURRENCIES, OmegaCurrency, OmegaPaymentType } from '@/lib/omegaPaymentData';

export const DEFAULT_BRANCH_CODE = '1300-01';
export const DEFAULT_TENANT_LEGAL_NAME = 'Southern Olive and Oil Products S.A.R.L.';

export interface TenantBranch {
  BRANCHID: number;
  /** Official display name: "<tenant name> (<code>)" - used everywhere a branch is shown. */
  BARANCHNAME: string;
  NAME: string;
  CODE: string;
  OTHERNAME: string;
  CITY: string;
  STREET: string;
  PHONE1: string;
  MAINCURRENCY: string;
  SECONDCURRENCY: string;
}

export function officialTenantName(tenant?: any): string {
  const raw = String(tenant?.officialLegalEntityName || tenant?.legalEntityName || tenant?.brandNameEn || tenant?.name || DEFAULT_TENANT_LEGAL_NAME).trim();
  return /S\.A\.R\.L$/i.test(raw) ? `${raw}.` : raw;
}

/** Official tenant branch list (single branch 1300-01 for tenant #1300). */
export function useTenantBranches(): TenantBranch[] {
  const { currentTenant } = useTenant();
  return useMemo(() => {
    const name = officialTenantName(currentTenant);
    const code = DEFAULT_BRANCH_CODE;
    return [
      {
        BRANCHID: 1,
        BARANCHNAME: `${name} (${code})`,
        NAME: name,
        CODE: code,
        OTHERNAME: (currentTenant as any)?.brandNameAr || '',
        CITY: 'Kfarchima',
        STREET: 'Old Saida Road',
        PHONE1: '707673828',
        MAINCURRENCY: '$',
        SECONDCURRENCY: 'LL'
      }
    ];
  }, [currentTenant]);
}

export interface CoaOption {
  account_number: string;
  account_name: string;
  account_type: string;
  currency: string;
}

/** Live Chart of Accounts from Accounting (falls back to the seeded list only when the COA is empty/unreachable). */
export function useChartOfAccounts(): { accounts: CoaOption[]; loading: boolean } {
  const [accounts, setAccounts] = useState<CoaOption[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    apiFetchAccounts()
      .then((list) => {
        if (cancelled) return;
        const mapped: CoaOption[] = (Array.isArray(list) ? list : [])
          .filter((a) => a && a.account_number && a.is_active !== false)
          .map((a) => ({
            account_number: String(a.account_number),
            account_name: String(a.account_name || ''),
            account_type: String(a.type || a.account_sub_type || a.account_type || ''),
            currency: String(a.currency_id || '')
          }))
          .sort((x, y) => x.account_number.localeCompare(y.account_number, undefined, { numeric: true }));
        setAccounts(mapped.length ? mapped : OMEGA_ACCOUNTS);
      })
      .catch(() => !cancelled && setAccounts(OMEGA_ACCOUNTS))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);
  return { accounts, loading };
}

/** Saved records from More Setup -> Message On Invoice (tenants.feature_flags.invoice_messages). */
export interface InvoiceMessageOption {
  MESSAGEID: number;
  MESSAGETITLE: string;
  MESSAGEDESC: string;
  BRANCHID?: number;
}
export function useSavedInvoiceMessages(): InvoiceMessageOption[] {
  const [messages] = useTenantFlag<InvoiceMessageOption[]>('invoice_messages', []);
  return useMemo(() => (Array.isArray(messages) ? messages.filter((m) => m && m.MESSAGETITLE) : []), [messages]);
}

const CURRENCY_CODE_ALIASES: Record<string, string> = {
  'LEBANESE POUND': 'LBP',
  LL: 'LBP',
  'L.B': 'LBP',
  'L.B.P': 'LBP',
  DOLLAR: 'USD',
  $: 'USD',
  EURO: 'EUR',
  EU: 'EUR'
};
export const currencyCode = (c: Pick<OmegaCurrency, 'DESCRIPTION' | 'SYNBOL'>): string => {
  const d = String(c.DESCRIPTION || '').trim().toUpperCase();
  return CURRENCY_CODE_ALIASES[d] || d;
};

/** Duplicate-free currency list, USD first (default), LBP second. */
export function dedupeCurrencies(list: OmegaCurrency[]): OmegaCurrency[] {
  const seen = new Map<string, OmegaCurrency>();
  list.forEach((c) => {
    const k = currencyCode(c);
    if (!seen.has(k)) seen.set(k, c);
  });
  const rank = (c: OmegaCurrency) => {
    const k = currencyCode(c);
    return k === 'USD' ? 0 : k === 'LBP' ? 1 : 2;
  };
  return [...seen.values()].sort((a, b) => rank(a) - rank(b));
}

export function usePaymentCurrencies(): OmegaCurrency[] {
  const [stored] = useTenantFlag<OmegaCurrency[]>('currency_setup', []);
  return useMemo(() => dedupeCurrencies(Array.isArray(stored) && stored.length ? stored : OMEGA_CURRENCIES), [stored]);
}

/** Maps any (possibly duplicate/legacy) currency id to the retained id of the same currency code. */
export function canonicalCurrencyId(id: number, all: OmegaCurrency[], kept: OmegaCurrency[]): number {
  const src = all.find((c) => c.ID === id);
  if (!src) return kept[0]?.ID ?? id;
  return kept.find((c) => currencyCode(c) === currencyCode(src))?.ID ?? id;
}

export const uniqueBy = <T,>(list: T[], key: (item: T) => string): T[] => {
  const seen = new Set<string>();
  return list.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

export const fixCashTypo = (s: string | null | undefined): string => String(s ?? '').replace(/\bcach\b/gi, (m) => (m === m.toUpperCase() ? 'CASH' : m[0] === 'C' ? 'Cash' : 'cash'));

export function normalizePaymentTypes(list: OmegaPaymentType[]): OmegaPaymentType[] {
  if (!Array.isArray(list)) return [];
  return list.map((p) => {
    const name = fixCashTypo(p.PAYMENTTYPE);
    const cv = fixCashTypo(p.CREDITVALUE);
    return name === p.PAYMENTTYPE && cv === p.CREDITVALUE ? p : { ...p, PAYMENTTYPE: name, CREDITVALUE: cv };
  });
}
