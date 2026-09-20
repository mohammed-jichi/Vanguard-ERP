'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Printer,
  FileDown,
  FileSpreadsheet,
  Search,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  Settings,
  X,
  Check
} from 'lucide-react';
import ReportSidebarNav from './ReportSidebarNav';
import DynamicReportFilterRenderer from './DynamicReportFilterRenderer';
import {
  getStandardPeriodOptions,
  resolveDateRangeFromPreset,
  formatISODate,
  isCustomDatePreset,
} from '@/lib/dateRangeEngine';

// ============================================================================
// 1. DESIGN SYSTEM TYPES & INTERFACES (AUTHENTIC OMEGA ARCHITECTURE)
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface MetricCardItem {
  id?: string;
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  subtext?: string;
  icon?: React.ReactNode;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface SelectFilterProps {
  id: string;
  label?: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export interface ReportCategoryItem {
  name: string;
  id?: string;
  code?: string;
  href?: string;
  isExternalLink?: boolean;
}

export interface ReportCategorySubGroup {
  title: string;
  items: (string | ReportCategoryItem)[];
}

export interface ReportCategoryGroup {
  title: string;
  items?: (string | ReportCategoryItem)[];
  subGroups?: ReportCategorySubGroup[];
}

export interface ReportHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  reportCode?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'primary' | 'warning' | 'neutral';
  actions?: React.ReactNode;
}

export type PaperSize = 'A4' | 'A3' | 'A5' | 'POS' | 'Barcode' | 'Auto';
export type ReportOrientation = 'portrait' | 'landscape';

export function getPaperSizeClasses(size: PaperSize = 'A4', orientation: ReportOrientation = 'portrait'): string {
  if (orientation === 'landscape') {
    switch (size) {
      case 'A3':
        return 'max-w-[1680px] w-full p-6 md:p-8';
      case 'A5':
        return 'max-w-4xl w-full p-5';
      case 'POS':
        return 'max-w-[420px] p-4 text-[10.5px] font-mono mx-auto shadow-md';
      case 'Barcode':
        return 'max-w-[340px] p-3 text-[9.5px] font-mono mx-auto shadow-md';
      case 'Auto':
        return 'w-full max-w-full p-5 md:p-7';
      case 'A4':
      default:
        return 'max-w-[1440px] w-full p-5 md:p-7';
    }
  }

  switch (size) {
    case 'A3':
      return 'max-w-7xl p-8';
    case 'A5':
      return 'max-w-3xl p-5';
    case 'POS':
      return 'max-w-[420px] p-4 text-[10.5px] font-mono mx-auto shadow-md';
    case 'Barcode':
      return 'max-w-[340px] p-3 text-[9.5px] font-mono mx-auto shadow-md';
    case 'Auto':
      return 'w-full max-w-full p-6 md:p-8';
    case 'A4':
    default:
      return 'max-w-6xl p-6 md:p-8';
  }
}

export const ReportPaperSizeContext = React.createContext<{
  paperSize: PaperSize;
  setPaperSize: (size: PaperSize) => void;
  orientation: ReportOrientation;
  setOrientation: (orientation: ReportOrientation) => void;
}>({
  paperSize: 'A4',
  setPaperSize: () => {},
  orientation: 'portrait',
  setOrientation: () => {},
});

export interface ExportButtonsProps {
  onExportPdf?: () => void;
  onPrint?: () => void;
  onExportExcel?: () => void;
  onExportCsv?: () => void;
  customActions?: React.ReactNode;
  isLoadingPdf?: boolean;
  isLoadingExcel?: boolean;
  paperSize?: PaperSize;
  onPaperSizeChange?: (size: PaperSize) => void;
  orientation?: ReportOrientation;
  onOrientationChange?: (orientation: ReportOrientation) => void;
}

export interface ReportFiltersProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  period?: string;
  onPeriodChange?: (period: string) => void;
  periodOptions?: FilterOption[];
  fromDate?: string;
  toDate?: string;
  onDateRangeChange?: (from: string, to: string) => void;
  onApplyFilters?: () => void;
  onResetFilters?: () => void;
  children?: React.ReactNode;
  extraControls?: React.ReactNode;
}

