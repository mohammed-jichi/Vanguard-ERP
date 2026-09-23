/**
 * Vanguard ERP - Enterprise License & Permissions Provider (lib/license.ts)
 * Enforces unconditional full enterprise entitlement for Company #1300 (Southern Olive & Oil Products S.A.R.L)
 * and evaluates module access across tenants.
 */

import { checkModuleEnabled } from './TenantContext';

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
  'purchasing',
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
  sales: ['sales', 'pos', 'sales_control', 'sales-control', 'v-pos', 'sale', 'counter'],
  pos: ['sales', 'pos', 'sales_control', 'sales-control', 'v-pos', 'sale', 'counter'],
  'v-pos': ['sales', 'pos', 'sales_control', 'sales-control', 'v-pos', 'sale', 'counter'],
  operations: ['operations', 'op', 'inventory', 'warehouse', 'operations_center', 'operations-center', 'stock'],
  op: ['operations', 'op', 'inventory', 'warehouse', 'operations_center', 'operations-center', 'stock'],
  inventory: ['operations', 'op', 'inventory', 'warehouse', 'operations_center', 'operations-center', 'stock'],
  purchasing: ['purchasing', 'procurement', 'purchases', 'purchase', 'po'],
  procurement: ['purchasing', 'procurement', 'purchases', 'purchase', 'po'],
  purchases: ['purchasing', 'procurement', 'purchases', 'purchase', 'po'],
  customers: ['customers', 'cust', 'crm', 'customer_management', 'customer-management', 'clients'],
  cust: ['customers', 'cust', 'crm', 'customer_management', 'customer-management', 'clients'],
  crm: ['customers', 'cust', 'crm', 'customer_management', 'customer-management', 'clients'],
  feedback: ['feedback', 'surveys', 'feedback_surveys', 'feedback-surveys', 'csat', 'survey', 'reviews'],
  loyalty: ['loyalty', 'loyalty_management', 'loyalty-management', 'rewards', 'merits', 'points'],
  accounting: ['accounting', 'acc', 'finance', 'financials', 'gl', 'ledger'],
  acc: ['accounting', 'acc', 'finance', 'financials', 'gl', 'ledger'],
  hr: ['hr', 'human_resources', 'human-resources', 'payroll', 'personnel', 'attendance'],
  fleet: ['fleet', 'supersonic', 'logistics', 'vtrack', 'v-driver', 'driver', 'dispatch'],
  supersonic: ['fleet', 'supersonic', 'logistics', 'vtrack', 'v-driver', 'driver', 'dispatch'],
  'v-driver': ['fleet', 'supersonic', 'logistics', 'vtrack', 'v-driver', 'driver', 'dispatch'],
  driver: ['fleet', 'supersonic', 'logistics', 'vtrack', 'v-driver', 'driver', 'dispatch'],
  social: ['social', 'social_crm', 'social-crm', 'support', 'omnichannel', 'connect', 'v-connect', 'whatsapp'],
  connect: ['social', 'social_crm', 'social-crm', 'support', 'omnichannel', 'connect', 'v-connect', 'whatsapp'],
  'v-connect': ['social', 'social_crm', 'social-crm', 'support', 'omnichannel', 'connect', 'v-connect', 'whatsapp'],
  'pressing-mill': ['pressing', 'pressing_mill', 'pressing-mill', 'module_pressing_mill', 'olive_press', 'mill'],
  pressing: ['pressing', 'pressing_mill', 'pressing-mill', 'module_pressing_mill', 'olive_press', 'mill'],
  module_pressing_mill: ['pressing', 'pressing_mill', 'pressing-mill', 'module_pressing_mill', 'olive_press', 'mill'],
  'v-store': ['v-store', 'store', 'storefront', 'landing', 'orders', 'ecommerce', 'online-orders'],
  store: ['v-store', 'store', 'storefront', 'landing', 'orders', 'ecommerce', 'online-orders']
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
 * Evaluates active enabled_modules array if configured, with enterprise fallbacks.
 */
export function isModuleLicensed(tenant: any, moduleKey: string): boolean {
  // 1. If explicit enabled modules are configured, enforce strict entitlement guard
  const modules = tenant?.enabled_modules || tenant?.enabledModules;
  if (Array.isArray(modules) && modules.length > 0) {
    return checkModuleEnabled(moduleKey, modules);
  }

  // 2. Company #1300 default enterprise entitlement fallback
  if (isCompany1300(tenant)) {
    return true;
  }

  // 3. Enterprise subscription tier default fallback
  if (tenant?.subscriptionTier === 'ENTERPRISE') {
    return true;
  }

  // 4. Default fallback
  return true;
}
