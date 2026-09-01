// ============================================================================
// ONLINE ORDERS DATA ENGINE & CHANNELS CONFIGURATION
// SOUTHERN OLIVE OIL PRODUCTS S.A.R.L
// ============================================================================

export type PlatformType = 'WhatsApp' | 'Web Store' | 'TikTok Shop' | 'Instagram' | 'Phone';

export type FulfillmentStatus = 'FULLY_RECEIVED' | 'PARTIALLY_RECEIVED' | 'NOT_RECEIVED_YET';

export interface OnlineOrder {
  orderNo: string;
  orderDate: string;
  deliveryDate: string;
  customerName: string;
  platform: PlatformType;
  platformIcon: string;
  totalAmount: string;
  amountNum: number;
  status: FulfillmentStatus;
  zoneName: string;
  branchName: string;
  itemsSummary: string;
}

// 1. OPERATIONAL CHANNELS CONFIGURATION
export const platformOptions: { type: PlatformType; icon: string; label: string }[] = [
  { type: 'WhatsApp', icon: '💬', label: 'WhatsApp Direct' },
  { type: 'Web Store', icon: '🌐', label: 'Online Web Store' },
  { type: 'TikTok Shop', icon: '🎵', label: 'TikTok Live/Shop' },
  { type: 'Instagram', icon: '📸', label: 'Instagram DM' },
  { type: 'Phone', icon: '📞', label: 'Direct Call Center' },
];

// 2. FULFILLMENT BRANCHES REGISTRY
export const branchesList = [
  { id: '001', code: 'BR_001', name: '001 - Choueifat Main Facility', region: 'Mount Lebanon' },
  { id: '002', code: 'BR_002', name: '002 - Beirut Distribution Hub', region: 'Beirut' },
  { id: '003', code: 'BR_003', name: '003 - Saida Southern Center', region: 'South Lebanon' },
  { id: '004', code: 'BR_004', name: '004 - Zahle Bekaa Branch', region: 'Bekaa' },
];

// 3. AUTHENTIC ORDERS DATASET (SOUTHERN OLIVE OIL PRODUCTS S.A.R.L)
export const initialOrdersList: OnlineOrder[] = [
  {
    orderNo: 'ORD-103349',
    orderDate: '01-Sep-2026 10:14 AM',
    deliveryDate: '01-Sep-2026',
    customerName: 'Al-Baraka Supermarket S.A.R.L',
    platform: 'WhatsApp',
    platformIcon: '💬',
    totalAmount: '9,000,000.00 LBP ($100.00)',
    amountNum: 9000000,
    status: 'FULLY_RECEIVED',
    zoneName: 'Beirut - Hamra',
    branchName: '002 - Beirut Distribution Hub',
    itemsSummary: '1x 17.5L Extra Virgin Olive Oil Tin (Harvest 2026)',
  },
  {
    orderNo: 'ORD-103350',
    orderDate: '01-Sep-2026 11:02 AM',
    deliveryDate: '01-Sep-2026',
    customerName: 'Colonel Mahmoud Abboud',
    platform: 'Phone',
    platformIcon: '📞',
    totalAmount: '248,400,000.00 LBP ($2,760.00)',
    amountNum: 248400000,
    status: 'FULLY_RECEIVED',
    zoneName: 'Mount Lebanon - Choueifat',
    branchName: '001 - Choueifat Main Facility',
    itemsSummary: '30x 17.5L Extra Virgin Bulk Harvest Tins (Special Reserve)',
  },
  {
    orderNo: 'ORD-103351',
    orderDate: '01-Sep-2026 12:22 PM',
    deliveryDate: '02-Sep-2026',
    customerName: 'Al-Nour Food Establishment',
    platform: 'Web Store',
    platformIcon: '🌐',
    totalAmount: '460,000.00 LBP',
    amountNum: 460000,
    status: 'PARTIALLY_RECEIVED',
    zoneName: 'Beirut - Achrafieh',
    branchName: '002 - Beirut Distribution Hub',
    itemsSummary: '6x Pomegranate Molasses (500ml), 4x Pickled Olives Glass 1Kg',
  },
  {
    orderNo: 'ORD-103352',
    orderDate: '01-Sep-2026 12:51 PM',
    deliveryDate: '02-Sep-2026',
    customerName: 'Hussein Daik Retail Mart',
    platform: 'TikTok Shop',
    platformIcon: '🎵',
    totalAmount: '706,968,000.00 LBP ($7,855.20)',
    amountNum: 706968000,
    status: 'NOT_RECEIVED_YET',
    zoneName: 'South Lebanon - Saida City',
    branchName: '003 - Saida Southern Center',
    itemsSummary: 'Wholesale Assorted Food Preserves, Vinegar & Olive Products Matrix',
  },
  {
    orderNo: 'ORD-103353',
    orderDate: '01-Sep-2026 01:40 PM',
    deliveryDate: '02-Sep-2026',
    customerName: 'Byblos Green Grocers',
    platform: 'Instagram',
    platformIcon: '📸',
    totalAmount: '1,580,000.00 LBP',
    amountNum: 1580000,
    status: 'NOT_RECEIVED_YET',
    zoneName: 'Mount Lebanon - Jbeil',
    branchName: '001 - Choueifat Main Facility',
    itemsSummary: '12x Cold Press Extra Virgin Glass Bottles 1L',
  },
];