export interface ReportPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export interface ReportTableWrapperProps {
  children: React.ReactNode;
  title?: string;
  totalRecordsCount?: number;
  subtitle?: string;
  reportCode?: string;
  executionDate?: string;
  periodText?: string;
  pageInfo?: string;
  branchInfo?: string;
  pagination?: ReportPaginationProps;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  paperSize?: PaperSize;
  orientation?: ReportOrientation;
  actions?: React.ReactNode;
}

export interface ReportPageLayoutProps {
  children?: React.ReactNode;
  header?: React.ReactNode;
  filters?: React.ReactNode;
  metrics?: React.ReactNode; // Strictly omitted from display per Omega specification
  table?: React.ReactNode;
  className?: string;
  // Optional 2-column left corridor customization
  moduleTitle?: string;
  moduleKey?: string;
  storageKeyOverride?: string;
  categories?: ReportCategoryGroup[];
  selectedReport?: string;
  onSelectReport?: (reportName: string) => void;
  sidebar?: React.ReactNode;
}

export { default as ReportSidebarNav } from './ReportSidebarNav';
export type { ReportSidebarNavProps } from './ReportSidebarNav';
export { default as DynamicReportFilterRenderer } from './DynamicReportFilterRenderer';
export * from './DynamicReportFilterRenderer';

// ============================================================================
// 2. SUB-COMPONENT: REPORT HEADER
// ============================================================================

