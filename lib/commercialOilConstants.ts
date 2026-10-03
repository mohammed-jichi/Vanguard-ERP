// lib/commercialOilConstants.ts
/**
 * Shared constants and types for Commercial Oil Operations & Packaging
 * Browser-safe (no Node.js fs/path imports).
 */

export interface StandardPackagingSize {
  skuId: string;
  sizeMl: number;
  nameAr: string;
  nameEn: string;
  nameFr: string;
  nameEs: string;
  nameFa: string;
  defaultBoxCap: number;
  containerType: 'BOTTLE' | 'GALLON' | 'TIN';
}

export interface OilGradeRecord {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  nameFr?: string;
  nameEs?: string;
  nameFa?: string;
  maxAcidity: number;
  description?: string;
}

// 8 Mandatory Standard Packaging Sizes
export const STANDARD_PACKAGING_SIZES: StandardPackagingSize[] = [
  { skuId: 'sku-250ml', sizeMl: 250, nameAr: 'ألفية حجم 250 مل', nameEn: 'Bottle 250 ml', nameFr: 'Bouteille 250 ml', nameEs: 'Botella 250 ml', nameFa: 'بطری ۲۵۰ میلی‌لیتر', defaultBoxCap: 24, containerType: 'BOTTLE' },
  { skuId: 'sku-500ml', sizeMl: 500, nameAr: 'ألفية حجم 500 مل', nameEn: 'Bottle 500 ml', nameFr: 'Bouteille 500 ml', nameEs: 'Botella 500 ml', nameFa: 'بطری ۵۰۰ میلی‌لیتر', defaultBoxCap: 12, containerType: 'BOTTLE' },
  { skuId: 'sku-750ml', sizeMl: 750, nameAr: 'ألفية حجم 750 مل', nameEn: 'Bottle 750 ml', nameFr: 'Bouteille 750 ml', nameEs: 'Botella 750 ml', nameFa: 'بطری ۷۵۰ میلی‌لیتر', defaultBoxCap: 12, containerType: 'BOTTLE' },
  { skuId: 'sku-1000ml', sizeMl: 1000, nameAr: 'ألفية حجم 1000 مل (1 ليتر)', nameEn: 'Bottle 1000 ml (1 Liter)', nameFr: 'Bouteille 1000 ml (1 Litre)', nameEs: 'Botella 1000 ml (1 Litro)', nameFa: 'بطری ۱۰۰۰ میلی‌لیتر (۱ لیتر)', defaultBoxCap: 12, containerType: 'BOTTLE' },
  { skuId: 'sku-1500ml', sizeMl: 1500, nameAr: 'ألفية حجم 1500 مل (1.5 ليتر)', nameEn: 'Bottle 1500 ml (1.5 Liters)', nameFr: 'Bouteille 1500 ml (1.5 Litres)', nameEs: 'Botella 1500 ml (1.5 Litros)', nameFa: 'بطری ۱۵۰۰ میلی‌لیتر (۱.۵ لیتر)', defaultBoxCap: 6, containerType: 'BOTTLE' },
  { skuId: 'sku-2850ml', sizeMl: 2850, nameAr: 'ألفية حجم 2850 مل', nameEn: 'Bottle 2850 ml', nameFr: 'Bouteille 2850 ml', nameEs: 'Botella 2850 ml', nameFa: 'بطری ۲۸۵۰ میلی‌لیتر', defaultBoxCap: 4, containerType: 'BOTTLE' },
  { skuId: 'sku-8500ml', sizeMl: 8500, nameAr: 'غالون حجم 8500 مل (8.5 ليتر)', nameEn: 'Gallon 8500 ml (8.5 Liters)', nameFr: 'Bidon 8500 ml (8.5 Litres)', nameEs: 'Bidón 8500 ml (8.5 Litros)', nameFa: 'گالن ۸۵۰۰ میلی‌لیتر (۸.۵ لیتر)', defaultBoxCap: 2, containerType: 'GALLON' },
  { skuId: 'sku-17500ml', sizeMl: 17500, nameAr: 'غالون حجم 17500 مل (17.5 ليتر)', nameEn: 'Tin / Gallon 17500 ml (17.5 Liters)', nameFr: 'Bidon / Fût 17500 ml (17.5 Litres)', nameEs: 'Lata / Bidón 17500 ml (17.5 Litros)', nameFa: 'حلب ۱۷۵۰۰ میلی‌لیتر (۱۷.۵ لیتر)', defaultBoxCap: 1, containerType: 'GALLON' }
];

