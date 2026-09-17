'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Filter, RotateCcw, ChevronDown, Search, Calendar, SlidersHorizontal, Check } from 'lucide-react';
import {
  getReportConfig,
  ReportConfig,
  ReportFilterFieldConfig,
  FilterOption,
  PRIMARY_TRANSACTION_MODE_FIELD,
  getDuplicateInvoicesModeFilters,
} from '@/config/reportRegistry';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

export interface DynamicReportFilterRendererProps {
  activeReportKey: string;
  module?: 'sales' | 'operations' | 'loyalty' | 'accounting' | 'fleet' | 'social' | 'general';
  values?: Record<string, any>;
  onValuesChange?: (values: Record<string, any>) => void;
  onApplyFilters?: (values: Record<string, any>) => void;
  onResetFilters?: () => void;
  extraControls?: React.ReactNode;
  className?: string;
  showTitleBar?: boolean;
}

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================

export default function DynamicReportFilterRenderer({
  activeReportKey,
  module = 'general',
  values: externalValues,
  onValuesChange,
  onApplyFilters,
  onResetFilters,
  extraControls,
  className = '',
  showTitleBar = true,
}: DynamicReportFilterRendererProps) {
  // 1. Resolve configuration from the centralized registry
  const reportConfig = useMemo(
    () => getReportConfig(activeReportKey, module),
    [activeReportKey, module]
  );

  const isDuplicateInvoices = useMemo(
    () => activeReportKey.toLowerCase().includes('duplicate invoice'),
    [activeReportKey]
  );

  // Helper to compute initial default values for the current config
  const getInitialValuesForConfig = (config: ReportConfig, mode?: string): Record<string, any> => {
    const initial: Record<string, any> = {
      period: 'This Month',
      fromDate: '2026-08-01',
      toDate: '2026-08-31',
    };

    const targetFilters = isDuplicateInvoices
      ? [PRIMARY_TRANSACTION_MODE_FIELD, ...getDuplicateInvoicesModeFilters(mode || 'Duplicate Invoices')]
      : config.filters;

    targetFilters.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initial[field.id] = field.defaultValue;
      } else if (field.type === 'select' && field.options && field.options.length > 0) {
        initial[field.id] = field.options[0].value;
      } else if (field.type === 'checkbox' || field.type === 'toggle') {
        initial[field.id] = false;
      } else if (field.type === 'number') {
        initial[field.id] = 0;
      } else {
        initial[field.id] = '';
      }
    });

    return initial;
  };

  // 2. Local State Management
  const [internalValues, setInternalValues] = useState<Record<string, any>>(() => {
    return externalValues ? { ...externalValues } : getInitialValuesForConfig(reportConfig);
  });

  const activeValues = externalValues || internalValues;
  const prevReportKeyRef = useRef<string>(activeReportKey);

  const currentMode = isDuplicateInvoices
    ? (activeValues.primaryMode || 'Duplicate Invoices')
    : undefined;

  // Dynamic filter schema switcher for Duplicate Invoices master engine
  const effectiveFilters = useMemo(() => {
    if (isDuplicateInvoices) {
      return [
        PRIMARY_TRANSACTION_MODE_FIELD,
        ...getDuplicateInvoicesModeFilters(currentMode || 'Duplicate Invoices'),
      ];
    }
    return reportConfig.filters;
  }, [isDuplicateInvoices, currentMode, reportConfig.filters]);

  // 3. State & Reset Handling: Flush obsolete parameters when report changes
  useEffect(() => {
    if (prevReportKeyRef.current !== activeReportKey) {
      const prevKey = prevReportKeyRef.current;
      prevReportKeyRef.current = activeReportKey;

      const newConfig = getReportConfig(activeReportKey, module);
      const newDefaults = getInitialValuesForConfig(newConfig);

      // Create list of valid field IDs for the new report
      const fieldsToCheck = isDuplicateInvoices
        ? [PRIMARY_TRANSACTION_MODE_FIELD, ...getDuplicateInvoicesModeFilters('Duplicate Invoices')]
        : newConfig.filters;
      const validFieldIds = new Set<string>(fieldsToCheck.map((f) => f.id));
      // Standard date fields are always permissible to preserve if they existed
      validFieldIds.add('period');
      validFieldIds.add('fromDate');
      validFieldIds.add('toDate');

      // Purge/flush obsolete parameters from previous report
      const cleanValues: Record<string, any> = { ...newDefaults };

      Object.keys(activeValues).forEach((key) => {
        if (validFieldIds.has(key) && activeValues[key] !== undefined) {
          cleanValues[key] = activeValues[key];
        }
      });

      setInternalValues(cleanValues);
      if (onValuesChange) {
        onValuesChange(cleanValues);
      }
    }
  }, [activeReportKey, module, isDuplicateInvoices]);

  // Update a single filter field value (with dynamic secondary fields initialization on primaryMode change)
  const handleFieldChange = (fieldId: string, value: any) => {
    const nextValues = {
      ...activeValues,
      [fieldId]: value,
    };

    if (fieldId === 'primaryMode' && isDuplicateInvoices) {
      const modeFilters = getDuplicateInvoicesModeFilters(value);
      modeFilters.forEach((f) => {
        if (nextValues[f.id] === undefined) {
          if (f.defaultValue !== undefined) {
            nextValues[f.id] = f.defaultValue;
          } else if (f.type === 'select' && f.options && f.options.length > 0) {
            nextValues[f.id] = f.options[0].value;
          } else if (f.type === 'checkbox' || f.type === 'toggle') {
            nextValues[f.id] = false;
          } else if (f.type === 'number') {
            nextValues[f.id] = 0;
          } else {
            nextValues[f.id] = '';
          }
        }
      });
    }

    setInternalValues(nextValues);
    if (onValuesChange) {
      onValuesChange(nextValues);
    }
  };

  // Reset filter values back to report defaults
  const handleReset = () => {
    const defaultVals = getInitialValuesForConfig(reportConfig, currentMode);
    setInternalValues(defaultVals);
    if (onValuesChange) {
      onValuesChange(defaultVals);
    }
    if (onResetFilters) {
      onResetFilters();
    }
  };

  // Trigger apply callback
  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters(activeValues);
    } else {
      console.log('[DynamicReportFilterRenderer] Applied filters:', activeValues);
    }
  };

  // 4. Conditional Rendering evaluator
  const isFieldVisible = (field: ReportFilterFieldConfig): boolean => {
    if (!field.dependsOn) return true;
    const { field: depField, equals, notEquals, in: inArr, isTruthy } = field.dependsOn;
    const depVal = activeValues[depField];

    if (equals !== undefined && depVal !== equals) return false;
    if (notEquals !== undefined && depVal === notEquals) return false;
    if (inArr !== undefined && !inArr.includes(depVal)) return false;
    if (isTruthy !== undefined && Boolean(depVal) !== isTruthy) return false;

    return true;
  };

  const visibleFields = effectiveFilters.filter(isFieldVisible);

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-4 md:p-5 shadow-sm space-y-4 print:hidden select-none ${className}`}
      data-testid="dynamic-report-filter-bar"
    >
      {/* SECTION HEADER & ACTIVE REPORT PILL */}
      {showTitleBar && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              Dynamic Report Filters
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {reportConfig.reportTitle || activeReportKey}
            </span>
            {reportConfig.code && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                {reportConfig.code}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {visibleFields.length} active filter{visibleFields.length === 1 ? '' : 's'}
          </span>
        </div>
      )}

      {/* MAIN INPUTS & ACTION BUTTONS CONTAINER */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Dynamic Responsive Grid of Injected Controls */}
        <div className="flex-1 w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 text-xs">
          {visibleFields.map((field) => {
            const val = activeValues[field.id] !== undefined ? activeValues[field.id] : field.defaultValue;

            // TYPE A: DATE-RANGE (Period select + optional custom date inputs)
            if (field.type === 'date-range') {
              const currentPeriod = activeValues.period || field.defaultValue || 'This Month';
              const isCustom = currentPeriod === 'Custom';

              return (
                <React.Fragment key={field.id}>
                  {/* Period Dropdown */}
                  <div className="flex flex-col gap-1 text-left min-w-0">
                    <label
                      htmlFor={`filter-${field.id}`}
                      className="text-[11px] font-medium text-slate-600 truncate"
                      title={field.label}
                    >
                      {field.label}
                    </label>
                    <div className="relative min-w-0">
                      <select
                        id={`filter-${field.id}`}
                        value={currentPeriod}
                        onChange={(e) => handleFieldChange('period', e.target.value)}
                        className="w-full min-w-0 appearance-none bg-white border border-slate-300 rounded-md py-1.5 px-2.5 pr-7 text-xs font-normal text-slate-800 focus:outline-none focus:border-slate-500 transition-all cursor-pointer shadow-2xs truncate"
                      >
                        {(field.options || []).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none shrink-0" />
                    </div>
                  </div>

                  {/* As-Of / From Date */}
                  <div className="flex flex-col gap-1 text-left min-w-0">
                    <label className="text-[11px] font-medium text-slate-600 truncate">
                      {isCustom ? 'From Date' : 'As-of Date'}
                    </label>
                    <div className="relative min-w-0">
                      <input
                        type="date"
                        value={activeValues.fromDate || '2026-08-01'}
                        onChange={(e) => handleFieldChange('fromDate', e.target.value)}
                        className="w-full min-w-0 bg-white border border-slate-300 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* To Date (Only if Custom Range selected) */}
                  {isCustom && (
                    <div className="flex flex-col gap-1 text-left min-w-0">
                      <label className="text-[11px] font-medium text-slate-600 truncate">To Date</label>
                      <div className="relative min-w-0">
                        <input
                          type="date"
                          value={activeValues.toDate || '2026-08-31'}
                          onChange={(e) => handleFieldChange('toDate', e.target.value)}
                          className="w-full min-w-0 bg-white border border-slate-300 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-500 transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            }

            // TYPE B: SINGLE DATE PICKER
            if (field.type === 'date') {
              return (
                <div key={field.id} className="flex flex-col gap-1 text-left min-w-0">
                  <label htmlFor={`filter-${field.id}`} className="text-[11px] font-medium text-slate-600 truncate" title={field.label}>
                    {field.label}
                  </label>
                  <input
                    id={`filter-${field.id}`}
                    type="date"
                    value={val || '2026-09-15'}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full min-w-0 bg-white border border-slate-300 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-500 transition-all shadow-2xs"
                  />
                </div>
              );
            }

            // TYPE C: SELECT DROPDOWN
            if (field.type === 'select') {
              const isPrimaryMode = field.id === 'primaryMode';
              return (
                <div key={field.id} className={`flex flex-col gap-1 text-left min-w-0 ${isPrimaryMode ? 'sm:col-span-2' : (field.className || 'w-full')}`}>
                  <label htmlFor={`filter-${field.id}`} className={`text-[11px] font-medium truncate ${isPrimaryMode ? '!text-blue-900 !font-bold' : 'text-slate-600'}`} title={field.label}>
                    {isPrimaryMode ? 'Primary Mode Selector Dropdown' : field.label}
                  </label>
                  <div className="relative min-w-0">
                    <select
                      id={`filter-${field.id}`}
                      value={val ?? (field.defaultValue || '')}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className={`w-full min-w-0 appearance-none bg-white border ${
                        isPrimaryMode ? 'border-blue-500 font-bold text-blue-950 bg-blue-50/40 ring-1 ring-blue-200' : 'border-slate-300 font-normal text-slate-800'
                      } rounded-md py-1.5 px-2.5 pr-7 text-xs focus:outline-none focus:border-blue-600 transition-all cursor-pointer shadow-2xs truncate`}
                    >
                      {(field.options || []).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none shrink-0" />
                  </div>
                </div>
              );
            }

            // TYPE D: TEXT / KEYWORD SEARCH
            if (field.type === 'text') {
              return (
                <div key={field.id} className={`flex flex-col gap-1 text-left min-w-0 ${field.className || 'w-full'}`}>
                  <label htmlFor={`filter-${field.id}`} className="text-[11px] font-medium text-slate-600 truncate" title={field.label}>
                    {field.label}
                  </label>
                  <div className="relative min-w-0">
                    <input
                      id={`filter-${field.id}`}
                      type="text"
                      placeholder={field.placeholder || 'Type keyword...'}
                      value={val ?? ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full min-w-0 bg-white border border-slate-300 rounded-md py-1.5 px-2.5 pl-7 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-500 transition-all shadow-2xs truncate"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
                  </div>
                </div>
              );
            }

            // TYPE E: NUMBER INPUT
            if (field.type === 'number') {
              return (
                <div key={field.id} className="flex flex-col gap-1 text-left min-w-0">
                  <label htmlFor={`filter-${field.id}`} className="text-[11px] font-medium text-slate-600 truncate" title={field.label}>
                    {field.label}
                  </label>
                  <input
                    id={`filter-${field.id}`}
                    type="number"
                    value={val ?? 0}
                    placeholder={field.placeholder || '0'}
                    onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
                    className="w-full min-w-0 bg-white border border-slate-300 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-500 transition-all shadow-2xs"
                  />
                </div>
              );
            }

            // TYPE F: CHECKBOX / TOGGLE
            if (field.type === 'checkbox' || field.type === 'toggle') {
              return (
                <div key={field.id} className="flex items-center gap-2 pt-5 select-none min-w-0">
                  <input
                    id={`filter-${field.id}`}
                    type="checkbox"
                    checked={Boolean(val)}
                    onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                    className="rounded border-slate-300 text-slate-700 focus:ring-slate-500 cursor-pointer h-4 w-4 shrink-0"
                  />
                  <label
                    htmlFor={`filter-${field.id}`}
                    className="text-[11.5px] font-medium text-slate-700 cursor-pointer truncate"
                    title={field.label}
                  >
                    {field.label}
                  </label>
                </div>
              );
            }

            return null;
          })}

          {/* Any extra custom controls injected by caller */}
          {extraControls}
        </div>

        {/* 5. ACTION BUTTONS: PRESERVED SLATE NAVY & BURGUNDY ACTION BUTTONS */}
        <div className="flex flex-row lg:flex-col gap-2 shrink-0 w-full lg:w-36 pt-0 lg:pt-5 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-4">
          {/* Primary Action Button: Slate Navy (#334155) */}
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 lg:flex-initial w-full inline-flex items-center justify-center gap-1.5 bg-[#334155] hover:bg-[#1e293b] text-white text-xs px-3 py-2 rounded-md font-medium shadow-2xs transition-colors cursor-pointer whitespace-nowrap active:scale-[0.98]"
            title="Filter Report"
          >
            <Filter className="w-3.5 h-3.5 shrink-0" />
            <span>Filter Report</span>
          </button>

          {/* Reset Filters Button: Deep Burgundy (#5c2427) */}
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 lg:flex-initial w-full inline-flex items-center justify-center gap-1.5 bg-[#5c2427] hover:bg-[#4a1d20] text-white text-xs px-3 py-2 rounded-md font-medium shadow-2xs transition-colors cursor-pointer whitespace-nowrap active:scale-[0.98]"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
}
