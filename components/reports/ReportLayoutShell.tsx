'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Printer,
  Download,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Check,
  RotateCcw,
  FileSpreadsheet,
  Layers,
  Receipt,
  FileText
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export type PaperFormat = 'A4' | 'A3' | 'Letter' | 'Legal' | 'Thermal' | 'Thermal-58';
export type PaperOrientation = 'portrait' | 'landscape';

export interface PrintFormatOptions {
  format?: PaperFormat;
  orientation?: PaperOrientation;
  customWidth?: string;
}

/**
 * Universal dynamic print helper: injects appropriate @page CSS rule and cleans up
 */
export function printFormattedReport(options: PrintFormatOptions = {}) {
  const format = options.format || 'A4';
  const orientation = options.orientation || 'portrait';

  // Remove any preexisting dynamic print styles
  const existing = document.getElementById('dynamic-print-orientation');
  if (existing) existing.remove();

  const style = document.createElement('style');
  style.id = 'dynamic-print-orientation';

  if (format === 'Thermal' || format === 'Thermal-58') {
    const width = format === 'Thermal-58' ? '48mm' : '76mm';
    document.body.setAttribute('data-print-mode', format.toLowerCase());
    style.innerHTML = `
      @page {
        size: ${width} auto;
        margin: 2mm;
      }
      body {
        width: ${width} !important;
        margin: 0 auto !important;
      }
      .report-surface, .printable-area {
        width: ${width} !important;
        max-width: ${width} !important;
      }
    `;
  } else {
    document.body.removeAttribute('data-print-mode');
    style.innerHTML = `
      @page {
        size: ${format} ${orientation};
        margin: 10mm;
      }
      body {
        width: 100% !important;
      }
    `;
  }

  document.head.appendChild(style);

  // Invoke native browser print
  window.print();

  // Clean up dynamic rules after printing completes
  const cleanup = () => {
    style.remove();
    document.body.removeAttribute('data-print-mode');
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
}

export interface ReportLayoutShellProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  filterControls?: React.ReactNode;
  headerActions?: React.ReactNode; // Extensible slot for PDF, XLSX, Print, Custom Actions
  printConfig?: {
    supportedFormats?: PaperFormat[];
    defaultOrientation?: PaperOrientation;
    defaultFormat?: PaperFormat;
  };
  children: React.ReactNode;
  footerSummary?: React.ReactNode;
  className?: string;
  onRefresh?: () => void;
  onExportCSV?: () => void;
  isThermalPreview?: boolean;
}

