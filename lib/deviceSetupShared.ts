'use client';

/**
 * Shared helpers for Sales device setup screens (Screens, Device Preferences, Call Center Zones).
 * Tenant-scoped data lives in tenants.feature_flags via /api/tenant-flags.
 */
import { useEffect, useMemo, useState } from 'react';
import { useTenant } from '@/lib/TenantContext';
import { fetchCatalogRows, resolveTenantUuid } from '@/lib/productCatalogService';

export const OFFICIAL_BRANCH_CODE = '1300-01';
export const OFFICIAL_BRANCH_NAME = 'Southern Olive and Oil Products S.A.R.L.';
export const OFFICIAL_BRANCH_LABEL = `${OFFICIAL_BRANCH_CODE} - ${OFFICIAL_BRANCH_NAME}`;

/** Single official tenant branch in the legacy { BRANCHID, BARANCHNAME } shape used by the setup screens. */
export const OFFICIAL_BRANCHES: { BRANCHID: number; BARANCHNAME: string }[] = [
  { BRANCHID: 1, BARANCHNAME: OFFICIAL_BRANCH_LABEL }
];

/** Normalises any legacy hardcoded branch label to the official one. */
export function normalizeBranchName(name?: string | null): string {
  if (!name || /zeit|zaytoun|main branch|^1300\s*-/i.test(name)) return OFFICIAL_BRANCH_LABEL;
  return name;
}

/**
 * SuperSonic Hub corridors. SuperSonic (app/api/orders/route.ts CORRIDOR_FLEET_PRESETS) keeps these as
 * code constants keyed by numeric corridor id; zones reference them through CORRIDOR_ID so Sales and Dispatch agree.
 */
export const SUPERSONIC_CORRIDORS: { id: number; name: string }[] = [
  { id: 1, name: 'Corridor 1: Greater Beirut & Coast' },
  { id: 2, name: 'Corridor 2: Mount Lebanon & Chouf' },
  { id: 3, name: 'Corridor 3: Southern Coast & Deep South' },
  { id: 4, name: 'Corridor 4: Northern Coast to Batroun' },
  { id: 5, name: 'Corridor 5: Tripoli & Akkar' },
  { id: 6, name: 'Corridor 6: Bekaa & South-East' },
  { id: 7, name: 'Corridor 7: North Bekaa (Baalbek)' }
];

export async function loadTenantFlags(tenantUuid: string, keys: string[]): Promise<Record<string, any>> {
  try {
    const r = await fetch(`/api/tenant-flags?id=${encodeURIComponent(tenantUuid)}&keys=${encodeURIComponent(keys.join(','))}`);
    const json = await r.json();
    return json?.success && json.flags ? json.flags : {};
  } catch {
    return {};
  }
}

export async function saveTenantFlag(tenantUuid: string, key: string, value: any): Promise<{ success: boolean; error?: string }> {
  try {
    const r = await fetch('/api/tenant-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tenantUuid, key, value })
    });
    const json = await r.json();
    return json?.success ? { success: true } : { success: false, error: json?.error || 'Save failed' };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Save failed' };
  }
}

export interface CatalogLookups {
  groups: { id: number; name: string; category: string }[];
  categories: string[];
  serviceItems: { code: string; name: string; price: number }[];
  loading: boolean;
}

/** Live product categories / groups / service(delivery) items from the tenant's products catalog. */
export function useCatalogLookups(): CatalogLookups {
  const { currentTenant } = useTenant();
  const tenantUuid = resolveTenantUuid(currentTenant);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCatalogRows(tenantUuid)
      .then(({ rows }) => !cancelled && setRows(rows))
      .catch(() => undefined)
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tenantUuid]);

  return useMemo(() => {
    const groupMap = new Map<string, string>();
    const cats: string[] = [];
    const services: { code: string; name: string; price: number }[] = [];
    rows.forEach((r: any) => {
      const rec = r?.record && typeof r.record === 'object' ? r.record : {};
      const g = rec.groupName;
      const c = rec.categoryName;
      if (g && !groupMap.has(g)) groupMap.set(g, c || '');
      if (c && !cats.includes(c)) cats.push(c);
      const name = r?.description || r?.name || rec.description || '';
      const code = r?.sku || rec.code || '';
      const looksDelivery = /deliver|shipping|توصيل|delivery/i.test(`${name} ${g || ''} ${c || ''}`);
      if ((rec.isService || looksDelivery) && code) {
        services.push({ code, name, price: Number(r?.price) || 0 });
      }
    });
    const groups = Array.from(groupMap.entries()).map(([name, category], i) => ({ id: i + 1, name, category }));
    return { groups, categories: cats, serviceItems: services, loading };
  }, [rows, loading]);
}

/** Loads an array flag, falling back to a legacy key when the new key has no data yet. */
export function useTenantListFlag<T>(key: string, legacyKey?: string): { items: T[]; setItems: (v: T[]) => void; loaded: boolean; tenantUuid: string } {
  const { currentTenant } = useTenant();
  const tenantUuid = resolveTenantUuid(currentTenant);
  const [items, setItems] = useState<T[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    loadTenantFlags(tenantUuid, legacyKey ? [key, legacyKey] : [key]).then(flags => {
      if (cancelled) return;
      const v = Array.isArray(flags[key]) ? flags[key] : legacyKey && Array.isArray(flags[legacyKey]) ? flags[legacyKey] : [];
      setItems(v as T[]);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [tenantUuid, key, legacyKey]);
  return { items, setItems, loaded, tenantUuid };
}
