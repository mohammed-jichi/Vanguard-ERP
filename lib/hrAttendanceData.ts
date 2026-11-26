'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTenant } from '@/lib/TenantContext';
import { resolveTenantUuid } from '@/lib/productCatalogService';

export interface AttendanceLog {
  id: string;
  employeeId: string;
  employeeName: string;
  brand: string;
  branch: string;
  punchIn: string;
  punchOut: string | null;
  durationHours: number;
  source: string;
}

export function useAttendanceLogs() {
  const { currentTenant } = useTenant();
  const tenantUuid = resolveTenantUuid(currentTenant);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storage, setStorage] = useState<string>('');

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hr/attendance-logs?id=${encodeURIComponent(tenantUuid)}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Could not load attendance logs');
      setLogs(json.logs || []);
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

  const importRows = useCallback(
    async (rows: any[]): Promise<{ ok: boolean; message: string }> => {
      try {
        const res = await fetch('/api/hr/attendance-logs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: tenantUuid, rows }) });
        const json = await res.json();
        if (!res.ok || !json.success) return { ok: false, message: json.error || 'Import failed' };
        await reload();
        return { ok: true, message: `Imported ${json.imported} punch record(s)${json.storage === 'tenant_settings' ? ' (stored in tenant settings until public.hr_attendance_logs is created)' : ''}.` };
      } catch (e: any) {
        return { ok: false, message: e?.message || String(e) };
      }
    },
    [tenantUuid, reload]
  );

  return { logs, loading, error, storage, reload, importRows, tenantUuid };
}
