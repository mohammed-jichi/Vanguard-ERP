/**
 * ============================================================================
 * VANGUARD POS STATE & WORKFLOW ENGINE (OMEGA-STYLE ARCHITECTURE)
 * ============================================================================
 * Manages tactile touch login, role-based screen routing, transaction lines,
 * dual-currency calculation (USD / 89,500 LBP), and commercial POS functions.
 */

export type PosWorkflowState =
  | 'LOGIN_USER_ID'
  | 'LOGIN_PASSWORD'
  | 'ROLE_ROUTING'
  | 'POS_TERMINAL';

export interface PosUser {
  id: string;
  name: string;
  pin: string;
  role: 'Admin' | 'Cashier' | 'Supervisor';
  branch: string;
  workstation: string;
}

export const POS_USERS: PosUser[] = [
  {
    id: '101',
    name: 'Maya Khoury',
    pin: '1234',
    role: 'Cashier',
    branch: 'Choueifat Main Facility',
    workstation: 'W#: 1',
  },
  {
    id: '102',
    name: 'Hadi Sleiman',
    pin: '0000',
    role: 'Admin',
    branch: 'Choueifat Main Facility',
    workstation: 'W#: 1',
  },
  {
    id: '103',
    name: 'Ahmad Al-Hajj',
    pin: '1111',
    role: 'Cashier',
    branch: 'Beirut Gourmet Depot',
    workstation: 'W#: 2',
  },
];

export interface PosCartItem {
  id: string;
  barcode: string;
  name: string;
  qty: number;
  priceUsd: number;
  discountPercent?: number;
  itemDiscountUsd?: number;
  totalUsd: number;
  totalLbp: number;
}

export interface PosProductCatalogueItem {
  id: string;
  barcode: string;
  name: string;
  priceUsd: number;
  category: string;
}

export const POS_EXCHANGE_RATE = 89500;

export const POS_PRODUCTS: PosProductCatalogueItem[] = [
  { id: 'P-01', barcode: '1001', name: '17.5L Extra Virgin Olive Oil Tin', priceUsd: 110.0, category: 'Olive Oil' },
  { id: 'P-02', barcode: '1002', name: '1L Extra Virgin Glass Bottle', priceUsd: 12.0, category: 'Olive Oil' },
  { id: 'P-03', barcode: '1003', name: 'Pure Pomegranate Molasses 500ml', priceUsd: 6.0, category: 'Preserves' },
  { id: 'P-04', barcode: '1004', name: 'Pickled Green Olives 1KG', priceUsd: 5.5, category: 'Olives' },
  { id: 'P-05', barcode: '1005', name: 'Traditional Liquid Soap 1L', priceUsd: 3.5, category: 'Detergents' },
  { id: 'P-06', barcode: '1006', name: 'Eau de Javel 4L Cleaner', priceUsd: 4.0, category: 'Detergents' },
  { id: 'P-07', barcode: '1007', name: 'Cold Pressed Virgin Oil 500ml', priceUsd: 7.5, category: 'Olive Oil' },
  { id: 'P-08', barcode: '1008', name: 'Kalamata Cured Black Olives 500g', priceUsd: 4.5, category: 'Olives' },
];

export interface PosFinancialSummary {
  subtotalUsd: number;
  subtotalLbp: number;
  discountUsd: number;
  discountLbp: number;
  taxUsd: number;
  taxLbp: number;
  netUsd: number;
  netLbp: number;
  paidUsd: number;
  paidLbp: number;
  dueUsd: number;
  dueLbp: number;
}

/**
 * Calculates dual-currency financials across all transaction cart lines.
 */
export function calculatePosFinancialSummary(
  items: PosCartItem[],
  paidUsdAmount: number = 0,
  orderDiscountPercent: number = 0
): PosFinancialSummary {
  const subtotalUsd = items.reduce((sum, item) => sum + item.totalUsd, 0);
  const discountUsd = (subtotalUsd * orderDiscountPercent) / 100;
  const netUsd = Math.max(0, subtotalUsd - discountUsd);
  const taxUsd = netUsd * 0.11; // Standard 11% VAT
  const totalDueUsd = Number((netUsd + taxUsd).toFixed(2));

  const subtotalLbp = Math.round(subtotalUsd * POS_EXCHANGE_RATE);
  const discountLbp = Math.round(discountUsd * POS_EXCHANGE_RATE);
  const netLbp = Math.round(netUsd * POS_EXCHANGE_RATE);
  const taxLbp = Math.round(taxUsd * POS_EXCHANGE_RATE);
  const totalDueLbp = netLbp + taxLbp;

  const paidLbp = Math.round(paidUsdAmount * POS_EXCHANGE_RATE);
  const dueUsd = Math.max(0, Number((totalDueUsd - paidUsdAmount).toFixed(2)));
  const dueLbp = Math.max(0, totalDueLbp - paidLbp);

  return {
    subtotalUsd: Number(subtotalUsd.toFixed(2)),
    subtotalLbp,
    discountUsd: Number(discountUsd.toFixed(2)),
    discountLbp,
    taxUsd: Number(taxUsd.toFixed(2)),
    taxLbp,
    netUsd: totalDueUsd,
    netLbp: totalDueLbp,
    paidUsd: Number(paidUsdAmount.toFixed(2)),
    paidLbp,
    dueUsd,
    dueLbp,
  };
}