export function ReportHeader({
  title,
  subtitle,
  breadcrumbs = [],
  reportCode,
  badgeText,
  badgeVariant = 'primary',
  actions,
}: ReportHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 select-none print:hidden">
      <div>
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-400">/</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-slate-800 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-700 font-semibold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl font-normal text-slate-800 tracking-tight">
            {title}
          </h1>
          {reportCode && (
            <span className="px-2 py-0.5 text-xs font-mono font-bold tracking-wide rounded-md border bg-slate-100 text-slate-700 border-slate-300">
              {reportCode}
            </span>
          )}
          {badgeText && (
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {badgeText}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {/* Action button cluster top right */}
      <div className="flex items-center gap-2 shrink-0">
        {actions ? (
          actions
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="bg-muted hover:bg-slate-200 text-foreground border border-border text-xs rounded-lg px-3 py-1.5 font-medium transition-colors cursor-pointer"
            >
              Sales
            </button>
            <button
              type="button"
              className="bg-muted hover:bg-slate-200 text-foreground border border-border text-xs rounded-lg px-3 py-1.5 font-medium transition-colors cursor-pointer"
            >
              Input Forms
            </button>
            <button
              type="button"
              className="bg-muted hover:bg-slate-200 text-foreground border border-border text-xs rounded-lg px-3 py-1.5 font-medium transition-colors cursor-pointer"
            >
              Lists
            </button>
            <button
              type="button"
              className="bg-muted hover:bg-slate-200 text-foreground border border-border text-xs rounded-lg px-3 py-1.5 font-medium transition-colors cursor-pointer"
            >
              Reports Builder
            </button>
            <button
              type="button"
              title="Report Settings"
              className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-md transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 3. SUB-COMPONENT: UNIFORM EXPORT CONTROLS
// ============================================================================

export function ExportButtons({
  onExportPdf,
  onPrint,
  onExportExcel,
  onExportCsv,
  customActions,
  isLoadingPdf = false,
  isLoadingExcel = false,
  paperSize: propPaperSize,
  onPaperSizeChange: propOnPaperSizeChange,
  orientation: propOrientation,
  onOrientationChange: propOnOrientationChange,
}: ExportButtonsProps) {
  const context = React.useContext(ReportPaperSizeContext);
  const paperSize = propPaperSize || context.paperSize || 'A4';
  const onPaperSizeChange = propOnPaperSizeChange || context.setPaperSize;
  const orientation = propOrientation || context.orientation || 'portrait';
  const onOrientationChange = propOnOrientationChange || context.setOrientation;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleExport = () => {
    if (onExportExcel) {
      onExportExcel();
    } else if (onExportCsv) {
      onExportCsv();
    } else if (onExportPdf) {
      onExportPdf();
    } else {
      alert('Exporting report document...');
    }
  };

  return (
    <div className="flex items-center gap-2 print:hidden select-none">
      {/* Zoom / Auxiliary Buttons */}
      <button
        type="button"
        title="Zoom In"
        className="bg-muted hover:bg-slate-200 text-foreground border border-border p-2 rounded-lg transition-colors cursor-pointer shadow-xs"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Zoom Out"
        className="bg-muted hover:bg-slate-200 text-foreground border border-border p-2 rounded-lg transition-colors cursor-pointer shadow-xs"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      {/* Print Button */}
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-slate-800 text-primary-foreground text-xs rounded-lg font-medium shadow-xs transition-colors cursor-pointer"
        title="Print Report"
      >
        <Printer className="w-3.5 h-3.5" />
        <span>Print Report</span>
      </button>

      {/* Export Report Button */}
      <button
        type="button"
        onClick={handleExport}
        disabled={isLoadingPdf || isLoadingExcel}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-slate-800 text-primary-foreground text-xs rounded-lg font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        title="Export Report"
      >
        <FileDown className="w-3.5 h-3.5" />
        <span>Export Report</span>
      </button>

      {customActions}
    </div>
  );
}

// ============================================================================
// 4. SUB-COMPONENT: SELECT FILTER INPUT
// ============================================================================

export function ReportSelectFilter({
  id,
  label,
  value,
  options,
  onChange,
  className = '',
  placeholder = 'Select...',
}: SelectFilterProps) {
  return (
    <div className={`flex flex-col gap-1 text-left min-w-0 ${className || 'w-full'}`}>
      {label && (
        <label htmlFor={id} className="text-[11px] font-medium text-slate-600 truncate" title={label}>
          {label}
        </label>
      )}
      <div className="relative min-w-0">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 appearance-none bg-white border border-slate-300 rounded-md py-1.5 px-2.5 pr-7 text-xs font-normal text-slate-800 focus:outline-none focus:border-slate-500 transition-all cursor-pointer shadow-2xs truncate"
        >
          {placeholder && <option value="ALL">{placeholder}</option>}
          {options.map((opt, idx) => (
            <option
              key={`${opt.value}-${idx}`}
              value={opt.value}
              disabled={(opt as any).disabled}
              title={(opt as any).tooltip}
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none shrink-0" />
      </div>
    </div>
  );
}

// ============================================================================
// 5. SUB-COMPONENT: REPORT FILTERS (BOX WITH OMEGA TOKEN BUTTONS)
// ============================================================================

export function ReportFilters({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search filter...',
  period = 'Today',
  onPeriodChange,
  periodOptions = getStandardPeriodOptions(),
  fromDate = '',
  toDate = '',
  onDateRangeChange,
  onApplyFilters,
  onResetFilters,
  children,
  extraControls,
}: ReportFiltersProps) {
  const [groupByDate, setGroupByDate] = useState(false);
  const [showUnposted, setShowUnposted] = useState(false);
  const [removeGrouping, setRemoveGrouping] = useState(false);
  const [showTaxes, setShowTaxes] = useState(true);

  const todayISO = formatISODate(new Date());

  const isCustom = isCustomDatePreset(period);
  const resolvedPeriod = resolveDateRangeFromPreset(period, fromDate, toDate);

  const handlePeriodChange = (newPeriod: string) => {
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    }
    if (!isCustomDatePreset(newPeriod) && onDateRangeChange) {
      const resolved = resolveDateRangeFromPreset(newPeriod, fromDate, toDate);
      onDateRangeChange(resolved.fromDate, resolved.toDate);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 print:hidden select-none">
      {/* Section Title */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          Filters
        </span>
      </div>

      {/* Main Inputs Grid & Stacked Actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Multi-column grid for standard selects */}
        <div className="flex-1 w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 text-xs">
          {/* Period Select */}
          {onPeriodChange && (
            <ReportSelectFilter
              id="report-period"
              label="Period"
              value={period}
              options={periodOptions}
              onChange={handlePeriodChange}
              placeholder=""
            />
          )}

          {/* Static Preset Read-Only Contextual Badge vs Editable Custom Date Inputs */}
          {!isCustom ? (
            <div className="flex flex-col gap-1 text-left min-w-0 sm:col-span-2">
              <label className="text-[11px] font-medium text-slate-500 truncate">
                Active Period
              </label>
              <div className="flex items-center gap-2 h-[34px] px-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-800 shrink-0">{period}:</span>
                <span className="font-mono text-slate-600 truncate">{resolvedPeriod.displayPeriod}</span>
                {resolvedPeriod.warning && (
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 ml-auto shrink-0">
                    {resolvedPeriod.warning}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Editable From Date - ONLY WHEN CUSTOM */}
              <div className="flex flex-col gap-1 text-left min-w-0">
                <label className="text-[11px] font-medium text-slate-600 truncate">
                  From Date
                </label>
                <div className="relative min-w-0">
                  <input
                    type="date"
                    value={fromDate || todayISO}
                    onChange={(e) => onDateRangeChange && onDateRangeChange(e.target.value, toDate)}
                    className="w-full min-w-0 bg-white border border-slate-300 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-500 transition-all shadow-2xs font-mono"
                  />
                </div>
              </div>

              {/* Editable To Date - ONLY WHEN CUSTOM */}
              {onDateRangeChange && (
                <div className="flex flex-col gap-1 text-left min-w-0">
                  <label className="text-[11px] font-medium text-slate-600 truncate">To Date</label>
                  <div className="relative min-w-0">
                    <input
                      type="date"
                      value={toDate || todayISO}
                      onChange={(e) => onDateRangeChange(fromDate, e.target.value)}
                      className="w-full min-w-0 bg-white border border-slate-300 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-500 transition-all shadow-2xs font-mono"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Search Autocomplete */}
          {onSearchChange && (
            <div className="flex flex-col gap-1 text-left min-w-0">
              <label className="text-[11px] font-medium text-slate-600 truncate">Item Search / Keyword</label>
              <div className="relative min-w-0">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full min-w-0 bg-white border border-slate-300 rounded-md py-1.5 px-2.5 pl-7 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-500 transition-all shadow-2xs truncate"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Module-Specific Injected Filter Controls */}
          {children}
        </div>

        {/* Action Buttons Stacked on the Right */}
        <div className="flex flex-row lg:flex-col gap-2 shrink-0 w-full lg:w-36 pt-0 lg:pt-5 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-4">
          {/* Primary Filter Button */}
          <button
            type="button"
            onClick={onApplyFilters}
            className="flex-1 lg:flex-initial w-full inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-slate-800 text-primary-foreground text-xs px-3 py-2 rounded-lg font-medium shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Filter className="w-3.5 h-3.5 shrink-0" />
            <span>Filter Report</span>
          </button>

          {/* Reset Filters Button */}
          <button
            type="button"
            onClick={onResetFilters}
            className="flex-1 lg:flex-initial w-full inline-flex items-center justify-center gap-1.5 bg-muted hover:bg-slate-200 text-foreground border border-border text-xs px-3 py-2 rounded-lg font-medium shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Row of boolean checkboxes */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-700">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={groupByDate}
            onChange={(e) => setGroupByDate(e.target.checked)}
            className="rounded border-slate-300 text-slate-700 focus:ring-slate-500 cursor-pointer"
          />
          <span className="text-[11.5px] font-medium text-slate-600">Group by date</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={showUnposted}
            onChange={(e) => setShowUnposted(e.target.checked)}
            className="rounded border-slate-300 text-slate-700 focus:ring-slate-500 cursor-pointer"
          />
          <span className="text-[11.5px] font-medium text-slate-600">Show unposted</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={removeGrouping}
            onChange={(e) => setRemoveGrouping(e.target.checked)}
            className="rounded border-slate-300 text-slate-700 focus:ring-slate-500 cursor-pointer"
          />
          <span className="text-[11.5px] font-medium text-slate-600">Remove Grouping</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={showTaxes}
            onChange={(e) => setShowTaxes(e.target.checked)}
            className="rounded border-slate-300 text-slate-700 focus:ring-slate-500 cursor-pointer"
          />
          <span className="text-[11.5px] font-medium text-slate-600">Show Taxes</span>
        </label>
      </div>
    </div>
  );
}

// ============================================================================
// 6. METRIC CARDS (OMITTED FROM DISPLAY PER OMEGA SPECIFICATION)
// ============================================================================

export function ReportMetricCards({ metrics = [] }: { metrics?: MetricCardItem[] }) {
  // Dark/heavy KPI metric cards are intentionally omitted from standard report views
  return null;
}

// ============================================================================
// 7. SUB-COMPONENT: REPORT PAGINATION
// ============================================================================

export function ReportPagination({
  currentPage,
  totalPages,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: ReportPaginationProps) {
  const startRecord = Math.min((currentPage - 1) * pageSize + 1, totalRecords);
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 select-none print:hidden">
      <div className="flex items-center gap-2">
        <span>
          Showing <strong className="text-slate-800">{totalRecords > 0 ? startRecord : 0}</strong> to{' '}
          <strong className="text-slate-800">{endRecord}</strong> of{' '}
          <strong className="text-slate-800">{totalRecords}</strong> entries
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-4">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 focus:outline-none"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-2 py-0.5 text-slate-700 font-medium">
          Page {currentPage} of {Math.max(totalPages, 1)}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 8. SUB-COMPONENT: REPORT TABLE WRAPPER / DOCUMENT SHEET CONTAINER
// ============================================================================

export function ReportTableWrapper({
  children,
  title,
  subtitle,
  reportCode = 'REP_GEN_001',
  executionDate,
  periodText,
  pageInfo = 'Page 1 of 1',
  branchInfo = 'Branch: Choueifat Main Facility (Southern Olive Oil Products S.A.R.L)',
  totalRecordsCount,
  pagination,
  isLoading = false,
  emptyState,
  paperSize: propPaperSize,
  orientation: propOrientation,
  actions,
}: ReportTableWrapperProps) {
  const context = React.useContext(ReportPaperSizeContext);
  const activePaperSize = propPaperSize || context.paperSize || 'A4';
  const activeOrientation = propOrientation || context.orientation || 'portrait';
  const paperClasses = getPaperSizeClasses(activePaperSize, activeOrientation);

  const displayDate =
    executionDate ||
    new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="w-full bg-background py-2 print:p-0 print:bg-white select-none">
      {/* Print Page Orientation & Margin Rule */}
      <style>{`
        @media print {
          @page {
            size: ${activeOrientation === 'landscape' ? 'landscape' : 'auto'};
            margin: ${activeOrientation === 'landscape' ? '8mm 6mm' : '12mm 10mm'};
          }
          .report-sheet {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* AUTHENTIC PRINTABLE DOCUMENT SHEET (MATCHING ACCOUNTING/SALES A4 BLUEPRINT) */}
      <div
        className={`report-sheet print:block w-full mx-auto bg-white border border-slate-200 rounded-xl shadow-sm min-h-[580px] flex flex-col justify-between transition-all duration-200 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-full ${paperClasses}`}
      >
        <div>
          {/* ================================================================= */}
          {/* A. AUTHENTIC CORPORATE TOPPER (CENTERED BLUE)                     */}
          {/* ================================================================= */}
          <div className="text-center">
            <h1 className="font-bold text-report-company text-blue-700 text-[15px] tracking-wide uppercase font-sans">
              Zeit w zaytoun ljanoub
            </h1>
            <div className="text-[11px] font-semibold text-slate-600 tracking-normal mt-0.5 font-sans">
              Southern Olive Oil Products S.A.R.L
            </div>
          </div>

          {/* ================================================================= */}
          {/* B. REPORT TITLE (CENTERED BOLD)                                   */}
          {/* ================================================================= */}
          {title && (
            <div className="text-center font-extrabold text-report-title text-slate-900 text-[13.5px] mt-2.5 mb-1 font-sans">
              {title}
            </div>
          )}

          {/* ================================================================= */}
          {/* C. EXECUTION SUBHEADER (DATE, PERIOD, PAGE)                       */}
          {/* ================================================================= */}
          <div className="flex items-center justify-between text-report-meta text-[11px] text-slate-800 font-mono mt-3 mb-1">
            <span className="font-medium">{displayDate}</span>
            <span className="font-bold text-center flex-1">
              {periodText || subtitle || 'Current Active Period'}
            </span>
            <span className="font-medium">{pageInfo}</span>
          </div>

          {/* ================================================================= */}
          {/* D. TOP SOLID DIVIDING RULE                                        */}
          {/* ================================================================= */}
          <div className="border-b-report-master border-b-2 border-report-borderMaster border-slate-900 mb-2"></div>

          {/* Branch Subtitle & Ledger Source */}
          {branchInfo && (
            <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate-700 mb-2 font-sans">
              <span>{branchInfo}</span>
              <span className="font-mono text-slate-500">System Source: Vanguard ERP Live Ledger</span>
            </div>
          )}

          {/* Custom actions (if explicitly provided, but NO duplicate export buttons) */}
          {actions && <div className="mb-3 flex justify-end print:hidden">{actions}</div>}

          {/* ================================================================= */}
          {/* E. REPORT DATA CANVAS                                             */}
          {/* ================================================================= */}
          <div className="relative overflow-x-auto print:overflow-visible">
            {isLoading && (
              <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
                <span className="text-xs font-semibold text-slate-700 animate-pulse">
                  Loading report sheet...
                </span>
              </div>
            )}

            {emptyState ? (
              emptyState
            ) : (
              <div className="w-full text-left text-[11px] sm:text-xs text-slate-700 [&_table]:w-full [&_table]:border-collapse [&_thead_tr]:bg-slate-50/70 [&_thead_tr]:border-y-2 [&_thead_tr]:border-slate-900 [&_thead_th]:py-1.5 [&_thead_th]:px-2 [&_thead_th]:text-[11px] sm:[&_thead_th]:text-xs [&_thead_th]:font-bold [&_thead_th]:text-slate-900 [&_thead_th]:whitespace-nowrap [&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100 [&_tbody_tr:hover]:bg-blue-50/30 [&_tbody_td]:py-1.5 [&_tbody_td]:px-2 [&_tbody_td]:text-[11px] sm:[&_tbody_td]:text-xs [&_tfoot_tr]:bg-slate-50 [&_tfoot_tr]:border-t-2 [&_tfoot_tr]:border-slate-900 [&_tfoot_td]:py-2 [&_tfoot_td]:px-2 [&_tfoot_td]:font-bold">
                {children}
              </div>
            )}
          </div>

          {pagination && (
            <div className="mt-4 print:hidden">
              <ReportPagination {...pagination} />
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* F. AUTHENTIC CORPORATE FOOTER WITH REPORT CODE, COPYRIGHT & LINK    */}
        {/* =================================================================== */}
        <div className="pt-12 mt-6 print:pt-6">
          {/* Bottom Solid Dividing Rule */}
          <div className="border-b-report-master border-b-2 border-report-borderMaster border-slate-900 mb-1.5"></div>

          <div className="flex items-center justify-between text-[10px] text-slate-800 font-sans">
            <span className="font-mono font-bold tracking-wider text-slate-900">{reportCode}</span>
            <span className="text-slate-700 font-medium text-center flex-1">
              Copyright © 2026 Vanguard ERP. All Rights Reserved.
            </span>
            <div className="text-right">
              <a
                href="https://www.vanguarderp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:underline font-mono text-[10px] cursor-pointer"
              >
                &quot;www.vanguarderp.com&quot;
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 9. DEFAULT MODULE CATEGORIES BLUEPRINT
// ============================================================================

const DEFAULT_OMEGA_CATEGORIES: ReportCategoryGroup[] = [
  {
    title: 'Recently Viewed',
    items: ['Production & Extraction Logs', 'Inventory Balance Standard', 'Daily Cashier Reconciliation']
  },
  {
    title: 'Recommended',
    items: ['Stock Valuation Master Report', 'Inventory Movement Summary', 'Purchase Variance Analysis']
  },
  {
    title: 'Inventory',
    items: ['Inventory Balance Standard', 'Negative Stock Audit', 'Warehouse Stock Valuation']
  },
  {
    title: 'Purchases',
    items: ['Purchase Order Fulfillment', 'Supplier Receipts Register', 'Purchase Invoices by Vendor']
  },
  {
    title: 'Sales',
    items: ['Daily Extraction & Production Logs', 'Gross Sales by Product', 'Cashier Shift Reconciliation']
  },
  {
    title: 'Stock Movement',
    items: ['Warehouse Transfers Summary', 'Stock Adjustments Audit', 'Item Assembly Breakdown']
  },
  {
    title: 'Transactions',
    items: ['All Stock Transactions Log', 'Batch & Lot Tracking Ledger']
  },
  {
    title: 'Reordering',
    items: ['Reorder Threshold Guide', 'Below Minimum Stock Alert']
  },
  {
    title: 'Input Forms',
    items: ['Goods Receipt Form', 'Store Transfer Form']
  },
  {
    title: 'Lists',
    items: ['Active Items Master List', 'Suppliers Directory List', 'Price Lists Overview']
  }
];

// ============================================================================
// 10. MASTER LAYOUT: REPORT PAGE LAYOUT (STRICT 2-COLUMN OMEGA ARCHITECTURE)
// ============================================================================

export default function ReportPageLayout({
  children,
  header,
  filters,
  metrics, // Strictly omitted from display per Omega specification
  table,
  className = '',
  moduleTitle = 'Reports Hub',
  moduleKey = 'general',
  storageKeyOverride,
  categories = DEFAULT_OMEGA_CATEGORIES,
  selectedReport: externalSelectedReport,
  onSelectReport,
  sidebar,
}: ReportPageLayoutProps) {
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [orientation, setOrientation] = useState<ReportOrientation>('portrait');
  const [internalSelectedReport, setInternalSelectedReport] = useState(
    categories[0]?.items?.[0]
      ? typeof categories[0].items[0] === 'string'
        ? categories[0].items[0]
        : categories[0].items[0].name
      : categories[0]?.subGroups?.[0]?.items?.[0]
      ? typeof categories[0].subGroups[0].items[0] === 'string'
        ? categories[0].subGroups[0].items[0]
        : categories[0].subGroups[0].items[0].name
      : 'Transactions by Date'
  );

  const activeReport = externalSelectedReport !== undefined ? externalSelectedReport : internalSelectedReport;

  const handleSelect = (name: string) => {
    setInternalSelectedReport(name);
    if (onSelectReport) onSelectReport(name);
  };

  return (
    <ReportPaperSizeContext.Provider value={{ paperSize, setPaperSize, orientation, setOrientation }}>
      <div
        className={`min-h-screen p-4 md:p-6 bg-background font-sans text-foreground select-none ${className}`}
      >
        {/* 2-Column Master Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          
          {/* ===================================================================
              A. LEFT COLUMN: REPORT CATEGORIES & SEARCH NAVIGATION (w-72 shrink-0)
              =================================================================== */}
          {sidebar ? (
            sidebar
          ) : (
            <ReportSidebarNav
              moduleKey={moduleKey}
              storageKeyOverride={storageKeyOverride}
              categories={categories}
              activeReport={activeReport}
              onSelectReport={handleSelect}
            />
          )}

          {/* ===================================================================
              B. RIGHT COLUMN: MAIN REPORT WORKPLACE (flex-1 space-y-4)
              =================================================================== */}
          <main className="flex-1 w-full space-y-4 min-w-0">
            {/* Top Workplace Header */}
            {header ? (
              header
            ) : (
              <ReportHeader
                title={activeReport}
                breadcrumbs={[
                  { label: 'Home', href: '/backoffice' },
                  { label: moduleTitle },
                  { label: activeReport },
                ]}
              />
            )}

            {/* Filter Box */}
            {filters ? (
              filters
            ) : (
              <DynamicReportFilterRenderer
                activeReportKey={activeReport}
                module={moduleKey as any}
              />
            )}

            {/* Report Preview Container & Document Sheet Canvas */}
            {table ? table : (
              <ReportTableWrapper title={activeReport}>
                {children}
              </ReportTableWrapper>
            )}
          </main>
        </div>

        {/* Universal Dynamic Print Optimization */}
        <style jsx global>{`
          @media print {
            @page {
              size: auto;
              margin: 12mm 10mm 12mm 10mm;
            }
            html,
            body {
              background-color: white !important;
              color: black !important;
              font-size: 10pt !important;
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .print\\:hidden,
            aside,
            header,
            nav,
            button,
            input,
            select {
              display: none !important;
            }
            main,
            .flex-1,
            .report-sheet,
            .report-wrapper {
              width: 100% !important;
              max-width: 100% !important;
              min-width: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }
            table {
              width: 100% !important;
              max-width: 100% !important;
              border-collapse: collapse !important;
              table-layout: auto !important;
            }
            th,
            td {
              border-bottom: 1px solid #e2e8f0 !important;
              padding: 5px 8px !important;
            }
          }
        `}</style>
      </div>
    </ReportPaperSizeContext.Provider>
  );
}
