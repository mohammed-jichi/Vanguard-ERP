// ============================================================================
// OMNICHANNEL ORDERS & ROUTING DATA ENGINE
// SOUTHERN OLIVE OIL PRODUCTS S.A.R.L
// ============================================================================

export type PlatformType = 'Web Store' | 'WhatsApp' | 'TikTok Shop' | 'Instagram' | 'Phone';

export type FulfillmentType = 'IN_STORE_PICKUP' | 'DELIVERY';

export type OrderStatus = 'FULLY_RECEIVED_POS' | 'PENDING_PICKUP_POS' | 'DISPATCHED_FLEET' | 'PENDING_DISPATCH';

export interface OnlineOrder {
  orderNo: string;
  orderDate: string;
  deliveryDate: string;
  customerName: string;
  platform: PlatformType;
  platformIcon: string;
  fulfillmentType: FulfillmentType;
  totalAmount: string;
  amountNum: number;
  status: OrderStatus;
  zoneName: string;
  branchName: string;
  itemsSummary: string;
}

export const platformOptions: { type: PlatformType; icon: string; label: string }[] = [
  { type: 'Web Store', icon: '🌐', label: 'Online Web Store' },
  { type: 'WhatsApp', icon: '💬', label: 'WhatsApp Direct' },
  { type: 'TikTok Shop', icon: '🎵', label: 'TikTok Shop' },
  { type: 'Instagram', icon: '📸', label: 'Instagram DM' },
  { type: 'Phone', icon: '📞', label: 'Call Center' },
];

export const branchesList = [
  { id: '001', code: 'BR_001', name: '001 - Choueifat Main Facility', region: 'Mount Lebanon' },
  { id: '002', code: 'BR_002', name: '002 - Beirut Distribution Hub', region: 'Beirut' },
  { id: '003', code: 'BR_003', name: '003 - Saida Southern Center', region: 'South Lebanon' },
  { id: '004', code: 'BR_004', name: '004 - Zahle Bekaa Branch', region: 'Bekaa' },
];

export const initialOrdersList: OnlineOrder[] = [
  {
    orderNo: 'ORD-103349',
    orderDate: '01-Sep-2026 10:14 AM',
    deliveryDate: '01-Sep-2026',
    customerName: 'Al-Baraka Supermarket S.A.R.L',
    platform: 'WhatsApp',
    platformIcon: '💬',
    fulfillmentType: 'DELIVERY',
    totalAmount: '9,000,000.00 LBP ($100.00)',
    amountNum: 9000000,
    status: 'DISPATCHED_FLEET',
    zoneName: 'Beirut - Hamra',
    branchName: '002 - Beirut Distribution Hub',
    itemsSummary: '1x 17.5L Extra Virgin Olive Oil Tin (Harvest 2026)',
  },
  {
    orderNo: 'ORD-103350',
    orderDate: '01-Sep-2026 11:02 AM',
    deliveryDate: '01-Sep-2026',
    customerName: 'Colonel Mahmoud Abboud',
    platform: 'Web Store',
    platformIcon: '🌐',
    fulfillmentType: 'IN_STORE_PICKUP',
    totalAmount: '248,400,000.00 LBP ($2,760.00)',
    amountNum: 248400000,
    status: 'FULLY_RECEIVED_POS',
    zoneName: 'Choueifat Showroom Counter',
    branchName: '001 - Choueifat Main Facility',
    itemsSummary: '30x 17.5L Extra Virgin Bulk Harvest Tins (Pickup at Showroom POS)',
  },
  {
    orderNo: 'ORD-103351',
    orderDate: '01-Sep-2026 12:22 PM',
    deliveryDate: '02-Sep-2026',
    customerName: 'Al-Nour Food Establishment',
    platform: 'Web Store',
    platformIcon: '🌐',
    fulfillmentType: 'DELIVERY',
    totalAmount: '460,000.00 LBP',
    amountNum: 460000,
    status: 'PENDING_DISPATCH',
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
    fulfillmentType: 'DELIVERY',
    totalAmount: '706,968,000.00 LBP ($7,855.20)',
    amountNum: 706968000,
    status: 'PENDING_DISPATCH',
    zoneName: 'South Lebanon - Saida City',
    branchName: '003 - Saida Southern Center',
    itemsSummary: 'Wholesale Assorted Food Preserves & Olive Products Matrix',
  },
  {
    orderNo: 'ORD-103353',
    orderDate: '01-Sep-2026 01:40 PM',
    deliveryDate: '02-Sep-2026',
    customerName: 'Byblos Green Grocers',
    platform: 'Phone',
    platformIcon: '📞',
    fulfillmentType: 'IN_STORE_PICKUP',
    totalAmount: '1,580,000.00 LBP',
    amountNum: 1580000,
    status: 'PENDING_PICKUP_POS',
    zoneName: 'Choueifat Showroom Counter',
    branchName: '001 - Choueifat Main Facility',
    itemsSummary: '12x Cold Press Extra Virgin Glass Bottles 1L',
  },
];
