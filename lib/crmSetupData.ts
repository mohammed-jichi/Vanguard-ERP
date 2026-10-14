/**
 * Unified CRM & Customers Sub-Modules Service
 * Provides persistent storage and synchronization for:
 * 1. Wholesale Accounts (Account Code, Business Name, Contact Person, Phone, Territory/Zone, Credit Limit, Payment Terms, Price Tier, Status)
 * 2. Zones & Territories (Zone Code, Zone Name, Assigned Salesman, Delivery Provider/Fleet, Active Customers Count, Status)
 * 3. Customer Categories (Category Code, Category Name, Default Price List, Default Discount %, Tax Exempt, Status)
 *
 * Persistent Storage:
 * - Supabase tenants.feature_flags: crm_wholesale_accounts, crm_zones_territories, crm_customer_categories
 * - LocalStorage cache: vanguard_crm_wholesale_v1, vanguard_crm_zones_v1, vanguard_crm_categories_v1
 * - Cross-window & cross-component real-time sync event: 'vanguard_crm_updated'
 */

import { supabase } from '@/lib/supabaseClient';

export interface WholesaleAccountRecord {
  id: string;
  accountCode: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  territoryZone: string;
  creditLimitUsd: number;
  paymentTerms: string;
  priceTier: string;
  status: 'Active' | 'On Hold' | 'Inactive';
}

export interface ZoneTerritoryRecord {
  id: string;
  zoneCode: string;
  zoneName: string;
  assignedSalesman: string;
  deliveryProvider: string;
  activeCustomersCount: number;
  status: 'Active' | 'Inactive';
}

export interface CustomerCategoryRecord {
  id: string;
  categoryCode: string;
  categoryName: string;
  defaultPriceList: 'Wholesale' | 'Retail' | 'HORECA' | 'Distributor';
  defaultDiscountPct: number;
  taxExempt: boolean;
  status: 'Active' | 'Inactive';
}

export const CRM_CACHE_KEY_WHOLESALE = 'vanguard_crm_wholesale_v1';
export const CRM_CACHE_KEY_ZONES = 'vanguard_crm_zones_v1';
export const CRM_CACHE_KEY_CATEGORIES = 'vanguard_crm_categories_v1';
export const CRM_UPDATED_EVENT = 'vanguard_crm_updated';

// Default Lebanese Distribution Seed Data
export const DEFAULT_CRM_WHOLESALE_ACCOUNTS: WholesaleAccountRecord[] = [
  {
    id: 'WHL-1001',
    accountCode: 'WHL-1001',
    companyName: 'Al-Baraka Supermarket & Distribution',
    contactPerson: 'Hassan Baraka',
    phone: '+961 1 820 440',
    territoryZone: 'Beirut Central & Metropolitan',
    creditLimitUsd: 15000,
    paymentTerms: 'Net 30',
    priceTier: 'Wholesale',
    status: 'Active'
  },
  {
    id: 'WHL-1002',
    accountCode: 'WHL-1002',
    companyName: 'Beirut Gourmet Food Emporium',
    contactPerson: 'Nour El-Khoury',
    phone: '+961 1 334 550',
    territoryZone: 'Beirut Central & Metropolitan',
    creditLimitUsd: 25000,
    paymentTerms: 'Net 45',
    priceTier: 'Wholesale Premium',
    status: 'Active'
  },
  {
    id: 'WHL-1003',
    accountCode: 'WHL-1003',
    companyName: 'Tyre & Saida Regional Co-op',
    contactPerson: 'Ali Mroueh',
    phone: '+961 7 740 122',
    territoryZone: 'South Lebanon (Saida, Tyre & Nabatieh)',
    creditLimitUsd: 12000,
    paymentTerms: 'Net 30',
    priceTier: 'Wholesale',
    status: 'Active'
  },
  {
    id: 'WHL-1004',
    accountCode: 'WHL-1004',
    companyName: 'Cedar Valley Organic Market',
    contactPerson: 'Marc Haddad',
    phone: '+961 9 912 300',
    territoryZone: 'Mount Lebanon North (Metn & Keserwan)',
    creditLimitUsd: 8000,
    paymentTerms: 'Net 15',
    priceTier: 'Wholesale',
    status: 'Active'
  },
  {
    id: 'WHL-1005',
    accountCode: 'WHL-1005',
    companyName: 'Phoenicia Luxury Resorts & Dining',
    contactPerson: 'Carla Tabet',
    phone: '+961 1 369 100',
    territoryZone: 'Beirut Central & Metropolitan',
    creditLimitUsd: 40000,
    paymentTerms: 'Net 60',
    priceTier: 'HORECA Wholesale',
    status: 'Active'
  },
  {
    id: 'WHL-1006',
    accountCode: 'WHL-1006',
    companyName: 'Zahle Agro-Wholesale Depot',
    contactPerson: 'Elias Maalouf',
    phone: '+961 8 801 990',
    territoryZone: 'Bekaa Valley (Zahle, Chtaura & Baalbek)',
    creditLimitUsd: 18000,
    paymentTerms: 'Net 30',
    priceTier: 'Wholesale',
    status: 'Active'
  }
];

