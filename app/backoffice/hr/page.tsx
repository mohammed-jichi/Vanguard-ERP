'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import UnifiedModuleReportsHub, { ReportCategory } from '@/components/reports/UnifiedModuleReportsHub';
import UnifiedPrintableReportSheet from '@/components/reports/UnifiedPrintableReportSheet';
import { EmployeeAttendanceTemplate } from '@/components/reports/sales/EmployeeAttendanceTemplate';
import { getDefaultInitialDateRange, formatDisplayDate } from '@/lib/dateRangeEngine';
import UnifiedHRConsole from '@/components/modules/hr/UnifiedHRConsole';
import { 
  Users, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Download, 
  FileSpreadsheet, 
  Activity, 
  Printer, 
  ShieldCheck, 
  Building2, 
  Cpu,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';

function HRPageContent() {
  const { t, dir } = useLanguage();
  const searchParams = useSearchParams();

  const resolveInitialTab = (): 'employees' | 'attendance' | 'payroll' | 'reports' => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'reports' || tabParam === 'labor') return 'reports';
    if (tabParam === 'attendance') return 'attendance';
    if (tabParam === 'payroll') return 'payroll';
    return 'employees';
  };

  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'payroll' | 'reports'>(resolveInitialTab);
  const [selectedReport, setSelectedReport] = useState<string>(
    searchParams.get('tab') === 'labor' 
      ? 'Department Direct Labor Cost Breakdown' 
      : 'Monthly Payroll & Biometric Attendance Reconciliation'
  );
  
  const initialDateRange = getDefaultInitialDateRange('This Month');
  const [period, setPeriod] = useState<string>(initialDateRange.preset);
  const [branch, setBranch] = useState<string>('Main Branch');
  const [fromDate, setFromDate] = useState(initialDateRange.fromDate);
  const [toDate, setToDate] = useState(initialDateRange.toDate);
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [terminalFilter, setTerminalFilter] = useState<string>('ALL');

  // Sync tab with URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'reports') {
      setActiveTab('reports');
      setSelectedReport('Monthly Payroll & Biometric Attendance Reconciliation');
    } else if (tabParam === 'labor') {
      setActiveTab('reports');
      setSelectedReport('Department Direct Labor Cost Breakdown');
    } else if (tabParam === 'attendance') {
      setActiveTab('attendance');
    } else if (tabParam === 'payroll') {
      setActiveTab('payroll');
    } else if (tabParam === 'personnel' || tabParam === 'employees' || tabParam === 'workspace') {
      setActiveTab('employees');
    }
  }, [searchParams]);

  const hrReportMenuData: ReportCategory[] = useMemo(() => [
    {
      category: t('rep_cat_biometric_time', 'Biometric Attendance & Time'),
      type: 'flat',
      items: [
        'Monthly Payroll & Biometric Attendance Reconciliation',
        'Overtime, Lateness & Shift Exceptions Log',
        'ZKTeco Hardware Terminal Event Stream',
      ],
    },
    {
      category: t('rep_cat_payroll_remuneration', 'Payroll & Remuneration'),
      type: 'flat',
      items: [
        'Department Direct Labor Cost Breakdown',
        'BLOM Bank Electronic Salary Transfer Audit',
        'Cash Wages Disbursal & Receipt Register',
      ],
    },
    {
      category: t('rep_cat_department_staffing', 'Department Staffing'),
      type: 'flat',
      items: [
        'Department Headcount & Allocation Roster',
        'Leave, Absences & Sick Days Statement',
      ],
    },
  ], [t]);

  return (
    <div className="p-4 md:p-6 space-y-4 font-sans bg-background min-h-screen text-slate-800" dir={dir}>
      {/* Page Header with Main Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">{t('hr_payroll_title', '8. HR & Payroll Management')}</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono">
              {t('live_biometrics_badge', 'Live Biometrics')}
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            {t('hr_page_subtitle', 'Biometric ZKTeco punch terminals, shift tracking, and BLOM Bank automated payroll reconciliation')}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('employees')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'employees' 
                ? 'bg-primary text-primary-foreground shadow-xs font-bold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Users size={13} />
            <span>{t('Staff Directory', 'Staff Directory')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'attendance' 
                ? 'bg-primary text-primary-foreground shadow-xs font-bold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Clock size={13} />
            <span>{t('attendance_shifts_tab', 'Attendance & Shifts')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payroll')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'payroll' 
                ? 'bg-primary text-primary-foreground shadow-xs font-bold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <DollarSign size={13} />
            <span>{t('payroll_runs_tab', 'Payroll Runs & Payslips')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('reports');
              setSelectedReport('Monthly Payroll & Biometric Attendance Reconciliation');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reports' 
                ? 'bg-primary text-primary-foreground shadow-xs font-bold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileText size={13} />
            <span>{t('HR Reports Hub', 'HR Reports Hub')}</span>
            <span className="text-[9.5px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black font-mono">
              REP_HR
            </span>
          </button>
        </div>
      </div>

      {/* CORE WORKSTATION (Employees, Attendance, Payroll) */}
      {activeTab !== 'reports' && (
        <UnifiedHRConsole initialTab={activeTab} key={activeTab} />
      )}

      {/* MASTER-DETAIL UNIFIED REPORTS HUB */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <UnifiedModuleReportsHub
            moduleTitle={t('hr_reports_hub_title', 'HR & Biometric Payroll Reports Hub')}
            reportMenuData={hrReportMenuData}
            selectedReport={selectedReport}
            onSelectReport={(r) => setSelectedReport(r)}
            period={period}
            setPeriod={setPeriod}
            branch={branch}
            setBranch={setBranch}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            branchOptions={['Main Branch', 'Choueifat Main Facility', 'Nabatieh Pressing Unit', 'Beirut Administration']}
            filterControls={
              <>
                <select
                  className="border border-slate-400 rounded p-1.5 text-[13px] w-48 !text-black !font-bold !bg-white focus:outline-none focus:border-blue-600 shadow-xs cursor-pointer"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option value="ALL">{t('all_departments', 'All Departments')}</option>
                  <option value="Pressing">{t('dept_pressing', 'Pressing & Plant Operations')}</option>
                  <option value="Packaging">{t('dept_packaging', 'Packaging & Bottling Line')}</option>
                  <option value="Logistics">{t('dept_logistics', 'SuperSonic Fleet Logistics')}</option>
                  <option value="Sales">{t('dept_sales', 'Sales & Commercial Wholesale')}</option>
                  <option value="Accounting">{t('dept_accounting', 'Accounting & Administration')}</option>
                </select>

                <select
                  className="border border-slate-400 rounded p-1.5 text-[13px] w-44 !text-black !font-bold !bg-white focus:outline-none focus:border-blue-600 shadow-xs cursor-pointer"
                  value={terminalFilter}
                  onChange={(e) => setTerminalFilter(e.target.value)}
                >
                  <option value="ALL">{t('all_zkteco_terminals', 'All ZKTeco Terminals')}</option>
                  <option value="Choueifat Bio-01">Choueifat Bio-01</option>
                  <option value="Choueifat Bio-02">Choueifat Bio-02</option>
                  <option value="Nabatieh Bio-01">Nabatieh Bio-01</option>
                </select>
              </>
            }
          >
            {/* 1. Biometric Attendance Reconciliation (REP_HR_001) */}
            {(!selectedReport || selectedReport.includes('Attendance') || selectedReport.includes('Biometric') || selectedReport.includes('Overtime') || selectedReport.includes('Terminal')) && (
              <EmployeeAttendanceTemplate
                hideToolbar={true}
                reportTitle={selectedReport || "Monthly Payroll & Biometric Attendance Reconciliation"}
                executionDate={formatDisplayDate(new Date())}
                fromDate={fromDate}
                toDate={toDate}
                dynamicPeriodText={`Period: ${fromDate} to ${toDate}`}
              />
            )}

            {/* 2. Direct Labor Cost Breakdown (REP_HR_002) */}
            {selectedReport.includes('Labor Cost') && (
              <EmployeeAttendanceTemplate
                hideToolbar={true}
                reportTitle="Department Direct Labor Cost Breakdown"
                executionDate={formatDisplayDate(new Date())}
                fromDate={fromDate}
                toDate={toDate}
                dynamicPeriodText={`Period: ${fromDate} to ${toDate}`}
              />
            )}

            {/* 3. BLOM Bank Electronic Salary Transfer Audit */}
            {(selectedReport.includes('BLOM') || selectedReport.includes('Electronic Salary') || selectedReport.includes('Wages') || selectedReport.includes('Register')) && (
              <UnifiedPrintableReportSheet
                reportTitle={selectedReport}
                reportCode="REP_HR_003"
                executionDate={formatDisplayDate(new Date())}
                periodText={`Payroll Transfer Cycle: ${fromDate} to ${toDate} (Direct BLOM Clearing)`}
                pageInfo="Page 1 of 1"
                branchInfo="Branch: Central Payroll & Executive Treasury"
                hideToolbar={true}
              >
                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b-2 border-slate-900 font-bold text-black leading-tight bg-slate-50">
                      <th className="py-2 px-2 normal-case w-[14%] font-sans">{t('col_emp_id', 'Emp ID')}</th>
                      <th className="py-2 px-2 normal-case w-[24%] font-sans">{t('col_employee_name', 'Employee Name')}</th>
                      <th className="py-2 px-2 normal-case w-[22%] font-sans">{t('col_blom_iban', 'BLOM IBAN / Account')}</th>
                      <th className="py-2 px-2 normal-case w-[14%] font-sans text-center">{t('col_transfer_mode', 'Transfer Mode')}</th>
                      <th className="py-2 px-2 normal-case w-[13%] font-sans text-right">{t('col_gross_salary', 'Gross Salary ($)')}</th>
                      <th className="py-2 px-2 normal-case w-[13%] font-sans text-right">{t('col_net_transferred', 'Net Transferred ($)')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
                    <tr className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 font-mono font-bold text-blue-900">EMP-001</td>
                      <td className="py-1.5 px-2 font-bold text-slate-900">Youssef Abboud</td>
                      <td className="py-1.5 px-2 font-mono text-slate-600">LB81-0014-0000-1122-3344-01</td>
                      <td className="py-1.5 px-2 text-center"><span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[9.5px]">ACH DIRECT</span></td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-800">$1,450.00</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-800">$1,450.00</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 font-mono font-bold text-blue-900">EMP-002</td>
                      <td className="py-1.5 px-2 font-bold text-slate-900">Laila Harb</td>
                      <td className="py-1.5 px-2 font-mono text-slate-600">LB81-0014-0000-5566-7788-02</td>
                      <td className="py-1.5 px-2 text-center"><span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[9.5px]">ACH DIRECT</span></td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-800">$1,800.00</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-800">$1,800.00</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 font-mono font-bold text-blue-900">EMP-003</td>
                      <td className="py-1.5 px-2 font-bold text-slate-900">Nabil Sleiman</td>
                      <td className="py-1.5 px-2 font-mono text-slate-600">LB81-0014-0000-9900-1122-03</td>
                      <td className="py-1.5 px-2 text-center"><span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[9.5px]">ACH DIRECT</span></td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-800">$1,200.00</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-800">$1,200.00</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 font-mono font-bold text-blue-900">EMP-004</td>
                      <td className="py-1.5 px-2 font-bold text-slate-900">Ziad Kassis</td>
                      <td className="py-1.5 px-2 font-mono text-slate-600">LB81-0014-0000-3344-5566-04</td>
                      <td className="py-1.5 px-2 text-center"><span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[9.5px]">ACH DIRECT</span></td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-800">$1,350.00</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-800">$1,350.00</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-900 font-bold bg-slate-50 text-[11px]">
                      <td colSpan={4} className="py-2 px-2 font-sans text-center">{t('total_electronic_payroll_disbursed', 'Total Electronic Payroll Disbursed:')}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">$5,800.00</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-emerald-800">$5,800.00</td>
                    </tr>
                  </tfoot>
                </table>
              </UnifiedPrintableReportSheet>
            )}

            {/* 4. Department Staffing & Allocation Roster */}
            {(selectedReport.includes('Headcount') || selectedReport.includes('Roster') || selectedReport.includes('Leave') || selectedReport.includes('Absences')) && (
              <UnifiedPrintableReportSheet
                reportTitle={selectedReport}
                reportCode="REP_HR_004"
                executionDate="06-Sep-2026"
                periodText="Staffing Allocation: Active Production Shift"
                pageInfo="Page 1 of 1"
                branchInfo="Branch: All Active Facilities"
                hideToolbar={true}
              >
                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b-2 border-slate-900 font-bold text-black leading-tight bg-slate-50">
                      <th className="py-2 px-2 normal-case w-[28%] font-sans">{t('col_operational_dept', 'Operational Department')}</th>
                      <th className="py-2 px-2 normal-case w-[18%] font-sans text-center">{t('col_total_headcount', 'Total Headcount')}</th>
                      <th className="py-2 px-2 normal-case w-[18%] font-sans text-center">{t('col_active_on_shift', 'Active On Shift')}</th>
                      <th className="py-2 px-2 normal-case w-[18%] font-sans text-center">{t('col_scheduled_leave', 'Scheduled Leave')}</th>
                      <th className="py-2 px-2 normal-case w-[18%] font-sans text-right">{t('col_avg_dept_wage', 'Avg Dept Wage ($)')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-bold text-slate-900">{t('dept_pressing', 'Pressing & Plant Operations')}</td>
                      <td className="py-2 px-2 text-center font-mono font-bold">14 Staff</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-emerald-800">13 Active</td>
                      <td className="py-2 px-2 text-center font-mono text-slate-500">1 Leave</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-800">$6.20/hr</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-bold text-slate-900">{t('dept_packaging', 'Packaging & Bottling Line')}</td>
                      <td className="py-2 px-2 text-center font-mono font-bold">12 Staff</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-emerald-800">11 Active</td>
                      <td className="py-2 px-2 text-center font-mono text-slate-500">1 Leave</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-800">$5.60/hr</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-bold text-slate-900">{t('dept_logistics', 'SuperSonic Fleet Logistics')}</td>
                      <td className="py-2 px-2 text-center font-mono font-bold">8 Staff</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-emerald-800">8 Active</td>
                      <td className="py-2 px-2 text-center font-mono text-slate-500">0 Leave</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-800">$6.80/hr</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-bold text-slate-900">{t('dept_sales', 'Commercial Wholesale & CRM')}</td>
                      <td className="py-2 px-2 text-center font-mono font-bold">5 Staff</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-emerald-800">4 Active</td>
                      <td className="py-2 px-2 text-center font-mono text-slate-500">1 Leave</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-800">$7.50/hr</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-bold text-slate-900">{t('dept_accounting', 'Accounting & Administration')}</td>
                      <td className="py-2 px-2 text-center font-mono font-bold">3 Staff</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-emerald-800">2 Active</td>
                      <td className="py-2 px-2 text-center font-mono text-slate-500">1 Leave</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-800">$8.20/hr</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-900 font-bold bg-slate-50 text-[11px]">
                      <td className="py-2 px-2 font-sans text-left">{t('company_total_workforce', 'Company Total Workforce:')}</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-slate-900">42 Staff</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-emerald-800">38 Active</td>
                      <td className="py-2 px-2 text-center font-mono text-slate-600">4 Leave</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-blue-900">$6.86/hr Blended</td>
                    </tr>
                  </tfoot>
                </table>
              </UnifiedPrintableReportSheet>
            )}
          </UnifiedModuleReportsHub>
        </div>
      )}
    </div>
  );
}

export default function HRPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs font-mono text-slate-500">Loading HR &amp; Payroll Management...</div>}>
      <HRPageContent />
    </Suspense>
  );
}
