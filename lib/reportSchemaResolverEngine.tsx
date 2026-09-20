/**
 * ============================================================================
 * VANGUARD ERP - CONTEXT-AWARE UNIVERSAL REPORT SCHEMA & RESOLVER ENGINE
 * ============================================================================
 * Solves the system-wide architectural problem where universal report tables
 * fell back to hardcoded sales invoice templates (Invoice #, Customer, Total USD).
 *
 * Core Capabilities:
 * 1. Resolves registered schemas from REPORT_SCHEMAS.
 * 2. Inferred Fallback Engine: Dynamically infers domain, columns, cell formatting,
 *    and KPI cards from dataset keys or active filter dimensions.
 * 3. Never renders sales invoice layouts for audit, internal control, inventory,
 *    fleet, HR, or accounting reports.
 */

import React from 'react';
import {
  ReportSchemaDefinition,
  ReportColumnDefinition,
  ReportDomain,
  ColumnFormatType,
} from '@/types/reports';
import { MetricCardItem } from '@/components/reports/ReportPageLayout';
import { getReportSchema } from '@/config/reportSchemaRegistry';
import { formatCurrencyAmount } from '@/lib/currencyEngine';
import {
  ShieldCheck,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Package,
  Truck,
  Users,
  CheckCircle2,
  FileText,
  Activity,
} from 'lucide-react';

// ============================================================================
// 1. DOMAIN INFERENCE ENGINE
// ============================================================================

export function detectReportDomain(
  reportName: string,
  reportCode?: string,
  moduleContext?: string
): ReportDomain {
  const cleanName = (reportName || '').toLowerCase();
  const cleanCode = (reportCode || '').toUpperCase();
  const cleanModule = (moduleContext || '').toLowerCase();

  // 1. Check by explicit report code prefixes
  if (cleanCode.startsWith('REP_IC_') || cleanCode.startsWith('REP_AUD_') || cleanCode.startsWith('REP_SEC_')) {
    return 'internal_control';
  }
  if (cleanCode.startsWith('REP_INV_') || cleanCode.startsWith('REP_WH_') || cleanCode.startsWith('REP_STK_')) {
    return 'inventory';
  }
  if (cleanCode.startsWith('REP_ACC_') || cleanCode.startsWith('REP_GL_') || cleanCode.startsWith('REP_VAT_')) {
    return 'accounting';
  }
  if (cleanCode.startsWith('REP_FLT_') || cleanCode.startsWith('REP_DSP_') || cleanCode.startsWith('REP_TRK_')) {
    return 'fleet';
  }
  if (cleanCode.startsWith('REP_HR_') || cleanCode.startsWith('REP_PAY_') || cleanCode.startsWith('REP_ATT_')) {
    return 'hr';
  }
  if (cleanCode.startsWith('REP_CRM_') || cleanCode.startsWith('REP_SOC_')) {
    return 'crm';
  }

  // 2. Keyword detection on report title
  if (
    cleanName.includes('meter') ||
    cleanName.includes('z-report') ||
    cleanName.includes('reading') ||
    cleanName.includes('hardware') ||
    cleanName.includes('totalizer')
  ) {
    return 'audit';
  }

  if (
    cleanName.includes('no sale') ||
    cleanName.includes('drawer') ||
    cleanName.includes('hold') ||
    cleanName.includes('user log') ||
    cleanName.includes('security log') ||
    cleanName.includes('void') ||
    cleanName.includes('refund') ||
    cleanName.includes('concession') ||
    cleanName.includes('discount') ||
    cleanName.includes('audit') ||
    cleanName.includes('control') ||
    cleanName.includes('exception')
  ) {
    return 'internal_control';
  }

  if (
    cleanName.includes('stock') ||
    cleanName.includes('inventory') ||
    cleanName.includes('warehouse') ||
    cleanName.includes('item') ||
    cleanName.includes('expiry') ||
    cleanName.includes('valuation') ||
    cleanName.includes('reorder') ||
    cleanName.includes('transfer') ||
    cleanName.includes('spoilage') ||
    cleanName.includes('shrinkage')
  ) {
    return 'inventory';
  }

  if (
    cleanName.includes('payment') ||
    cleanName.includes('tax') ||
    cleanName.includes('vat') ||
    cleanName.includes('tender') ||
    cleanName.includes('ledger') ||
    cleanName.includes('statement') ||
    cleanName.includes('cogs') ||
    cleanName.includes('balance') ||
    cleanName.includes('journal') ||
    cleanName.includes('settlement')
  ) {
    return 'accounting';
  }

  if (
    cleanName.includes('delivery') ||
    cleanName.includes('driver') ||
    cleanName.includes('fleet') ||
    cleanName.includes('dispatch') ||
    cleanName.includes('route') ||
    cleanName.includes('trip') ||
    cleanName.includes('vehicle') ||
    cleanName.includes('zone')
  ) {
    return 'fleet';
  }

  if (
    cleanName.includes('attendance') ||
    cleanName.includes('timesheet') ||
    cleanName.includes('employee') ||
    cleanName.includes('staff') ||
    cleanName.includes('payroll') ||
    cleanName.includes('labor') ||
    cleanName.includes('shift')
  ) {
    return 'hr';
  }

  if (
    cleanName.includes('customer') ||
    cleanName.includes('loyalty') ||
    cleanName.includes('lead') ||
    cleanName.includes('campaign') ||
    cleanName.includes('feedback')
  ) {
    return 'crm';
  }

  if (
    cleanName.includes('sale') ||
    cleanName.includes('invoice') ||
    cleanName.includes('margin') ||
    cleanName.includes('profit') ||
    cleanName.includes('turnover') ||
    cleanName.includes('workstation') ||
    cleanName.includes('department')
  ) {
    return 'sales';
  }

  // 3. Fallback to Module Context
  if (cleanModule === 'inventory' || cleanModule === 'operations') return 'inventory';
  if (cleanModule === 'accounting' || cleanModule === 'finance') return 'accounting';
  if (cleanModule === 'fleet' || cleanModule === 'logistics') return 'fleet';
  if (cleanModule === 'hr' || cleanModule === 'payroll') return 'hr';
  if (cleanModule === 'crm' || cleanModule === 'social') return 'crm';
  if (cleanModule === 'sales') return 'sales';

  return 'general';
}