export default function ReportLayoutShell({
  title,
  subtitle,
  badge,
  filterControls,
  headerActions,
  printConfig,
  children,
  footerSummary,
  className = '',
  onRefresh,
  onExportCSV,
  isThermalPreview = false,
}: ReportLayoutShellProps) {
  const { t } = useLanguage();

  const supportedFormats = printConfig?.supportedFormats || ['A4', 'Letter', 'Legal', 'A3', 'Thermal', 'Thermal-58'];
  const [selectedFormat, setSelectedFormat] = useState<PaperFormat>(printConfig?.defaultFormat || 'A4');
  const [selectedOrientation, setSelectedOrientation] = useState<PaperOrientation>(printConfig?.defaultOrientation || 'portrait');
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
  const [isThermalActive, setIsThermalActive] = useState(isThermalPreview || printConfig?.defaultFormat === 'Thermal');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const printMenuRef = useRef<HTMLDivElement>(null);

  // Close print dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (printMenuRef.current && !printMenuRef.current.contains(e.target as Node)) {
        setIsPrintMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrint = (overrideFormat?: PaperFormat, overrideOrientation?: PaperOrientation) => {
    const fmt = overrideFormat || selectedFormat;
    const ori = overrideOrientation || selectedOrientation;
    setIsPrintMenuOpen(false);
    printFormattedReport({ format: fmt, orientation: ori });
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  const isThermalSelected = selectedFormat === 'Thermal' || selectedFormat === 'Thermal-58';

  return (
    <div className={`w-full font-sans text-slate-800 space-y-4 ${className}`}>
      {/* =================================================================== */}
      {/* 1. STREAMLINED TOP BAR (MERGED HEADER & EXTENSIBLE ACTION TOOLBAR)  */}
      {/* =================================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        {/* Left: Single Title + Subtle Badge + Subtitle */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-800 tracking-tight">
                {title}
              </h1>
              {badge && (
                <div className="inline-flex items-center">
                  {badge}
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs font-normal text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Unified Action Toolbar (Locked to h-8 Controls) */}
        <div className="flex items-center gap-2">
          {/* Refresh Action */}
          {onRefresh && (
            <button
              type="button"
              onClick={handleRefresh}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition cursor-pointer"
              title={t('refresh_data', 'Refresh Data')}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-slate-700' : ''}`} />
            </button>
          )}

          {/* Export CSV Action */}
          {onExportCSV && (
            <button
              type="button"
              onClick={onExportCSV}
              className="h-8 px-3 text-xs font-medium rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition inline-flex items-center gap-1.5 cursor-pointer"
              title={t('export_csv', 'Export CSV')}
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('export_csv', 'Export CSV')}</span>
            </button>
          )}

          {/* Custom Extensible Header Actions (PDF, XLSX, etc.) */}
          {headerActions}

          {/* Unified Dynamic Paper & Print Selector */}
          <div className="relative" ref={printMenuRef}>
            <div className="inline-flex rounded-lg shadow-none">
              <button
                type="button"
                onClick={() => handlePrint()}
                className="h-8 px-3 text-xs font-medium rounded-l-lg bg-slate-900 hover:bg-slate-800 text-white shadow-none transition inline-flex items-center gap-1.5 cursor-pointer"
                title={`Print (${selectedFormat} ${!isThermalSelected ? selectedOrientation : ''})`}
              >
                <Printer className="w-3.5 h-3.5 text-slate-200" />
                <span>{t('print', 'Print')}</span>
                <span className="text-[10px] text-slate-300 font-mono bg-slate-800 px-1 rounded">
                  {selectedFormat}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsPrintMenuOpen(!isPrintMenuOpen)}
                className="h-8 px-1.5 rounded-r-lg bg-slate-900 hover:bg-slate-800 border-l border-slate-700 text-slate-300 transition cursor-pointer flex items-center justify-center"
                title="Select Paper Size & Orientation"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print Configuration Dropdown */}
            {isPrintMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-100">
                <div>
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                    {t('paper_size', 'Paper Size')}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {supportedFormats.map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => {
                          setSelectedFormat(fmt);
                          if (fmt === 'Thermal' || fmt === 'Thermal-58') {
                            setIsThermalActive(true);
                          }
                        }}
                        className={`h-7 px-2 rounded text-left text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                          selectedFormat === fmt
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span>{fmt}</span>
                        {selectedFormat === fmt && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>

                {!isThermalSelected && (
                  <div>
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                      {t('orientation', 'Orientation')}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedOrientation('portrait')}
                        className={`h-7 px-2 rounded text-left text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                          selectedOrientation === 'portrait'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span>{t('portrait', 'Portrait')}</span>
                        {selectedOrientation === 'portrait' && <Check className="w-3 h-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedOrientation('landscape')}
                        className={`h-7 px-2 rounded text-left text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                          selectedOrientation === 'landscape'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span>{t('landscape', 'Landscape')}</span>
                        {selectedOrientation === 'landscape' && <Check className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Direct Print Button from Menu */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {isThermalSelected ? (
                    <button
                      type="button"
                      onClick={() => setIsThermalActive(!isThermalActive)}
                      className="text-[11px] font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer flex items-center gap-1"
                    >
                      <Receipt className="w-3 h-3" />
                      <span>{isThermalActive ? 'Full Screen View' : 'Thermal Preview'}</span>
                    </button>
                  ) : <div />}

                  <button
                    type="button"
                    onClick={() => handlePrint()}
                    className="h-7 px-3 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3 h-3" />
                    <span>{t('print_now', 'Print Now')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. STANDARDIZED PARAMETER / FILTER BAR (IF PROVIDED)               */}
      {/* =================================================================== */}
      {filterControls && (
        <div className="bg-slate-50/75 border border-slate-200 rounded-xl px-4 py-2.5 shadow-2xs no-print flex flex-wrap items-center gap-2 text-xs">
          {filterControls}
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. REPORT DATA SURFACE / MATRIX                                     */}
      {/* =================================================================== */}
      <div
        className={`report-surface bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all ${
          isThermalActive
            ? 'thermal-roll-print max-w-[76mm] mx-auto border-dashed p-3 shadow-md'
            : 'w-full'
        }`}
      >
        <div className="w-full overflow-x-auto print:overflow-visible">
          {children}
        </div>

        {/* Optional Pinned Footer Summary */}
        {footerSummary && (
          <div className="text-xs font-semibold text-slate-900 py-3 px-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {footerSummary}
          </div>
        )}
      </div>
    </div>
  );
}