export const DEFAULT_CRM_ZONES: ZoneTerritoryRecord[] = [
  {
    id: 'ZN-BEIRUT',
    zoneCode: 'ZN-BEIRUT',
    zoneName: 'Beirut Central & Metropolitan',
    assignedSalesman: 'Fadi Chemali',
    deliveryProvider: 'SuperSonic Fleet Management (Internal)',
    activeCustomersCount: 48,
    status: 'Active'
  },
  {
    id: 'ZN-MT-NORTH',
    zoneCode: 'ZN-MT-NORTH',
    zoneName: 'Mount Lebanon North (Metn & Keserwan)',
    assignedSalesman: 'Charbel Aoun',
    deliveryProvider: 'SuperSonic Fleet Management (Internal)',
    activeCustomersCount: 36,
    status: 'Active'
  },
  {
    id: 'ZN-MT-SOUTH',
    zoneCode: 'ZN-MT-SOUTH',
    zoneName: 'Mount Lebanon South (Chouf & Aley)',
    assignedSalesman: 'Walid Aridi',
    deliveryProvider: 'SuperSonic Fleet Management (Internal)',
    activeCustomersCount: 29,
    status: 'Active'
  },
  {
    id: 'ZN-SOUTH',
    zoneCode: 'ZN-SOUTH',
    zoneName: 'South Lebanon (Saida, Tyre & Nabatieh)',
    assignedSalesman: 'Hussein Zein',
    deliveryProvider: 'Aramex Lebanon International Cargo',
    activeCustomersCount: 33,
    status: 'Active'
  },
  {
    id: 'ZN-BEKAA',
    zoneCode: 'ZN-BEKAA',
    zoneName: 'Bekaa Valley (Zahle, Chtaura & Baalbek)',
    assignedSalesman: 'Jihad Rahme',
    deliveryProvider: 'SuperSonic Fleet Management (Internal)',
    activeCustomersCount: 25,
    status: 'Active'
  },
  {
    id: 'ZN-NORTH',
    zoneCode: 'ZN-NORTH',
    zoneName: 'North Lebanon (Tripoli, Koura & Batroun)',
    assignedSalesman: 'Tareq Dandashi',
    deliveryProvider: 'DHL Express Fresh Cargo Logistics',
    activeCustomersCount: 22,
    status: 'Active'
  }
];

export const DEFAULT_CRM_CATEGORIES: CustomerCategoryRecord[] = [
  {
    id: 'CAT-SUPERMARKET',
    categoryCode: 'CAT-SUPERMARKET',
    categoryName: 'Supermarkets & Hypermarkets',
    defaultPriceList: 'Wholesale',
    defaultDiscountPct: 12,
    taxExempt: false,
    status: 'Active'
  },
  {
    id: 'CAT-HORECA',
    categoryCode: 'CAT-HORECA',
    categoryName: 'HORECA (Hotels, Restaurants & Catering)',
    defaultPriceList: 'HORECA',
    defaultDiscountPct: 15,
    taxExempt: false,
    status: 'Active'
  },
  {
    id: 'CAT-COOP',
    categoryCode: 'CAT-COOP',
    categoryName: 'Regional Consumer & Agro Co-operatives',
    defaultPriceList: 'Wholesale',
    defaultDiscountPct: 8,
    taxExempt: true,
    status: 'Active'
  },
  {
    id: 'CAT-DISTRIBUTOR',
    categoryCode: 'CAT-DISTRIBUTOR',
    categoryName: 'Wholesale Sub-Distributors',
    defaultPriceList: 'Distributor',
    defaultDiscountPct: 20,
    taxExempt: false,
    status: 'Active'
  },
  {
    id: 'CAT-RETAIL',
    categoryCode: 'CAT-RETAIL',
    categoryName: 'Direct Retail & Walk-in Customers',
    defaultPriceList: 'Retail',
    defaultDiscountPct: 0,
    taxExempt: false,
    status: 'Active'
  },
  {
    id: 'CAT-INSTITUTION',
    categoryCode: 'CAT-INSTITUTION',
    categoryName: 'Governmental & Institutional Buyers',
    defaultPriceList: 'Wholesale',
    defaultDiscountPct: 5,
    taxExempt: true,
    status: 'Active'
  }
];

// Helper to sanitize tenant id
function resolveTenantId(tenantId?: string): string {
  if (tenantId && tenantId !== '1300' && !tenantId.startsWith('comp-')) {
    return tenantId;
  }
  return '00000000-0000-0000-0000-000000000001';
}

