'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  HREmployeeRecord,
  HRPersonnelService,
  DayOffRecord,
  EmployeeScheduleConfig,
  STANDARD_SCHEDULE_TEMPLATES,
} from '@/lib/hrPersonnelService';
import ScheduleDesigner from '@/components/modules/hr/ScheduleDesigner';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  Users,
  Building,
  Check,
  X,
  CalendarDays,
  FileText,
  Globe,
} from 'lucide-react';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DAY_OFF_REASONS = [
  'Annual leave',
  'Family emergency',
  'Force majeure',
  'Leave without pay',
  'Marriage leave',
  'Maternity leave',
  'Medical appointment',
  'Personal leave',
  'Sick leave',
  'Weather or transport disruption',
  'Work-related injury leave',
];

// Calculate days in month for 2026
function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Get day abbreviation for specific date
function getDayOfWeekAbbr(year: number, monthIndex: number, day: number): string {
  const d = new Date(year, monthIndex, day);
  const dayIndex = d.getDay(); // 0 is Sun, 1 is Mon...
  const map = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return map[dayIndex];
}

export default function EmployeeSchedulesPage() {
  // Main Tab State: 'team' | 'manage'
  const [activeMainTab, setActiveMainTab] = useState<'team' | 'manage'>('team');

  // Employees from HR Store
  const [employees, setEmployees] = useState<HREmployeeRecord[]>([]);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [brandFilter, setBrandFilter] = useState('Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)');
  const [branchFilter, setBranchFilter] = useState('Southern Olive and Oil Products - Main');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [activeMonthIndex, setActiveMonthIndex] = useState(0); // 0 = Jan 2026

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tab 2: Selected Employee ID for ScheduleDesigner
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');

  // Apply Day Off Modal State
  const [isDayOffModalOpen, setIsDayOffModalOpen] = useState(false);
  const [dayOffEmpId, setDayOffEmpId] = useState<string>('');
  const [dayOffStartDate, setDayOffStartDate] = useState<string>('2026-01-01');
  const [dayOffEndDate, setDayOffEndDate] = useState<string>('2026-01-01');
  const [dayOffReason, setDayOffReason] = useState<string>(DAY_OFF_REASONS[0]);
  const [dayOffType, setDayOffType] = useState<'Full Day' | 'Partial'>('Full Day');
  const [dayOffHours, setDayOffHours] = useState<number>(4);
  const [dayOffPaid, setDayOffPaid] = useState<'Yes' | 'No'>('Yes');
  const [dayOffNotes, setDayOffNotes] = useState<string>('');

  // Days off records from store
  const [daysOffList, setDaysOffList] = useState<DayOffRecord[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load employees and days off on mount with authoritative Supabase reconciliation
  useEffect(() => {
    const list = HRPersonnelService.getEmployees();
    setEmployees(list);
    if (list.length > 0 && !selectedEmpId) {
      setSelectedEmpId(list[0].id);
    }
    setDaysOffList(HRPersonnelService.getDaysOff());

    // Authoritative remote fetch immediately overrides local cache (Part 1)
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.onLine) {
      HRPersonnelService.fetchEmployees()
        .then((remote) => {
          if (Array.isArray(remote)) {
            setEmployees(remote);
            if (remote.length > 0 && !selectedEmpId) {
              setSelectedEmpId(remote[0].id);
            }
          }
        })
        .catch((err) => {
          console.warn('[EmployeeSchedulesPage] Background Supabase fetch notice:', err);
        });
    }

    const handleHREvent = (e: any) => {
      if (e.detail) setEmployees(e.detail);
    };
    const handleDayOffEvent = (e: any) => {
      if (e.detail) setDaysOffList(e.detail);
    };

    window.addEventListener('vanguard_hr_employees_updated', handleHREvent);
    window.addEventListener('vanguard_day_off_updated', handleDayOffEvent);
    return () => {
      window.removeEventListener('vanguard_hr_employees_updated', handleHREvent);
      window.removeEventListener('vanguard_day_off_updated', handleDayOffEvent);
    };
  }, []);

  // Global Escape key listener for isDayOffModalOpen
  useEffect(() => {
    if (!isDayOffModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDayOffModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDayOffModalOpen]);

  // Filtered employees for Team Schedule
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = emp.fullName.toLowerCase().includes(q);
        const matchesPhone = emp.phone.includes(q);
        if (!matchesName && !matchesPhone) return false;
      }
      if (deptFilter !== 'ALL' && emp.department !== deptFilter) {
        return false;
      }
      return true;
    });
  }, [employees, searchQuery, deptFilter]);

  // Current Month Days Count
  const yearNum = parseInt(selectedYear, 10) || 2026;
  const daysInCurrentMonth = getDaysInMonth(yearNum, activeMonthIndex);

  // Compute shift timing for employee on a specific day (supports arbitrary month)
  const getEmployeeShiftForDay = (
    emp: HREmployeeRecord,
    dayNumber: number,
    monthIdx: number = activeMonthIndex
  ): string => {
    const dayAbbr = getDayOfWeekAbbr(yearNum, monthIdx, dayNumber);
    const dateStr = `${yearNum}-${(monthIdx + 1).toString().padStart(2, '0')}-${dayNumber
      .toString()
      .padStart(2, '0')}`;

    // 1. Explicit date overrides take top precedence
    if (emp.schedule?.dateOverrides?.[dateStr]) {
      return emp.schedule.dateOverrides[dateStr];
    }

    // 2. Check if employee has a day off recorded for this date
    const hasDayOff = daysOffList.some(
      (d) =>
        d.employeeId === emp.id &&
        dateStr >= d.startDate &&
        dateStr <= d.endDate
    );
    if (hasDayOff) {
      return 'OFF';
    }

    // 3. Fallback to assigned template
    const templateName = emp.schedule?.templateName || STANDARD_SCHEDULE_TEMPLATES[0].name;
    const template = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === templateName);
    if (template) {
      if (template.dailySchedule && template.dailySchedule[dayAbbr]) {
        return template.dailySchedule[dayAbbr];
      }
      if (template.workDays.includes(dayAbbr)) {
        return template.timing || `${template.slots[0].start} - ${template.slots[0].end}`;
      }
      return 'OFF';
    }

    // Default: Mon-Sat working, only Sunday OFF (strictly 6-day week)
    if (dayAbbr === 'Sun') {
      return 'OFF';
    }
    return '08:00 - 16:30';
  };

  // Helper to extract default working shift timing for an employee
  const getDefaultWorkingShift = (emp: HREmployeeRecord, dayAbbr: string): string => {
    const templateName = emp.schedule?.templateName || STANDARD_SCHEDULE_TEMPLATES[0].name;
    const template = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === templateName);
    if (template) {
      if (template.dailySchedule && template.dailySchedule[dayAbbr] && template.dailySchedule[dayAbbr] !== 'OFF') {
        return template.dailySchedule[dayAbbr];
      }
      if (template.timing) return template.timing;
      if (template.slots && template.slots.length > 0) {
        return `${template.slots[0].start} - ${template.slots[0].end}`;
      }
    }
    return '08:00 - 16:30';
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    setActiveMonthIndex((prev) => (prev > 0 ? prev - 1 : 11));
  };

  const handleNextMonth = () => {
    setActiveMonthIndex((prev) => (prev < 11 ? prev + 1 : 0));
  };

  // Open Apply Day Off Modal
  const handleOpenDayOffModal = (empId: string, day: number) => {
    setDayOffEmpId(empId);
    const dateStr = `${yearNum}-${(activeMonthIndex + 1).toString().padStart(2, '0')}-${day
      .toString()
      .padStart(2, '0')}`;
    setDayOffStartDate(dateStr);
    setDayOffEndDate(dateStr);
    setDayOffReason(DAY_OFF_REASONS[0]);
    setDayOffType('Full Day');
    setDayOffHours(4);
    setDayOffPaid('Yes');
    setDayOffNotes('');
    setIsDayOffModalOpen(true);
  };

  // Revert Day Off Back to Working Day in Modal
  const handleRevertToWorkingDay = async () => {
    const emp = employees.find((e) => e.id === dayOffEmpId) || employees[0];
    if (!emp) return;

    // 1. Remove day off records for this employee on this date
    HRPersonnelService.removeDayOffForEmployeeDate(emp.id, dayOffStartDate);
    setDaysOffList(HRPersonnelService.getDaysOff());

    // 2. Set date override to working shift
    const dayNum = parseInt(dayOffStartDate.split('-')[2], 10) || 1;
    const dayAbbr = getDayOfWeekAbbr(yearNum, activeMonthIndex, dayNum);
    const workingShift = getDefaultWorkingShift(emp, dayAbbr);

    const updatedOverrides = { ...(emp.schedule?.dateOverrides || {}) };
    updatedOverrides[dayOffStartDate] = workingShift;

    const updatedEmp: HREmployeeRecord = {
      ...emp,
      schedule: {
        ...(emp.schedule || {}),
        dateOverrides: updatedOverrides,
      },
      schedule_config: {
        ...(emp.schedule || {}),
        dateOverrides: updatedOverrides,
      },
    };

    await HRPersonnelService.saveEmployee(updatedEmp);
    setEmployees(HRPersonnelService.getEmployees());
    setIsDayOffModalOpen(false);
    showToast(`Day ${dayOffStartDate} reverted to active working hours (${workingShift}) for ${emp.fullName}.`);
  };

  // Check if current date inspected in modal is currently OFF
  const isModalDateCurrentlyOff = useMemo(() => {
    const emp = employees.find((e) => e.id === dayOffEmpId) || employees[0];
    if (!emp) return false;
    const dayNum = parseInt(dayOffStartDate.split('-')[2], 10) || 1;
    return getEmployeeShiftForDay(emp, dayNum) === 'OFF';
  }, [employees, dayOffEmpId, dayOffStartDate, daysOffList, activeMonthIndex, yearNum]);

  // Submit Day Off Request
  const handleSubmitDayOff = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === dayOffEmpId) || employees[0];
    if (!emp) return;

    const record: DayOffRecord = {
      id: `DO-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.fullName,
      startDate: dayOffStartDate,
      endDate: dayOffEndDate,
      reason: dayOffReason as any,
      type: dayOffType,
      hoursOff: dayOffType === 'Partial' ? dayOffHours : undefined,
      paid: dayOffPaid,
      notes: dayOffNotes.trim() || undefined,
      approved: true,
      createdAt: new Date().toISOString(),
    };

    HRPersonnelService.saveDayOff(record);
    setDaysOffList(HRPersonnelService.getDaysOff());
    setIsDayOffModalOpen(false);
    showToast(`Day off request approved and logged for ${emp.fullName}.`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 min-h-screen bg-slate-50/50 pb-24">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-70 flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-primary" />
            <span>Employee Schedule Manager</span>
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
            <Link prefetch={false} href="/backoffice" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link prefetch={false} href="/accounting" className="hover:text-primary transition-colors">
              Accounting & Payroll
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">Employee Schedules</span>
          </div>
        </div>

        {/* Top Actions: Reload, Export, Print */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              const list = await HRPersonnelService.fetchEmployees();
              setEmployees(list);
              setDaysOffList(HRPersonnelService.getDaysOff());
              showToast('Employee schedules reloaded from database.');
            }}
            title="Reload from Database"
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Reload</span>
          </button>

          <button
            type="button"
            onClick={() => {
              showToast('Exporting schedule matrix to Excel (.xlsx)...');
            }}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export to Excel</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Main Tabs: Team Schedule & Manage Schedules */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        <button
          type="button"
          onClick={() => setActiveMainTab('team')}
          className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeMainTab === 'team'
              ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Schedule</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMainTab('manage')}
          className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeMainTab === 'manage'
              ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Manage Schedules</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: TEAM SCHEDULE                                                 */}
      {/* ==================================================================== */}
      {activeMainTab === 'team' && (
        <div className="space-y-4">
          {/* Filter Ribbon */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, family, phone"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-primary font-medium"
              />
            </div>

            {/* Department Dropdown */}
            <div>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer"
              >
                <option value="ALL">Show All Departments</option>
                <option value="Production">Production</option>
                <option value="Accounting">Accounting</option>
                <option value="Sales">Sales</option>
                <option value="Distribution">Distribution</option>
                <option value="HR Human Resources">HR Human Resources</option>
                <option value="IT Information Technology">IT Information Technology</option>
                <option value="Owners">Owners</option>
              </select>
            </div>

            {/* Brand Dropdown */}
            <div>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer truncate"
              >
                <option value="Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)">
                  Southern Olive & Oil Products
                </option>
              </select>
            </div>

            {/* Branch Dropdown */}
            <div>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer truncate"
              >
                <option value="Southern Olive and Oil Products - Main">
                  Southern Olive and Oil Products - Main
                </option>
              </select>
            </div>

            {/* Year Selector */}
            <div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer"
              >
                <option value="2026">Payroll Year 2026</option>
                <option value="2027">Payroll Year 2027</option>
              </select>
            </div>
          </div>

          {/* Month Navigation Ribbon */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs flex items-center justify-between gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 flex-1 justify-center overflow-x-auto py-1">
              {MONTH_SHORT.map((m, idx) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setActiveMonthIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeMonthIndex === idx
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Team Schedule Matrix Table with Horizontal Scroll */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-bold text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 min-w-[200px] sticky left-0 bg-slate-50 z-10 shadow-r">
                      Employee Name
                    </th>
                    <th className="py-3 px-4 min-w-[140px]">Brand Name</th>
                    <th className="py-3 px-4 min-w-[160px]">Branch Name</th>

                    {/* Daily Calendar Columns */}
                    {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map((d) => {
                      const dayAbbr = getDayOfWeekAbbr(yearNum, activeMonthIndex, d);
                      const isWeekend = dayAbbr === 'Sat' || dayAbbr === 'Sun';
                      return (
                        <th
                          key={d}
                          className={`py-2 px-2.5 text-center min-w-[85px] border-l border-slate-100 ${
                            isWeekend ? 'bg-slate-100/70 text-slate-800 font-black' : ''
                          }`}
                        >
                          <div className="text-[10px] text-slate-400 font-semibold">{dayAbbr}</div>
                          <div className="text-xs font-bold text-slate-800">{d}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Employee Name (Sticky) */}
                      <td className="py-3 px-4 sticky left-0 bg-white hover:bg-slate-50 z-10 shadow-r">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                            {emp.firstName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{emp.fullName}</div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {emp.designation}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Brand Name */}
                      <td className="py-3 px-4 text-slate-600 font-medium truncate max-w-[140px]">
                        Southern Olive
                      </td>

                      {/* Branch Name */}
                      <td className="py-3 px-4 text-slate-600 font-medium truncate max-w-[160px]">
                        Choueifat Plant
                      </td>

                      {/* Day Cells */}
                      {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map((d) => {
                        const shift = getEmployeeShiftForDay(emp, d);
                        const isOff = shift === 'OFF';
                        const dayAbbr = getDayOfWeekAbbr(yearNum, activeMonthIndex, d);
                        const isWeekend = dayAbbr === 'Sat' || dayAbbr === 'Sun';

                        return (
                          <td
                            key={d}
                            className={`py-2.5 px-1.5 text-center border-l border-slate-100 ${
                              isWeekend ? 'bg-slate-50/30' : ''
                            }`}
                          >
                            {isOff ? (
                              <button
                                type="button"
                                onClick={() => handleOpenDayOffModal(emp.id, d)}
                                title="Click to inspect or apply Day Off record"
                                className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black cursor-pointer hover:bg-rose-100 transition-colors"
                              >
                                OFF
                              </button>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold whitespace-nowrap">
                                {shift}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: MANAGE SCHEDULES (SHARED SCHEDULE DESIGNER ENGINE)            */}
      {/* ==================================================================== */}
      {activeMainTab === 'manage' && (
        <ScheduleDesigner
          initialEmployeeId={selectedEmpId}
          onEmployeeSelect={(empId) => setSelectedEmpId(empId)}
          onSaveSuccess={() => {
            setEmployees(HRPersonnelService.getEmployees());
            setDaysOffList(HRPersonnelService.getDaysOff());
            showToast('Schedules saved and synchronized successfully.');
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* MODAL: APPLY DAY OFF (Universal Viewport Contract)                    */}
      {/* ==================================================================== */}
      {isDayOffModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsDayOffModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md max-h-[90vh] flex flex-col bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Header - Fixed/Pinned */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Apply Day Off Request
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDayOffModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-2 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body with Pinned Footer */}
            <form onSubmit={handleSubmitDayOff} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Start Date & End Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Start Date</label>
                    <input
                      type="date"
                      required
                      value={dayOffStartDate}
                      onChange={(e) => setDayOffStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">End Date</label>
                    <input
                      type="date"
                      required
                      value={dayOffEndDate}
                      onChange={(e) => setDayOffEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                    />
                  </div>
                </div>

                {/* Reason Dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Reason</label>
                  <select
                    value={dayOffReason}
                    onChange={(e) => setDayOffReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer outline-hidden"
                  >
                    {DAY_OFF_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type: Full Day / Partial */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDayOffType('Full Day')}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        dayOffType === 'Full Day'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Full Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setDayOffType('Partial')}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        dayOffType === 'Partial'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Partial
                    </button>
                  </div>
                </div>

                {/* Hours Off (If partial) */}
                {dayOffType === 'Partial' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Hours Off</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={dayOffHours}
                      onChange={(e) => setDayOffHours(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                    />
                  </div>
                )}

                {/* Paid: Yes / No */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Paid</label>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-800">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="dayOffPaid"
                        checked={dayOffPaid === 'Yes'}
                        onChange={() => setDayOffPaid('Yes')}
                        className="text-slate-900 focus:ring-emerald-500"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="dayOffPaid"
                        checked={dayOffPaid === 'No'}
                        onChange={() => setDayOffPaid('No')}
                        className="text-slate-900 focus:ring-emerald-500"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                {/* Notes Textarea */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Notes</label>
                  <textarea
                    rows={2}
                    value={dayOffNotes}
                    onChange={(e) => setDayOffNotes(e.target.value)}
                    placeholder="Optional remarks for HR review..."
                    className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Actions - Pinned Footer */}
              <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/80">
                {isModalDateCurrentlyOff ? (
                  <button
                    type="button"
                    onClick={handleRevertToWorkingDay}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Remove OFF status and restore standard working hours"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Revert to Working Day</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDayOffModalOpen(false)}
                    className="text-slate-700 hover:bg-slate-200/70 border border-slate-200 rounded-lg px-4 py-2 font-medium transition cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm rounded-lg px-5 py-2 font-medium transition cursor-pointer text-xs"
                  >
                    Save Request
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
