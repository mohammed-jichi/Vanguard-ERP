'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  HREmployeeRecord,
  HRPersonnelService,
  DayOffRecord,
  EmployeeScheduleConfig,
  ShiftTemplate,
  DEFAULT_SHIFT_TEMPLATES,
  STANDARD_SCHEDULE_TEMPLATES,
  calculateMonthOffDays,
  generateFullYearMatrix,
} from '@/lib/hrPersonnelService';

export {
  type ShiftTemplate,
  DEFAULT_SHIFT_TEMPLATES,
  calculateMonthOffDays,
  generateFullYearMatrix,
};
import {
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  Users,
  Globe,
  Check,
  X,
  Plus,
  Trash2,
  FileText,
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

// Helper: Calculate days in month
function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Helper: Get day abbreviation for specific date
function getDayOfWeekAbbr(year: number, monthIndex: number, day: number): string {
  const d = new Date(year, monthIndex, day);
  const dayIndex = d.getDay(); // 0 is Sun, 1 is Mon...
  const map = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return map[dayIndex];
}

export interface ScheduleDesignerProps {
  initialEmployeeId?: string;
  onEmployeeSelect?: (empId: string) => void;
  onSaveSuccess?: () => void;
  showTopBar?: boolean;
}

export default function ScheduleDesigner({
  initialEmployeeId,
  onEmployeeSelect,
  onSaveSuccess,
  showTopBar = true,
}: ScheduleDesignerProps) {
  // Master HR Data State
  const [employees, setEmployees] = useState<HREmployeeRecord[]>([]);
  const [daysOffList, setDaysOffList] = useState<DayOffRecord[]>([]);

  // Top Selectors State
  const [selectedEmpId, setSelectedEmpId] = useState<string>(initialEmployeeId || '');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [brandFilter, setBrandFilter] = useState<string>(
    'Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)'
  );
  const [branchFilter, setBranchFilter] = useState<string>(
    'Southern Olive and Oil Products - Main'
  );
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [activeMonthIndex, setActiveMonthIndex] = useState<number>(0); // 0 = Jan 2026

  // Sub View: 'schedule' (Template View) | 'custom' (Designer View)
  const [manageSubView, setManageSubView] = useState<'schedule' | 'custom'>('schedule');
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>(
    STANDARD_SCHEDULE_TEMPLATES[0].name
  );

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

  // Toast & Saving State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load employees and days off on mount
  useEffect(() => {
    const list = HRPersonnelService.getEmployees();
    setEmployees(list);
    if (list.length > 0 && !selectedEmpId) {
      const defaultId = initialEmployeeId || list[0].id;
      setSelectedEmpId(defaultId);
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
  }, [initialEmployeeId, selectedEmpId]);

  // Sync external initialEmployeeId
  useEffect(() => {
    if (initialEmployeeId) {
      setSelectedEmpId(initialEmployeeId);
    }
  }, [initialEmployeeId]);

  // Current Selected Employee
  const activeEmployee = useMemo(() => {
    return employees.find((e) => e.id === selectedEmpId) || employees[0];
  }, [employees, selectedEmpId]);

  // Department Head Count for Dynamic Scope Indicator
  const deptStaffCount = useMemo(() => {
    if (!activeEmployee?.department) return 0;
    return employees.filter((e) => e.department === activeEmployee.department).length;
  }, [employees, activeEmployee?.department]);

  // Dynamically synchronize selected employee with department filter
  useEffect(() => {
    if (deptFilter !== 'ALL') {
      const deptEmployees = employees.filter((e) => e.department === deptFilter);
      if (deptEmployees.length > 0) {
        const isCurrentInDept = deptEmployees.some((e) => e.id === selectedEmpId);
        if (!isCurrentInDept) {
          setSelectedEmpId(deptEmployees[0].id);
          if (onEmployeeSelect) onEmployeeSelect(deptEmployees[0].id);
        }
      }
    }
  }, [deptFilter, employees, selectedEmpId, onEmployeeSelect]);

  // Current Month Days Count
  const yearNum = parseInt(selectedYear, 10) || 2026;
  const daysInCurrentMonth = getDaysInMonth(yearNum, activeMonthIndex);

  // Sync selectedTemplateName & selectedDays when activeEmployee changes
  useEffect(() => {
    if (activeEmployee?.schedule?.templateName) {
      const tplName = activeEmployee.schedule.templateName;
      setSelectedTemplateName(tplName);
      const tpl = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === tplName);
      if (tpl) {
        setSelectedDays(isSetSelectedToOff ? [...tpl.offDays] : [...tpl.workDays]);
        setCustomSlots(tpl.slots.map((s, idx) => ({ id: String(idx + 1), start: s.start, end: s.end })));
      }
    }
  }, [activeEmployee?.id, activeEmployee?.schedule?.templateName, isSetSelectedToOff]);

  // Shift timing calculation for employee on specific day
  const getEmployeeShiftForDay = (
    emp: HREmployeeRecord,
    dayNumber: number,
    monthIdx: number = activeMonthIndex,
    forcedTemplateName?: string
  ): string => {
    const dayAbbr = getDayOfWeekAbbr(yearNum, monthIdx, dayNumber);
    const dateStr = `${yearNum}-${(monthIdx + 1).toString().padStart(2, '0')}-${dayNumber
      .toString()
      .padStart(2, '0')}`;

    // 1. Approved formal Day Off request always takes top precedence
    const hasDayOff = daysOffList.some(
      (d) =>
        d.employeeId === emp.id &&
        dateStr >= d.startDate &&
        dateStr <= d.endDate
    );
    if (hasDayOff) {
      return 'OFF';
    }

    // 2. Explicit preview if forcedTemplateName is specified and differs from employee's assigned template
    if (forcedTemplateName && forcedTemplateName !== emp.schedule?.templateName) {
      const template = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === forcedTemplateName);
      if (template) {
        if (template.workDays.includes(dayAbbr)) {
          return `${template.slots[0].start} - ${template.slots[0].end}`;
        }
        return 'OFF';
      }
    }

    // 3. Explicit date overrides take top precedence (custom adjustments or inline toggles)
    if (emp.schedule?.dateOverrides?.[dateStr]) {
      return emp.schedule.dateOverrides[dateStr];
    }

    // 4. In Schedule Template Mode or assigned template fallback
    const activeTplName =
      (manageSubView === 'schedule' ? selectedTemplateName : undefined) ||
      emp.schedule?.templateName ||
      selectedTemplateName ||
      STANDARD_SCHEDULE_TEMPLATES[0].name;

    const template = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === activeTplName);
    if (template) {
      if (template.workDays.includes(dayAbbr)) {
        return (
          template.timing ||
          (template.slots && template.slots[0]
            ? `${template.slots[0].start} - ${template.slots[0].end}`
            : '08:00 - 16:30')
        );
      }
      return 'OFF';
    }

    // 5. Default fallback: Only Sunday is OFF for standard 6-day operation; Saturday is standard working day
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
      if (
        getEmployeeShiftForDay(
          emp,
          d,
          monthIdx,
          manageSubView === 'schedule' ? selectedTemplateName : undefined
        ) === 'OFF'
      ) {
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

  // Helper to extract default working shift timing for an employee
  const getDefaultWorkingShift = (emp: HREmployeeRecord, dayAbbr: string): string => {
    const templateName =
      emp.schedule?.templateName ||
      selectedTemplateName ||
      STANDARD_SCHEDULE_TEMPLATES[0].name;
    const template = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === templateName);
    if (template) {
      return (
        template.timing ||
        (template.slots && template.slots[0]
          ? `${template.slots[0].start} - ${template.slots[0].end}`
          : '08:00 - 16:30')
      );
    }
    return '08:00 - 16:30';
  };

  // Dual View: Copy from Template to Custom
  const handleCopyFromTemplate = () => {
    const tpl = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === selectedTemplateName);
    if (tpl) {
      setSelectedDays(isSetSelectedToOff ? [...tpl.offDays] : [...tpl.workDays]);
      setCustomSlots(tpl.slots.map((s, idx) => ({ id: String(idx + 1), start: s.start, end: s.end })));
      setDaySelectionError(false);
      showToast(`Copied timings from "${tpl.name}".`);
    }
  };

  // Direct Inline ON / OFF Day Toggler in Daily Breakdown
  const handleToggleDayOnOff = (emp: HREmployeeRecord, dayNumber: number) => {
    const dayAbbr = getDayOfWeekAbbr(yearNum, activeMonthIndex, dayNumber);
    const dateStr = `${yearNum}-${(activeMonthIndex + 1).toString().padStart(2, '0')}-${dayNumber
      .toString()
      .padStart(2, '0')}`;
    const currentShift = getEmployeeShiftForDay(
      emp,
      dayNumber,
      activeMonthIndex,
      manageSubView === 'schedule' ? selectedTemplateName : undefined
    );
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
  const handleApplyToSelectedDays = async () => {
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
          if (selectedDays.includes(dayAbbr)) {
            const dateStr = `${yearNum}-${(mIdx + 1).toString().padStart(2, '0')}-${day
              .toString()
              .padStart(2, '0')}`;
            updatedOverrides[dateStr] = slotStr;

            if (!isSetSelectedToOff) {
              HRPersonnelService.removeDayOffForEmployeeDate(targetEmp.id, dateStr);
            }
          }
        }
      }

      const scheduleConfig: EmployeeScheduleConfig = {
        ...(targetEmp.schedule || {}),
        templateName: targetEmp.schedule?.templateName || selectedTemplateName,
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
    const freshEmployees = HRPersonnelService.getEmployees();
    setEmployees(freshEmployees);

    if (applyToAllCompany) {
      showToast(`Global override applied to all ${targetEmployees.length} employees across the company.`);
    } else if (applyToAllDept) {
      showToast(`Schedule applied to all ${targetEmployees.length} staff in ${activeEmployee.department}.`);
    } else {
      showToast(`Schedule updated for ${activeEmployee.fullName} (${applyToAllMonths ? 'Full Year 2026 - All Months' : `${MONTH_NAMES[activeMonthIndex]} ${selectedYear}`}).`);
    }

    if (onSaveSuccess) onSaveSuccess();
  };

  // Apply Template to Schedule with Scope Control
  const handleSelectTemplate = async (templateName: string) => {
    setSelectedTemplateName(templateName);
    const template = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === templateName);
    if (!template || !activeEmployee) return;

    let targetEmployees: HREmployeeRecord[] = [];
    if (applyToAllCompany) {
      targetEmployees = [...employees];
    } else if (applyToAllDept) {
      targetEmployees = employees.filter((e) => e.department === activeEmployee.department);
    } else {
      targetEmployees = [activeEmployee];
    }

    const slotStr =
      template.timing ||
      (template.slots && template.slots[0]
        ? `${template.slots[0].start} - ${template.slots[0].end}`
        : '08:00 - 16:30');

    for (const targetEmp of targetEmployees) {
      let updatedOverrides: { [dateStr: string]: string } = {
        ...(targetEmp.schedule?.dateOverrides || {}),
      };

      if (applyToAllMonths) {
        const fullYearMatrix = generateFullYearMatrix(template, yearNum);
        updatedOverrides = {
          ...updatedOverrides,
          ...fullYearMatrix,
        };
        for (const dateStr of Object.keys(fullYearMatrix)) {
          if (fullYearMatrix[dateStr] !== 'OFF') {
            HRPersonnelService.removeDayOffForEmployeeDate(targetEmp.id, dateStr);
          }
        }
      } else {
        const daysInMonth = getDaysInMonth(yearNum, activeMonthIndex);
        for (let day = 1; day <= daysInMonth; day++) {
          const dayAbbr = getDayOfWeekAbbr(yearNum, activeMonthIndex, day);
          const dateStr = `${yearNum}-${(activeMonthIndex + 1).toString().padStart(2, '0')}-${day
            .toString()
            .padStart(2, '0')}`;

          if (template.dailySchedule && template.dailySchedule[dayAbbr]) {
            updatedOverrides[dateStr] = template.dailySchedule[dayAbbr];
            if (template.dailySchedule[dayAbbr] !== 'OFF') {
              HRPersonnelService.removeDayOffForEmployeeDate(targetEmp.id, dateStr);
            }
          } else if (template.workDays.includes(dayAbbr)) {
            updatedOverrides[dateStr] = slotStr;
            HRPersonnelService.removeDayOffForEmployeeDate(targetEmp.id, dateStr);
          } else {
            updatedOverrides[dateStr] = 'OFF';
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
    const freshEmployees = HRPersonnelService.getEmployees();
    setEmployees(freshEmployees);

    const monthDesc =
      applyToAllMonths
        ? 'Full Year 2026 - All Months'
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

    if (onSaveSuccess) onSaveSuccess();
  };

  // Top Save Schedule Handler: Writes complete 12-month schedule configuration (schedule_config) via /api/hr/sync-workstation
  const handleSaveSchedule = async () => {
    if (!activeEmployee) return;
    setIsSaving(true);
    try {
      const template =
        STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === selectedTemplateName) ||
        STANDARD_SCHEDULE_TEMPLATES[0];

      let targetEmployees: HREmployeeRecord[] = [];
      if (applyToAllCompany) {
        targetEmployees = [...employees];
      } else if (applyToAllDept) {
        targetEmployees = employees.filter((e) => e.department === activeEmployee.department);
      } else {
        targetEmployees = [activeEmployee];
      }

      // Generate complete 12-month schedule matrix
      for (const targetEmp of targetEmployees) {
        let updatedOverrides = { ...(targetEmp.schedule?.dateOverrides || {}) };

        if (manageSubView === 'schedule') {
          const fullYearMatrix = generateFullYearMatrix(template, yearNum);
          updatedOverrides = {
            ...updatedOverrides,
            ...fullYearMatrix,
          };
          for (const dateStr of Object.keys(fullYearMatrix)) {
            if (fullYearMatrix[dateStr] !== 'OFF') {
              HRPersonnelService.removeDayOffForEmployeeDate(targetEmp.id, dateStr);
            }
          }
        } else {
          // Custom View: Apply selected days & slots
          const slotStr = isSetSelectedToOff
            ? 'OFF'
            : customSlots.map((s) => `${s.start} - ${s.end}`).join(', ');

          const monthsToProcess = applyToAllMonths
            ? Array.from({ length: 12 }, (_, i) => i)
            : [activeMonthIndex];

          for (const mIdx of monthsToProcess) {
            const daysInMonth = getDaysInMonth(yearNum, mIdx);
            for (let day = 1; day <= daysInMonth; day++) {
              const dayAbbr = getDayOfWeekAbbr(yearNum, mIdx, day);
              if (selectedDays.includes(dayAbbr)) {
                const dateStr = `${yearNum}-${(mIdx + 1).toString().padStart(2, '0')}-${day
                  .toString()
                  .padStart(2, '0')}`;
                updatedOverrides[dateStr] = slotStr;

                if (!isSetSelectedToOff) {
                  HRPersonnelService.removeDayOffForEmployeeDate(targetEmp.id, dateStr);
                }
              }
            }
          }
        }

        const scheduleConfig: EmployeeScheduleConfig = {
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
      const freshEmployees = HRPersonnelService.getEmployees();
      setEmployees(freshEmployees);

      showToast(
        `Schedule saved and synced successfully for ${
          targetEmployees.length > 1
            ? `${targetEmployees.length} staff members`
            : activeEmployee.fullName
        }.`
      );
      if (onSaveSuccess) onSaveSuccess();
    } catch (err: any) {
      console.error('[ScheduleDesigner] Save error:', err);
      showToast(`Save error: ${err.message || 'Failed to persist schedule'}`);
    } finally {
      setIsSaving(false);
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

    HRPersonnelService.removeDayOffForEmployeeDate(emp.id, dayOffStartDate);
    setDaysOffList(HRPersonnelService.getDaysOff());

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

  // Submit Day Off Request in Modal
  const handleSubmitDayOff = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === dayOffEmpId) || activeEmployee;
    if (!emp) return;

    const newRecord: DayOffRecord = {
      id: `DO-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.fullName,
      startDate: dayOffStartDate,
      endDate: dayOffEndDate,
      reason: dayOffReason as DayOffRecord['reason'],
      type: dayOffType,
      hoursOff: dayOffType === 'Partial' ? dayOffHours : undefined,
      paid: dayOffPaid,
      notes: dayOffNotes,
      approved: true,
      createdAt: new Date().toISOString(),
    };

    HRPersonnelService.saveDayOff(newRecord);
    setDaysOffList(HRPersonnelService.getDaysOff());

    const updatedOverrides = { ...(emp.schedule?.dateOverrides || {}) };
    let cur = new Date(dayOffStartDate);
    const end = new Date(dayOffEndDate);

    while (cur <= end) {
      const y = cur.getFullYear();
      const m = (cur.getMonth() + 1).toString().padStart(2, '0');
      const d = cur.getDate().toString().padStart(2, '0');
      const key = `${y}-${m}-${d}`;
      updatedOverrides[key] = dayOffType === 'Full Day' ? 'OFF' : `Partial (${dayOffHours}h)`;
      cur.setDate(cur.getDate() + 1);
    }

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
    showToast(`Day off request logged for ${emp.fullName} (${dayOffStartDate} to ${dayOffEndDate}).`);
  };

  const isModalDateCurrentlyOff = useMemo(() => {
    const emp = employees.find((e) => e.id === dayOffEmpId) || activeEmployee;
    if (!emp) return false;
    const dayNum = parseInt(dayOffStartDate.split('-')[2], 10) || 1;
    return getEmployeeShiftForDay(emp, dayNum) === 'OFF';
  }, [dayOffEmpId, activeEmployee, dayOffStartDate, daysOffList, employees]);

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-90 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Filter & Dropdown Bar */}
      {showTopBar && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Department Selector */}
            <div className="min-w-[190px] flex-1 sm:flex-initial">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                title={deptFilter === 'ALL' ? 'All Departments' : deptFilter}
                className="w-full min-w-[190px] px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-blue-600 cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                <option value="Production">Production</option>
                <option value="Accounting">Accounting</option>
                <option value="Sales">Sales</option>
                <option value="Distribution">Distribution</option>
                <option value="HR Human Resources">HR Human Resources</option>
                <option value="IT Information Technology">IT Information Technology</option>
                <option value="Owners">Owners</option>
              </select>
            </div>

            {/* Employee Selector */}
            <div className="min-w-[280px] flex-1 sm:flex-initial">
              <select
                value={selectedEmpId}
                onChange={(e) => {
                  setSelectedEmpId(e.target.value);
                  if (onEmployeeSelect) onEmployeeSelect(e.target.value);
                }}
                title={activeEmployee ? `${activeEmployee.fullName} (${activeEmployee.designation})` : 'Select Employee'}
                className="w-full min-w-[280px] px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-blue-600 shadow-2xs cursor-pointer"
              >
                {employees
                  .filter((e) => deptFilter === 'ALL' || e.department === deptFilter)
                  .map((e) => (
                    <option key={e.id} value={e.id} title={`${e.fullName} (${e.designation})`}>
                      {e.fullName} ({e.designation})
                    </option>
                  ))}
              </select>
            </div>

            {/* Brand / Company Selector */}
            <div className="min-w-[280px] flex-1 sm:flex-initial">
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                title={brandFilter}
                className="w-full min-w-[280px] px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-blue-600 cursor-pointer"
              >
                <option value="Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)">
                  Southern Olive and Oil Products (منتوجات زيت وزيتون الجنوب ش.م.م.)
                </option>
              </select>
            </div>

            {/* Branch Selector */}
            <div className="min-w-[260px] flex-1 sm:flex-initial">
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                title={branchFilter}
                className="w-full min-w-[260px] px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-blue-600 cursor-pointer"
              >
                <option value="Southern Olive and Oil Products - Main">
                  Southern Olive and Oil Products - Main
                </option>
              </select>
            </div>

            {/* Year Selector */}
            <div className="min-w-[110px] w-auto">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                title={`Year ${selectedYear}`}
                className="w-full min-w-[110px] px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-blue-600 cursor-pointer"
              >
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveSchedule}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      )}

      {/* Month Bar (Jan - Dec) with Full-Year Scope Synchronization */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-2xs flex items-center justify-between gap-1 overflow-x-auto">
        {MONTH_SHORT.map((m, idx) => {
          const isCurrentActive = activeMonthIndex === idx;

          return (
            <button
              key={m}
              type="button"
              onClick={() => setActiveMonthIndex(idx)}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs transition-all cursor-pointer text-center ${
                applyToAllMonths
                  ? isCurrentActive
                    ? 'bg-blue-700 text-white font-black shadow-sm ring-2 ring-blue-300'
                    : 'bg-blue-600 text-white font-bold opacity-90 hover:opacity-100'
                  : isCurrentActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 font-bold'
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Designer Panels & Breakdown Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 Cols): Template View / Custom Designer View */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dual View Switcher (Normalized Vanguard Brand Blue Active State) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 flex items-center gap-2 shadow-2xs">
            <button
              type="button"
              onClick={() => setManageSubView('schedule')}
              className={`flex-1 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                manageSubView === 'schedule'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 font-bold'
              }`}
            >
              1. Schedule (Template View)
            </button>
            <button
              type="button"
              onClick={() => {
                setManageSubView('custom');
                const tpl = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === selectedTemplateName);
                if (tpl) {
                  setSelectedDays(isSetSelectedToOff ? [...tpl.offDays] : [...tpl.workDays]);
                  setCustomSlots(tpl.slots.map((s, idx) => ({ id: String(idx + 1), start: s.start, end: s.end })));
                }
              }}
              className={`flex-1 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                manageSubView === 'custom'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 font-bold'
              }`}
            >
              2. Custom (Designer View)
            </button>
          </div>

          {/* VIEW 1: Schedule (Template Mode) */}
          {manageSubView === 'schedule' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Shift Schedule Template
                </h3>
                <span className="text-xs font-bold text-blue-600">
                  {applyToAllMonths
                    ? `${activeEmployee?.fullName || 'Employee'} (Full Year ${selectedYear} - All Months)`
                    : `${activeEmployee?.fullName || 'Employee'} (${MONTH_NAMES[activeMonthIndex]} ${selectedYear})`}
                </span>
              </div>

              {/* Dynamic Scope Indicator Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-500 font-medium">Broadcast Scope:</span>
                  {applyToAllCompany ? (
                    <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1.5 shadow-2xs">
                      <Globe className="w-3.5 h-3.5 text-amber-700" />
                      <span>Target: All Employees in Company (Global Override — {employees.length} Staff)</span>
                    </span>
                  ) : applyToAllDept ? (
                    <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 border border-blue-300 font-bold flex items-center gap-1.5 shadow-2xs">
                      <Users className="w-3.5 h-3.5 text-blue-700" />
                      <span>Target: All Staff in Department ({activeEmployee?.department || 'Department'} — {deptStaffCount} Staff)</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Target: {activeEmployee?.fullName} (Individual Staff Member)</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                  {applyToAllCompany
                    ? `Global override targets all ${employees.length} staff members`
                    : applyToAllDept
                    ? `Targets all ${deptStaffCount} staff members in ${activeEmployee?.department || 'dept'}`
                    : 'Changes isolate strictly to this profile'}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Select Template</label>
                <select
                  value={selectedTemplateName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setSelectedTemplateName(name);
                    const tpl = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === name);
                    if (tpl) {
                      setSelectedDays(isSetSelectedToOff ? [...tpl.offDays] : [...tpl.workDays]);
                      setCustomSlots(tpl.slots.map((s, idx) => ({ id: String(idx + 1), start: s.start, end: s.end })));
                    }
                  }}
                  className="w-full px-3 py-2.5 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-blue-600 shadow-2xs cursor-pointer"
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
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
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
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    Apply to All Staff in Department ({activeEmployee?.department} — {deptStaffCount} Staff)
                  </span>
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

              {/* Apply Template Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSelectTemplate(selectedTemplateName)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    Apply Template to Schedule {applyToAllMonths ? '(All 12 Months)' : `(${MONTH_NAMES[activeMonthIndex]} ${selectedYear})`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: Custom (Designer View) */}
          {manageSubView === 'custom' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Schedule Designer
                </h3>
                <span className="text-xs font-bold text-blue-600">
                  {applyToAllMonths
                    ? `${activeEmployee?.fullName || 'Employee'} (Full Year ${selectedYear} - All Months)`
                    : `${activeEmployee?.fullName || 'Employee'} (${MONTH_NAMES[activeMonthIndex]} ${selectedYear})`}
                </span>
              </div>

              {/* Dynamic Scope Indicator Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-500 font-medium">Broadcast Scope:</span>
                  {applyToAllCompany ? (
                    <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1.5 shadow-2xs">
                      <Globe className="w-3.5 h-3.5 text-amber-700" />
                      <span>Target: All Employees in Company (Global Override — {employees.length} Staff)</span>
                    </span>
                  ) : applyToAllDept ? (
                    <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 border border-blue-300 font-bold flex items-center gap-1.5 shadow-2xs">
                      <Users className="w-3.5 h-3.5 text-blue-700" />
                      <span>Target: All Staff in Department ({activeEmployee?.department || 'Department'} — {deptStaffCount} Staff)</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Target: {activeEmployee?.fullName} (Individual Staff Member)</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                  {applyToAllCompany
                    ? `Global override targets all ${employees.length} staff members`
                    : applyToAllDept
                    ? `Targets all ${deptStaffCount} staff members in ${activeEmployee?.department || 'dept'}`
                    : 'Changes isolate strictly to this profile'}
                </span>
              </div>

              {/* Copy from Schedule Ribbon */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 shrink-0">Copy from Schedule:</span>
                <select
                  value={selectedTemplateName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setSelectedTemplateName(name);
                    const tpl = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === name);
                    if (tpl) {
                      setSelectedDays(isSetSelectedToOff ? [...tpl.offDays] : [...tpl.workDays]);
                      setCustomSlots(tpl.slots.map((s, idx) => ({ id: String(idx + 1), start: s.start, end: s.end })));
                    }
                  }}
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

              {/* Days Selector with Weekend & Day Pills Sync */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">
                    Select Days of Week <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
                        setDaySelectionError(false);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      6-Day (Mon-Sat)
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
                        setDaySelectionError(false);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Weekdays (Mon-Fri)
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDays(['Sun']);
                        setDaySelectionError(false);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Sunday OFF
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDays([...DAYS_OF_WEEK]);
                        setDaySelectionError(false);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      All 7 Days
                    </button>
                  </div>
                </div>

                {/* Day Pill Buttons */}
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
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
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
                  onChange={(e) => {
                    const willBeOff = e.target.checked;
                    setIsSetSelectedToOff(willBeOff);
                    const tpl = STANDARD_SCHEDULE_TEMPLATES.find((t) => t.name === selectedTemplateName);
                    if (tpl) {
                      setSelectedDays(willBeOff ? [...tpl.offDays] : [...tpl.workDays]);
                    }
                  }}
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
                          className="px-3 py-1.5 text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-blue-600 flex-1"
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
                          className="px-3 py-1.5 text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-blue-600 flex-1"
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

              {/* Checkboxes: Scope Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-slate-100 text-xs font-bold text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={applyToAllMonths}
                    onChange={(e) => setApplyToAllMonths(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
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
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    Apply to All Staff in Department ({activeEmployee?.department} — {deptStaffCount} Staff)
                  </span>
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

              {/* Primary Action Button (Normalized Vanguard Blue Theme) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApplyToSelectedDays}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply to Selected Days</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Breakdown Panels (Daily Breakdown & Yearly Overview) */}
        <div className="space-y-4">
          {/* Daily Breakdown (Month) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                {applyToAllMonths
                  ? `DAILY BREAKDOWN (Full Year ${selectedYear} - All Months)`
                  : `DAILY BREAKDOWN (${MONTH_SHORT[activeMonthIndex]})`}
              </h4>
              <span className="text-[11px] font-bold text-slate-500 font-mono">
                {activeEmployee?.firstName}
              </span>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map((d) => {
                const shift = activeEmployee
                  ? getEmployeeShiftForDay(
                      activeEmployee,
                      d,
                      activeMonthIndex,
                      manageSubView === 'schedule' ? selectedTemplateName : undefined
                    )
                  : 'OFF';
                const isOff = shift === 'OFF';
                const dayAbbr = getDayOfWeekAbbr(yearNum, activeMonthIndex, d);
                const isDayPillActive = selectedDays.includes(dayAbbr);

                return (
                  <div
                    key={d}
                    className={`flex items-center justify-between py-1.5 px-2 rounded-xl text-xs border transition-colors ${
                      isDayPillActive
                        ? 'bg-blue-50/70 border-blue-200'
                        : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (manageSubView === 'custom') {
                          setSelectedDays((prev) =>
                            prev.includes(dayAbbr)
                              ? prev.filter((item) => item !== dayAbbr)
                              : [...prev, dayAbbr]
                          );
                        }
                      }}
                      title={manageSubView === 'custom' ? `Click to toggle ${dayAbbr} in Day Pills` : undefined}
                      className="flex items-center gap-2 cursor-pointer text-left"
                    >
                      <span className="w-5 text-slate-400 font-mono font-bold">{d}</span>
                      <span
                        className={`w-8 text-[11px] font-semibold ${
                          isDayPillActive ? 'text-blue-700 font-bold' : 'text-slate-500'
                        }`}
                      >
                        {dayAbbr}
                      </span>
                    </button>

                    {isOff ? (
                      <div className="flex items-center gap-1.5">
                        {/* Quick Revert to Standard Working Shift */}
                        <button
                          type="button"
                          onClick={() => activeEmployee && handleToggleDayOnOff(activeEmployee, d)}
                          title="Click to quickly turn ON (reverts to standard working shift)"
                          className="px-2.5 py-0.5 rounded-md bg-rose-50 hover:bg-emerald-50 text-rose-600 hover:text-emerald-700 border border-rose-200 hover:border-emerald-300 font-black text-[11px] cursor-pointer transition-all flex items-center gap-1 group shadow-2xs"
                        >
                          <span className="group-hover:hidden">OFF</span>
                          <span className="hidden group-hover:inline text-[10px]">Revert ON</span>
                        </button>

                        {/* Open Apply Day Off Request Modal */}
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
                        ? 'bg-blue-50 border-blue-600 text-blue-600 font-bold shadow-2xs'
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

      {/* Modal: Apply Day Off Request */}
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

              {/* Reason Dropdown */}
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
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-sm'
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
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-sm'
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
                      className="text-blue-600"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="dayOffPaid"
                      checked={dayOffPaid === 'No'}
                      onChange={() => setDayOffPaid('No')}
                      className="text-blue-600"
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
                  className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-blue-600"
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
