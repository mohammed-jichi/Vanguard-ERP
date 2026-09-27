// ==============================================================================
// VANGUARD ERP: V-MENU DIGITAL ORDERING, REP ATTRIBUTION & COMMISSION SERVICE
// ==============================================================================

export interface VMenuProduct {
  id: string;
  itemCode: string;
  barcode: string;
  nameEn: string;
  nameAr: string;
  category: 'Olive Oil' | 'Preserves' | 'Olives' | 'Detergents';
  packagingUnit: string;
  priceUsd: number;
  priceLbp: number;
  descriptionEn: string;
  descriptionAr: string;
  imageUrl?: string;
  badge?: string;
  isPopular?: boolean;
}

export interface VMenuSalesRep {
  id: string;
  repCode: string;
  fullName: string;
  fullNameAr: string;
  phone: string;
  assignedChannel: string;
  defaultCommissionRate: number; // e.g. 0.05 = 5%
  avatarBg: string;
}

export const VMENU_EXCHANGE_RATE = 89500;

export const VMENU_SALES_REPS: Record<string, VMenuSalesRep> = {
  'REP-001': {
    id: 'rep-001-id',
    repCode: 'REP-001',
    fullName: 'Mahdi Kassem',
    fullNameAr: 'مهدي قاسم',
    phone: '03112233',
    assignedChannel: 'Field Sales',
    defaultCommissionRate: 0.0400, // 4%
    avatarBg: 'bg-emerald-600',
  },
  'REP-002': {
    id: 'rep-002-id',
    repCode: 'REP-002',
    fullName: 'Ahmad Ali Kassem',
    fullNameAr: 'أحمد علي قاسم',
    phone: '03445566',
    assignedChannel: 'WhatsApp',
    defaultCommissionRate: 0.0500, // 5%
    avatarBg: 'bg-blue-600',
  },
  'REP-004': {
    id: 'rep-004-id',
    repCode: 'REP-004',
    fullName: 'Hiba Aloulou',
    fullNameAr: 'هبة علعلو',
    phone: '03778899',
    assignedChannel: 'Instagram',
    defaultCommissionRate: 0.0500, // 5%
    avatarBg: 'bg-purple-600',
  },
  'REP-008': {
    id: 'rep-008-id',
    repCode: 'REP-008',
    fullName: 'Hussein Mahdi',
    fullNameAr: 'حسين مهدي',
    phone: '03990011',
    assignedChannel: 'TikTok',
    defaultCommissionRate: 0.0700, // 7%
    avatarBg: 'bg-amber-600',
  },
};

export const VMENU_PRODUCTS: VMenuProduct[] = [
  {
    id: 'vm-prod-01',
    itemCode: 'OIL-175-EV',
    barcode: '1001',
    nameEn: '17.5L Extra Virgin Olive Oil Tin',
    nameAr: 'تنكة زيت زيتون بكر ممتاز بلدي 17.5 لتر',
    category: 'Olive Oil',
    packagingUnit: '17.5L Tin (تنكة)',
    priceUsd: 110.0,
    priceLbp: 9845000,
    descriptionEn: 'First cold pressed authentic Lebanese extra virgin olive oil from Southern groves.',
    descriptionAr: 'عصرة أولى على البارد من خيرات بساتين الجنوب اللبناني، حموضة أقل من 0.8%.',
    badge: 'Best Seller',
    isPopular: true,
  },
  {
    id: 'vm-prod-02',
    itemCode: 'OIL-100-GL',
    barcode: '1002',
    nameEn: '1L Extra Virgin Glass Bottle (Cold Press)',
    nameAr: 'ألفية زيت زيتون خضير بلدي 1000 مل زجاج',
    category: 'Olive Oil',
    packagingUnit: '1000ml Glass Bottle',
    priceUsd: 12.0,
    priceLbp: 1074000,
    descriptionEn: 'Premium unfiltered harvest in dark UV-protective glass bottle.',
    descriptionAr: 'زجاجة معتمة واقية من الضوء للحفاظ على النكهة الطازجة واللون الزمردي المميز.',
    badge: 'Gold Medal',
    isPopular: true,
  },
  {
    id: 'vm-prod-03',
    itemCode: 'MOL-500-RO',
    barcode: '1003',
    nameEn: 'Pure Pomegranate Molasses 500ml',
    nameAr: 'دبس رمان بلدي نقي 500 مل',
    category: 'Preserves',
    packagingUnit: '500ml Bottle',
    priceUsd: 6.0,
    priceLbp: 537000,
    descriptionEn: '100% natural, thick sour pomegranate reduction with zero added sugars or colorants.',
    descriptionAr: 'طبيعي 100% بدون أي سكر مضاف أو ملونات، طعم حامض أصيل للأطباق والسلطات.',
    badge: '100% Natural',
  },
  {
    id: 'vm-prod-04',
    itemCode: 'OLI-650-GR',
    barcode: '1004',
    nameEn: 'Pickled Green Stuffed Olives Box (650g * 12)',
    nameAr: 'صندوق زيتون أخضر بلدي محشي جزر وليمون 650غ * 12',
    category: 'Olives',
    packagingUnit: '650g Box * 12 (كرتونة)',
    priceUsd: 18.0,
    priceLbp: 1611000,
    descriptionEn: 'Crisp green Baladi olives stuffed with fresh carrot and lemon in brine.',
    descriptionAr: 'زيتون أخضر مقرمش محشو بالجزر والليمون الطبيعي في محلول ملحي متوازن.',
    isPopular: true,
  },
  {
    id: 'vm-prod-05',
    itemCode: 'OLI-500-KL',
    barcode: '1008',
    nameEn: 'Kalamata Cured Black Olives 500g',
    nameAr: 'زيتون كلاماتا أسود فاخر 500غ',
    category: 'Olives',
    packagingUnit: '500g Jar',
    priceUsd: 4.5,
    priceLbp: 402750,
    descriptionEn: 'Rich, sun-ripened black olives cured in extra virgin olive oil and oregano.',
    descriptionAr: 'زيتون أسود ناضج معتق بزيت الزيتون البكر والزعتر البري.',
  },
  {
    id: 'vm-prod-06',
    itemCode: 'OIL-500-CP',
    barcode: '1007',
    nameEn: 'Cold Pressed Virgin Olive Oil 500ml',
    nameAr: 'زيت زيتون بكر معصور على البارد 500 مل',
    category: 'Olive Oil',
    packagingUnit: '500ml Glass Bottle',
    priceUsd: 7.5,
    priceLbp: 671250,
    descriptionEn: 'Everyday healthy cooking oil with balanced acidity and aroma.',
    descriptionAr: 'مثالي للطهي الصحي اليومي والسلطات بنكهة متوازنة ومحببة.',
  },
  {
    id: 'vm-prod-07',
    itemCode: 'DET-100-SP',
    barcode: '1005',
    nameEn: 'Traditional Olive Oil Liquid Soap 1L',
    nameAr: 'صابون سائل بزيت الزيتون والغار الطبيعي 1 لتر',
    category: 'Detergents',
    packagingUnit: '1000ml Dispenser',
    priceUsd: 3.5,
    priceLbp: 313250,
    descriptionEn: 'Moisturizing Castile liquid soap crafted from pure olive pomace and laurel oil.',
    descriptionAr: 'صابون نابلسي سائل مرطب ومغذي للبشرة مستخلص من زيت الزيتون الصافي.',
  },
  {
    id: 'vm-prod-08',
    itemCode: 'DET-400-JV',
    barcode: '1006',
    nameEn: 'Eau de Javel 4L Heavy Duty Cleaner',
    nameAr: 'ماء جافيل معقم ومطهر 4 لتر',
    category: 'Detergents',
    packagingUnit: '4L Canister',
    priceUsd: 4.0,
    priceLbp: 358000,
    descriptionEn: 'High-strength sanitizing chlorine solution for hygiene and surface disinfection.',
    descriptionAr: 'محلول كلور معقم عالي التركيز للمنشآت والمطابخ والتعقيم المنزلي.',
  },
];

