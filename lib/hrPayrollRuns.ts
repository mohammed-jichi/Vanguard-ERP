'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTenant } from '@/lib/TenantContext';
import { resolveTenantUuid } from '@/lib/productCatalogService';
import { getTenantExchangeRate } from '@/lib/currencyEngine';
import { HREmployeeRecord } from '@/lib/hrPersonnelService';
import { EarningDeductionLabel, PaymentSetting, PayrollRun, baseSalaryIn, settingMonthlyUsd } from '@/lib/hrPayrollData';

export function usePayrollRuns() {
  const { currentTenant } = useTenant();
  const tenantUuid = resolveTenantUuid(currentTenant);
  const rate = getTenantExchangeRate(currentTenant);
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storage, setStorage] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hr/payroll-runs?id=${encodeURIComponent(tenantUuid)}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Could not load payroll runs');
      setRuns(json.runs || []);
      setStorage(json.storage || '');
      setError(null);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [tenantUuid]);

  useEffect(() => {
    reload();
  }, [reload]);

  const saveRun = useCallback(
    async (run: PayrollRun): Promise<{ ok: boolean; message: string }> => {
      try {
        const res = await fetch('/api/hr/payroll-runs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: tenantUuid, run }) });
        const json = await res.json();
        if (!res.ok || !json.success) return { ok: false, message: json.error || 'Save failed' };
        await reload();
        return { ok: true, message: json.storage === 'tenant_settings' ? 'Saved (stored in tenant settings until public.hr_payroll_runs is created).' : 'Saved.' };
      } catch (e: any) {
        return { ok: false, message: e?.message || String(e) };
      }
    },
    [tenantUuid, reload]
  );

  const deleteRun = useCallback(
    async (runId: string) => {
      const res = await fetch(`/api/hr/payroll-runs?id=${encodeURIComponent(tenantUuid)}&runId=${encodeURIComponent(runId)}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) return { ok: false, message: json.error || 'Delete failed' };
      await reload();
      return { ok: true, message: 'Deleted.' };
    },
    [tenantUuid, reload]
  );

  return { runs, loading, error, storage, reload, saveRun, deleteRun, tenantUuid, rate, currentTenant };
}

export interface PayBreakdown {
  base: number;
  earnings: { label: string; amount: number }[];
  deductions: { label: string; amount: number }[];
  employer: { label: string; amount: number }[];
}

/** Applies the tenant's payment settings to one employee; every amount is returned in `currency`. */
export function computeEmployeePay(e: HREmployeeRecord, settings: PaymentSetting[], labels: EarningDeductionLabel[], currency: 'USD' | 'LBP', rate: number): PayBreakdown {
  const baseUsd = baseSalaryIn(e as any, 'USD', rate);
  const toCur = (usd: number) => (currency === 'LBP' ? usd * rate : usd);
  const out: PayBreakdown = { base: baseSalaryIn(e as any, currency, rate), earnings: [], deductions: [], employer: [] };
  settings.forEach((s) => {
    const monthly = settingMonthlyUsd(s, baseUsd);
    if (!monthly) return;
    const amount = toCur(monthly);
    const meta = labels.find((l) => l.description === s.labelName && l.type === s.labelType);
    if (s.labelType === 'Earnings') out.earnings.push({ label: s.labelName, amount });
    else if (meta?.employerContribution) out.employer.push({ label: s.labelName, amount });
    else out.deductions.push({ label: s.labelName, amount });
  });
  return out;
}
