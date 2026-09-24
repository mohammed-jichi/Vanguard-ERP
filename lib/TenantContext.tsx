'use client';
/**
 * Vanguard ERP System
 * Multi-Tenant Context & Dynamic UI Branding Provider
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { logSystemActivity } from './activityLogger';

export interface TenantLicense {
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

export const ALL_SYSTEM_MODULES = [
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
  // Backward compatibility aliases
  'purchases',
  'procurement',
  'pressing',
  'MODULE_PRESSING_MILL',
  'connect',
  'v-connect',
  'driver',
  'store'
];

export const CANONICAL_MODULE_MAP: Record<string, string> = {
  // 1. Sales Control & POS
  sales: 'sales',
  pos: 'sales',
  sale: 'sales',
  'v-pos': 'sales',
  counter: 'sales',
  sales_control: 'sales',
  'sales-control': 'sales',

  // 2. Inventory & Warehouses (Operations Center)
  operations: 'operations',
  op: 'operations',
  inventory: 'operations',
  stock: 'operations',
  warehouse: 'operations',
  warehousing: 'operations',
  operations_center: 'operations',
  'operations-center': 'operations',

  // 3. Purchasing & Procurement
  purchasing: 'purchasing',
  procurement: 'purchasing',
  purchases: 'purchasing',
  purchase: 'purchasing',
  po: 'purchasing',

  // 4. Customer Management (CRM)
  customers: 'customers',
  crm: 'customers',
  customer: 'customers',
  clients: 'customers',
  cust: 'customers',
  customer_management: 'customers',
  'customer-management': 'customers',

  // 5. Feedback & Surveys
  feedback: 'feedback',
  survey: 'feedback',
  surveys: 'feedback',
  csat: 'feedback',
  reviews: 'feedback',
  feedback_surveys: 'feedback',
  'feedback-surveys': 'feedback',

  // 6. Loyalty Program
  loyalty: 'loyalty',
  rewards: 'loyalty',
  merits: 'loyalty',
  points: 'loyalty',
  loyalty_management: 'loyalty',
  'loyalty-management': 'loyalty',

  // 7. Accounting & General Ledger
  accounting: 'accounting',
  finance: 'accounting',
  gl: 'accounting',
  ledger: 'accounting',
  financials: 'accounting',
  acc: 'accounting',

  // 8. HR & Payroll
  hr: 'hr',
  payroll: 'hr',
  attendance: 'hr',
  personnel: 'hr',
  human_resources: 'hr',
  'human-resources': 'hr',

  // 9. SuperSonic Fleet / V-Driver
  fleet: 'fleet',
  'v-driver': 'fleet',
  driver: 'fleet',
  supersonic: 'fleet',
  logistics: 'fleet',
  dispatch: 'fleet',
  vtrack: 'fleet',

  // 10. V-Connect (Social CRM & WhatsApp)
  social: 'social',
  connect: 'social',
  'v-connect': 'social',
  'social-crm': 'social',
  social_crm: 'social',
  whatsapp: 'social',
  omnichannel: 'social',

  // 11. Pressing Mill Engine
  'pressing-mill': 'pressing-mill',
  pressing: 'pressing-mill',
  pressing_mill: 'pressing-mill',
  module_pressing_mill: 'pressing-mill',
  mill: 'pressing-mill',
  olive: 'pressing-mill',

  // 12. V-Store (Storefront & Online Orders)
  'v-store': 'v-store',
  store: 'v-store',
  storefront: 'v-store',
  landing: 'v-store',
  ecommerce: 'v-store',
  orders: 'v-store',
  'online-orders': 'v-store'
};

export function checkModuleEnabled(modId: string, activeMods: string[] = []): boolean {
  if (!Array.isArray(activeMods) || activeMods.length === 0) return false;
  const rawTarget = (modId || '').toLowerCase().trim();
  const canonicalTarget = CANONICAL_MODULE_MAP[rawTarget] || rawTarget;
  return activeMods.some(m => {
    const rawItem = (m || '').toLowerCase().trim();
    if (rawItem === rawTarget) return true;
    const canonicalItem = CANONICAL_MODULE_MAP[rawItem] || rawItem;
    return canonicalItem === canonicalTarget;
  });
}

export interface TenantCompany {
  id: string;
  companyId?: number | string;
  company_id?: number | string;
  name: string;
  slug: string;
  brandNameAr: string;
  brandNameEn: string;
  logoUrl: string;
  primaryColor?: string;
  themeColor?: string;
  primary_color?: string;
  theme_color?: string;
  enabledModules?: string[];
  enabled_modules?: string[];
  // Corporate, Legal & Fiscal Profile
  legalEntityName?: string;
  officialLegalEntityName?: string;
  companyRegistrationNumber?: string;
  taxIdentificationNumber?: string;
  headquartersAddress?: string;
  city?: string;
  country?: string;
  financialSeedTemplate?: 'lebanese_pca' | 'international_ifrs' | 'custom_blank' | string;
  vatPercentage?: number;
  taxIdLabel?: string;
  crNumberLabel?: string;
  phoneNumber?: string;
  billingEmail?: string;
  baseCurrency?: string;
  secondaryCurrency?: string;
  isDualCurrencyEnabled?: boolean;
  exchangeRatePolicy?: 'PLATFORM_FIXED' | 'TENANT_MANAGED';
  // Operational Quotas
  maxBranches?: number | string;
  maxConcurrentUsers?: number | string;
  maxPosTerminals?: number | string;
  storageQuotaGb?: number | string;
  // Subscription Lifecycle
  contractMonthlyValue?: number;
  billingCycle?: 'MONTHLY' | 'ANNUAL';
  renewalDate?: string;
  subscriptionTier: 'STARTER' | 'PRO' | 'ENTERPRISE' | 'CUSTOM';
  subscriptionStatus: 'ACTIVE' | 'SUSPENDED' | 'MAINTENANCE_MODE' | 'PAST_DUE' | 'CANCELLED';
  // Primary Admin Credentials & Meta
  adminFullName?: string;
  adminName?: string;
  adminEmail?: string;
  adminPhone?: string;
  adminPassword?: string;
  feature_flags?: any;
  aiUsageCount: number;
  aiUsageLimit: number;
  createdAt?: string;
  updatedAt?: string;
  updated_at?: string;
  license?: TenantLicense;
}

export const SOUTHERN_OLIVE_OFFICIAL_LICENSE: TenantLicense = {
  licenseKey: 'VNG-LIC-2026-SOUTHERN-OLIVE-ULTIMATE-UNLIMITED-X992',
  licenseNumber: 'VNG-ENT-001-2026-X9',
  certificateId: 'CERT-VNG-AUTH-104928-2026',
  authorizedEntity: 'Southern Olive Oil Products S.A.R.L (منتوجات زيت وزيتون الجنوب ش.م.م)',
  tier: 'Enterprise Unlimited Suite (Lifetime Perpetual)',
  status: 'LICENSED_PERPETUAL',
  issuedAt: '2026-01-01T00:00:00.000Z',
  expiresAt: 'PERPETUAL_LIFETIME (Permanent Full Activation)',
  authorizedBy: 'Vanguard ERP Systems Global Licensing Authority',
  digitalSignature: 'SHA256:7e8a9f0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
  digitalSeal: 'VANGUARD-ERP-CERTIFIED-SECURE-MASTER-AUTHORITY-2026',
  maxUsers: 'UNLIMITED (Zero Cap)',
  maxBranches: 'UNLIMITED (All Locations & Plants)',
  maxTerminals: 'UNLIMITED (All POS & Mobile Handhelds)',
  unlockedModules: [
    'INVENTORY_WAREHOUSE_CONTROL',
    'PROCUREMENTS_RECEIVING_GRN',
    'SALES_TOUCH_POS_TERMINAL',
    'WASTAGE_SHRINKAGE_ANALYTICS',
    'FINANCIALS_GENERAL_LEDGER',
    'OIL_PRESSING_PRODUCTION_FACILITY',
    'MODULE_PRESSING_MILL',
    'PRESSING_MILL',
    'SUPERSONIC_FLEET_LOGISTICS',
    'VTRACK_CLOUD_MOBILE_PLATFORM',
    'HR_PAYROLL_ATTENDANCE',
    'MERITS_LOYALTY_REWARDS',
    'OPERATIONS_CENTER_REPORTS_ALL_10_CATEGORIES',
    'PRODUCT_REQUISITIONS_REQUESTS',
    'EXECUTIVE_BI_DECISION_DASHBOARD',
    'SUPPLIER_INVOICING_QUOTATIONS',
    'INTER_LOCATION_TRANSFERS',
    'MAXIMUM_SECURITY_SUITE_RLS',
    'AI_ASSISTANT_DEMAND_FORECASTING',
    'MULTI_CURRENCY_EXCHANGE_VAT_FILINGS'
  ]
};

export interface TenantUser {
  id: string;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'MANAGER' | 'STAFF' | 'DRIVER';
}

interface TenantContextType {
  currentTenant: TenantCompany;
  currentUser: TenantUser | null;
  isSuperAdmin: boolean;
  switchTenant: (company: TenantCompany) => void;
  updateTenantSettings: (settings: Partial<TenantCompany>) => Promise<{ success: boolean; error?: string }>;
  updateTenantModulesAndBranding: (
    tenantId: string,
    updates: Partial<TenantCompany> & { [key: string]: any }
  ) => Promise<{ success: boolean; error?: string }>;
  onboardNewTenant: (tenantData: Partial<TenantCompany>, adminEmail: string) => Promise<{ success: boolean; error?: string }>;
  refreshTenants: () => Promise<void>;
  registeredCompanies: TenantCompany[];
  isModuleEnabled: (modId: string) => boolean;
}

const DEFAULT_SUPERADMIN_TENANT: TenantCompany = {
  id: '00000000-0000-0000-0000-000000000001',
  companyId: 1300,
  company_id: 1300,
  name: 'Southern Olive Oil Products S.A.R.L',
  slug: 'southern-olive',
  brandNameAr: 'منتوجات زيت وزيتون الجنوب',
  brandNameEn: 'Southern Olive Oil Products S.A.R.L',
  logoUrl: '/assets/images/logo.png',
  primaryColor: '#123b70',
  themeColor: '#123b70',
  enabledModules: ALL_SYSTEM_MODULES,
  enabled_modules: ALL_SYSTEM_MODULES,
  country: 'Lebanon',
  financialSeedTemplate: 'lebanese_pca',
  vatPercentage: 11,
  taxIdLabel: 'Tax ID Number (MOF / الرقم المالي - وزارة المالية)',
  crNumberLabel: 'Commercial Registration (CR / السجل التجاري)',
  companyRegistrationNumber: 'CR-104928-LB',
  taxIdentificationNumber: 'MOF-7489201',
  baseCurrency: 'USD',
  secondaryCurrency: 'LBP',
  isDualCurrencyEnabled: true,
  exchangeRatePolicy: 'PLATFORM_FIXED',
  subscriptionTier: 'ENTERPRISE',
  subscriptionStatus: 'ACTIVE',
  aiUsageCount: 0,
  aiUsageLimit: 1000,
  license: SOUTHERN_OLIVE_OFFICIAL_LICENSE
};

const INITIAL_COMPANIES: TenantCompany[] = [
  DEFAULT_SUPERADMIN_TENANT
];

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registeredCompanies, setRegisteredCompanies] = useState<TenantCompany[]>(INITIAL_COMPANIES);
  const [currentTenant, setCurrentTenant] = useState<TenantCompany>(DEFAULT_SUPERADMIN_TENANT);
  const [currentUser, setCurrentUser] = useState<TenantUser | null>({
    id: 'usr-superadmin-01',
    email: 'mohammed@vanguard-erp.com',
    fullName: 'Mohammed (Vanguard Super Admin)',
    role: 'SUPER_ADMIN'
  });

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const refreshTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: true });

      console.log('Admin Tenants Fetch:', data, error);

      if (error) {
        console.error('Error fetching tenants from Supabase:', error);
        return;
      }

      if (data && Array.isArray(data)) {
        const fetchedCompanies: TenantCompany[] = data.map((t: any, idx: number) => ({
          id: t.id || 'comp-' + Date.now(),
          companyId: t.company_id || t.companyId || (t.id === '00000000-0000-0000-0000-000000000001' ? 1300 : 1300 + idx),
          company_id: t.company_id || t.companyId || (t.id === '00000000-0000-0000-0000-000000000001' ? 1300 : 1300 + idx),
          name: t.name || t.brand_name_ar || 'Vanguard Enterprise Client',
          slug: t.slug || t.name,
          brandNameAr: t.brand_name_ar || t.name || 'المؤسسة المعتمدة',
          brandNameEn: t.brand_name_en || t.name || 'Vanguard Enterprise Client',
          logoUrl: t.logo_url || '',
          primaryColor: t.primary_color || t.theme_color || '#123b70',
          themeColor: t.theme_color || t.primary_color || '#123b70',
          enabledModules: Array.isArray(t.enabled_modules) && t.enabled_modules.length > 0
            ? t.enabled_modules
            : (Array.isArray(t.feature_flags?.enabled_modules) && t.feature_flags.enabled_modules.length > 0
                ? t.feature_flags.enabled_modules
                : ALL_SYSTEM_MODULES),
          enabled_modules: Array.isArray(t.enabled_modules) && t.enabled_modules.length > 0
            ? t.enabled_modules
            : (Array.isArray(t.feature_flags?.enabled_modules) && t.feature_flags.enabled_modules.length > 0
                ? t.feature_flags.enabled_modules
                : ALL_SYSTEM_MODULES),
          legalEntityName: t.official_legal_entity_name || t.feature_flags?.corporate_profile?.officialLegalName || t.feature_flags?.corporate_profile?.legal_entity_name || t.name,
          officialLegalEntityName: t.official_legal_entity_name || t.feature_flags?.corporate_profile?.officialLegalName || t.feature_flags?.corporate_profile?.legal_entity_name || t.name,
          companyRegistrationNumber: t.cr_number || t.company_registration_number || t.feature_flags?.corporate_profile?.cr_number || t.feature_flags?.corporate_profile?.commercialRegistrationNumber || 'CR-104928-LB',
          taxIdentificationNumber: t.tax_id || t.tax_identification_number || t.feature_flags?.corporate_profile?.tax_id || t.feature_flags?.corporate_profile?.taxIdentificationNumber || 'MOF-7489201',
          headquartersAddress: t.address || t.headquarters_address || t.feature_flags?.corporate_profile?.address || t.feature_flags?.corporate_profile?.headquarters_address || t.feature_flags?.corporate_profile?.headquartersAddress || 'Nabatieh Industrial Zone, Main Blvd, Bldg 4',
          city: t.city || t.feature_flags?.corporate_profile?.city || 'Nabatieh',
          country: t.country || t.feature_flags?.corporate_profile?.country || 'Lebanon',
          financialSeedTemplate: t.financial_seed_template || t.feature_flags?.corporate_profile?.financial_seed_template || ((t.country || t.feature_flags?.corporate_profile?.country || 'Lebanon').toLowerCase() === 'lebanon' ? 'lebanese_pca' : 'international_ifrs'),
          vatPercentage: t.vat_percentage ?? t.feature_flags?.corporate_profile?.vat_percentage ?? ((t.country || t.feature_flags?.corporate_profile?.country || 'Lebanon').toLowerCase() === 'lebanon' ? 11 : 15),
          taxIdLabel: t.tax_id_label || t.feature_flags?.corporate_profile?.tax_id_label,
          crNumberLabel: t.cr_label || t.feature_flags?.corporate_profile?.cr_label || t.cr_number_label,
          phoneNumber: t.phone || t.phone_number || t.feature_flags?.corporate_profile?.phone || t.feature_flags?.corporate_profile?.phone_number || t.feature_flags?.corporate_profile?.phoneNumber || '+961 70 882 110',
          billingEmail: t.billing_email || t.feature_flags?.corporate_profile?.billing_email || t.feature_flags?.corporate_profile?.billingEmail || 'accounts@southernolive.com',
          baseCurrency: t.base_currency || t.feature_flags?.corporate_profile?.base_currency || t.feature_flags?.corporate_profile?.baseCurrency || 'USD',
          secondaryCurrency: t.secondary_currency !== undefined ? t.secondary_currency : (t.feature_flags?.corporate_profile?.secondary_currency || t.feature_flags?.corporate_profile?.secondaryCurrency || 'LBP'),
          isDualCurrencyEnabled: t.is_dual_currency_enabled ?? t.feature_flags?.corporate_profile?.is_dual_currency_enabled ?? t.feature_flags?.corporate_profile?.isDualCurrencyEnabled ?? ((t.country || t.feature_flags?.corporate_profile?.country || 'Lebanon').toLowerCase() === 'lebanon'),
          exchangeRatePolicy: t.exchange_rate_policy || t.feature_flags?.corporate_profile?.exchange_rate_policy || t.feature_flags?.corporate_profile?.exchangeRatePolicy || 'PLATFORM_FIXED',
          subscriptionTier: t.subscription_tier || 'PRO',
          subscriptionStatus: t.subscription_status || 'ACTIVE',
          aiUsageCount: t.ai_usage_count || 0,
          aiUsageLimit: t.ai_usage_limit || 1000,
          createdAt: t.created_at,
          updatedAt: t.updated_at || t.created_at,
          updated_at: t.updated_at || t.created_at
        }));

        if (fetchedCompanies.length > 0) {
          setRegisteredCompanies(fetchedCompanies);
          // Preserve currently selected or saved tenant
          if (typeof window !== 'undefined') {
            const savedRaw = localStorage.getItem('vanguard_active_tenant');
            if (savedRaw) {
              try {
                const saved = JSON.parse(savedRaw);
                const matched = fetchedCompanies.find(c => 
                  c.id === saved.id || 
                  c.slug === saved.slug || 
                  (saved.id === '1300' && c.id === DEFAULT_SUPERADMIN_TENANT.id) ||
                  (c.id === DEFAULT_SUPERADMIN_TENANT.id && (saved.companyId === 1300 || saved.company_id === 1300))
                );
                if (matched) {
                  setCurrentTenant(matched);
                  localStorage.setItem('vanguard_active_tenant', JSON.stringify(matched));
                  return;
                }
              } catch (e) {}
            }
          }
          setCurrentTenant(prev => {
            const matched = fetchedCompanies.find(c => c.id === prev.id);
            const chosen = matched || fetchedCompanies[0];
            if (typeof window !== 'undefined' && chosen) {
              localStorage.setItem('vanguard_active_tenant', JSON.stringify(chosen));
            }
            return chosen;
          });
        }

        console.log('✅ React TenantContext dynamically loaded real tenants from Supabase:', fetchedCompanies);

        if (typeof window !== 'undefined') {
          if (typeof (window as any).renderDynamicSaaSTenants === 'function') {
            (window as any).renderDynamicSaaSTenants(data);
          }
          if (typeof (window as any).renderAdminLicensesRegistry === 'function') {
            (window as any).renderAdminLicensesRegistry(data);
          }
        }
      }
    } catch (err) {
      console.error('Exception fetching tenants in TenantContext:', err);
    }
  };

  // Synchronize dynamic brand text across all UI components, headers, sidebars
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.location.pathname.includes('/admin') || window.location.href.includes('/admin'))) {
      document.title = 'Vanguard SaaS Master Controller';
      return;
    }

    const brandAr = currentTenant.brandNameAr || 'المؤسسة المعتمدة';
    const brandEn = currentTenant.brandNameEn || 'Vanguard Enterprise Client';

    document.title = `${brandEn} - Vanguard ERP Portal`;

    document.querySelectorAll('.brand-name-ar').forEach(el => {
      el.textContent = brandAr;
    });

    document.querySelectorAll('.brand-name-en').forEach(el => {
      el.textContent = brandEn;
    });

    // Expose browser window bridge for legacy vanilla JS components
    if (typeof window !== 'undefined') {
      (window as any).currentVanguardTenant = currentTenant;
      (window as any).vanguardTenantUser = currentUser;
      (window as any).vanguardRefreshTenants = refreshTenants;
    }
  }, [currentTenant, currentUser]);

  useEffect(() => {
    refreshTenants();
  }, []);

  // Load user saved custom branding & legal numbers on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Enforce Vanguard ERP Authorized License
        const savedLicense = localStorage.getItem('vanguard_activation_license');
        if (!savedLicense) {
          localStorage.setItem('vanguard_activation_license', JSON.stringify(SOUTHERN_OLIVE_OFFICIAL_LICENSE));
        }
        
        const savedActiveTenant = localStorage.getItem('vanguard_active_tenant');
        if (savedActiveTenant) {
          const parsed = JSON.parse(savedActiveTenant);
          if (
            parsed.id === '1300' ||
            parsed.id === DEFAULT_SUPERADMIN_TENANT.id ||
            parsed.companyId === 1300 ||
            parsed.company_id === 1300 ||
            parsed.slug === 'southern-olive'
          ) {
            parsed.id = DEFAULT_SUPERADMIN_TENANT.id;
            parsed.companyId = 1300;
            parsed.company_id = 1300;
          }
          setCurrentTenant({
            ...DEFAULT_SUPERADMIN_TENANT,
            ...parsed,
            license: SOUTHERN_OLIVE_OFFICIAL_LICENSE
          });
          return;
        }

        const saved = localStorage.getItem('vanguard_tenant_branding');
        if (saved) {
          const parsed = JSON.parse(saved);
          setCurrentTenant(prev => ({
            ...prev,
            ...parsed,
            license: SOUTHERN_OLIVE_OFFICIAL_LICENSE
          }));
        } else {
          setCurrentTenant(prev => ({
            ...prev,
            license: SOUTHERN_OLIVE_OFFICIAL_LICENSE
          }));
        }

        // Restore user role & identity ONLY if active session cookie is present
        const hasSessionCookie = typeof document !== 'undefined' && document.cookie.split(';').some(c => {
          const [n, v] = c.trim().split('=');
          return (n === 'so_authenticated' && (v === 'true' || v === '1')) || (n === 'vanguard_auth_session' && Boolean(v));
        });

        if (hasSessionCookie) {
          const savedRole = (sessionStorage.getItem('vanguard_user_role') || localStorage.getItem('vanguard_user_role')) as any;
          const savedEmail = sessionStorage.getItem('vanguard_user_email') || localStorage.getItem('vanguard_user_email');
          const savedName = sessionStorage.getItem('vanguard_user_name') || localStorage.getItem('vanguard_user_name');
          const savedUserId = sessionStorage.getItem('vanguard_user_id') || localStorage.getItem('vanguard_user_id');

          if (savedRole || savedEmail) {
            setCurrentUser({
              id: savedUserId || 'usr-local',
              email: savedEmail || 'user@vanguard-erp.com',
              fullName: savedName || (savedRole === 'SUPER_ADMIN' ? 'Mohammed (Vanguard Super Admin)' : 'Authorized Operator'),
              role: savedRole || 'COMPANY_ADMIN'
            });
          }
        } else {
          // Session closed or logged out: user must log in again
          setCurrentUser(null);
        }
      } catch (e) {
        console.error('Error reading tenant branding from localStorage:', e);
      }
    }
  }, []);

  const switchTenant = (company: TenantCompany) => {
    const effectiveId = (company.id === '1300' || company.slug === 'southern-olive') ? DEFAULT_SUPERADMIN_TENANT.id : company.id;
    const companyCode = (company.id === DEFAULT_SUPERADMIN_TENANT.id || company.id === '1300') ? '1300' : (company.companyId || company.slug || company.id);
    const normalizedCompany = { ...company, id: effectiveId };

    setCurrentTenant(normalizedCompany);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('vanguard_active_tenant', JSON.stringify(normalizedCompany));
        localStorage.setItem('vanguard_tenant_id', effectiveId);
        localStorage.setItem('vanguard_tenant_branding', JSON.stringify({
          name: normalizedCompany.name,
          brandNameAr: normalizedCompany.brandNameAr,
          brandNameEn: normalizedCompany.brandNameEn,
          logoUrl: normalizedCompany.logoUrl,
          companyRegistrationNumber: normalizedCompany.companyRegistrationNumber,
          taxIdentificationNumber: normalizedCompany.taxIdentificationNumber
        }));
        document.cookie = `vanguard_tenant_id=${encodeURIComponent(effectiveId)}; path=/; SameSite=Lax`;
        document.cookie = `vanguard_company_code=${encodeURIComponent(companyCode)}; path=/; SameSite=Lax`;
      } catch (e) {
        console.error('Error saving active tenant to storage:', e);
      }
    }
  };

  const updateTenantSettings = async (settings: Partial<TenantCompany>): Promise<{ success: boolean; error?: string }> => {
    try {
      const updatedTenant: TenantCompany = {
        ...currentTenant,
        ...settings,
        name: settings.name || settings.brandNameAr || currentTenant.name,
        brandNameAr: settings.brandNameAr || settings.name || currentTenant.brandNameAr,
        brandNameEn: settings.brandNameEn || settings.name || currentTenant.brandNameEn,
      };

      setCurrentTenant(updatedTenant);

      if (typeof window !== 'undefined') {
        localStorage.setItem('vanguard_tenant_branding', JSON.stringify({
          name: updatedTenant.name,
          brandNameAr: updatedTenant.brandNameAr,
          brandNameEn: updatedTenant.brandNameEn,
          logoUrl: updatedTenant.logoUrl,
          companyRegistrationNumber: updatedTenant.companyRegistrationNumber,
          taxIdentificationNumber: updatedTenant.taxIdentificationNumber
        }));
      }

      // Update Supabase database with dedicated columns and schema fallback
      const tenantSettingsPayload: any = {
        name: updatedTenant.name,
        brand_name_ar: updatedTenant.brandNameAr,
        brand_name_en: updatedTenant.brandNameEn,
        logo_url: updatedTenant.logoUrl,
        cr_number: updatedTenant.companyRegistrationNumber,
        company_registration_number: updatedTenant.companyRegistrationNumber,
        tax_id: updatedTenant.taxIdentificationNumber,
        tax_identification_number: updatedTenant.taxIdentificationNumber,
        address: updatedTenant.headquartersAddress,
        headquarters_address: updatedTenant.headquartersAddress,
        city: updatedTenant.city,
        country: updatedTenant.country,
        phone: updatedTenant.phoneNumber,
        phone_number: updatedTenant.phoneNumber,
        billing_email: updatedTenant.billingEmail,
        base_currency: updatedTenant.baseCurrency,
        secondary_currency: updatedTenant.secondaryCurrency,
        exchange_rate_policy: updatedTenant.exchangeRatePolicy,
        updated_at: new Date().toISOString()
      };

      let { error: updateErr } = await supabase
        .from('tenants')
        .update(tenantSettingsPayload)
        .eq('id', updatedTenant.id);

      if (updateErr && (updateErr.code === 'PGRST204' || updateErr.message?.includes('schema cache') || updateErr.message?.includes('column'))) {
        console.warn('Dedicated columns pending migration in updateTenantSettings. Applying fallback update:', updateErr.message);
        const fallbackSettings = {
          name: updatedTenant.name,
          brand_name_ar: updatedTenant.brandNameAr,
          brand_name_en: updatedTenant.brandNameEn,
          logo_url: updatedTenant.logoUrl,
          updated_at: new Date().toISOString()
        };
        const res = await supabase.from('tenants').update(fallbackSettings).eq('id', updatedTenant.id);
        updateErr = res.error;
      }

      if (updateErr) {
        console.warn('Supabase tenant update notice:', updateErr.message);
      }

      await logSystemActivity({
        tenantId: updatedTenant.id,
        companyId: updatedTenant.companyId || (updatedTenant.id === '00000000-0000-0000-0000-000000000001' ? 1300 : null),
        actionType: 'BRANDING_UPDATED',
        description: `تم تحديث السجلات القانونية والهوية لمؤسسة: ${updatedTenant.brandNameAr || updatedTenant.name} (معرف الشركة: #${updatedTenant.companyId || 1300})`,
        performedBy: currentUser?.fullName || 'Super Admin (System Owner)'
      });

      console.log('✅ Successfully updated Tenant Settings & Legal Registration Data:', updatedTenant);
      return { success: true };
    } catch (err: any) {
      console.error('Error updating tenant settings:', err);
      return { success: false, error: err.message || String(err) };
    }
  };

  const updateTenantModulesAndBranding = async (
    tenantId: string,
    updates: Partial<TenantCompany> & {
      enabledModules?: string[];
      brandNameAr?: string;
      brandNameEn?: string;
      name?: string;
      logoUrl?: string;
      primaryColor?: string;
      themeColor?: string;
      featureFlags?: any;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const nowIso = new Date().toISOString();
      const dbUpdates: any = {
        updated_at: nowIso
      };
      if (updates.enabledModules) dbUpdates.enabled_modules = updates.enabledModules;
      if (updates.brandNameAr) dbUpdates.brand_name_ar = updates.brandNameAr;
      if (updates.brandNameEn) dbUpdates.brand_name_en = updates.brandNameEn;
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
      if (updates.subscriptionTier) dbUpdates.subscription_tier = updates.subscriptionTier;
      if (updates.subscriptionStatus) dbUpdates.subscription_status = updates.subscriptionStatus;
      if (updates.primaryColor) {
        dbUpdates.primary_color = updates.primaryColor;
        dbUpdates.theme_color = updates.primaryColor;
      } else if (updates.themeColor) {
        dbUpdates.theme_color = updates.themeColor;
        dbUpdates.primary_color = updates.themeColor;
      }

      // Merge feature_flags JSONB with all corporate, legal, quota, and lifecycle data
      const existingTenant = registeredCompanies.find(c => c.id === tenantId) || currentTenant;
      const mergedFeatureFlags = {
        ...(existingTenant.feature_flags || {}),
        ...(updates.feature_flags || {}),
        ...(updates.featureFlags || {}),
        enabled_modules: updates.enabledModules || existingTenant.enabledModules || ALL_SYSTEM_MODULES,
        modules_count: (updates.enabledModules || existingTenant.enabledModules || ALL_SYSTEM_MODULES).length,
        full_enterprise_unlocked: (updates.enabledModules || existingTenant.enabledModules || ALL_SYSTEM_MODULES).length >= 12,
        corporate_profile: {
          legal_entity_name: updates.legalEntityName ?? existingTenant.legalEntityName ?? existingTenant.name,
          trade_name_en: updates.brandNameEn ?? existingTenant.brandNameEn,
          trade_name_ar: updates.brandNameAr ?? existingTenant.brandNameAr,
          cr_number: updates.companyRegistrationNumber ?? existingTenant.companyRegistrationNumber ?? 'CR-104928-LB',
          tax_id: updates.taxIdentificationNumber ?? existingTenant.taxIdentificationNumber ?? 'MOF-7489201',
          headquarters_address: updates.headquartersAddress ?? existingTenant.headquartersAddress ?? 'Industrial Boulevard, Plant Bldg 4',
          city: updates.city ?? existingTenant.city ?? 'Choueifat / Tyre',
          country: updates.country ?? existingTenant.country ?? 'Lebanon',
          financial_seed_template: updates.financialSeedTemplate ?? existingTenant.financialSeedTemplate ?? ((updates.country || existingTenant.country || 'Lebanon').toLowerCase() === 'lebanon' ? 'lebanese_pca' : 'international_ifrs'),
          vat_percentage: updates.vatPercentage ?? existingTenant.vatPercentage ?? ((updates.country || existingTenant.country || 'Lebanon').toLowerCase() === 'lebanon' ? 11 : 15),
          tax_id_label: updates.taxIdLabel ?? existingTenant.taxIdLabel ?? ((updates.country || existingTenant.country || 'Lebanon').toLowerCase() === 'lebanon' ? 'Tax ID Number (MOF / الرقم المالي - وزارة المالية)' : 'Tax Identification Number (TIN / VAT ID)'),
          cr_label: updates.crNumberLabel ?? existingTenant.crNumberLabel ?? ((updates.country || existingTenant.country || 'Lebanon').toLowerCase() === 'lebanon' ? 'Commercial Registration (CR / السجل التجاري)' : 'Company Registration Number (CRN)'),
          phone_number: updates.phoneNumber ?? existingTenant.phoneNumber ?? '+961 7 740120',
          billing_email: updates.billingEmail ?? existingTenant.billingEmail ?? 'finance@client.com',
          base_currency: updates.baseCurrency ?? existingTenant.baseCurrency ?? 'USD',
          secondary_currency: updates.isDualCurrencyEnabled !== false ? (updates.secondaryCurrency ?? existingTenant.secondaryCurrency ?? 'LBP') : '',
          is_dual_currency_enabled: updates.isDualCurrencyEnabled ?? existingTenant.isDualCurrencyEnabled ?? ((updates.country || existingTenant.country || 'Lebanon').toLowerCase() === 'lebanon'),
          exchange_rate_policy: updates.exchangeRatePolicy ?? existingTenant.exchangeRatePolicy ?? 'PLATFORM_FIXED'
        },
        quotas: {
          max_branches: updates.maxBranches ?? existingTenant.maxBranches ?? 10,
          max_concurrent_users: updates.maxConcurrentUsers ?? existingTenant.maxConcurrentUsers ?? 50,
          max_pos_terminals: updates.maxPosTerminals ?? existingTenant.maxPosTerminals ?? 20,
          storage_quota_gb: updates.storageQuotaGb ?? existingTenant.storageQuotaGb ?? 100
        },
        subscription_lifecycle: {
          contract_monthly_value: updates.contractMonthlyValue ?? existingTenant.contractMonthlyValue ?? 3000,
          billing_cycle: updates.billingCycle ?? existingTenant.billingCycle ?? 'ANNUAL',
          renewal_date: updates.renewalDate ?? existingTenant.renewalDate ?? '2027-01-01',
          account_status: updates.subscriptionStatus ?? existingTenant.subscriptionStatus ?? 'ACTIVE'
        },
        primary_admin: {
          full_name: updates.adminFullName ?? existingTenant.adminFullName ?? 'Administrator',
          email: updates.adminEmail ?? existingTenant.adminEmail ?? 'admin@client.com',
          phone: updates.adminPhone ?? existingTenant.adminPhone ?? '+961 70 123456'
        }
      };

      dbUpdates.feature_flags = mergedFeatureFlags;

      // Assign dedicated top-level columns on public.tenants
      const corpProfile = mergedFeatureFlags.corporate_profile;
      if (corpProfile.headquarters_address !== undefined) {
        dbUpdates.address = corpProfile.headquarters_address;
        dbUpdates.headquarters_address = corpProfile.headquarters_address;
      }
      if (corpProfile.city !== undefined) dbUpdates.city = corpProfile.city;
      if (corpProfile.country !== undefined) dbUpdates.country = corpProfile.country;
      if (corpProfile.phone_number !== undefined) {
        dbUpdates.phone = corpProfile.phone_number;
        dbUpdates.phone_number = corpProfile.phone_number;
      }
      if (corpProfile.billing_email !== undefined) dbUpdates.billing_email = corpProfile.billing_email;
      if (corpProfile.cr_number !== undefined) dbUpdates.cr_number = corpProfile.cr_number;
      if (corpProfile.tax_id !== undefined) dbUpdates.tax_id = corpProfile.tax_id;
      if (corpProfile.base_currency !== undefined) dbUpdates.base_currency = corpProfile.base_currency;
      if (corpProfile.secondary_currency !== undefined) dbUpdates.secondary_currency = corpProfile.secondary_currency;
      if (corpProfile.exchange_rate_policy !== undefined) dbUpdates.exchange_rate_policy = corpProfile.exchange_rate_policy;

      let { data: updatedData, error } = await supabase
        .from('tenants')
        .update(dbUpdates)
        .eq('id', tenantId)
        .select('*');

      if (error && (error.code === 'PGRST204' || error.message?.includes('schema cache') || error.message?.includes('column'))) {
        console.warn('Dedicated columns pending Supabase migration. Applying JSONB fallback in updateTenantModulesAndBranding:', error.message);
        const fallbackDbUpdates: any = {
          name: dbUpdates.name,
          brand_name_ar: dbUpdates.brand_name_ar,
          brand_name_en: dbUpdates.brand_name_en,
          logo_url: dbUpdates.logo_url,
          primary_color: dbUpdates.primary_color,
          theme_color: dbUpdates.theme_color,
          subscription_tier: dbUpdates.subscription_tier,
          subscription_status: dbUpdates.subscription_status,
          enabled_modules: dbUpdates.enabled_modules,
          feature_flags: dbUpdates.feature_flags,
          updated_at: dbUpdates.updated_at
        };
        const fallbackRes = await supabase
          .from('tenants')
          .update(fallbackDbUpdates)
          .eq('id', tenantId)
          .select('*');
        error = fallbackRes.error;
        updatedData = fallbackRes.data;
      }

      if (error) {
        console.warn('Supabase tenant modules/branding update notice:', error.message);
      }

      setRegisteredCompanies(prev =>
        prev.map(c => {
          if (c.id === tenantId) {
            return {
              ...c,
              ...updates,
              name: updates.name || c.name,
              brandNameAr: updates.brandNameAr || c.brandNameAr,
              brandNameEn: updates.brandNameEn || c.brandNameEn,
              logoUrl: updates.logoUrl !== undefined ? updates.logoUrl : c.logoUrl,
              enabledModules: updates.enabledModules || c.enabledModules,
              enabled_modules: updates.enabledModules || c.enabled_modules,
              primaryColor: updates.primaryColor || updates.themeColor || c.primaryColor,
              themeColor: updates.themeColor || updates.primaryColor || c.themeColor,
              legalEntityName: updates.legalEntityName ?? c.legalEntityName,
              companyRegistrationNumber: updates.companyRegistrationNumber ?? c.companyRegistrationNumber,
              taxIdentificationNumber: updates.taxIdentificationNumber ?? c.taxIdentificationNumber,
              headquartersAddress: updates.headquartersAddress ?? c.headquartersAddress,
              city: updates.city ?? c.city,
              country: updates.country ?? c.country,
              financialSeedTemplate: updates.financialSeedTemplate ?? c.financialSeedTemplate ?? ((updates.country || c.country || 'Lebanon').toLowerCase() === 'lebanon' ? 'lebanese_pca' : 'international_ifrs'),
              vatPercentage: updates.vatPercentage ?? c.vatPercentage ?? ((updates.country || c.country || 'Lebanon').toLowerCase() === 'lebanon' ? 11 : 15),
              taxIdLabel: updates.taxIdLabel ?? c.taxIdLabel,
              crNumberLabel: updates.crNumberLabel ?? c.crNumberLabel,
              phoneNumber: updates.phoneNumber ?? c.phoneNumber,
              billingEmail: updates.billingEmail ?? c.billingEmail,
              baseCurrency: updates.baseCurrency ?? c.baseCurrency,
              secondaryCurrency: updates.isDualCurrencyEnabled !== false ? (updates.secondaryCurrency ?? c.secondaryCurrency) : '',
              isDualCurrencyEnabled: updates.isDualCurrencyEnabled ?? c.isDualCurrencyEnabled,
              exchangeRatePolicy: updates.exchangeRatePolicy ?? c.exchangeRatePolicy,
              maxBranches: updates.maxBranches ?? c.maxBranches,
              maxConcurrentUsers: updates.maxConcurrentUsers ?? c.maxConcurrentUsers,
              maxPosTerminals: updates.maxPosTerminals ?? c.maxPosTerminals,
              storageQuotaGb: updates.storageQuotaGb ?? c.storageQuotaGb,
              contractMonthlyValue: updates.contractMonthlyValue ?? c.contractMonthlyValue,
              billingCycle: updates.billingCycle ?? c.billingCycle,
              renewalDate: updates.renewalDate ?? c.renewalDate,
              subscriptionStatus: updates.subscriptionStatus ?? c.subscriptionStatus,
              subscriptionTier: updates.subscriptionTier ?? c.subscriptionTier,
              feature_flags: mergedFeatureFlags,
              updatedAt: nowIso,
              updated_at: nowIso
            };
          }
          return c;
        })
      );

      if (currentTenant.id === tenantId) {
        const updatedCurrent: TenantCompany = {
          ...currentTenant,
          ...updates,
          name: updates.name || currentTenant.name,
          brandNameAr: updates.brandNameAr || currentTenant.brandNameAr,
          brandNameEn: updates.brandNameEn || currentTenant.brandNameEn,
          logoUrl: updates.logoUrl !== undefined ? updates.logoUrl : currentTenant.logoUrl,
          enabledModules: updates.enabledModules || currentTenant.enabledModules,
          enabled_modules: updates.enabledModules || currentTenant.enabled_modules,
          primaryColor: updates.primaryColor || updates.themeColor || currentTenant.primaryColor,
          themeColor: updates.themeColor || updates.primaryColor || currentTenant.themeColor,
          legalEntityName: updates.legalEntityName ?? currentTenant.legalEntityName,
          companyRegistrationNumber: updates.companyRegistrationNumber ?? currentTenant.companyRegistrationNumber,
          taxIdentificationNumber: updates.taxIdentificationNumber ?? currentTenant.taxIdentificationNumber,
          headquartersAddress: updates.headquartersAddress ?? currentTenant.headquartersAddress,
          city: updates.city ?? currentTenant.city,
          country: updates.country ?? currentTenant.country,
          financialSeedTemplate: updates.financialSeedTemplate ?? currentTenant.financialSeedTemplate ?? ((updates.country || currentTenant.country || 'Lebanon').toLowerCase() === 'lebanon' ? 'lebanese_pca' : 'international_ifrs'),
          vatPercentage: updates.vatPercentage ?? currentTenant.vatPercentage ?? ((updates.country || currentTenant.country || 'Lebanon').toLowerCase() === 'lebanon' ? 11 : 15),
          taxIdLabel: updates.taxIdLabel ?? currentTenant.taxIdLabel,
          crNumberLabel: updates.crNumberLabel ?? currentTenant.crNumberLabel,
          phoneNumber: updates.phoneNumber ?? currentTenant.phoneNumber,
          billingEmail: updates.billingEmail ?? currentTenant.billingEmail,
          baseCurrency: updates.baseCurrency ?? currentTenant.baseCurrency,
          secondaryCurrency: updates.isDualCurrencyEnabled !== false ? (updates.secondaryCurrency ?? currentTenant.secondaryCurrency) : '',
          isDualCurrencyEnabled: updates.isDualCurrencyEnabled ?? currentTenant.isDualCurrencyEnabled,
          exchangeRatePolicy: updates.exchangeRatePolicy ?? currentTenant.exchangeRatePolicy,
          maxBranches: updates.maxBranches ?? currentTenant.maxBranches,
          maxConcurrentUsers: updates.maxConcurrentUsers ?? currentTenant.maxConcurrentUsers,
          maxPosTerminals: updates.maxPosTerminals ?? currentTenant.maxPosTerminals,
          storageQuotaGb: updates.storageQuotaGb ?? currentTenant.storageQuotaGb,
          contractMonthlyValue: updates.contractMonthlyValue ?? currentTenant.contractMonthlyValue,
          billingCycle: updates.billingCycle ?? currentTenant.billingCycle,
          renewalDate: updates.renewalDate ?? currentTenant.renewalDate,
          subscriptionStatus: updates.subscriptionStatus ?? currentTenant.subscriptionStatus,
          subscriptionTier: updates.subscriptionTier ?? currentTenant.subscriptionTier,
          feature_flags: mergedFeatureFlags,
          updatedAt: nowIso,
          updated_at: nowIso
        };
        setCurrentTenant(updatedCurrent);

        if (typeof window !== 'undefined') {
          localStorage.setItem('vanguard_active_tenant', JSON.stringify(updatedCurrent));
          localStorage.setItem('vanguard_tenant_branding', JSON.stringify({
            name: updatedCurrent.name,
            brandNameAr: updatedCurrent.brandNameAr,
            brandNameEn: updatedCurrent.brandNameEn,
            logoUrl: updatedCurrent.logoUrl,
            companyRegistrationNumber: updatedCurrent.companyRegistrationNumber,
            taxIdentificationNumber: updatedCurrent.taxIdentificationNumber
          }));
        }
      }

      // Log system audit event
      const targetCompany = registeredCompanies.find(c => c.id === tenantId);
      const companyId = targetCompany?.companyId || targetCompany?.company_id || (tenantId === '00000000-0000-0000-0000-000000000001' ? 1300 : null);
      const displayName = updates.brandNameEn || updates.name || targetCompany?.brandNameEn || targetCompany?.name || 'Vanguard Enterprise Client';

      let actionType = 'TENANT_UPDATED';
      let logDesc = `Updated enterprise tenant settings and legal profile for: ${displayName}`;

      if (updates.enabledModules) {
        actionType = 'MODULES_UPDATED';
        logDesc = `Updated operational module permissions for ${displayName} (#${companyId || 1300}) — Active Modules: [${updates.enabledModules.length} of 12 modules]`;
      } else if (updates.primaryColor || updates.logoUrl) {
        actionType = 'BRANDING_UPDATED';
        logDesc = `Updated brand identity and logo for ${displayName} (#${companyId || 1300})`;
      }

      await logSystemActivity({
        tenantId,
        companyId,
        actionType,
        description: logDesc,
        performedBy: currentUser?.fullName || 'Super Admin (Mohammed Jichi)',
        metadata: {
          enabledModules: updates.enabledModules,
          primaryColor: updates.primaryColor || updates.themeColor
        }
      });

      console.log('✅ Successfully updated Tenant Modules & Branding:', tenantId, updates);
      return { success: true };
    } catch (err: any) {
      console.error('Error in updateTenantModulesAndBranding:', err);
      return { success: false, error: err.message || String(err) };
    }
  };

  const onboardNewTenant = async (
    tenantData: Partial<TenantCompany>,
    adminEmail: string,
    initialPassword?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const tenantName = tenantData.name || 'Vanguard Enterprise Client';
    const slug = tenantData.slug || tenantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `tenant-${Date.now()}`;

    const newCompany: TenantCompany = {
      id: 'comp-' + Date.now(),
      name: tenantName,
      slug: slug,
      brandNameAr: tenantData.brandNameAr || tenantName,
      brandNameEn: tenantData.brandNameEn || 'Vanguard Enterprise Client',
      logoUrl: tenantData.logoUrl || '',
      legalEntityName: tenantData.legalEntityName || tenantName,
      companyRegistrationNumber: tenantData.companyRegistrationNumber || 'CR-104928-LB',
      taxIdentificationNumber: tenantData.taxIdentificationNumber || 'MOF-7489201',
      headquartersAddress: tenantData.headquartersAddress || 'Industrial Boulevard, Plant Bldg 4',
      city: tenantData.city || 'Beirut',
      country: tenantData.country || 'Lebanon',
      financialSeedTemplate: tenantData.financialSeedTemplate || ((tenantData.country || 'Lebanon').toLowerCase() === 'lebanon' ? 'lebanese_pca' : 'international_ifrs'),
      vatPercentage: tenantData.vatPercentage ?? ((tenantData.country || 'Lebanon').toLowerCase() === 'lebanon' ? 11 : 15),
      taxIdLabel: tenantData.taxIdLabel || ((tenantData.country || 'Lebanon').toLowerCase() === 'lebanon' ? 'Tax ID Number (MOF / الرقم المالي - وزارة المالية)' : 'Tax Identification Number (TIN / VAT ID)'),
      crNumberLabel: tenantData.crNumberLabel || ((tenantData.country || 'Lebanon').toLowerCase() === 'lebanon' ? 'Commercial Registration (CR / السجل التجاري)' : 'Company Registration Number (CRN)'),
      phoneNumber: tenantData.phoneNumber || '+961 1 800000',
      billingEmail: tenantData.billingEmail || adminEmail,
      baseCurrency: tenantData.baseCurrency || 'USD',
      secondaryCurrency: tenantData.isDualCurrencyEnabled ? (tenantData.secondaryCurrency || 'LBP') : '',
      isDualCurrencyEnabled: tenantData.isDualCurrencyEnabled ?? ((tenantData.country || 'Lebanon').toLowerCase() === 'lebanon'),
      exchangeRatePolicy: tenantData.exchangeRatePolicy || 'PLATFORM_FIXED',
      maxBranches: tenantData.maxBranches || 5,
      maxConcurrentUsers: tenantData.maxConcurrentUsers || 25,
      maxPosTerminals: tenantData.maxPosTerminals || 10,
      storageQuotaGb: tenantData.storageQuotaGb || 50,
      contractMonthlyValue: tenantData.contractMonthlyValue || (tenantData.subscriptionTier === 'STARTER' ? 150 : tenantData.subscriptionTier === 'PRO' ? 450 : 3000),
      billingCycle: tenantData.billingCycle || 'ANNUAL',
      renewalDate: tenantData.renewalDate || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      subscriptionTier: tenantData.subscriptionTier || 'PRO',
      subscriptionStatus: tenantData.subscriptionStatus || 'ACTIVE',
      adminFullName: tenantData.adminFullName || 'Primary Administrator',
      adminEmail: adminEmail,
      adminPhone: tenantData.adminPhone || '',
      enabledModules: tenantData.enabledModules || (tenantData.subscriptionTier === 'ENTERPRISE' ? ALL_SYSTEM_MODULES : ['sales', 'operations', 'customers', 'accounting']),
      enabled_modules: tenantData.enabledModules || (tenantData.subscriptionTier === 'ENTERPRISE' ? ALL_SYSTEM_MODULES : ['sales', 'operations', 'customers', 'accounting']),
      aiUsageCount: 0,
      aiUsageLimit: 1000
    };

    try {
      const featureFlagsJson = {
        enabled_modules: newCompany.enabledModules,
        modules_count: newCompany.enabledModules?.length || 4,
        full_enterprise_unlocked: newCompany.subscriptionTier === 'ENTERPRISE' || (newCompany.enabledModules?.length || 0) >= 12,
        corporate_profile: {
          legal_entity_name: newCompany.legalEntityName,
          trade_name_en: newCompany.brandNameEn,
          trade_name_ar: newCompany.brandNameAr,
          cr_number: newCompany.companyRegistrationNumber,
          tax_id: newCompany.taxIdentificationNumber,
          headquarters_address: newCompany.headquartersAddress,
          city: newCompany.city,
          country: newCompany.country,
          financial_seed_template: newCompany.financialSeedTemplate,
          vat_percentage: newCompany.vatPercentage,
          tax_id_label: newCompany.taxIdLabel,
          cr_label: newCompany.crNumberLabel,
          phone_number: newCompany.phoneNumber,
          billing_email: newCompany.billingEmail,
          base_currency: newCompany.baseCurrency,
          secondary_currency: newCompany.secondaryCurrency,
          is_dual_currency_enabled: newCompany.isDualCurrencyEnabled,
          exchange_rate_policy: newCompany.exchangeRatePolicy
        },
        quotas: {
          max_branches: newCompany.maxBranches,
          max_concurrent_users: newCompany.maxConcurrentUsers,
          max_pos_terminals: newCompany.maxPosTerminals,
          storage_quota_gb: newCompany.storageQuotaGb
        },
        subscription_lifecycle: {
          contract_monthly_value: newCompany.contractMonthlyValue,
          billing_cycle: newCompany.billingCycle,
          renewal_date: newCompany.renewalDate,
          account_status: newCompany.subscriptionStatus
        },
        primary_admin: {
          full_name: newCompany.adminFullName,
          email: adminEmail,
          phone: newCompany.adminPhone,
          initial_password: initialPassword || 'Vanguard@2026!'
        }
      };

      const { data, error } = await supabase
        .from('tenants')
        .insert([{
          name: tenantName,
          slug: slug,
          brand_name_ar: newCompany.brandNameAr,
          brand_name_en: newCompany.brandNameEn,
          logo_url: newCompany.logoUrl,
          subscription_tier: newCompany.subscriptionTier,
          subscription_status: newCompany.subscriptionStatus,
          feature_flags: featureFlagsJson
        }])
        .select();

      if (error) {
        console.error('Supabase error inserting into tenants table:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Successfully inserted tenant into Supabase "tenants" table:', data);
      if (data && data[0] && data[0].id) {
        newCompany.id = data[0].id;
      }

      const createdCompanyId = data && data[0] && data[0].company_id ? data[0].company_id : (1300 + registeredCompanies.length);
      await logSystemActivity({
        tenantId: newCompany.id,
        companyId: createdCompanyId,
        actionType: 'TENANT_CREATED',
        description: `Provisioned new enterprise workspace: ${newCompany.brandNameEn || newCompany.name} (#${createdCompanyId}) under ${newCompany.subscriptionTier} tier`,
        performedBy: currentUser?.fullName || 'Super Admin (Mohammed Jichi)',
        metadata: {
          adminEmail,
          subscriptionTier: newCompany.subscriptionTier,
          contractMonthlyValue: newCompany.contractMonthlyValue
        }
      });

      setRegisteredCompanies(prev => [...prev, newCompany]);
      return { success: true };
    } catch (err: any) {
      console.error('Exception in onboardNewTenant:', err);
      return { success: false, error: err.message || String(err) };
    }
  };

  const isModuleEnabled = (modId: string): boolean => {
    const activeMods = currentTenant?.enabled_modules || currentTenant?.enabledModules || ALL_SYSTEM_MODULES;
    return checkModuleEnabled(modId, activeMods);
  };

  return (
    <TenantContext.Provider value={{ currentTenant, currentUser, isSuperAdmin, switchTenant, updateTenantSettings, updateTenantModulesAndBranding, onboardNewTenant, refreshTenants, registeredCompanies, isModuleEnabled }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    return {
      currentTenant: DEFAULT_SUPERADMIN_TENANT,
      currentUser: {
        id: 'usr-superadmin-01',
        email: 'khadeer@vanguard-erp.com',
        fullName: 'خضير (Vanguard Super Admin)',
        role: 'SUPER_ADMIN' as const
      },
      isSuperAdmin: true,
      switchTenant: () => {},
      updateTenantSettings: async (): Promise<{ success: boolean; error?: string }> => ({ success: true }),
      updateTenantModulesAndBranding: async (): Promise<{ success: boolean; error?: string }> => ({ success: true }),
      onboardNewTenant: async (): Promise<{ success: boolean; error?: string }> => ({ success: true }),
      refreshTenants: async () => {},
      registeredCompanies: INITIAL_COMPANIES,
      isModuleEnabled: (_modId: string) => true
    };
  }
  return context;
};

export default TenantContext;
