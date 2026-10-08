'use client';

import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import UnifiedModuleReportsHub, { ReportCategory } from '@/components/reports/UnifiedModuleReportsHub';
import UnifiedPrintableReportSheet from '@/components/reports/UnifiedPrintableReportSheet';
import TimeAndAttendanceMasterDocument from '@/components/reports/hr/TimeAndAttendanceMasterDocument';
import { getDefaultInitialDateRange, formatDisplayDate } from '@/lib/dateRangeEngine';
import UnifiedHRConsole from '@/components/modules/hr/UnifiedHRConsole';
import PersonnelMasterConsole from '@/components/modules/hr/PersonnelMasterConsole';
import { LayoutTemplate, X, Play } from 'lucide-react';

const ALL_FACILITIES = 'All Facilities';
const HR_BRANCH_OPTIONS = [ALL_FACILITIES, 'Southern Olive and Oil Products - Main', 'Nabatieh Distribution Branch'];

const HR_DEPARTMENT_OPTIONS: { value: string; labelKey: string; label: string }[] = [
  { value: 'Pressing', labelKey: 'dept_pressing', label: 'Pressing & Plant Operations' },
  { value: 'Packaging', labelKey: 'dept_packaging', label: 'Packaging & Bottling Line' },
  { value: 'Logistics', labelKey: 'dept_logistics', label: 'SuperSonic Fleet Logistics' },
  { value: 'Sales', labelKey: 'dept_sales', label: 'Sales & Commercial Wholesale' },
  { value: 'Accounting', labelKey: 'dept_accounting', label: 'Accounting & Administration' },
  { value: 'Management', labelKey: 'dept_management', label: 'Management' },
];

const HR_TERMINAL_OPTIONS = ['Choueifat Bio-01', 'Choueifat Bio-02', 'Nabatieh Bio-01'];

interface HRAppliedFilters {
  fromDate: string;
  toDate: string;
  branch: string;
  department: string;
  terminal: string;
}

