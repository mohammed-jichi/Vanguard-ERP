'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTenant } from '@/lib/TenantContext';
import { HRPersonnelService, HREmployeeRecord } from '@/lib/hrPersonnelService';
import { useTenantFlag } from '@/lib/useTenantFlag';

export interface HrLookupItem {
  id: string;
  name: string;
  sortOrder: number;
}

export type TimeOffStatus = 'Pending' | 'Approved' | 'Rejected';

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  type: 'Full Day' | 'Partial';
  hoursOff?: number;
  paid: 'Yes' | 'No';
  notes: string;
  status: TimeOffStatus;
  createdAt: string;
  decidedAt?: string;
}

export const TIME_OFF_REASONS = [
  'Annual leave',
  'Sick leave',
  'Maternity leave',
  'Medical appointment',
  'Personal leave',
  'Family emergency',
  'Force majeure',
  'Leave without pay',
  'Marriage leave',
  'Bereavement',
  'Work-related injury leave',
  'Relocation or transport disruption'
];

export const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const daysInclusive = (a: string, b: string) => {
  if (!a || !b) return 0;
  const s = new Date(`${a}T00:00:00`);
  const e = new Date(`${b}T00:00:00`);
  return Math.max(0, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
};

/** Total hours in a label such as "08:00 - 16:30" or "07:00 - 11:00, 12:00 - 16:00". */
export function shiftHours(label: string): number {
  const rx = /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/g;
  let total = 0;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(label || ''))) {
    let diff = Number(m[3]) * 60 + Number(m[4]) - (Number(m[1]) * 60 + Number(m[2]));
    if (diff < 0) diff += 24 * 60;
    total += diff / 60;
  }
  return Math.round(total * 100) / 100;
}

export function shortShift(label: string): string {
  return (label || '').replace(/(\d{1,2}):00/g, '$1').replace(/\s*-\s*/g, '-').replace(/\b0(\d)/g, '$1');
}

export function templateTiming(name?: string): string {
  const m = /\((\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})\)/.exec(name || '');
  return m ? m[1] : '';
}

export interface DayStatus {
  status: 'working' | 'off' | 'leave' | 'none';
  label: string;
  hours: number;
}

/** Resolves an employee's status on one date from their saved schedule, day-offs and approved time-off requests. */
export function dayStatus(emp: HREmployeeRecord, date: string, timeOff: TimeOffRequest[]): DayStatus {
  const onLeave =
    timeOff.some((r) => r.status === 'Approved' && r.employeeId === emp.id && r.startDate <= date && date <= r.endDate) ||
    (emp.schedule?.daysOff || []).some((d) => d.approved !== false && d.startDate <= date && date <= d.endDate);
  if (onLeave) return { status: 'leave', label: 'LEAVE', hours: 0 };

  const cfg = emp.schedule_config || emp.schedule;
  if (!cfg) return { status: 'none', label: '', hours: 0 };

  const override = cfg.dateOverrides?.[date];
  if (override) {
    return /off/i.test(override) ? { status: 'off', label: 'OFF', hours: 0 } : { status: 'working', label: override, hours: shiftHours(override) };
  }

  const dow = DOW[new Date(`${date}T00:00:00`).getDay()];
  if (cfg.offDays?.includes(dow)) return { status: 'off', label: 'OFF', hours: 0 };
  const isWorkDay = cfg.workDays && cfg.workDays.length ? cfg.workDays.includes(dow) : dow !== 'Sun';
  if (!isWorkDay) return { status: 'off', label: 'OFF', hours: 0 };

  const slots = cfg.weeklySlots?.[dow];
  const label = slots && slots.length ? slots.map((s) => `${s.start} - ${s.end}`).join(', ') : templateTiming(cfg.templateName);
  return { status: 'working', label: label || 'Scheduled', hours: shiftHours(label) };
}

/** Live employees for the active tenant (public.employees + saved HR detail). */
export function useHrEmployees() {
  const { currentTenant } = useTenant();
  HRPersonnelService.setTenantId(currentTenant?.id);
  const [employees, setEmployees] = useState<HREmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const list = await HRPersonnelService.fetchEmployees();
      setEmployees(Array.isArray(list) ? list : []);
    } catch {
      setEmployees(HRPersonnelService.getEmployees());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTenant?.id]);

  return { employees, loading, reload };
}

/** Tenant-defined departments / designations / roles (used by the employee modal and schedule screens). */
export function useHrLookups() {
  const [departments] = useTenantFlag<HrLookupItem[]>('hr_departments', []);
  const [designations] = useTenantFlag<HrLookupItem[]>('hr_designations', []);
  const [roles] = useTenantFlag<HrLookupItem[]>('hr_roles', []);
  const names = (list: HrLookupItem[]) => [...list].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.name.localeCompare(b.name)).map((i) => i.name);
  return useMemo(
    () => ({ departments: names(departments), designations: names(designations), roles: names(roles) }),
    [departments, designations, roles]
  );
}
