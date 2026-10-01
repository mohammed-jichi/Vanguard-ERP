'use client';

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Printer, Download, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

export type PaperSize = 'A4' | 'A3' | 'A5' | 'POS' | 'Barcode' | 'Auto';

export function getPaperSizeClasses(size: PaperSize = 'A4', orientation: 'portrait' | 'landscape' = 'portrait'): string {
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

export interface UnifiedPrintableReportSheetProps {
  topperTitle?: string;
  subtitle?: string;
  reportTitle: string;
  reportCode?: string;
  executionDate?: string;
  periodText?: string;
  pageInfo?: string;
  branchInfo?: string;
  hideToolbar?: boolean;
  onPrint?: () => void;
  onExportCSV?: () => void;
  onRefresh?: () => void;
  zoomLevel?: number;
  setZoomLevel?: (val: number | ((prev: number) => number)) => void;
  websiteUrl?: string;
  copyrightNotice?: string;
  paperSize?: PaperSize;
  orientation?: 'portrait' | 'landscape';
  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * ============================================================================
 * UNIFIED VANGUARD & OMEGA AUTHENTIC PRINTABLE REPORT SHEET
 * Standard Corporate Reporting Engine across:
 * 1. Sales Control
 * 2. SuperSonic Fleet Management
 * 3. Social Media CRM
 * 4. Operation Center
 * 5. Customer Management & AR
 * 6. Accounting & Finance
 * 7. HR & Payroll
 *
 * Enforces exact identical:
 * - Style & Layout
 * - Topper & Header
 * - Footer & Verification Code
 * - Dual-header and Body Typography (Font-Sans + Monospace Tabular Figures)
 * - Canvas Background (bg-background) & Paper Sheet (bg-white)
 * ============================================================================
 */
export default function UnifiedPrintableReportSheet({
  topperTitle = 'Vanguard ERP',
  subtitle = 'Enterprise Master Ledger & Operations',
  reportTitle,
  reportCode,
  executionDate,
  periodText,
  pageInfo = 'Page 1 of 1',
  branchInfo = 'Branch: Choueifat Main Facility',
  hideToolbar = false,
  onPrint,
  onExportCSV,
  onRefresh,
  zoomLevel = 1,
  setZoomLevel,
  websiteUrl = 'www.vanguarderp.com',
  copyrightNotice = 'Copyright © 2026 Vanguard ERP. All Rights Reserved.',
  paperSize = 'A4',
  orientation: propOrientation,
  onOrientationChange,
  children,
  className = '',
}: UnifiedPrintableReportSheetProps) {
  const { t, dir } = useLanguage();
  const [internalOrientation, setInternalOrientation] = React.useState<'portrait' | 'landscape'>(
    propOrientation || 'portrait'
  );

  const orientation = propOrientation || internalOrientation;

  const handleOrientationChange = (newOrientation: 'portrait' | 'landscape') => {
    setInternalOrientation(newOrientation);
    if (onOrientationChange) {
      onOrientationChange(newOrientation);
    }
  };

  // Format current date if not provided
  const displayDate =
    executionDate ||
    new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div dir={dir} className={`w-full font-sans text-foreground text-left select-none bg-background ${className}`}>
      {/* Dynamic Print Styles for fully fluid print sizing */}
      <style>{`
        @media print {
          @page {
            size: ${orientation === 'landscape' ? 'landscape' : 'auto'};
            margin: ${orientation === 'landscape' ? '8mm 6mm' : '12mm 10mm'};
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

      {/* 1. INTERACTIVE ACTION TOOLBAR (SCREEN ONLY) */}
      {!hideToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border rounded-xl p-3 mb-4 shadow-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">{t('Report Action', 'Report Action')}:</span>
            <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              {reportCode}
            </span>
          </div>

          <div className="flex items-center gap-2">

            {setZoomLevel && (
              <>
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 1.4))}
                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 cursor-pointer transition-colors shadow-2xs"
                  title={t('Zoom In', 'Zoom In')}
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.7))}
                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 cursor-pointer transition-colors shadow-2xs"
                  title={t('Zoom Out', 'Zoom Out')}
                >
                  <ZoomOut size={14} />
                </button>
              </>
            )}

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors border border-slate-200 shadow-2xs"
                title={t('Refresh', 'Refresh')}
              >
                <RefreshCw size={13} />
                <span>{t('Refresh', 'Refresh')}</span>
              </button>
            )}

            {onExportCSV && (
              <button
                type="button"
                onClick={onExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                title={t('Export CSV', 'Export CSV')}
              >
                <Download size={13} />
                <span>{t('Export CSV', 'Export CSV')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
              title={t('Print Report', 'Print Report')}
            >
              <Printer size={13} />
              <span>{t('Print Report', 'Print Report')}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. AUTHENTIC DOCUMENT SHEET (PIXEL-PERFECT A4/FLEXIBLE CONTAINER) */}
      <div
        className={`report-sheet print:block w-full mx-auto bg-white border border-slate-200 rounded-xl shadow-sm min-h-[640px] flex flex-col justify-between transition-all duration-200 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-full ${getPaperSizeClasses(paperSize, orientation)}`}
        style={zoomLevel !== 1 ? { transform: `scale(${zoomLevel})`, transformOrigin: 'top center' } : undefined}
      >
        <div>
          {/* ================================================================= */}
          {/* AUTHENTIC 3-ZONE HEADER ACROSS ALL VANGUARD REPORTS              */}
          {/* ================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-3 pb-2.5 font-sans">
            {/* ZONE 1 (LEFT): Corporate / System Identity Indicator */}
            <div className="text-left flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-800 shrink-0"></span>
                <span className="font-bold text-[14px] text-slate-900 tracking-tight uppercase">
                  {topperTitle ? t(topperTitle, topperTitle) : 'Vanguard ERP'}
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-500 tracking-normal mt-0.5">
                {subtitle ? t(subtitle, subtitle) : t('Corporate Ledger & Analytics', 'Corporate Ledger & Analytics')}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                {t('System Source', 'System Source')}: {t('Vanguard ERP Live Cloud', 'Vanguard ERP Live Cloud')}
              </div>
            </div>

            {/* ZONE 2 (CENTER): Active Report Title & Period Indicator */}
            <div className="text-center flex flex-col items-center justify-center">
              <h1 className="font-black text-[16px] text-slate-950 tracking-tight uppercase">
                {t(reportTitle, reportTitle)}
              </h1>
              <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10.5px] font-semibold font-mono">
                <span>📅</span>
                <span>{periodText ? t(periodText, periodText) : t('Current Active Period', 'Current Active Period')}</span>
              </div>
            </div>

            {/* ZONE 3 (RIGHT): Branch Name, Execution Date & Pagination */}
            <div className="text-right flex flex-col justify-center items-end">
              <div className="text-[12px] font-bold text-slate-900 font-sans">
                {branchInfo ? t(branchInfo, branchInfo) : t('Main Branch - Central Facility', 'Main Branch - Central Facility')}
              </div>
              <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                <span>{t('Date', 'Date')}: </span>
                <span className="font-semibold text-slate-800">{displayDate}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                {pageInfo}
              </div>
            </div>
          </div>

          {/* TOP SOLID DIVIDING RULE */}
          <div className="border-b-2 border-slate-900 mb-3"></div>

          {/* ================================================================= */}
          {/* E. REPORT DATA CONTENT (TABLE / MATRIX)                           */}
          {/* ================================================================= */}
          <div className="w-full mt-1 overflow-x-auto print:overflow-visible">
            {children}
          </div>
        </div>

        {/* =================================================================== */}
        {/* F. AUTHENTIC CORPORATE FOOTER WITH REPORT CODE, COPYRIGHT & LINK    */}
        {/* =================================================================== */}
        <div className="pt-16 mt-8 print:pt-6">
          {/* Bottom Solid Dividing Rule */}
          <div className="border-b-report-master border-b-2 border-report-borderMaster border-slate-900 mb-1.5"></div>

          <div className="flex items-center justify-between text-[10px] text-slate-800 font-sans">
            <span className="font-mono font-bold tracking-wider text-slate-900">{reportCode}</span>
            <span className="text-slate-700 font-medium text-center flex-1">
              {t(copyrightNotice, copyrightNotice)}
            </span>
            <div className="text-right">
              <a
                href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:underline font-mono text-[10px] cursor-pointer"
              >
                &quot;{websiteUrl}&quot;
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { UnifiedPrintableReportSheet };
export { default as GlobalReportTemplate } from './GlobalReportTemplate';
export { MasterReportDocument } from './MasterReportDocument';
export * from '@/types/reports';

