'use client';

import React, { useMemo, useState, useEffect } from 'react';
import MasterReportDocument from '@/components/reports/MasterReportDocument';
import { ReportMetadata, ReportColumn, GrandTotal } from '@/types/reports';
import { useLanguage } from '@/lib/LanguageContext';
import { executeReportQuery, UniversalFilterPayload } from '@/lib/reports/reportQueryEngine';

export interface TimeAndAttendanceMasterDocumentProps {
  reportKey: string;
  reportTitle?: string;
  code?: string;
  dynamicPeriodText?: string;
  executionDate?: string;
  branch?: string;
  filterValues?: Record<string, any>;
}

type HRReportView = 'labor' | 'punch' | 'exceptions' | 'reconciliation' | 'roster';

/** Values that mean "no restriction" for a dropdown filter. */
function isAllValue(val?: string | null): boolean {
  if (!val) return true;
  const v = String(val).trim().toLowerCase();
  return v === 'all' || v.startsWith('all ');
}

/** Normalises a dropdown value into the `all | <value>` contract expected by the query engine. */
function toQueryValue(val?: string | null): string {
  return isAllValue(val) ? 'all' : String(val);
}

/** Resolves which column layout a given report key renders with. */
export function resolveHRReportView(reportKey: string): HRReportView {
  const key = (reportKey || '').toLowerCase();
  if (key.includes('labor')) return 'labor';
  if (
    key.includes('punch') ||
    key.includes('terminal') ||
    key.includes('zkteco') ||
    key.includes('event stream') ||
    key === 'time and attendance'
  ) {
    return 'punch';
  }
  if (key.includes('exception') || key.includes('lateness') || key.includes('overtime')) return 'exceptions';
  if (key.includes('reconciliation')) return 'reconciliation';
  return 'roster';
}

/**
 * `code` is the document code printed on the sheet; `queryId` is the engine data source.
 * Exceptions and reconciliation are derived views over the attendance punch dataset.
 */
const VIEW_DEFAULTS: Record<HRReportView, { code: string; queryId: string; title: string }> = {
  labor: { code: 'REP_S_00303', queryId: 'REP_S_00303', title: 'Labor Cost & Revenue Allocation' },
  punch: { code: 'REP_S_00302', queryId: 'REP_S_00302', title: 'Time and Attendance Master Punch Ledger' },
  exceptions: { code: 'REP_HR_00102', queryId: 'REP_S_00301', title: 'Overtime, Lateness & Shift Exceptions Log' },
  reconciliation: { code: 'REP_HR_00101', queryId: 'REP_S_00301', title: 'Monthly Payroll & Biometric Attendance Reconciliation' },
  roster: { code: 'REP_S_00301', queryId: 'REP_S_00301', title: 'Employee Attendance & Shift Roster' },
};

// ----------------------------------------------------------------------------
// Shift exception / reconciliation helpers
// ----------------------------------------------------------------------------

const DEFAULT_SHIFT_START_MIN = 8 * 60; // 08:00
const DEFAULT_SHIFT_END_MIN = 17 * 60; // 17:00

/** Parses "07:50 AM", "5:15 pm" or "17:00" into minutes after midnight. */
function parseClockMinutes(raw?: string | null): number | null {
  if (!raw) return null;
  const m = String(raw).trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?$/i);
  if (!m) return null;
  let hours = Number(m[1]);
  const minutes = Number(m[2]);
  const meridiem = m[3]?.toLowerCase();
  if (meridiem === 'pm' && hours < 12) hours += 12;
  if (meridiem === 'am' && hours === 12) hours = 0;
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Reads the assigned shift window from labels like "General Shift (08:00 - 17:00)". */
function parseShiftWindow(shift?: string | null): { start: number; end: number } {
  const m = String(shift || '').match(/(\d{1,2}:\d{2}(?:\s*[ap]m)?)\s*-\s*(\d{1,2}:\d{2}(?:\s*[ap]m)?)/i);
  const start = m ? parseClockMinutes(m[1]) : null;
  const end = m ? parseClockMinutes(m[2]) : null;
  return {
    start: start ?? DEFAULT_SHIFT_START_MIN,
    end: end ?? DEFAULT_SHIFT_END_MIN,
  };
}

interface ShiftAnalysis {
  lateMinutes: number;
  overtimeHours: number;
  workedHours: number;
  hasClockIn: boolean;
  hasClockOut: boolean;
}

