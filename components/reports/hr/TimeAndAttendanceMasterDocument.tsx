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

type HRReportView = 'labor' | 'punch' | 'roster';

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
  return 'roster';
}

const VIEW_DEFAULTS: Record<HRReportView, { code: string; title: string }> = {
  labor: { code: 'REP_S_00303', title: 'Labor Cost & Revenue Allocation' },
  punch: { code: 'REP_S_00302', title: 'Time and Attendance Master Punch Ledger' },
  roster: { code: 'REP_S_00301', title: 'Employee Attendance & Shift Roster' },
};

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
          reportId: resolvedCode,
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
  }, [resolvedCode, facility, filters]);

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

  // 3. Employee Attendance Shift Roster
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