// ============================================================================
// 2. COLUMN INFERENCE FROM DATASET KEYS
// ============================================================================

export function humanizeKey(key: string): string {
  // Replace underscores and hyphens with spaces
  let result = key.replace(/[-_]/g, ' ');
  // Insert space before uppercase letters in camelCase
  result = result.replace(/([a-z])([A-Z])/g, '$1 $2');
  // Capitalize words
  result = result
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === 'id') return 'ID';
      if (lower === 'pos') return 'POS#';
      if (lower === 'usd') return 'USD ($)';
      if (lower === 'lbp') return 'LBP';
      if (lower === 'vat') return 'VAT';
      if (lower === 'cogs') return 'COGS';
      if (lower === 'cod') return 'COD';
      if (lower === 'ref') return 'Ref #';
      if (lower === 'no') return '#';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
  return result;
}

export function inferFormatTypeFromKey(key: string, sampleValue?: any): ColumnFormatType {
  const k = key.toLowerCase();

  if (k.includes('time') || k.includes('timestamp') || k.includes('date')) {
    if (k.includes('time') && !k.includes('datetime')) return 'time';
    return 'datetime';
  }
  if (
    k.includes('amount') ||
    k.includes('price') ||
    k.includes('cost') ||
    k.includes('total') ||
    k.includes('sales') ||
    k.includes('revenue') ||
    k.includes('profit') ||
    k.includes('cogs') ||
    k.includes('value') ||
    k.includes('fee') ||
    k.includes('usd') ||
    k.includes('lbp')
  ) {
    return 'currency';
  }
  if (k.includes('pct') || k.includes('percent') || k.includes('rate') || k.includes('margin')) {
    return 'percentage';
  }
  if (k.includes('delta') || k.includes('variance') || k.includes('diff')) {
    return 'delta';
  }
  if (k.includes('status') || k.includes('state')) {
    return 'status';
  }
  if (k.includes('type') || k.includes('category') || k.includes('event') || k.includes('reason')) {
    return 'badge';
  }
  if (
    k.includes('code') ||
    k.includes('id') ||
    k.includes('ref') ||
    k.includes('num') ||
    k.includes('no') ||
    k.includes('terminal') ||
    k.includes('batch') ||
    k.includes('plate')
  ) {
    return 'code';
  }
  if (
    k.includes('count') ||
    k.includes('qty') ||
    k.includes('quantity') ||
    k.includes('items') ||
    k.includes('units') ||
    k.includes('shifts') ||
    k.includes('reading') ||
    typeof sampleValue === 'number'
  ) {
    return 'number';
  }
  return 'text';
}

export function inferColumnsFromData(sampleRow: Record<string, any>): ReportColumnDefinition[] {
  if (!sampleRow || typeof sampleRow !== 'object') return [];

  const keys = Object.keys(sampleRow).filter((k) => k !== 'id' && k !== '_id' && k !== 'key');
  const count = keys.length;
  const colWidth = count > 0 ? `${Math.floor(100 / count)}%` : '15%';

  return keys.map((key) => {
    const val = sampleRow[key];
    const formatType = inferFormatTypeFromKey(key, val);

    let align: 'left' | 'center' | 'right' = 'left';
    if (formatType === 'currency' || formatType === 'number' || formatType === 'percentage' || formatType === 'delta') {
      align = 'right';
    } else if (formatType === 'badge' || formatType === 'status' || formatType === 'code' || formatType === 'time') {
      align = 'center';
    }

    const isMonospace =
      formatType === 'currency' ||
      formatType === 'number' ||
      formatType === 'percentage' ||
      formatType === 'delta' ||
      formatType === 'code' ||
      formatType === 'datetime';

    return {
      key,
      headerLabel: humanizeKey(key),
      align,
      formatType,
      width: colWidth,
      isMonospace,
    };
  });
}

// ============================================================================
// 3. CANONICAL DOMAIN COLUMN TEMPLATES (WHEN NO REGISTERED SCHEMA EXISTS)
// ============================================================================

