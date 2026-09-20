'use client';

import React, { useMemo, useState } from 'react';
import MasterReportDocument from '@/components/reports/MasterReportDocument';
import { ReportMetadata, ReportColumn, ReportSection, GrandTotal } from '@/types/reports';
import { resolveActiveCurrencyFromFilters } from '@/lib/reportFilterEngine';
import { convertCurrency, formatCurrencyAmount } from '@/lib/currencyEngine';
import { parseDateToIso } from '@/lib/duplicateInvoicesQueryEngine';
import { CheckCircle2, AlertCircle, Hash, DollarSign, Layers, Printer, FileDown, ArrowUpDown } from 'lucide-react';

/**
 * ============================================================================
 * METER AUDIT REGISTER DATA CONTRACT (REP_S_00189)
 * ============================================================================
 */
export interface MeterAuditRecord {
  id: string;
  terminal: string; // e.g., 'POS-01'
  terminalName: string; // e.g., 'Front Register'
  shiftBatch: string; // 'SHIFT_1' | 'SHIFT_2' | 'SHIFT_3' | 'Z_FINAL' | 'X_READING'
  shiftBatchLabel: string; // 'Shift 1 (#101)' | 'Z-Final (#Z-9042)'
  date: string; // '2026-09-06'
  dateFormatted: string; // '06-Sep-2026'
  meterCode: string; // 'MTR_INV_COUNT' | 'MTR_DRAWER_POPS' | 'MTR_VOIDS' | 'MTR_REFUNDS' | 'MTR_CUMULATIVE_SALES' | ...
  meterDescription: string; // Display description
  meterCategory: 'transaction' | 'security' | 'financial' | 'tax';
  startReading: number; // Opening reading
  endReading: number; // Closing reading
  delta: number; // endReading - startReading
  isCurrency: boolean; // Whether start/end are currency values
  amountValue?: number; // Associated financial value in USD where applicable
  currency?: string;
  branch: string;
  notes?: string;
}

export interface MeterReportTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  branch?: string;
  fromDate?: string;
  toDate?: string;
  filterValues?: Record<string, any>;
  reportTitle?: string;
  code?: string;
}

/**
 * Realistic Mock Meter Audit Dataset across Terminals, Shifts, and Branches
 */
