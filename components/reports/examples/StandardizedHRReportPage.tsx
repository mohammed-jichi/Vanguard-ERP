'use client';

import React, { useState, useMemo } from 'react';
import ReportPageLayout, {
  ReportHeader,
  ExportButtons,
  ReportFilters,
  ReportSelectFilter,
  ReportMetricCards,
  ReportTableWrapper,
  MetricCardItem,
} from '@/components/reports/ReportPageLayout';
import { Users, Clock, DollarSign, Activity } from 'lucide-react';
import {
  getDefaultInitialDateRange,
  resolveDateRangeFromPreset,
} from '@/lib/dateRangeEngine';

interface AttendanceRecord {
  empId: string;
  name: string;
  dept: string;
  shift: string;
  punch: string;
  workedHours: number;
  overtimeHours: number;
  status: 'Present' | 'Present (OT)' | 'Late' | 'Absent';
  hourlyRate: number;
  laborCost: number;
}

const mockAttendanceData: AttendanceRecord[] = [
  {
    empId: 'EMP-001',
    name: 'Youssef Abboud',
    dept: 'Pressing & Plant Operations',
    shift: '07:00 - 15:30',
    punch: '06:55 - 17:30',
    workedHours: 10.5,
    overtimeHours: 2.0,
    status: 'Present (OT)',
    hourlyRate: 6.5,
    laborCost: 68.25,
  },
  {
    empId: 'EMP-002',
    name: 'Laila Harb',
    dept: 'Accounting & Administration',
    shift: '08:00 - 16:30',
    punch: '07:58 - 16:32',
    workedHours: 8.5,
    overtimeHours: 0.0,
    status: 'Present',
    hourlyRate: 8.0,
    laborCost: 68.0,
  },
  {
    empId: 'EMP-003',
    name: 'Nabil Sleiman',
    dept: 'Packaging & Bottling Line',
    shift: '07:00 - 15:30',
    punch: '07:02 - 15:30',
    workedHours: 8.5,
    overtimeHours: 0.0,
    status: 'Present',
    hourlyRate: 5.5,
    laborCost: 46.75,
  },
  {
    empId: 'EMP-004',
    name: 'Ziad Kassis',
    dept: 'SuperSonic Fleet Logistics',
    shift: '06:30 - 15:00',
    punch: '06:25 - 16:15',
    workedHours: 9.8,
    overtimeHours: 1.3,
    status: 'Present (OT)',
    hourlyRate: 6.0,
    laborCost: 58.8,
  },
  {
    empId: 'EMP-005',
    name: 'Rami Haddad',
    dept: 'Sales & Commercial Wholesale',
    shift: '08:30 - 17:00',
    punch: '08:42 - 17:05',
    workedHours: 8.2,
    overtimeHours: 0.0,
    status: 'Late',
    hourlyRate: 7.5,
    laborCost: 61.5,
  },
  {
    empId: 'EMP-006',
    name: 'Ahmad Zein',
    dept: 'Pressing & Plant Operations',
    shift: '07:00 - 15:30',
    punch: '06:58 - 15:30',
    workedHours: 8.5,
    overtimeHours: 0.0,
    status: 'Present',
    hourlyRate: 5.8,
    laborCost: 49.3,
  },
];

