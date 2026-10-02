'use client';

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Printer, Download, ZoomIn, ZoomOut, RefreshCw, RotateCcw } from 'lucide-react';

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

/**
 * Normalizes and sanitizes branch/facility names:
 * Purges duplicate "Branch: Branch:" and legacy distortions
 */
export function sanitizeFacilityName(branch?: string): string {
  if (!branch) return 'Facility: Southern Olive and Oil Products - Main';
  let cleaned = branch
    .replace(/^Branch:\s*/gi, '')
    .replace(/^Branch:\s*/gi, '')
    .replace(/^Facility:\s*/gi, '')
    .trim();

  // Purge legacy distortions
  cleaned = cleaned.replace(/\s*\(\s*Zeit w zaytoun ljanoub\s*\)/gi, '');
  cleaned = cleaned.replace(/Zeit w zaytoun ljanoub/gi, 'Southern Olive and Oil Products - Main');
  cleaned = cleaned.replace(/\s*\(\s*Choueifat Main Facility\s*\)/gi, '');
  cleaned = cleaned.replace(/Choueifat Main Plant/gi, 'Southern Olive and Oil Products - Main');
  cleaned = cleaned.replace(/Choueifat Main Facility/gi, 'Southern Olive and Oil Products - Main');

  if (!cleaned || cleaned.toLowerCase() === 'main branch' || cleaned.toLowerCase() === 'all' || cleaned.toLowerCase() === 'all branches') {
    cleaned = 'Southern Olive and Oil Products - Main';
  }

  return `Facility: ${cleaned}`;
}

export interface StandardReportHeaderProps {
  companyName?: string;
  hqAddress?: string;
  companyWebsite?: string;
  hqPhone?: string;
  printDate?: string;
  reportTitle: string;
  periodText?: string;
  facilityName?: string;
  facilityAddress?: string;
  facilityDirect?: string;
  pageInfo?: string;
  className?: string;
}

/**
 * Standardized 3-Zone Corporate Report Header
 * +---------------------------------------------------------------------------------------------------------+
 * | [LEFT ZONE - Head Office]            |           [CENTER ZONE]          | [RIGHT ZONE - Active Facility] |
 * | Southern Olive Oil S.A.R.L.          |     TRANSACTIONS BY DATE         | Facility: Choueifat Main Plant |
 * | Choueifat Central Highway, Lebanon   |   Period: 2026-10-01 - 2026-10-31| Industrial Zone, Old Saida Rd  |
 * | www.southernolive-lb.com             |                                  | Dispatch / Cell: +961 70 000000|
 * | Tel / Support: +961 05 430 000       |                                  | Page 1 of 1                    |
 * | Print Date: 01-Oct-2026              |                                  |                                |
 * +---------------------------------------------------------------------------------------------------------+
 */