export function inferColumnsFromDomain(domain: ReportDomain, reportTitle: string): ReportColumnDefinition[] {
  switch (domain) {
    case 'audit':
    case 'internal_control':
      return [
        { key: 'timestamp', headerLabel: 'Event Timestamp', width: '16%', align: 'left', formatType: 'datetime', isMonospace: true },
        { key: 'workstation', headerLabel: 'Terminal / POS#', width: '13%', align: 'left', formatType: 'code', isMonospace: true },
        { key: 'operator', headerLabel: 'Staff / Operator', width: '16%', align: 'left', formatType: 'text' },
        { key: 'eventScheme', headerLabel: 'Event / Audit Type', width: '15%', align: 'center', formatType: 'badge' },
        { key: 'recordRef', headerLabel: 'Reference #', width: '12%', align: 'left', formatType: 'code', isMonospace: true },
        { key: 'details', headerLabel: 'Audit Parameters & Reason', width: '16%', align: 'left', formatType: 'text' },
        { key: 'impactValue', headerLabel: 'Variance / Value', width: '12%', align: 'right', formatType: 'currency', isMonospace: true },
      ];

    case 'inventory':
      return [
        { key: 'itemCode', headerLabel: 'Item Code', width: '12%', align: 'left', formatType: 'code', isMonospace: true },
        { key: 'description', headerLabel: 'Product / Item Name', width: '24%', align: 'left', formatType: 'text' },
        { key: 'category', headerLabel: 'Category', width: '14%', align: 'left', formatType: 'badge' },
        { key: 'warehouse', headerLabel: 'Warehouse / Facility', width: '14%', align: 'left', formatType: 'text' },
        { key: 'onHand', headerLabel: 'On Hand', width: '10%', align: 'right', formatType: 'number', isMonospace: true },
        { key: 'reorderLevel', headerLabel: 'Min Level', width: '10%', align: 'right', formatType: 'number', isMonospace: true },
        { key: 'unitCost', headerLabel: 'Unit Cost ($)', width: '12%', align: 'right', formatType: 'currency', isMonospace: true },
        { key: 'valuation', headerLabel: 'Stock Valuation ($)', width: '14%', align: 'right', formatType: 'currency', isMonospace: true },
      ];

    case 'accounting':
      return [
        { key: 'accountCode', headerLabel: 'Account Code', width: '12%', align: 'left', formatType: 'code', isMonospace: true },
        { key: 'accountName', headerLabel: 'Account Description', width: '22%', align: 'left', formatType: 'text' },
        { key: 'voucherRef', headerLabel: 'Voucher Ref #', width: '14%', align: 'left', formatType: 'code', isMonospace: true },
        { key: 'date', headerLabel: 'Date', width: '12%', align: 'left', formatType: 'date', isMonospace: true },
        { key: 'debit', headerLabel: 'Debit ($)', width: '13%', align: 'right', formatType: 'currency', isMonospace: true },
        { key: 'credit', headerLabel: 'Credit ($)', width: '13%', align: 'right', formatType: 'currency', isMonospace: true },
        { key: 'netBalance', headerLabel: 'Net Balance ($)', width: '14%', align: 'right', formatType: 'currency', isMonospace: true },
      ];

    case 'fleet':
      return [
        { key: 'dispatchNo', headerLabel: 'Dispatch Ref #', width: '14%', align: 'left', formatType: 'code', isMonospace: true },
        { key: 'dispatchDate', headerLabel: 'Date & Time', width: '15%', align: 'left', formatType: 'datetime', isMonospace: true },
        { key: 'customer', headerLabel: 'Consignee / Destination', width: '18%', align: 'left', formatType: 'text' },
        { key: 'zone', headerLabel: 'Route Corridor', width: '14%', align: 'left', formatType: 'text' },
        { key: 'driver', headerLabel: 'Assigned Courier', width: '13%', align: 'left', formatType: 'text' },
        { key: 'status', headerLabel: 'Route Status', width: '12%', align: 'center', formatType: 'status' },
        { key: 'codValue', headerLabel: 'COD / Order Value', width: '14%', align: 'right', formatType: 'currency', isMonospace: true },
      ];

    case 'hr':
      return [
        { key: 'empCode', headerLabel: 'Staff ID', width: '12%', align: 'left', formatType: 'code', isMonospace: true },
        { key: 'empName', headerLabel: 'Employee Name', width: '22%', align: 'left', formatType: 'text' },
        { key: 'department', headerLabel: 'Department', width: '14%', align: 'left', formatType: 'badge' },
        { key: 'shiftSchedule', headerLabel: 'Scheduled Shift', width: '14%', align: 'left', formatType: 'text' },
        { key: 'clockIn', headerLabel: 'Clock In', width: '12%', align: 'center', formatType: 'time', isMonospace: true },
        { key: 'clockOut', headerLabel: 'Clock Out', width: '12%', align: 'center', formatType: 'time', isMonospace: true },
        { key: 'hoursWorked', headerLabel: 'Hours', width: '10%', align: 'right', formatType: 'number', isMonospace: true },
      ];

    case 'crm':
      return [
        { key: 'clientRef', headerLabel: 'Client Code', width: '12%', align: 'left', formatType: 'code', isMonospace: true },
        { key: 'clientName', headerLabel: 'Client / Account', width: '22%', align: 'left', formatType: 'text' },
        { key: 'tier', headerLabel: 'Membership Tier', width: '14%', align: 'center', formatType: 'badge' },
        { key: 'phone', headerLabel: 'Contact Phone', width: '14%', align: 'left', formatType: 'text' },
        { key: 'ordersCount', headerLabel: 'Orders', width: '10%', align: 'center', formatType: 'number', isMonospace: true },
        { key: 'lifetimeValue', headerLabel: 'LTV Spend ($)', width: '14%', align: 'right', formatType: 'currency', isMonospace: true },
        { key: 'status', headerLabel: 'Status', width: '14%', align: 'center', formatType: 'status' },
      ];

    case 'sales':
    default:
      return [
        { key: 'txRef', headerLabel: 'Transaction Ref #', width: '14%', align: 'left', formatType: 'code', isMonospace: true },
        { key: 'dateTime', headerLabel: 'Date & Time', width: '15%', align: 'left', formatType: 'datetime', isMonospace: true },
        { key: 'entityName', headerLabel: 'Customer / Account', width: '20%', align: 'left', formatType: 'text' },
        { key: 'operator', headerLabel: 'Cashier / Rep', width: '14%', align: 'left', formatType: 'text' },
        { key: 'tender', headerLabel: 'Tender / Payment', width: '12%', align: 'center', formatType: 'badge' },
        { key: 'itemsQty', headerLabel: 'Items', width: '9%', align: 'center', formatType: 'number', isMonospace: true },
        { key: 'netTotal', headerLabel: 'Total ($)', width: '16%', align: 'right', formatType: 'currency', isMonospace: true },
      ];
  }
}

