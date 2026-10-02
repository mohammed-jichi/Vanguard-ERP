/**
 * Vanguard ERP - Canonical Tenant Facilities Registry & Store
 * Single Source of Truth for physical branch facilities, commercial hubs, and depots.
 * Implements Hierarchical Facility ID Pattern: TenantID-BranchIndex (e.g., 1300-01)
 */

'use client';

import { useMemo } from 'react';
import { useTenant, TenantCompany } from '@/lib/TenantContext';

export interface TenantFacility {
  id: string; // Hierarchical Composite Facility ID: '1300-01'
  facilityId: string | number; // '1300-01'
  compositeId: string; // '1300-01'
  tenantId: string | number; // Root Enterprise Tenant: '1300'
  branchIndex: number; // 1, 2, 3...
  branchId: number; // 1
  branchName: string; // 'Southern Olive and Oil Products - Main'
  facilityName: string; // 'Choueifat Main Facility'
  displayName: string; // '1300-01 - Choueifat Main Facility'
  facilityCode: string; // 'SO-HQ-MAIN-01'
  facilityType: string; // 'Corporate Mill & Commercial Hub'
  address: string; // 'Old Saida Road, Choueifat, Lebanon'
  status: 'Active' | 'Operational';
  isDefault: boolean;
  name?: string; // Standard alias for displayName / branchName
  code?: string; // Standard alias for facilityCode
  location?: string; // Standard alias for address / region
  region?: string;
  governorate?: string;
  city?: string;
  phone?: string;
}

/**
 * Formats a hierarchical composite facility ID from Tenant ID and branch index.
 * Example: formatFacilityId(1300, 1) -> '1300-01'
 */
export function formatFacilityId(tenantId: string | number, branchIndex: number): string {
  const tId = String(tenantId || '1300').trim();
  const bIdx = String(branchIndex).padStart(2, '0');
  return `${tId}-${bIdx}`;
}

/**
 * Parses a composite facility ID into its Tenant ID and branch index.
 * Example: parseFacilityId('1300-01') -> { tenantId: '1300', branchIndex: 1 }
 */
export function parseFacilityId(facilityId: string): { tenantId: string; branchIndex: number } {
  if (!facilityId || typeof facilityId !== 'string') {
    return { tenantId: '1300', branchIndex: 1 };
  }
  if (!facilityId.includes('-')) {
    return { tenantId: facilityId, branchIndex: 1 };
  }
  const parts = facilityId.split('-');
  return {
    tenantId: parts[0] || '1300',
    branchIndex: parseInt(parts[1] || '1', 10) || 1
  };
}

/**
 * Enterprise Consolidated Option for aggregate cross-facility reporting
 */
export const CONSOLIDATED_ENTERPRISE_FACILITY = {
  id: 'ALL',
  facilityId: 'ALL',
  compositeId: 'ALL',
  tenantId: '1300',
  branchIndex: 0,
  branchId: 0,
  branchName: 'All Facilities (Consolidated Enterprise - 1300)',
  facilityName: 'All Facilities (Consolidated Enterprise - 1300)',
  displayName: 'All Facilities (Consolidated Enterprise - 1300)',
  facilityCode: 'ALL-FACILITIES-1300',
  facilityType: 'Consolidated Enterprise Multi-Facility',
  address: 'Enterprise-Wide Consolidated Multi-Hub Audit',
  status: 'Active' as const,
  isDefault: false,
  name: 'All Facilities (Consolidated Enterprise - 1300)',
  code: 'ALL-FACILITIES-1300',
  label: 'All Facilities (Consolidated Enterprise - 1300)',
  location: 'Enterprise-Wide Consolidated Multi-Hub Audit'
};

/**
 * Tenant 1300 (Southern Olive and Oil Products S.A.R.L / منتوجات زيت وزيتون الجنوب ش.م.م)
 * Canonical Master Active Registered Branch Facility (1300-01)
 */
export const CANONICAL_FACILITY_1300: TenantFacility = {
  id: '1300-01',
  facilityId: '1300-01',
  compositeId: '1300-01',
  tenantId: '1300',
  branchIndex: 1,
  branchId: 1,
  branchName: 'Southern Olive and Oil Products - Main',
  facilityName: 'Choueifat Main Facility',
  displayName: '1300-01 - Choueifat Main Facility',
  facilityCode: 'SO-HQ-MAIN-01',
  facilityType: 'Corporate Mill & Commercial Hub',
  address: 'Old Saida Road, Choueifat, Lebanon',
  status: 'Active',
  isDefault: true,
  name: '1300-01 - Choueifat Main Facility',
  code: 'SO-HQ-MAIN-01',
  location: 'Old Saida Road, Choueifat, Lebanon',
  region: 'Mount Lebanon',
  governorate: 'Mount Lebanon',
  city: 'Choueifat',
  phone: '707673828'
};

/**
 * Secondary satellite facility generator for future multi-facility expansion
 * Pattern: 1300-02, 1300-03, etc.
 */
export function createSatelliteFacility(
  tenantId: string | number,
  branchIndex: number,
  facilityName: string,
  facilityCode: string,
  facilityType: string,
  address: string,
  city = 'Beirut',
  region = 'Greater Beirut'
): TenantFacility {
  const id = formatFacilityId(tenantId, branchIndex);
  return {
    id,
    facilityId: id,
    compositeId: id,
    tenantId: String(tenantId),
    branchIndex,
    branchId: branchIndex,
    branchName: `${facilityName}`,
    facilityName,
    displayName: `${id} - ${facilityName}`,
    facilityCode,
    facilityType,
    address,
    status: 'Active',
    isDefault: false,
    name: `${id} - ${facilityName}`,
    code: facilityCode,
    location: address,
    region,
    city
  };
}