const MOCK_METER_RECORDS: MeterAuditRecord[] = [
  // ==========================================
  // POS-01 (Front Register) - Main Branch
  // ==========================================
  // Shift 1: Morning Opening (#101)
  {
    id: 'MTR-01-01',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#101)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_INV_COUNT',
    meterDescription: 'Invoices Issued',
    meterCategory: 'transaction',
    startReading: 104210,
    endReading: 104268,
    delta: 58,
    isCurrency: false,
    amountValue: 4850.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Morning shift continuous invoice roll',
  },
  {
    id: 'MTR-01-02',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#101)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_DRAWER_POPS',
    meterDescription: 'Drawer Pops / No-Sale',
    meterCategory: 'security',
    startReading: 1412,
    endReading: 1419,
    delta: 7,
    isCurrency: false,
    amountValue: undefined,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Change making & cash float audit verification',
  },
  {
    id: 'MTR-01-03',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#101)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_VOIDS',
    meterDescription: 'Voids Count (Line & Bill Voids)',
    meterCategory: 'security',
    startReading: 382,
    endReading: 386,
    delta: 4,
    isCurrency: false,
    amountValue: 128.50,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Authorized line cancellation audit log',
  },
  {
    id: 'MTR-01-04',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#101)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_REFUNDS',
    meterDescription: 'Refunds Count (Customer Returns)',
    meterCategory: 'security',
    startReading: 94,
    endReading: 96,
    delta: 2,
    isCurrency: false,
    amountValue: 65.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Returned defective cap seals',
  },
  {
    id: 'MTR-01-05',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#101)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_CUMULATIVE_SALES',
    meterDescription: 'Cumulative Sales (Grand Totalizer / GT)',
    meterCategory: 'financial',
    startReading: 842150.00,
    endReading: 847000.00,
    delta: 4850.00,
    isCurrency: true,
    amountValue: 4850.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Fiscal hardware memory accumulator',
  },
  {
    id: 'MTR-01-06',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#101)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_CASH_DRAWER',
    meterDescription: 'Cash Drawer Totalizer (Physical Cash)',
    meterCategory: 'financial',
    startReading: 12400.00,
    endReading: 14850.00,
    delta: 2450.00,
    isCurrency: true,
    amountValue: 2450.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Physical till drawer intake',
  },
  {
    id: 'MTR-01-07',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#101)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_DIGITAL_TENDER',
    meterDescription: 'Card / Whish Electronic Settlement',
    meterCategory: 'financial',
    startReading: 64200.00,
    endReading: 65440.00,
    delta: 1240.00,
    isCurrency: true,
    amountValue: 1240.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Electronic terminal bridge',
  },
  {
    id: 'MTR-01-08',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#101)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_DISCOUNTS',
    meterDescription: 'Discounts Granted Totalizer',
    meterCategory: 'financial',
    startReading: 9820.00,
    endReading: 9960.00,
    delta: 140.00,
    isCurrency: true,
    amountValue: 140.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Managerial & promotional markdowns',
  },
  {
    id: 'MTR-01-09',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#101)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_VAT_TAX',
    meterDescription: 'VAT / Tax Totalizer (11% MOF Fiscal)',
    meterCategory: 'tax',
    startReading: 38110.00,
    endReading: 38422.40,
    delta: 312.40,
    isCurrency: true,
    amountValue: 312.40,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Official Lebanese VAT accrual counter',
  },

  // Shift 2: Evening Peak (#102) - POS-01
  {
    id: 'MTR-01-10',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_2',
    shiftBatchLabel: 'Shift 2 (#102)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_INV_COUNT',
    meterDescription: 'Invoices Issued',
    meterCategory: 'transaction',
    startReading: 104268,
    endReading: 104342,
    delta: 74,
    isCurrency: false,
    amountValue: 6180.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Peak evening retail volume',
  },
  {
    id: 'MTR-01-11',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_2',
    shiftBatchLabel: 'Shift 2 (#102)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_DRAWER_POPS',
    meterDescription: 'Drawer Pops / No-Sale',
    meterCategory: 'security',
    startReading: 1419,
    endReading: 1424,
    delta: 5,
    isCurrency: false,
    amountValue: undefined,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Cash change drawers without sales',
  },
  {
    id: 'MTR-01-12',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_2',
    shiftBatchLabel: 'Shift 2 (#102)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_VOIDS',
    meterDescription: 'Voids Count (Line & Bill Voids)',
    meterCategory: 'security',
    startReading: 386,
    endReading: 389,
    delta: 3,
    isCurrency: false,
    amountValue: 84.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Item mis-scans corrected by supervisor',
  },
  {
    id: 'MTR-01-13',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_2',
    shiftBatchLabel: 'Shift 2 (#102)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_CUMULATIVE_SALES',
    meterDescription: 'Cumulative Sales (Grand Totalizer / GT)',
    meterCategory: 'financial',
    startReading: 847000.00,
    endReading: 853180.00,
    delta: 6180.00,
    isCurrency: true,
    amountValue: 6180.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Totalizer accumulated gross revenue',
  },

  // Z-Report Final Batch (#Z-9042) - POS-01
  {
    id: 'MTR-01-14',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'Z_FINAL',
    shiftBatchLabel: 'Z-Report Final Batch (#Z-9042)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_INV_COUNT',
    meterDescription: 'Invoices Issued (Full Day EOD)',
    meterCategory: 'transaction',
    startReading: 104210,
    endReading: 104342,
    delta: 132,
    isCurrency: false,
    amountValue: 11030.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'End of Day Master Z-Report closure',
  },
  {
    id: 'MTR-01-15',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'Z_FINAL',
    shiftBatchLabel: 'Z-Report Final Batch (#Z-9042)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_DRAWER_POPS',
    meterDescription: 'Drawer Pops / No-Sale',
    meterCategory: 'security',
    startReading: 1412,
    endReading: 1424,
    delta: 12,
    isCurrency: false,
    amountValue: undefined,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Total no-sale key opens verified',
  },
  {
    id: 'MTR-01-16',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'Z_FINAL',
    shiftBatchLabel: 'Z-Report Final Batch (#Z-9042)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_CUMULATIVE_SALES',
    meterDescription: 'Cumulative Sales (Grand Totalizer / GT)',
    meterCategory: 'financial',
    startReading: 842150.00,
    endReading: 853180.00,
    delta: 11030.00,
    isCurrency: true,
    amountValue: 11030.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Full fiscal day total turnover',
  },

  // ==========================================
  // POS-02 (Deli & Bulk Counter) - Main Branch
  // ==========================================
  {
    id: 'MTR-02-01',
    terminal: 'POS-02',
    terminalName: 'Deli & Bulk Counter',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#103)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_INV_COUNT',
    meterDescription: 'Invoices Issued',
    meterCategory: 'transaction',
    startReading: 51200,
    endReading: 51242,
    delta: 42,
    isCurrency: false,
    amountValue: 3140.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Bulk olive oil and pressed olive packages',
  },
  {
    id: 'MTR-02-02',
    terminal: 'POS-02',
    terminalName: 'Deli & Bulk Counter',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#103)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_DRAWER_POPS',
    meterDescription: 'Drawer Pops / No-Sale',
    meterCategory: 'security',
    startReading: 680,
    endReading: 683,
    delta: 3,
    isCurrency: false,
    amountValue: undefined,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Tare check and weight calibration pop',
  },
  {
    id: 'MTR-02-03',
    terminal: 'POS-02',
    terminalName: 'Deli & Bulk Counter',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#103)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_VOIDS',
    meterDescription: 'Voids Count (Line & Bill Voids)',
    meterCategory: 'security',
    startReading: 142,
    endReading: 144,
    delta: 2,
    isCurrency: false,
    amountValue: 45.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Scale re-weight void ticket',
  },
  {
    id: 'MTR-02-04',
    terminal: 'POS-02',
    terminalName: 'Deli & Bulk Counter',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#103)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_REFUNDS',
    meterDescription: 'Refunds Count (Customer Returns)',
    meterCategory: 'security',
    startReading: 31,
    endReading: 31,
    delta: 0,
    isCurrency: false,
    amountValue: 0.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Zero return claims registered',
  },
  {
    id: 'MTR-02-05',
    terminal: 'POS-02',
    terminalName: 'Deli & Bulk Counter',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#103)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_CUMULATIVE_SALES',
    meterDescription: 'Cumulative Sales (Grand Totalizer / GT)',
    meterCategory: 'financial',
    startReading: 412900.00,
    endReading: 416040.00,
    delta: 3140.00,
    isCurrency: true,
    amountValue: 3140.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Deli counter gross turnover',
  },
  {
    id: 'MTR-02-06',
    terminal: 'POS-02',
    terminalName: 'Deli & Bulk Counter',
    shiftBatch: 'X_READING',
    shiftBatchLabel: 'Mid-Day X-Reading Snapshot (#X-4410)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_INV_COUNT',
    meterDescription: 'Invoices Issued (Mid-Day Snapshot)',
    meterCategory: 'transaction',
    startReading: 51200,
    endReading: 51228,
    delta: 28,
    isCurrency: false,
    amountValue: 2090.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Mid-day non-reset X audit inspection',
  },

  // ==========================================
  // POS-03 (Express Counter) - Main Branch
  // ==========================================
  {
    id: 'MTR-03-01',
    terminal: 'POS-03',
    terminalName: 'Express Counter',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#105)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_INV_COUNT',
    meterDescription: 'Invoices Issued',
    meterCategory: 'transaction',
    startReading: 89400,
    endReading: 89465,
    delta: 65,
    isCurrency: false,
    amountValue: 2890.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Single bottle grab-and-go sales',
  },
  {
    id: 'MTR-03-02',
    terminal: 'POS-03',
    terminalName: 'Express Counter',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#105)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_DRAWER_POPS',
    meterDescription: 'Drawer Pops / No-Sale',
    meterCategory: 'security',
    startReading: 1104,
    endReading: 1108,
    delta: 4,
    isCurrency: false,
    amountValue: undefined,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Drawer inspection verification',
  },
  {
    id: 'MTR-03-03',
    terminal: 'POS-03',
    terminalName: 'Express Counter',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#105)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_VOIDS',
    meterDescription: 'Voids Count (Line & Bill Voids)',
    meterCategory: 'security',
    startReading: 215,
    endReading: 216,
    delta: 1,
    isCurrency: false,
    amountValue: 12.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Customer payment change void',
  },
  {
    id: 'MTR-03-04',
    terminal: 'POS-03',
    terminalName: 'Express Counter',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#105)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_CUMULATIVE_SALES',
    meterDescription: 'Cumulative Sales (Grand Totalizer / GT)',
    meterCategory: 'financial',
    startReading: 612800.00,
    endReading: 615690.00,
    delta: 2890.00,
    isCurrency: true,
    amountValue: 2890.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Fast lane totalizer',
  },
  {
    id: 'MTR-03-05',
    terminal: 'POS-03',
    terminalName: 'Express Counter',
    shiftBatch: 'SHIFT_3',
    shiftBatchLabel: 'Shift 3 (#107)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_INV_COUNT',
    meterDescription: 'Invoices Issued (Night Closure)',
    meterCategory: 'transaction',
    startReading: 89465,
    endReading: 89488,
    delta: 23,
    isCurrency: false,
    amountValue: 980.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Late evening retail orders',
  },

  // ==========================================
  // POS-04 (Warehouse Dispatch) - Main Branch
  // ==========================================
  {
    id: 'MTR-04-01',
    terminal: 'POS-04',
    terminalName: 'Warehouse Dispatch',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#108)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_INV_COUNT',
    meterDescription: 'Invoices Issued (B2B Bulk Shipments)',
    meterCategory: 'transaction',
    startReading: 18450,
    endReading: 18466,
    delta: 16,
    isCurrency: false,
    amountValue: 14200.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Commercial tin pallets dispatched',
  },
  {
    id: 'MTR-04-02',
    terminal: 'POS-04',
    terminalName: 'Warehouse Dispatch',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#108)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_DRAWER_POPS',
    meterDescription: 'Drawer Pops / No-Sale',
    meterCategory: 'security',
    startReading: 310,
    endReading: 311,
    delta: 1,
    isCurrency: false,
    amountValue: undefined,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'Dispatch receipt box check',
  },
  {
    id: 'MTR-04-03',
    terminal: 'POS-04',
    terminalName: 'Warehouse Dispatch',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#108)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_CUMULATIVE_SALES',
    meterDescription: 'Cumulative Sales (Grand Totalizer / GT)',
    meterCategory: 'financial',
    startReading: 1982400.00,
    endReading: 1996600.00,
    delta: 14200.00,
    isCurrency: true,
    amountValue: 14200.00,
    currency: 'USD',
    branch: 'Main Branch (Choueifat Main Facility)',
    notes: 'High value wholesale delivery invoices',
  },

  // ==========================================
  // Beirut Depot - POS-01
  // ==========================================
  {
    id: 'MTR-B01-01',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#101)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_INV_COUNT',
    meterDescription: 'Invoices Issued',
    meterCategory: 'transaction',
    startReading: 42100,
    endReading: 42138,
    delta: 38,
    isCurrency: false,
    amountValue: 3420.00,
    currency: 'USD',
    branch: 'Beirut Depot',
    notes: 'Beirut urban boutique orders',
  },
  {
    id: 'MTR-B01-02',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#101)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_DRAWER_POPS',
    meterDescription: 'Drawer Pops / No-Sale',
    meterCategory: 'security',
    startReading: 512,
    endReading: 515,
    delta: 3,
    isCurrency: false,
    amountValue: undefined,
    currency: 'USD',
    branch: 'Beirut Depot',
    notes: 'Cash count before shift transition',
  },
  {
    id: 'MTR-B01-03',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#101)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_CUMULATIVE_SALES',
    meterDescription: 'Cumulative Sales (Grand Totalizer / GT)',
    meterCategory: 'financial',
    startReading: 328000.00,
    endReading: 331420.00,
    delta: 3420.00,
    isCurrency: true,
    amountValue: 3420.00,
    currency: 'USD',
    branch: 'Beirut Depot',
    notes: 'Beirut store register counter',
  },

  // ==========================================
  // Sidon Hub - POS-01
  // ==========================================
  {
    id: 'MTR-S01-01',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#101)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_INV_COUNT',
    meterDescription: 'Invoices Issued',
    meterCategory: 'transaction',
    startReading: 31800,
    endReading: 31831,
    delta: 31,
    isCurrency: false,
    amountValue: 2680.00,
    currency: 'USD',
    branch: 'Sidon Hub',
    notes: 'Sidon coastal retail branch',
  },
  {
    id: 'MTR-S01-02',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#101)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_DRAWER_POPS',
    meterDescription: 'Drawer Pops / No-Sale',
    meterCategory: 'security',
    startReading: 340,
    endReading: 342,
    delta: 2,
    isCurrency: false,
    amountValue: undefined,
    currency: 'USD',
    branch: 'Sidon Hub',
    notes: 'Float change audit',
  },
  {
    id: 'MTR-S01-03',
    terminal: 'POS-01',
    terminalName: 'Front Register',
    shiftBatch: 'SHIFT_1',
    shiftBatchLabel: 'Shift 1 (#101)',
    date: '2026-09-06',
    dateFormatted: '06-Sep-2026',
    meterCode: 'MTR_CUMULATIVE_SALES',
    meterDescription: 'Cumulative Sales (Grand Totalizer / GT)',
    meterCategory: 'financial',
    startReading: 245000.00,
    endReading: 247680.00,
    delta: 2680.00,
    isCurrency: true,
    amountValue: 2680.00,
    currency: 'USD',
    branch: 'Sidon Hub',
    notes: 'Sidon till accumulator',
  },
];