/** Lateness = clock-in after assigned shift start; overtime = clock-out after assigned shift end. */
function analyseShift(row: Record<string, any>): ShiftAnalysis {
  const { start, end } = parseShiftWindow(row.shift);
  const inMin = parseClockMinutes(row.clockIn);
  let outMin = parseClockMinutes(row.clockOut);
  if (inMin !== null && outMin !== null && outMin < inMin) outMin += 24 * 60; // overnight punch-out

  const lateMinutes = inMin !== null ? Math.max(0, inMin - start) : 0;
  const overtimeHours = outMin !== null ? Math.max(0, outMin - end) / 60 : 0;
  const computedWorked = inMin !== null && outMin !== null ? (outMin - inMin) / 60 : 0;
  const recordedWorked = Number(row.workedHours);
  const workedHours = row.workedHours != null && Number.isFinite(recordedWorked) ? recordedWorked : computedWorked;

  return {
    lateMinutes,
    overtimeHours: Math.round(overtimeHours * 100) / 100,
    workedHours: Math.round(workedHours * 100) / 100,
    hasClockIn: inMin !== null,
    hasClockOut: outMin !== null,
  };
}

/** Only rows with a lateness or overtime exception, annotated with exception metrics. */
function buildExceptionRows(rows: Record<string, any>[]): Record<string, any>[] {
  return rows
    .map((r) => {
      const a = analyseShift(r);
      const types: string[] = [];
      if (a.lateMinutes > 0) types.push('LATE');
      if (a.overtimeHours > 0) types.push('OVERTIME');
      return {
        ...r,
        lateMinutes: a.lateMinutes,
        overtimeHours: a.overtimeHours,
        lateMinsDisplay: a.lateMinutes > 0 ? String(a.lateMinutes) : '—',
        overtimeHrsDisplay: a.overtimeHours > 0 ? a.overtimeHours.toFixed(2) : '—',
        exceptionType: types.join(' + '),
      };
    })
    .filter((r) => r.exceptionType !== '');
}

/** One summary row per employee for payroll cross-checking. */
function buildReconciliationRows(rows: Record<string, any>[]): Record<string, any>[] {
  // Scheduled days = distinct operating days (any punch recorded) within the filtered period.
  const scheduledDays = new Set(rows.map((r) => r.date).filter(Boolean)).size;

  const byEmp = new Map<string, {
    empId: string; name: string; dept: string;
    days: Set<string>; totalHours: number; overtimeHours: number; lateMinutes: number; missingPunches: number;
  }>();

  for (const r of rows) {
    const empId = String(r.empId || r.empCode || r.badgeId || r.name || 'UNKNOWN');
    const a = analyseShift(r);
    const entry = byEmp.get(empId) || {
      empId, name: r.name || r.empName || '—', dept: r.dept || r.department || '—',
      days: new Set<string>(), totalHours: 0, overtimeHours: 0, lateMinutes: 0, missingPunches: 0,
    };
    if (a.hasClockIn && r.date) entry.days.add(r.date);
    if (!a.hasClockIn || !a.hasClockOut) entry.missingPunches += 1;
    entry.totalHours += a.workedHours;
    entry.overtimeHours += a.overtimeHours;
    entry.lateMinutes += a.lateMinutes;
    byEmp.set(empId, entry);
  }

  return Array.from(byEmp.values())
    .sort((x, y) => x.empId.localeCompare(y.empId, undefined, { numeric: true }))
    .map((e) => {
      const workedDays = e.days.size;
      const absentDays = Math.max(0, scheduledDays - workedDays);
      const deductionParts: string[] = [];
      if (e.lateMinutes > 0) deductionParts.push(`${e.lateMinutes}m late`);
      if (absentDays > 0) deductionParts.push(`${absentDays}d absent`);

      let reconciledStatus = 'RECONCILED';
      if (e.missingPunches > 0) reconciledStatus = 'MISSING PUNCH';
      else if (absentDays > 0 && e.lateMinutes > 0) reconciledStatus = 'VARIANCE: LATE + ABSENCE';
      else if (absentDays > 0) reconciledStatus = 'VARIANCE: ABSENCE';
      else if (e.lateMinutes > 0) reconciledStatus = 'VARIANCE: LATE';

      return {
        empId: e.empId,
        name: e.name,
        dept: e.dept,
        scheduledDays,
        workedDays,
        totalHours: e.totalHours.toFixed(2),
        overtimeHours: e.overtimeHours.toFixed(2),
        deduction: deductionParts.length > 0 ? deductionParts.join(' + ') : '—',
        reconciledStatus,
        _totalHours: e.totalHours,
        _overtimeHours: e.overtimeHours,
        _isReconciled: reconciledStatus === 'RECONCILED',
      };
    });
}

