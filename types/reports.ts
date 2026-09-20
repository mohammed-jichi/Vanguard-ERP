import React from 'react';

/**
 * ============================================================================
 * VANGUARD ERP - REPORT TYPES & DATA CONTRACTS
 * Core interfaces for the Master Report Document Engine
 * ============================================================================
 */

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
  filterSummary?: string;
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
  breakdownText?: string;
  convertedSubtext?: string;
  multiCurrencyTotals?: Record<string, number>;
  normalizedAmount?: number;
  targetCurrency?: string;
}

export type PaperSize = 'A4' | 'A3' | 'A5' | 'POS' | 'Barcode' | 'Auto';

/**
 * ============================================================================
 * UNIVERSAL REPORT SCHEMA & DYNAMIC TABLE CONTRACTS
 * ============================================================================
 */
export type ColumnFormatType =
  | 'text'
  | 'badge'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'date'
  | 'datetime'
  | 'time'
  | 'code'
  | 'delta'
  | 'status';

export interface ReportColumnDefinition<T = any> {
  key: string;
  headerLabel: string;
  align?: 'left' | 'center' | 'right';
  formatType?: ColumnFormatType;
  width?: string;
  isMonospace?: boolean;
  render?: (value: any, row: T, activeCurrency?: string) => React.ReactNode;
}

export interface ReportGroupingDefinition {
  groupByKey: string;
  groupHeaderLabel?: (groupValue: string, rows: any[]) => string;
  subtotalKeys?: string[];
  subtotalLabels?: Record<string, string>;
}

export interface ReportKpiSummaryDefinition {
  label: string;
  type: 'count' | 'sum' | 'average' | 'delta' | 'custom';
  targetKey?: string;
  formatType?: ColumnFormatType;
  calculate?: (rows: any[], activeCurrency?: string) => { value: string | number; subtext?: string };
}

export type ReportDomain =
  | 'sales'
  | 'inventory'
  | 'audit'
  | 'internal_control'
  | 'accounting'
  | 'hr'
  | 'fleet'
  | 'crm'
  | 'general';

export interface ReportSchemaDefinition<T = any> {
  id: string; // Report code, e.g., 'REP_S_00190'
  reportKey: string; // Canonical name, e.g., 'No Sale'
  title: string;
  domain: ReportDomain;
  description?: string;
  columns: ReportColumnDefinition<T>[];
  grouping?: ReportGroupingDefinition;
  kpiSummary?: ReportKpiSummaryDefinition[];
  sampleRowsGenerator?: (filters?: Record<string, any>) => T[];
  defaultPaperSize?: PaperSize;
  defaultOrientation?: 'portrait' | 'landscape' | 'auto';
}
