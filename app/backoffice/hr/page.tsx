'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import UnifiedModuleReportsHub, { ReportCategory } from '@/components/reports/UnifiedModuleReportsHub';
import UnifiedPrintableReportSheet from '@/components/reports/UnifiedPrintableReportSheet';
import { EmployeeAttendanceTemplate } from '@/components/reports/sales/EmployeeAttendanceTemplate';
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
  Cpu
} from 'lucide-react';

const hrReportMenuData: ReportCategory[] = [
  {
    category: 'Biometric Attendance & Time',
    type: 'flat',
    items: [
      'Monthly Payroll & Biometric Attendance Reconciliation',
      'Overtime, Lateness & Shift Exceptions Log',
      'ZKTeco Hardware Terminal Event Stream',
    ],
  },
  {
    category: 'Payroll & Remuneration',
    type: 'flat',
    items: [
      'Department Direct Labor Cost Breakdown',
      'BLOM Bank Electronic Salary Transfer Audit',
      'Cash Wages Disbursal & Receipt Register',
    ],
  },
  {
    category: 'Department Staffing',
    type: 'flat',
    items: [
      'Department Headcount & Allocation Roster',
      'Leave, Absences & Sick Days Statement',
    ],
  },
];

function HRPageContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') === 'reports' || searchParams.get('tab') === 'labor') ? 'reports' : 'workspace';
  
  const [activeTab, setActiveTab] = useState<'workspace' | 'reports'>(initialTab);
  const [selectedReport, setSelectedReport] = useState<string>(
    searchParams.get('tab') === 'labor' 
      ? 'Department Direct Labor Cost Breakdown' 
      : 'Monthly Payroll & Biometric Attendance Reconciliation'
  );
  
  const [period, setPeriod] = useState<string>('This Month');
  const [branch, setBranch] = useState<string>('Main Branch');
  const [fromDate, setFromDate] = useState('2026-08-01');
  const [toDate, setToDate] = useState('2026-08-27');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [terminalFilter, setTerminalFilter] = useState<string>('ALL');
  const [showBankExportSuccess, setShowBankExportSuccess] = useState(false);

  // Sync tab with URL if changed
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'reports') {
      setActiveTab('reports');
      setSelectedReport('Monthly Payroll & Biometric Attendance Reconciliation');
    } else if (tabParam === 'labor') {
      setActiveTab('reports');
      setSelectedReport('Department Direct Labor Cost Breakdown');
    }
  }, [searchParams]);

  // Mock Active Employee Roster
  const employees = [
    { id: 'EMP-001', name: 'Youssef Abboud', dept: 'Pressing & Plant Operations', role: 'Plant Supervisor', shift: '07:00 - 15:30', rate: '$6.50/hr', status: 'Active', terminal: 'Choueifat Bio-01' },
    { id: 'EMP-002', name: 'Laila Harb', dept: 'Accounting & Administration', role: 'Senior Accountant', shift: '08:00 - 16:30', rate: '$8.00/hr', status: 'Active', terminal: 'Choueifat Bio-02' },
    { id: 'EMP-003', name: 'Nabil Sleiman', dept: 'Packaging & Bottling Line', role: 'Bottling Operator', shift: '07:00 - 15:30', rate: '$5.50/hr', status: 'Active', terminal: 'Choueifat Bio-01' },
    { id: 'EMP-004', name: 'Ziad Kassis', dept: 'SuperSonic Fleet Logistics', role: 'Senior Fleet Dispatcher', shift: '06:30 - 15:00', rate: '$6.00/hr', status: 'Active', terminal: 'Choueifat Bio-02' },
    { id: 'EMP-005', name: 'Rami Haddad', dept: 'Sales & Commercial Wholesale', role: 'Key Accounts Rep', shift: '08:30 - 17:00', rate: '$7.50/hr', status: 'Active', terminal: 'Remote / Mobile Punch' },
    { id: 'EMP-006', name: 'Ahmad Zein', dept: 'Pressing & Plant Operations', role: 'Cold Press Technician', shift: '07:00 - 15:30', rate: '$5.80/hr', status: 'Active', terminal: 'Nabatieh Bio-01' }
  ];

  const handleExportBlomBank = () => {
    setShowBankExportSuccess(true);
    setTimeout(() => setShowBankExportSuccess(false), 4000);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 font-sans bg-[#f8fafc] min-h-screen text-slate-800">
      {/* Page Header with Tab Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">7. HR &amp; Payroll Management</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono">
              Live Biometrics
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Biometric ZKTeco punch terminals, shift tracking, and BLOM Bank automated payroll reconciliation
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'workspace' 
                ? 'bg-[#1a629b] text-white shadow-xs' 
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Users size={13} />
            <span>Staff Directory</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('reports');
              setSelectedReport('Monthly Payroll & Biometric Attendance Reconciliation');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reports' 
                ? 'bg-[#1a629b] text-white shadow-xs' 
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Clock size={13} />
            <span>HR Reports Hub</span>
            <span className="text-[9.5px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black">
              REP_HR_001
            </span>
          </button>
        </div>
      </div>

      {/* 1. WORKSPACE VIEW */}
      {activeTab === 'workspace' && (
        <div className="space-y-4">
          {/* Quick Bank Alert Banner */}
          {showBankExportSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl text-emerald-800 flex items-center justify-between text-xs font-medium shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>BLOM Bank Direct Salary Transfer File (BLOM_PAYROLL_AUG2026.TXT) generated successfully in ISO 20022 format.</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowBankExportSuccess(false)}
                className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-0.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Active Workforce</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">42</div>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">100% Biometrically Registered</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">On-Shift Today</span>
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">38</div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">4 on scheduled rest / leave</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">ZKTeco Terminals</span>
                <Cpu className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">3 Online</div>
              <p className="text-[11px] text-purple-700 font-medium mt-0.5">Choueifat (2) &bull; Nabatieh (1)</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Estimated Gross Payroll</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">$28,450.00</div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Current Month Cycle</p>
            </div>
          </div>

          {/* Employee Directory Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-900">Key Plant &amp; Office Staff Directory</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportBlomBank}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <FileSpreadsheet size={13} />
                  <span>BLOM Bank Export</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('reports');
                    setSelectedReport('Monthly Payroll & Biometric Attendance Reconciliation');
                  }}
                  className="text-xs text-[#1a629b] hover:underline font-bold"
                >
                  Full Print Sheet (REP_HR_001) &rarr;
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10.5px]">
                    <th className="py-2.5 px-3">Emp ID</th>
                    <th className="py-2.5 px-3">Employee Name</th>
                    <th className="py-2.5 px-3">Department &amp; Role</th>
                    <th className="py-2.5 px-3 text-center">Scheduled Shift</th>
                    <th className="py-2.5 px-3">Assigned Terminal</th>
                    <th className="py-2.5 px-3 text-right">Standard Rate</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{emp.id}</td>
                      <td className="py-2 px-3 font-bold text-slate-800">{emp.name}</td>
                      <td className="py-2 px-3">
                        <div className="text-slate-800 font-medium">{emp.dept}</div>
                        <div className="text-[10.5px] text-slate-500">{emp.role}</div>
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-slate-700">{emp.shift}</td>
                      <td className="py-2 px-3 text-slate-600 text-[11px] font-mono">{emp.terminal}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{emp.rate}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. MASTER-DETAIL UNIFIED REPORTS HUB */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <UnifiedModuleReportsHub
            moduleTitle="HR & Biometric Payroll Reports Hub"
            reportMenuData={hrReportMenuData}
            selectedReport={selectedReport}
            onSelectReport={(r) => setSelectedReport(r)}
            period={period}
            setPeriod={setPeriod}
            branch={branch}
            setBranch={setBranch}
            branchOptions={['Main Branch', 'Choueifat Main Facility', 'Nabatieh Pressing Unit', 'Beirut Administration']}
            filterControls={
              <>
                <select
                  className="border border-slate-400 rounded p-1.5 text-[13px] w-48 !text-black !font-bold !bg-white focus:outline-none focus:border-blue-600 shadow-xs cursor-pointer"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option value="ALL">All Departments</option>
                  <option value="Pressing">Pressing &amp; Plant Operations</option>
                  <option value="Packaging">Packaging &amp; Bottling Line</option>
                  <option value="Logistics">SuperSonic Fleet Logistics</option>
                  <option value="Sales">Sales &amp; Commercial Wholesale</option>
                  <option value="Accounting">Accounting &amp; Administration</option>
                </select>

                <select
                  className="border border-slate-400 rounded p-1.5 text-[13px] w-44 !text-black !font-bold !bg-white focus:outline-none focus:border-blue-600 shadow-xs cursor-pointer"
                  value={terminalFilter}
                  onChange={(e) => setTerminalFilter(e.target.value)}
                >
                  <option value="ALL">All ZKTeco Terminals</option>
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
                executionDate="06-Sep-2026"
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
                executionDate="06-Sep-2026"
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
                executionDate="06-Sep-2026"
                periodText="Payroll Transfer Cycle: August 2026 (Direct BLOM Clearing)"
                pageInfo="Page 1 of 1"
                branchInfo="Branch: Central Payroll & Executive Treasury"
                hideToolbar={true}
              >
                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b-2 border-slate-900 font-bold text-black leading-tight bg-slate-50">
                      <th className="py-2 px-2 normal-case w-[14%] font-sans">Emp ID</th>
                      <th className="py-2 px-2 normal-case w-[24%] font-sans">Employee Name</th>
                      <th className="py-2 px-2 normal-case w-[22%] font-sans">BLOM IBAN / Account</th>
                      <th className="py-2 px-2 normal-case w-[14%] font-sans text-center">Transfer Mode</th>
                      <th className="py-2 px-2 normal-case w-[13%] font-sans text-right">Gross Salary ($)</th>
                      <th className="py-2 px-2 normal-case w-[13%] font-sans text-right">Net Transferred ($)</th>
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
                      <td colSpan={4} className="py-2 px-2 font-sans text-center">Total Electronic Payroll Disbursed:</td>
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
                      <th className="py-2 px-2 normal-case w-[28%] font-sans">Operational Department</th>
                      <th className="py-2 px-2 normal-case w-[18%] font-sans text-center">Total Headcount</th>
                      <th className="py-2 px-2 normal-case w-[18%] font-sans text-center">Active On Shift</th>
                      <th className="py-2 px-2 normal-case w-[18%] font-sans text-center">Scheduled Leave</th>
                      <th className="py-2 px-2 normal-case w-[18%] font-sans text-right">Avg Dept Wage ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-bold text-slate-900">Pressing &amp; Plant Operations</td>
                      <td className="py-2 px-2 text-center font-mono font-bold">14 Staff</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-emerald-800">13 Active</td>
                      <td className="py-2 px-2 text-center font-mono text-slate-500">1 Leave</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-800">$6.20/hr</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-bold text-slate-900">Packaging &amp; Bottling Line</td>
                      <td className="py-2 px-2 text-center font-mono font-bold">12 Staff</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-emerald-800">11 Active</td>
                      <td className="py-2 px-2 text-center font-mono text-slate-500">1 Leave</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-800">$5.60/hr</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-bold text-slate-900">SuperSonic Fleet Logistics</td>
                      <td className="py-2 px-2 text-center font-mono font-bold">8 Staff</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-emerald-800">8 Active</td>
                      <td className="py-2 px-2 text-center font-mono text-slate-500">0 Leave</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-800">$6.80/hr</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-bold text-slate-900">Commercial Wholesale &amp; CRM</td>
                      <td className="py-2 px-2 text-center font-mono font-bold">5 Staff</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-emerald-800">4 Active</td>
                      <td className="py-2 px-2 text-center font-mono text-slate-500">1 Leave</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-800">$7.50/hr</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-bold text-slate-900">Accounting &amp; Administration</td>
                      <td className="py-2 px-2 text-center font-mono font-bold">3 Staff</td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-emerald-800">2 Active</td>
                      <td className="py-2 px-2 text-center font-mono text-slate-500">1 Leave</td>
                      <td className="py-2 px-2 text-right font-mono text-slate-800">$8.20/hr</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-900 font-bold bg-slate-50 text-[11px]">
                      <td className="py-2 px-2 font-sans text-left">Company Total Workforce:</td>
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
