'use client';
/**
 * SOUTHERN OLIVE & OIL PRODUCTS S.A.R.L. / VANGUARD ERP
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
  onboardNewTenant: (tenantData: Partial<TenantCompany>, adminEmail: string) => Promise<{ success: boolean; error?: string }>;
  refreshTenants: () => Promise<void>;
  registeredCompanies: TenantCompany[];
}

const DEFAULT_SUPERADMIN_TENANT: TenantCompany = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Vanguard Enterprise',
  slug: 'vanguard-enterprise',
  brandNameAr: 'المؤسسة المعتمدة',
  brandNameEn: 'Vanguard Enterprise Client',
  logoUrl: '',
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
    email: 'khadeer@vanguard-erp.com',
    fullName: 'خضير (Vanguard Super Admin)',
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

  const switchTenant = (company: TenantCompany) => {
    setCurrentTenant(company);
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
    <TenantContext.Provider value={{ currentTenant, currentUser, isSuperAdmin, switchTenant, onboardNewTenant, refreshTenants, registeredCompanies }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export default TenantContext;
