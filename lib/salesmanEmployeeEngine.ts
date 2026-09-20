/**
 * lib/salesmanEmployeeEngine.ts
 * ============================================================================
 * Central Salesman & Employee Reporting Engine for Vanguard ERP
 * 
 * Provides canonical employee listings, filter option generators,
 * and robust matching/normalization utilities for staff reporting.
 * ============================================================================
 */

import { SALESMAN_MAPPINGS, normalizeFilterToken } from './reportFilterEngine';

export interface SalesmanEmployee {
  id: string;
  name: string;
  code: string;
  role: string;
  department?: string;
  branchId?: number;
}

export const CANONICAL_SALESMEN_EMPLOYEES: SalesmanEmployee[] = [
  {
    id: 'EMP_AHMAD',
    name: 'Ahmad Al-Hajj',
    code: 'REP_001',
    role: 'Senior Sales Representative / Cashier',
    department: 'Sales & POS',
    branchId: 1,
  },
  {
    id: 'EMP_MAYA',
    name: 'Maya Khoury',
    code: 'REP_002',
    role: 'Corporate Accounts Manager / Cashier',
    department: 'Commercial Accounts',
    branchId: 1,
  },
  {
    id: 'EMP_JAD',
    name: 'Jad Tannous',
    code: 'REP_003',
    role: 'Regional Wholesale Supervisor / Cashier',
    department: 'Wholesale & Distribution',
    branchId: 2,
  },
  {
    id: 'EMP_RANIA',
    name: 'Rania Eid',
    code: 'REP_004',
    role: 'Commercial Supervisor / Cashier',
    department: 'Commercial Retail',
    branchId: 1,
  },
  {
    id: 'EMP_ZIAD',
    name: 'Ziad Chehab',
    code: 'REP_005',
    role: 'Key Account Manager / Cashier',
    department: 'Export & Key Accounts',
    branchId: 1,
  },
  {
    id: 'EMP_NOUR',
    name: 'Nour Saliba',
    code: 'EMP_006',
    role: 'Front-desk Cashier & Dispatcher',
    department: 'Front Desk / POS',
    branchId: 1,
  },
  {
    id: 'EMP_WALID',
    name: 'Walid Sleiman',
    code: 'EMP_007',
    role: 'Logistics Coordinator & Cashier',
    department: 'Warehouse & Logistics',
    branchId: 2,
  },
];

/**
 * Returns options for Employee / Cashier filter dropdowns.
 * Defaults to "All Employees" as the first option.
 */
export function getSalesmanEmployeeOptions(allLabel: string = 'All Employees'): { label: string; value: string }[] {
  const options = CANONICAL_SALESMEN_EMPLOYEES.map((emp) => ({
    label: emp.name,
    value: emp.id,
  }));

  return [{ label: allLabel, value: 'ALL' }, ...options];
}

/**
 * Returns options for Salesman / Rep filter dropdowns.
 */
export function getSalesmanFilterOptions(allLabel: string = 'All Salesmen'): { label: string; value: string }[] {
  const options = CANONICAL_SALESMEN_EMPLOYEES.filter((emp) => emp.code.startsWith('REP_')).map((emp) => ({
    label: `${emp.name} (${emp.role.split('/')[0].trim()})`,
    value: emp.id,
  }));

  return [{ label: allLabel, value: 'ALL' }, ...options];
}

/**
 * Normalizes an employee input name or code to a canonical display name.
 */
export function resolveCanonicalEmployeeName(input?: string): string {
  if (!input) return 'Staff';
  const clean = String(input).trim();
  const token = normalizeFilterToken(clean);

  // 1. Direct match by id or code
  const direct = CANONICAL_SALESMEN_EMPLOYEES.find(
    (e) => e.id.toLowerCase() === token.toLowerCase() || e.code.toLowerCase() === token.toLowerCase()
  );
  if (direct) return direct.name;

  // 2. Lookup in SALESMAN_MAPPINGS
  if (SALESMAN_MAPPINGS[token]) {
    return SALESMAN_MAPPINGS[token];
  }

  // 3. Substring match
  const sub = CANONICAL_SALESMEN_EMPLOYEES.find((e) =>
    e.name.toLowerCase().includes(clean.toLowerCase()) || clean.toLowerCase().includes(e.name.toLowerCase())
  );
  if (sub) return sub.name;

  return clean;
}

/**
 * Determines whether a record's employee/cashier/salesman matches an active filter value.
 */
export function matchesEmployeeFilter(recordEmployee?: any, filterEmployee?: any): boolean {
  if (!filterEmployee || filterEmployee === 'ALL' || filterEmployee === 'all') {
    return true;
  }
  if (!recordEmployee && recordEmployee !== 0) {
    return false;
  }

  const cleanFilter = String(filterEmployee).trim().toLowerCase();
  const cleanRow = String(recordEmployee).trim().toLowerCase();
  const filterSlug = normalizeFilterToken(filterEmployee);
  const rowSlug = normalizeFilterToken(recordEmployee);

  // Exact token match
  if (cleanFilter === cleanRow || filterSlug === rowSlug) {
    return true;
  }

  // Canonical names resolution
  const canonicalFilter = resolveCanonicalEmployeeName(filterEmployee).toLowerCase();
  const canonicalRow = resolveCanonicalEmployeeName(recordEmployee).toLowerCase();

  if (canonicalFilter === canonicalRow) {
    return true;
  }

  // Check substring containment
  if (canonicalRow.includes(cleanFilter) || cleanFilter.includes(canonicalRow)) {
    return true;
  }
  if (cleanRow.includes(cleanFilter) || cleanFilter.includes(cleanRow)) {
    return true;
  }

  // Check ID mapping (e.g. EMP_AHMAD vs Ahmad Al-Hajj)
  const empById = CANONICAL_SALESMEN_EMPLOYEES.find(
    (e) => e.id.toLowerCase() === filterSlug || e.code.toLowerCase() === filterSlug
  );
  if (empById && empById.name.toLowerCase() === canonicalRow) {
    return true;
  }

  return false;
}