/** Reports rendered by the live biometric / labor document (vs. static sheets). */
function isLiveTimeAndAttendanceReport(name: string): boolean {
  if (!name) return true;
  return (
    name.includes('Labor Cost') ||
    name.includes('Attendance') ||
    name.includes('Biometric') ||
    name.includes('Overtime') ||
    name.includes('Terminal')
  );
}

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
  const [branch, setBranch] = useState<string>(ALL_FACILITIES);
  const [fromDate, setFromDate] = useState(initialDateRange.fromDate);
  const [toDate, setToDate] = useState(initialDateRange.toDate);
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [terminalFilter, setTerminalFilter] = useState<string>('ALL');

  // Filters committed to the live data fetcher. Dropdowns edit the draft state above;
  // only "Filter Report" (or running from the Reports Builder) commits them here.
  const [appliedFilters, setAppliedFilters] = useState<HRAppliedFilters>({
    fromDate: initialDateRange.fromDate,
    toDate: initialDateRange.toDate,
    branch: ALL_FACILITIES,
    department: 'ALL',
    terminal: 'ALL',
  });

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const handleFilterReport = useCallback(() => {
    setAppliedFilters({
      fromDate,
      toDate,
      branch,
      department: deptFilter,
      terminal: terminalFilter,
    });
  }, [fromDate, toDate, branch, deptFilter, terminalFilter]);

  const handleResetFilters = useCallback(() => {
    const range = getDefaultInitialDateRange('This Month');
    setPeriod(range.preset);
    setFromDate(range.fromDate);
    setToDate(range.toDate);
    setBranch(ALL_FACILITIES);
    setDeptFilter('ALL');
    setTerminalFilter('ALL');
    setAppliedFilters({
      fromDate: range.fromDate,
      toDate: range.toDate,
      branch: ALL_FACILITIES,
      department: 'ALL',
      terminal: 'ALL',
    });
  }, []);

  const handleRunFromBuilder = useCallback((reportName: string, next: HRAppliedFilters) => {
    setSelectedReport(reportName);
    setPeriod('Date Range');
    setFromDate(next.fromDate);
    setToDate(next.toDate);
    setBranch(next.branch);
    setDeptFilter(next.department);
    setTerminalFilter(next.terminal);
    setAppliedFilters(next);
    setActiveTab('reports');
    setIsBuilderOpen(false);
  }, []);

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
      {/* When viewing Personnel (Default), render Exact Omega Personnel Master View without SaaS pill bars */}
      {activeTab === 'employees' ? (
        <PersonnelMasterConsole />
      ) : (
        <>
          {/* Page Header with Main Tab Switcher for Attendance, Payroll, Reports */}
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

            {/* Reports Builder */}
            <button
              type="button"
              id="hr-reports-builder-btn"
              onClick={() => setIsBuilderOpen(true)}
              className="px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
            >
              <LayoutTemplate size={13} />
              <span>{t('reports_builder', 'Reports Builder')}</span>
            </button>
          </div>

          {/* CORE WORKSTATION (Attendance, Payroll) */}
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
            onFilterReport={handleFilterReport}
            onResetFilters={handleResetFilters}
            period={period}
            setPeriod={setPeriod}
            branch={branch}
            setBranch={setBranch}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            branchOptions={HR_BRANCH_OPTIONS}
            filterControls={
              <>
                <select
                  id="hr-report-filter-department"
                  className="border border-slate-400 rounded p-1.5 text-[13px] w-48 !text-black !font-bold !bg-white focus:outline-none focus:border-blue-600 shadow-xs cursor-pointer"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option value="ALL">{t('all_departments', 'All Departments')}</option>
                  {HR_DEPARTMENT_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>{t(d.labelKey, d.label)}</option>
                  ))}
                </select>

                <select
                  id="hr-report-filter-terminal"
                  className="border border-slate-400 rounded p-1.5 text-[13px] w-44 !text-black !font-bold !bg-white focus:outline-none focus:border-blue-600 shadow-xs cursor-pointer"
                  value={terminalFilter}
                  onChange={(e) => setTerminalFilter(e.target.value)}
                >
                  <option value="ALL">{t('all_zkteco_terminals', 'All ZKTeco Terminals')}</option>
                  {HR_TERMINAL_OPTIONS.map((term) => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </>
            }
          >
            {/* 1. Biometric Attendance / Punch Ledger / Labor Cost — live, filter-bound */}
            {isLiveTimeAndAttendanceReport(selectedReport) && (
              <TimeAndAttendanceMasterDocument
                key={selectedReport}
                reportKey={selectedReport || 'Monthly Payroll & Biometric Attendance Reconciliation'}
                reportTitle={selectedReport || 'Monthly Payroll & Biometric Attendance Reconciliation'}
                executionDate={formatDisplayDate(new Date())}
                branch={appliedFilters.branch}
                filterValues={appliedFilters}
                dynamicPeriodText={`Period: ${appliedFilters.fromDate} to ${appliedFilters.toDate}`}
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
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                        {t('no_payroll_records', 'No payroll transfer records found for the selected criteria.')}
                      </td>
                    </tr>
                  </tbody>
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
        </>
      )}

      {isBuilderOpen && (
        <HRReportsBuilderModal
          groups={hrReportMenuData.map((c) => ({
            category: c.category,
            items: (((c as any).items || []) as unknown[]).filter((i): i is string => typeof i === 'string'),
          }))}
          initialReport={selectedReport}
          initialFilters={appliedFilters}
          onClose={() => setIsBuilderOpen(false)}
          onRun={handleRunFromBuilder}
        />
      )}
    </div>
  );
}

interface HRReportsBuilderModalProps {
  groups: { category: string; items: string[] }[];
  initialReport: string;
  initialFilters: HRAppliedFilters;
  onClose: () => void;
  onRun: (reportName: string, filters: HRAppliedFilters) => void;
}