/**
 * Resolves canonical registered facilities for any given tenant company.
 * Strictly adheres to single source of truth:
 * If no secondary branch is formally registered by the tenant, returns ONLY the active registered facility 1300-01.
 */
export function getTenantFacilities(tenant?: TenantCompany | null | any): TenantFacility[] {
  if (!tenant) {
    return [CANONICAL_FACILITY_1300];
  }

  const flags = tenant.feature_flags || {};
  const registered = tenant.facilities || flags.registered_facilities || flags.facilities;
  const companyId = tenant.companyId || tenant.company_id || 1300;

  if (Array.isArray(registered) && registered.length > 0) {
    return registered.map((f: any, idx: number) => {
      const branchIndex = Number(f.branchIndex || f.branchId || idx + 1);
      const compositeId = formatFacilityId(companyId, branchIndex);
      const fName = String(f.facilityName || f.branchName || f.name || CANONICAL_FACILITY_1300.facilityName);
      return {
        id: compositeId,
        facilityId: compositeId,
        compositeId,
        tenantId: String(companyId),
        branchIndex,
        branchId: branchIndex,
        branchName: String(f.branchName || f.name || CANONICAL_FACILITY_1300.branchName),
        facilityName: fName,
        displayName: `${compositeId} - ${fName}`,
        facilityCode: String(f.facilityCode || f.code || CANONICAL_FACILITY_1300.facilityCode),
        facilityType: String(f.facilityType || f.type || CANONICAL_FACILITY_1300.facilityType),
        address: String(f.address || tenant.headquartersAddress || CANONICAL_FACILITY_1300.address),
        status: 'Active' as const,
        isDefault: idx === 0,
        name: `${compositeId} - ${fName}`,
        code: String(f.facilityCode || f.code || CANONICAL_FACILITY_1300.facilityCode),
        location: String(f.address || CANONICAL_FACILITY_1300.address),
        region: f.region || 'Mount Lebanon',
        city: f.city || tenant.city || 'Choueifat'
      };
    });
  }

  // Default active registered facility for Tenant 1300 or current workspace
  const isTenant1300 = !companyId || companyId === 1300 || String(companyId) === '1300';

  if (isTenant1300) {
    return [CANONICAL_FACILITY_1300];
  }

  // Dynamically constructed single default facility for another registered tenant
  const compositeId = formatFacilityId(companyId, 1);
  const brandName = tenant.name || tenant.brandNameEn || 'Enterprise';
  return [
    {
      id: compositeId,
      facilityId: compositeId,
      compositeId,
      tenantId: String(companyId),
      branchIndex: 1,
      branchId: 1,
      branchName: `${brandName} - Main`,
      facilityName: `${brandName} Main Facility`,
      displayName: `${compositeId} - ${brandName} Main Facility`,
      facilityCode: `${String(tenant.slug || 'HQ').toUpperCase()}-01`,
      facilityType: 'Corporate Headquarters & Operations Hub',
      address: tenant.headquartersAddress || 'Main Commercial Road',
      status: 'Active',
      isDefault: true,
      name: `${compositeId} - ${brandName} Main Facility`,
      code: `${String(tenant.slug || 'HQ').toUpperCase()}-01`,
      location: tenant.headquartersAddress || 'Main Commercial Road',
      region: tenant.city || 'Central',
      city: tenant.city || ''
    }
  ];
}

/**
 * Returns dropdown / selector options for tenant facilities, including consolidated enterprise option if requested.
 */
export function getTenantFacilityOptions(
  tenant?: TenantCompany | null | any,
  includeConsolidated = false
): Array<{
  id: string;
  code: string;
  name: string;
  label: string;
  address: string;
}> {
  const list = getTenantFacilities(tenant);
  const options = list.map(f => ({
    id: f.id,
    code: f.facilityCode,
    name: f.displayName,
    label: `${f.displayName} (${f.facilityCode})`,
    address: f.address
  }));

  if (includeConsolidated) {
    return [
      {
        id: 'ALL',
        code: 'ALL',
        name: CONSOLIDATED_ENTERPRISE_FACILITY.displayName,
        label: CONSOLIDATED_ENTERPRISE_FACILITY.displayName,
        address: CONSOLIDATED_ENTERPRISE_FACILITY.address
      },
      ...options
    ];
  }

  return options;
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
      name: f.displayName,
      label: `${f.displayName} (${f.facilityCode})`,
      address: f.address
    }));
  }, [facilities]);

  const reportFacilityOptions = useMemo(() => {
    return [
      {
        id: 'ALL',
        code: 'ALL',
        name: CONSOLIDATED_ENTERPRISE_FACILITY.displayName,
        label: CONSOLIDATED_ENTERPRISE_FACILITY.displayName,
        address: CONSOLIDATED_ENTERPRISE_FACILITY.address
      },
      ...facilityOptions
    ];
  }, [facilityOptions]);

  return {
    facilities,
    activeFacility,
    facilityOptions,
    reportFacilityOptions,
    defaultFacility: activeFacility,
    consolidatedFacility: CONSOLIDATED_ENTERPRISE_FACILITY
  };
}
