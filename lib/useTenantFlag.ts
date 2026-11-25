'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTenant } from '@/lib/TenantContext';
import { resolveTenantUuid } from '@/lib/productCatalogService';

/**
 * Tenant-scoped persisted configuration (tenants.feature_flags[key]) with debounced saves.
 * Returns [value, setValue, status]. status.error carries the last load/save failure so screens can toast it.
 */
export function useTenantFlag<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void, { loading: boolean; error: string | null; saving: boolean }] {
  const { currentTenant } = useTenant();
  const tenantUuid = resolveTenantUuid(currentTenant);
  const [value, setValueState] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<T>(fallback);
  const loaded = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loaded.current = false;
    setLoading(true);
    fetch(`/api/tenant-flags?id=${encodeURIComponent(tenantUuid)}&keys=${encodeURIComponent(key)}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.success) {
          setError(json.error || 'Could not load settings');
        } else if (json.flags && json.flags[key] !== undefined) {
          latest.current = json.flags[key] as T;
          setValueState(json.flags[key] as T);
        }
      })
      .catch((e) => !cancelled && setError(e?.message || 'Could not load settings'))
      .finally(() => {
        if (!cancelled) {
          loaded.current = true;
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tenantUuid, key]);

  const persist = useCallback(() => {
    setSaving(true);
    fetch('/api/tenant-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tenantUuid, key, value: latest.current })
    })
      .then((r) => r.json())
      .then((json) => setError(json.success ? null : json.error || 'Save failed'))
      .catch((e) => setError(e?.message || 'Save failed'))
      .finally(() => setSaving(false));
  }, [tenantUuid, key]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(latest.current) : next;
      latest.current = resolved;
      setValueState(resolved);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(persist, 500);
    },
    [persist]
  );

  return [value, setValue, { loading, error, saving }];
}
