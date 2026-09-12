// Authentic Omega ERP Inventory Category Data & Types

export interface InventoryCategoryItem {
  ID: number;
  CATEGORYID: number;
  BRAND_ID: number;
  BRANCHID: number;
  CATEGORYNAME: string;
  ACATEGORYNAME: string | null;
  PIC: string | null;
  SORTING: number;
  MENUID: number;
  CATEGORYLINKID: number;
  PURCHASE_ACCOUNT: string;
  WASTAGE_ACCOUNT: string;
  ADJUSTMENT_ACCOUNT: string;
  EMPLOYEESMEALS_ACCOUNT: string;
  FREEITEMS_ACCOUNT: string;
  PLU: number | null;
  CREATED_AT: string;
  UPDATED_AT: string;
  UPDATED_BY: number;
  OMEGA_ID: number | null;
  CATEGORYLINKEDNAME: string;
}

export interface PredefinedCategory {
  id: number;
  name: string;
  imageurl: string;
}

export interface BrandOption {
  ID: number;
  BRAND_NAME: string;
  CATEGORYID?: number | null;
  CATEGORYNAME?: string | null;
}

// 100% authentic categories cloned directly from Omega ERP (cms.omegasoftware.ca)
export const INITIAL_OMEGA_INV_CATEGORIES: InventoryCategoryItem[] = [
  {
    ID: 23,
    CATEGORYID: 6,
    BRAND_ID: 9606,
    BRANCHID: 1,
    CATEGORYNAME: "Raw Materials",
    ACATEGORYNAME: "مواد خام",
    PIC: null,
    SORTING: 6,
    MENUID: 0,
    CATEGORYLINKID: 1,
    PURCHASE_ACCOUNT: "120101",
    WASTAGE_ACCOUNT: "510201",
    ADJUSTMENT_ACCOUNT: "510301",
    EMPLOYEESMEALS_ACCOUNT: "510401",
    FREEITEMS_ACCOUNT: "510501",
    PLU: 5,
    CREATED_AT: "11 Jul, 2026",
    UPDATED_AT: "11 Jul, 2026",
    UPDATED_BY: 1,
    OMEGA_ID: null,
    CATEGORYLINKEDNAME: "General"
  },
  {
    ID: 16,
    CATEGORYID: 3,
    BRAND_ID: 9606,
    BRANCHID: 1,
    CATEGORYNAME: "جملة",
    ACATEGORYNAME: "Wholesale",
    PIC: null,
    SORTING: 3,
    MENUID: 0,
    CATEGORYLINKID: 1,
    PURCHASE_ACCOUNT: "120102",
    WASTAGE_ACCOUNT: "510201",
    ADJUSTMENT_ACCOUNT: "510301",
    EMPLOYEESMEALS_ACCOUNT: "510401",
    FREEITEMS_ACCOUNT: "510501",
    PLU: 3,
    CREATED_AT: "08 Dec, 2025",
    UPDATED_AT: "10 Dec, 2025",
    UPDATED_BY: 1,
    OMEGA_ID: null,
    CATEGORYLINKEDNAME: "General"
  },
  {
    ID: 21,
    CATEGORYID: 4,
    BRAND_ID: 9606,
    BRANCHID: 1,
    CATEGORYNAME: "عروض",
    ACATEGORYNAME: "Special Offers",
    PIC: null,
    SORTING: 4,
    MENUID: 0,
    CATEGORYLINKID: 1,
    PURCHASE_ACCOUNT: "120103",
    WASTAGE_ACCOUNT: "510201",
    ADJUSTMENT_ACCOUNT: "510301",
    EMPLOYEESMEALS_ACCOUNT: "510401",
    FREEITEMS_ACCOUNT: "510501",
    PLU: 4,
    CREATED_AT: "02 Jan, 2026",
    UPDATED_AT: "02 Jan, 2026",
    UPDATED_BY: 1,
    OMEGA_ID: null,
    CATEGORYLINKEDNAME: "General"
  },
  {
    ID: 15,
    CATEGORYID: 2,
    BRAND_ID: 9606,
    BRANCHID: 1,
    CATEGORYNAME: "مفرق",
    ACATEGORYNAME: "Retail",
    PIC: null,
    SORTING: 2,
    MENUID: 0,
    CATEGORYLINKID: 1,
    PURCHASE_ACCOUNT: "120104",
    WASTAGE_ACCOUNT: "510201",
    ADJUSTMENT_ACCOUNT: "510301",
    EMPLOYEESMEALS_ACCOUNT: "510401",
    FREEITEMS_ACCOUNT: "510501",
    PLU: 1,
    CREATED_AT: "08 Dec, 2025",
    UPDATED_AT: "08 Dec, 2025",
    UPDATED_BY: 2,
    OMEGA_ID: null,
    CATEGORYLINKEDNAME: "General"
  },
  {
    ID: 22,
    CATEGORYID: 5,
    BRAND_ID: 9606,
    BRANCHID: 1,
    CATEGORYNAME: "مواد اولية",
    ACATEGORYNAME: "Primary Goods",
    PIC: null,
    SORTING: 5,
    MENUID: 0,
    CATEGORYLINKID: 1,
    PURCHASE_ACCOUNT: "120105",
    WASTAGE_ACCOUNT: "510201",
    ADJUSTMENT_ACCOUNT: "510301",
    EMPLOYEESMEALS_ACCOUNT: "510401",
    FREEITEMS_ACCOUNT: "510501",
    PLU: null,
    CREATED_AT: "07 Apr, 2026",
    UPDATED_AT: "07 Apr, 2026",
    UPDATED_BY: 1,
    OMEGA_ID: null,
    CATEGORYLINKEDNAME: "General"
  }
];

// Predefined categories (empty by default as instructed)
export const OMEGA_PREDEFINED_CATEGORIES: PredefinedCategory[] = [];

export const OMEGA_LINKED_CATEGORIES: string[] = [
  "All Linked Categories",
  "General"
];

export const OMEGA_DEFAULT_BRANDS: BrandOption[] = [];