/* =========================================================================
   WHOLESALE ACCOUNTS PERSISTENCE
   ========================================================================= */

export async function fetchWholesaleAccounts(tenantId?: string): Promise<WholesaleAccountRecord[]> {
  const targetTenantId = resolveTenantId(tenantId);
  let list: WholesaleAccountRecord[] = [];

  // 1. Check LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CRM_CACHE_KEY_WHOLESALE);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading local wholesale accounts:', e);
    }
  }

  // 2. Try Supabase feature_flags
  try {
    const { data: tenantData, error } = await supabase
      .from('tenants')
      .select('feature_flags')
      .eq('id', targetTenantId)
      .maybeSingle();

    if (!error && tenantData?.feature_flags) {
      const flags = (tenantData.feature_flags as Record<string, any>) || {};
      if (Array.isArray(flags.crm_wholesale_accounts) && flags.crm_wholesale_accounts.length > 0) {
        const sbAccounts: WholesaleAccountRecord[] = flags.crm_wholesale_accounts;
        const currentIds = new Set(list.map(a => a.id));
        sbAccounts.forEach(item => {
          if (!currentIds.has(item.id)) {
            list.push(item);
          }
        });
      }
    }
  } catch (err) {
    console.warn('Error fetching wholesale accounts from Supabase:', err);
  }

  // 3. Fallback to default seeds if list is empty
  if (list.length === 0) {
    list = [...DEFAULT_CRM_WHOLESALE_ACCOUNTS];
  } else {
    // Ensure default seeds are present
    const currentCodes = new Set(list.map(a => a.accountCode.toLowerCase()));
    DEFAULT_CRM_WHOLESALE_ACCOUNTS.forEach(seed => {
      if (!currentCodes.has(seed.accountCode.toLowerCase())) {
        list.push(seed);
      }
    });
  }

  // 4. Update local cache
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CRM_CACHE_KEY_WHOLESALE, JSON.stringify(list));
    } catch {}
  }

  return list;
}

export async function persistWholesaleAccounts(
  accounts: WholesaleAccountRecord[],
  tenantId?: string
): Promise<{ success: boolean; error?: string }> {
  const targetTenantId = resolveTenantId(tenantId);

  // 1. Update local cache immediately
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CRM_CACHE_KEY_WHOLESALE, JSON.stringify(accounts));
      window.dispatchEvent(new CustomEvent(CRM_UPDATED_EVENT, { detail: { type: 'wholesale', accounts } }));
    } catch (e) {
      console.warn('Error saving wholesale accounts to localStorage:', e);
    }
  }

  // 2. Persist to Supabase feature_flags
  try {
    const { data: tenantData, error: readError } = await supabase
      .from('tenants')
      .select('feature_flags')
      .eq('id', targetTenantId)
      .maybeSingle();

    if (readError) {
      return { success: true };
    }

    const currentFlags = (tenantData?.feature_flags as Record<string, any>) || {};
    const updatedFlags = {
      ...currentFlags,
      crm_wholesale_accounts: accounts
    };

    const { error: writeError } = await supabase
      .from('tenants')
      .update({ feature_flags: updatedFlags })
      .eq('id', targetTenantId);

    if (writeError) {
      return { success: true, error: writeError.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: true, error: err.message };
  }
}

/* =========================================================================
   ZONES & TERRITORIES PERSISTENCE
   ========================================================================= */

export async function fetchZoneTerritories(tenantId?: string): Promise<ZoneTerritoryRecord[]> {
  const targetTenantId = resolveTenantId(tenantId);
  let list: ZoneTerritoryRecord[] = [];

  // 1. Check LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CRM_CACHE_KEY_ZONES);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading local zones:', e);
    }
  }

  // 2. Try Supabase feature_flags
  try {
    const { data: tenantData, error } = await supabase
      .from('tenants')
      .select('feature_flags')
      .eq('id', targetTenantId)
      .maybeSingle();

    if (!error && tenantData?.feature_flags) {
      const flags = (tenantData.feature_flags as Record<string, any>) || {};
      if (Array.isArray(flags.crm_zones_territories) && flags.crm_zones_territories.length > 0) {
        const sbZones: ZoneTerritoryRecord[] = flags.crm_zones_territories;
        const currentIds = new Set(list.map(z => z.id));
        sbZones.forEach(item => {
          if (!currentIds.has(item.id)) {
            list.push(item);
          }
        });
      }
    }
  } catch (err) {
    console.warn('Error fetching zones from Supabase:', err);
  }

  // 3. Fallback to default seeds if list is empty
  if (list.length === 0) {
    list = [...DEFAULT_CRM_ZONES];
  } else {
    // Ensure default seeds are present
    const currentCodes = new Set(list.map(z => z.zoneCode.toLowerCase()));
    DEFAULT_CRM_ZONES.forEach(seed => {
      if (!currentCodes.has(seed.zoneCode.toLowerCase())) {
        list.push(seed);
      }
    });
  }

  // 4. Update local cache
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CRM_CACHE_KEY_ZONES, JSON.stringify(list));
    } catch {}
  }

  return list;
}

