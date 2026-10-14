/**
 * Unified Delivery Providers & Aggregators Service
 * Synchronizes carriers between:
 * 1. Setup -> More -> Delivery Providers & Aggregators (OperationsSetupViews.tsx)
 * 2. Sales Workstation "Delivered By" Dropdown & Modal (SalesView.tsx)
 * 3. Driver/Fleet and Shipping Workflows
 * 
 * Persistent Storage:
 * - Supabase tenants.feature_flags.delivery_providers
 * - LocalStorage key: 'vanguard_delivery_providers_v2' (with legacy 'vanguard_delivery_providers' fallback)
 */

import { supabase } from '@/lib/supabaseClient';

export type DeliveryProviderClassification =
  | 'INTERNAL_FLEET'
  | '3PL_EXPRESS'
  | 'AGGREGATOR'
  | 'DIRECT';

export interface DeliveryProviderRecord {
  id: string; // e.g. 'DP-SUPERSONIC', 'DP-ARAMEX'
  providerId?: string; // backwards compatibility
  name: string;
  classification: DeliveryProviderClassification;
  providerType?: DeliveryProviderClassification | 'REGIONAL_CARRIER'; // backwards compatibility
  contactPerson: string;
  phone: string;
  status: 'Active Carrier' | 'Inactive';
  active?: boolean; // backwards compatibility
}

export const DELIVERY_PROVIDERS_CACHE_KEY_V2 = 'vanguard_delivery_providers_v2';
export const DELIVERY_PROVIDERS_CACHE_KEY_V1 = 'vanguard_delivery_providers';
export const DELIVERY_PROVIDERS_UPDATED_EVENT = 'vanguard_delivery_providers_updated';

export const DEFAULT_UNIFIED_DELIVERY_PROVIDERS: DeliveryProviderRecord[] = [
  {
    id: 'DP-SUPERSONIC',
    providerId: 'DP-SUPERSONIC',
    name: 'SuperSonic Fleet Management (Internal)',
    classification: 'INTERNAL_FLEET',
    providerType: 'INTERNAL_FLEET',
    contactPerson: 'Tony Khoury (Lead Driver)',
    phone: '+961 71 332 901',
    status: 'Active Carrier',
    active: true
  },
  {
    id: 'DP-ARAMEX',
    providerId: 'DP-ARAMEX',
    name: 'Aramex Lebanon International Cargo',
    classification: '3PL_EXPRESS',
    providerType: '3PL_EXPRESS',
    contactPerson: 'Karim Sadek',
    phone: '+961 1 543 210',
    status: 'Active Carrier',
    active: true
  },
  {
    id: 'DP-DHL',
    providerId: 'DP-DHL',
    name: 'DHL Express Fresh Cargo Logistics',
    classification: '3PL_EXPRESS',
    providerType: '3PL_EXPRESS',
    contactPerson: 'Rana Chemali',
    phone: '+961 1 738 900',
    status: 'Active Carrier',
    active: true
  },
  {
    id: 'DP-CARGOMASTER',
    providerId: 'DP-CARGOMASTER',
    name: 'Cargomaster',
    classification: '3PL_EXPRESS',
    providerType: '3PL_EXPRESS',
    contactPerson: 'Ziad Nader',
    phone: '+961 1 488 200',
    status: 'Active Carrier',
    active: true
  },
  {
    id: 'DP-WAKILNI',
    providerId: 'DP-WAKILNI',
    name: 'Wakilni',
    classification: 'AGGREGATOR',
    providerType: 'AGGREGATOR',
    contactPerson: 'Yara Abou Jaoude',
    phone: '+961 71 000 812',
    status: 'Active Carrier',
    active: true
  }
];

export function normalizeDeliveryProvider(raw: any, index: number = 0): DeliveryProviderRecord {
  if (typeof raw === 'string') {
    const cleanName = raw.trim();
    const slug = cleanName.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 15);
    const classification: DeliveryProviderClassification =
      cleanName.toLowerCase().includes('internal') || cleanName.toLowerCase().includes('fleet')
        ? 'INTERNAL_FLEET'
        : cleanName.toLowerCase().includes('wakilni')
        ? 'AGGREGATOR'
        : cleanName.toLowerCase().includes('direct') || cleanName.toLowerCase().includes('pickup')
        ? 'DIRECT'
        : '3PL_EXPRESS';

    return {
      id: `DP-${slug || index + 1}`,
      providerId: `DP-${slug || index + 1}`,
      name: cleanName,
      classification,
      providerType: classification,
      contactPerson: 'Operations Dispatch Desk',
      phone: '+961 70 000 000',
      status: 'Active Carrier',
      active: true
    };
  }

  const name = (raw.name || raw.providerName || '').trim();
  const id = raw.id || raw.providerId || `DP-${Math.floor(100 + Math.random() * 900)}`;

  let classification: DeliveryProviderClassification = '3PL_EXPRESS';
  const rawType = (raw.classification || raw.providerType || '').toString().toUpperCase();
  if (rawType.includes('INTERNAL') || rawType.includes('FLEET')) {
    classification = 'INTERNAL_FLEET';
  } else if (rawType.includes('AGGREGATOR')) {
    classification = 'AGGREGATOR';
  } else if (rawType.includes('DIRECT') || rawType.includes('COUNTER') || rawType.includes('PICKUP')) {
    classification = 'DIRECT';
  } else {
    classification = '3PL_EXPRESS';
  }

  const status: 'Active Carrier' | 'Inactive' =
    raw.status === 'Inactive' || raw.active === false ? 'Inactive' : 'Active Carrier';

  return {
    id,
    providerId: id,
    name: name || id,
    classification,
    providerType: classification,
    contactPerson: raw.contactPerson || raw.contact || 'Operations Dispatch',
    phone: raw.phone || raw.phoneNumber || '+961 70 000 000',
    status,
    active: status === 'Active Carrier'
  };
}

