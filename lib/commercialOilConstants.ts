// lib/commercialOilConstants.ts
/**
 * Shared constants and types for Commercial Oil Operations & Packaging
 * Browser-safe (no Node.js fs/path imports).
 */

export interface StandardPackagingSize {
  skuId: string;
  sizeMl: number;
  nameAr: string;
  defaultBoxCap: number;
  containerType: 'BOTTLE' | 'GALLON' | 'TIN';
}

// 8 Mandatory Standard Packaging Sizes
export const STANDARD_PACKAGING_SIZES: StandardPackagingSize[] = [
  { skuId: 'sku-250ml', sizeMl: 250, nameAr: 'ألفية حجم 250 مل', defaultBoxCap: 24, containerType: 'BOTTLE' },
  { skuId: 'sku-500ml', sizeMl: 500, nameAr: 'ألفية حجم 500 مل', defaultBoxCap: 12, containerType: 'BOTTLE' },
  { skuId: 'sku-750ml', sizeMl: 750, nameAr: 'ألفية حجم 750 مل', defaultBoxCap: 12, containerType: 'BOTTLE' },
  { skuId: 'sku-1000ml', sizeMl: 1000, nameAr: 'ألفية حجم 1000 مل (1 ليتر)', defaultBoxCap: 12, containerType: 'BOTTLE' },
  { skuId: 'sku-1500ml', sizeMl: 1500, nameAr: 'ألفية حجم 1500 مل (1.5 ليتر)', defaultBoxCap: 6, containerType: 'BOTTLE' },
  { skuId: 'sku-2850ml', sizeMl: 2850, nameAr: 'ألفية حجم 2850 مل', defaultBoxCap: 4, containerType: 'BOTTLE' },
  { skuId: 'sku-8500ml', sizeMl: 8500, nameAr: 'غالون حجم 8500 مل (8.5 ليتر)', defaultBoxCap: 2, containerType: 'GALLON' },
  { skuId: 'sku-17500ml', sizeMl: 17500, nameAr: 'غالون حجم 17500 مل (17.5 ليتر)', defaultBoxCap: 1, containerType: 'GALLON' }
];