export async function persistZoneTerritories(
  zones: ZoneTerritoryRecord[],
  tenantId?: string
): Promise<{ success: boolean; error?: string }> {
  const targetTenantId = resolveTenantId(tenantId);

  // 1. Update local cache immediately
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CRM_CACHE_KEY_ZONES, JSON.stringify(zones));
      window.dispatchEvent(new CustomEvent(CRM_UPDATED_EVENT, { detail: { type: 'zones', zones } }));
    } catch (e) {
      console.warn('Error saving zones to localStorage:', e);
    }
  }

  // 2. Persist to Supabase feature_flags
  try {
    const { data: tenantData, error: readError } = await supabase
      .from('tenants')
      .select('feature_flags')
      .eq('id', targetTenantId)
      .maybeSingle();

    if (readError) {
      return { success: true };
    }

    const currentFlags = (tenantData?.feature_flags as Record<string, any>) || {};
    const updatedFlags = {
      ...currentFlags,
      crm_zones_territories: zones
    };

    const { error: writeError } = await supabase
      .from('tenants')
      .update({ feature_flags: updatedFlags })
      .eq('id', targetTenantId);

    if (writeError) {
      return { success: true, error: writeError.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: true, error: err.message };
  }
}

/* =========================================================================
   CUSTOMER CATEGORIES PERSISTENCE
   ========================================================================= */

export async function fetchCustomerCategories(tenantId?: string): Promise<CustomerCategoryRecord[]> {
  const targetTenantId = resolveTenantId(tenantId);
  let list: CustomerCategoryRecord[] = [];

  // 1. Check LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CRM_CACHE_KEY_CATEGORIES);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading local categories:', e);
    }
  }

  // 2. Try Supabase feature_flags
  try {
    const { data: tenantData, error } = await supabase
      .from('tenants')
      .select('feature_flags')
      .eq('id', targetTenantId)
      .maybeSingle();

    if (!error && tenantData?.feature_flags) {
      const flags = (tenantData.feature_flags as Record<string, any>) || {};
      if (Array.isArray(flags.crm_customer_categories) && flags.crm_customer_categories.length > 0) {
        const sbCategories: CustomerCategoryRecord[] = flags.crm_customer_categories;
        const currentIds = new Set(list.map(c => c.id));
        sbCategories.forEach(item => {
          if (!currentIds.has(item.id)) {
            list.push(item);
          }
        });
      }
    }
  } catch (err) {
    console.warn('Error fetching categories from Supabase:', err);
  }

  // 3. Fallback to default seeds if list is empty
  if (list.length === 0) {
    list = [...DEFAULT_CRM_CATEGORIES];
  } else {
    // Ensure default seeds are present
    const currentCodes = new Set(list.map(c => c.categoryCode.toLowerCase()));
    DEFAULT_CRM_CATEGORIES.forEach(seed => {
      if (!currentCodes.has(seed.categoryCode.toLowerCase())) {
        list.push(seed);
      }
    });
  }

  // 4. Update local cache
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CRM_CACHE_KEY_CATEGORIES, JSON.stringify(list));
    } catch {}
  }

  return list;
}

export async function persistCustomerCategories(
  categories: CustomerCategoryRecord[],
  tenantId?: string
): Promise<{ success: boolean; error?: string }> {
  const targetTenantId = resolveTenantId(tenantId);

  // 1. Update local cache immediately
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CRM_CACHE_KEY_CATEGORIES, JSON.stringify(categories));
      window.dispatchEvent(new CustomEvent(CRM_UPDATED_EVENT, { detail: { type: 'categories', categories } }));
    } catch (e) {
      console.warn('Error saving categories to localStorage:', e);
    }
  }

  // 2. Persist to Supabase feature_flags
  try {
    const { data: tenantData, error: readError } = await supabase
      .from('tenants')
      .select('feature_flags')
      .eq('id', targetTenantId)
      .maybeSingle();

    if (readError) {
      return { success: true };
    }

    const currentFlags = (tenantData?.feature_flags as Record<string, any>) || {};
    const updatedFlags = {
      ...currentFlags,
      crm_customer_categories: categories
    };

    const { error: writeError } = await supabase
      .from('tenants')
      .update({ feature_flags: updatedFlags })
      .eq('id', targetTenantId);

    if (writeError) {
      return { success: true, error: writeError.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: true, error: err.message };
  }
}
