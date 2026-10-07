'use client';

import React, { useMemo } from 'react';
import MasterReportDocument from '@/components/reports/MasterReportDocument';
import { ReportMetadata, ReportColumn, GrandTotal } from '@/types/reports';
import { useLanguage } from '@/lib/LanguageContext';

export interface TimeAndAttendanceMasterDocumentProps {
  reportKey: string;
  reportTitle?: string;
  code?: string;
  dynamicPeriodText?: string;
  executionDate?: string;
  branch?: string;
  filterValues?: Record<string, any>;
}

// ============================================================================
// MOCK DATASETS FOR TIME & ATTENDANCE
// ============================================================================

const EMPLOYEE_ATTENDANCE_DATA: any[] = [];
const TIME_AND_ATTENDANCE_PUNCH_DATA: any[] = [];
const LABOR_COST_DATA: any[] = [];

export const TimeAndAttendanceMasterDocument: React.FC<TimeAndAttendanceMasterDocumentProps> = ({
  reportKey,
  reportTitle,
  code,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  branch = 'Southern Olive and Oil Products - Main',
  filterValues = {},
}) => {
  const { t } = useLanguage();

  const isLaborCost = reportKey.toLowerCase().includes('labor');
  const isPunchLedger = reportKey.toLowerCase().includes('punch') || reportKey.toLowerCase() === 'time and attendance';

  const resolvedCode = code || (isLaborCost ? 'REP_S_00303' : isPunchLedger ? 'REP_S_00302' : 'REP_S_00301');
  const resolvedTitle = reportTitle || (isLaborCost ? 'Labor Cost & Revenue Allocation' : isPunchLedger ? 'Time and Attendance Master Punch Ledger' : 'Employee Attendance & Shift Roster');

  const filterSummary = useMemo(() => {
    if (!filterValues) return undefined;
    const parts: string[] = [];
    if (filterValues.department && filterValues.department !== 'ALL') parts.push(`Dept: ${filterValues.department}`);
    if (filterValues.departmentCostCenter && filterValues.departmentCostCenter !== 'ALL') parts.push(`Cost Center: ${filterValues.departmentCostCenter}`);
    if (filterValues.compensationCategory && filterValues.compensationCategory !== 'ALL') parts.push(`Compensation: ${filterValues.compensationCategory}`);
    if (filterValues.employeeStatus && filterValues.employeeStatus !== 'ALL') parts.push(`Status: ${filterValues.employeeStatus}`);
    return parts.length > 0 ? parts.join(' | ') : undefined;
  }, [filterValues]);

  const meta: ReportMetadata = {
    reportTitle: resolvedTitle,
    companyName: 'Southern Olive Oil S.A.R.L.',
    subtitle: 'HR & Payroll Operational Control',
    code: resolvedCode,
    dateRange: dynamicPeriodText || 'Audit Cycle: August 2026',
    generatedDate: executionDate,
    branch: branch,
    filterSummary,
    systemSource: 'Vanguard ERP HR & Workforce Kernel',
    pageNumber: 1,
    totalPages: 1,
  };

  // 1. Labor Cost View
  if (isLaborCost) {
    const columns: ReportColumn<any>[] = [
      { key: 'costCenter', label: t('col_cost_center', 'Cost Center'), width: '14%', align: 'left', isMonospace: true },
      { key: 'name', label: t('col_dept_operation_unit', 'Department / Operation Unit'), width: '30%', align: 'left' },
      { key: 'headcount', label: t('col_staff_count', 'Staff Count'), width: '12%', align: 'center', isMonospace: true },
      { key: 'baseSalary', label: t('col_regular_wages', 'Regular Wages ($)'), width: '14%', align: 'right', isMonospace: true },
      { key: 'overtime', label: t('col_overtime_pay', 'Overtime Pay ($)'), width: '14%', align: 'right', isMonospace: true },
      { key: 'totalCost', label: t('col_total_labor', 'Total Labor ($)'), width: '16%', align: 'right', isMonospace: true },
    ];

    const grandTotal: GrandTotal = {
      label: t('lbl_consolidated_labor', 'Consolidated Labor Expenditure (27 Active Personnel):'),
      value: '$19,950.00',
    };

    return (
      <MasterReportDocument
        meta={meta}
        columns={columns}
        flatRows={LABOR_COST_DATA}
        grandTotal={grandTotal}
      />
    );
  }

  // 2. Master Punch Ledger View
  if (isPunchLedger) {
    const columns: ReportColumn<any>[] = [
      { key: 'punchId', label: t('col_punch_no', 'Punch #'), width: '14%', align: 'left', isMonospace: true },
      { key: 'badgeId', label: t('col_badge_id', 'Badge ID'), width: '14%', align: 'left', isMonospace: true },
      { key: 'name', label: t('col_employee_name', 'Employee Name'), width: '24%', align: 'left' },
      { key: 'terminal', label: t('col_biometric_terminal', 'Biometric Terminal'), width: '20%', align: 'left' },
      { key: 'punchTime', label: t('col_punch_timestamp', 'Punch Timestamp'), width: '14%', align: 'center', isMonospace: true },
      { key: 'event', label: t('col_punch_direction', 'Direction'), width: '14%', align: 'center', isMonospace: true },
    ];

    const grandTotal: GrandTotal = {
      label: t('lbl_total_punches_audited', 'Total Biometric Punches Audited:'),
      value: '6 Recorded Punches (100% Integrity)',
    };

    return (
      <MasterReportDocument
        meta={meta}
        columns={columns}
        flatRows={TIME_AND_ATTENDANCE_PUNCH_DATA}
        grandTotal={grandTotal}
      />
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

  const grandTotal: GrandTotal = {
    label: t('lbl_total_shift_staff', 'Total Active Shift Staff (7 Checked In):'),
    value: '58.7 Total Hours (5.7h Overtime)',
  };

  return (
    <MasterReportDocument
      meta={meta}
      columns={columns}
      flatRows={EMPLOYEE_ATTENDANCE_DATA}
      grandTotal={grandTotal}
    />
  );
};

export default TimeAndAttendanceMasterDocument;
