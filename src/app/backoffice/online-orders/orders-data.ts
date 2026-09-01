// ============================================================================
// ONLINE & DISPATCH ORDERS DATA ENGINE - SOUTHERN OLIVE OIL PRODUCTS S.A.R.L
// ============================================================================

export type PlatformType = 'Web Store' | 'Mobile App' | 'Call Center' | 'Delivery Partner';

export type OrderFulfillmentStatus = 'FULLY_INVOICED' | 'UNDER_PREPARATION' | 'PENDING_CONFIRMATION';

export interface OnlineOrder {
  orderNo: string;
  orderDate: string;
  deliveryDate: string;
  customerName: string;
  platform: PlatformType;
  platformIcon: string;
  totalAmount: string;
  amountNum: number;
  status: OrderFulfillmentStatus;
  zoneName: string;
  branchName: string;
  itemsSummary: string;
}

export const platformOptions: { type: PlatformType; icon: string; label: string }[] = [
  { type: 'Web Store', icon: '🌐', label: 'Online Web Store' },
  { type: 'Mobile App', icon: '📱', label: 'Vanguard Mobile App' },
  { type: 'Call Center', icon: '📞', label: 'Call Center Orders' },
  { type: 'Delivery Partner', icon: '🛵', label: 'Delivery Partner' },
];

export const branchesList = [
  { id: '001', code: 'BR_001', name: '001 - Choueifat Main Facility', region: 'Mount Lebanon' },
  { id: '002', code: 'BR_002', name: '002 - Beirut Distribution Hub', region: 'Beirut' },
  { id: '003', code: 'BR_003', name: '003 - Saida Southern Center', region: 'South Lebanon' },
  { id: '004', code: 'BR_004', name: '004 - Zahle Bekaa Branch', region: 'Bekaa' },
];

export const initialOrdersList: OnlineOrder[] = [
  {
    orderNo: 'WEB-103349',
    orderDate: '01-Sep-2026 10:14 AM',
    deliveryDate: '01-Sep-2026',
    customerName: 'Al-Baraka Supermarket S.A.R.L',
    platform: 'Web Store',
    platformIcon: '🌐',
    totalAmount: '9,000,000.00 LBP ($100.00)',
    amountNum: 9000000,
    status: 'FULLY_INVOICED',
    zoneName: 'Beirut - Hamra',
    branchName: '002 - Beirut Distribution Hub',
    itemsSummary: '1x 17.5L Extra Virgin Olive Oil Tin (Harvest 2026)',
  },
  {
    orderNo: 'APP-103350',
    orderDate: '01-Sep-2026 11:02 AM',
    deliveryDate: '01-Sep-2026',
    customerName: 'Colonel Mahmoud Abboud',
    platform: 'Mobile App',
    platformIcon: '📱',
    totalAmount: '248,400,000.00 LBP ($2,760.00)',
    amountNum: 248400000,
    status: 'FULLY_INVOICED',
    zoneName: 'Mount Lebanon - Choueifat',
    branchName: '001 - Choueifat Main Facility',
    itemsSummary: '30x 17.5L Extra Virgin Bulk Harvest Tins (Special Reserve)',
  },
  {
    orderNo: 'WEB-103351',
    orderDate: '01-Sep-2026 12:22 PM',
    deliveryDate: '02-Sep-2026',
    customerName: 'Al-Nour Food Establishment',
    platform: 'Web Store',
    platformIcon: '🌐',
    totalAmount: '460,000.00 LBP',
    amountNum: 460000,
    status: 'UNDER_PREPARATION',
    zoneName: 'Beirut - Achrafieh',
    branchName: '002 - Beirut Distribution Hub',
    itemsSummary: '6x Pomegranate Molasses (500ml), 4x Pickled Olives Glass 1Kg',
  },
  {
    orderNo: 'DLV-103352',
    orderDate: '01-Sep-2026 12:51 PM',
    deliveryDate: '02-Sep-2026',
    customerName: 'Hussein Daik Retail Mart',
    platform: 'Delivery Partner',
    platformIcon: '🛵',
    totalAmount: '706,968,000.00 LBP ($7,855.20)',
    amountNum: 706968000,
    status: 'PENDING_CONFIRMATION',
    zoneName: 'South Lebanon - Saida City',
    branchName: '003 - Saida Southern Center',
    itemsSummary: 'Wholesale Assorted Food Preserves & Olive Products Matrix',
  },
  {
    orderNo: 'TEL-103353',
    orderDate: '01-Sep-2026 01:40 PM',
    deliveryDate: '02-Sep-2026',
    customerName: 'Byblos Green Grocers',
    platform: 'Call Center',
    platformIcon: '📞',
    totalAmount: '1,580,000.00 LBP',
    amountNum: 1580000,
    status: 'PENDING_CONFIRMATION',
    zoneName: 'Mount Lebanon - Jbeil',
    branchName: '001 - Choueifat Main Facility',
    itemsSummary: '12x Cold Press Extra Virgin Glass Bottles 1L',
  },
];
