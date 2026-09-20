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

export * from '@/types/reports';
