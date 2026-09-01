// ============================================================================
// OMNICHANNEL ORDERS & REP COMMISSION ENGINE
// SOUTHERN OLIVE OIL PRODUCTS S.A.R.L
// ============================================================================

export type PlatformType = 'Web Store' | 'WhatsApp' | 'TikTok Shop' | 'Instagram' | 'Phone';

export type FulfillmentType = 'IN_STORE_PICKUP' | 'DELIVERY';

export type OrderStatus = 'PENDING_PICKUP_POS' | 'PICKED_UP_AND_CREDITED' | 'DISPATCHED_FLEET' | 'DELIVERED_COD';

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
  repAccount: string;
  commissionRate: number; // e.g. 5% = 0.05
  commissionAmount: string;
  commissionCredited: boolean;
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
    orderNo: 'ORD-103350',
    orderDate: '01-Sep-2026 11:02 AM',
    deliveryDate: '01-Sep-2026',
    customerName: 'Colonel Mahmoud Abboud',
    platform: 'Web Store',
    platformIcon: '🌐',
    fulfillmentType: 'IN_STORE_PICKUP',
    totalAmount: '248,400,000.00 LBP ($2,760.00)',
    amountNum: 248400000,
    status: 'PENDING_PICKUP_POS',
    repAccount: 'Hiba Aloulou (Rep #04)',
    commissionRate: 0.05,
    commissionAmount: '12,420,000.00 LBP ($138.00)',
    commissionCredited: false,
    zoneName: 'Choueifat Showroom Counter',
    branchName: '001 - Choueifat Main Facility',
    itemsSummary: '30x 17.5L Extra Virgin Bulk Harvest Tins',
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
    repAccount: 'Hussein Mahdi (Rep #08)',
    commissionRate: 0.07,
    commissionAmount: '110,600.00 LBP',
    commissionCredited: false,
    zoneName: 'Choueifat Showroom Counter',
    branchName: '001 - Choueifat Main Facility',
    itemsSummary: '12x Cold Press Extra Virgin Glass Bottles 1L',
  },
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
    repAccount: 'Ahmad Ali Kassem (Rep #02)',
    commissionRate: 0.05,
    commissionAmount: '450,000.00 LBP',
    commissionCredited: true,
    zoneName: 'Beirut - Hamra',
    branchName: '002 - Beirut Distribution Hub',
    itemsSummary: '1x 17.5L Extra Virgin Olive Oil Tin (Harvest 2026)',
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
    status: 'DISPATCHED_FLEET',
    repAccount: 'Hiba Aloulou (Rep #04)',
    commissionRate: 0.05,
    commissionAmount: '23,000.00 LBP',
    commissionCredited: false,
    zoneName: 'Beirut - Achrafieh',
    branchName: '002 - Beirut Distribution Hub',
    itemsSummary: '6x Pomegranate Molasses (500ml), 4x Pickled Olives Glass 1Kg',
  },
];
