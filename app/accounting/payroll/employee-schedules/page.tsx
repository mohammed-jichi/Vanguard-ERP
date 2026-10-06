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

  // Tab 2: Manage Schedules State
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [manageSubView, setManageSubView] = useState<'schedule' | 'custom'>('schedule');
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>(STANDARD_SCHEDULE_TEMPLATES[0].name);

  // Custom Designer State
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [isSetSelectedToOff, setIsSetSelectedToOff] = useState<boolean>(false);
  const [customSlots, setCustomSlots] = useState<Array<{ id: string; start: string; end: string }>>([
    { id: '1', start: '08:00', end: '16:30' },
  ]);
  const [applyToAllMonths, setApplyToAllMonths] = useState<boolean>(false);
  const [applyToAllDept, setApplyToAllDept] = useState<boolean>(false);
  const [applyToAllCompany, setApplyToAllCompany] = useState<boolean>(false);
  const [daySelectionError, setDaySelectionError] = useState<boolean>(false);

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

  // Load employees and days off on mount
  useEffect(() => {
    const list = HRPersonnelService.getEmployees();
    setEmployees(list);
    if (list.length > 0 && !selectedEmpId) {
      setSelectedEmpId(list[0].id);
    }
    setDaysOffList(HRPersonnelService.getDaysOff());

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

  // Current Selected Employee for Tab 2
  const activeEmployee = useMemo(() => {
    return employees.find((e) => e.id === selectedEmpId) || employees[0];
  }, [employees, selectedEmpId]);

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

    // Explicit date overrides
    if (emp.schedule?.dateOverrides?.[dateStr]) {
      return emp.schedule.dateOverrides[dateStr];
    }

    // 2. In Schedule Template Mode, derive strictly from selected template
    if (manageSubView === 'schedule') {
      const template = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === selectedTemplateName);
      if (template) {
        if (template.workDays.includes(dayAbbr)) {
          return `${template.slots[0].start} - ${template.slots[0].end}`;
        }
        return 'OFF';
      }
    }

    // 3. Fallback to assigned template
    const templateName =
      emp.schedule?.templateName ||
      selectedTemplateName ||
      STANDARD_SCHEDULE_TEMPLATES[0].name;
    const template = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === templateName);
    if (template) {
      if (template.workDays.includes(dayAbbr)) {
        return `${template.slots[0].start} - ${template.slots[0].end}`;
      }
      return 'OFF';
    }

    // Default: Mon-Sat working, only Sunday OFF (strictly 6-day week)
    if (dayAbbr === 'Sun') {
      return 'OFF';
    }
    return '08:00 - 16:30';
  };

  // Helper to compute total OFF days for an employee in a given month
  const getEmployeeMonthOffDaysCount = (
    emp: HREmployeeRecord | undefined,
    monthIdx: number
  ): number => {
    if (!emp) return 0;
    const daysInMonth = getDaysInMonth(yearNum, monthIdx);
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (getEmployeeShiftForDay(emp, d, monthIdx) === 'OFF') {
        count++;
      }
    }
    return count;
  };

  // Total OFF Days across the entire year for active employee
  const totalYearlyOffDays = useMemo(() => {
    if (!activeEmployee) return 0;
    let total = 0;
    for (let m = 0; m < 12; m++) {
      total += getEmployeeMonthOffDaysCount(activeEmployee, m);
    }
    return total;
  }, [activeEmployee, daysOffList, yearNum, employees, selectedTemplateName, manageSubView]);

  // Sync selectedTemplateName with activeEmployee's assigned template
  useEffect(() => {
    if (activeEmployee?.schedule?.templateName) {
      setSelectedTemplateName(activeEmployee.schedule.templateName);
    }
  }, [activeEmployee?.id, activeEmployee?.schedule?.templateName]);

  // Helper to extract default working shift timing for an employee
  const getDefaultWorkingShift = (emp: HREmployeeRecord, dayAbbr: string): string => {
    const templateName =
      emp.schedule?.templateName ||
      selectedTemplateName ||
      STANDARD_SCHEDULE_TEMPLATES[0].name;
    const template = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === templateName);
    if (template && template.slots && template.slots.length > 0) {
      return `${template.slots[0].start} - ${template.slots[0].end}`;
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

  // Dual View: Copy from Template to Custom
  const handleCopyFromTemplate = () => {
    const tpl = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === selectedTemplateName);
    if (tpl) {
      setSelectedDays(tpl.workDays);
      setCustomSlots(tpl.slots.map((s, idx) => ({ id: String(idx + 1), start: s.start, end: s.end })));
      setIsSetSelectedToOff(false);
      setDaySelectionError(false);
      showToast(`Copied timings from "${tpl.name}".`);
    }
  };

  // Direct Inline ON / OFF Day Toggler
  const handleToggleDayOnOff = (emp: HREmployeeRecord, dayNumber: number) => {
    const dayAbbr = getDayOfWeekAbbr(yearNum, activeMonthIndex, dayNumber);
    const dateStr = `${yearNum}-${(activeMonthIndex + 1).toString().padStart(2, '0')}-${dayNumber
      .toString()
      .padStart(2, '0')}`;
    const currentShift = getEmployeeShiftForDay(emp, dayNumber);
    const isCurrentlyOff = currentShift === 'OFF';

    const updatedOverrides = { ...(emp.schedule?.dateOverrides || {}) };

    if (isCurrentlyOff) {
      // Turn ON: restore to working shift
      const workingShift = getDefaultWorkingShift(emp, dayAbbr);
      updatedOverrides[dateStr] = workingShift;

      // Strip any day-off records for this date
      HRPersonnelService.removeDayOffForEmployeeDate(emp.id, dateStr);
      setDaysOffList(HRPersonnelService.getDaysOff());

      const updatedEmp: HREmployeeRecord = {
        ...emp,
        schedule: {
          ...(emp.schedule || {}),
          dateOverrides: updatedOverrides,
        },
      };

      HRPersonnelService.saveEmployee(updatedEmp);
      setEmployees(HRPersonnelService.getEmployees());
      showToast(`${MONTH_SHORT[activeMonthIndex]} ${dayNumber}: Reverted to active working day (${workingShift}) for ${emp.fullName}.`);
    } else {
      // Turn OFF
      updatedOverrides[dateStr] = 'OFF';

      const quickRecord: DayOffRecord = {
        id: `DO-${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.fullName,
        startDate: dateStr,
        endDate: dateStr,
        reason: 'Personal leave',
        type: 'Full Day',
        paid: 'Yes',
        notes: 'Direct schedule toggle to OFF',
        approved: true,
        createdAt: new Date().toISOString(),
      };

      HRPersonnelService.saveDayOff(quickRecord);
      setDaysOffList(HRPersonnelService.getDaysOff());

      const updatedEmp: HREmployeeRecord = {
        ...emp,
        schedule: {
          ...(emp.schedule || {}),
          dateOverrides: updatedOverrides,
        },
      };

      HRPersonnelService.saveEmployee(updatedEmp);
      setEmployees(HRPersonnelService.getEmployees());
      showToast(`${MONTH_SHORT[activeMonthIndex]} ${dayNumber}: Marked OFF for ${emp.fullName}.`);
    }
  };

  // Apply to Selected Days with Validation and Scope Control
  const handleApplyToSelectedDays = () => {
    // 1. Validate Day Selection
    if (!selectedDays || selectedDays.length === 0) {
      setDaySelectionError(true);
      showToast('Please select at least one day of the week (e.g., Sat, Sun) before applying.');
      return;
    }
    setDaySelectionError(false);

    // 2. Validate Time Slots if not set to OFF
    if (!isSetSelectedToOff) {
      for (const slot of customSlots) {
        if (!slot.start.trim() || !slot.end.trim()) {
          showToast('Please enter valid start and end times for all slots before applying.');
          return;
        }
      }
    }

    if (!activeEmployee) return;

    const slotStr = isSetSelectedToOff
      ? 'OFF'
      : customSlots.map((s) => `${s.start} - ${s.end}`).join(', ');

    // 3. Resolve Target Employees based on Scope Controls
    let targetEmployees: HREmployeeRecord[] = [];
    if (applyToAllCompany) {
      targetEmployees = [...employees];
    } else if (applyToAllDept) {
      targetEmployees = employees.filter((e) => e.department === activeEmployee.department);
    } else {
      // Default: strictly individual employee only
      targetEmployees = [activeEmployee];
    }

    const monthsToProcess = applyToAllMonths
      ? Array.from({ length: 12 }, (_, i) => i)
      : [activeMonthIndex];

    for (const targetEmp of targetEmployees) {
      const updatedOverrides = { ...(targetEmp.schedule?.dateOverrides || {}) };

      for (const mIdx of monthsToProcess) {
        const daysInMonth = getDaysInMonth(yearNum, mIdx);
        for (let day = 1; day <= daysInMonth; day++) {
          const dayAbbr = getDayOfWeekAbbr(yearNum, mIdx, day);
          const dateStr = `${yearNum}-${(mIdx + 1).toString().padStart(2, '0')}-${day
            .toString()
            .padStart(2, '0')}`;

          if (isSetSelectedToOff) {
            if (selectedDays.includes(dayAbbr)) {
              updatedOverrides[dateStr] = 'OFF';
            } else {
              updatedOverrides[dateStr] = getDefaultWorkingShift(targetEmp, dayAbbr);
              HRPersonnelService.removeDayOffForEmployeeDate(targetEmp.id, dateStr);
            }
          } else {
            if (selectedDays.includes(dayAbbr)) {
              updatedOverrides[dateStr] = slotStr;
              HRPersonnelService.removeDayOffForEmployeeDate(targetEmp.id, dateStr);
            } else {
              updatedOverrides[dateStr] = 'OFF';
            }
          }
        }
      }

      const updatedEmp: HREmployeeRecord = {
        ...targetEmp,
        schedule: {
          ...(targetEmp.schedule || {}),
          dateOverrides: updatedOverrides,
        },
      };

      HRPersonnelService.saveEmployee(updatedEmp);
    }

    setDaysOffList(HRPersonnelService.getDaysOff());
    setEmployees(HRPersonnelService.getEmployees());

    if (applyToAllCompany) {
      showToast(`Global override applied to all ${targetEmployees.length} employees across the company.`);
    } else if (applyToAllDept) {
      showToast(`Schedule applied to all ${targetEmployees.length} staff in ${activeEmployee.department}.`);
    } else {
      showToast(`Custom shift schedule applied exclusively for ${activeEmployee.fullName}.`);
    }
  };

  // Reactive Template Selection & Application across month/year
  const handleSelectTemplate = async (templateName: string) => {
    setSelectedTemplateName(templateName);
    const template = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === templateName);
    if (!template || !activeEmployee) return;

    const templateTiming =
      template.slots && template.slots.length > 0
        ? `${template.slots[0].start} - ${template.slots[0].end}`
        : '07:00 - 15:30';

    // 1. Resolve Target Employees based on Scope Controls
    let targetEmployees: HREmployeeRecord[] = [];
    if (applyToAllCompany) {
      targetEmployees = [...employees];
    } else if (applyToAllDept) {
      targetEmployees = employees.filter((e) => e.department === activeEmployee.department);
    } else {
      // Default: strictly individual employee only
      targetEmployees = [activeEmployee];
    }

    const monthsToProcess = applyToAllMonths
      ? Array.from({ length: 12 }, (_, i) => i)
      : [activeMonthIndex];

    for (const targetEmp of targetEmployees) {
      const updatedOverrides = { ...(targetEmp.schedule?.dateOverrides || {}) };

      for (const mIdx of monthsToProcess) {
        const daysInMonth = getDaysInMonth(yearNum, mIdx);
        for (let day = 1; day <= daysInMonth; day++) {
          const dayAbbr = getDayOfWeekAbbr(yearNum, mIdx, day);
          const dateStr = `${yearNum}-${(mIdx + 1).toString().padStart(2, '0')}-${day
            .toString()
            .padStart(2, '0')}`;

          if (template.offDays.includes(dayAbbr) || !template.workDays.includes(dayAbbr)) {
            // Day off according to template
            updatedOverrides[dateStr] = 'OFF';
          } else {
            // Working day according to template
            updatedOverrides[dateStr] = templateTiming;
            // Clear any conflicting day off record for this working date
            HRPersonnelService.removeDayOffForEmployeeDate(targetEmp.id, dateStr);
          }
        }
      }

      const scheduleConfig: EmployeeScheduleConfig = {
        ...(targetEmp.schedule || {}),
        templateName: template.name,
        workDays: template.workDays,
        offDays: template.offDays,
        applyToAllMonths: applyToAllMonths,
        dateOverrides: updatedOverrides,
        daysOff: daysOffList.filter((d) => d.employeeId === targetEmp.id),
      };

      const updatedEmp: HREmployeeRecord = {
        ...targetEmp,
        schedule: scheduleConfig,
        schedule_config: scheduleConfig,
      };

      await HRPersonnelService.saveEmployee(updatedEmp);
    }

    setDaysOffList(HRPersonnelService.getDaysOff());
    setEmployees(HRPersonnelService.getEmployees());

    const monthDesc =
      monthsToProcess.length === 12
        ? 'all 12 months'
        : `${MONTH_NAMES[activeMonthIndex]} ${selectedYear}`;

    if (applyToAllCompany) {
      showToast(
        `Template "${template.name}" applied globally to all ${targetEmployees.length} employees (${monthDesc}).`
      );
    } else if (applyToAllDept) {
      showToast(
        `Template "${template.name}" applied to all ${targetEmployees.length} staff in ${activeEmployee.department} (${monthDesc}).`
      );
    } else {
      showToast(`Template "${template.name}" applied to ${activeEmployee.fullName} (${monthDesc}).`);
    }
  };

  // Save Schedule Handler in Tab 2 with Scope Control
  const handleSaveSchedule = () => {
    if (!activeEmployee) return;
    if (manageSubView === 'schedule') {
      handleSelectTemplate(selectedTemplateName);
    } else {
      handleApplyToSelectedDays();
    }
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
  const handleRevertToWorkingDay = () => {
    const emp = employees.find((e) => e.id === dayOffEmpId) || activeEmployee;
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
    };

    HRPersonnelService.saveEmployee(updatedEmp);
    setEmployees(HRPersonnelService.getEmployees());
    setIsDayOffModalOpen(false);
    showToast(`Day ${dayOffStartDate} reverted to active working hours (${workingShift}) for ${emp.fullName}.`);
  };

  // Check if current date inspected in modal is currently OFF
  const isModalDateCurrentlyOff = useMemo(() => {
    const emp = employees.find((e) => e.id === dayOffEmpId) || activeEmployee;
    if (!emp) return false;
    const dayNum = parseInt(dayOffStartDate.split('-')[2], 10) || 1;
    return getEmployeeShiftForDay(emp, dayNum) === 'OFF';
  }, [employees, dayOffEmpId, activeEmployee, dayOffStartDate, daysOffList, activeMonthIndex, yearNum]);

  // Submit Day Off Request
  const handleSubmitDayOff = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === dayOffEmpId) || activeEmployee;
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
            <Link href="/backoffice" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/accounting" className="hover:text-primary transition-colors">
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
            onClick={() => {
              setEmployees(HRPersonnelService.getEmployees());
              setDaysOffList(HRPersonnelService.getDaysOff());
              showToast('Employee schedules reloaded from master store.');
            }}
            title="Reload from Store"
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
      {/* TAB 2: MANAGE SCHEDULES                                              */}
      {/* ==================================================================== */}
      {activeMainTab === 'manage' && (
        <div className="space-y-4">
          {/* Top Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Department */}
              <div className="w-48">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Production">Production</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Sales">Sales</option>
                  <option value="Distribution">Distribution</option>
                </select>
              </div>

              {/* Employee Selector */}
              <div className="w-56">
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary shadow-2xs cursor-pointer"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.designation})
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div className="w-48">
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary truncate"
                >
                  <option value="Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)">
                    Southern Olive Products
                  </option>
                </select>
              </div>

              {/* Branch */}
              <div className="w-48">
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary truncate"
                >
                  <option value="Southern Olive and Oil Products - Main">
                    Southern Olive and Oil Products - Main
                  </option>
                </select>
              </div>

              {/* Year */}
              <div className="w-28">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveSchedule}
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>

          {/* Month Bar (Jan - Dec) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-2xs flex items-center justify-between gap-1 overflow-x-auto">
            {MONTH_SHORT.map((m, idx) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setActiveMonthIndex(idx);
                  setManageSubView('schedule');
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                  activeMonthIndex === idx
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Dual View Mode & Main Panels Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 2 Cols: Schedule / Custom Designer */}
            <div className="lg:col-span-2 space-y-4">
              {/* Dual View Switcher */}
              <div className="bg-white border border-slate-200 rounded-2xl p-2 flex items-center gap-2 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setManageSubView('schedule')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    manageSubView === 'schedule'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  1. Schedule (Template View)
                </button>
                <button
                  type="button"
                  onClick={() => setManageSubView('custom')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    manageSubView === 'custom'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  2. Custom (Designer View)
                </button>
              </div>

              {/* View 1: Schedule (Template Mode) */}
              {manageSubView === 'schedule' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Shift Schedule Template
                    </h3>
                    <span className="text-xs font-bold text-primary">
                      {MONTH_NAMES[activeMonthIndex]} {selectedYear}
                    </span>
                  </div>

                  {/* Scope Indicator Badge */}
                  <div className="flex items-center justify-between bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Broadcast Scope:</span>
                      {applyToAllCompany ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1.5 shadow-2xs">
                          <Globe className="w-3.5 h-3.5 text-amber-700" />
                          <span>Target: All Employees in Company (Global Override — {employees.length} Staff)</span>
                        </span>
                      ) : applyToAllDept ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-300 font-bold flex items-center gap-1.5 shadow-2xs">
                          <Users className="w-3.5 h-3.5 text-blue-700" />
                          <span>Target: All Staff in Department ({activeEmployee?.department || 'Department'})</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold flex items-center gap-1.5 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Target: {activeEmployee?.fullName} (Individual)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Select Template</label>
                    <select
                      value={selectedTemplateName}
                      onChange={(e) => handleSelectTemplate(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary shadow-2xs cursor-pointer"
                    >
                      {STANDARD_SCHEDULE_TEMPLATES.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Scope Checkboxes for Template Mode */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-slate-100 text-xs font-bold text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={applyToAllMonths}
                        onChange={(e) => setApplyToAllMonths(e.target.checked)}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span>Apply to All Months (Jan - Dec)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={applyToAllDept}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setApplyToAllDept(val);
                          if (val) setApplyToAllCompany(false);
                        }}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span>Apply to All Staff in Department ({activeEmployee?.department})</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={applyToAllCompany}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setApplyToAllCompany(val);
                          if (val) setApplyToAllDept(false);
                        }}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-amber-800">Apply to ALL Employees in Company (Global Override)</span>
                    </label>
                  </div>

                  {/* Template Details Card */}
                  {(() => {
                    const currentTpl = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === selectedTemplateName);
                    return (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Work Days:</span>
                          <span className="font-bold text-slate-800">{currentTpl?.workDays.join(', ')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Daily Timing:</span>
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {currentTpl?.slots[0].start} - {currentTpl?.slots[0].end}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Off Days:</span>
                          <span className="font-bold text-rose-600">{currentTpl?.offDays.join(', ')}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Apply Template Action */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleSelectTemplate(selectedTemplateName)}
                      className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        Apply Template to Schedule {applyToAllMonths ? '(All 12 Months)' : `(${MONTH_NAMES[activeMonthIndex]} ${selectedYear})`}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* View 2: Custom (Designer View) */}
              {manageSubView === 'custom' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Schedule Designer
                    </h3>
                    <span className="text-xs font-bold text-primary">
                      {activeEmployee?.fullName} ({MONTH_NAMES[activeMonthIndex]})
                    </span>
                  </div>

                  {/* Scope Indicator Badge */}
                  <div className="flex items-center justify-between bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Broadcast Scope:</span>
                      {applyToAllCompany ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1.5 shadow-2xs">
                          <Globe className="w-3.5 h-3.5 text-amber-700" />
                          <span>Target: All Employees in Company (Global Override — {employees.length} Staff)</span>
                        </span>
                      ) : applyToAllDept ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-300 font-bold flex items-center gap-1.5 shadow-2xs">
                          <Users className="w-3.5 h-3.5 text-blue-700" />
                          <span>Target: All Staff in Department ({activeEmployee?.department || 'Department'})</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold flex items-center gap-1.5 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Target: {activeEmployee?.fullName} (Individual)</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                      {applyToAllCompany
                        ? 'Updates entire organization'
                        : applyToAllDept
                        ? `Updates ${employees.filter(e => e.department === activeEmployee?.department).length} staff in dept`
                        : 'Changes isolate strictly to this profile'}
                    </span>
                  </div>

                  {/* Copy from Schedule Ribbon */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 shrink-0">Copy from Schedule:</span>
                    <select
                      value={selectedTemplateName}
                      onChange={(e) => setSelectedTemplateName(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg outline-hidden"
                    >
                      {STANDARD_SCHEDULE_TEMPLATES.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleCopyFromTemplate}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>

                  {/* Days Selector with Validation Focus */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 block">
                        Select Days of Week <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
                            setDaySelectionError(false);
                          }}
                          className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                        >
                          Weekdays
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDays(['Sat', 'Sun']);
                            setDaySelectionError(false);
                          }}
                          className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                        >
                          Weekends
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDays([...DAYS_OF_WEEK]);
                            setDaySelectionError(false);
                          }}
                          className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                        >
                          All 7 Days
                        </button>
                      </div>
                    </div>

                    <div
                      className={`flex flex-wrap items-center gap-2 p-2 rounded-2xl transition-all ${
                        daySelectionError
                          ? 'ring-2 ring-rose-500 border border-rose-300 bg-rose-50/50 animate-pulse'
                          : 'border border-transparent'
                      }`}
                    >
                      {DAYS_OF_WEEK.map((d) => {
                        const isSelected = selectedDays.includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => {
                              setDaySelectionError(false);
                              setSelectedDays((prev) =>
                                isSelected ? prev.filter((item) => item !== d) : [...prev, d]
                              );
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-primary text-white border-primary shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>

                    {daySelectionError && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>Please select at least one day of the week (e.g., Sat, Sun) before applying.</span>
                      </div>
                    )}
                  </div>

                  {/* Set Selected Days to OFF Toggle */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="offToggle"
                      checked={isSetSelectedToOff}
                      onChange={(e) => setIsSetSelectedToOff(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <label htmlFor="offToggle" className="text-xs font-bold text-rose-700 cursor-pointer select-none">
                      Set Selected Days to OFF
                    </label>
                  </div>

                  {/* Time Slot Rows (Only active if not OFF) */}
                  {!isSetSelectedToOff && (
                    <div className="space-y-3 pt-1 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">Time Slots</label>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomSlots((prev) => [
                              ...prev,
                              { id: String(Date.now()), start: '17:00', end: '21:00' },
                            ]);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Slot</span>
                        </button>
                      </div>

                      {customSlots.map((slot, idx) => (
                        <div key={slot.id} className="flex items-center gap-3">
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) => {
                                const copy = [...customSlots];
                                copy[idx].start = e.target.value;
                                setCustomSlots(copy);
                              }}
                              className="px-3 py-1.5 text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary flex-1"
                            />
                            <span className="text-xs text-slate-400 font-bold">to</span>
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) => {
                                const copy = [...customSlots];
                                copy[idx].end = e.target.value;
                                setCustomSlots(copy);
                              }}
                              className="px-3 py-1.5 text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary flex-1"
                            />
                          </div>

                          {customSlots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setCustomSlots((prev) => prev.filter((_, i) => i !== idx));
                              }}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border border-rose-100 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Checkboxes: Apply to All Months, Department Staff, and Company-Wide Scope */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-slate-100 text-xs font-bold text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={applyToAllMonths}
                        onChange={(e) => setApplyToAllMonths(e.target.checked)}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span>Apply to All Months (Jan - Dec)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={applyToAllDept}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setApplyToAllDept(val);
                          if (val) setApplyToAllCompany(false);
                        }}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span>Apply to All Staff in Department ({activeEmployee?.department})</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={applyToAllCompany}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setApplyToAllCompany(val);
                          if (val) setApplyToAllDept(false);
                        }}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-amber-800">Apply to ALL Employees in Company (Global Override)</span>
                    </label>
                  </div>

                  {/* Apply Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleApplyToSelectedDays}
                      className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Apply to Selected Days</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 1 Col: Breakdown Panels (Daily Breakdown & Yearly Overview) */}
            <div className="space-y-4">
              {/* Daily Breakdown (Month) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Daily Breakdown ({MONTH_SHORT[activeMonthIndex]})
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500 font-mono">
                    {activeEmployee?.firstName}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map((d) => {
                    const shift = activeEmployee ? getEmployeeShiftForDay(activeEmployee, d) : 'OFF';
                    const isOff = shift === 'OFF';
                    const dayAbbr = getDayOfWeekAbbr(yearNum, activeMonthIndex, d);

                    return (
                      <div
                        key={d}
                        className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-slate-50 text-xs border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-slate-400 font-mono font-bold">{d}</span>
                          <span className="w-8 text-[11px] text-slate-500 font-semibold">{dayAbbr}</span>
                        </div>

                        {isOff ? (
                          <div className="flex items-center gap-1.5">
                            {/* Option A: Quick Revert to Standard Working Shift */}
                            <button
                              type="button"
                              onClick={() => activeEmployee && handleToggleDayOnOff(activeEmployee, d)}
                              title="Click to quickly turn ON (reverts to standard working shift)"
                              className="px-2.5 py-0.5 rounded-md bg-rose-50 hover:bg-emerald-50 text-rose-600 hover:text-emerald-700 border border-rose-200 hover:border-emerald-300 font-black text-[11px] cursor-pointer transition-all flex items-center gap-1 group shadow-2xs"
                            >
                              <span className="group-hover:hidden">OFF</span>
                              <span className="hidden group-hover:inline text-[10px]">Revert ON</span>
                            </button>

                            {/* Option B: Open Apply Day Off Request Modal */}
                            <button
                              type="button"
                              onClick={() => activeEmployee && handleOpenDayOffModal(activeEmployee.id, d)}
                              title="Inspect or edit Day Off request"
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-slate-800 font-bold text-[11px] px-2 py-0.5 rounded-md bg-emerald-50/70 text-emerald-800 border border-emerald-200/70">
                              {shift}
                            </span>
                            <button
                              type="button"
                              onClick={() => activeEmployee && handleToggleDayOnOff(activeEmployee, d)}
                              title="Click to directly toggle to OFF"
                              className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                            >
                              Set OFF
                            </button>
                            <button
                              type="button"
                              onClick={() => activeEmployee && handleOpenDayOffModal(activeEmployee.id, d)}
                              title="Log formal Day Off request"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Yearly Overview Matrix */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Yearly Overview ({selectedYear})
                  </h4>
                  <span className="text-[11px] font-bold text-rose-600">
                    {totalYearlyOffDays} Total OFF Days
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {MONTH_SHORT.map((m, idx) => {
                    const offDaysCount = getEmployeeMonthOffDaysCount(activeEmployee, idx);

                    return (
                      <div
                        key={m}
                        onClick={() => setActiveMonthIndex(idx)}
                        className={`p-2 rounded-xl text-center cursor-pointer border transition-all ${
                          activeMonthIndex === idx
                            ? 'bg-primary/10 border-primary text-primary font-bold shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs font-bold">{m}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {offDaysCount > 0 ? (
                            <span className="text-rose-600 font-bold">{offDaysCount} OFF</span>
                          ) : (
                            '0 OFF'
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: APPLY DAY OFF                                                 */}
      {/* ==================================================================== */}
      {isDayOffModalOpen && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-4 animate-zoomIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-black text-slate-900">
                  Apply Day Off Request
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDayOffModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDayOff} className="space-y-3.5">
              {/* Start Date & End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Start Date</label>
                  <input
                    type="date"
                    required
                    value={dayOffStartDate}
                    onChange={(e) => setDayOffStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">End Date</label>
                  <input
                    type="date"
                    required
                    value={dayOffEndDate}
                    onChange={(e) => setDayOffEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Reason Dropdown (10 reasons) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Reason</label>
                <select
                  value={dayOffReason}
                  onChange={(e) => setDayOffReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl"
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
                <label className="text-xs font-bold text-slate-700 block">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDayOffType('Full Day')}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      dayOffType === 'Full Day'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Full Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setDayOffType('Partial')}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      dayOffType === 'Partial'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Partial
                  </button>
                </div>
              </div>

              {/* Hours Off (If partial) */}
              {dayOffType === 'Partial' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Hours Off</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={dayOffHours}
                    onChange={(e) => setDayOffHours(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              )}

              {/* Paid: Yes / No */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Paid</label>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-800">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="dayOffPaid"
                      checked={dayOffPaid === 'Yes'}
                      onChange={() => setDayOffPaid('Yes')}
                      className="text-primary"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="dayOffPaid"
                      checked={dayOffPaid === 'No'}
                      onChange={() => setDayOffPaid('No')}
                      className="text-primary"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {/* Notes Textarea */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Notes</label>
                <textarea
                  rows={2}
                  value={dayOffNotes}
                  onChange={(e) => setDayOffNotes(e.target.value)}
                  placeholder="Optional remarks for HR review..."
                  className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                {isModalDateCurrentlyOff ? (
                  <button
                    type="button"
                    onClick={handleRevertToWorkingDay}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer"
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