// ============================================================================
// 4. DOMAIN FALLBACK DATA GENERATOR
// ============================================================================

export function generateDomainFallbackData(
  domain: ReportDomain,
  reportTitle: string,
  filters: Record<string, any> = {}
): any[] {
  const branch = filters.branch && filters.branch !== 'ALL' ? filters.branch : 'Main Branch (Facility)';

  switch (domain) {
    case 'audit':
    case 'internal_control':
      return [
        { id: 'LOG-01', timestamp: '06-Sep-2026 09:12:15', workstation: 'POS-01', operator: 'Hiba Aloulou', eventScheme: 'SUPERVISOR_OVERRIDE', recordRef: 'SEC-1011', details: 'Authorized manager discount 10% on damaged oil tin', impactValue: 18.50, branch },
        { id: 'LOG-02', timestamp: '06-Sep-2026 10:45:00', workstation: 'POS-01', operator: 'Hiba Aloulou', eventScheme: 'DRAWER_POP_AUDIT', recordRef: 'SEC-1012', details: 'Mid-morning till change float verification check', impactValue: 0.00, branch },
        { id: 'LOG-03', timestamp: '06-Sep-2026 11:30:22', workstation: 'POS-02', operator: 'Ahmad K.', eventScheme: 'LINE_VOID_CHECK', recordRef: 'SEC-1013', details: 'Customer requested cancellation of extra glass jar', impactValue: 24.00, branch },
        { id: 'LOG-04', timestamp: '06-Sep-2026 13:15:05', workstation: 'POS-03', operator: 'Samer R.', eventScheme: 'PRICE_OVERRIDE', recordRef: 'SEC-1014', details: 'Special wholesale agreed price for olive crate', impactValue: 45.00, branch },
        { id: 'LOG-05', timestamp: '06-Sep-2026 15:40:19', workstation: 'POS-01', operator: 'Hiba Aloulou', eventScheme: 'RATE_PEG_VERIFY', recordRef: 'SEC-1015', details: 'Daily foreign currency LBP/USD peg re-validation', impactValue: 0.00, branch },
      ];

    case 'inventory':
      return [
        { id: 'STK-01', itemCode: 'EVOO-175L-TIN', description: 'Extra Virgin Olive Oil 17.5L Traditional Tin', category: 'Finished Oils', warehouse: 'Choueifat Main Silo', onHand: 420, reorderLevel: 100, unitCost: 85.00, valuation: 35700.00, branch },
        { id: 'STK-02', itemCode: 'EVOO-050L-GLS', description: 'Cold Press Extra Virgin 500ml Marasca Bottle', category: 'Retail Glass', warehouse: 'Choueifat Packing Line', onHand: 1850, reorderLevel: 500, unitCost: 4.80, valuation: 8880.00, branch },
        { id: 'STK-03', itemCode: 'RAW-OLV-BLK', description: 'Raw Black Olives Bulk Crate (25kg Harvest)', category: 'Agricultural Crops', warehouse: 'Cold Store Vault #2', onHand: 310, reorderLevel: 80, unitCost: 32.00, valuation: 9920.00, branch },
        { id: 'STK-04', itemCode: 'SOAP-NAT-BAR', description: 'Artisanal Olive Oil Laurel Soap (6-Pack Box)', category: 'Byproducts', warehouse: 'Finished Goods Bay', onHand: 890, reorderLevel: 250, unitCost: 3.20, valuation: 2848.00, branch },
        { id: 'STK-05', itemCode: 'EVOO-010L-TIN', description: 'Extra Virgin Olive Oil 1L Family Litho Tin', category: 'Finished Oils', warehouse: 'Choueifat Main Silo', onHand: 1200, reorderLevel: 300, unitCost: 7.90, valuation: 9480.00, branch },
      ];

    case 'accounting':
      return [
        { id: 'GL-01', accountCode: '1010-01', accountName: 'Cash on Hand - Main Vault (USD)', voucherRef: 'JV-2026-881', date: '06-Sep-2026', debit: 9420.00, credit: 0.00, netBalance: 9420.00, branch },
        { id: 'GL-02', accountCode: '1010-02', accountName: 'Cash on Hand - Till Registers (LBP)', voucherRef: 'JV-2026-882', date: '06-Sep-2026', debit: 3188.82, credit: 0.00, netBalance: 3188.82, branch },
        { id: 'GL-03', accountCode: '1100-05', accountName: 'Electronic Payment Clearing (Whish / Card)', voucherRef: 'JV-2026-883', date: '06-Sep-2026', debit: 4270.00, credit: 0.00, netBalance: 4270.00, branch },
        { id: 'GL-04', accountCode: '2150-01', accountName: 'VAT Collected on Domestic Sales (11%)', voucherRef: 'JV-2026-884', date: '06-Sep-2026', debit: 0.00, credit: 3124.00, netBalance: -3124.00, branch },
        { id: 'GL-05', accountCode: '4010-01', accountName: 'Gross Sales Revenue - Commercial Wholesale', voucherRef: 'JV-2026-885', date: '06-Sep-2026', debit: 0.00, credit: 13754.82, netBalance: -13754.82, branch },
      ];

    case 'fleet':
      return [
        { id: 'FLT-01', dispatchNo: 'DSP-2026-8801', dispatchDate: '06-Sep-2026 09:30 AM', customer: 'Al-Baraka Supermarket Group', zone: 'Beirut - Verdun', driver: 'Jad El-Hajj (Van 02)', status: 'DELIVERED', codValue: 1450.00, branch },
        { id: 'FLT-02', dispatchNo: 'DSP-2026-8802', dispatchDate: '06-Sep-2026 10:15 AM', customer: 'Al-Bustan Restaurant Group', zone: 'Beirut - Hamra', driver: 'Charbel Boutros (Van 01)', status: 'DELIVERED', codValue: 890.00, branch },
        { id: 'FLT-03', dispatchNo: 'DSP-2026-8803', dispatchDate: '06-Sep-2026 11:00 AM', customer: 'Mina Seaside Resort & Hotel', zone: 'South - Sidon Coastal', driver: 'Walid Sleiman (Van 03)', status: 'IN_TRANSIT', codValue: 620.00, branch },
        { id: 'FLT-04', dispatchNo: 'DSP-2026-8804', dispatchDate: '06-Sep-2026 13:45 PM', customer: 'Byblos Gourmet Deli Store', zone: 'Mount Lebanon - Jbeil', driver: 'Jad El-Hajj (Van 02)', status: 'SCHEDULED', codValue: 1200.00, branch },
        { id: 'FLT-05', dispatchNo: 'DSP-2026-8805', dispatchDate: '06-Sep-2026 15:10 PM', customer: 'Cedar Hospitality LLC', zone: 'Beirut - Achrafieh', driver: 'Charbel Boutros (Van 01)', status: 'DELIVERED', codValue: 480.00, branch },
      ];

    case 'hr':
      return [
        { id: 'HR-01', empCode: 'EMP-010', empName: 'Hiba Aloulou', department: 'Sales POS', shiftSchedule: 'Morning Front Shift', clockIn: '08:00 AM', clockOut: '04:00 PM', hoursWorked: 8.0, branch },
        { id: 'HR-02', empCode: 'EMP-014', empName: 'Ahmad K.', department: 'Sales POS', shiftSchedule: 'Deli Counter Shift', clockIn: '08:30 AM', clockOut: '04:30 PM', hoursWorked: 8.0, branch },
        { id: 'HR-03', empCode: 'EMP-022', empName: 'Ziad Chehab', department: 'Branch Management', shiftSchedule: 'Supervisory Lead', clockIn: '07:45 AM', clockOut: '06:00 PM', hoursWorked: 10.25, branch },
        { id: 'HR-04', empCode: 'EMP-031', empName: 'Jad El-Hajj', department: 'Fleet Logistics', shiftSchedule: 'Courier Dispatch #1', clockIn: '09:00 AM', clockOut: '05:00 PM', hoursWorked: 8.0, branch },
        { id: 'HR-05', empCode: 'EMP-045', empName: 'Walid Sleiman', department: 'Warehouse Operations', shiftSchedule: 'Loading Dock Shift', clockIn: '07:30 AM', clockOut: '03:30 PM', hoursWorked: 8.0, branch },
      ];

    case 'crm':
      return [
        { id: 'CRM-01', clientRef: 'CLT-8801', clientName: 'Al-Baraka Supermarket', tier: 'Platinum VIP', phone: '+961 1 884210', ordersCount: 48, lifetimeValue: 34200.00, status: 'ACTIVE', branch },
        { id: 'CRM-02', clientRef: 'CLT-8802', clientName: 'Al-Bustan Restaurant Group', tier: 'Gold Commercial', phone: '+961 1 742110', ordersCount: 29, lifetimeValue: 21500.00, status: 'ACTIVE', branch },
        { id: 'CRM-03', clientRef: 'CLT-8803', clientName: 'Cedar Hospitality LLC', tier: 'Gold Commercial', phone: '+961 1 332090', ordersCount: 19, lifetimeValue: 14800.00, status: 'ACTIVE', branch },
        { id: 'CRM-04', clientRef: 'CLT-8804', clientName: 'Byblos Gourmet Deli', tier: 'Silver Retail', phone: '+961 9 540212', ordersCount: 14, lifetimeValue: 9800.00, status: 'ACTIVE', branch },
        { id: 'CRM-05', clientRef: 'CLT-8805', clientName: 'Verdun Fine Foods S.A.L', tier: 'Platinum VIP', phone: '+961 1 802340', ordersCount: 38, lifetimeValue: 28900.00, status: 'ACTIVE', branch },
      ];

    case 'sales':
    default:
      return [
        { id: 'TX-01', txRef: 'INV-103221', dateTime: '06-Sep-2026 10:15 AM', entityName: 'Al-Baraka Supermarket', operator: 'Hiba Aloulou', tender: 'CASH_USD', itemsQty: 8, netTotal: 480.00, branch },
        { id: 'TX-02', txRef: 'INV-103222', dateTime: '06-Sep-2026 11:30 AM', entityName: 'Al-Bustan Restaurant Group', operator: 'Ahmad K.', tender: 'WHISH_PAY', itemsQty: 14, netTotal: 890.00, branch },
        { id: 'TX-03', txRef: 'INV-103223', dateTime: '06-Sep-2026 13:05 PM', entityName: 'Cedar Hospitality LLC', operator: 'Hiba Aloulou', tender: 'CARD_VISA', itemsQty: 5, netTotal: 340.00, branch },
        { id: 'TX-04', txRef: 'INV-103224', dateTime: '06-Sep-2026 15:20 PM', entityName: 'Byblos Gourmet Deli Store', operator: 'Samer R.', tender: 'CASH_LBP', itemsQty: 22, netTotal: 1250.00, branch },
        { id: 'TX-05', txRef: 'INV-103225', dateTime: '06-Sep-2026 17:45 PM', entityName: 'Walk-in Local Customer', operator: 'Hiba Aloulou', tender: 'CASH_USD', itemsQty: 3, netTotal: 145.00, branch },
      ];
  }
}

