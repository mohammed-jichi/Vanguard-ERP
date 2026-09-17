/**
 * ============================================================================
 * VANGUARD ERP - REPORT SHEET DESIGN TOKENS
 * Extracted from the Canonical Omega & Accounting Printable Report Engine
 * ============================================================================
 * 
 * Provides:
 * 1. REPORT_TYPOGRAPHY_TOKENS: Computed font-families, font-sizes, font-weights, line-heights.
 * 2. REPORT_COLOR_PALETTE: Canonical HEX, RGB, and RGBA palettes for financial ledgers.
 * 3. REPORT_BORDER_TOKENS: Precision line thicknesses, colors, and border styles.
 * 4. REPORT_CSS_VARIABLES: Standard CSS custom property dictionary (:root variables).
 * 5. REPORT_TAILWIND_EXTENSION: Drop-in extension for tailwind.config.js.
 * 6. ReportMetadata, ReportColumn, ReportSection, GrandTotal interfaces.
 */

import React from 'react';

export interface ReportMetadata {
  companyName: string;
  subtitle?: string;
  reportTitle: string;
  code: string;
  dateRange: string;
  generatedDate: string;
  branch: string;
  systemSource: string;
  pageNumber?: number;
  totalPages?: number;
}

export interface ReportColumn<T = any> {
  key: keyof T | string;
  label: string;
  align?: 'left' | 'center' | 'right';
  isMonospace?: boolean;
  width?: string;
  render?: (row: T) => React.ReactNode;
}

export interface ReportSection<T = any> {
  title: string;
  type?: 'revenue' | 'cogs' | 'neutral';
  rows: T[];
  subtotal?: {
    label: string;
    value: number | string;
    isNegative?: boolean;
  };
}

export interface GrandTotal {
  label: string;
  value: number | string;
  isNegative?: boolean;
}

// ============================================================================
// 1. TYPOGRAPHY TOKENS
// ============================================================================