/**
 * ============================================================================
 * METER REPORT REGISTER COMPONENT (REP_S_00189)
 * ============================================================================
 */
export const MeterReportTemplate: React.FC<MeterReportTemplateProps> = ({
  hideToolbar = false,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  branch = 'Main Branch (Choueifat Main Facility)',
  fromDate = '01-Aug-2026',
  toDate = '27-Aug-2026',
  filterValues = {},
  reportTitle = 'Meter & Shift Reading Register (Z-Report Audit)',
  code = 'REP_S_00189',
}) => {
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');

  const cleanPeriod = useMemo(() => {
    if (dynamicPeriodText) {
      return dynamicPeriodText
        .replace(/^Audit Window:\s*/i, '')
        .replace(/^Period:\s*/i, '')
        .replace(/^Date:\s*/i, '');
    }
    return `${fromDate} to ${toDate}`;
  }, [dynamicPeriodText, fromDate, toDate]);

  const activeCurrency = useMemo(() => {
    return resolveActiveCurrencyFromFilters(filterValues, 'USD');
  }, [filterValues]);

  const secondaryCurrency = activeCurrency === 'LBP' ? 'USD' : 'LBP';

  // Dynamic filter summary
  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    const b = filterValues.branch || branch;
    if (b && b !== 'ALL' && b !== 'All Branches') parts.push(`Branch: ${b}`);
    if (filterValues.workstation && filterValues.workstation !== 'ALL') {
      parts.push(`Terminal: ${filterValues.workstation}`);
    }
    if (filterValues.shiftBatch && filterValues.shiftBatch !== 'ALL') {
      parts.push(`Shift: ${filterValues.shiftBatch}`);
    }
    if (filterValues.currency && filterValues.currency !== 'ALL') {
      parts.push(`Cur: ${filterValues.currency}`);
    }
    return parts.length > 0 ? parts.join(' | ') : undefined;
  }, [filterValues, branch]);

  // Global Filter Pipeline
  const filteredRows = useMemo(() => {
    return MOCK_METER_RECORDS.filter((rec) => {
      // 1. Branch filter
      const activeBranch = filterValues.branch || branch;
      if (activeBranch && activeBranch !== 'ALL' && activeBranch !== 'All Branches') {
        const matchBranch =
          rec.branch.toLowerCase().includes(activeBranch.toLowerCase()) ||
          activeBranch.toLowerCase().includes(rec.branch.toLowerCase());
        if (!matchBranch) return false;
      }

      // 2. Terminal / Workstation filter
      const activeWs = filterValues.workstation;
      if (activeWs && activeWs !== 'ALL') {
        const matchesTerminal =
          rec.terminal.toLowerCase() === activeWs.toLowerCase() ||
          rec.terminalName.toLowerCase().includes(activeWs.toLowerCase());
        if (!matchesTerminal) return false;
      }

      // 3. Shift / Batch filter
      const activeShift = filterValues.shiftBatch;
      if (activeShift && activeShift !== 'ALL') {
        const matchesShift =
          rec.shiftBatch.toLowerCase() === activeShift.toLowerCase() ||
          rec.shiftBatchLabel.toLowerCase().includes(activeShift.toLowerCase());
        if (!matchesShift) return false;
      }

      // 4. Date Range filter
      const recIso = parseDateToIso(rec.date);
      if (fromDate && recIso) {
        const fromIso = parseDateToIso(fromDate);
        if (fromIso && recIso < fromIso) return false;
      }
      if (toDate && recIso) {
        const toIso = parseDateToIso(toDate);
        if (toIso && recIso > toIso) return false;
      }

      // 5. Search Query
      const q = (filterValues.searchQuery || '').toLowerCase().trim();
      if (q) {
        const matchQuery =
          rec.terminal.toLowerCase().includes(q) ||
          rec.terminalName.toLowerCase().includes(q) ||
          rec.shiftBatchLabel.toLowerCase().includes(q) ||
          rec.meterDescription.toLowerCase().includes(q) ||
          rec.meterCode.toLowerCase().includes(q) ||
          rec.branch.toLowerCase().includes(q);
        if (!matchQuery) return false;
      }

      return true;
    });
  }, [filterValues, branch, fromDate, toDate]);

  // Aggregate Key Metrics for Meter Summary
  const { totalDeltaEvents, totalMonetaryDelta, totalInvoicesIssued, totalDrawerPops, totalVoids } = useMemo(() => {
    return filteredRows.reduce(
      (acc, r) => {
        if (!r.isCurrency) {
          acc.totalDeltaEvents += r.delta;
        }
        if (r.amountValue) {
          acc.totalMonetaryDelta += r.amountValue;
        }
        if (r.meterCode === 'MTR_INV_COUNT') {
          acc.totalInvoicesIssued += r.delta;
        }
        if (r.meterCode === 'MTR_DRAWER_POPS') {
          acc.totalDrawerPops += r.delta;
        }
        if (r.meterCode === 'MTR_VOIDS') {
          acc.totalVoids += r.delta;
        }
        return acc;
      },
      {
        totalDeltaEvents: 0,
        totalMonetaryDelta: 0,
        totalInvoicesIssued: 0,
        totalDrawerPops: 0,
        totalVoids: 0,
      }
    );
  }, [filteredRows]);

  // Report Document Metadata
  const meta: ReportMetadata = useMemo(() => ({
    companyName: 'Zeit w zaytoun ljanoub',
    subtitle: 'Southern Olive Oil Products S.A.R.L - Fiscal Cash Register Reading Log & Shift Audit',
    reportTitle,
    code,
    dateRange: cleanPeriod,
    generatedDate: executionDate,
    branch: branch.startsWith('Branch:') ? branch : `Branch: ${branch}`,
    filterSummary,
    systemSource: 'Vanguard ERP Fiscal Security Kernel (REP_S_00189)',
    pageNumber: 1,
    totalPages: 1,
  }), [reportTitle, code, cleanPeriod, executionDate, branch, filterSummary]);

  /**
   * ==========================================================================
   * MANDATORY 7 COLUMNS SCHEMA FOR REP_S_00189:
   * 1. Terminal / POS#
   * 2. Shift / Batch#
   * 3. Meter Description
   * 4. Start Reading (Opening)
   * 5. End Reading (Closing)
   * 6. Delta / Activity (End - Start)
   * 7. Amount / Value (where applicable)
   * ==========================================================================
   */
  const columns: ReportColumn<MeterAuditRecord>[] = useMemo(() => [
    {
      key: 'terminal',
      label: 'Terminal / POS#',
      align: 'left',
      width: '13%',
      isMonospace: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-slate-900 text-xs">
            {row.terminal}
          </span>
          <span className="text-[10.5px] text-slate-500 font-sans leading-tight">
            {row.terminalName}
          </span>
        </div>
      ),
    },
    {
      key: 'shiftBatch',
      label: 'Shift / Batch#',
      align: 'left',
      width: '15%',
      render: (row) => (
        <div className="flex flex-col">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 w-fit">
            {row.shiftBatchLabel}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
            {row.dateFormatted}
          </span>
        </div>
      ),
    },
    {
      key: 'meterDescription',
      label: 'Meter Description',
      align: 'left',
      width: '24%',
      render: (row) => {
        let badgeColor = 'text-slate-800';
        let subBadge = null;

        if (row.meterCode === 'MTR_INV_COUNT') {
          badgeColor = 'text-blue-900 font-bold';
          subBadge = (
            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
              Tax Invoice
            </span>
          );
        } else if (row.meterCode === 'MTR_DRAWER_POPS') {
          badgeColor = 'text-amber-900 font-bold';
          subBadge = (
            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
              Security
            </span>
          );
        } else if (row.meterCode === 'MTR_VOIDS') {
          badgeColor = 'text-rose-900 font-bold';
          subBadge = (
            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
              Void
            </span>
          );
        } else if (row.meterCode === 'MTR_REFUNDS') {
          badgeColor = 'text-purple-900 font-bold';
          subBadge = (
            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
              Return
            </span>
          );
        } else if (row.meterCode === 'MTR_CUMULATIVE_SALES') {
          badgeColor = 'text-emerald-950 font-black';
          subBadge = (
            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
              Grand Totalizer
            </span>
          );
        }

        return (
          <div className="flex flex-col">
            <div className="flex items-center flex-wrap">
              <span className={`text-xs ${badgeColor}`}>{row.meterDescription}</span>
              {subBadge}
            </div>
            {row.notes && (
              <span className="text-[10px] text-slate-500 font-sans italic mt-0.5">
                {row.notes}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'startReading',
      label: 'Start Reading (Opening)',
      align: 'right',
      width: '12%',
      isMonospace: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-700 tabular-nums">
          {row.isCurrency
            ? formatCurrencyAmount(
                convertCurrency(row.startReading, row.currency || 'USD', activeCurrency),
                activeCurrency,
                true
              )
            : row.startReading.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'endReading',
      label: 'End Reading (Closing)',
      align: 'right',
      width: '12%',
      isMonospace: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-950 tabular-nums">
          {row.isCurrency
            ? formatCurrencyAmount(
                convertCurrency(row.endReading, row.currency || 'USD', activeCurrency),
                activeCurrency,
                true
              )
            : row.endReading.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'delta',
      label: 'Delta / Activity',
      align: 'right',
      width: '12%',
      isMonospace: true,
      render: (row) => {
        const isPositive = row.delta > 0;
        const colorClass =
          row.meterCategory === 'security' && isPositive
            ? 'text-amber-700 bg-amber-50/70 px-1.5 py-0.5 rounded border border-amber-200'
            : isPositive
            ? 'text-emerald-700 font-bold bg-emerald-50/70 px-1.5 py-0.5 rounded border border-emerald-200'
            : 'text-slate-600';

        return (
          <span className={`font-mono text-xs tabular-nums ${colorClass}`}>
            {isPositive ? '+' : ''}
            {row.isCurrency
              ? formatCurrencyAmount(
                  convertCurrency(row.delta, row.currency || 'USD', activeCurrency),
                  activeCurrency,
                  true
                )
              : row.delta.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: 'amountValue',
      label: 'Amount / Value',
      align: 'right',
      width: '12%',
      isMonospace: true,
      render: (row) => {
        if (row.amountValue === undefined || row.amountValue === null) {
          return <span className="text-slate-400 font-sans font-normal">—</span>;
        }

        const converted = convertCurrency(row.amountValue, row.currency || 'USD', activeCurrency);
        return (
          <div className="flex flex-col items-end">
            <span className="font-mono text-xs font-extrabold text-slate-950 tabular-nums">
              {formatCurrencyAmount(converted, activeCurrency, true)}
            </span>
            {activeCurrency === 'LBP' && (
              <span className="text-[9.5px] font-mono text-slate-500">
                (${row.amountValue.toFixed(2)})
              </span>
            )}
          </div>
        );
      },
    },
  ], [activeCurrency]);

  // Section Grouping: Grouped by Terminal / Workstation
  const sections: ReportSection<MeterAuditRecord>[] = useMemo(() => {
    if (viewMode !== 'grouped') return [];

    const map: Record<string, MeterAuditRecord[]> = {};
    filteredRows.forEach((row) => {
      const key = `${row.terminal} (${row.terminalName})`;
      if (!map[key]) map[key] = [];
      map[key].push(row);
    });

    return Object.entries(map).map(([terminalLabel, rows]) => {
      const terminalRevenue = rows.reduce((sum, r) => sum + (r.amountValue || 0), 0);
      const convertedRev = convertCurrency(terminalRevenue, 'USD', activeCurrency);

      return {
        title: `Workstation Terminal: ${terminalLabel} • ${rows.length} Audited Meter Counters`,
        type: 'revenue',
        rows,
        subtotal: {
          label: `Subtotal for ${terminalLabel} [Total Audited Financial Activity]`,
          value: formatCurrencyAmount(convertedRev, activeCurrency, true),
        },
      };
    });
  }, [filteredRows, viewMode, activeCurrency]);

  // Grand Total Summary
  const grandTotal: GrandTotal = useMemo(() => {
    const convertedGrand = convertCurrency(totalMonetaryDelta, 'USD', activeCurrency);
    const convertedSecondary = convertCurrency(totalMonetaryDelta, 'USD', secondaryCurrency);

    return {
      label: `Grand Total - Meter & Shift Audit Register (${filteredRows.length} Totalizers Audited)`,
      value: formatCurrencyAmount(convertedGrand, activeCurrency, true),
      targetCurrency: activeCurrency,
      breakdownText: `${totalInvoicesIssued} Invoices Issued • ${totalDrawerPops} No-Sale Drawer Pops • ${totalVoids} Voids • ${totalDeltaEvents} Non-Monetary Meter Ticks`,
      convertedSubtext: `Secondary Consolidated Valuation: ${formatCurrencyAmount(convertedSecondary, secondaryCurrency, true)}`,
    };
  }, [filteredRows.length, totalMonetaryDelta, totalInvoicesIssued, totalDrawerPops, totalVoids, totalDeltaEvents, activeCurrency, secondaryCurrency]);

  return (
    <div className="w-full space-y-4">
      {/* Interactive Controls & View Mode Selector */}
      {!hideToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Display Mode:
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'grouped'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grouped by Terminal
              </button>
              <button
                onClick={() => setViewMode('flat')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'flat'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Flat Chronological
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 font-mono">
            <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
              Active Meters: {filteredRows.length}
            </span>
            <span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200">
              Invoices: {totalInvoicesIssued}
            </span>
            <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
              No-Sale Pops: {totalDrawerPops}
            </span>
          </div>
        </div>
      )}

      {/* Official Vanguard Master Report Document */}
      <MasterReportDocument
        meta={meta}
        columns={columns}
        sections={viewMode === 'grouped' ? sections : undefined}
        flatRows={viewMode === 'flat' ? filteredRows : undefined}
        grandTotal={grandTotal}
        orientation="landscape"
      />
    </div>
  );
};

export default MeterReportTemplate;