export function StandardReportHeader({
  companyName = 'Southern Olive Oil S.A.R.L.',
  hqAddress = 'Choueifat Central Highway, Lebanon',
  companyWebsite = 'www.southernolive-lb.com',
  hqPhone = 'Tel / Support: +961 05 430 000',
  printDate,
  reportTitle,
  periodText,
  facilityName,
  facilityAddress = 'Industrial Zone, Old Saida Rd',
  facilityDirect = 'Dispatch / Cell: +961 70 000000',
  pageInfo = 'Page 1 of 1',
  className = '',
}: StandardReportHeaderProps) {
  const { t } = useLanguage();

  const rawDate = printDate || new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const displayDate = rawDate.startsWith('Print Date:') || rawDate.startsWith('Date:')
    ? rawDate
    : `Print Date: ${rawDate}`;

  let cleanPeriod = periodText;
  if (!cleanPeriod) {
    cleanPeriod = 'Period: 2026-10-01 - 2026-10-31';
  } else if (!cleanPeriod.startsWith('Period:')) {
    cleanPeriod = `Period: ${cleanPeriod.replace(/^(From\s*Date:?|Date:?)\s*/i, '')}`;
  }

  const cleanFacility = sanitizeFacilityName(facilityName);

  return (
    <div className={`w-full pb-3 mb-3 border-b-2 border-slate-900 font-sans text-slate-800 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* [LEFT ZONE - Head Office] */}
        <div className="text-left flex flex-col justify-start text-[11px] leading-tight space-y-0.5">
          <div className="font-bold text-[13.5px] text-slate-950 tracking-tight">
            {t(companyName, companyName)}
          </div>
          <div className="text-slate-600 font-medium">
            {t(hqAddress, hqAddress)}
          </div>
          <div>
            <a
              href={companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:underline font-mono text-[10.5px]"
            >
              {companyWebsite}
            </a>
          </div>
          <div className="text-slate-600 font-mono text-[10.5px]">
            {hqPhone}
          </div>
          <div className="text-slate-500 font-mono text-[10px] pt-0.5">
            {displayDate}
          </div>
        </div>

        {/* [CENTER ZONE - Dynamic Report Title & Period] */}
        <div className="text-center flex flex-col items-center justify-center pt-0.5">
          <h1 className="font-black text-[16px] sm:text-[18px] text-slate-950 tracking-tight uppercase leading-snug">
            {t(reportTitle, reportTitle)}
          </h1>
          <div className="mt-1 text-[11.5px] font-semibold text-slate-700 font-mono">
            {cleanPeriod}
          </div>
        </div>

        {/* [RIGHT ZONE - Active Facility & Pagination] */}
        <div className="text-right flex flex-col justify-start items-end text-[11px] leading-tight space-y-0.5">
          <div className="font-bold text-[13px] text-slate-900">
            {t(cleanFacility, cleanFacility)}
          </div>
          <div className="text-slate-600 font-medium">
            {t(facilityAddress, facilityAddress)}
          </div>
          <div className="text-slate-600 font-mono text-[10.5px]">
            {facilityDirect}
          </div>
          <div className="text-slate-500 font-mono text-[10px] pt-1">
            {pageInfo}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface StandardReportFooterProps {
  reportCode?: string;
  copyrightNotice?: string;
  websiteUrl?: string;
  className?: string;
}

/**
 * Standardized Corporate Printable Footer
 * Enforces clean, single-line border-separated footer at bottom edge:
 * - Left: Active Report Reference Code (e.g. Report Ref: REP_S_00247)
 * - Center: Copyright Notice: Copyright © 2026 Vanguard ERP. All Rights Reserved.
 * - Right: System Website URL: www.vanguard-erp.net
 */
export function StandardReportFooter({
  reportCode = 'REP_S_00247',
  copyrightNotice = 'Copyright © 2026 Vanguard ERP. All Rights Reserved.',
  websiteUrl = 'www.vanguard-erp.net',
  className = '',
}: StandardReportFooterProps) {
  const { t } = useLanguage();

  const formattedCode = reportCode
    ? (reportCode.startsWith('Report Ref:') ? reportCode : `Report Ref: ${reportCode}`)
    : 'Report Ref: REP_S_00247';

  const cleanUrl = websiteUrl.replace(/^https?:\/\//i, '');

  return (
    <div className={`mt-8 pt-3 border-t border-slate-300 flex items-center justify-between text-[10px] font-sans text-slate-700 print:mt-4 ${className}`}>
      <span className="font-mono font-bold tracking-wider text-slate-900">
        {formattedCode}
      </span>
      <span className="text-slate-600 font-medium text-center flex-1 px-4">
        {t(copyrightNotice, copyrightNotice)}
      </span>
      <div className="text-right">
        <a
          href={`https://${cleanUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 hover:underline font-mono text-[10px]"
        >
          {cleanUrl}
        </a>
      </div>
    </div>
  );
}

export interface UnifiedPrintableReportSheetProps {
  topperTitle?: string;
  subtitle?: string;
  companyName?: string;
  hqAddress?: string;
  companyWebsite?: string;
  hqPhone?: string;
  facilityAddress?: string;
  facilityDirect?: string;
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

export default function UnifiedPrintableReportSheet({
  companyName = 'Southern Olive Oil S.A.R.L.',
  hqAddress = 'Choueifat Central Highway, Lebanon',
  companyWebsite = 'www.southernolive-lb.com',
  hqPhone = 'Tel / Support: +961 05 430 000',
  facilityAddress = 'Industrial Zone, Old Saida Rd',
  facilityDirect = 'Dispatch / Cell: +961 70 000000',
  reportTitle,
  reportCode,
  executionDate,
  periodText,
  pageInfo = 'Page 1 of 1',
  branchInfo = 'Facility: Choueifat Main Plant',
  hideToolbar = false,
  onPrint,
  onExportCSV,
  onRefresh,
  zoomLevel = 1,
  setZoomLevel,
  websiteUrl = 'www.vanguard-erp.net',
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
  const [isForcedOrientation, setIsForcedOrientation] = React.useState<boolean>(
    Boolean(propOrientation)
  );

  const orientation = propOrientation || internalOrientation;

  const handleOrientationChange = (newOrientation: 'portrait' | 'landscape') => {
    setInternalOrientation(newOrientation);
    setIsForcedOrientation(true);
    if (onOrientationChange) {
      onOrientationChange(newOrientation);
    }
  };

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
      {/* Dynamic Print Styles for fully fluid print sizing & browser layout orientation option */}
      <style>{`
        @media print {
          @page {
            size: ${isForcedOrientation ? orientation : 'auto'};
            margin: 8mm;
          }
          html, body {
            width: 100% !important;
            height: auto !important;
          }
          .report-sheet, .printable-sheet {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }

          /* Prevent table from expanding wider than the sheet */
          table {
            width: 100% !important;
            max-width: 100% !important;
            table-layout: auto !important; /* or fixed where appropriate */
          }

          /* Auto-scale padding & typography for dense multi-column reports */
          th, td {
            padding: 4px 3px !important;
            font-size: 8.5pt !important;
            line-height: 1.15 !important;
            word-break: break-word;
          }

          /* Prevent numeric/date/code fields from wrapping awkwardly */
          .numeric-cell, .nowrap-cell {
            white-space: nowrap !important;
          }

          /* Container constraints */
          .printable-sheet, .report-table-container {
            width: 100% !important;
            max-width: 100% !important;
            overflow: visible !important;
          }
        }
      `}</style>

      {/* 1. INTERACTIVE ACTION TOOLBAR (SCREEN ONLY) */}
      {!hideToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border rounded-xl p-3 mb-4 shadow-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">{t('Report Action', 'Report Action')}:</span>
            <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              {reportCode || 'REP_S_00247'}
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

            {/* In-App Orientation Toggle (Portrait / Landscape) */}
            <button
              type="button"
              onClick={() => handleOrientationChange(orientation === 'landscape' ? 'portrait' : 'landscape')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors border border-slate-200 shadow-2xs"
              title={t('Toggle Orientation', `Orientation: ${orientation === 'landscape' ? 'Landscape' : 'Portrait'}`)}
            >
              <RotateCcw size={13} />
              <span className="capitalize">{orientation === 'landscape' ? t('Landscape', 'Landscape') : t('Portrait', 'Portrait')}</span>
            </button>

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
        className={`report-sheet printable-sheet print:block w-full mx-auto bg-white border border-slate-200 rounded-xl shadow-sm min-h-[640px] flex flex-col justify-between transition-all duration-200 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-full ${getPaperSizeClasses(paperSize, orientation)}`}
        style={zoomLevel !== 1 ? { transform: `scale(${zoomLevel})`, transformOrigin: 'top center' } : undefined}
      >
        <div>
          {/* ================================================================= */}
          {/* AUTHENTIC 3-ZONE HEADER ACROSS ALL VANGUARD REPORTS              */}
          {/* ================================================================= */}
          <StandardReportHeader
            companyName={companyName}
            hqAddress={hqAddress}
            companyWebsite={companyWebsite}
            hqPhone={hqPhone}
            printDate={displayDate}
            reportTitle={reportTitle}
            periodText={periodText}
            facilityName={branchInfo}
            facilityAddress={facilityAddress}
            facilityDirect={facilityDirect}
            pageInfo={pageInfo}
          />

          {/* ================================================================= */}
          {/* REPORT DATA CONTENT (TABLE / MATRIX)                             */}
          {/* ================================================================= */}
          <div className="report-table-container w-full mt-1 overflow-x-auto print:overflow-visible">
            {children}
          </div>
        </div>

        {/* =================================================================== */}
        {/* STANDARDIZED CORPORATE FOOTER                                      */}
        {/* =================================================================== */}
        <StandardReportFooter
          reportCode={reportCode}
          copyrightNotice={copyrightNotice}
          websiteUrl={websiteUrl}
        />
      </div>
    </div>
  );
}

export { UnifiedPrintableReportSheet };
export { default as GlobalReportTemplate } from './GlobalReportTemplate';
export { MasterReportDocument } from './MasterReportDocument';
export { Corporate3ZoneHeader, CorporatePrintableFooter } from '@/components/documents/Corporate3ZoneHeader';
export type { Corporate3ZoneHeaderProps, CorporatePrintableFooterProps } from '@/components/documents/Corporate3ZoneHeader';
export * from '@/types/reports';

