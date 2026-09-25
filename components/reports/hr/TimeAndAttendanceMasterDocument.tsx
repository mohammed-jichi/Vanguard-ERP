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

const EMPLOYEE_ATTENDANCE_DATA = [
  { empId: 'EMP-001', name: 'Ahmad Al-Hajj', dept: 'Processing & Pressing Plant', shift: 'Morning (07:00 - 15:30)', clockIn: '06:55 AM', clockOut: '03:35 PM', hours: '8.5', status: 'Present / On-Time', ot: '0.5 hrs' },
  { empId: 'EMP-002', name: 'Maya Khoury', dept: 'Quality Assurance & Lab', shift: 'Morning (07:00 - 15:30)', clockIn: '07:02 AM', clockOut: '03:30 PM', hours: '8.0', status: 'Present / On-Time', ot: '0.0 hrs' },
  { empId: 'EMP-003', name: 'Jad Tannous', dept: 'Packaging & Automated Bottling', shift: 'Morning (07:00 - 15:30)', clockIn: '07:22 AM', clockOut: '04:00 PM', hours: '8.0', status: 'Late Arrival (> 15 mins)', ot: '0.5 hrs' },
  { empId: 'EMP-004', name: 'Nour Saliba', dept: 'Logistics, Fleet & Dispatch', shift: 'Flexible Office Hours', clockIn: '08:30 AM', clockOut: '05:00 PM', hours: '8.0', status: 'Present / On-Time', ot: '0.0 hrs' },
  { empId: 'EMP-005', name: 'Ali Al-Husseini', dept: 'Logistics, Fleet & Dispatch', shift: 'Morning (07:00 - 15:30)', clockIn: '06:45 AM', clockOut: '05:15 PM', hours: '10.5', status: 'Present / On-Time', ot: '2.5 hrs' },
  { empId: 'EMP-006', name: 'Charbel Mattar', dept: 'Logistics, Fleet & Dispatch', shift: 'Morning (07:00 - 15:30)', clockIn: '07:00 AM', clockOut: '04:30 PM', hours: '9.5', status: 'Present / On-Time', ot: '1.5 hrs' },
  { empId: 'EMP-007', name: 'Fadi Saade', dept: 'Processing & Pressing Plant', shift: 'Evening (15:00 - 23:30)', clockIn: '02:50 PM', clockOut: '11:45 PM', hours: '8.7', status: 'Present / On-Time', ot: '0.7 hrs' },
];

const TIME_AND_ATTENDANCE_PUNCH_DATA = [
  { punchId: 'PCH-9021', badgeId: 'BDG-101', name: 'Ahmad Al-Hajj', terminal: 'TRM-01 (Milling Bay)', punchTime: '06:55:12 AM', event: 'Clock IN', exception: 'Normal (Clean)', schedule: 'Morning Shift' },
  { punchId: 'PCH-9024', badgeId: 'BDG-102', name: 'Maya Khoury', terminal: 'TRM-03 (Lab Entry)', punchTime: '07:02:45 AM', event: 'Clock IN', exception: 'Normal (Clean)', schedule: 'Morning Shift' },
  { punchId: 'PCH-9031', badgeId: 'BDG-103', name: 'Jad Tannous', terminal: 'TRM-02 (Bottling Line)', punchTime: '07:22:10 AM', event: 'Clock IN', exception: 'Late Arrival (22 min)', schedule: 'Morning Shift' },
  { punchId: 'PCH-9040', badgeId: 'BDG-105', name: 'Ali Al-Husseini', terminal: 'TRM-04 (Fleet Gate)', punchTime: '06:45:00 AM', event: 'Clock IN', exception: 'Early Arrival (15 min)', schedule: 'Morning Shift' },
  { punchId: 'PCH-9088', badgeId: 'BDG-101', name: 'Ahmad Al-Hajj', terminal: 'TRM-01 (Milling Bay)', punchTime: '03:35:40 PM', event: 'Clock OUT', exception: 'Approved Overtime', schedule: 'Morning Shift' },
  { punchId: 'PCH-9092', badgeId: 'BDG-105', name: 'Ali Al-Husseini', terminal: 'TRM-04 (Fleet Gate)', punchTime: '05:15:20 PM', event: 'Clock OUT', exception: 'Approved Overtime (+2.5h)', schedule: 'Morning Shift' },
];

const LABOR_COST_DATA = [
  { costCenter: 'CC-100', name: 'Pressing & Extraction Floor', headcount: 8, baseSalary: '$4,800.00', overtime: '$720.00', totalCost: '$5,520.00', ratio: '14.3%' },
  { costCenter: 'CC-200', name: 'Packaging & Automated Bottling', headcount: 6, baseSalary: '$3,600.00', overtime: '$450.00', totalCost: '$4,050.00', ratio: '13.0%' },
  { costCenter: 'CC-300', name: 'Fleet, Logistics & Drivers', headcount: 5, baseSalary: '$3,200.00', overtime: '$680.00', totalCost: '$3,880.00', ratio: '13.7%' },
  { costCenter: 'CC-400', name: 'Retail Storefront & Showroom', headcount: 4, baseSalary: '$2,400.00', overtime: '$180.00', totalCost: '$2,580.00', ratio: '10.4%' },
  { costCenter: 'CC-500', name: 'Executive Admin, Finance & QA', headcount: 4, baseSalary: '$3,800.00', overtime: '$120.00', totalCost: '$3,920.00', ratio: 'Overhead' },
];

export const TimeAndAttendanceMasterDocument: React.FC<TimeAndAttendanceMasterDocumentProps> = ({
  reportKey,
  reportTitle,
  code,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  branch = 'Main Branch (Choueifat Main Facility)',
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
    companyName: 'Zeit w zaytoun ljanoub',
    subtitle: 'Southern Olive Oil Products S.A.R.L - HR & Payroll Operational Control',
    code: resolvedCode,
    dateRange: dynamicPeriodText || 'Audit Cycle: August 2026',
    generatedDate: executionDate,
    branch: `Facility: ${branch}`,
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
