'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Settings as SettingsIcon,
  Copy,
  Save,
  Check,
  X,
  Lock,
  ChevronUp,
  FileText,
  List,
  CheckCircle2,
  Users,
  Building2,
  CalendarCheck
} from 'lucide-react';
import Link from 'next/link';
import DatePickerInput from './DatePickerInput';

export type CalendarViewType = 'Month' | 'Week' | 'Day';
export type TimeIntervalType = '5 Minutes' | '10 Minutes' | '15 Minutes' | '30 Minutes' | '1 Hour';

interface EmployeeScheduleConfig {
  id: string;
  name: string;
  color: string;
  workingHours: {
    [day: string]: {
      enabled: boolean;
      from: string;
      to: string;
      breakFrom: string;
      breakTo: string;
    };
  };
}

const INITIAL_EMPLOYEES: EmployeeScheduleConfig[] = [
  {
    id: 'emp-1',
    name: 'Hiba Aloulou',
    color: '#000000',
    workingHours: {
      Monday: { enabled: false, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Tuesday: { enabled: false, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Wednesday: { enabled: false, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Thursday: { enabled: false, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Friday: { enabled: false, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Saturday: { enabled: false, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Sunday: { enabled: false, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' }
    }
  },
  {
    id: 'emp-2',
    name: 'HUSSEIN',
    color: '#000000',
    workingHours: {
      Monday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Tuesday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Wednesday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Thursday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Friday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Saturday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Sunday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' }
    }
  },
  {
    id: 'emp-3',
    name: 'Hussien Mahdi',
    color: '#000000',
    workingHours: {
      Monday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Tuesday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Wednesday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Thursday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Friday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Saturday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Sunday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' }
    }
  },
  {
    id: 'emp-4',
    name: 'Mahdi',
    color: '#000000',
    workingHours: {
      Monday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Tuesday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Wednesday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Thursday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Friday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Saturday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Sunday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' }
    }
  },
  {
    id: 'emp-5',
    name: 'Nour Yazbeck',
    color: '#000000',
    workingHours: {
      Monday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Tuesday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Wednesday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Thursday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Friday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Saturday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Sunday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' }
    }
  },
  {
    id: 'emp-6',
    name: 'Ricky',
    color: '#000000',
    workingHours: {
      Monday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Tuesday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Wednesday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Thursday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Friday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Saturday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' },
      Sunday: { enabled: true, from: '08:00 AM', to: '11:00 PM', breakFrom: '--:-- --', breakTo: '--:-- --' }
    }
  }
];

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ScheduleWorkstation() {
  const [currentView, setCurrentView] = useState<CalendarViewType>('Month');
  const [selectedBranch, setSelectedBranch] = useState('Main Branch');
  const [timeInterval, setTimeInterval] = useState<TimeIntervalType>('5 Minutes');
  const [defaultView, setDefaultView] = useState<'Month' | 'Week'>('Month');
  const [sendEmailConfirmation, setSendEmailConfirmation] = useState(false);
  const [showEmployeeColors, setShowEmployeeColors] = useState(false);
  const [employees, setEmployees] = useState<EmployeeScheduleConfig[]>(INITIAL_EMPLOYEES);
  const [selectedDayDate, setSelectedDayDate] = useState('07-Sep-2026');

  const formattedDayTitle = useMemo(() => {
    try {
      const parts = selectedDayDate.split(/[-/,\s]+/);
      if (parts.length >= 3) {
        const d = parseInt(parts[0], 10);
        const MONTH_MAP: { [k: string]: { name: string; idx: number } } = {
          jan: { name: 'January', idx: 0 },
          feb: { name: 'February', idx: 1 },
          mar: { name: 'March', idx: 2 },
          apr: { name: 'April', idx: 3 },
          may: { name: 'May', idx: 4 },
          jun: { name: 'June', idx: 5 },
          jul: { name: 'July', idx: 6 },
          aug: { name: 'August', idx: 7 },
          sep: { name: 'September', idx: 8 },
          oct: { name: 'October', idx: 9 },
          nov: { name: 'November', idx: 10 },
          dec: { name: 'December', idx: 11 }
        };
        const mInfo = MONTH_MAP[parts[1].toLowerCase()];
        const y = parseInt(parts[2], 10);
        if (!isNaN(d) && mInfo && !isNaN(y)) {
          const dateObj = new Date(y, mInfo.idx, d);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          return `${dayName} ${d.toString().padStart(2, '0')} ${mInfo.name} ${y} 18:30`;
        }
      }
    } catch {}
    return 'Tuesday 07 September 2026 18:30';
  }, [selectedDayDate]);

  // Modals
  const [isOpeningHoursModalOpen, setIsOpeningHoursModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedEmployeeForHours, setSelectedEmployeeForHours] = useState<EmployeeScheduleConfig | null>(null);
  const [isReportsDropdownOpen, setIsReportsDropdownOpen] = useState(false);

  // Notice Banner
  const [notice, setNotice] = useState<string | null>(null);

  // Branch Working Hours State (Screenshot 4)
  const [branchWorkingHours, setBranchWorkingHours] = useState<{
    [day: string]: { enabled: boolean; from: string; to: string };
  }>({
    Monday: { enabled: true, from: '08:00 AM', to: '11:00 PM' },
    Tuesday: { enabled: true, from: '08:00 AM', to: '11:00 PM' },
    Wednesday: { enabled: true, from: '08:00 AM', to: '11:00 PM' },
    Thursday: { enabled: true, from: '08:00 AM', to: '11:00 PM' },
    Friday: { enabled: true, from: '08:00 AM', to: '11:00 PM' },
    Saturday: { enabled: true, from: '08:00 AM', to: '11:00 PM' },
    Sunday: { enabled: true, from: '08:00 AM', to: '11:00 PM' }
  });

  const notify = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  // Copy Branch hours to all days
  const handleCopyBranchHours = (sourceDay: string) => {
    const src = branchWorkingHours[sourceDay];
    setBranchWorkingHours((prev) => {
      const updated = { ...prev };
      DAYS_ORDER.forEach((day) => {
        updated[day] = { ...src };
      });
      return updated;
    });
    notify(`Copied ${sourceDay}'s hours (${src.from} - ${src.to}) to all days.`);
  };

  // Copy Employee hours to all days
  const handleCopyEmployeeHours = (sourceDay: string) => {
    if (!selectedEmployeeForHours) return;
    const src = selectedEmployeeForHours.workingHours[sourceDay];
    setSelectedEmployeeForHours((prev) => {
      if (!prev) return null;
      const updated = { ...prev.workingHours };
      DAYS_ORDER.forEach((day) => {
        updated[day] = { ...src };
      });
      return { ...prev, workingHours: updated };
    });
    notify(`Copied ${sourceDay} schedule to all days.`);
  };

  // Generate Week Time Slots based on timeInterval
  const weekTimeSlots = useMemo(() => {
    let intervalMinutes = 5;
    if (timeInterval === '10 Minutes') intervalMinutes = 10;
    if (timeInterval === '15 Minutes') intervalMinutes = 15;
    if (timeInterval === '30 Minutes') intervalMinutes = 30;
    if (timeInterval === '1 Hour') intervalMinutes = 60;

    const slots: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += intervalMinutes) {
        const period = h >= 12 ? 'pm' : 'am';
        let displayH = h % 12;
        if (displayH === 0) displayH = 12;
        const displayM = m === 0 ? '' : `:${m < 10 ? '0' : ''}${m}`;
        slots.push(`${displayH}${displayM}${period}`);
      }
    }
    return slots;
  }, [timeInterval]);

  // Generate Day Time Slots from 08:00 until 23:00 (Screenshot Part 3)
  const dayTimeSlots = useMemo(() => {
    let intervalMinutes = 5;
    if (timeInterval === '10 Minutes') intervalMinutes = 10;
    if (timeInterval === '15 Minutes') intervalMinutes = 15;
    if (timeInterval === '30 Minutes') intervalMinutes = 30;
    if (timeInterval === '1 Hour') intervalMinutes = 60;

    const slots: string[] = [];
    for (let h = 8; h <= 23; h++) {
      for (let m = 0; m < 60; m += intervalMinutes) {
        if (h === 23 && m > 0) break;
        const hh = h < 10 ? `0${h}` : `${h}`;
        const mm = m < 10 ? `0${m}` : `${m}`;
        slots.push(`${hh}:${mm}`);
      }
    }
    return slots;
  }, [timeInterval]);

  // Set all schedules as per business hours
  const handleSetAllSchedulesAsBusinessHours = () => {
    setEmployees((prev) =>
      prev.map((emp) => {
        const updatedHours = { ...emp.workingHours };
        DAYS_ORDER.forEach((day) => {
          updatedHours[day] = {
            enabled: branchWorkingHours[day].enabled,
            from: branchWorkingHours[day].from,
            to: branchWorkingHours[day].to,
            breakFrom: '--:-- --',
            breakTo: '--:-- --'
          };
        });
        return { ...emp, workingHours: updatedHours };
      })
    );
    notify('All employee schedules synchronized with branch working hours.');
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans select-none flex flex-col">
      {/* Toast Notice */}
      {notice && (
        <div className="fixed top-4 right-4 z-70 bg-emerald-700 text-white px-4 py-2.5 rounded shadow-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{notice}</span>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="px-6 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-tight">Schedule</h1>
          <div className="text-[11px] text-slate-400 mt-0.5">
            <span className="text-blue-600 hover:underline cursor-pointer">Home</span> / Schedule
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={() => notify('Schedule tutorial video loading...')}
            className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
          >
            Watch Tutorial
          </button>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="px-6 py-2.5 flex items-center justify-between border-b border-slate-200 bg-white">
        {/* Left Side: Branch, Opening Hours, Reports, Legend */}
        <div className="flex items-center gap-2.5">
          {/* Branch Selector */}
          <div className="w-56 relative">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 bg-white shadow-2xs appearance-none pr-8 cursor-pointer focus:outline-none focus:border-blue-500"
            >
              <option value="Main Branch">Main Branch (الفرع الرئيسي)</option>
            </select>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 rotate-90 pointer-events-none" />
          </div>

          {/* Opening Hours Button (#2f3b52) */}
          <button
            type="button"
            onClick={() => setIsOpeningHoursModalOpen(true)}
            className="bg-[#2f3b52] hover:bg-[#1e2736] text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Opening Hours</span>
          </button>

          {/* Reports Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsReportsDropdownOpen(!isReportsDropdownOpen)}
              className="bg-[#2f3b52] hover:bg-[#1e2736] text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <span>Reports</span>
              <ChevronRight className={`w-3 h-3 transition-transform ${isReportsDropdownOpen ? '-rotate-90' : 'rotate-90'}`} />
            </button>

            {isReportsDropdownOpen && (
              <div className="absolute z-40 top-full left-0 mt-1 w-36 bg-white border border-slate-200 rounded shadow-lg py-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsReportsDropdownOpen(false);
                    notify('Loading Schedule History Report...');
                  }}
                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3 h-3 text-slate-500" />
                  <span>History Report</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsReportsDropdownOpen(false);
                    notify("Loading Today's Appointment List...");
                  }}
                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                >
                  <List className="w-3 h-3 text-slate-500" />
                  <span>Today&apos;s List</span>
                </button>
              </div>
            )}
          </div>

          {/* Legend Pills (Matching Screenshot 1 & 3) */}
          <div className="flex items-center gap-3 text-xs ml-1 text-slate-600">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-[#38a169]"></span>
              <span>Done</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-[#991b1b]"></span>
              <span>Busy</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-[#cbd5e1]"></span>
              <span>Unavailable</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-[#fef9c3] border border-amber-200"></span>
              <span>Available</span>
            </div>
          </div>
        </div>

        {/* Center Title (Date & Time display) */}
        <div className="text-center font-normal text-slate-700 text-sm">
          {currentView === 'Month' && <span className="text-base font-medium">September 2026 18:09</span>}
          {currentView === 'Week' && <span className="text-base font-medium">Sep 6 — 12, 2026</span>}
          {currentView === 'Day' && <span className="text-base font-medium">{formattedDayTitle}</span>}
        </div>

        {/* Right Side: View Switcher & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Day View Actions (Screenshot Part 3) */}
          {currentView === 'Day' && (
            <div className="flex items-center gap-1.5 mr-2">
              <DatePickerInput
                value={selectedDayDate}
                onChange={(newDate) => {
                  setSelectedDayDate(newDate);
                  notify(`Loaded schedule for ${newDate}`);
                }}
                customButtonLabel="Select Date"
                alignRight={true}
              />
              <button
                type="button"
                className="bg-emerald-700 hover:bg-emerald-800 text-white p-1.5 rounded shadow-2xs cursor-pointer"
                title="Lock / Unlock Schedule"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('Month')}
                className="bg-[#2f3b52] hover:bg-[#1e2736] text-white p-1.5 rounded shadow-2xs cursor-pointer"
                title="Calendar Overview"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Month / Week / Day Pills */}
          <div className="inline-flex rounded border border-slate-300 overflow-hidden shadow-2xs">
            {(['Month', 'Week', 'Day'] as CalendarViewType[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setCurrentView(v)}
                className={`px-3 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                  currentView === v ? 'bg-[#2f3b52] text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="bg-[#2f3b52] hover:bg-[#1e2736] text-white p-1.5 rounded shadow-2xs cursor-pointer transition-colors"
            title="Schedule Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Calendar Views */}
      <div className="flex-1 overflow-auto bg-white p-4 relative">
        {/* Navigation Arrow buttons for Month/Week views */}
        <div className="flex items-center gap-1.5 mb-2">
          <button
            type="button"
            onClick={() => notify('Previous period')}
            className="bg-[#2f3b52] hover:bg-[#1e2736] text-white p-1 rounded cursor-pointer"
            title="Previous Period"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => notify('Next period')}
            className="bg-[#2f3b52] hover:bg-[#1e2736] text-white p-1 rounded cursor-pointer"
            title="Next Period"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <DatePickerInput
            value={selectedDayDate}
            onChange={(newDate) => {
              setSelectedDayDate(newDate);
              notify(`Calendar selected: ${newDate}`);
            }}
            showIconOnly={true}
          />
        </div>

        {/* ========================================================================= */}
        {/* 1. MONTHLY VIEW (Screenshots 1, 2)                                         */}
        {/* ========================================================================= */}
        {currentView === 'Month' && (
          <div className="border border-slate-200 rounded overflow-hidden">
            {/* Days Header */}
            <div className="grid grid-cols-7 text-center font-bold text-xs bg-white text-slate-700 border-b border-slate-200 py-2">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Grid of Weeks (5 weeks matching September 2026) */}
            <div className="grid grid-cols-7 divide-x divide-slate-200 border-b border-slate-200 text-xs">
              {/* Row 1: Aug 30 to Sep 5 */}
              <div className="h-28 bg-[#cbd5e1]/40 p-2 text-right text-slate-400 font-medium">30</div>
              <div className="h-28 bg-[#cbd5e1]/40 p-2 text-right text-slate-400 font-medium">31</div>
              <div className="h-28 bg-[#cbd5e1]/40 p-2 text-right text-slate-700 font-medium hover:bg-slate-100/60 cursor-pointer">1</div>
              <div className="h-28 bg-[#cbd5e1]/40 p-2 text-right text-slate-700 font-medium hover:bg-slate-100/60 cursor-pointer">2</div>
              <div className="h-28 bg-[#cbd5e1]/40 p-2 text-right text-slate-700 font-medium hover:bg-slate-100/60 cursor-pointer">3</div>
              <div className="h-28 bg-[#cbd5e1]/40 p-2 text-right text-slate-700 font-medium hover:bg-slate-100/60 cursor-pointer">4</div>
              <div className="h-28 bg-[#cbd5e1]/40 p-2 text-right text-slate-700 font-medium hover:bg-slate-100/60 cursor-pointer">5</div>

              {/* Row 2: Sep 6 to Sep 12 */}
              <div className="h-28 bg-[#cbd5e1]/40 p-2 text-right text-slate-600 font-medium border-t border-slate-200">6</div>
              <div className="h-28 bg-[#fef9c3] p-2 text-right text-slate-900 font-bold border-t border-slate-200 cursor-pointer">
                7
                <div className="text-[10px] text-emerald-800 font-medium mt-1 text-left">Today</div>
              </div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">8</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">9</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">10</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">11</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">12</div>

              {/* Row 3: Sep 13 to Sep 19 */}
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">13</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">14</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">15</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">16</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">17</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">18</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">19</div>

              {/* Row 4: Sep 20 to Sep 26 */}
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">20</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">21</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">22</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">23</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">24</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">25</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">26</div>

              {/* Row 5: Sep 27 to Oct 3 */}
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">27</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">28</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">29</div>
              <div className="h-28 bg-white p-2 text-right text-slate-700 font-medium border-t border-slate-200 hover:bg-slate-50 cursor-pointer">30</div>
              <div className="h-28 bg-slate-50 p-2 text-right text-slate-400 font-medium border-t border-slate-200">1</div>
              <div className="h-28 bg-slate-50 p-2 text-right text-slate-400 font-medium border-t border-slate-200">2</div>
              <div className="h-28 bg-slate-50 p-2 text-right text-slate-400 font-medium border-t border-slate-200">3</div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. WEEK VIEW (Screenshots Part 2-1 & 2-2)                                  */}
        {/* ========================================================================= */}
        {currentView === 'Week' && (
          <div className="border border-slate-200 rounded overflow-hidden">
            {/* Days Header */}
            <div className="grid grid-cols-8 text-center font-bold text-xs bg-white text-slate-700 border-b border-slate-200 py-2">
              <div className="w-16">all-day</div>
              <div className="border-l border-slate-200">Sun 9/6</div>
              <div className="border-l border-slate-200 bg-amber-50/50">Mon 9/7</div>
              <div className="border-l border-slate-200">Tue 9/8</div>
              <div className="border-l border-slate-200">Wed 9/9</div>
              <div className="border-l border-slate-200">Thu 9/10</div>
              <div className="border-l border-slate-200">Fri 9/11</div>
              <div className="border-l border-slate-200">Sat 9/12</div>
            </div>

            {/* Time Grid with 5-minute increments (or selected interval) */}
            <div className="max-h-[70vh] overflow-y-auto">
              {weekTimeSlots.map((slot, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-8 border-b border-dashed border-slate-100 text-[10px] min-h-[22px]"
                >
                  <div className="w-16 px-1.5 text-right text-slate-400 font-mono py-0.5 border-r border-slate-200">
                    {slot.includes(':') ? (
                      <span className="text-slate-300">{slot}</span>
                    ) : (
                      <span className="font-semibold text-slate-600">{slot}</span>
                    )}
                  </div>
                  <div className="border-r border-slate-100 bg-[#cbd5e1]/30"></div>
                  <div className="border-r border-slate-100 bg-[#fef9c3]/50 hover:bg-amber-100/60 cursor-pointer"></div>
                  <div className="border-r border-slate-100 hover:bg-blue-50/30 cursor-pointer"></div>
                  <div className="border-r border-slate-100 hover:bg-blue-50/30 cursor-pointer"></div>
                  <div className="border-r border-slate-100 hover:bg-blue-50/30 cursor-pointer"></div>
                  <div className="border-r border-slate-100 hover:bg-blue-50/30 cursor-pointer"></div>
                  <div className="hover:bg-blue-50/30 cursor-pointer"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. DAY VIEW (Screenshots Part 3)                                           */}
        {/* ========================================================================= */}
        {currentView === 'Day' && (
          <div className="border border-slate-200 rounded overflow-hidden">
            {/* Employee Columns Header */}
            <div className="grid grid-cols-7 text-center font-bold text-xs bg-white text-slate-700 border-b border-slate-200 py-2">
              <div className="w-20">Time</div>
              <div className="border-l border-slate-200">Mahdi</div>
              <div className="border-l border-slate-200">HUSSEIN</div>
              <div className="border-l border-slate-200">Ricky</div>
              <div className="border-l border-slate-200">Nour Yazbeck</div>
              <div className="border-l border-slate-200">Hussien Mahdi</div>
              <div className="border-l border-slate-200">Hiba Aloulou</div>
            </div>

            {/* Time Grid (08:00 to 23:00 in 5-minute intervals) */}
            <div className="max-h-[70vh] overflow-y-auto">
              {dayTimeSlots.map((time, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-7 border-b border-slate-200 text-xs min-h-[26px]"
                >
                  <div className="w-20 px-2 py-1 font-mono font-bold text-slate-800 text-center bg-slate-50/80 border-r border-slate-200">
                    {time}
                  </div>
                  <div className="border-r border-slate-200 bg-[#cbd5e1]/30 hover:bg-blue-50 cursor-pointer"></div>
                  <div className="border-r border-slate-200 bg-[#cbd5e1]/30 hover:bg-blue-50 cursor-pointer"></div>
                  <div className="border-r border-slate-200 bg-[#cbd5e1]/30 hover:bg-blue-50 cursor-pointer"></div>
                  <div className="border-r border-slate-200 bg-[#cbd5e1]/30 hover:bg-blue-50 cursor-pointer"></div>
                  <div className="border-r border-slate-200 bg-[#cbd5e1]/30 hover:bg-blue-50 cursor-pointer"></div>
                  <div className="bg-[#cbd5e1]/30 hover:bg-blue-50 cursor-pointer"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Floating Scroll to top Button */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-30 p-2.5 rounded-full bg-white text-blue-600 shadow-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
          title="Scroll to Top"
        >
          <ChevronUp className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. BRANCHES WORKING HOURS MODAL (Screenshot 4)                            */}
      {/* ========================================================================= */}
      {isOpeningHoursModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-md shadow-2xl border border-slate-300 w-full max-w-[720px] overflow-hidden flex flex-col font-sans text-xs text-slate-800">
            {/* Header */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-slate-200">
              <h2 className="text-base font-normal text-slate-700">Branches Working Hours</h2>
              <button
                type="button"
                onClick={() => setIsOpeningHoursModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-light leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-slate-600 font-medium mb-1">Branch</label>
                <div className="relative w-72">
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full border border-blue-400 rounded px-3 py-1.5 text-xs text-slate-800 bg-white shadow-2xs appearance-none pr-8 cursor-pointer focus:outline-none"
                  >
                    <option value="Main Branch">Main Branch (الفرع الرئيسي)</option>
                  </select>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* Working Hours Grid */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="grid grid-cols-12 bg-slate-50 text-slate-700 font-semibold py-2 px-3 border-b border-slate-200 text-xs">
                  <div className="col-span-4">Day</div>
                  <div className="col-span-4">From</div>
                  <div className="col-span-4">To</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {DAYS_ORDER.map((day) => (
                    <div key={day} className="grid grid-cols-12 items-center py-2 px-3 text-xs">
                      {/* Checkbox + Day */}
                      <div className="col-span-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={branchWorkingHours[day]?.enabled ?? true}
                          onChange={(e) =>
                            setBranchWorkingHours((prev) => ({
                              ...prev,
                              [day]: { ...prev[day], enabled: e.target.checked }
                            }))
                          }
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                        />
                        <span className="font-semibold text-slate-800">{day}</span>
                      </div>

                      {/* From Time Picker */}
                      <div className="col-span-4 pr-3">
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={branchWorkingHours[day]?.from || '08:00 AM'}
                            onChange={(e) =>
                              setBranchWorkingHours((prev) => ({
                                ...prev,
                                [day]: { ...prev[day], from: e.target.value }
                              }))
                            }
                            className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 pr-7 shadow-2xs focus:outline-none focus:border-blue-500"
                          />
                          <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
                        </div>
                      </div>

                      {/* To Time Picker + Copy Button */}
                      <div className="col-span-4 flex items-center gap-2">
                        <div className="relative flex-1 flex items-center">
                          <input
                            type="text"
                            value={branchWorkingHours[day]?.to || '11:00 PM'}
                            onChange={(e) =>
                              setBranchWorkingHours((prev) => ({
                                ...prev,
                                [day]: { ...prev[day], to: e.target.value }
                              }))
                            }
                            className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 pr-7 shadow-2xs focus:outline-none focus:border-blue-500"
                          />
                          <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyBranchHours(day)}
                          className="bg-[#2f3b52] hover:bg-[#1e2736] text-white p-1.5 rounded cursor-pointer shadow-2xs"
                          title="Copy this schedule to all days"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-5 py-3 flex justify-end bg-white">
              <button
                type="button"
                onClick={() => {
                  setIsOpeningHoursModalOpen(false);
                  notify('Branches working hours saved successfully.');
                }}
                className="bg-[#2f3b52] hover:bg-[#1e2736] text-white px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SETTINGS MODAL (Screenshot 5)                                          */}
      {/* ========================================================================= */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-md shadow-2xl border border-slate-300 w-full max-w-[540px] overflow-hidden flex flex-col font-sans text-xs text-slate-800">
            {/* Header */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-slate-200">
              <h2 className="text-base font-normal text-slate-700">Settings</h2>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-light leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Set all schedules button */}
              <button
                type="button"
                onClick={handleSetAllSchedulesAsBusinessHours}
                className="w-full bg-[#2f3b52] hover:bg-[#1e2736] text-white text-xs font-semibold py-2 px-3 rounded flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Set all schedules as per business hours</span>
              </button>

              {/* Time Interval Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Time Interval</label>
                <div className="relative">
                  <select
                    value={timeInterval}
                    onChange={(e) => setTimeInterval(e.target.value as TimeIntervalType)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 bg-white shadow-2xs appearance-none pr-8 cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    <option value="5 Minutes">5 Minutes</option>
                    <option value="10 Minutes">10 Minutes</option>
                    <option value="15 Minutes">15 Minutes</option>
                    <option value="30 Minutes">30 Minutes</option>
                    <option value="1 Hour">1 Hour</option>
                  </select>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* Default View Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default View</label>
                <div className="relative">
                  <select
                    value={defaultView}
                    onChange={(e) => {
                      const v = e.target.value as 'Month' | 'Week';
                      setDefaultView(v);
                      setCurrentView(v);
                    }}
                    className="w-full border border-blue-400 rounded px-3 py-1.5 text-xs text-slate-800 bg-white shadow-2xs appearance-none pr-8 cursor-pointer focus:outline-none"
                  >
                    <option value="Month">Month</option>
                    <option value="Week">Week</option>
                  </select>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendEmailConfirmation}
                    onChange={(e) => setSendEmailConfirmation(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="text-slate-700 text-xs">Send an email confirmation to the customer when saving a new appointment</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEmployeeColors}
                    onChange={(e) => setShowEmployeeColors(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="text-slate-700 text-xs">Show Employee Colors</span>
                </label>
              </div>

              {/* Employee Colors & Schedule Table */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="grid grid-cols-12 bg-slate-50 font-semibold text-slate-700 py-1.5 px-3 border-b border-slate-200 text-xs">
                  <div className="col-span-6">Employee</div>
                  <div className="col-span-4 text-center">Color</div>
                  <div className="col-span-2 text-right">Action</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <div key={emp.id} className="grid grid-cols-12 items-center py-2 px-3 text-xs">
                      <div className="col-span-6 font-medium text-slate-800">{emp.name}</div>
                      <div className="col-span-4 flex justify-center">
                        <input
                          type="color"
                          value={emp.color}
                          onChange={(e) => {
                            const newColor = e.target.value;
                            setEmployees((prev) =>
                              prev.map((item) => (item.id === emp.id ? { ...item, color: newColor } : item))
                            );
                          }}
                          className="w-10 h-5 border border-slate-400 rounded cursor-pointer p-0 bg-black"
                        />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedEmployeeForHours(emp)}
                          className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                          title={`Edit ${emp.name}'s working days and time`}
                        >
                          <CalendarIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-5 py-3 flex justify-end bg-white">
              <button
                type="button"
                onClick={() => {
                  setIsSettingsModalOpen(false);
                  notify('Settings saved successfully.');
                }}
                className="bg-[#2f3b52] hover:bg-[#1e2736] text-white px-5 py-1.5 rounded text-xs font-semibold shadow-2xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. WORKING DAYS AND TIME MODAL (Screenshot Part 1-2)                      */}
      {/* ========================================================================= */}
      {selectedEmployeeForHours && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-60 p-4 animate-fade-in">
          <div className="bg-white rounded-md shadow-2xl border border-slate-300 w-full max-w-[850px] overflow-hidden flex flex-col font-sans text-xs text-slate-800">
            {/* Header */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-slate-200">
              <div>
                <h2 className="text-base font-semibold text-slate-800">Working Days and Time</h2>
                <div className="text-xs text-slate-500">{selectedEmployeeForHours.name}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmployeeForHours(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-light leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Set as business hours button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedEmployeeForHours((prev) => {
                    if (!prev) return null;
                    const updated = { ...prev.workingHours };
                    DAYS_ORDER.forEach((day) => {
                      updated[day] = {
                        enabled: true,
                        from: '08:00 AM',
                        to: '11:00 PM',
                        breakFrom: '--:-- --',
                        breakTo: '--:-- --'
                      };
                    });
                    return { ...prev, workingHours: updated };
                  });
                  notify('Set working days as business hours.');
                }}
                className="w-full bg-[#2f3b52] hover:bg-[#1e2736] text-white text-xs font-semibold py-2 px-3 rounded flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Set as business hours</span>
              </button>

              {/* Working Hours Grid with Break times and copy icons */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="grid grid-cols-12 bg-slate-50 font-semibold text-slate-700 py-2 px-3 border-b border-slate-200 text-xs">
                  <div className="col-span-2">Day</div>
                  <div className="col-span-3">From</div>
                  <div className="col-span-3">To</div>
                  <div className="col-span-2">Break From</div>
                  <div className="col-span-2">Break To</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {DAYS_ORDER.map((day) => {
                    const row = selectedEmployeeForHours.workingHours[day] || {
                      enabled: false,
                      from: '08:00 AM',
                      to: '11:00 PM',
                      breakFrom: '--:-- --',
                      breakTo: '--:-- --'
                    };
                    return (
                      <div key={day} className="grid grid-cols-12 items-center py-2 px-3 text-xs gap-2">
                        {/* Checkbox + Day */}
                        <div className="col-span-2 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={row.enabled}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedEmployeeForHours((prev) => {
                                if (!prev) return null;
                                return {
                                  ...prev,
                                  workingHours: {
                                    ...prev.workingHours,
                                    [day]: { ...prev.workingHours[day], enabled: checked }
                                  }
                                };
                              });
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                          />
                          <span className="font-semibold text-slate-800">{day}</span>
                        </div>

                        {/* From */}
                        <div className="col-span-3 relative flex items-center">
                          <input
                            type="text"
                            value={row.from}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedEmployeeForHours((prev) => {
                                if (!prev) return null;
                                return {
                                  ...prev,
                                  workingHours: {
                                    ...prev.workingHours,
                                    [day]: { ...prev.workingHours[day], from: val }
                                  }
                                };
                              });
                            }}
                            className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 pr-6 shadow-2xs focus:outline-none focus:border-blue-500"
                          />
                          <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
                        </div>

                        {/* To */}
                        <div className="col-span-3 relative flex items-center">
                          <input
                            type="text"
                            value={row.to}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedEmployeeForHours((prev) => {
                                if (!prev) return null;
                                return {
                                  ...prev,
                                  workingHours: {
                                    ...prev.workingHours,
                                    [day]: { ...prev.workingHours[day], to: val }
                                  }
                                };
                              });
                            }}
                            className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 pr-6 shadow-2xs focus:outline-none focus:border-blue-500"
                          />
                          <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
                        </div>

                        {/* Break From */}
                        <div className="col-span-2 relative flex items-center">
                          <input
                            type="text"
                            value={row.breakFrom}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedEmployeeForHours((prev) => {
                                if (!prev) return null;
                                return {
                                  ...prev,
                                  workingHours: {
                                    ...prev.workingHours,
                                    [day]: { ...prev.workingHours[day], breakFrom: val }
                                  }
                                };
                              });
                            }}
                            className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 pr-6 shadow-2xs focus:outline-none focus:border-blue-500 text-slate-500"
                          />
                          <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
                        </div>

                        {/* Break To */}
                        <div className="col-span-2 relative flex items-center">
                          <input
                            type="text"
                            value={row.breakTo}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedEmployeeForHours((prev) => {
                                if (!prev) return null;
                                return {
                                  ...prev,
                                  workingHours: {
                                    ...prev.workingHours,
                                    [day]: { ...prev.workingHours[day], breakTo: val }
                                  }
                                };
                              });
                            }}
                            className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 pr-6 shadow-2xs focus:outline-none focus:border-blue-500 text-slate-500"
                          />
                          <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-5 py-3 flex justify-end bg-white">
              <button
                type="button"
                onClick={() => {
                  setEmployees((prev) =>
                    prev.map((emp) =>
                      emp.id === selectedEmployeeForHours.id ? selectedEmployeeForHours : emp
                    )
                  );
                  setSelectedEmployeeForHours(null);
                  notify(`Saved working days and time for ${selectedEmployeeForHours.name}.`);
                }}
                className="bg-[#2f3b52] hover:bg-[#1e2736] text-white px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