export default function StandardizedHRReportPage() {
  // State for Filters
  const initialDateRange = getDefaultInitialDateRange('This Month');
  const [searchQuery, setSearchQuery] = useState('');
  const [period, setPeriod] = useState(initialDateRange.preset);
  const [fromDate, setFromDate] = useState(initialDateRange.fromDate);
  const [toDate, setToDate] = useState(initialDateRange.toDate);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // State for Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter Logic
  const filteredRecords = useMemo(() => {
    return mockAttendanceData.filter((rec) => {
      const matchesSearch =
        searchQuery === '' ||
        rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.dept.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === 'ALL' || rec.dept === selectedDept;
      const matchesStatus = selectedStatus === 'ALL' || rec.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [searchQuery, selectedDept, selectedStatus]);

  // Paginated Slice
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;

  // Aggregate Metrics for KPI Cards
  const totalEmployees = filteredRecords.length;
  const totalHoursWorked = filteredRecords.reduce((sum, r) => sum + r.workedHours, 0);
  const totalOvertime = filteredRecords.reduce((sum, r) => sum + r.overtimeHours, 0);
  const totalLaborCost = filteredRecords.reduce((sum, r) => sum + r.laborCost, 0);

  const kpiMetrics: MetricCardItem[] = [
    {
      title: 'Employees Logged',
      value: totalEmployees,
      subtext: 'Active biometric terminals',
      icon: <Users className="w-5 h-5" />,
      change: { value: '+4 vs yesterday', trend: 'up' },
    },
    {
      title: 'Total Shift Hours',
      value: `${totalHoursWorked.toFixed(1)} hrs`,
      subtext: 'Reconciled working time',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      title: 'Overtime Logged',
      value: `${totalOvertime.toFixed(1)} hrs`,
      subtext: 'Shift extension audits',
      icon: <Activity className="w-5 h-5" />,
      change: { value: 'Within budget', trend: 'neutral' },
    },
    {
      title: 'Direct Labor Cost',
      value: `$${totalLaborCost.toFixed(2)}`,
      subtext: 'Gross shift payout liability',
      icon: <DollarSign className="w-5 h-5" />,
      change: { value: '-2.4%', trend: 'down' },
    },
  ];

  return (
    <ReportPageLayout
      // 1. Unified Header
      header={
        <ReportHeader
          title="Monthly Biometric Attendance & Payroll Reconciliation"
          subtitle="Department shift hours, ZKTeco biometric punches, overtime audits, and payroll labor costs."
          reportCode="REP_HR_001"
          badgeText="Active Shift Cycle"
          badgeVariant="success"
          breadcrumbs={[
            { label: 'Home', href: '/backoffice' },
            { label: '7. HR & Payroll', href: '/backoffice/hr' },
            { label: 'Attendance Reports' },
          ]}
          actions={
            <ExportButtons
              onExportPdf={() => alert('Exporting PDF...')}
              onPrint={() => window.print()}
              onExportExcel={() => alert('Exporting Excel spreadsheet...')}
              onExportCsv={() => alert('Exporting CSV...')}
            />
          }
        />
      }
      // 2. Unified KPI Metric Cards
      metrics={<ReportMetricCards metrics={kpiMetrics} />}
      // 3. Unified Filter Bar
      filters={
        <ReportFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by employee name, ID or department..."
          period={period}
          onPeriodChange={setPeriod}
          fromDate={fromDate}
          toDate={toDate}
          onDateRangeChange={(from, to) => {
            setFromDate(from);
            setToDate(to);
          }}
          onApplyFilters={() => alert('Filters applied.')}
          onResetFilters={() => {
            const defRange = getDefaultInitialDateRange('This Month');
            setSearchQuery('');
            setSelectedDept('ALL');
            setSelectedStatus('ALL');
            setPeriod(defRange.preset);
            setFromDate(defRange.fromDate);
            setToDate(defRange.toDate);
          }}
        >
          {/* Department Select Filter */}
          <ReportSelectFilter
            id="dept-filter"
            label="Department"
            value={selectedDept}
            onChange={setSelectedDept}
            placeholder="All Departments"
            options={[
              { label: 'Pressing & Plant Operations', value: 'Pressing & Plant Operations' },
              { label: 'Packaging & Bottling Line', value: 'Packaging & Bottling Line' },
              { label: 'SuperSonic Fleet Logistics', value: 'SuperSonic Fleet Logistics' },
              { label: 'Sales & Commercial Wholesale', value: 'Sales & Commercial Wholesale' },
              { label: 'Accounting & Administration', value: 'Accounting & Administration' },
            ]}
          />

          {/* Status Select Filter */}
          <ReportSelectFilter
            id="status-filter"
            label="Punch Status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            placeholder="All Statuses"
            className="w-36"
            options={[
              { label: 'Present', value: 'Present' },
              { label: 'Present (OT)', value: 'Present (OT)' },
              { label: 'Late', value: 'Late' },
              { label: 'Absent', value: 'Absent' },
            ]}
          />
        </ReportFilters>
      }
      // 4. Unified Data Table Area
      table={
        <ReportTableWrapper
          title="Biometric Punch Log Details"
          subtitle="ZKTeco Terminal records synced from Choueifat Plant & Nabatieh Depots"
          totalRecordsCount={filteredRecords.length}
          pagination={{
            currentPage,
            totalPages,
            pageSize,
            totalRecords: filteredRecords.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
          }}
        >
          <table>
            <thead>
              <tr>
                <th className="w-[18%]">Emp ID &amp; Name</th>
                <th className="w-[20%]">Department</th>
                <th className="w-[13%] text-center">Scheduled Shift</th>
                <th className="w-[15%] text-center">Actual Punch</th>
                <th className="w-[10%] text-center">Worked Time</th>
                <th className="w-[8%] text-center">Overtime</th>
                <th className="w-[8%] text-center">Status</th>
                <th className="w-[8%] text-right">Labor Cost</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((log) => (
                <tr key={log.empId}>
                  <td className="font-bold text-slate-900 dark:text-slate-100">
                    <span className="font-mono text-xs text-slate-500 mr-1.5 font-normal">
                      {log.empId}
                    </span>
                    {log.name}
                  </td>
                  <td className="text-slate-600 dark:text-slate-300">{log.dept}</td>
                  <td className="text-center font-mono text-xs text-slate-500">{log.shift}</td>
                  <td className="text-center font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {log.punch}
                  </td>
                  <td className="text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                    {log.workedHours.toFixed(1)} hrs
                  </td>
                  <td className="text-center font-mono text-amber-700 dark:text-amber-400 font-semibold text-xs">
                    {log.overtimeHours > 0 ? `+${log.overtimeHours.toFixed(1)} hrs` : '-'}
                  </td>
                  <td className="text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-bold ${
                        log.status === 'Present (OT)'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300'
                          : log.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : log.status === 'Late'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="text-right font-mono font-bold text-foreground">
                    ${log.laborCost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="uppercase text-xs font-bold text-slate-700 dark:text-slate-300">
                  Consolidated Shift Payout Total ({filteredRecords.length} Employees):
                </td>
                <td className="text-center font-mono font-bold text-slate-900 dark:text-slate-100">
                  {totalHoursWorked.toFixed(1)} hrs
                </td>
                <td className="text-center font-mono font-bold text-amber-800 dark:text-amber-400">
                  {totalOvertime.toFixed(1)} hrs
                </td>
                <td className="text-center font-bold text-xs text-emerald-700">100% Synced</td>
                <td className="text-right font-mono font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                  ${totalLaborCost.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </ReportTableWrapper>
      }
    >
      {/* Fallback child content if not using table slot */}
    </ReportPageLayout>
  );
}
