export interface OmegaDiscount {
  ID: number;
  DISCBRANCHID: number;
  BRAND_ID: number;
  BRANCHID: number;
  DISCDESCRIPTION: string;
  PERCENT: number | null;
  DISCOUNTTAX: number;
  DISCOUNTSERVICE: number | null;
  TYPEDISCOUNT: number; // 1: Percentage, 2: Amount
  OPENORFIX: number;    // 0: Open, 1: Fix
  MESSAGEONINVID: number | null;
  DISCFIDELITY: number | null;
  NOTACTIVE: number;    // 0: Active, -1: Inactive
  branch_excp: Array<{ BRANCHID: number; BARANCHNAME?: string }>;
}

export interface InvoiceMessage {
  ID: number;
  MESSAGEID: number;
  BRAND_ID: number;
  FORBRANCH: number;
  BRANCHID: number;
  MESSAGEDESC: string;
  MESSAGETITLE: string;
  STATUS: number;
}

export interface GroupDiscountException {
  GRIDBRANCHID: number;
  GROUPNAME: string;
  status: boolean;
}

export const INITIAL_DISCOUNTS: OmegaDiscount[] = [];

export const DISCOUNT_TYPE_OPTIONS = [
  { value: 1, description: 'Percentage (%)' },
  { value: 2, description: 'Amount ($)' }
];

export const OPEN_FIX_OPTIONS = [
  { value: 0, description: 'Open' },
  { value: 1, description: 'Fix' }
];

export const INVOICE_MESSAGES: InvoiceMessage[] = [
  {
    ID: 1,
    MESSAGEID: 1,
    BRAND_ID: 9606,
    FORBRANCH: 0,
    BRANCHID: 1,
    MESSAGETITLE: 'Thank You',
    MESSAGEDESC: 'Thank you for visiting Main Branch!',
    STATUS: 1
  },
  {
    ID: 2,
    MESSAGEID: 2,
    BRAND_ID: 9606,
    FORBRANCH: 0,
    BRANCHID: 1,
    MESSAGETITLE: 'Welcome Message',
    MESSAGEDESC: 'Welcome to our premium Lebanese heritage branch.',
    STATUS: 1
  },
  {
    ID: 3,
    MESSAGEID: 3,
    BRAND_ID: 9606,
    FORBRANCH: 0,
    BRANCHID: 1,
    MESSAGETITLE: 'Discount Policy',
    MESSAGEDESC: 'Promotional discount applied according to store terms.',
    STATUS: 1
  }
];

export const OMEGA_BRANCHES = [
  {
    BRANCHID: 1,
    BARANCHNAME: 'Southern Olive & Oil Products S.A.R.L',
    CITY: 'Kfarchima',
    MAINCURRENCY: '$',
    SECONDCURRENCY: 'LL'
  }
];

export const DEFAULT_PRODUCT_GROUPS = [
  { GRIDBRANCHID: 1, GROUPNAME: 'Extra Virgin Olive Oil' },
  { GRIDBRANCHID: 2, GROUPNAME: 'Virgin Olive Oil' },
  { GRIDBRANCHID: 3, GROUPNAME: 'Green Olives' },
  { GRIDBRANCHID: 4, GROUPNAME: 'Black Olives' },
  { GRIDBRANCHID: 5, GROUPNAME: 'Lebanese Pickles' },
  { GRIDBRANCHID: 6, GROUPNAME: 'Apple Cider Vinegar' },
  { GRIDBRANCHID: 7, GROUPNAME: 'White Vinegar' },
  { GRIDBRANCHID: 8, GROUPNAME: 'Artisanal Tapenade' },
  { GRIDBRANCHID: 9, GROUPNAME: 'Olive Oil Soap' },
  { GRIDBRANCHID: 10, GROUPNAME: 'Organic Jars' }
];