function HRReportsBuilderModal({ groups, initialReport, initialFilters, onClose, onRun }: HRReportsBuilderModalProps) {
  const { t, dir } = useLanguage();
  const [report, setReport] = useState<string>(initialReport);
  const [draft, setDraft] = useState<HRAppliedFilters>(initialFilters);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const update = (patch: Partial<HRAppliedFilters>) => setDraft((prev) => ({ ...prev, ...patch }));
  const isRangeValid = !draft.fromDate || !draft.toDate || draft.fromDate <= draft.toDate;

  const fieldClass =
    'w-full border border-slate-300 rounded-md py-1.5 px-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-slate-500 shadow-2xs';
  const labelClass = 'text-[11px] font-semibold text-slate-600';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 print:hidden"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hr-reports-builder-title"
        dir={dir}
        className="w-full max-w-3xl bg-white rounded-xl border border-slate-200 shadow-xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <h2 id="hr-reports-builder-title" className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <LayoutTemplate size={15} />
            {t('reports_builder', 'Reports Builder')}
          </h2>
          <button
            type="button"
            id="hr-reports-builder-close"
            onClick={onClose}
            aria-label={t('close', 'Close')}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 overflow-y-auto">
          {/* Report picker */}
          <div className="space-y-3">
            <span className={labelClass}>{t('select_report', 'Select Report')}</span>
            {groups.map((g) => (
              <div key={g.category} className="space-y-1">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">{g.category}</div>
                {g.items.map((item) => (
                  <label
                    key={item}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs cursor-pointer transition-colors ${
                      report === item
                        ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="hr-builder-report"
                      value={item}
                      checked={report === item}
                      onChange={() => setReport(item)}
                      className="sr-only"
                    />
                    {t(item, item)}
                  </label>
                ))}
              </div>
            ))}
          </div>

          {/* Parameters */}
          <div className="space-y-3">
            <span className={labelClass}>{t('report_parameters', 'Report Parameters')}</span>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="hr-builder-from" className={labelClass}>{t('from_date', 'From Date')}</label>
                <input
                  id="hr-builder-from"
                  type="date"
                  value={draft.fromDate}
                  onChange={(e) => update({ fromDate: e.target.value })}
                  className={`${fieldClass} font-mono`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="hr-builder-to" className={labelClass}>{t('to_date', 'To Date')}</label>
                <input
                  id="hr-builder-to"
                  type="date"
                  value={draft.toDate}
                  onChange={(e) => update({ toDate: e.target.value })}
                  className={`${fieldClass} font-mono`}
                />
              </div>
            </div>
            {!isRangeValid && (
              <p className="text-[11px] text-red-600">{t('invalid_date_range', 'From Date must be on or before To Date.')}</p>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="hr-builder-branch" className={labelClass}>{t('facility', 'Facility')}</label>
              <select
                id="hr-builder-branch"
                value={draft.branch}
                onChange={(e) => update({ branch: e.target.value })}
                className={`${fieldClass} cursor-pointer`}
              >
                {HR_BRANCH_OPTIONS.map((b) => (
                  <option key={b} value={b}>{t(b, b)}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="hr-builder-dept" className={labelClass}>{t('department', 'Department')}</label>
              <select
                id="hr-builder-dept"
                value={draft.department}
                onChange={(e) => update({ department: e.target.value })}
                className={`${fieldClass} cursor-pointer`}
              >
                <option value="ALL">{t('all_departments', 'All Departments')}</option>
                {HR_DEPARTMENT_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>{t(d.labelKey, d.label)}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="hr-builder-terminal" className={labelClass}>{t('biometric_terminal', 'Biometric Terminal')}</label>
              <select
                id="hr-builder-terminal"
                value={draft.terminal}
                onChange={(e) => update({ terminal: e.target.value })}
                className={`${fieldClass} cursor-pointer`}
              >
                <option value="ALL">{t('all_zkteco_terminals', 'All ZKTeco Terminals')}</option>
                {HR_TERMINAL_OPTIONS.map((term) => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <button
            type="button"
            id="hr-reports-builder-cancel"
            onClick={onClose}
            className="h-8 px-3 text-xs font-medium rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
          >
            {t('cancel', 'Cancel')}
          </button>
          <button
            type="button"
            id="hr-reports-builder-run"
            disabled={!report || !isRangeValid}
            onClick={() => onRun(report, draft)}
            className="h-8 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={13} />
            {t('run_report', 'Run Report')}
          </button>
        </div>
      </div>
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