export interface VMenuCartItem {
  product: VMenuProduct;
  quantity: number;
}

export interface VMenuOrderPayload {
  orderType: 'TABLE_DINE_IN' | 'DELIVERY';
  tableNumber?: string;
  branchId?: string;
  repId?: string;
  campaign?: string;
  customerName: string;
  customerPhone: string;
  destinationTown?: string;
  deliveryAddress?: string;
  corridorId?: number;
  paymentMethod: 'COD' | 'CASH_AT_COUNTER' | 'WHISH';
  items: {
    id: string;
    itemCode: string;
    name: string;
    quantity: number;
    priceUsd: number;
    priceLbp: number;
  }[];
  notes?: string;
}

export interface VMenuOrderResponse {
  success: boolean;
  orderNumber: string;
  orderType: 'TABLE_DINE_IN' | 'DELIVERY';
  subtotalUsd: number;
  deliveryFeeUsd: number;
  totalUsd: number;
  totalLbp: number;
  repAttribution?: {
    repCode: string;
    repName: string;
    commissionRate: number;
    commissionAmountUsd: number;
    commissionAmountLbp: number;
  };
  fleetDispatch?: {
    corridorId: number;
    assignedDriver: string;
    vehiclePlate: string;
    slaMinutes: number;
  };
  message: string;
}

/**
 * Calculates sales rep commission based on rep tier and order total USD.
 */
export function calculateRepCommission(repCode: string, totalUsd: number): {
  repCode: string;
  repName: string;
  commissionRate: number;
  commissionAmountUsd: number;
  commissionAmountLbp: number;
} {
  const rep = VMENU_SALES_REPS[repCode.toUpperCase()] || {
    repCode,
    fullName: `Sales Rep (${repCode})`,
    defaultCommissionRate: 0.0500, // Standard 5%
  };

  const rate = rep.defaultCommissionRate;
  const commissionUsd = Number((totalUsd * rate).toFixed(2));
  const commissionLbp = Math.round(commissionUsd * VMENU_EXCHANGE_RATE);

  return {
    repCode: rep.repCode,
    repName: rep.fullName,
    commissionRate: rate,
    commissionAmountUsd: commissionUsd,
    commissionAmountLbp: commissionLbp,
  };
}

/**
 * Persists rep ID to localStorage safely on client side.
 */
export function persistRepId(repId: string | null | undefined): void {
  if (typeof window === 'undefined' || !repId) return;
  try {
    localStorage.setItem('vanguard_vmenu_rep_id', repId.trim().toUpperCase());
  } catch (e) {
    console.error('Failed to persist rep_id in localStorage:', e);
  }
}

/**
 * Retrieves persisted rep ID from localStorage on client side.
 */
export function getPersistedRepId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('vanguard_vmenu_rep_id');
  } catch {
    return null;
  }
}
