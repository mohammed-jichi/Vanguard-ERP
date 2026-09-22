/**
 * Vanguard ERP - Enterprise License & Permissions Provider (lib/license.ts)
 * Enforces unconditional full enterprise entitlement for Company #1300 (Southern Olive & Oil Products S.A.R.L)
 * and evaluates module access across tenants.
 */

export interface TenantLicenseDetails {
  licenseKey: string;
  licenseNumber: string;
  certificateId: string;
  authorizedEntity: string;
  tier: string;
  status: 'ACTIVE' | 'LICENSED_PERPETUAL';
  issuedAt: string;
  expiresAt: string;
  authorizedBy: string;
  digitalSignature: string;
  digitalSeal: string;
  maxUsers: string;
  maxBranches: string;
  maxTerminals: string;
  unlockedModules: string[];
}

export const ALL_CORE_MODULES = [
  'sales',
  'operations',
  'customers',
  'feedback',
  'loyalty',
  'accounting',
  'hr',
  'fleet',
  'social',
  'pressing-mill',
  'v-driver',
  'v-store',
  'pressing',
  'MODULE_PRESSING_MILL',
  'connect',
  'driver',
  'store'
] as const;

export const MODULE_ALIASES: Record<string, string[]> = {
  sales: ['sales', 'pos', 'sales_control', 'sales-control', 'v-pos'],
  pos: ['sales', 'pos', 'sales_control', 'sales-control', 'v-pos'],
  'v-pos': ['sales', 'pos', 'sales_control', 'sales-control', 'v-pos'],
  operations: ['operations', 'op', 'inventory', 'warehouse', 'operations_center', 'operations-center'],
  op: ['operations', 'op', 'inventory', 'warehouse', 'operations_center', 'operations-center'],
  inventory: ['operations', 'op', 'inventory', 'warehouse', 'operations_center', 'operations-center'],
  customers: ['customers', 'cust', 'crm', 'customer_management', 'customer-management'],
  cust: ['customers', 'cust', 'crm', 'customer_management', 'customer-management'],
  feedback: ['feedback', 'surveys', 'feedback_surveys', 'feedback-surveys'],
  loyalty: ['loyalty', 'loyalty_management', 'loyalty-management', 'rewards'],
  accounting: ['accounting', 'acc', 'finance', 'financials'],
  acc: ['accounting', 'acc', 'finance', 'financials'],
  hr: ['hr', 'human_resources', 'human-resources', 'payroll', 'personnel'],
  fleet: ['fleet', 'supersonic', 'logistics', 'vtrack'],
  supersonic: ['fleet', 'supersonic', 'logistics', 'vtrack'],
  social: ['social', 'social_crm', 'social-crm', 'support', 'omnichannel', 'connect', 'v-connect'],
  connect: ['social', 'social_crm', 'social-crm', 'support', 'omnichannel', 'connect', 'v-connect'],
  'v-connect': ['social', 'social_crm', 'social-crm', 'support', 'omnichannel', 'connect', 'v-connect'],
  'pressing-mill': ['pressing', 'pressing_mill', 'pressing-mill', 'module_pressing_mill', 'olive_press', 'mill'],
  pressing: ['pressing', 'pressing_mill', 'pressing-mill', 'module_pressing_mill', 'olive_press', 'mill'],
  module_pressing_mill: ['pressing', 'pressing_mill', 'pressing-mill', 'module_pressing_mill', 'olive_press', 'mill'],
  'v-driver': ['v-driver', 'driver', 'supersonic', 'fleet'],
  driver: ['v-driver', 'driver', 'supersonic', 'fleet'],
  'v-store': ['v-store', 'store', 'storefront', 'landing', 'orders'],
  store: ['v-store', 'store', 'storefront', 'landing', 'orders']
};

/**
 * Checks if a tenant object or company identifier corresponds to Company #1300
 * (Southern Olive Oil Products S.A.R.L - Master Enterprise Tenant)
 */
export function isCompany1300(tenant?: any): boolean {
  if (!tenant) return true; // Default system context is Master Company #1300
  if (typeof tenant === 'number') return tenant === 1300;
  if (typeof tenant === 'string') {
    return tenant === '1300' || tenant === '00000000-0000-0000-0000-000000000001' || tenant === 'southern-olive';
  }

  const cid = tenant.companyId || tenant.company_id;
  if (cid === 1300 || cid === '1300') return true;
  if (tenant.id === '00000000-0000-0000-0000-000000000001') return true;
  if (tenant.slug === 'southern-olive') return true;
  if (typeof tenant.name === 'string' && tenant.name.toLowerCase().includes('southern olive')) return true;

  return false;
}

/**
 * Verifies if a specific module is licensed and enabled for the given tenant.
 * Company #1300 has unconditional full enterprise entitlement where ALL modules return true.
 */
export function isModuleLicensed(tenant: any, moduleKey: string): boolean {
  // 1. Company #1300 auto-grant: unconditional full enterprise entitlement
  if (isCompany1300(tenant)) {
    return true;
  }

  // 2. Enterprise subscription tier auto-grant
  if (tenant?.subscriptionTier === 'ENTERPRISE') {
    return true;
  }

  // 3. Fallback to full access if no restrictions configured
  const modules = tenant?.enabledModules || tenant?.enabled_modules;
  if (!modules || !Array.isArray(modules) || modules.length === 0) {
    return true;
  }

  // 4. Match against alias map
  const lowerKey = moduleKey.toLowerCase();
  const targetList = MODULE_ALIASES[lowerKey] || [lowerKey];
  return modules.some((m: string) => targetList.includes(m.toLowerCase()));
}
