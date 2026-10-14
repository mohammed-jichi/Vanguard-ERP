/**
 * Vanguard ERP - Unified Sales Options & Invoice Setup Service
 * Manages configuration for:
 * 1. Sales Options (Pricing & Markup, Default Values, Workflow & Validation Checkboxes)
 * 2. Invoice Setup (Printable Invoice Layout, Badges, Logos, Footer & Language)
 *
 * Persisted in:
 * - Supabase tenants.feature_flags.sales_options
 * - LocalStorage key: 'vanguard_sales_options_v1'
 * - Realtime Window Event: 'vanguard_sales_options_updated'
 */

import { supabase } from '@/lib/supabaseClient';
import { GLOBAL_ISO_CURRENCIES } from '@/lib/currencyRegistry';
import { SEED_EMPLOYEES } from '@/lib/eventsData';
import { INITIAL_OMEGA_DEPARTMENTS } from '@/lib/omegaDepartmentsData';
import { INITIAL_OMEGA_LOCATIONS } from '@/lib/omegaLocationsData';

export interface SalesOptionsState {
  // --- Tab 1: Pricing & Markup ---
  mark_up_pct: number;
  apply_markup_on_item: boolean;
  markup_based_on: 'average_cost' | 'unit_cost';
  selling_price_tier: 'SP1' | 'SP2' | 'SP3' | 'Wholesale' | 'Retail';
  no_tax: boolean;
  layaway: boolean;

  // --- Tab 1: Default Values ---
  default_branch: string;
  default_currency: string;
  default_payment: string;
  default_salesman: string;
  default_department: string;
  default_location: string;
  printer_type: 'a4' | 'thermal' | 'a5' | 'dot_matrix';
  print_report_on_save: 'ask' | 'auto' | 'never';

  // --- Tab 1: Behavior & Validation Checkboxes ---
  enter_amount_paid_on_close: boolean;
  cash_sales: boolean;
  enable_sales_conversion_to_purchase: boolean;
  allow_customer_pricing: boolean;
  allow_import_from_csv: boolean;
  disable_sales_save_button: boolean;
  verify_customer_credit_limit: boolean;
  print_delivery_note: boolean;
  remove_tax_for_international: boolean;
  allow_sales_negative_stock: boolean;
  show_temporary_invoice_no: boolean;
  show_randomized_ref_no: boolean;
  use_second_currency_price: boolean;
  hide_divisions_in_carousel: boolean;
  enable_direct_printing: boolean;
  show_location_in_details: boolean;
  select_salesman_per_item: boolean;

  // --- Tab 2: Invoice Setup ---
  show_branch_payment_info: boolean;
  show_logo_on_invoice: boolean;
  show_barcode_on_invoice: boolean;
  show_branch_address: boolean;
  show_item_image: boolean;
  show_delivery_provider_info: boolean;
  show_message_on_invoice: boolean;
  sales_report_footer: string;
  invoice_language: 'en' | 'ar' | 'bilingual';
}

export const SALES_OPTIONS_CACHE_KEY = 'vanguard_sales_options_v1';
export const SALES_OPTIONS_UPDATED_EVENT = 'vanguard_sales_options_updated';

export const DEFAULT_SALES_OPTIONS: SalesOptionsState = {
  // Tab 1: Pricing & Markup
  mark_up_pct: 0,
  apply_markup_on_item: false,
  markup_based_on: 'unit_cost',
  selling_price_tier: 'SP1',
  no_tax: false,
  layaway: false,

  // Tab 1: Default Values
  default_branch: 'Zeit w zaytoun ljanoub',
  default_currency: 'USD',
  default_payment: 'cash_usd',
  default_salesman: 'Direct Counter',
  default_department: 'Showroom',
  default_location: 'Main Store',
  printer_type: 'a4',
  print_report_on_save: 'ask',

  // Tab 1: Behavior & Validation Checkboxes
  enter_amount_paid_on_close: true,
  cash_sales: false,
  enable_sales_conversion_to_purchase: false,
  allow_customer_pricing: true,
  allow_import_from_csv: true,
  disable_sales_save_button: false,
  verify_customer_credit_limit: true,
  print_delivery_note: false,
  remove_tax_for_international: true,
  allow_sales_negative_stock: false,
  show_temporary_invoice_no: false,
  show_randomized_ref_no: true,
  use_second_currency_price: false,
  hide_divisions_in_carousel: false,
  enable_direct_printing: false,
  show_location_in_details: false,
  select_salesman_per_item: false,

  // Tab 2: Invoice Setup
  show_branch_payment_info: true,
  show_logo_on_invoice: true,
  show_barcode_on_invoice: true,
  show_branch_address: true,
  show_item_image: false,
  show_delivery_provider_info: true,
  show_message_on_invoice: true,
  sales_report_footer: 'البضاعة التي تباع لا ترد ولا تبدل ما عدا السهو والخطأ.\nالرجاء التأكد من البضاعة عند الاستلام.',
  invoice_language: 'bilingual'
};