export const REPORT_TYPOGRAPHY_TOKENS = {
  fontFamilies: {
    heading: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    tableCell: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    numeric: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  elements: {
    companyTitle: {
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '15px',
      fontSizeRem: '0.9375rem',
      fontWeight: '700',
      fontWeightName: 'bold',
      lineHeight: '1.25',
      lineHeightPx: '20px',
      letterSpacing: '0.025em',
      textTransform: 'uppercase' as const,
    },
    companySubtitle: {
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '11px',
      fontSizeRem: '0.6875rem',
      fontWeight: '600',
      fontWeightName: 'semibold',
      lineHeight: '1.36',
      lineHeightPx: '15px',
      letterSpacing: 'normal',
      textTransform: 'none' as const,
    },
    reportTitle: {
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '13.5px',
      fontSizeRem: '0.84375rem',
      fontWeight: '700',
      fontWeightName: 'bold',
      lineHeight: '1.33',
      lineHeightPx: '18px',
      letterSpacing: 'normal',
      textTransform: 'none' as const,
    },
    metadataSubheader: {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: '11px',
      fontSizeRem: '0.6875rem',
      fontWeight: '500',
      fontWeightBold: '700',
      lineHeight: '1.45',
      lineHeightPx: '16px',
      letterSpacing: 'normal',
      textTransform: 'none' as const,
    },
    columnHeader: {
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '11px',
      fontSizeRem: '0.6875rem',
      fontWeight: '700',
      fontWeightName: 'bold',
      lineHeight: '1.25',
      lineHeightPx: '14px',
      letterSpacing: 'normal',
      textTransform: 'none' as const,
    },
    sectionSuperHeader: {
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '11px',
      fontSizeRem: '0.6875rem',
      fontWeight: '700',
      fontWeightName: 'bold',
      lineHeight: '1.36',
      lineHeightPx: '15px',
      letterSpacing: '0.015em',
      textTransform: 'uppercase' as const,
    },
    dataRowLabel: {
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '10.5px',
      fontSizeRem: '0.65625rem',
      fontWeight: '700',
      fontWeightNormal: '500',
      lineHeight: '1.43',
      lineHeightPx: '15px',
      letterSpacing: 'normal',
      textTransform: 'none' as const,
    },
    numericValue: {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: '10.5px',
      fontSizeRem: '0.65625rem',
      fontWeight: '700',
      fontWeightNormal: '500',
      lineHeight: '1.43',
      lineHeightPx: '15px',
      letterSpacing: 'normal',
      fontVariantNumeric: 'tabular-nums',
      textAlign: 'right' as const,
    },
    intermediateTotal: {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: '11px',
      fontSizeRem: '0.6875rem',
      fontWeight: '700',
      fontWeightHeavy: '900',
      lineHeight: '1.36',
      lineHeightPx: '15px',
      fontVariantNumeric: 'tabular-nums',
      textAlign: 'right' as const,
    },
    totalsSummaryRow: {
      label: {
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '12px',
        fontSizeRem: '0.75rem',
        fontWeight: '700',
        fontWeightName: 'bold',
        lineHeight: '1.33',
        lineHeightPx: '16px',
        textTransform: 'uppercase' as const,
      },
      value: {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: '13px',
        fontSizeRem: '0.8125rem',
        fontWeight: '900',
        fontWeightName: 'black',
        lineHeight: '1.31',
        lineHeightPx: '17px',
        fontVariantNumeric: 'tabular-nums',
        textAlign: 'right' as const,
      },
    },
    footerMetadata: {
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      codeFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: '10px',
      fontSizeRem: '0.625rem',
      fontWeight: '500',
      codeFontWeight: '700',
      lineHeight: '1.4',
      lineHeightPx: '14px',
    },
  },
} as const;

// ============================================================================
// 2. COLOR PALETTE (HEX, RGB & RGBA)
// ============================================================================

export const REPORT_COLOR_PALETTE = {
  // Brand & Corporate Header
  companyTitle: {
    hex: '#1d4ed8',
    rgb: 'rgb(29, 78, 216)',
    description: 'Authentic Blue-700 corporate enterprise title',
  },
  companySubtitle: {
    hex: '#475569',
    rgb: 'rgb(71, 85, 105)',
    description: 'Slate-600 commercial legal subtitle',
  },
  reportTitle: {
    hex: '#0f172a',
    rgb: 'rgb(15, 23, 42)',
    description: 'Slate-900 high-contrast primary report heading',
  },

  // Section Super-Headers
  sectionHeaders: {
    revenue: {
      hex: '#1a629b',
      rgb: 'rgb(26, 98, 155)',
      description: 'Corporate steel blue for operating revenue sections',
    },
    cogsExpense: {
      hex: '#7a1c1c',
      rgb: 'rgb(122, 28, 28)',
      description: 'Deep burgundy / brick red for COGS & direct expense sections',
    },
    opexAdmin: {
      hex: '#1e293b',
      rgb: 'rgb(30, 41, 59)',
      description: 'Slate-800 for OPEX and administrative overhead sections',
    },
    equityReserves: {
      hex: '#065f46',
      rgb: 'rgb(6, 95, 70)',
      description: 'Emerald-800 for capital, reserves, and shareholders equity',
    },
    background: {
      hex: '#f1f5f9',
      rgba: 'rgba(241, 245, 249, 0.70)',
      description: 'Soft slate-100 pill background at 70% opacity',
    },
  },

  // Financial Value Accents
  values: {
    negativeDeduction: {
      primary: {
        hex: '#be123c',
        rgb: 'rgb(190, 18, 60)',
        description: 'Rose-700 for line item expenses and deductions ($X,XXX.XX)',
      },
      heavyTotal: {
        hex: '#9f1239',
        rgb: 'rgb(159, 18, 57)',
        description: 'Rose-800 for consolidated COGS and cumulative deduction totals',
      },
    },
    positiveRevenue: {
      primary: {
        hex: '#065f46',
        rgb: 'rgb(6, 95, 70)',
        description: 'Emerald-800 for credit postings, inflows, and profitable balances',
      },
      heavyTotal: {
        hex: '#064e3b',
        rgb: 'rgb(6, 78, 59)',
        description: 'Emerald-900 for gross operating revenue and peak net profit',
      },
    },
    balancedTotal: {
      hex: '#1e3a8a',
      rgb: 'rgb(30, 58, 138)',
      description: 'Blue-900 for balanced debit=credit and net enterprise equity totals',
    },
    neutralLabel: {
      hex: '#1e293b',
      rgb: 'rgb(30, 41, 59)',
      description: 'Slate-800 for standard account names and description lines',
    },
    neutralValue: {
      hex: '#334155',
      rgb: 'rgb(51, 65, 85)',
      description: 'Slate-700 for standard debit/credit intermediate numbers',
    },
    nullPlaceholder: {
      hex: '#94a3b8',
      rgb: 'rgb(148, 163, 184)',
      description: 'Slate-400 for empty or unposted dash markers (-)',
    },
    accountCode: {
      hex: '#64748b',
      rgb: 'rgb(100, 116, 139)',
      description: 'Slate-500 for chart-of-accounts master reference codes',
    },
  },

  // Surfaces & Backgrounds
  surfaces: {
    canvasBg: {
      hex: '#f4f6f9',
      rgb: 'rgb(244, 246, 249)',
      description: 'Outer workplace canvas backdrop behind paper document sheet',
    },
    sheetBg: {
      hex: '#ffffff',
      rgb: 'rgb(255, 255, 255)',
      description: 'Pure white A4/A3/POS paper sheet document surface',
    },
    columnHeaderBg: {
      hex: '#f8fafc',
      rgb: 'rgb(248, 250, 252)',
      description: 'Slate-50 subtle tint for column header row',
    },
    totalsRowBg: {
      hex: '#f1f5f9',
      rgb: 'rgb(241, 245, 249)',
      description: 'Slate-100 weighted tint for grand totals footer rows',
    },
    highlightRowBg: {
      rgba: 'rgba(239, 246, 255, 0.80)',
      description: 'Blue-50 at 80% opacity for gross margin and key intermediate benchmarks',
    },
  },

  // Border & Rule Lines
  borders: {
    dividingMasterRule: {
      hex: '#0f172a',
      rgb: 'rgb(15, 23, 42)',
      thickness: '2px',
      style: 'solid',
      description: 'Double master rule under corporate topper and above footer',
    },
    columnHeaderBottom: {
      hex: '#0f172a',
      rgb: 'rgb(15, 23, 42)',
      thickness: '2px',
      style: 'solid',
      description: 'High-contrast line under table column labels',
    },
    totalsTopBorder: {
      hex: '#0f172a',
      rgb: 'rgb(15, 23, 42)',
      thickness: '2px',
      style: 'solid',
      description: 'Bold double rule before final ledger totals and summary row',
    },
    intermediateBorder: {
      hex: '#cbd5e1',
      rgb: 'rgb(203, 213, 225)',
      thickness: '1px',
      style: 'solid',
      description: 'Slate-300 divider above category subtotal lines',
    },
    subtotalThickBorder: {
      hex: '#94a3b8',
      rgb: 'rgb(148, 163, 184)',
      thickness: '1px',
      style: 'solid',
      description: 'Slate-400 weighted divider above major group total lines',
    },
    rowSeparator: {
      hex: '#f1f5f9',
      rgb: 'rgb(241, 245, 249)',
      thickness: '1px',
      style: 'solid',
      description: 'Slate-100 hairline divider between individual data rows',
    },
    sheetBorder: {
      hex: '#e2e8f0',
      rgb: 'rgb(226, 232, 240)',
      thickness: '1px',
      style: 'solid',
      description: 'Slate-200 boundary border around printable sheet canvas',
    },
  },
} as const;

// ============================================================================
// 3. CSS VARIABLES DICTIONARY
// ============================================================================

export const REPORT_CSS_VARIABLES: Record<string, string> = {
  // Typography
  '--report-font-heading': REPORT_TYPOGRAPHY_TOKENS.fontFamilies.heading,
  '--report-font-table': REPORT_TYPOGRAPHY_TOKENS.fontFamilies.tableCell,
  '--report-font-numeric': REPORT_TYPOGRAPHY_TOKENS.fontFamilies.numeric,

  '--report-title-size': REPORT_TYPOGRAPHY_TOKENS.elements.companyTitle.fontSize,
  '--report-title-weight': REPORT_TYPOGRAPHY_TOKENS.elements.companyTitle.fontWeight,
  '--report-title-line-height': REPORT_TYPOGRAPHY_TOKENS.elements.companyTitle.lineHeight,

  '--report-heading-size': REPORT_TYPOGRAPHY_TOKENS.elements.reportTitle.fontSize,
  '--report-heading-weight': REPORT_TYPOGRAPHY_TOKENS.elements.reportTitle.fontWeight,
  '--report-heading-line-height': REPORT_TYPOGRAPHY_TOKENS.elements.reportTitle.lineHeight,

  '--report-superheader-size': REPORT_TYPOGRAPHY_TOKENS.elements.sectionSuperHeader.fontSize,
  '--report-superheader-weight': REPORT_TYPOGRAPHY_TOKENS.elements.sectionSuperHeader.fontWeight,
  '--report-superheader-line-height': REPORT_TYPOGRAPHY_TOKENS.elements.sectionSuperHeader.lineHeight,

  '--report-cell-size': REPORT_TYPOGRAPHY_TOKENS.elements.dataRowLabel.fontSize,
  '--report-cell-weight': REPORT_TYPOGRAPHY_TOKENS.elements.dataRowLabel.fontWeight,
  '--report-cell-line-height': REPORT_TYPOGRAPHY_TOKENS.elements.dataRowLabel.lineHeight,

  '--report-numeric-size': REPORT_TYPOGRAPHY_TOKENS.elements.numericValue.fontSize,
  '--report-numeric-weight': REPORT_TYPOGRAPHY_TOKENS.elements.numericValue.fontWeight,
  '--report-numeric-line-height': REPORT_TYPOGRAPHY_TOKENS.elements.numericValue.lineHeight,

  '--report-total-label-size': REPORT_TYPOGRAPHY_TOKENS.elements.totalsSummaryRow.label.fontSize,
  '--report-total-label-weight': REPORT_TYPOGRAPHY_TOKENS.elements.totalsSummaryRow.label.fontWeight,
  '--report-total-val-size': REPORT_TYPOGRAPHY_TOKENS.elements.totalsSummaryRow.value.fontSize,
  '--report-total-val-weight': REPORT_TYPOGRAPHY_TOKENS.elements.totalsSummaryRow.value.fontWeight,

  // Colors
  '--report-color-company-title': REPORT_COLOR_PALETTE.companyTitle.hex,
  '--report-color-company-subtitle': REPORT_COLOR_PALETTE.companySubtitle.hex,
  '--report-color-report-title': REPORT_COLOR_PALETTE.reportTitle.hex,

  '--report-color-section-revenue': REPORT_COLOR_PALETTE.sectionHeaders.revenue.hex,
  '--report-color-section-cogs': REPORT_COLOR_PALETTE.sectionHeaders.cogsExpense.hex,
  '--report-color-section-opex': REPORT_COLOR_PALETTE.sectionHeaders.opexAdmin.hex,
  '--report-color-section-equity': REPORT_COLOR_PALETTE.sectionHeaders.equityReserves.hex,
  '--report-bg-section-header': REPORT_COLOR_PALETTE.sectionHeaders.background.rgba,

  '--report-color-negative': REPORT_COLOR_PALETTE.values.negativeDeduction.primary.hex,
  '--report-color-negative-total': REPORT_COLOR_PALETTE.values.negativeDeduction.heavyTotal.hex,
  '--report-color-positive': REPORT_COLOR_PALETTE.values.positiveRevenue.primary.hex,
  '--report-color-positive-total': REPORT_COLOR_PALETTE.values.positiveRevenue.heavyTotal.hex,
  '--report-color-balanced-total': REPORT_COLOR_PALETTE.values.balancedTotal.hex,

  '--report-color-neutral-label': REPORT_COLOR_PALETTE.values.neutralLabel.hex,
  '--report-color-neutral-value': REPORT_COLOR_PALETTE.values.neutralValue.hex,
  '--report-color-null-marker': REPORT_COLOR_PALETTE.values.nullPlaceholder.hex,
  '--report-color-account-code': REPORT_COLOR_PALETTE.values.accountCode.hex,

  // Surfaces
  '--report-bg-canvas': REPORT_COLOR_PALETTE.surfaces.canvasBg.hex,
  '--report-bg-sheet': REPORT_COLOR_PALETTE.surfaces.sheetBg.hex,
  '--report-bg-col-header': REPORT_COLOR_PALETTE.surfaces.columnHeaderBg.hex,
  '--report-bg-totals': REPORT_COLOR_PALETTE.surfaces.totalsRowBg.hex,
  '--report-bg-highlight': REPORT_COLOR_PALETTE.surfaces.highlightRowBg.rgba,

  // Borders
  '--report-border-master-color': REPORT_COLOR_PALETTE.borders.dividingMasterRule.hex,
  '--report-border-master-width': REPORT_COLOR_PALETTE.borders.dividingMasterRule.thickness,
  '--report-border-col-header': `${REPORT_COLOR_PALETTE.borders.columnHeaderBottom.thickness} solid ${REPORT_COLOR_PALETTE.borders.columnHeaderBottom.hex}`,
  '--report-border-totals': `${REPORT_COLOR_PALETTE.borders.totalsTopBorder.thickness} solid ${REPORT_COLOR_PALETTE.borders.totalsTopBorder.hex}`,
  '--report-border-intermediate': `${REPORT_COLOR_PALETTE.borders.intermediateBorder.thickness} solid ${REPORT_COLOR_PALETTE.borders.intermediateBorder.hex}`,
  '--report-border-separator': `${REPORT_COLOR_PALETTE.borders.rowSeparator.thickness} solid ${REPORT_COLOR_PALETTE.borders.rowSeparator.hex}`,
  '--report-border-sheet': `${REPORT_COLOR_PALETTE.borders.sheetBorder.thickness} solid ${REPORT_COLOR_PALETTE.borders.sheetBorder.hex}`,
};

// ============================================================================
// 4. TAILWIND CONFIG THEME EXTENSION (CANONICAL ENGINE TOKENS)
// ============================================================================

export const REPORT_TAILWIND_EXTENSION = {
  colors: {
    report: {
      company: 'var(--report-color-company-title, #1d4ed8)',
      title: 'var(--report-color-report-title, #0f172a)',
      sectionRevenue: 'var(--report-color-section-revenue, #1a629b)',
      sectionCogs: 'var(--report-color-section-cogs, #7a1c1c)',
      negative: 'var(--report-color-negative, #be123c)',
      negativeTotal: 'var(--report-color-negative-total, #9f1239)',
      positive: 'var(--report-color-positive, #065f46)',
      borderMaster: 'var(--report-border-master-color, #0f172a)',
    },
  },
  fontSize: {
    'report-company': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '700' }],
    'report-title': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '800' }],
    'report-meta': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
    'report-header': ['0.75rem', { lineHeight: '1rem', fontWeight: '700' }],
    'report-cell': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
    'report-total': ['0.8125rem', { lineHeight: '1.125rem', fontWeight: '700' }],
  },
  borderWidth: {
    'report-master': 'var(--report-border-master-width, 2px)',
  },
};

export default {
  typography: REPORT_TYPOGRAPHY_TOKENS,
  palette: REPORT_COLOR_PALETTE,
  cssVariables: REPORT_CSS_VARIABLES,
  tailwind: REPORT_TAILWIND_EXTENSION,
};

