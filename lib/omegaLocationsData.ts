/**
 * Live Cloned Locations, Zones, and Aisles from Omega ERP
 * Sourced directly from cms.omegasoftware.ca
 */

export interface LocationItem {
  ID: number;
  LOCATIONID: number;
  BRAND_ID?: number;
  FORBRANCH?: number;
  BRANCHID?: number;
  LOCATIONDESCRIPTION: string;
  ACCDEPT?: number | string | null;
}

export interface ZoneItem {
  id: number;
  brand_id?: number;
  name: string;
  code?: string | null;
  description?: string | null;
}

export interface AisleItem {
  id: number;
  brand_id?: number;
  name: string;
  code?: string | null;
  description?: string | null;
}

export const INITIAL_OMEGA_LOCATIONS: LocationItem[] = [
  {
    ID: 2687,
    LOCATIONID: 3,
    BRAND_ID: 9606,
    FORBRANCH: 1,
    BRANCHID: 1,
    LOCATIONDESCRIPTION: 'Delivery',
    ACCDEPT: 0
  },
  {
    ID: 2685,
    LOCATIONID: 1,
    BRAND_ID: 9606,
    FORBRANCH: 1,
    BRANCHID: 1,
    LOCATIONDESCRIPTION: 'Main Store',
    ACCDEPT: 0
  },
  {
    ID: 2688,
    LOCATIONID: 4,
    BRAND_ID: 9606,
    FORBRANCH: 1,
    BRANCHID: 1,
    LOCATIONDESCRIPTION: 'Manufacture Warehouse',
    ACCDEPT: null
  },
  {
    ID: 2686,
    LOCATIONID: 2,
    BRAND_ID: 9606,
    FORBRANCH: 1,
    BRANCHID: 1,
    LOCATIONDESCRIPTION: 'Showroom',
    ACCDEPT: 0
  }
];

export const INITIAL_OMEGA_ZONES: ZoneItem[] = [
  {
    id: 1,
    brand_id: 9606,
    name: 'Area 1',
    code: null,
    description: null
  },
  {
    id: 2,
    brand_id: 9606,
    name: 'Plastic Shelf',
    code: null,
    description: 'Behind dairies refrigerator'
  },
  {
    id: 3,
    brand_id: 9606,
    name: 'Refrigerator',
    code: 'Cheese',
    description: null
  }
];

export const INITIAL_OMEGA_AISLES: AisleItem[] = [
  {
    id: 1,
    brand_id: 9606,
    name: 'Shelf 1',
    code: null,
    description: null
  }
];