export async function fetchUnifiedDeliveryProviders(tenantId?: string): Promise<DeliveryProviderRecord[]> {
  const targetTenantId = (tenantId && tenantId !== '1300' && !tenantId.startsWith('comp-'))
    ? tenantId
    : '00000000-0000-0000-0000-000000000001';

  let list: DeliveryProviderRecord[] = [];

  // 1. Try localStorage v2
  if (typeof window !== 'undefined') {
    try {
      const cachedV2 = localStorage.getItem(DELIVERY_PROVIDERS_CACHE_KEY_V2);
      if (cachedV2) {
        const parsed = JSON.parse(cachedV2);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed.map((item, idx) => normalizeDeliveryProvider(item, idx));
        }
      }
    } catch (e) {
      console.warn('Error reading local delivery providers v2:', e);
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
      if (Array.isArray(flags.delivery_providers) && flags.delivery_providers.length > 0) {
        const supabaseList = flags.delivery_providers.map((item: any, idx: number) =>
          normalizeDeliveryProvider(item, idx)
        );
        // Merge Supabase list
        const existingIds = new Set(list.map(p => p.id));
        const existingNames = new Set(list.map(p => p.name.toLowerCase()));
        supabaseList.forEach(p => {
          if (!existingIds.has(p.id) && !existingNames.has(p.name.toLowerCase())) {
            list.push(p);
          }
        });
      }
    }
  } catch (err) {
    console.warn('Error fetching delivery providers from Supabase:', err);
  }

  // 3. Fallback to v1 if list is still empty
  if (list.length === 0 && typeof window !== 'undefined') {
    try {
      const cachedV1 = localStorage.getItem(DELIVERY_PROVIDERS_CACHE_KEY_V1);
      if (cachedV1) {
        const parsed = JSON.parse(cachedV1);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed.map((item, idx) => normalizeDeliveryProvider(item, idx));
        }
      }
    } catch {}
  }

  // 4. Ensure default seeds exist
  const currentNames = new Set(list.map(p => p.name.toLowerCase()));
  DEFAULT_UNIFIED_DELIVERY_PROVIDERS.forEach(seed => {
    if (!currentNames.has(seed.name.toLowerCase())) {
      list.push(seed);
    }
  });

  // 5. Update local cache
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(DELIVERY_PROVIDERS_CACHE_KEY_V2, JSON.stringify(list));
      localStorage.setItem(DELIVERY_PROVIDERS_CACHE_KEY_V1, JSON.stringify(list.map(p => p.name)));
    } catch {}
  }

  return list;
}

export async function persistUnifiedDeliveryProviders(
  providers: DeliveryProviderRecord[],
  tenantId?: string
): Promise<{ success: boolean; error?: string }> {
  const targetTenantId = (tenantId && tenantId !== '1300' && !tenantId.startsWith('comp-'))
    ? tenantId
    : '00000000-0000-0000-0000-000000000001';

  // 1. Cache to localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(DELIVERY_PROVIDERS_CACHE_KEY_V2, JSON.stringify(providers));
      localStorage.setItem(DELIVERY_PROVIDERS_CACHE_KEY_V1, JSON.stringify(providers.map(p => p.name)));
      window.dispatchEvent(
        new CustomEvent(DELIVERY_PROVIDERS_UPDATED_EVENT, { detail: providers })
      );
    } catch (e) {
      console.warn('Error saving local delivery providers:', e);
    }
  }

  // 2. Persist to Supabase feature_flags
  try {
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('feature_flags')
      .eq('id', targetTenantId)
      .maybeSingle();

    const currentFlags = (tenantData?.feature_flags as Record<string, any>) || {};
    const newFlags = {
      ...currentFlags,
      delivery_providers: providers
    };

    const { error } = await supabase
      .from('tenants')
      .update({
        feature_flags: newFlags,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetTenantId);

    if (error) {
      console.warn('Supabase feature_flags update error for delivery providers:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Exception persisting delivery providers to Supabase:', err);
    return { success: false, error: err?.message || 'Unknown persistence error' };
  }
}
