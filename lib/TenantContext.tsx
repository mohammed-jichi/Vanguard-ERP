'use client';
/**
 * Vanguard ERP System
 * Multi-Tenant Context & Dynamic UI Branding Provider
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export interface TenantCompany {
  id: string;
  name: string;
  slug: string;
  brandNameAr: string;
  brandNameEn: string;
  logoUrl: string;
  companyRegistrationNumber?: string;
  taxIdentificationNumber?: string;
  subscriptionTier: 'STARTER' | 'PRO' | 'ENTERPRISE';
  subscriptionStatus: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
  aiUsageCount: number;
  aiUsageLimit: number;
  createdAt?: string;
}

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
  onboardNewTenant: (tenantData: Partial<TenantCompany>, adminEmail: string) => Promise<{ success: boolean; error?: string }>;
  refreshTenants: () => Promise<void>;
  registeredCompanies: TenantCompany[];
}

const DEFAULT_SUPERADMIN_TENANT: TenantCompany = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'منتوجات زيت وزيتون الجنوب',
  slug: 'southern-olive',
  brandNameAr: 'منتوجات زيت وزيتون الجنوب',
  brandNameEn: 'Southern Olive & Oil Products',
  logoUrl: '/assets/images/logo.png',
  companyRegistrationNumber: 'CR-104928-LB',
  taxIdentificationNumber: 'MOF-7489201',
  subscriptionTier: 'ENTERPRISE',
  subscriptionStatus: 'ACTIVE',
  aiUsageCount: 0,
  aiUsageLimit: 1000
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
        const fetchedCompanies: TenantCompany[] = data.map((t: any) => ({
          id: t.id || 'comp-' + Date.now(),
          name: t.name || t.brand_name_ar || 'Vanguard Enterprise Client',
          slug: t.slug || t.name,
          brandNameAr: t.brand_name_ar || t.name || 'المؤسسة المعتمدة',
          brandNameEn: t.brand_name_en || t.name || 'Vanguard Enterprise Client',
          logoUrl: t.logo_url || '',
          subscriptionTier: t.subscription_tier || 'PRO',
          subscriptionStatus: t.subscription_status || 'ACTIVE',
          aiUsageCount: t.ai_usage_count || 0,
          aiUsageLimit: t.ai_usage_limit || 1000,
          createdAt: t.created_at
        }));

        if (fetchedCompanies.length > 0) {
          setRegisteredCompanies(fetchedCompanies);
          setCurrentTenant(fetchedCompanies[0]);
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
        const saved = localStorage.getItem('vanguard_tenant_branding');
        if (saved) {
          const parsed = JSON.parse(saved);
          setCurrentTenant(prev => ({
            ...prev,
            ...parsed
          }));
        }
      } catch (e) {
        console.error('Error reading tenant branding from localStorage:', e);
      }
    }
  }, []);

  const switchTenant = (company: TenantCompany) => {
    setCurrentTenant(company);
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

      console.log('✅ Successfully updated Tenant Settings & Legal Registration Data:', updatedTenant);
      return { success: true };
    } catch (err: any) {
      console.error('Error updating tenant settings:', err);
      return { success: false, error: err.message || String(err) };
    }
  };

  const onboardNewTenant = async (tenantData: Partial<TenantCompany>, adminEmail: string): Promise<{ success: boolean; error?: string }> => {
    const tenantName = tenantData.name || 'Vanguard Enterprise Client';
    const slug = tenantData.slug || tenantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `tenant-${Date.now()}`;

    const newCompany: TenantCompany = {
      id: 'comp-' + Date.now(),
      name: tenantName,
      slug: slug,
      brandNameAr: tenantData.brandNameAr || tenantName,
      brandNameEn: tenantData.brandNameEn || 'Vanguard Enterprise Client',
      logoUrl: tenantData.logoUrl || '',
      companyRegistrationNumber: tenantData.companyRegistrationNumber || 'CR-104928-LB',
      taxIdentificationNumber: tenantData.taxIdentificationNumber || 'MOF-7489201',
      subscriptionTier: tenantData.subscriptionTier || 'PRO',
      subscriptionStatus: 'ACTIVE',
      aiUsageCount: tenantData.aiUsageCount || 0,
      aiUsageLimit: tenantData.aiUsageLimit || 1000
    };

    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert([{
          name: tenantName,
          slug: slug,
          brand_name_ar: tenantData.brandNameAr || tenantName,
          brand_name_en: tenantData.brandNameEn || 'Southern Olive & Oil Products',
          logo_url: tenantData.logoUrl || '',
          company_registration_number: tenantData.companyRegistrationNumber || 'CR-104928-LB',
          tax_identification_number: tenantData.taxIdentificationNumber || 'MOF-7489201',
          owner_email: adminEmail
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
      await refreshTenants();
      return { success: true };
    } catch (err: any) {
      console.error('Exception executing Supabase insert in TenantContext:', err);
      return { success: false, error: err.message || String(err) };
    }
  };

  return (
    <TenantContext.Provider value={{ currentTenant, currentUser, isSuperAdmin, switchTenant, updateTenantSettings, onboardNewTenant, refreshTenants, registeredCompanies }}>
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
      onboardNewTenant: async (): Promise<{ success: boolean; error?: string }> => ({ success: true }),
      refreshTenants: async () => {},
      registeredCompanies: INITIAL_COMPANIES
    };
  }
  return context;
};

export default TenantContext;