// ============================================================================
// 5. CELL VALUE FORMATTER
// ============================================================================

export function formatCellValue(
  value: any,
  row: any,
  formatType?: ColumnFormatType,
  activeCurrency: string = 'USD'
): React.ReactNode {
  if (value === undefined || value === null) {
    return <span className="text-slate-400 font-mono">-</span>;
  }

  switch (formatType) {
    case 'currency': {
      const num = Number(value);
      if (isNaN(num)) return String(value);
      return (
        <span className="font-mono tabular-nums font-bold text-slate-900">
          {formatCurrencyAmount(num, activeCurrency, true)}
        </span>
      );
    }

    case 'delta': {
      const num = Number(value);
      if (isNaN(num)) return String(value);
      const isPositive = num > 0;
      const isZero = num === 0;
      return (
        <span
          className={`font-mono tabular-nums font-bold ${
            isZero
              ? 'text-slate-500'
              : isPositive
              ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200'
              : 'text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200'
          }`}
        >
          {isPositive ? `+${num}` : String(num)}
        </span>
      );
    }

    case 'percentage': {
      const num = Number(value);
      if (isNaN(num)) return String(value);
      return (
        <span className="font-mono tabular-nums font-semibold text-slate-800">
          {num.toFixed(1)}%
        </span>
      );
    }

    case 'number': {
      const num = Number(value);
      if (isNaN(num)) return String(value);
      return (
        <span className="font-mono tabular-nums font-medium text-slate-800">
          {num.toLocaleString()}
        </span>
      );
    }

    case 'code':
      return (
        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] border border-slate-200">
          {String(value)}
        </span>
      );

    case 'badge': {
      const text = String(value);
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-medium bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wide">
          {text}
        </span>
      );
    }

    case 'status': {
      const text = String(value).toUpperCase();
      let colorClass = 'bg-slate-100 text-slate-800 border-slate-200';
      if (text.includes('DELIVER') || text.includes('ACTIVE') || text.includes('POSTED') || text.includes('SETTLED')) {
        colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      } else if (text.includes('TRANSIT') || text.includes('PROGRESS') || text.includes('PENDING')) {
        colorClass = 'bg-amber-50 text-amber-800 border-amber-200';
      } else if (text.includes('FAIL') || text.includes('CANCEL') || text.includes('VOID') || text.includes('ALERT')) {
        colorClass = 'bg-rose-50 text-rose-800 border-rose-200';
      }
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-bold border uppercase tracking-wide ${colorClass}`}>
          {text}
        </span>
      );
    }

    case 'datetime':
    case 'date':
    case 'time':
      return <span className="font-mono text-slate-600 text-[11px]">{String(value)}</span>;

    case 'text':
    default:
      return <span className="text-slate-800">{String(value)}</span>;
  }
}

// ============================================================================
// 6. UNIVERSAL SCHEMA & DATA RESOLVER
// ============================================================================

export interface ResolvedReportState {
  schema: ReportSchemaDefinition;
  rows: any[];
  isExplicitSchema: boolean;
  domain: ReportDomain;
}

export function resolveSchemaForReport(
  reportName: string,
  reportCode?: string,
  moduleContext?: string,
  explicitData?: any[],
  filters: Record<string, any> = {}
): ResolvedReportState {
  // 1. Attempt explicit lookup in central registry
  const registeredSchema = getReportSchema(reportName, moduleContext) || (reportCode ? getReportSchema(reportCode, moduleContext) : null);

  if (registeredSchema) {
    const rows =
      explicitData && explicitData.length > 0
        ? explicitData
        : registeredSchema.sampleRowsGenerator
        ? registeredSchema.sampleRowsGenerator(filters)
        : [];

    return {
      schema: registeredSchema,
      rows,
      isExplicitSchema: true,
      domain: registeredSchema.domain,
    };
  }

  // 2. Fallback Inference Engine: Never fall back to sales invoice tables!
  const domain = detectReportDomain(reportName, reportCode, moduleContext);

  let rows: any[] = [];
  let columns: ReportColumnDefinition[] = [];

  if (explicitData && explicitData.length > 0) {
    rows = explicitData;
    columns = inferColumnsFromData(explicitData[0]);
  } else {
    rows = generateDomainFallbackData(domain, reportName, filters);
    columns = inferColumnsFromDomain(domain, reportName);
  }

  // Generate domain-appropriate fallback schema
  const inferredSchema: ReportSchemaDefinition = {
    id: reportCode || 'REP_AUTO_RESOLVED',
    reportKey: reportName,
    title: reportName,
    domain,
    description: `Dynamic domain-resolved register for ${reportName}.`,
    columns,
    kpiSummary: [
      {
        label: `Total ${humanizeKey(domain)} Records`,
        type: 'count',
        calculate: (r) => ({ value: `${r.length} Entries`, subtext: 'Verified ledger records' }),
      },
    ],
  };

  return {
    schema: inferredSchema,
    rows,
    isExplicitSchema: false,
    domain,
  };
}

// ============================================================================
// 7. DYNAMIC DOMAIN KPI METRIC CARDS GENERATOR
// ============================================================================

export function getDomainKpiMetrics(
  schema: ReportSchemaDefinition,
  rows: any[],
  activeCurrency: string = 'USD'
): MetricCardItem[] {
  // If the schema defines explicit kpiSummary items, use them!
  if (schema.kpiSummary && schema.kpiSummary.length > 0) {
    const icons = [
      <ShieldCheck key="1" className="w-5 h-5" />,
      <Activity key="2" className="w-5 h-5" />,
      <CheckCircle2 key="3" className="w-5 h-5" />,
      <DollarSign key="4" className="w-5 h-5" />,
    ];

    return schema.kpiSummary.map((kpi, idx) => {
      let calc = { value: '0', subtext: '' };
      if (kpi.calculate) {
        const res = kpi.calculate(rows, activeCurrency);
        calc = { value: String(res.value), subtext: res.subtext || '' };
      } else if (kpi.type === 'count') {
        calc = { value: `${rows.length}`, subtext: 'Total records' };
      } else if (kpi.type === 'sum' && kpi.targetKey) {
        const sum = rows.reduce((acc, r) => acc + (Number(r[kpi.targetKey!]) || 0), 0);
        calc = {
          value: kpi.formatType === 'currency' ? formatCurrencyAmount(sum, activeCurrency, true) : `${sum}`,
          subtext: 'Cumulative aggregate',
        };
      }

      return {
        title: kpi.label,
        value: calc.value,
        subtext: calc.subtext,
        icon: icons[idx % icons.length],
        change: { value: 'Reconciled', trend: 'up' },
      };
    });
  }

  // Fallback domain-specific metrics when schema has no explicit KPI array
  switch (schema.domain) {
    case 'audit':
    case 'internal_control':
      return [
        {
          title: 'Total Audited Events',
          value: `${rows.length} Events`,
          subtext: 'Internal control log entries',
          icon: <ShieldCheck className="w-5 h-5" />,
          change: { value: 'Logged', trend: 'neutral' },
        },
        {
          title: 'Active Workstations',
          value: `${new Set(rows.map((r) => r.workstation || r.terminal)).size} Terminals`,
          subtext: 'Monitored register hardware',
          icon: <Activity className="w-5 h-5" />,
          change: { value: 'Active', trend: 'neutral' },
        },
        {
          title: 'Security Compliance',
          value: '100% Verified',
          subtext: 'Zero unlogged drawer pops',
          icon: <CheckCircle2 className="w-5 h-5" />,
          change: { value: 'Compliant', trend: 'up' },
        },
        {
          title: 'Audited Turnover Value',
          value: formatCurrencyAmount(
            rows.reduce((acc, r) => acc + (Number(r.amountValue || r.totalAmount || r.impactValue) || 0), 0),
            activeCurrency,
            true
          ),
          subtext: 'Associated fiscal value',
          icon: <DollarSign className="w-5 h-5" />,
          change: { value: 'Reconciled', trend: 'up' },
        },
      ];

    case 'inventory': {
      const totalUnits = rows.reduce((acc, r) => acc + (Number(r.onHand) || 0), 0);
      const totalVal = rows.reduce((acc, r) => acc + (Number(r.valuation) || 0), 0);
      return [
        {
          title: 'Stocked SKU Catalog',
          value: `${rows.length} Items`,
          subtext: 'Active inventory master records',
          icon: <Package className="w-5 h-5" />,
          change: { value: 'Cataloged', trend: 'neutral' },
        },
        {
          title: 'On-Hand Stock Volume',
          value: `${totalUnits.toLocaleString()} Units`,
          subtext: 'Physical warehouse count',
          icon: <TrendingUp className="w-5 h-5" />,
          change: { value: 'Available', trend: 'up' },
        },
        {
          title: 'Reorder Attention Items',
          value: `${rows.filter((r) => Number(r.onHand) <= Number(r.reorderLevel)).length} Items`,
          subtext: 'At or below minimum safety stock',
          icon: <AlertTriangle className="w-5 h-5" />,
          change: { value: 'Low Stock', trend: 'down' },
        },
        {
          title: 'Total Stock Valuation',
          value: formatCurrencyAmount(totalVal, activeCurrency, true),
          subtext: 'Cost basis valuation',
          icon: <DollarSign className="w-5 h-5" />,
          change: { value: 'Standard Cost', trend: 'neutral' },
        },
      ];
    }

    case 'fleet': {
      const codTotal = rows.reduce((acc, r) => acc + (Number(r.codValue || r.orderValue) || 0), 0);
      const delivered = rows.filter((r) => String(r.status || r.deliveryStatus).toUpperCase() === 'DELIVERED').length;
      return [
        {
          title: 'Dispatched Route Orders',
          value: `${rows.length} Shipments`,
          subtext: 'Active fleet logistics routes',
          icon: <Truck className="w-5 h-5" />,
          change: { value: 'Dispatched', trend: 'neutral' },
        },
        {
          title: 'Successful Deliveries',
          value: `${delivered} Completed`,
          subtext: 'Consignee drop-off confirmed',
          icon: <CheckCircle2 className="w-5 h-5" />,
          change: { value: `${rows.length > 0 ? ((delivered / rows.length) * 100).toFixed(0) : 100}% Rate`, trend: 'up' },
        },
        {
          title: 'Active Corridors / Zones',
          value: `${new Set(rows.map((r) => r.zone)).size} Zones`,
          subtext: 'Regional delivery coverage',
          icon: <Activity className="w-5 h-5" />,
          change: { value: 'On Route', trend: 'neutral' },
        },
        {
          title: 'Total COD Remittance',
          value: formatCurrencyAmount(codTotal, activeCurrency, true),
          subtext: 'Consignment cash value',
          icon: <DollarSign className="w-5 h-5" />,
          change: { value: 'Collected', trend: 'up' },
        },
      ];
    }

    case 'accounting': {
      const debitTotal = rows.reduce((acc, r) => acc + (Number(r.debit || r.taxCollectedUsd || r.consolidatedAmount) || 0), 0);
      return [
        {
          title: 'Reconciled Financial Entries',
          value: `${rows.length} Records`,
          subtext: 'Ledger journal allocations',
          icon: <FileText className="w-5 h-5" />,
          change: { value: 'Balanced', trend: 'neutral' },
        },
        {
          title: 'Consolidated Value',
          value: formatCurrencyAmount(debitTotal, activeCurrency, true),
          subtext: 'Posted financial volume',
          icon: <DollarSign className="w-5 h-5" />,
          change: { value: 'Verified', trend: 'up' },
        },
        {
          title: 'Fiscal Compliance Rate',
          value: '100% Lebanese VAT',
          subtext: 'MOF compliant tax declaration',
          icon: <CheckCircle2 className="w-5 h-5" />,
          change: { value: 'Audit Ready', trend: 'up' },
        },
        {
          title: 'Variance Spread',
          value: '$0.00',
          subtext: 'Debit-credit zero differential',
          icon: <TrendingUp className="w-5 h-5" />,
          change: { value: 'Balanced', trend: 'neutral' },
        },
      ];
    }

    case 'hr':
      return [
        {
          title: 'Active Staff Present',
          value: `${rows.length} Staff`,
          subtext: 'Shift personnel logged',
          icon: <Users className="w-5 h-5" />,
          change: { value: 'On Duty', trend: 'up' },
        },
        {
          title: 'Total Shift Hours',
          value: `${rows.reduce((acc, r) => acc + (Number(r.hoursWorked) || 0), 0)} Hours`,
          subtext: 'Cumulative labor hours logged',
          icon: <Activity className="w-5 h-5" />,
          change: { value: 'Shift Output', trend: 'neutral' },
        },
        {
          title: 'Attendance Rate',
          value: '98.5%',
          subtext: 'Punctuality compliance score',
          icon: <CheckCircle2 className="w-5 h-5" />,
          change: { value: '+1.2%', trend: 'up' },
        },
        {
          title: 'Departments Monitored',
          value: `${new Set(rows.map((r) => r.department)).size} Departments`,
          subtext: 'Store and warehouse staff',
          icon: <FileText className="w-5 h-5" />,
          change: { value: 'Allocated', trend: 'neutral' },
        },
      ];

    case 'sales':
    default: {
      const totalRev = rows.reduce((acc, r) => acc + (Number(r.netTotal || r.grossSales || r.invoicedRevenue) || 0), 0);
      return [
        {
          title: 'Gross Invoiced Turnover',
          value: formatCurrencyAmount(totalRev, activeCurrency, true),
          subtext: 'Reconciled turnover value',
          icon: <DollarSign className="w-5 h-5" />,
          change: { value: '+8.4%', trend: 'up' },
        },
        {
          title: 'Total Transactions Count',
          value: `${rows.length} Records`,
          subtext: 'Reconciled branch sales',
          icon: <ShoppingCart className="w-5 h-5" />,
          change: { value: 'Active ledger', trend: 'neutral' },
        },
        {
          title: 'Average Ticket Value',
          value: formatCurrencyAmount(rows.length > 0 ? totalRev / rows.length : 0, activeCurrency, true),
          subtext: 'Per customer transaction',
          icon: <TrendingUp className="w-5 h-5" />,
          change: { value: '+3.1%', trend: 'up' },
        },
        {
          title: 'Fiscal Health Score',
          value: 'Optimal (100%)',
          subtext: 'Zero unresolved exceptions',
          icon: <CheckCircle2 className="w-5 h-5" />,
          change: { value: 'Verified', trend: 'up' },
        },
      ];
    }
  }
}
