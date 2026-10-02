/**
 * Vanguard ERP - Canonical Tenant Facilities Registry & Store
 * Single Source of Truth for physical branch facilities, commercial hubs, and depots.
 */

'use client';

import { useMemo } from 'react';
import { useTenant, TenantCompany } from '@/lib/TenantContext';

export interface TenantFacility {
  id: string; // '1300'
  facilityId: number; // 1300
  branchId: number; // 1
  branchName: string; // 'Southern Olive and Oil Products - Main'
  facilityCode: string; // 'SO-HQ-MAIN-01'
  facilityType: string; // 'Corporate Mill & Commercial Hub'
  address: string; // 'Old Saida Road, Choueifat, Lebanon'
  status: 'Active' | 'Operational';
  isDefault: boolean;
  name?: string; // Standard alias for branchName
  code?: string; // Standard alias for facilityCode
  location?: string; // Standard alias for address / region
  region?: string;
  governorate?: string;
  city?: string;
  phone?: string;
}

/**
 * Tenant 1300 (Southern Olive and Oil Products S.A.R.L / منتوجات زيت وزيتون الجنوب ش.م.م)
 * Canonical Master Active Registered Branch Facility
 */
export const CANONICAL_FACILITY_1300: TenantFacility = {
  id: '1300',
  facilityId: 1300,
  branchId: 1,
  branchName: 'Southern Olive and Oil Products - Main',
  facilityCode: 'SO-HQ-MAIN-01',
  facilityType: 'Corporate Mill & Commercial Hub',
  address: 'Old Saida Road, Choueifat, Lebanon',
  status: 'Active',
  isDefault: true,
  name: 'Southern Olive and Oil Products - Main',
  code: 'SO-HQ-MAIN-01',
  location: 'Old Saida Road, Choueifat, Lebanon',
  region: 'Mount Lebanon',
  governorate: 'Mount Lebanon',
  city: 'Choueifat',
  phone: '707673828'
};

/**
 * Resolves canonical registered facilities for any given tenant company.
 * Strictly adheres to single source of truth:
 * If no secondary branch is formally registered by the tenant, returns ONLY the active registered facility.
 */
export function getTenantFacilities(tenant?: TenantCompany | null | any): TenantFacility[] {
  if (!tenant) {
    return [CANONICAL_FACILITY_1300];
  }

  const flags = tenant.feature_flags || {};
  const registered = tenant.facilities || flags.registered_facilities || flags.facilities;

  if (Array.isArray(registered) && registered.length > 0) {
    return registered.map((f: any, idx: number) => ({
      id: String(f.id || f.facilityId || f.branchId || idx + 1),
      facilityId: Number(f.facilityId || tenant.companyId || 1300),
      branchId: Number(f.branchId || idx + 1),
      branchName: String(f.branchName || f.name || CANONICAL_FACILITY_1300.branchName),
      facilityCode: String(f.facilityCode || f.code || CANONICAL_FACILITY_1300.facilityCode),
      facilityType: String(f.facilityType || f.type || CANONICAL_FACILITY_1300.facilityType),
      address: String(f.address || tenant.headquartersAddress || CANONICAL_FACILITY_1300.address),
      status: 'Active',
      isDefault: idx === 0,
      name: String(f.branchName || f.name || CANONICAL_FACILITY_1300.branchName),
      code: String(f.facilityCode || f.code || CANONICAL_FACILITY_1300.facilityCode),
      location: String(f.address || CANONICAL_FACILITY_1300.address),
      region: f.region || 'Mount Lebanon',
      city: f.city || tenant.city || 'Choueifat'
    }));
  }

  // Default active registered facility for Tenant 1300 or current workspace
  const companyId = tenant.companyId || tenant.company_id;
  const isTenant1300 = !companyId || companyId === 1300 || String(companyId) === '1300';

  if (isTenant1300) {
    return [CANONICAL_FACILITY_1300];
  }

  // Dynamically constructed single default facility for another registered tenant
  return [
    {
      id: String(companyId),
      facilityId: Number(companyId),
      branchId: 1,
      branchName: `${tenant.name || tenant.brandNameEn || 'Enterprise'} - Main`,
      facilityCode: `${String(tenant.slug || 'HQ').toUpperCase()}-01`,
      facilityType: 'Corporate Headquarters & Operations Hub',
      address: tenant.headquartersAddress || 'Main Commercial Road',
      status: 'Active',
      isDefault: true,
      name: `${tenant.name || tenant.brandNameEn || 'Enterprise'} - Main`,
      code: `${String(tenant.slug || 'HQ').toUpperCase()}-01`,
      location: tenant.headquartersAddress || 'Main Commercial Road',
      region: tenant.city || 'Central',
      city: tenant.city || ''
    }
  ];
}

/**
 * Returns dropdown / selector options for tenant facilities
 */
export function getTenantFacilityOptions(tenant?: TenantCompany | null | any): Array<{
  id: string;
  code: string;
  name: string;
  label: string;
  address: string;
}> {
  const list = getTenantFacilities(tenant);
  return list.map(f => ({
    id: f.id,
    code: f.facilityCode,
    name: f.branchName,
    label: `${f.facilityCode} - ${f.branchName}`,
    address: f.address
  }));
}

/**
 * React hook to access canonical tenant facilities in any component
 */
export function useTenantFacilities() {
  const { currentTenant } = useTenant();

  const facilities = useMemo(() => {
    return getTenantFacilities(currentTenant);
  }, [currentTenant]);

  const activeFacility = facilities[0] || CANONICAL_FACILITY_1300;

  const facilityOptions = useMemo(() => {
    return facilities.map(f => ({
      id: f.id,
      code: f.facilityCode,
      name: f.branchName,
      label: `${f.facilityCode} - ${f.branchName}`,
      address: f.address
    }));
  }, [facilities]);

  return {
    facilities,
    activeFacility,
    facilityOptions,
    defaultFacility: activeFacility
  };
}