// Helper to normalize tenant ID
function resolveTenantId(tenantId?: string): string {
  if (tenantId && tenantId !== '1300' && !tenantId.startsWith('comp-')) {
    return tenantId;
  }
  return '00000000-0000-0000-0000-000000000001';
}

/**
 * Returns currently cached Sales Options or defaults synchronously
 */
export function getCachedSalesOptions(): SalesOptionsState {
  if (typeof window === 'undefined') return DEFAULT_SALES_OPTIONS;
  try {
    const cached = localStorage.getItem(SALES_OPTIONS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...DEFAULT_SALES_OPTIONS, ...parsed };
    }
  } catch (e) {
    console.warn('Error reading cached sales options:', e);
  }
  return DEFAULT_SALES_OPTIONS;
}

/**
 * Fetches Sales Options from Supabase and merges with local storage
 */
export async function fetchSalesOptions(tenantId?: string): Promise<SalesOptionsState> {
  const targetTenantId = resolveTenantId(tenantId);
  let options = getCachedSalesOptions();

  try {
    const { data: tenantData, error } = await supabase
      .from('tenants')
      .select('feature_flags')
      .eq('id', targetTenantId)
      .maybeSingle();

    if (!error && tenantData?.feature_flags) {
      const flags = (tenantData.feature_flags as Record<string, any>) || {};
      if (flags.sales_options && typeof flags.sales_options === 'object') {
        options = {
          ...DEFAULT_SALES_OPTIONS,
          ...options,
          ...flags.sales_options
        };
      }
    }
  } catch (err) {
    console.warn('Error fetching sales options from Supabase:', err);
  }

  // Update local cache
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SALES_OPTIONS_CACHE_KEY, JSON.stringify(options));
    } catch {}
  }

  return options;
}

/**
 * Persists Sales Options to localStorage and Supabase feature_flags
 */
export async function persistSalesOptions(
  options: SalesOptionsState,
  tenantId?: string
): Promise<{ success: boolean; error?: string }> {
  const targetTenantId = resolveTenantId(tenantId);

  // 1. Optimistic LocalStorage update & CustomEvent dispatch
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SALES_OPTIONS_CACHE_KEY, JSON.stringify(options));
      window.dispatchEvent(
        new CustomEvent(SALES_OPTIONS_UPDATED_EVENT, { detail: options })
      );
    } catch (e) {
      console.warn('Error saving sales options to localStorage:', e);
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
      sales_options: options
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

/**
 * Helper to pull all dynamic currency options (USD, EUR, GBP + dynamic local)
 */
export function getAvailableCurrencyOptions(localCurrency: string = 'LBP'): { code: string; label: string }[] {
  const coreCurrencies = ['USD', 'EUR', 'GBP'];
  const dynamicCurrencies = [localCurrency.toUpperCase(), 'SAR', 'AED', 'KWD', 'QAR', 'EGP', 'NGN'];

  const combined = Array.from(new Set([...coreCurrencies, ...dynamicCurrencies]));
  return combined.map(code => {
    const meta = GLOBAL_ISO_CURRENCIES.find(c => c.code === code);
    return {
      code,
      label: meta ? `${meta.code} - ${meta.name} (${meta.symbol})` : code
    };
  });
}

/**
 * Helper to pull all available salesmen from canonical lists
 */
export function getAvailableSalesmen(): string[] {
  const defaultList = [
    'Direct Counter',
    'Mahdi',
    'Hiba Aloulou',
    'Hussein Jichi',
    'Ricky',
    'Nadine Ahmar',
    'Rana Jichi',
    'Ahmad Dirani',
    'Charbel Khoury'
  ];

  const employeeNames = SEED_EMPLOYEES.map(e => e.NAME);
  return Array.from(new Set([...defaultList, ...employeeNames]));
}

/**
 * Helper to pull all available departments from canonical stores
 */
export function getAvailableDepartments(): string[] {
  const defaults = ['Showroom', 'Wholesale', 'Delivery', 'Factory / Manufacture Warehouse'];
  const fromOmega = INITIAL_OMEGA_DEPARTMENTS.map(d => d.MENUDESC);
  return Array.from(new Set([...defaults, ...fromOmega]));
}

/**
 * Helper to pull all available locations from canonical stores
 */
export function getAvailableLocations(): string[] {
  const defaults = ['Main Store', 'Showroom', 'Delivery', 'Manufacture Warehouse'];
  const fromOmega = INITIAL_OMEGA_LOCATIONS.map(l => l.LOCATIONDESCRIPTION);
  return Array.from(new Set([...defaults, ...fromOmega]));
}
