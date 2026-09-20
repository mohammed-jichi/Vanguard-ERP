/**
 * lib/customerDirectoryEngine.ts
 * ============================================================================
 * Central Customer Directory Engine for Vanguard ERP
 * 
 * Provides canonical customer listings, filter option generators,
 * and robust matching/normalization utilities for sales reporting.
 * ============================================================================
 */

export interface CustomerRecord {
  id: string;
  name: string;
  group?: string;
  branchId?: number;
}

export const CANONICAL_CUSTOMERS: CustomerRecord[] = [
  { id: 'CUST-001', name: 'Beirut Gourmet Market', group: 'RETAIL' },
  { id: 'CUST-002', name: 'Cedar Valley Wholesalers', group: 'WHOLESALE' },
  { id: 'CUST-003', name: 'Mount Lebanon Olive Traders', group: 'WHOLESALE' },
  { id: 'CUST-004', name: 'Phoenician Olive Oil House', group: 'KEY_ACCOUNTS' },
  { id: 'CUST-005', name: 'Byblos Gourmet Grocers', group: 'RETAIL' },
  { id: 'CUST-006', name: 'Tripoli Olive Press & Co', group: 'WHOLESALE' },
  { id: 'CUST-007', name: 'Al-Bustan Restaurant Group', group: 'HORECA' },
  { id: 'CUST-008', name: 'Beirut Olive House Wholesale', group: 'WHOLESALE' },
  { id: 'CUST-016', name: 'Mount Lebanon Kitchens', group: 'HORECA' },
  { id: 'CUST-017', name: 'Zahle Food Wholesalers', group: 'WHOLESALE' },
  { id: 'CUST-018', name: 'Chouf Artisan Olive Oil', group: 'KEY_ACCOUNTS' },
  { id: 'CUST-019', name: 'Batroun Coastal Foods', group: 'RETAIL' },
  { id: 'CUST-020', name: 'Chouf Cedar Provisions', group: 'RETAIL' },
  { id: 'CUST-021', name: 'Akkar Agricultural Guild', group: 'KEY_ACCOUNTS' },
  { id: 'CUST-022', name: 'Mediterranean Import Co (Paris)', group: 'KEY_ACCOUNTS' },
  { id: 'CUST-023', name: 'Sidon Agrarian Collective', group: 'WHOLESALE' },
  { id: 'CUST-024', name: 'European Delicacies Ltd', group: 'WHOLESALE' },
  { id: 'CUST-025', name: 'Jezzine Mountain Herbs', group: 'RETAIL' },
  { id: 'CUST-026', name: 'Phoenician Coast Hospitality', group: 'HORECA' },
  { id: 'CUST-027', name: 'Levant Fine Foods International', group: 'KEY_ACCOUNTS' },
];

/**
 * Returns options for Customer filter dropdowns.
 * Defaults to "All Customers" as the first option.
 */
export function getCustomerOptions(allLabel: string = 'All Customers'): { label: string; value: string }[] {
  const options = CANONICAL_CUSTOMERS.map((c) => ({
    label: c.name,
    value: c.name,
  }));

  return [{ label: allLabel, value: 'ALL' }, ...options];
}

/**
 * Determines whether a record's customer matches an active filter value.
 */
export function matchesCustomerFilter(recordCustomer?: any, filterCustomer?: any, recordCustId?: any): boolean {
  if (!filterCustomer || filterCustomer === 'ALL' || filterCustomer === 'all') {
    return true;
  }
  if (!recordCustomer && !recordCustId) {
    return false;
  }

  const cleanFilter = String(filterCustomer).trim().toLowerCase();
  const cleanRow = String(recordCustomer || '').trim().toLowerCase();
  const cleanId = String(recordCustId || '').trim().toLowerCase();

  if (cleanRow && (cleanFilter === cleanRow || cleanRow.includes(cleanFilter) || cleanFilter.includes(cleanRow))) {
    return true;
  }
  if (cleanId && (cleanFilter === cleanId || cleanId.includes(cleanFilter) || cleanFilter.includes(cleanId))) {
    return true;
  }

  // Check ID match against canonical directory
  const customerById = CANONICAL_CUSTOMERS.find(
    (c) => c.id.toLowerCase() === cleanFilter
  );
  if (customerById) {
    if (cleanRow && customerById.name.toLowerCase() === cleanRow) return true;
    if (cleanId && customerById.id.toLowerCase() === cleanId) return true;
  }

  // Check Name match against canonical directory
  const customerByName = CANONICAL_CUSTOMERS.find(
    (c) => c.name.toLowerCase() === cleanFilter
  );
  if (customerByName) {
    if (cleanId && customerByName.id.toLowerCase() === cleanId) return true;
    if (cleanRow && customerByName.name.toLowerCase() === cleanRow) return true;
  }

  return false;
}
