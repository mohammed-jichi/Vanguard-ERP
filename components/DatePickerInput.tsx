'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_ABBRS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

interface DatePickerInputProps {
  value: string;
  onChange: (dateStr: string) => void;
  className?: string;
  placeholder?: string;
  inputWidth?: string;
  showIconOnly?: boolean;
  customButtonLabel?: string;
  alignRight?: boolean;
}

export default function DatePickerInput({
  value,
  onChange,
  className = '',
  placeholder = 'DD-MMM-YYYY',
  inputWidth = 'w-32',
  showIconOnly = false,
  customButtonLabel,
  alignRight = false
}: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value or fallback to Sep 7, 2026
  const parsedDate = useMemo(() => {
    if (!value) return new Date(2026, 8, 7);
    const parts = value.split(/[-/,\s]+/);
    if (parts.length >= 3) {
      const d = parseInt(parts[0], 10);
      const mIdx = MONTH_ABBRS.findIndex((abbr) => abbr.toLowerCase() === parts[1].toLowerCase());
      const y = parseInt(parts[2], 10);
      if (!isNaN(d) && mIdx !== -1 && !isNaN(y)) {
        return new Date(y, mIdx, d);
      }
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date(2026, 8, 7) : d;
  }, [value]);

  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth());

  // Keep view aligned when value changes
  useEffect(() => {
    setViewYear(parsedDate.getFullYear());
    setViewMonth(parsedDate.getMonth());
  }, [parsedDate]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Calendar matrix calculations
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { dayNumber: number; isCurrentMonth: boolean; dateObj: Date }[] = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = totalDaysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({
        dayNumber: d,
        isCurrentMonth: false,
        dateObj: new Date(prevY, prevM, d)
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      cells.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateObj: new Date(viewYear, viewMonth, d)
      });
    }

    // Next month filler days up to 35 or 42 cells
    const remaining = 35 - cells.length > 0 ? 35 - cells.length : 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({
        dayNumber: d,
        isCurrentMonth: false,
        dateObj: new Date(nextY, nextM, d)
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const selectDate = (dateObj: Date) => {
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = MONTH_ABBRS[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const formatted = `${day}-${month}-${year}`;
    onChange(formatted);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${isOpen ? 'z-50' : ''} ${className}`}>
      {/* Trigger Area */}
      {customButtonLabel ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#2f3b52] hover:bg-[#1e2736] text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          title="Select Date"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-white" />
          <span>{customButtonLabel}</span>
        </button>
      ) : showIconOnly ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#2f3b52] hover:bg-[#1e2736] text-white p-1 rounded cursor-pointer shadow-2xs transition-colors flex items-center justify-center"
          title="Open Calendar"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-orange-400" />
        </button>
      ) : (
        <div className="relative flex items-center">
          <input
            type="text"
            value={value}
            onClick={() => setIsOpen(true)}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-800 pr-7 shadow-2xs cursor-pointer focus:outline-none focus:border-blue-500 ${inputWidth}`}
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-1.5 p-0.5 text-slate-500 hover:text-slate-800 cursor-pointer rounded"
            title="Open Calendar"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-slate-600 hover:text-blue-600 transition-colors" />
          </button>
        </div>
      )}

      {/* Calendar Popover */}
      {isOpen && (
        <div className={`absolute z-[9999] top-full ${alignRight ? 'right-0' : 'left-0'} mt-1 bg-white border border-slate-300 rounded-md shadow-2xl p-3 w-64 text-xs font-sans animate-fade-in select-none`}>
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="font-bold text-slate-800 text-xs">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center font-semibold text-[11px] text-slate-500 py-1.5 border-b border-slate-100">
            <span className="text-red-500">Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span className="text-slate-600">Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-0.5 pt-1.5 text-center">
            {calendarCells.map((cell, idx) => {
              const isSelected =
                parsedDate.getFullYear() === cell.dateObj.getFullYear() &&
                parsedDate.getMonth() === cell.dateObj.getMonth() &&
                parsedDate.getDate() === cell.dateObj.getDate();

              const isToday =
                cell.dateObj.getFullYear() === 2026 &&
                cell.dateObj.getMonth() === 8 &&
                cell.dateObj.getDate() === 7;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectDate(cell.dateObj)}
                  className={`h-7 w-7 mx-auto flex items-center justify-center rounded text-[11px] transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#0d6efd] text-white font-bold shadow-xs'
                      : cell.isCurrentMonth
                      ? isToday
                        ? 'bg-amber-100 text-slate-900 font-bold hover:bg-amber-200'
                        : 'text-slate-800 hover:bg-slate-100 font-medium'
                      : 'text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {cell.dayNumber}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => selectDate(new Date(2026, 8, 7))}
              className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
