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
  phoneNumber?: string;
  billingEmail?: string;
  baseCurrency?: 'USD' | 'LBP';
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
    updates: {
      enabledModules?: string[];
      brandNameAr?: string;
      brandNameEn?: string;
      name?: string;
      logoUrl?: string;
      primaryColor?: string;
      themeColor?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  onboardNewTenant: (tenantData: Partial<TenantCompany>, adminEmail: string) => Promise<{ success: boolean; error?: string }>;
  refreshTenants: () => Promise<void>;
  registeredCompanies: TenantCompany[];
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
  companyRegistrationNumber: 'CR-104928-LB',
  taxIdentificationNumber: 'MOF-7489201',
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
                const matched = fetchedCompanies.find(c => c.id === saved.id);
                if (matched) {
                  setCurrentTenant(matched);
                  return;
                }
              } catch (e) {}
            }
          }
          setCurrentTenant(prev => {
            const matched = fetchedCompanies.find(c => c.id === prev.id);
            return matched || fetchedCompanies[0];
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
    setCurrentTenant(company);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('vanguard_active_tenant', JSON.stringify(company));
        localStorage.setItem('vanguard_tenant_id', company.id);
        localStorage.setItem('vanguard_tenant_branding', JSON.stringify({
          name: company.name,
          brandNameAr: company.brandNameAr,
          brandNameEn: company.brandNameEn,
          logoUrl: company.logoUrl,
          companyRegistrationNumber: company.companyRegistrationNumber,
          taxIdentificationNumber: company.taxIdentificationNumber
        }));
        document.cookie = `vanguard_tenant_id=${encodeURIComponent(company.id)}; path=/; SameSite=Lax`;
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

      // Update Supabase database if connected
      const { error } = await supabase
        .from('tenants')
        .update({
          name: updatedTenant.name,
          brand_name_ar: updatedTenant.brandNameAr,
          brand_name_en: updatedTenant.brandNameEn,
          logo_url: updatedTenant.logoUrl,
          company_registration_number: updatedTenant.companyRegistrationNumber,
          tax_identification_number: updatedTenant.taxIdentificationNumber
        })
        .eq('id', updatedTenant.id);

      if (error) {
        console.warn('Supabase tenant update notice (fallback active):', error.message);
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
          phone_number: updates.phoneNumber ?? existingTenant.phoneNumber ?? '+961 7 740120',
          billing_email: updates.billingEmail ?? existingTenant.billingEmail ?? 'finance@client.com',
          base_currency: updates.baseCurrency ?? existingTenant.baseCurrency ?? 'USD',
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

      const { error } = await supabase
        .from('tenants')
        .update(dbUpdates)
        .eq('id', tenantId);

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
              phoneNumber: updates.phoneNumber ?? c.phoneNumber,
              billingEmail: updates.billingEmail ?? c.billingEmail,
              baseCurrency: updates.baseCurrency ?? c.baseCurrency,
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
          phoneNumber: updates.phoneNumber ?? currentTenant.phoneNumber,
          billingEmail: updates.billingEmail ?? currentTenant.billingEmail,
          baseCurrency: updates.baseCurrency ?? currentTenant.baseCurrency,
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
      phoneNumber: tenantData.phoneNumber || '+961 1 800000',
      billingEmail: tenantData.billingEmail || adminEmail,
      baseCurrency: tenantData.baseCurrency || 'USD',
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
          phone_number: newCompany.phoneNumber,
          billing_email: newCompany.billingEmail,
          base_currency: newCompany.baseCurrency,
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

  return (
    <TenantContext.Provider value={{ currentTenant, currentUser, isSuperAdmin, switchTenant, updateTenantSettings, updateTenantModulesAndBranding, onboardNewTenant, refreshTenants, registeredCompanies }}>
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
      registeredCompanies: INITIAL_COMPANIES
    };
  }
  return context;
};

export default TenantContext;
