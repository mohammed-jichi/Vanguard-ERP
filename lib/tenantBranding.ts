/**
 * Vanguard ERP - Multi-Tenant Industry Branding Profiles
 * Canonical definitions for tenant branding, thematic backdrops, and corporate identities.
 */

export interface TenantBrandingProfile {
  id: string;
  code: string;
  name: string;
  legalName: string;
  industry: string;
  backdropUrl: string;
  accentColor: string;
  logoUrl?: string;
  companyId?: number | string;
  commercialNameEn?: string;
  headOfficeAddress?: string;
  website?: string;
  phone?: string;
  dispatchPhone?: string;
  defaultFacility?: string;
  defaultFacilityAddress?: string;
  tagline?: string;
  themeStyle?: 'emerald' | 'amber' | 'slate' | 'navy';
}

export const TENANT_BRANDING_PROFILES: Record<string, TenantBrandingProfile> = {
  "1300": {
    id: "tenant_1300",
    code: "1300",
    name: "Southern Olive Oil",
    legalName: "منتوجات زيت وزيتون الجنوب ش.م.م",
    industry: "Olive Oil Extraction, Agro-Processing & FMCG",
    backdropUrl: "/assets/branding/tenants/1300-olive-grove-press.webp",
    accentColor: "#059669",
    logoUrl: "/assets/branding/tenants/1300-logo.webp",
    companyId: 1300,
    commercialNameEn: "Southern Olive Oil S.A.R.L.",
    headOfficeAddress: "Choueifat Central Highway, Lebanon",
    website: "www.southernolive-lb.com",
    phone: "+961 05 430 000",
    dispatchPhone: "+961 70 000 000",
    defaultFacility: "Facility: Choueifat Main Plant",
    defaultFacilityAddress: "Industrial Zone, Old Saida Rd",
    tagline: "Premium Olive Oil Extraction & Modern Agro-Industrial Operations",
    themeStyle: "emerald",
  },
  "SO-OLIVE": {
    id: "tenant_1300",
    code: "SO-OLIVE",
    name: "Southern Olive Oil",
    legalName: "منتوجات زيت وزيتون الجنوب ش.م.م",
    industry: "Olive Oil Extraction, Agro-Processing & FMCG",
    backdropUrl: "/assets/branding/tenants/1300-olive-grove-press.webp",
    accentColor: "#059669",
    logoUrl: "/assets/branding/tenants/1300-logo.webp",
    companyId: 1300,
    commercialNameEn: "Southern Olive Oil S.A.R.L.",
    headOfficeAddress: "Choueifat Central Highway, Lebanon",
    website: "www.southernolive-lb.com",
    phone: "+961 05 430 000",
    dispatchPhone: "+961 70 000 000",
    defaultFacility: "Facility: Choueifat Main Plant",
    defaultFacilityAddress: "Industrial Zone, Old Saida Rd",
    tagline: "Premium Olive Oil Extraction & Modern Agro-Industrial Operations",
    themeStyle: "emerald",
  },
  "ADMIN": {
    id: "tenant_admin",
    code: "ADMIN",
    name: "Vanguard System Master",
    legalName: "مركز إدارة فانغارد للمؤسسات",
    industry: "Enterprise Cloud Infrastructure & ERP Governance",
    backdropUrl: "",
    accentColor: "#ab8320",
    logoUrl: "/vanguard.jpg",
    companyId: "ADMIN",
    commercialNameEn: "Vanguard Enterprise Systems",
    headOfficeAddress: "Technology Park, Beirut, Lebanon",
    website: "www.vanguard-erp.net",
    phone: "+961 01 980 000",
    dispatchPhone: "+961 71 000 000",
    defaultFacility: "Facility: Central Enterprise Cloud",
    defaultFacilityAddress: "Vanguard High-Availability Cloud Core",
    themeStyle: "amber",
  },
};

/**
 * Resolves a branding profile given any tenant ID, code, or alias.
 */
export function getTenantBranding(tenantId?: string | number | null): TenantBrandingProfile | null {
  if (!tenantId) return null;
  const key = String(tenantId).trim().toUpperCase();
  return TENANT_BRANDING_PROFILES[key] || TENANT_BRANDING_PROFILES[String(tenantId).trim()] || null;
}

/**
 * Checks if the tenant ID represents Tenant 1300 (Southern Olive Oil)
 */
export function isTenant1300(tenantId?: string | number | null): boolean {
  if (!tenantId) return false;
  const key = String(tenantId).trim().toLowerCase();
  return (
    key === '1300' ||
    key === 'so-olive' ||
    key === 'southern-olive' ||
    key === 'southernolive'
  );
}