export const TimeAndAttendanceMasterDocument: React.FC<TimeAndAttendanceMasterDocumentProps> = ({
  reportKey,
  reportTitle,
  code,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  branch = 'Southern Olive and Oil Products - Main',
  filterValues,
}) => {
  const { t } = useLanguage();

  const view = resolveHRReportView(reportKey);
  const resolvedCode = code || VIEW_DEFAULTS[view].code;
  const queryId = VIEW_DEFAULTS[view].queryId;
  const resolvedTitle = reportTitle || VIEW_DEFAULTS[view].title;

  // Stable identity for the filter object: callers frequently pass inline objects,
  // which would otherwise re-trigger the fetch effect on every render.
  const filterKey = JSON.stringify(filterValues ?? {});
  const filters = useMemo<Record<string, any>>(() => JSON.parse(filterKey), [filterKey]);

  // User-selected branch filter takes priority over the static branch prop.
  const facility = toQueryValue(filters.branch ?? filters.facility ?? branch);

  const [liveRows, setLiveRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function fetchReportData() {
      try {
        const payload: UniversalFilterPayload = {
          reportId: queryId,
          dateFrom: filters.fromDate || '2026-09-01',
          dateTo: filters.toDate || '2026-09-30',
          facilityId: facility,
          departmentId: toQueryValue(filters.department ?? filters.departmentCostCenter ?? filters.dept),
          terminalId: toQueryValue(filters.terminal ?? filters.biometricTerminal),
          status: isAllValue(filters.employeeStatus ?? filters.status) ? undefined : (filters.employeeStatus ?? filters.status),
          customParams: filters,
        };

        const result = await executeReportQuery(payload);
        if (!isMounted) return;

        // Normalize rows for master document columns
        const normalized = (result.rows || []).map((r) => ({
          ...r,
          badgeId: r.badgeId || r.empCode || r.empId,
          empId: r.empId || r.empCode,
          dept: r.dept || r.department,
          punchTime: r.punchTime || `${r.date} ${r.clockIn}`,
          event: r.event || r.eventType || r.status || 'CLOCK_IN',
          shift: r.shift || 'General Shift (08:00 - 17:00)',
        }));

        setLiveRows(normalized);
      } catch (err) {
        console.error('[TimeAndAttendanceMasterDocument] report query failed:', err);
        if (isMounted) setLiveRows([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchReportData();

    return () => {
      isMounted = false;
    };
  }, [queryId, facility, filters]);

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    const dept = filters.department ?? filters.departmentCostCenter;
    const terminal = filters.terminal ?? filters.biometricTerminal;
    if (!isAllValue(facility)) parts.push(`Facility: ${facility}`);
    if (!isAllValue(dept)) parts.push(`Dept: ${dept}`);
    if (!isAllValue(terminal)) parts.push(`Terminal: ${terminal}`);
    if (!isAllValue(filters.compensationCategory)) parts.push(`Compensation: ${filters.compensationCategory}`);
    if (!isAllValue(filters.employeeStatus)) parts.push(`Status: ${filters.employeeStatus}`);
    return parts.length > 0 ? parts.join(' | ') : undefined;
  }, [filters, facility]);

  const meta: ReportMetadata = {
    reportTitle: resolvedTitle,
    companyName: 'Southern Olive Oil S.A.R.L.',
    subtitle: 'HR & Payroll Operational Control',
    code: resolvedCode,
    dateRange:
      dynamicPeriodText ||
      (filters.fromDate && filters.toDate ? `Period: ${filters.fromDate} to ${filters.toDate}` : 'Audit Cycle: August 2026'),
    generatedDate: executionDate,
    branch: isAllValue(facility) ? 'All Facilities' : facility,
    filterSummary,
    systemSource: 'Vanguard ERP HR & Workforce Kernel',
    pageNumber: 1,
    totalPages: 1,
  };

  const loadingNotice = isLoading ? (
    <div className="text-[11px] font-semibold text-slate-500 animate-pulse px-1 pb-2 print:hidden">
      {t('loading_report_sheet', 'Loading report sheet...')}
    </div>
  ) : null;

  // 1. Labor Cost View (aggregated per department / cost center)
  if (view === 'labor') {
    const columns: ReportColumn<any>[] = [
      { key: 'costCenter', label: t('col_cost_center', 'Cost Center'), width: '14%', align: 'left', isMonospace: true },
      { key: 'name', label: t('col_dept_operation_unit', 'Department / Operation Unit'), width: '30%', align: 'left' },
      { key: 'headcount', label: t('col_staff_count', 'Staff Count'), width: '12%', align: 'center', isMonospace: true },
      { key: 'baseSalary', label: t('col_regular_wages', 'Regular Wages ($)'), width: '14%', align: 'right', isMonospace: true },
      { key: 'overtime', label: t('col_overtime_pay', 'Overtime Pay ($)'), width: '14%', align: 'right', isMonospace: true },
      { key: 'totalCost', label: t('col_total_labor', 'Total Labor ($)'), width: '16%', align: 'right', isMonospace: true },
    ];

    const byDept = new Map<string, { costCenter: string; name: string; headcount: number; baseSalary: number; overtime: number; totalCost: number }>();
    for (const r of liveRows) {
      const deptName = r.department || r.dept || 'Unassigned';
      const bucket = byDept.get(deptName) || { costCenter: r.costCenter || '—', name: deptName, headcount: 0, baseSalary: 0, overtime: 0, totalCost: 0 };
      bucket.headcount += Number(r.headcount) || 1;
      bucket.baseSalary += Number(r.baseSalary) || 0;
      bucket.overtime += Number(r.overtime ?? r.overtimePay) || 0;
      bucket.totalCost += Number(r.totalCost ?? r.grossSalary) || 0;
      byDept.set(deptName, bucket);
    }
    const laborRows = Array.from(byDept.values()).map((b) => ({
      ...b,
      baseSalary: b.baseSalary.toFixed(2),
      overtime: b.overtime.toFixed(2),
      totalCost: b.totalCost.toFixed(2),
    }));

    const totalExpenditure = Array.from(byDept.values()).reduce((acc, r) => acc + r.totalCost, 0);
    const totalHeadcount = Array.from(byDept.values()).reduce((acc, r) => acc + r.headcount, 0);
    const grandTotal: GrandTotal | undefined = laborRows.length > 0 ? {
      label: t('lbl_consolidated_labor', `Consolidated Labor Expenditure (${totalHeadcount} Personnel):`),
      value: `$${totalExpenditure.toFixed(2)}`,
    } : undefined;

    return (
      <>
        {loadingNotice}
        <MasterReportDocument
          meta={meta}
          columns={columns}
          flatRows={laborRows}
          grandTotal={grandTotal}
        />
      </>
    );
  }

  // 2. Master Punch Ledger View
  if (view === 'punch') {
    const columns: ReportColumn<any>[] = [
      { key: 'punchId', label: t('col_punch_no', 'Punch #'), width: '14%', align: 'left', isMonospace: true },
      { key: 'badgeId', label: t('col_badge_id', 'Badge ID'), width: '14%', align: 'left', isMonospace: true },
      { key: 'name', label: t('col_employee_name', 'Employee Name'), width: '24%', align: 'left' },
      { key: 'terminal', label: t('col_biometric_terminal', 'Biometric Terminal'), width: '20%', align: 'left' },
      { key: 'punchTime', label: t('col_punch_timestamp', 'Punch Timestamp'), width: '14%', align: 'center', isMonospace: true },
      { key: 'event', label: t('col_punch_direction', 'Direction'), width: '14%', align: 'center', isMonospace: true },
    ];

    const grandTotal: GrandTotal | undefined = liveRows.length > 0 ? {
      label: t('lbl_total_punches_audited', 'Total Biometric Punches Audited:'),
      value: `${liveRows.length} Recorded Punches`,
    } : undefined;

    return (
      <>
        {loadingNotice}
        <MasterReportDocument
          meta={meta}
          columns={columns}
          flatRows={liveRows}
          grandTotal={grandTotal}
        />
      </>
    );
  }

  // 3. Overtime, Lateness & Shift Exceptions Log (exception rows only)
  if (view === 'exceptions') {
    const exceptionRows = buildExceptionRows(liveRows);
    const columns: ReportColumn<any>[] = [
      { key: 'empId', label: t('col_staff_id', 'Staff ID'), width: '8%', align: 'left', isMonospace: true },
      { key: 'name', label: t('col_staff_name', 'Staff Member Name'), width: '15%', align: 'left' },
      { key: 'dept', label: t('col_department', 'Department'), width: '11%', align: 'left' },
      { key: 'shift', label: t('col_assigned_shift', 'Assigned Shift'), width: '16%', align: 'left' },
      { key: 'clockIn', label: t('col_clock_in', 'Clock In'), width: '9%', align: 'center', isMonospace: true },
      { key: 'clockOut', label: t('col_clock_out', 'Clock Out'), width: '9%', align: 'center', isMonospace: true },
      { key: 'lateMinsDisplay', label: t('col_late_mins', 'Late (Mins)'), width: '8%', align: 'right', isMonospace: true },
      { key: 'overtimeHrsDisplay', label: t('col_overtime_hrs', 'Overtime (Hrs)'), width: '9%', align: 'right', isMonospace: true },
      { key: 'exceptionType', label: t('col_status_exception_type', 'Status / Exception Type'), width: '15%', align: 'center', isMonospace: true },
    ];

    const totalLate = exceptionRows.reduce((acc, r) => acc + (Number(r.lateMinutes) || 0), 0);
    const totalOt = exceptionRows.reduce((acc, r) => acc + (Number(r.overtimeHours) || 0), 0);
    const grandTotal: GrandTotal | undefined = exceptionRows.length > 0 ? {
      label: t('lbl_total_shift_exceptions', `Total Shift Exceptions (${exceptionRows.length} Records):`),
      value: `${totalLate} Late Mins | ${totalOt.toFixed(2)} OT Hrs`,
    } : undefined;

    return (
      <>
        {loadingNotice}
        <MasterReportDocument
          meta={meta}
          columns={columns}
          flatRows={exceptionRows}
          grandTotal={grandTotal}
        />
      </>
    );
  }

  // 4. Monthly Payroll & Biometric Attendance Reconciliation (one row per employee)
  if (view === 'reconciliation') {
    const reconRows = buildReconciliationRows(liveRows);
    const columns: ReportColumn<any>[] = [
      { key: 'empId', label: t('col_staff_id', 'Staff ID'), width: '8%', align: 'left', isMonospace: true },
      { key: 'name', label: t('col_staff_name', 'Staff Member Name'), width: '16%', align: 'left' },
      { key: 'dept', label: t('col_department', 'Department'), width: '12%', align: 'left' },
      { key: 'scheduledDays', label: t('col_scheduled_days', 'Scheduled Days'), width: '9%', align: 'center', isMonospace: true },
      { key: 'workedDays', label: t('col_worked_days', 'Worked Days'), width: '8%', align: 'center', isMonospace: true },
      { key: 'totalHours', label: t('col_total_hours', 'Total Hours'), width: '9%', align: 'right', isMonospace: true },
      { key: 'overtimeHours', label: t('col_overtime_hours', 'Overtime Hours'), width: '9%', align: 'right', isMonospace: true },
      { key: 'deduction', label: t('col_deduction_late_absence', 'Deduction (Late/Absence)'), width: '14%', align: 'center' },
      { key: 'reconciledStatus', label: t('col_reconciled_status', 'Reconciled Status'), width: '15%', align: 'center', isMonospace: true },
    ];

    const totalHours = reconRows.reduce((acc, r) => acc + (Number(r._totalHours) || 0), 0);
    const totalOt = reconRows.reduce((acc, r) => acc + (Number(r._overtimeHours) || 0), 0);
    const reconciledCount = reconRows.filter((r) => r._isReconciled).length;
    const grandTotal: GrandTotal | undefined = reconRows.length > 0 ? {
      label: t('lbl_payroll_reconciliation_total', `Payroll Reconciliation (${reconciledCount}/${reconRows.length} Staff Reconciled):`),
      value: `${totalHours.toFixed(2)} Hrs | ${totalOt.toFixed(2)} OT Hrs`,
    } : undefined;

    return (
      <>
        {loadingNotice}
        <MasterReportDocument
          meta={meta}
          columns={columns}
          flatRows={reconRows}
          grandTotal={grandTotal}
        />
      </>
    );
  }

  // 5. Employee Attendance Shift Roster
  const columns: ReportColumn<any>[] = [
    { key: 'empId', label: t('col_staff_id', 'Staff ID'), width: '12%', align: 'left', isMonospace: true },
    { key: 'name', label: t('col_staff_name', 'Staff Member Name'), width: '22%', align: 'left' },
    { key: 'dept', label: t('col_dept_unit', 'Department / Unit'), width: '22%', align: 'left' },
    { key: 'shift', label: t('col_assigned_shift', 'Assigned Shift'), width: '18%', align: 'left' },
    { key: 'clockIn', label: t('col_clock_in', 'Clock In'), width: '12%', align: 'center', isMonospace: true },
    { key: 'clockOut', label: t('col_clock_out', 'Clock Out'), width: '12%', align: 'center', isMonospace: true },
  ];

  const grandTotal: GrandTotal | undefined = liveRows.length > 0 ? {
    label: t('lbl_total_shift_staff', `Total Active Shift Staff (${liveRows.length} Records):`),
    value: `${liveRows.length} Active Records`,
  } : undefined;

  return (
    <>
      {loadingNotice}
      <MasterReportDocument
        meta={meta}
        columns={columns}
        flatRows={liveRows}
        grandTotal={grandTotal}
      />
    </>
  );
};

export default TimeAndAttendanceMasterDocument;
